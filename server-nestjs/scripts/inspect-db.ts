
import postgres from 'postgres';
import { config } from 'dotenv';
config();

async function inspect() {
    const url = process.env.DATABASE_URL;
    console.log('Inspecting DB at:', url?.replace(/:[^:@]*@/, ':****@'));

    if (!url) {
        console.error('No DATABASE_URL found');
        return;
    }

    const sql = postgres(url);

    try {
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;

        console.log('Tables found in public schema:');
        if (tables.length === 0) {
            console.log('(No tables found)');
        } else {
            console.table(tables);
        }
    } catch (e) {
        console.error('Inspection Error:', e);
    } finally {
        await sql.end();
    }
}

inspect();
