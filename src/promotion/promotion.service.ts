import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto, UpdatePromotionDto } from '../shared';

@Injectable()
export class PromotionService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.promotion.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        const promotion = await this.prisma.promotion.findUnique({
            where: { id },
        });
        if (!promotion) throw new NotFoundException('Không tìm thấy chương trình ưu đãi');
        return { promotion };
    }

    async findByCode(code: string) {
        const promotion = await (this.prisma.promotion as any).findFirst({
            where: { code, isActive: true },
        });

        if (!promotion) return null;

        // Check date
        const now = new Date();
        if (promotion.startDate && new Date(promotion.startDate) > now) return null;
        if (promotion.endDate && new Date(promotion.endDate) < now) return null;

        return promotion;
    }

    async create(dto: CreatePromotionDto) {
        const promotion = await (this.prisma.promotion as any).create({
            data: {
                title: dto.title,
                description: dto.description,
                code: dto.code,
                discountType: dto.discountType,
                discountValue: dto.discountValue,
                minOrderValue: dto.minOrderValue || 0,
                badge: dto.badge,
                image: dto.image,
                isActive: dto.isActive,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            },
        });
        return { promotion };
    }

    async update(id: string, dto: UpdatePromotionDto) {
        await this.findById(id);

        const updateData: any = { ...dto };
        if (dto.startDate) updateData.startDate = new Date(dto.startDate);
        if (dto.endDate) updateData.endDate = new Date(dto.endDate);

        const promotion = await this.prisma.promotion.update({
            where: { id },
            data: updateData,
        });
        return { promotion };
    }

    async delete(id: string) {
        await this.findById(id);
        await this.prisma.promotion.delete({
            where: { id },
        });
        return { success: true, message: 'Xóa chương trình ưu đãi thành công' };
    }
}

