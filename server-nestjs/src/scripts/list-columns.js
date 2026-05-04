
const postgres = require('postgres');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not defined');
  process.exit(1);
}

const client = postgres(connectionString);

async function run() {
  try {
    const res = await client`SELECT column_name FROM information_schema.columns WHERE table_name = 'products'`;
    console.log('Columns in products table:');
    console.log(res.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
