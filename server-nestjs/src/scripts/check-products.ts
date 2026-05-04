
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseService } from '../database/database.service';
import { products, vendors } from '../database/schema';
import { eq, desc } from 'drizzle-orm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dbService = app.get(DatabaseService);

  console.log('--- All Products ---');
  const allProducts = await dbService.db.select().from(products).orderBy(desc(products.id)).limit(20);
  
  for (const p of allProducts) {
    const v = await dbService.db.query.vendors.findFirst({
      where: eq(vendors.id, p.vendorId)
    });
    console.log(`ID: ${p.id} | Name: ${p.nameAr} | Active: ${p.isActive} | Featured: ${p.isFeatured} | Vendor: ${v?.storeNameAr} | Vendor Status: ${v?.status}`);
  }

  await app.close();
}

bootstrap();
