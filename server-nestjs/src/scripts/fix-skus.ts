import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { eq, or, isNull } from 'drizzle-orm';
import { generateSKU } from '../products/products.service';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
  console.log('--- Starting SKU Fix Migration ---');
  
  const allProducts = (await db.query.products.findMany()) as schema.Product[];
  
  let updatedCount = 0;
  for (const product of allProducts) {
    const currentSku = product.sku?.trim();
    const isInvalid = !currentSku || 
                     currentSku === '' || 
                     /[\u0600-\u06FF]/.test(currentSku); 

    if (isInvalid) {
      const newSku = generateSKU(product.vendorId, product.categoryId || 0);
      await db.update(schema.products)
        .set({ sku: newSku })
        .where(eq(schema.products.id, product.id));
      
      console.log(`Updated ID ${product.id}: SKU "${currentSku || 'EMPTY'}" -> ${newSku}`);
      updatedCount++;
    }
  }

  console.log(`--- SKU Fix Migration Completed. Updated ${updatedCount} products. ---`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
