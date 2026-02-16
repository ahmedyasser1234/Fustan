import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function migrateCategoriesBilingual() {
    console.log('Starting categories bilingual migration...');

    try {
        // Add new bilingual columns
        await pool.query(`
            ALTER TABLE categories 
            ADD COLUMN IF NOT EXISTS "nameAr" TEXT,
            ADD COLUMN IF NOT EXISTS "nameEn" TEXT,
            ADD COLUMN IF NOT EXISTS "descriptionAr" TEXT,
            ADD COLUMN IF NOT EXISTS "descriptionEn" TEXT;
        `);
        console.log('✓ Added bilingual columns');

        // Migrate existing data (copy name to both nameAr and nameEn)
        await pool.query(`
            UPDATE categories 
            SET "nameAr" = name,
                "nameEn" = name,
                "descriptionAr" = description,
                "descriptionEn" = description
            WHERE "nameAr" IS NULL OR "nameEn" IS NULL;
        `);
        console.log('✓ Migrated existing data');

        // Make nameAr and nameEn NOT NULL
        await pool.query(`
            ALTER TABLE categories 
            ALTER COLUMN "nameAr" SET NOT NULL,
            ALTER COLUMN "nameEn" SET NOT NULL;
        `);
        console.log('✓ Set NOT NULL constraints');

        // Drop old columns
        await pool.query(`
            ALTER TABLE categories 
            DROP COLUMN IF EXISTS name,
            DROP COLUMN IF EXISTS description;
        `);
        console.log('✓ Dropped old columns');

        console.log('✅ Categories bilingual migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

migrateCategoriesBilingual();
