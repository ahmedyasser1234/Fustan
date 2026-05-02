
const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server-nestjs/.env') });

const connectionString = process.env.DATABASE_URL;

async function migrate() {
    if (!connectionString) {
        console.error('DATABASE_URL not found');
        return;
    }
    console.log('Connecting to database...');
    const sql = postgres(connectionString);
    try {
        console.log('Adding missing column isCustomerListing...');
        await sql`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isCustomerListing" boolean DEFAULT false`;
        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await sql.end();
    }
}

migrate();
