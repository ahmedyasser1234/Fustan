import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function addSilhouetteColumn() {
    try {
        console.log('Adding silhouette column to products table...');
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS silhouette TEXT`;
        console.log('✅ Column added successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sql.end();
    }
}

addSilhouetteColumn();
