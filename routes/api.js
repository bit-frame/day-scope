const express = require('express');
const router = express.Router();

router.all(['/v1/api/status', '/v1/api/data'], (req, res, next) => {

    if (req.method !== 'POST') {
        return res.status(403).json({ message: 'Method Not Allowed' });
    }

    const apiKey = req.headers['api_token'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(403).json({ message: '403 Forbidden' });
    }

    next();
});

router.get('/v1/api/status', (req, res) => {
    res.json({ status: 'API is up and running' });
});

router.get('/v1/api/data', (req, res) => {
    res.json({ status: 'data :o' });
});

module.exports = router;