const rateLimits = new Map();

const createRateLimiter = (windowMs, maxRequests) => {
    return (req, res, next) => {
        const ip = req.ip;
        const now = Date.now();
        if (!rateLimits.has(ip)) {
            rateLimits.set(ip, []);
        }
        
        const timestamps = rateLimits.get(ip).filter((timestamp) => now - timestamp < windowMs);
        if (timestamps.length >= maxRequests) {
            return res.status(429).json({
                message: `Too many requests. You are allowed ${maxRequests} requests every ${windowMs / 1000} seconds.`,
            });
        }

        timestamps.push(now);
        rateLimits.set(ip, timestamps);
        next();
    };
};

module.exports = createRateLimiter;