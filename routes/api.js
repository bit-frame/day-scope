const express = require('express');
const authenticate = require('./auth'); // Adjust path if needed

const router = express.Router();

router.use(['/v1/api/status', '/v1/api/data', '/auth/v1'], authenticate);

router.get('/v1/api/status', (req, res) => {
    res.json({ status: 'API is up and running' });
});

router.post('/v1/login/auth', (req, res) => {
    const { username, password } = req.body;

    console.log("username: ", username);
    console.log("password: ", password)
    
    const response = {
        message: 'This is the new feature endpoint with authentication!',
        timestamp: new Date(),
    };

    res.json(response);
});

module.exports = router;