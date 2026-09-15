CREATE TABLE IF NOT EXISTS rentcar_records (
  id TEXT PRIMARY KEY,
  manager TEXT NOT NULL DEFAULT '',
  record_date TEXT NOT NULL,
  model_year TEXT NOT NULL DEFAULT '',
  plate TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  mileage TEXT NOT NULL DEFAULT '',
  options TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT '',
  account TEXT NOT NULL DEFAULT '',
  origin TEXT NOT NULL DEFAULT '',
  departure_time TEXT NOT NULL DEFAULT '',
  raw_vehicle_text TEXT NOT NULL DEFAULT '',
  raw_payment_text TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rentcar_records_date ON rentcar_records(record_date DESC,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rentcar_records_plate ON rentcar_records(plate,created_at DESC);
