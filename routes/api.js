const express = require('express');
const authenticate = require('./auth');
const { getClientIp, generateSessionId } = require('./function');
const router = express.Router();
const connection = require('../database/db');
const { blacklistedIps } = require('../system/networkConfig');
const createRateLimiter = require('./ratelimits/main');
const { initializeLogger } = require('../log');

const logger = initializeLogger();
const loginRateLimiter = createRateLimiter(60000, 10);

// Middleware for authentication and blacklisted IP handling
router.use(['/v1/api/data', '/auth/v1'], authenticate);

function queryDatabase(sqlQuery, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, params, (err, result) => {
            if (err) {
                logger.error('Database query failed:', err.message);
                return reject(err);
            }
            resolve(result);
        });
    });
}

function blockBlacklistedIp(req, res, next) {
    const clientIp = req.ip;
    const blacklistedIp = blacklistedIps.find(entry => entry.ip === clientIp);

    if (blacklistedIp) {
        logger.warn(`Blacklisted IP (${clientIp}) attempted to access API endpoint. Blocked request.`);
        return res.status(403).json({
            message: `Your IP has been blacklisted. Reason: ${blacklistedIp.reason}`,
        });
    }

    next();
}

function createSession(userId, sessionId, expiryDays = 7) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const createSessionQuery = `
        INSERT INTO sessions (session_id, user_id, expires_at)
        VALUES (?, ?, ?)
    `;

    connection.query(createSessionQuery, [sessionId, userId, expiresAt], (err) => {
        if (err) {
            logger.error('Failed to create session:', err.message);
        } else {
            logger.info(`New session created for userId: ${userId}`);
        }
    });
}

// API Routes
router.get('/v1/api/status', blockBlacklistedIp, (req, res) => {
    res.json({ status: 'API is up and running' });
});

router.post('/v1/login/auth', blockBlacklistedIp, loginRateLimiter, async (req, res) => {
    const { username, password } = req.body;
    const clientIp = getClientIp(req);

    const sqlQuery = 'SELECT * FROM users WHERE username = ? AND password = ?';
    const sqlQuery2 = 'SELECT id FROM users WHERE username = ? AND password = ?';

    logger.info(`New login request from ${clientIp} for user account: ${username}`);

    try {
        const result = await queryDatabase(sqlQuery, [username, password]);

        if (result.length > 0) {
            const result2 = await queryDatabase(sqlQuery2, [username, password]);

            if (result2.length > 0) {
                const userId = result2[0].id;
                const newSessionToken = generateSessionId();
                createSession(userId, newSessionToken);

                return res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    newToken: newSessionToken,
                    userId,
                    clientIp,
                });
            }

            return res.status(401).json({
                success: false,
                message: 'User ID not found',
                clientIp,
            });
        }

        res.status(401).json({
            success: false,
            message: 'Invalid username or password',
            clientIp,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Database query error',
            clientIp,
        });
    }
});

module.exports = router;
