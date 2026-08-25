/**
 * One-time migration script: loads the existing static `data/events.json`
 * into the `colloquium_events` Postgres table as type='event', so the
 * "Events" tab becomes admin-managed too.
 *
 * Usage (from the project root, with .env.local configured):
 *   npm run seed:events
 *
 * Safe to re-run: it skips rows whose (speaker, title, event_date)
 * already exist, so it won't create duplicates.
 */
import fs from "fs";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";

// Next.js conventionally uses .env.local for local secrets; fall back to
// .env if that's what you're using instead.
dotenv.config({ path: ".env.local" });
dotenv.config();

const { Pool } = pg;

const explicitSsl = String(process.env.PGSSL).toLowerCase() === "true";
const urlWantsSsl = /sslmode=(require|verify-full|verify-ca)/i.test(process.env.DATABASE_URL || "");
const useSsl = explicitSsl || urlWantsSsl;

const pool = process.env.DATABASE_URL
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

const EVENTS_JSON_PATH = path.join(process.cwd(), "data", "events.json");

const parseDisplayDate = (displayDate) => {
  // Existing events.json dates look like "March 23, 2026"
  const d = new Date(displayDate);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Could not parse date: "${displayDate}"`);
  }
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

const initSchema = async () => {
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
};

const run = async () => {
  await initSchema();

  if (!fs.existsSync(EVENTS_JSON_PATH)) {
    console.error(`Could not find events.json at ${EVENTS_JSON_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(EVENTS_JSON_PATH, "utf-8");
  const events = JSON.parse(raw);

  let inserted = 0;
  let skipped = 0;

  for (const ev of events) {
    const eventDate = parseDisplayDate(ev.date);

    const existing = await pool.query(
      `SELECT id FROM colloquium_events WHERE type = 'event' AND speaker = $1 AND title = $2 AND event_date = $3`,
      [ev.speaker, ev.title, eventDate]
    );

    if (existing.rows.length > 0) {
      skipped += 1;
      continue;
    }

    await pool.query(
      `INSERT INTO colloquium_events (type, speaker, title, series, event_date, image_url, pdf_url, video_url)
       VALUES ('event', $1, $2, $3, $4, $5, $6, $7)`,
      [ev.speaker, ev.title, ev.series || "", eventDate, ev.image || "", ev.pdf || "", ev.video || ""]
    );
    inserted += 1;
  }

  console.log(`Seed complete. Inserted: ${inserted}, skipped (already present): ${skipped}`);
  await pool.end();
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
