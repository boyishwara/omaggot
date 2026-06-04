const fs = require('fs');
const { Client } = require('pg');

const password = 'Lq?w6LcwMp!J-*4';
const encodedPassword = encodeURIComponent(password);
const connectionString = `postgresql://postgres:${encodedPassword}@db.xulsmedxwwjazexppkxq.supabase.co:5432/postgres`;

const client = new Client({
  connectionString
});

async function runSchema() {
  try {
    await client.connect();
    console.log('Connected to Supabase database!');
    const schema = fs.readFileSync('supabase/schema.sql', 'utf8');
    await client.query(schema);
    console.log('Schema successfully applied!');
  } catch (err) {
    console.error('Error applying schema:', err);
  } finally {
    await client.end();
  }
}

runSchema();
