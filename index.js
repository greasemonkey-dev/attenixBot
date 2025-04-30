
// const { loginAndKeepSession } = require('./attenixClient/login');


// loginAndKeepSession('39664396', '123456');

const { saveUser } = require('./services/userService');
const dbClient = require('./dbClient/clientInit.js');

// Ensure the users table is created
const checkAndCreateTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100),
            email VARCHAR(100) UNIQUE,
            phone VARCHAR(15) UNIQUE,
            password VARCHAR(100),
        );
    `;
    // !update the table's cullomns in the container

    
    try {
        await dbClient.query(createTableQuery);
        console.log('Table "users" is ready.');
    } catch (error) {
        console.error('Error creating table:', error);
    }
};

checkAndCreateTable()
    .then(() => {
        console.log('Database setup completed');
        require('./whatsappClient/clientInit');
    })
    .catch(error => {
        console.error('Error during database setup:', error);
        dbClient.end();
    });
    