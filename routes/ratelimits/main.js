const rateLimits = new Map(); // In-memory storage for demo purposes. Replace with Redis in production.

const createRateLimiter = (windowMs, maxRequests) => {
    return (req, res, next) => {
        const ip = req.ip; // Get the client's IP address
        const now = Date.now(); // Current timestamp

        if (!rateLimits.has(ip)) {
            rateLimits.set(ip, []);
        }

        // Filter timestamps to keep only those within the window
        const timestamps = rateLimits.get(ip).filter((timestamp) => now - timestamp < windowMs);

        // Check if the number of requests exceeds the limit
        if (timestamps.length >= maxRequests) {
            return res.status(429).json({
                message: `Too many requests. You are allowed ${maxRequests} requests every ${windowMs / 1000} seconds.`,
            });
        }

        // Add the current timestamp and update the map
        timestamps.push(now);
        rateLimits.set(ip, timestamps);

        next(); // Proceed to the next middleware or route handler
    };
};

module.exports = createRateLimiter;