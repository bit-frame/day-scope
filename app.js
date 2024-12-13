const dotenv = require('dotenv').config();
const express = require('express');
const path = require('path');
const yaml = require('yaml');
const fs = require('fs');
const api = require('./routes/api');
const cors = require('cors');
const sendWebhook = require('./webhook');
const database = require('./database/db');
const { create } = require('domain');
const connection = require('./database/db')

function editDatabase(sqlQuery) {
    connection.query(sqlQuery, (err, result) => {
        if (err) {
            console.error('[ERROR] Query failed:', err.message);
            throw err;
        }
        console.log('[INFO] Query completed:', result);
    });
}

const configFile = fs.readFileSync('config.yaml', 'utf8');
const config = yaml.parse(configFile);

const { administrator } = config;
const { user: username, password, email } = administrator;

const { website, api: apiConfig, dayscope } = config;
const sendStartup = config.webhooks.logs.sendStartup;
const httpUrl = `http://${website.url}:${website.port}`;
const app = express();
const port = website.port;

const corsOptions = {
    origin: [httpUrl, `http://localhost:${website.port}`],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'api_token']
};

app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));
app.use(api);

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'home.html')); });
app.get('/home', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'about.html')); });
app.get('/exp/loading', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'experimental', 'loading.html')); });
app.get('/exp/noti', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'experimental', 'notification.html')); });
app.get('/exp/toast', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'experimental', 'toast.html')); });
app.get('/api', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'apicall.html')); });
app.get('/onboarding', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'onboarding', 'onboarding.html')); });
app.get('/login', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'login.html')); });
app.get('/dashboard', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'dashboard', 'dashboard.html')); });
app.use((req, res) => { res.status(404).sendFile(path.join(__dirname, 'public', '404.html')); });

app.listen(port, '0.0.0.0', () => {
    console.log(`[INFO] DayScope Server ${dayscope.version} Build ${dayscope.build}\n[INFO] Current api version: ${dayscope.api_version}\n> Access at ${website.url}:${port}`);

    const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
            console.error('[ERROR] Failed to create system_info table: ', err.message)
        } else {
            console.log('[INFO] System Info table loaded')
        }
    })
    
    database.query(createUsersTable, (err) => {
        if (err) {
            console.error('[ERROR] Failed to create users table:', err.message);
        } else {
            console.log('[INFO] User Table Loaded');
            
            const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
            database.query(checkUserQuery, [username], (err, results) => {
                if (err) {
                    console.error('[ERROR] Failed to check user existence:', err.message);
                } else {
                    if (results.length === 0) {
                        const insertUserQuery = `
                            INSERT INTO users (username, password, email, role)
                            VALUES (?, ?, ?, ?)
                        `;
                        database.query(insertUserQuery, [username, password, email, 'Admin'], (err) => {
                            if (err) {
                                console.error('[ERROR] Failed to insert Admin user:', err.message);
                            } else {
                                console.log('[INFO] Admin account linked');
                            }
                        });
                    }
                }
            });
        }
    });

    const selectAllFromSystemInfo = 'SELECT * FROM system_info;';
    editDatabase(selectAllFromSystemInfo);


    if (sendStartup === true) {
        const notificationData = {
            author: 'DayScope Info',
            message: `DayScope has just booted up.\nAccess DayScope at **${website.url}:${port}**`,
            color: '00FF00'
        };
        
        sendWebhook(notificationData)
            .then(() => {
                console.log('[INFO] Startup notification sent');
            })
            .catch((err) => {
                console.error('[ERROR] Failed to send Startup notification: ', err);
            });
    } else {
        console.log('[INFO] Failed to send Startup notification: Disabled');
    }
});