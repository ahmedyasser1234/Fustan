import { Module } from '@nestjs/common';
import { AiSubscriptionsService } from './ai-subscriptions.service';
import { AiSubscriptionsController } from './ai-subscriptions.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AiSubscriptionsController],
  providers: [AiSubscriptionsService],
  exports: [AiSubscriptionsService],
})
export class AiSubscriptionsModule {}
