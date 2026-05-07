import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../database/database.module';
import { MediaModule } from '../media/media.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { forwardRef } from '@nestjs/common';

import { MailService } from '../common/mail.service';

@Module({
  imports: [DatabaseModule, MediaModule, forwardRef(() => NotificationsModule)],
  providers: [AuthService, MailService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
