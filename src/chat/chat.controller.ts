import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../shared';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('contacts')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getContacts() {
        const contacts = await this.chatService.getAdminContacts();
        return { success: true, data: contacts };
    }

    @Get('messages/:userId')
    async getMessages(@Request() req, @Param('userId') userId: string) {
        const currentUserId = req.user.id;
        const messages = await this.chatService.getMessagesBetween(currentUserId, userId);
        return { success: true, data: messages };
    }

    @Post('send')
    async sendMessage(@Request() req, @Body() body: { receiverId?: string; content: string; isAI?: boolean }) {
        const senderId = req.user.role === UserRole.ADMIN ? 'admin-placeholder' : req.user.id;
        const message = await this.chatService.sendMessage({
            senderId,
            receiverId: body.receiverId,
            content: body.content,
            isAI: body.isAI,
        });
        return { success: true, data: message };
    }
}
