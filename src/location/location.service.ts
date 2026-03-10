import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto, UpdateLocationDto } from '../shared/dto/location.dto';

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
        const location = await this.prisma.location.findUnique({
            where: { id },
        });
        if (!location) {
            throw new NotFoundException(`Location with ID ${id} not found`);
        }
        return location;
    }

    async create(data: CreateLocationDto) {
        return this.prisma.location.create({
            data,
        });
    }

    async update(id: number, data: UpdateLocationDto) {
        await this.findOne(id); // Check existence
        return this.prisma.location.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        await this.findOne(id); // Check existence
        return this.prisma.location.delete({
            where: { id },
        });
    }
}
