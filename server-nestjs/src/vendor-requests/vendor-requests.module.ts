import { Module } from '@nestjs/common';
import { VendorRequestsService } from './vendor-requests.service';
import { VendorRequestsController } from './vendor-requests.controller';
import { AuthModule } from '../auth/auth.module';
import { VendorsModule } from '../vendors/vendors.module';
import { MediaModule } from '../media/media.module';

@Module({
    imports: [AuthModule, VendorsModule, MediaModule],
    providers: [VendorRequestsService],
    controllers: [VendorRequestsController],
    exports: [VendorRequestsService],
})
export class VendorRequestsModule { }
