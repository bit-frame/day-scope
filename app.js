const express = require('express');
require('dotenv').config();
const path = require('path');
const yaml = require('yaml');
const fs = require('fs');
const api = require('./routes/api');
const cors = require('cors');

const configFile = fs.readFileSync('config.yaml', 'utf8');
const config = yaml.parse(configFile);

const API_TOKEN = process.env.API_KEY;

const { website, administrator, api: apiConfig, version, build } = config;
const httpUrl = `http://${website.url}:${website.port}`;

const corsOptions = {
    origin: [httpUrl],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'api_token']
};

const app = express();
const port = website.port;

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'public')));
app.use(api);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/api', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'apicall.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`[INFO] DayScope Server ${version} Build ${build}\n> Access at ${website.url}:${port}`);
});
