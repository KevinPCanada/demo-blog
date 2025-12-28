import mysql from "mysql2";
import { connect } from "@tidbcloud/serverless";
import dotenv from "dotenv"; // Import dotenv

dotenv.config(); // Load variables immediately

const config = {
  url: `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?ssl={"minVersion":"TLSv1.2"}&connectTimeout=60000`,
};

// Create a connection instance that behaves like a pool
export const db = connect(config);

console.log("TiDB Serverless Driver Initialized");