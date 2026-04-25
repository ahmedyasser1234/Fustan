import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../database/schema';
import { eq, ne, and } from 'drizzle-orm';

async function cleanup() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  const queryClient = postgres(databaseUrl);
  const db = drizzle(queryClient, { schema });

  console.log('🔍 Starting Database Cleanup...');

  try {
    // 1. Handle Duplicate Admin Accounts
    const admins = await db.query.users.findMany({
      where: eq(schema.users.role, 'admin'),
    });

    console.log(`📊 Found ${admins.length} admin accounts.`);

    if (admins.length > 1) {
      console.log('⚠️ Multiple admin accounts found. Identifying duplicates...');
      
      // Keep the one with the lowest ID (usually the first created) or one that is actually used.
      // For safety, we keep the one that matches a specific email if provided, or just id=1.
      const primaryAdmin = admins.find(a => a.id === 1) || admins[0];
      
      console.log(`✅ Keeping Admin: ${primaryAdmin.name} (ID: ${primaryAdmin.id})`);

      for (const admin of admins) {
        if (admin.id !== primaryAdmin.id) {
          console.log(`🗑️ Removing duplicate admin: ${admin.name} (ID: ${admin.id})`);
          await db.delete(schema.users).where(eq(schema.users.id, admin.id));
        }
      }
    } else if (admins.length === 1) {
      console.log('✅ Only one admin account exists. No cleanup needed for admins.');
    } else {
      console.log('❓ No admin account found. You might need to create one.');
    }

    // 2. Ensure id=1 is handled (Audit finding: duplicate admin account id=1)
    // If id=1 is a non-admin but we want it to be, or if it's a "backdoor" account.
    const userOne = await db.query.users.findFirst({
      where: eq(schema.users.id, 1),
    });

    if (userOne && userOne.role !== 'admin') {
      console.log(`⚠️ User with ID 1 exists but is not an admin (Role: ${userOne.role}).`);
      // Optional: Update to customer or remove if it was a dev account
    }

    console.log('✨ Cleanup complete!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await queryClient.end();
  }
}

cleanup();
