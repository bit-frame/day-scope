const crypto = require('crypto')
const database = require('../database/db')

function getClientIp(req) {
    return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
}

const generateSessionId = () => {
    return crypto.randomBytes(64).toString('hex');
}

const createUser = (data, callback) => {
    const { name, username, password, email, role } = data;
    const insertUserQuery = `
        INSERT INTO users (name, username, password, email, role)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    database.query(insertUserQuery, [name, username, password, email, role], (err, result) => {
        if (err) {
            return callback(err); // Call the callback with the error
        }
        callback(null, result); // Call the callback with the result if no error
    });
};

const deleteUser = (userId, callback) => {
    const deleteUserQuery = `
        DELETE FROM users WHERE id = ?
    `;
    
    database.query(deleteUserQuery, [userId], (err, result) => {
        if (err) {
            return callback(err); // Call the callback with the error
        }
        if (result.affectedRows > 0) {
            callback(null, `User with ID ${userId} deleted successfully.`); // Call the callback with success message if user was deleted
        } else {
            callback(null, `No user found with ID ${userId}.`); // No user found
        }
    });
};


module.exports = { getClientIp, generateSessionId, createUser, deleteUser };