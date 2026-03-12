import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { PusherService } from './pusher.service';

@Module({
    imports: [PrismaModule],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway, PusherService],
    exports: [ChatService, PusherService],
})
export class ChatModule {
    constructor() {
        console.log('ChatModule loaded');
    }
}
