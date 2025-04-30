const { Client } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'db',
  password: 'postgres',
  port: 5432,
});

client.connect();

module.exports = client;
