-- Data dari ESP32, insert setiap ~10 detik
CREATE TABLE sensor_readings (
  id          BIGSERIAL PRIMARY KEY,
  temperature DECIMAL(5,2) NOT NULL,        -- Suhu dalam °C
  humidity    DECIMAL(5,2) NOT NULL,        -- Kelembaban dalam %RH
  heat_index  DECIMAL(5,2),                 -- Heat index kalkulasi
  status      TEXT NOT NULL DEFAULT 'NORMAL', -- NORMAL/WARNING/DANGER/CRITICAL
  device_id   TEXT NOT NULL DEFAULT 'esp32-001', -- ID perangkat
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Index untuk query performa
CREATE INDEX idx_sensor_recorded_at ON sensor_readings(recorded_at DESC);
CREATE INDEX idx_sensor_device_id ON sensor_readings(device_id);
-- Realtime enabled
ALTER TABLE sensor_readings REPLICA IDENTITY FULL;

-- Rules yang bisa di-CRUD oleh admin
CREATE TABLE warning_rules (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,              -- Nama rule, contoh: "Suhu Terlalu Tinggi"
  parameter     TEXT NOT NULL,             -- 'temperature' | 'humidity' | 'heat_index'
  condition     TEXT NOT NULL,             -- 'gt' | 'lt' | 'gte' | 'lte'
  threshold     DECIMAL(6,2) NOT NULL,     -- Nilai ambang batas
  severity      TEXT NOT NULL,             -- 'WARNING' | 'DANGER' | 'CRITICAL'
  message       TEXT NOT NULL,             -- Pesan notifikasi
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  notify_email  BOOLEAN NOT NULL DEFAULT FALSE, -- Kirim email?
  notify_sound  BOOLEAN NOT NULL DEFAULT TRUE,  -- Aktifkan buzzer?
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Log setiap notifikasi/peringatan yang terjadi
CREATE TABLE notifications (
  id          BIGSERIAL PRIMARY KEY,
  rule_id     BIGINT REFERENCES warning_rules(id) ON DELETE SET NULL,
  rule_name   TEXT,                        -- Snapshot nama rule saat notif
  severity    TEXT NOT NULL,
  message     TEXT NOT NULL,
  reading_id  BIGINT REFERENCES sensor_readings(id) ON DELETE SET NULL,
  temperature DECIMAL(5,2),               -- Snapshot nilai saat notif
  humidity    DECIMAL(5,2),
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notif_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notif_is_read ON notifications(is_read);
-- Realtime enabled untuk notifikasi live
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- Aktifkan Realtime untuk kedua tabel (Wajib untuk Supabase Realtime via WebSockets)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Pengaturan global sistem
CREATE TABLE system_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Seed data default
INSERT INTO system_settings (key, value) VALUES
  ('sensor_interval_seconds', '10'),
  ('email_notifications_enabled', 'false'),
  ('admin_email', ''),
  ('device_id', 'esp32-001'),
  ('system_name', 'O'Maggot Box'),
  ('simulation_status', 'NONE');

-- ==========================================
-- TELEGRAM SUBSCRIBERS
-- ==========================================
CREATE TABLE IF NOT EXISTS telegram_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id TEXT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookup of active subscribers
CREATE INDEX idx_telegram_subscribers_active ON telegram_subscribers(is_active);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE warning_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users only
CREATE POLICY "Allow authenticated read sensor_readings" ON sensor_readings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read warning_rules" ON warning_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read notifications" ON notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read system_settings" ON system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read telegram_subscribers" ON telegram_subscribers FOR SELECT TO authenticated USING (true);

-- ==========================================
-- USER PROFILES (RBAC)
-- ==========================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY, -- References auth.users(id), but we'll manage it via API/Trigger
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'user', 'admin', 'superadmin'
    is_approved BOOLEAN NOT NULL DEFAULT true, -- true for normal users, false for pending admins
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Users can update their own profile name
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Backend API and MQTT Worker will use the Service Role Key, which bypasses RLS automatically.
-- This ensures the public Anon key cannot insert, update, or delete records.
