const express = require('express');
const router = express.Router();

router.all('/api/status', (req, res, next) => {
    if (req.method !== 'GET') {
        return res.status(403).json({ message: 'Method Not Allowed: Only GET requests are allowed' });
    }
    next();
});

router.get('/api/status', (req, res) => {
    res.json({ status: 'API is up and running' });
});

module.exports = router;