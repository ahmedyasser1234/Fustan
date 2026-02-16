import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module'; // To notify offline users

@Module({
    imports: [
        AuthModule,
        DatabaseModule,
        NotificationsModule
    ],
    providers: [ChatGateway, ChatService],
    controllers: [ChatController],
    exports: [ChatService]
})
export class ChatModule { }
