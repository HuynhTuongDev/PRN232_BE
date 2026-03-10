import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateDays, RentalStatus } from '../shared';

@Injectable()
export class RentalService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        const { userId, motorbikeId, startDate, endDate, pickupLocation, returnLocation, notes } = data;

        // Check if motorbike exists and is available
        const motorbike = await this.prisma.motorbike.findUnique({
            where: { id: motorbikeId },
        });

        if (!motorbike) {
            throw new NotFoundException('Không tìm thấy xe');
        }

        if (motorbike.status !== 'AVAILABLE') {
            throw new BadRequestException('Xe hiện không có sẵn để thuê');
        }

        // Calculate days and total price
        const days = calculateDays(new Date(startDate), new Date(endDate));
        if (days <= 0) {
            throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
        }

        const totalPrice = Number(motorbike.pricePerDay) * days;

        try {
            const rental = await this.prisma.$transaction(async (tx) => {
                // Create rental
                const newRental = await tx.rental.create({
                    data: {
                        userId,
                        motorbikeId,
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                        pickupLocation,
                        returnLocation,
                        totalPrice,
                        numberOfDays: days,
                        notes,
                        status: 'PENDING',
                    },
                });

                // Update motorbike status
                await tx.motorbike.update({
                    where: { id: motorbikeId },
                    data: { status: 'RENTED' },
                });

                return newRental;
            });

            return { rental };
        } catch (error) {
            console.error('Create rental error:', error);
            throw new BadRequestException('Không thể tạo đơn thuê xe');
        }
    }

    async findById(id: string) {
        const rental = await this.prisma.rental.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                motorbike: true,
                payments: true,
            },
        });

        if (!rental) {
            throw new NotFoundException('Không tìm thấy đơn thuê xe');
        }

        return { rental };
    }

    async updateStatus(id: string, status: any, metadata?: any) {
        const rental = await this.prisma.rental.findUnique({
            where: { id },
        });

        if (!rental) {
            throw new NotFoundException('Không tìm thấy đơn thuê xe');
        }

        // Validate state transitions
        const currentStatus = rental.status;

        if (status === 'ONGOING' && currentStatus !== 'CONFIRMED') {
            throw new BadRequestException('Chỉ có thể bàn giao xe cho đơn đã xác nhận/thanh toán');
        }

        if (status === 'COMPLETED' && currentStatus !== 'ONGOING') {
            throw new BadRequestException('Chỉ có thể thu hồi xe cho đơn đang trong quá trình thuê');
        }

        const data: any = { status };

        // Handle Handover Metadata
        if (status === 'ONGOING' && metadata) {
            data.handoverKm = Number(metadata.km);
            data.handoverFuel = Number(metadata.fuel);
            data.handoverNote = metadata.note;
            data.handoverImages = metadata.images;
        }

        // Handle Return Metadata (at completion)
        if (status === 'COMPLETED' && metadata) {
            data.returnKm = Number(metadata.km);
            data.returnFuel = Number(metadata.fuel);
            data.returnNote = metadata.note;
            data.returnImages = metadata.images;
        }

        const updatedRental = await this.prisma.rental.update({
            where: { id },
            data,
        });

        // If cancelled or completed, make motorbike available again
        if (status === 'CANCELLED' || status === 'COMPLETED') {
            await this.prisma.motorbike.update({
                where: { id: updatedRental.motorbikeId },
                data: { status: 'AVAILABLE' },
            });
        }

        if (status === 'ONGOING') {
            await this.prisma.motorbike.update({
                where: { id: updatedRental.motorbikeId },
                data: { status: 'RENTED' },
            });
        }

        return { rental: updatedRental };
    }

    async updateMetadata(id: string, metadata: any) {
        return this.prisma.rental.update({
            where: { id },
            data: {
                returnKm: metadata.km ? Number(metadata.km) : undefined,
                returnFuel: metadata.fuel ? Number(metadata.fuel) : undefined,
                returnNote: metadata.note || undefined,
                returnImages: metadata.images || undefined,
            }
        });
    }

    async listByUser(userId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [rentals, total] = await Promise.all([
            this.prisma.rental.findMany({
                where: { userId },
                include: { motorbike: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.rental.count({ where: { userId } }),
        ]);

        return {
            rentals,
            total,
            page,
            limit,
        };
    }

    async listAll(page: number, limit: number, status?: RentalStatus) {
        const skip = (page - 1) * limit;
        const where: any = {};
        if (status) {
            where.status = status;
        }

        try {
            const [rentals, total] = await Promise.all([
                this.prisma.rental.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                        motorbike: true,
                        payments: true,
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                this.prisma.rental.count({ where }),
            ]);

            return {
                rentals,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.error('Rental listAll Error:', error);
            throw error; // Let the global filter handle it with the improved message
        }
    }
}

