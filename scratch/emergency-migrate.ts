
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../server-nestjs/.env') });

const connectionString = process.env.DATABASE_URL;

async function migrate() {
    if (!connectionString) {
        console.error('DATABASE_URL not found');
        return;
    }
    console.log('Connecting to database...');
    const client = postgres(connectionString);
    try {
        const db = drizzle(client);
        console.log('Adding missing column isCustomerListing...');
        await db.execute('ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isCustomerListing" boolean DEFAULT false');
        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
