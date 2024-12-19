const express = require('express');
const authenticate = require('./auth');
const { getClientIp } = require('./function')
const router = express.Router();
const connection = require('../database/db')
const functions = require('./function')
const { blacklistedIps } = require('../system/networkConfig')
const createRateLimiter = require('./ratelimits/main')

const loginRateLimiter = createRateLimiter(60000, 5);

router.use(['/v1/api/data', '/auth/v1'], authenticate);

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

function blockBlacklistedIp(req, res, next) {
    const clientIp = req.ip;  // Assuming Express gives you the IP in req.ip
    const blacklistedIp = blacklistedIps.find(entry => entry.ip === clientIp);

    if (blacklistedIp) {
        // If the IP is blacklisted, return a 403 Forbidden error with the reason
        console.log(`[WARN] Blacklisted IP (${clientIp}) attempted to access API endpoint. Blocked request.`)
        return res.status(403).json({
            message: `Your IP has been blacklisted. Reason: ${blacklistedIp.reason}`,
        });

    }

    // If the IP is not blacklisted, continue to the next middleware or route handler
    next();
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
            console.log('[INFO] New session created for userId:', userId);
        }
    });
};


router.get('/v1/api/status', blockBlacklistedIp, (req, res) => {
    res.json({ status: 'API is up and running' });
});

router.post('/v1/login/auth', blockBlacklistedIp, loginRateLimiter, (req, res) => {
    const { username, password } = req.body;
    const clientIp = getClientIp(req);

    // Define the SQL query to check user credentials
    const sqlQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    // Define sqlQuery2 to get the user ID after successful login
    const sqlQuery2 = `SELECT id FROM users WHERE username = '${username}' AND password = '${password}'`;

    console.log(`[INFO] New login request from ${clientIp} for user account: ${username}`);

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