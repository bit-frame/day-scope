function getClientIp(req) {
    return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
}

module.exports = { getClientIp };