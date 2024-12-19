const express = require('express');
const authenticate = require('./auth');
const { getClientIp } = require('./function')
const router = express.Router();
const connection = require('../database/db')
const functions = require('./function')

router.use(['/v1/api/status', '/v1/api/data', '/auth/v1'], authenticate);

function queryDatabase(sqlQuery, callback) {
    connection.query(sqlQuery, (err, result) => {
        if (err) {
            console.error('[ERROR] Login Query failed:', err.message);
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

const createSession = (userId, sessionId, expiryDays = 7) => {
    // Default to 7 days if no expiryDays is provided
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);  // Add expiryDays to the current date

    const createSessionQuery = `
    INSERT INTO sessions (session_id, user_id, expires_at)
    VALUES (?, ?, ?)
    `;

    connection.query(createSessionQuery, [sessionId, userId, expiresAt], (err) => {
        if (err) {
            console.error('[ERROR] Failed to create session:', err.message);
        } else {
            console.log('[INFO] Session created successfully for user:', userId);
        }
    });
};


router.get('/v1/api/status', (req, res) => {
    res.json({ status: 'API is up and running' });
});

router.post('/v1/login/auth', (req, res) => {
    const { username, password } = req.body;
    const clientIp = getClientIp(req);

    // Define the SQL query to check user credentials
    const sqlQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    // Define sqlQuery2 to get the user ID after successful login
    const sqlQuery2 = `SELECT id FROM users WHERE username = '${username}' AND password = '${password}'`;

    console.log(clientIp);

    // Query the database with sqlQuery
    queryDatabase(sqlQuery, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database query error',
                clientIp: clientIp,
            });
        }

        if (result.length > 0) {
            // After verifying the user, use sqlQuery2 to fetch the user ID
            queryDatabase(sqlQuery2, (err2, result2) => {
                if (err2) {
                    return res.status(500).json({
                        success: false,
                        message: 'Database query error for user ID',
                        clientIp: clientIp,
                    });
                }

                if (result2.length > 0) {
                    const userId = result2[0].id; // Get the user ID from sqlQuery2
                    const newSessionToken = functions.generateSessionId();
                    const expiry = 7;
                    createSession(userId, newSessionToken, expiry)
                    const response = {
                        success: true,
                        message: 'Login successful',
                        newToken: newSessionToken,
                        userId: userId, // Include user ID in the response
                        clientIp: clientIp, // Optionally, include the IP in the response
                    };

                    console.log(response.success, response.message, response.newToken, response.userId, response.clientIp)

                    res.status(200).json(response);
                } else {
                    const response = {
                        success: false,
                        message: 'User ID not found',
                        clientIp: clientIp, // Optionally, include the IP in the response
                    };
                    res.status(401).json(response); // 401 Unauthorized status
                }
            });
        } else {
            // Login failure, user not found
            const response = {
                success: false,
                message: 'Invalid username or password',
                clientIp: clientIp, // Optionally, include the IP in the response
            };
            res.status(401).json(response); // 401 Unauthorized status
        }
    });
});


module.exports = router;