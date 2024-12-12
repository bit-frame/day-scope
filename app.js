require('dotenv').config();

const express = require('express');
const path = require('path');
const yaml = require('yaml');
const fs = require('fs');
const api = require('./routes/api');
const cors = require('cors');
const sendWebhook = require('./webhook')

const configFile = fs.readFileSync('config.yaml', 'utf8');
const config = yaml.parse(configFile);
const API_TOKEN = process.env.API_KEY;
const { website, administrator, api: apiConfig, version, build} = config;
const sendStartup = config.webhooks.logs.sendStartup
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

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'home.html'))});
app.get('/home', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'about.html'))});
app.get('/api', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'apicall.html'))});
app.get('/login', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'login.html'))});
app.get('/dashboard', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'dashboard', 'dashboard.html'))});
app.use((req, res) => { res.status(404).sendFile(path.join(__dirname, 'public', '404.html'))});

app.listen(port, '0.0.0.0', () => {
    console.log(`[INFO] DayScope Server ${version} Build ${build}\n> Access at ${website.url}:${port}`);

    if (sendStartup == true) {
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
        console.log('[INFO] Failed to send Startup notification: Disabled')
    }
});