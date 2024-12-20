const mysql = require('mysql');
const yaml = require('yaml');
const fs = require('fs');
const configFile = fs.readFileSync('config.yaml', 'utf8');
const config = yaml.parse(configFile);

const { database } = config;
const { initializeLogger } = require('../log')
const logger = initializeLogger();

const connection = mysql.createConnection({
    host: 'localhost',
    user: database.user,
    password: database.password,
    database: database.databaseName
});

connection.connect((err) => {
    if (err) {
        logger.error('Error connecting to MySQL:', err.message);
        return;
    }
    logger.info('Connected to DayScope Database');
});

module.exports = connection;