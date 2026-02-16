import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { forwardRef } from '@nestjs/common';

@Module({
    imports: [DatabaseModule, forwardRef(() => AuthModule)],
    controllers: [NotificationsController],
    providers: [NotificationsGateway, NotificationsService],
    exports: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule { }
