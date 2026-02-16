import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../database/schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import * as path from 'path';

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
    console.log('Connecting to database:', process.env.DATABASE_URL ? 'URL Found' : 'URL Missing');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    const db = drizzle(pool, { schema });

    console.log('1. Checking if storeReviews table exists...');
    try {
        const reviews = await db.select().from(schema.storeReviews).limit(1);
        console.log('✅ Success! Table exists. Query result:', reviews);
    } catch (e) {
        console.error('❌ Error querying storeReviews table. It might not exist.', e);
        await pool.end();
        return;
    }

    console.log('2. Finding a valid user to test with...');
    const users = await db.select().from(schema.users).limit(1);
    if (!users.length) {
        console.log('⚠️ No users found in database. Cannot test insertion.');
        await pool.end();
        return;
    }
    const testUser = users[0];
    console.log(`✅ Found user: ID=${testUser.id}, Role=${testUser.role}`);

    console.log('3. Attempting to insert a test review...');
    try {
        // cleanup potential previous runs
        await db.delete(schema.storeReviews).where(eq(schema.storeReviews.customerId, testUser.id));

        const result = await db.insert(schema.storeReviews).values({
            customerId: testUser.id,
            rating: 5,
            comment: 'Debug test review',
            guestName: 'Debug User',
            isApproved: true,
            city: 'Test City'
        }).returning();
        console.log('✅ Insert successful:', result);
    } catch (e) {
        console.error('❌ Insert failed:', e);
    }

    await pool.end();
}

main().catch(console.error);
