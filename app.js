const dotenv = require('dotenv').config();
const express = require('express');
const path = require('path');
const yaml = require('yaml');
const fs = require('fs');
const api = require('./routes/api');
const functions = require('./routes/function')
const cors = require('cors');
const sendWebhook = require('./webhook');
const database = require('./database/db');
const { create } = require('domain');
const connection = require('./database/db')
const { fullyBlacklistedIps } = require('./system/networkConfig')

const { initializeLogger } = require('./log')
const logger = initializeLogger();

function queryDatabase(sqlQuery) {
    connection.query(sqlQuery, (err, result) => {
        if (err) {
            logger.error('Query failed:', err.message);
            throw err;
        }
        logger.info('Query completed:', result);
    });
}

function blockBlacklistedIp(req, res, next) {
    const clientIp = req.ip;

    const blacklistedIp = fullyBlacklistedIps.find(entry => entry.ip === clientIp);

    if (blacklistedIp) {
        logger.warn(`Blacklisted IP (${clientIp}) attempted to access DayScope. Blocked request.`)
        return res.status(403).send(`
            <html>
        <head>
          <title>DayScope: Access Denied</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f8d7da;
              color: #721c24;
              text-align: center;
              padding: 50px;
            }
            h1 {
              font-size: 36px;
            }
            p {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .message {
              background-color: #f5c6cb;
              border: 1px solid #f1b0b7;
              border-radius: 5px;
              padding: 20px;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="message">
            <h1>Your IP is Blacklisted</h1>
            <p>Your IP (${clientIp}) has been blacklisted from DayScope for the following reason:</p>
            <p><strong>${blacklistedIp.reason}</strong></p>
            <p>Please consult your I.T. admin for further assistance.</p>
          </div>
        </body>
      </html>
        `);
    }
    next();
}

const createSession = (userId, sessionId, expiryDays = 7) => {
    // Default to 7 days if no expiryDays is provided
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);  // Add expiryDays to the current date

    const createSessionQuery = `
    INSERT INTO sessions (session_id, user_id, expires_at)
    VALUES (?, ?, ?)
    `;

    database.query(createSessionQuery, [sessionId, userId, expiresAt], (err) => {
        if (err) {
            logger.error(`Failed to create session: ${err.message}`);
        } else {
            logger.info('Session created successfully for user:', userId);
        }
    });
};

const validateSession = (sessionId, callback) => {
    const validateSessionQuery = `
    SELECT * FROM sessions WHERE session_id = ? AND expires_at > NOW()
    `;

    database.query(validateSessionQuery, [sessionId], (err, results) => {
        if (err) {
            logger.error(`Failed to validate session: ${err.message}`);
            callback(false); // Invalid session in case of an error
        } else if (results.length > 0) {
            callback(true); // Session is valid and active
        } else {
            callback(false); // Invalid or expired session
        }
    });
};

const configFile = fs.readFileSync('config.yaml', 'utf8');
const config = yaml.parse(configFile);

const { administrator } = config;
const { user: username, password, email } = administrator;

const { website, api: apiConfig, dayscope } = config;
const sendStartup = config.webhooks.logs.sendStartup;
const httpUrl = `http://${website.url}:${website.port}`;
const app = express();
const port = website.port;
const urls = require('./routes/urls');
const { url } = require('inspector');

const corsOptions = {
    origin: [httpUrl, `http://localhost:${website.port}`],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'api_token']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(api);
app.use(blockBlacklistedIp);
urls(app)

app.listen(port, '0.0.0.0', () => {
    logger.info(`DayScope Server ${dayscope.version} Build ${dayscope.build}`);
    logger.info(`Current API version: ${dayscope.api_version}`)
    logger.info(`Access DayScope at ${website.url}:${website.port}`)
    const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        role VARCHAR(50) DEFAULT 'Student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    `;

    const createSystemTable = `
    CREATE TABLE IF NOT EXISTS system_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        api_version VARCHAR(10) NOT NULL,
        release_date DATE NOT NULL,
        last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        onboarding_status TEXT NOT NULL
    );
    `;

    database.query(createSystemTable, (err) => {
        if (err) {
            logger.error('Failed to create system_info table: ', err.message)
        } else {
            logger.info('System Info table loaded')
        }
    })

    const createSessionsTable = `
    CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    `;

    let username = config.administrator.user;
    let password = config.administrator.password;
    let email = config.administrator.email;
    let role = 'Admin';
    let name = config.administrator.user;

    database.query(createUsersTable, (err) => {
        if (err) {
            logger.error('Failed to create users table:', err.message);
        } else {
            logger.info('User Table Loaded');
            
            const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
            database.query(checkUserQuery, [username], (err, results) => {
                if (err) {
                    logger.error('Failed to check user existence:', err.message);
                } else {
                    if (results.length === 0) {
                        const insertUserQuery = `
                            INSERT INTO users (username, password, email, role, name)
                            VALUES (?, ?, ?, ?, ?)
                        `;
                        database.query(insertUserQuery, [username, password, email, role, name], (err) => {
                            if (err) {
                                logger.error('Failed to insert user:', err.message);
                            } else {
                                logger.info('User account linked');
                            }
                        });
                    } else {
                        const updateUserQuery = `
                            UPDATE users
                            SET password = ?, email = ?, role = ?, name = ?
                            WHERE username = ?
                        `;
                        database.query(updateUserQuery, [password, email, role, name, username], (err) => {
                            if (err) {
                                logger.error('Failed to update root credentials:', err.message);
                            } else {
                                logger.info('Root user loaded');
                            }
                        });
                    }
                }
            });
        }
    });

    database.query(createSessionsTable, (err) => {
        if (err) {
            logger.error(`Failed to create sessions table: ${err.message}`);
        } else {
            logger.info('Sessions table loaded');
        }
    });

    setInterval(() => {
        const cleanupQuery = `DELETE FROM sessions WHERE expires_at < NOW()`;
        database.query(cleanupQuery, (err, result) => {
            if (err) {
                logger.error(`Failed to clean up expired sessions: ${err.message}`);
            } else {
                if (result.affectedRows == 0) {} else {
                    logger.info(`Cleaned up ${result.affectedRows} expired session(s).`);
                }
            }
        });
    }, 10 * 1000);

    //const selectAllFromSystemInfo = 'SELECT * FROM users;';
    //queryDatabase(selectAllFromSystemInfo);

    if (sendStartup === true) {
        const notificationData = {
            author: 'DayScope Info',
            message: `DayScope has just booted up.\nAccess DayScope at **${website.url}:${port}**`,
            color: '00FF00'
        };
        
        sendWebhook(notificationData)
            .then(() => {
                logger.info('Startup notification sent');
            })
            .catch((err) => {
                logger.error('Failed to send Startup notification: ', err);
            });
    } else {
        logger.warn('Failed to send Startup notification: Disabled');
    }
    const userId = 1;
    const sessionId = functions.generateSessionId()
    const expiry = 1;
    //createSession(userId, sessionId, expiry) 
});