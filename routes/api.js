const express = require('express');
const authenticate = require('./auth');
const { getClientIp } = require('./function')
const router = express.Router();
const connection = require('../database/db')

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


router.get('/v1/api/status', (req, res) => {
    res.json({ status: 'API is up and running' });
});

router.post('/v1/login/auth', (req, res) => {
    const { username, password } = req.body;
    const clientIp = getClientIp(req);
    const sqlQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    console.log(clientIp)
    
    queryDatabase(sqlQuery, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database query error',
                clientIp: clientIp,
            });
        }

        if (result.length > 0) {
            const response = {
                success: true,
                message: 'Login successful!',
                clientIp: clientIp, // Optionally, include the IP in the response
            };
            res.status(200).json(response);
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