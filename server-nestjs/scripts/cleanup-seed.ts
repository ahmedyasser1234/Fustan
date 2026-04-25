import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/database/schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function cleanup() {
    console.log('🗑️ Starting cleanup of seeded data...');

    // 1. Delete Product
    const productSlug = 'luxury-wedding-dress';
    const product = await db.query.products.findFirst({
        where: eq(schema.products.slug, productSlug),
    });

    if (product) {
        // Delete related order items first if any? 
        // For now assuming clean deletion of product.
        try {
            await db.delete(schema.products).where(eq(schema.products.id, product.id));
            console.log(`✅ Deleted product: ${product.nameEn} (ID: ${product.id})`);
        } catch (error) {
            console.log(`⚠️ Could not delete product (might be in orders): ${error.message}`);
        }
    } else {
        console.log(`⚠️ Product not found with slug: ${productSlug}`);
    }

    // 2. Delete Collection
    const collectionSlug = 'summer-collection-2026';
    const collection = await db.query.collections.findFirst({
        where: eq(schema.collections.slug, collectionSlug),
    });

    if (collection) {
        try {
            await db.delete(schema.collections).where(eq(schema.collections.id, collection.id));
            console.log(`✅ Deleted collection: ${collection.nameEn} (ID: ${collection.id})`);
        } catch (e) {
            console.error(`❌ Failed to delete collection (might contain other products):`, e.message);
        }
    } else {
        console.log(`⚠️ Collection not found with slug: ${collectionSlug}`);
    }

    console.log('Cleanup completed.');
    process.exit(0);
}

cleanup().catch((err) => {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
});
