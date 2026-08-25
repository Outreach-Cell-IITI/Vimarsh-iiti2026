import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as {
  _mysqlPool?: mysql.Pool;
  _schemaReady?: Promise<void>;
};

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
      dateStrings: true,
  });
}

export const pool = globalForDb._mysqlPool ?? (globalForDb._mysqlPool = createPool());

(pool as unknown as { on(event: "error", cb: (err: Error) => void): void }).on(
  "error",
  (err) => {
    console.error("Unexpected MySQL error on idle connection:", err.message);
  }
);

async function initSchema() {
  // NOTE: kept in sync with scripts/schema.sql (used by `npm run db:init`).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS colloquium_events (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(20) NOT NULL DEFAULT 'event',
      speaker VARCHAR(500) NOT NULL,
      title VARCHAR(500) NOT NULL,
      series VARCHAR(255) NOT NULL DEFAULT '',
      event_date DATE NOT NULL,
      image_url VARCHAR(1000) NOT NULL DEFAULT '',
      pdf_url VARCHAR(1000) NOT NULL DEFAULT '',
      video_url VARCHAR(1000) NOT NULL DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT chk_colloquium_events_type CHECK (type IN ('event', 'colloquium')),
      INDEX idx_colloquium_events_type_date (type, event_date DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

// Call this at the top of every API route before querying. It only runs the
// CREATE TABLE statement once per server process.
export function ensureSchema(): Promise<void> {
  if (!globalForDb._schemaReady) {
    globalForDb._schemaReady = initSchema();
  }
  return globalForDb._schemaReady;
}