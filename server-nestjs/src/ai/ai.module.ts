import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';
import { PixVerseService } from './pixverse.service';
import { PixVerseWebhookController } from './pixverse-webhook.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { PhotoroomModule } from '../photoroom/photoroom.module';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, PhotoroomModule],
  controllers: [AiController, PixVerseWebhookController],
  providers: [AiService, PixVerseService],
  exports: [AiService, PixVerseService],
})
export class AiModule {}
