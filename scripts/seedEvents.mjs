/**
 * One-time migration script: loads the existing static `data/events.json`
 * into the `colloquium_events` MySQL table as type='event', so the
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
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Next.js conventionally uses .env.local for local secrets; fall back to
// .env if that's what you're using instead.
dotenv.config({ path: ".env.local" });
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  dateStrings: true,
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
};

const run = async () => {
  if (!process.env.DB_PASSWORD) {
    console.error(
      "DB_PASSWORD is not set. Configure DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD in .env.local (see .env.local.example)."
    );
    process.exit(1);
  }

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

    const [existing] = await pool.query(
      `SELECT id FROM colloquium_events WHERE type = 'event' AND speaker = ? AND title = ? AND event_date = ?`,
      [ev.speaker, ev.title, eventDate]
    );

    if (existing.length > 0) {
      skipped += 1;
      continue;
    }

    await pool.query(
      `INSERT INTO colloquium_events (type, speaker, title, series, event_date, image_url, pdf_url, video_url)
       VALUES ('event', ?, ?, ?, ?, ?, ?, ?)`,
      [ev.speaker, ev.title, ev.series || "", eventDate, ev.image || "", ev.pdf || "", ev.video || ""]
    );
    inserted += 1;
  }

  console.log(`Seed complete. Inserted: ${inserted}, skipped (already present): ${skipped}`);
  await pool.end();
};

run().catch((err) => {
  console.error("Seed failed:", err.message || err);
  process.exit(1);
});