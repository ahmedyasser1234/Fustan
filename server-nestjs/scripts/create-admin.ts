
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../src/database/schema';
import * as schema from '../src/database/schema';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'node:crypto';
import { config } from 'dotenv';
config({ path: '.env' });
import 'dotenv/config';

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'Yes (Length: ' + process.env.DATABASE_URL.length + ')' : 'No');


// Use same connection logic as the app
const connectionString = process.env.DATABASE_URL || 'postgres://fustan_user:fustan_password@localhost:5432/fustan_db';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = randomBytes(16).toString('hex');
        scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(`${salt}:${derivedKey.toString('hex')}`);
        });
    });
}

async function main() {
    console.log('Creating admin user...');

    const email = 'admin@fustan.com';
    const password = 'admin';
    const hashedPassword = await hashPassword(password);

    // Check if exists
    try {
        const existing = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (existing) {
            console.log('Admin already exists, updating password and role...');
            await db.update(users)
                .set({
                    password: hashedPassword,
                    role: 'admin',
                    loginMethod: 'email'
                })
                .where(eq(users.email, email));
        } else {
            console.log('Creating new admin...');
            await db.insert(users).values({
                email,
                password: hashedPassword,
                name: 'Admin User',
                role: 'admin',
                openId: `admin_${Date.now()}`,
                loginMethod: 'email',
            });
        }

        console.log('Admin user ready!');
        console.log('Email:', email);
        console.log('Password:', password);
    } catch (err) {
        console.error('Error creating admin:', err);
    } finally {
        await client.end();
        process.exit(0);
    }
}

main().catch(console.error);
