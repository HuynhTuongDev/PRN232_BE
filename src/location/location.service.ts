import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.location.findMany({
            orderBy: { id: 'asc' },
        });
    }

    async createMany(data: any[]) {
        return this.prisma.location.createMany({
            data,
            skipDuplicates: true,
        });
    }

    async findOne(id: number) {
        return this.prisma.location.findUnique({
            where: { id },
        });
    }
}
