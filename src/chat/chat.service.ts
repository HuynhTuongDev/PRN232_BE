import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    async sendMessage(data: { senderId?: string; receiverId?: string; content: string; isAI?: boolean }) {
        const receiverId = data.receiverId === 'admin-placeholder' ? null : data.receiverId;
        const senderId = data.senderId === 'admin-placeholder' ? null : data.senderId;
        
        console.log(`[ChatService] Saving message: sender=${senderId}, receiver=${receiverId}, content=${data.content}`);
        
        return (this.prisma as any).chatMessage.create({
            data: {
                senderId: senderId,
                receiverId: receiverId,
                content: data.content,
                isAI: data.isAI || false,
            },
            include: {
                sender: { select: { id: true, name: true } },
                receiver: { select: { id: true, name: true } },
            }
        });
    }

    async getMessagesBetween(selfId: string, targetId: string) {
        console.log(`[ChatService] Getting messages between: self=${selfId}, target=${targetId}`);
        // If target is admin-placeholder, the selfId (customer) wants their conversation with admin
        if (targetId === 'admin-placeholder') {
// ... existing logic ...
            return (this.prisma as any).chatMessage.findMany({
                where: {
                    OR: [
                        { senderId: selfId, receiverId: null },
                        { senderId: null, receiverId: selfId },
                    ],
                },
                orderBy: { createdAt: 'asc' },
            });
        }

        // Admin (selfId/null) wants conversation with a specific customer (targetId)
        return (this.prisma as any).chatMessage.findMany({
            where: {
                OR: [
                    { senderId: targetId, receiverId: null },
                    { senderId: null, receiverId: targetId },
                ],
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async getAdminContacts() {
        const usersWithMessages = await (this.prisma as any).user.findMany({
            where: {
                OR: [
                    { sentMessages: { some: {} } },
                    { receivedMessages: { some: {} } },
                ],
                role: 'CUSTOMER',
            },
            include: {
                sentMessages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                receivedMessages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });

        return usersWithMessages.map((user: any) => {
            const lastSent = user.sentMessages[0];
            const lastReceived = user.receivedMessages[0];
            const lastMsg = (!lastSent || (lastReceived && lastReceived.createdAt > lastSent.createdAt)) 
                ? lastReceived 
                : lastSent;

            return {
                id: user.id,
                name: user.name,
                lastMessage: lastMsg?.content || '',
                time: lastMsg?.createdAt,
                unread: 0,
                online: false,
            };
        });
    }
}
