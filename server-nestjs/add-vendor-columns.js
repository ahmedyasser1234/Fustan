import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function addVendorColumns() {
    try {
        console.log('Adding missing columns to vendors table...');

        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "coverImage" TEXT`;
        console.log('✅ Added coverImage');

        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "shippingCost" DOUBLE PRECISION DEFAULT 0`;
        console.log('✅ Added shippingCost');

        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "hasFreeShipping" BOOLEAN DEFAULT FALSE`;
        console.log('✅ Added hasFreeShipping');

        await sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "freeShippingThreshold" DOUBLE PRECISION DEFAULT 0`;
        console.log('✅ Added freeShippingThreshold');

        console.log('🚀 All columns synchronized successfully!');
    } catch (error) {
        console.error('❌ Error during migration:', error.message);
    } finally {
        await sql.end();
    }
}

addVendorColumns();
