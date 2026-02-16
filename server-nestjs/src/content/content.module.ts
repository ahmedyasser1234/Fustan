import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { DatabaseModule } from '../database/database.module';
import { InstagramService } from './instagram.service';

@Module({
    imports: [DatabaseModule],
    controllers: [ContentController],
    providers: [ContentService, InstagramService],
    exports: [ContentService, InstagramService],
})
export class ContentModule { }
