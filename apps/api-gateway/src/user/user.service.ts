import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        const { password, ...result } = user;
        return { user: result };
    }

    async update(id: string, data: any) {
        const user = await this.prisma.user.update({
            where: { id },
            data,
        });

        const { password, ...result } = user;
        return { user: result };
    }

    async delete(id: string) {
        await this.prisma.user.delete({
            where: { id },
        });
        return { success: true, message: 'Xóa người dùng thành công' };
    }

    async list(page: number, limit: number, search?: string) {
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as any } },
                    { email: { contains: search, mode: 'insensitive' as any } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        const usersWithoutPassword = users.map(({ password, ...u }) => u);

        return {
            users: usersWithoutPassword,
            total,
            page,
            limit,
        };
    }
}
