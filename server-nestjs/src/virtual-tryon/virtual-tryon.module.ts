import { Module } from '@nestjs/common';
import { VirtualTryonController } from './virtual-tryon.controller';
import { VirtualTryonService } from './virtual-tryon.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [VirtualTryonController],
  providers: [VirtualTryonService],
})
export class VirtualTryonModule {}
