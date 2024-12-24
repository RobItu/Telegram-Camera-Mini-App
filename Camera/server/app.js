// Script to connect and insert data to AWS RDS
const { Client } = require('pg');
require('@chainlink/env-enc').config();

console.log(process.env.HOST, process.env.PORT, process.env.USER, process.env.PASSWORD, process.env.DATABASE);

const client = new Client({
  host: process.env.HOST,
  port: process.env.PORT,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  ssl: {
    rejectUnauthorized: false, // Disables certificate verification (use cautiously in production)
  },
});

/*
 * * This function connects to 'kindly' AWS database.
 * Creates a table (use when needed)
 * Inserts into 'metadata' table: userId, location, timestamp, image64URL(Base64-encoded image string)
 */

(async () => {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to AWS RDS PostgreSQL!');

    // const createTableQuery = `
    //   CREATE TABLE metadata (
    //     id SERIAL PRIMARY KEY,
    //     userId VARCHAR(100) NOT NULL,
    //     location TEXT NOT NULL,
    //     timestamp TIMESTAMP NOT NULL,
    //     image64url TEXT NOT NULL
    //   );
    // `;
    // await client.query(createTableQuery);
    // console.log('Table created successfully!');

    // Insert metadata
    // await client.query('INSERT INTO metadata (userID, location, timestamp, image64URL) VALUES ($1, $2, $3, $4)', [
    //   userId,
    //   location,
    //   timestamp,
    //   image64URL,
    // ]);

    // Example query
    const result = await client.query('SELECT NOW()');
    console.log('Current Time:', result.rows[0]);

    console.log('Data inserted successfully!');
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } finally {
    // Disconnect from the database
    await client.end();
    console.log('Disconnected from AWS RDS PostgreSQL.');
  }
})();
