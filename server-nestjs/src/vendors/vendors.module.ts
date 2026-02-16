import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { MediaModule } from '../media/media.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [DatabaseModule, AuthModule, MediaModule, NotificationsModule],
    providers: [VendorsService],
    controllers: [VendorsController],
    exports: [VendorsService],
})
export class VendorsModule { }
