import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';
import { PixVerseService } from './pixverse.service';
import { LocalAiService } from './local-ai.service';
import { PixVerseWebhookController } from './pixverse-webhook.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { PhotoroomModule } from '../photoroom/photoroom.module';
import { MediaModule } from '../media/media.module';

import { AiSubscriptionsModule } from '../ai-subscriptions/ai-subscriptions.module';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, PhotoroomModule, MediaModule, AiSubscriptionsModule],
  controllers: [AiController, PixVerseWebhookController],
  providers: [AiService, PixVerseService, LocalAiService],
  exports: [AiService, PixVerseService, LocalAiService],
})
export class AiModule {}
