const authenticate = (req, res, next) => {
    const apiKey = req.headers['api_token'];
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip;

    if (method !== 'GET') {
        console.log(`[INFO][API] Method Not Allowed for ${url} from IP: ${ip}`);
        return res.status(403).json({ message: 'Method Not Allowed' });
    }

    if (!apiKey || apiKey !== process.env.API_KEY) {
        console.log(`[INFO][API] Invalid API key for ${url} from IP: ${ip}`);
        return res.status(403).json({ message: '403 Forbidden' });
    }

    console.log(`[INFO][API] Allowed access for ${url} from IP: ${ip}`);

    next();
};

module.exports = authenticate;