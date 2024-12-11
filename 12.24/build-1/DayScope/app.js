const express = require('express');
const path = require('path')
const api = require('./routes/api')

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(api)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});