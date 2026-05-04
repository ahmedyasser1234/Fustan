
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { eq, desc } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not defined');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function run() {
  console.log('--- All Products ---');
  try {
    const allProducts = await db.select().from(schema.products).orderBy(desc(schema.products.id)).limit(50);
    
    for (const p of allProducts) {
      const v = await db.query.vendors.findFirst({
        where: eq(schema.vendors.id, p.vendorId)
      });
      console.log(`ID: ${p.id} | Name: ${p.nameAr} | Active: ${p.isActive} | Featured: ${p.isFeatured} | Vendor: ${v?.storeNameAr} | Vendor Status: ${v?.status}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
