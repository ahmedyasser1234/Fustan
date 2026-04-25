
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/database/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function main() {
    console.log('Checking Vendors and Products...');

    const vendors = await db.query.vendors.findMany();
    console.log(`Found ${vendors.length} vendors:`);

    for (const vendor of vendors) {
        console.log(`- Vendor: ${vendor.storeNameAr} (ID: ${vendor.id}, Slug: ${vendor.storeSlug})`);

        const products = await db.query.products.findMany({
            where: eq(schema.products.vendorId, vendor.id)
        });

        console.log(`  > Has ${products.length} products`);
        products.forEach(p => {
            console.log(`    - ${p.nameAr} (ID: ${p.id}, Active: ${p.isActive})`);
        });

        // Check reviews
        try {
            const reviews = await db.query.vendorReviews.findMany({
                where: eq(schema.vendorReviews.vendorId, vendor.id)
            });
            console.log(`  > Has ${reviews.length} reviews`);
        } catch (e) {
            console.log('  > Error checking reviews:', e.message);
        }
    }

    await pool.end();
}

main().catch(console.error);
