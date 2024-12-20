const winston = require('winston');

// Function to return the formatted timestamp
const getFormattedTimestamp = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');  // Ensure two digits for day
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Zero-indexed month, so add 1
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
};

const initializeLogger = () => {
    const logFormat = winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
    });

    const logger = winston.createLogger({
        level: 'info', // Default logging level
        format: winston.format.combine(
            winston.format.timestamp({ format: getFormattedTimestamp }), // Apply custom timestamp format
            logFormat
        ),
        transports: [
            new winston.transports.Console({ 
                format: winston.format.combine(
                    winston.format.colorize(),
                    logFormat
                )
            }),
            new winston.transports.File({ filename: 'server.log' })
        ],
    });
    return logger;
};

module.exports = { initializeLogger };