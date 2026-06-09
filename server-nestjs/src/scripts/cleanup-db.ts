import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../database/schema';
import { eq, ne, and } from 'drizzle-orm';

async function cleanup() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(' DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  const queryClient = postgres(databaseUrl);
  const db = drizzle(queryClient, { schema });

  console.log(' Starting Database Cleanup...');

  try {
    const admins = await db.query.users.findMany({
      where: eq(schema.users.role, 'admin'),
    });

    console.log(` Found ${admins.length} admin accounts.`);

    if (admins.length > 1) {
      console.log(
        ' Multiple admin accounts found. Identifying duplicates...',
      );

      const primaryAdmin = admins.find((a) => a.id === 1) || admins[0];

      console.log(
        `Keeping Admin: ${primaryAdmin.name} (ID: ${primaryAdmin.id})`,
      );

      for (const admin of admins) {
        if (admin.id !== primaryAdmin.id) {
          console.log(
            `Removing duplicate admin: ${admin.name} (ID: ${admin.id})`,
          );
          await db.delete(schema.users).where(eq(schema.users.id, admin.id));
        }
      }
    } else if (admins.length === 1) {
      console.log(
        'Only one admin account exists. No cleanup needed for admins.',
      );
    } else {
      console.log(' No admin account found. You might need to create one.');
    }

    const userOne = await db.query.users.findFirst({
      where: eq(schema.users.id, 1),
    });

    if (userOne && userOne.role !== 'admin') {
      console.log(
        ` User with ID 1 exists but is not an admin (Role: ${userOne.role}).`,
      );
    }

    console.log(' Cleanup complete!');
  } catch (error) {
    console.error(' Cleanup failed:', error);
  } finally {
    await queryClient.end();
  }
}

cleanup();
