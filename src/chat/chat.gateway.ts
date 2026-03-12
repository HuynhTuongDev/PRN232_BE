import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { PusherService } from './pusher.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    transports: ['websocket', 'polling']
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('ChatGateway');

    constructor(
        private readonly chatService: ChatService,
        private readonly pusherService: PusherService,
    ) {
        this.logger.log('ChatGateway initialized with PusherService');
    }

    @SubscribeMessage('send_message')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { receiverId?: string; content: string; isAI?: boolean },
    ) {
        this.logger.log(`Received send_message: ${JSON.stringify(payload)} from ${client.id}`);
        const senderId = client.data.userId;
        if (!senderId) {
            this.logger.warn(`Sender ID not found for client ${client.id}. Did they join_room?`);
            return;
        }

        const message = await this.chatService.sendMessage({
            senderId,
            receiverId: payload.receiverId,
            content: payload.content,
            isAI: payload.isAI,
        });

        // Determine receiver room
        const receiverId = payload.receiverId === 'admin-placeholder' ? 'admin-room' : (payload.receiverId || 'admin-room');
        
        this.logger.log(`Message from ${senderId} to ${receiverId}: ${payload.content}`);

        // 1. Emit via Socket.io (for local development/persistent server)
        this.server.to(receiverId).emit('receive_message', message);
        this.server.to(senderId).emit('receive_message', message);

        // 2. Trigger via Pusher (for Vercel serverless environment)
        // We trigger to both sender and receiver channels
        await this.pusherService.trigger(receiverId, 'receive_message', message);
        await this.pusherService.trigger(senderId, 'receive_message', message);

        return { event: 'message_sent', data: message };
    }

    @SubscribeMessage('join_room')
    handleJoinRoom(client: Socket, userId: string) {
        client.join(userId);
        client.data.userId = userId;
        
        // If it's an admin-placeholder join (from admin side), join the admin-room
        if (userId === 'admin-placeholder' || userId.startsWith('admin')) {
            client.join('admin-room');
            this.logger.log(`Client ${client.id} joined admin-room`);
        }
        
        this.logger.log(`Client ${client.id} joined room ${userId}`);
    }

    afterInit(server: Server) {
        this.logger.log('Init');
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
        // Log query params if any
        this.logger.log(`Connection query: ${JSON.stringify(client.handshake.query)}`);
    }
}
