
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