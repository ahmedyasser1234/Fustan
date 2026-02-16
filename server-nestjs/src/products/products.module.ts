import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { DatabaseModule } from '../database/database.module';
import { MediaModule } from '../media/media.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [DatabaseModule, MediaModule, AuthModule],
    providers: [ProductsService, CategoriesService],
    controllers: [ProductsController, CategoriesController],
    exports: [ProductsService, CategoriesService],
})
export class ProductsModule { }
