import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrateVendorGallery() {
    console.log('Starting vendor gallery migration...');

    try {
        // Add gallery column (text array) to vendors table
        await pool.query(`
            ALTER TABLE vendors 
            ADD COLUMN IF NOT EXISTS "gallery" TEXT[] DEFAULT '{}';
        `);
        console.log('✓ Added gallery column');

        console.log('✅ Vendor gallery migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

migrateVendorGallery();
