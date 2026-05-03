import { Module } from '@nestjs/common';
import { SeoController } from './seo.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SeoController],
})
export class SeoModule {}
