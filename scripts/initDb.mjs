
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SCHEMA_PATH = path.join(process.cwd(), "scripts", "schema.sql");

const run = async () => {
  if (!process.env.DB_PASSWORD) {
    console.error(
      "DB_PASSWORD is not set. Configure DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD in .env.local (see .env.local.example)."
    );
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(SCHEMA_PATH, "utf-8");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    await connection.query(schemaSql);
    console.log("Schema is up to date (colloquium_events).");
  } finally {
    await connection.end();
  }
};

run().catch((err) => {
  console.error("db:init failed:", err.message);
  process.exit(1);
});