import { Module } from '@nestjs/common';
import { CloudinaryProvider, CloudinaryService } from './cloudinary.provider';
import { MediaController } from './media.controller';

@Module({
  controllers: [MediaController],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class MediaModule {}
