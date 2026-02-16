import { Module } from '@nestjs/common';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { VendorsModule } from '../vendors/vendors.module';

@Module({
    imports: [DatabaseModule, AuthModule, VendorsModule],
    controllers: [ShippingController],
    providers: [ShippingService],
    exports: [ShippingService],
})
export class ShippingModule { }
