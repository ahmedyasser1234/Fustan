import * as dotenv from 'dotenv';
dotenv.config();
// Override for local run connecting to docker
process.env.DATABASE_URL = 'postgres://fustan_user:fustan_password@localhost:5432/fustan_db';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DatabaseService } from './src/database/database.service';
import { collections } from './src/database/schema';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const db = app.get(DatabaseService);
    
    const allCollections = await db.db.select().from(collections);
    console.log('--- ALL COLLECTIONS ---');
    console.log(JSON.stringify(allCollections, null, 2));
    
    await app.close();
}

bootstrap();
