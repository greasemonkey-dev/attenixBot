const { Client } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Get database connection details from environment variables
const user = process.env.DB_USER || 'postgres';
const host = process.env.DB_HOST || 'db';
const database = process.env.DB_NAME || 'db';
const password = process.env.DB_PASSWORD || 'postgres';
const port = process.env.DB_PORT || 5432;

console.log(`Attempting to connect to PostgreSQL at ${host}:${port}`);

const client = new Client({
  user,
  host,
  database,
  password,
  port
});

// Connect with retry logic
const connectWithRetry = async (retries = 5, interval = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Connection attempt ${i + 1} of ${retries}`);
      await client.connect();
      console.log('Successfully connected to PostgreSQL database');
      return true;
    } catch (err) {
      console.error(`Connection attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${interval / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      } else {
        console.error('All connection attempts failed');
        // Don't throw, return false to indicate failure
        return false;
      }
    }
  }
};

// Start the connection process but don't wait for it
connectWithRetry();

module.exports = client;
