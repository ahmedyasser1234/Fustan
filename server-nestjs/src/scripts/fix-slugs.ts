import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { eq, like } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { generateSlug } from '../products/products.service';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
  console.log('--- Starting Slug Fix Migration ---');
  
  const productsWithBrokenSlugs = await db.query.products.findMany({
    where: like(schema.products.slug, '--%'),
  });

  console.log(`Found ${productsWithBrokenSlugs.length} products with broken slugs.`);

  for (const product of productsWithBrokenSlugs) {
    const newSlug = generateSlug(product.nameAr || '', product.nameEn || '');
    await db.update(schema.products)
      .set({ slug: newSlug })
      .where(eq(schema.products.id, product.id));
    
    console.log(`Updated ID ${product.id}: "${product.nameEn || product.nameAr}" -> ${newSlug}`);
  }

  console.log('--- Slug Fix Migration Completed ---');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
