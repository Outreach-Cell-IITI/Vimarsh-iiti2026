import pg from "pg";

const { Pool } = pg;

// In Next.js dev mode, modules can be re-evaluated on hot reload. Stash the
// pool (and the schema-ready promise) on `globalThis` so we don't open a
// fresh connection pool to Postgres on every file edit.
const globalForDb = globalThis as unknown as {
  _pgPool?: pg.Pool;
  _schemaReady?: Promise<void>;
};

function createPool() {
  const explicitSsl = String(process.env.PGSSL).toLowerCase() === "true";
  // Neon (and most hosted Postgres) put sslmode=require/verify-full in the
  // connection string itself - detect that too so PGSSL doesn't have to be
  // set separately.
  const urlWantsSsl = /sslmode=(require|verify-full|verify-ca)/i.test(
    process.env.DATABASE_URL || ""
  );
  const useSsl = explicitSsl || urlWantsSsl;

  return process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
      })
    : new Pool({
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "postgres",
        database: process.env.PGDATABASE || "vimarsh",
        ssl: useSsl ? { rejectUnauthorized: false } : false,
      });
}

export const pool = globalForDb._pgPool ?? (globalForDb._pgPool = createPool());

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error on idle client:", err.message);
});

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS colloquium_events (
      id SERIAL PRIMARY KEY,
      type VARCHAR(20) NOT NULL DEFAULT 'event' CHECK (type IN ('event', 'colloquium')),
      speaker TEXT NOT NULL,
      title TEXT NOT NULL,
      series TEXT DEFAULT '',
      event_date DATE NOT NULL,
      image_url TEXT DEFAULT '',
      pdf_url TEXT DEFAULT '',
      video_url TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_colloquium_events_type_date
    ON colloquium_events (type, event_date DESC);
  `);
}

// Call this at the top of every API route before querying. It only runs the
// CREATE TABLE / INDEX statements once per server process.
export function ensureSchema(): Promise<void> {
  if (!globalForDb._schemaReady) {
    globalForDb._schemaReady = initSchema();
  }
  return globalForDb._schemaReady;
}
