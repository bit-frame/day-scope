const express = require('express');
require('dotenv').config();
const path = require('path')
const api = require('./routes/api')
const API_TOKEN = process.env.API_KEY;

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(api)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/api', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'apicall.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});