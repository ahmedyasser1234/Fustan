import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './src/database/schema';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  await db.update(schema.categories).set({
    categoryBackgroundUrl: 'https://res.cloudinary.com/dk3wwuy5d/image/upload/v1731671234/test-bg.jpg', // dummy image
    categoryBackgroundPrompt: 'Luxury fashion store interior, well-lit, professional photography'
  });
  console.log('Background updated for all categories!');
  process.exit(0);
}
main().catch(console.error);
