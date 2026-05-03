import { Module } from '@nestjs/common';
import { PhotoroomService } from './photoroom.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [PhotoroomService],
  exports: [PhotoroomService],
})
export class PhotoroomModule {}
