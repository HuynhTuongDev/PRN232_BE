import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMotorbikeDto, UpdateMotorbikeDto, MotorbikeFilterDto } from '../shared';

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
        console.log(`Update Motorbike ${id} with data:`, JSON.stringify(data));
        const motorbike = await this.prisma.motorbike.update({
            where: { id },
            data: {
                ...data,
                pricePerDay: data.pricePerDay !== undefined ? data.pricePerDay.toString() as any : undefined,
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
        const parsedPage = parseInt(filters.page as any, 10) || 1;
        const parsedLimit = parseInt(filters.limit as any, 10) || 10;
        const { type, status, minPrice, maxPrice, search } = filters;
        const skip = (parsedPage - 1) * parsedLimit;

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
                take: parsedLimit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.motorbike.count({ where }),
        ]);

        return {
            motorbikes,
            total,
            page: parsedPage,
            limit: parsedLimit,
        };
    }
}

