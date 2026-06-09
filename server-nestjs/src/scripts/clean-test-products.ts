import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { eq, ne, and } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const DRY_RUN = true; 
const EXCLUDE_IDS = [2];

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

function isTestJunk(name: string | null): boolean {
  if (!name) return false;
  const clean = name.trim();
  if (clean.length === 0) return false;

  if (clean.length < 4) return true;

  const repeatedChar = /(.)\1{2,}/; 
  const repeatedSequence = /(.{2})\1{1,}/; 
  if (repeatedChar.test(clean) || repeatedSequence.test(clean)) return true;


  if (/^[a-zA-Z]+$/.test(clean)) {
    const vowels = clean.match(/[aeiouAEIOU]/g);
    if (!vowels || vowels.length / clean.length < 0.2) return true;
  }

  return false;
}

async function main() {
  console.log(`--- Starting Test Product Cleanup (DRY_RUN=${DRY_RUN}) ---`);
  
  const allProducts = (await db.query.products.findMany()) as schema.Product[];
  
  const toDelete: schema.Product[] = [];

  for (const product of allProducts) {
    if (EXCLUDE_IDS.includes(product.id)) continue;

    const nameAr = product.nameAr || '';
    const nameEn = product.nameEn || '';

    if (isTestJunk(nameAr) || isTestJunk(nameEn)) {
      toDelete.push(product);
    }
  }

  console.log(`Found ${toDelete.length} products to delete.`);

  for (const product of toDelete) {
    console.log(`[${DRY_RUN ? 'SHOULD DELETE' : 'DELETING'}] ID ${product.id}: AR="${product.nameAr}" EN="${product.nameEn}"`);
    
    if (!DRY_RUN) {
      await db.delete(schema.products).where(eq(schema.products.id, product.id));
    }
  }

  if (DRY_RUN && toDelete.length > 0) {
    console.log('\n!!! THIS WAS A DRY RUN. SET DRY_RUN = false TO ACTUALLY DELETE !!!');
  }

  console.log(`--- Cleanup Completed. ${DRY_RUN ? 'Identified' : 'Deleted'} ${toDelete.length} products. ---`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
