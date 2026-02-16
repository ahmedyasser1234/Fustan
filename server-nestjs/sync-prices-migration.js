import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function syncPrices() {
    try {
        console.log('🔄 Starting Price Synchronization Migration...');

        // 1. Add vendorOriginalPrice column if it doesn't exist
        console.log('Adding vendorOriginalPrice column...');
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS "vendorOriginalPrice" DOUBLE PRECISION`;

        // 2. Initialize vendorOriginalPrice for existing products
        // We assume that if originalPrice exists, it might already have commission, 
        // but for safety, if vendorOriginalPrice is null, we initialize it.
        // If the current originalPrice equals the current price, 
        // then vendorOriginalPrice should be price / (1 + commission / 100).
        // A simpler approach: set vendorOriginalPrice = vendorPrice (which we know is the vendor's base price)
        // unless originalPrice was different from price.

        console.log('Initialing vendorOriginalPrice from vendorPrice...');
        await sql`
            UPDATE products 
            SET "vendorOriginalPrice" = "vendorPrice" 
            WHERE "vendorOriginalPrice" IS NULL
        `;

        // 3. Recalculate ALL prices for ALL products based on their vendor's current commission
        console.log('Recalculating all prices...');
        await sql`
            UPDATE products p
            SET 
                price = "vendorPrice" * (1 + v."commissionRate" / 100),
                "originalPrice" = "vendorOriginalPrice" * (1 + v."commissionRate" / 100),
                "updatedAt" = NOW()
            FROM vendors v
            WHERE p."vendorId" = v.id
        `;

        console.log('✅ Price synchronization completed successfully!');
    } catch (error) {
        console.error('❌ Error during migration:', error.message);
    } finally {
        await sql.end();
    }
}

syncPrices();
