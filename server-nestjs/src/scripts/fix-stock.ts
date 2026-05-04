import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
  console.log('--- Starting Stock Fix Migration ---');
  
  const allProducts = await db.query.products.findMany();
  
  let updatedCount = 0;
  for (const product of allProducts) {
    const sizes = (product.sizes as any[]) || [];
    const actualStock = sizes.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);

    if (product.stock !== actualStock) {
      await db.update(schema.products)
        .set({ stock: actualStock })
        .where(eq(schema.products.id, product.id));
      
      console.log(`Updated ID ${product.id} ("${product.nameEn || product.nameAr}"): stock ${product.stock} -> ${actualStock}`);
      updatedCount++;
    }
  }

  console.log(`--- Stock Fix Migration Completed. Updated ${updatedCount} products. ---`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
