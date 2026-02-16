import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { MediaModule } from '../media/media.module';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [DatabaseModule, MediaModule, AuthModule],
    controllers: [CollectionsController],
    providers: [CollectionsService],
    exports: [CollectionsService],
})
export class CollectionsModule { }
