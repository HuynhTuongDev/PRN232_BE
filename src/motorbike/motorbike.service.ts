import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMotorbikeDto, UpdateMotorbikeDto, MotorbikeFilterDto } from '@goride/shared';

@Injectable()
export class MotorbikeService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateMotorbikeDto) {
        const motorbike = await this.prisma.motorbike.create({
            data: {
                ...data,
                pricePerDay: data.pricePerDay.toString() as any, // Handle Decimal
            },
        });
        return { motorbike };
    }

    async update(id: string, data: UpdateMotorbikeDto) {
        const motorbike = await this.prisma.motorbike.update({
            where: { id },
            data: {
                ...data,
                pricePerDay: data.pricePerDay ? data.pricePerDay.toString() as any : undefined,
            },
        });
        return { motorbike };
    }

    async delete(id: string) {
        await this.prisma.motorbike.delete({
            where: { id },
        });
        return { success: true, message: 'Xóa xe thành công' };
    }

    async findById(id: string) {
        const motorbike = await this.prisma.motorbike.findUnique({
            where: { id },
        });

        if (!motorbike) {
            throw new NotFoundException('Không tìm thấy xe');
        }

        return { motorbike };
    }

    async findAll(filters: MotorbikeFilterDto) {
        const { page = 1, limit = 10, type, status, minPrice, maxPrice, search } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (type) where.type = type;
        if (status) where.status = status;
        if (minPrice || maxPrice) {
            where.pricePerDay = {};
            if (minPrice) where.pricePerDay.gte = minPrice;
            if (maxPrice) where.pricePerDay.lte = maxPrice;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { licensePlate: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [motorbikes, total] = await Promise.all([
            this.prisma.motorbike.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.motorbike.count({ where }),
        ]);

        return {
            motorbikes,
            total,
            page,
            limit,
        };
    }
}
