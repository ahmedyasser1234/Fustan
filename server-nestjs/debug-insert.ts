
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/database/schema';
import { users } from './src/database/schema';
import { config } from 'dotenv';
config();

async function run() {
    console.log('Connecting to:', process.env.DATABASE_URL);
    const client = postgres(process.env.DATABASE_URL!);
    const db = drizzle(client, { schema });

    try {
        console.log('Attempting insert...');
        const res = await db.insert(users).values({
            email: 'debug_manual_' + Date.now() + '@example.com',
            password: 'hashed_password_123',
            name: 'Debug Manual',
            role: 'customer',
            openId: 'debug_' + Date.now(),
            loginMethod: 'email',
        }).returning();
        console.log('Insert success:', res);
    } catch (e) {
        console.error('Insert Error:', e);
    } finally {
        await client.end();
    }
}
run();
