import { Module } from '@nestjs/common';
import { StoreReviewsService } from './store-reviews.service';
import { StoreReviewsController } from './store-reviews.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [StoreReviewsController],
    providers: [StoreReviewsService],
})
export class StoreReviewsModule { }
