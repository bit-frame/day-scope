const crypto = require('crypto')

function getClientIp(req) {
    return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
}

const generateSessionId = () => {
    return crypto.randomBytes(64).toString('hex');
}

module.exports = { getClientIp, generateSessionId };