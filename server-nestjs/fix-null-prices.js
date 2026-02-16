import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function fixPrices() {
    try {
        console.log('🛠 Starting Price Data Recovery...');

        // 1. If vendorPrice is null, recover it from price and vendor's commission
        console.log('Recovering null vendorPrice...');
        await sql`
            UPDATE products p
            SET "vendorPrice" = p.price / (1 + COALESCE(v."commissionRate", 10) / 100)
            FROM vendors v
            WHERE p."vendorId" = v.id AND p."vendorPrice" IS NULL
        `;

        // 2. If vendorOriginalPrice is still null, recover it from originalPrice or vendorPrice
        console.log('Recovering null vendorOriginalPrice...');
        await sql`
            UPDATE products p
            SET "vendorOriginalPrice" = COALESCE(
                p."originalPrice" / (1 + COALESCE(v."commissionRate", 10) / 100), 
                p."vendorPrice"
            )
            FROM vendors v
            WHERE p."vendorId" = v.id AND p."vendorOriginalPrice" IS NULL
        `;

        // 3. One final sync to ensure everything is mathematicaly correct with current rates
        console.log('Final price synchronization...');
        await sql`
            UPDATE products p
            SET 
                price = "vendorPrice" * (1 + v."commissionRate" / 100),
                "originalPrice" = "vendorOriginalPrice" * (1 + v."commissionRate" / 100),
                "updatedAt" = NOW()
            FROM vendors v
            WHERE p."vendorId" = v.id
        `;

        console.log('✅ Price data fixed successfully!');
    } catch (error) {
        console.error('❌ Error during fix:', error.message);
    } finally {
        await sql.end();
    }
}

fixPrices();
