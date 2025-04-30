const client = require('../dbClient/clientInit.js');

// Function to save a new user
const saveUser = async (phone, email, username, password) => {
    try {
        const res = await client.query(
                'INSERT INTO users (phone, email, username, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [phone, email, username, password]
        );
        return res.rows[0];
    } catch (e) {
        console.error('Error saving user:', e);
    }
};

// Function to get a user by phone number
const getUserByPhone = async (phone) => {
    try {
        const res = await client.query('SELECT * FROM users WHERE phone = $1', [phone]);
        return res.rows[0];
    } catch (e) {
        console.error('Error getting user by phone:', e);
    }
};
// function to check if a phone number exists in the database
const isPhoneInDatabase = async (phone) => {
    try {
        const res = await client.query('SELECT 1 FROM users WHERE phone = $1', [phone]);
        return res.rowCount > 0; // Returns true if at least one row is found, false otherwise
    } catch (e) {
        console.error('Error checking if phone exists in database:', e);
        return false; // Returning false in case of an error
    }
};
// Function to update the verification code
const updateUserVerificationCode = async (phone, verificationCode) => {
    try {
        const res = await client.query(
            'UPDATE users SET verification_number = $1 WHERE phone = $2 RETURNING *',
            [verificationCode, phone]
        );
        return res.rows[0];
    } catch (e) {
        console.error('Error updating verification code:', e);
    }
};


module.exports = {
    saveUser,
    isPhoneInDatabase,
    getUserByPhone,
    updateUserVerificationCode,
};
