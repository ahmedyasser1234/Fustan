import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CouponsModule } from '../coupons/coupons.module';
import { WalletsModule } from '../wallets/wallets.module';
import { PointsModule } from '../points/points.module';

@Module({
    imports: [DatabaseModule, AuthModule, NotificationsModule, CouponsModule, WalletsModule, PointsModule],
    providers: [OrdersService],
    controllers: [OrdersController],
    exports: [OrdersService],
})
export class OrdersModule { }
