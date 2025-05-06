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
            password VARCHAR(100)
        );
    `;
    
    try {
        // Wait for DB connection (max 30 seconds)
        let attempts = 0;
        const maxAttempts = 6;
        
        while (attempts < maxAttempts) {
            try {
                await dbClient.query('SELECT 1');
                console.log('Database connection verified');
                break;
            } catch (err) {
                attempts++;
                console.log(`Database connection attempt ${attempts}/${maxAttempts} failed. Retrying in 5 seconds...`);
                if (attempts === maxAttempts) {
                    throw new Error('Could not connect to database after multiple attempts');
                }
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        // Now create the table
        await dbClient.query(createTableQuery);
        console.log('Table "users" is ready.');
    } catch (error) {
        console.error('Error creating table:', error);
        // Continue even if database setup fails
        console.log('Continuing without database connection');
    }
};

// Setup async execution
async function main() {
    try {
        await checkAndCreateTable();
    } catch (error) {
        console.error('Database setup error:', error);
    }
    
        console.log('Database setup completed');
    
    // Initialize WhatsApp client
    try {
        require('./whatsappClient/clientInit');
    } catch (error) {
        console.error('WhatsApp client initialization error:', error);
    }
}

// Start the application
main().catch(error => {
    console.error('Application startup error:', error);
    });
    