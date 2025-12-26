import mysql from 'mysql2';
import dotenv from 'dotenv'; // Import dotenv

dotenv.config(); // Load variables immediately

export const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
  // Pool specific settings
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});