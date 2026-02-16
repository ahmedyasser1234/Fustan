
import postgres from 'postgres';
import { config } from 'dotenv';
import path from 'path';

// Load .env from current directory (server-nestjs)
config({ path: path.resolve(__dirname, '../.env') });

async function fix() {
    const url = process.env.DATABASE_URL;
    console.log('Using DB URL:', url?.replace(/:[^:@]*@/, ':****@'));

    if (!url) {
        console.error('No DATABASE_URL found');
        return;
    }

    const sql = postgres(url);

    try {
        console.log('Ensuring columns exist in "vendors" table...');

        const queries = [
            `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "storeNameAr" TEXT`,
            `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "storeNameEn" TEXT`,
            `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "descriptionAr" TEXT`,
            `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "descriptionEn" TEXT`,
            `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "addressAr" TEXT`,
            `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "addressEn" TEXT`,
            `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "cityAr" TEXT`,
            `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "cityEn" TEXT`,
            `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "countryAr" TEXT`,
            `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "countryEn" TEXT`,
        ];

        for (const query of queries) {
            console.log('Executing:', query);
            await sql.unsafe(query);
        }

        console.log('Checking for old columns to migrate data...');
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'vendors'
        `;
        const colNames = columns.map(c => c.column_name.toLowerCase());

        if (colNames.includes('storename')) {
            console.log('Migrating storeName -> storeNameAr/En');
            await sql`UPDATE vendors SET "storeNameAr" = "storeName", "storeNameEn" = "storeName" WHERE "storeNameAr" IS NULL`;
        }
        if (colNames.includes('description')) {
            console.log('Migrating description -> descriptionAr/En');
            await sql`UPDATE vendors SET "descriptionAr" = "description", "descriptionEn" = "description" WHERE "descriptionAr" IS NULL`;
        }

        console.log('Database fix completed successfully!');
    } catch (e) {
        console.error('Fix Error:', e);
    } finally {
        await sql.end();
    }
}

fix();
