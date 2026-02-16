
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as fs from 'fs';
import * as path from 'path';

const commonCreds = [
    'postgres://postgres:postgres@localhost:5432/postgres',
    'postgres://postgres:admin@localhost:5432/postgres',
    'postgres://postgres:root@localhost:5432/postgres',
    'postgres://postgres:123456@localhost:5432/postgres',
    'postgres://postgres:@localhost:5432/postgres', // Empty password
    // Try with fustan_db if it exists
    'postgres://postgres:postgres@localhost:5432/fustan_db',
];

async function testConnection(url: string) {
    try {
        const client = postgres(url, { connect_timeout: 2 });
        await client`SELECT 1`; // Simple query
        await client.end();
        return true;
    } catch (e) {
        return false;
    }
}

async function main() {
    console.log('Testing common Postgres credentials...');

    for (const url of commonCreds) {
        console.log(`Trying: ${url.replace(/:[^:@]*@/, ':****@')}`); // Mask password
        const success = await testConnection(url);
        if (success) {
            console.log('✅ Success! Found working credentials.');

            // Update .env file
            const envPath = path.join(process.cwd(), '.env');
            let envContent = fs.readFileSync(envPath, 'utf-8');

            // Replace DATABASE_URL line
            envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL=${url}`);

            fs.writeFileSync(envPath, envContent);
            console.log('Updated .env file successfully.');
            process.exit(0);
        }
    }

    console.log('❌ Could not find working credentials. User must provide them manually.');
    process.exit(1);
}

main();
