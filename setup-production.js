const { Client } = require('pg');

const password = 'Lq?w6LcwMp!J-*4';
const encodedPassword = encodeURIComponent(password);
const connectionString = `postgresql://postgres:${encodedPassword}@db.xulsmedxwwjazexppkxq.supabase.co:5432/postgres`;

const client = new Client({
  connectionString
});

const sql = `
CREATE TABLE IF NOT EXISTS production_records (
  id BIGSERIAL PRIMARY KEY,
  pakan_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  maggot_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_production_recorded_at ON production_records(recorded_at DESC);
ALTER TABLE production_records REPLICA IDENTITY FULL;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read production_records" ON production_records;
CREATE POLICY "Allow authenticated read production_records" ON production_records FOR SELECT TO authenticated USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE production_records;
`;

async function runSchema() {
  try {
    await client.connect();
    console.log('Connected to Supabase database!');
    await client.query(sql);
    console.log('Production records schema successfully applied!');
  } catch (err) {
    if (err.message.includes('already in publication')) {
        console.log('Already in publication.');
    } else {
        console.error('Error applying schema:', err);
    }
  } finally {
    await client.end();
  }
}

runSchema();
