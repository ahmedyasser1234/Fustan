import { Module } from '@nestjs/common';
import { CloudinaryProvider, CloudinaryService } from './cloudinary.provider';

@Module({
    providers: [CloudinaryProvider, CloudinaryService],
    exports: [CloudinaryProvider, CloudinaryService],
})
export class MediaModule { }
