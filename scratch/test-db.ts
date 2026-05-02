
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../server-nestjs/.env') });

const connectionString = process.env.DATABASE_URL;

async function test() {
    if (!connectionString) {
        console.error('DATABASE_URL not found');
        return;
    }
    console.log('Connecting to:', connectionString.split('@')[1]);
    const client = postgres(connectionString);
    try {
        const db = drizzle(client);
        const result = await db.execute('SELECT 1');
        console.log('Database connection successful:', result);
    } catch (err) {
        console.error('Database connection failed:', err);
    } finally {
        await client.end();
    }
}

test();
