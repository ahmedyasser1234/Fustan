
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
    console.log('Applying commission schema changes...');

    try {
        // 1. Add vendorPrice to products if it doesn't exist
        console.log('Checking "products" table for "vendorPrice" column...');
        await client`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='vendorPrice') THEN
            ALTER TABLE "products" ADD COLUMN "vendorPrice" double precision;
            RAISE NOTICE 'Added vendorPrice column to products';
        ELSE
            RAISE NOTICE 'vendorPrice column already exists';
        END IF;
      END
      $$;
    `;

        // 2. Create settings table if it doesn't exist
        console.log('Checking for "settings" table...');
        await client`
      CREATE TABLE IF NOT EXISTS "settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "key" text NOT NULL,
        "value" text NOT NULL,
        "description" text,
        "updatedAt" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "settings_key_unique" UNIQUE("key")
      );
    `;
        console.log('Ensured "settings" table exists.');

        console.log('Schema changes applied successfully.');
    } catch (error) {
        console.error('Error applying changes:', error);
    } finally {
        await client.end();
    }
}

main();
