import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PayOS } from '@payos/node';

@Injectable()
export class PaymentService {
    private payOS: PayOS;
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        const clientId = this.configService.get<string>('PAYOS_CLIENT_ID');
        const apiKey = this.configService.get<string>('PAYOS_API_KEY');
        const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');

        if (!clientId || !apiKey || !checksumKey) {
            this.logger.error('PayOS configuration is missing!');
        }

        this.payOS = new PayOS({
            clientId,
            apiKey,
            checksumKey,
        });
    }

    async createPaymentLink(rentalId: string) {
        if (!rentalId) {
            throw new BadRequestException('rentalId là bắt buộc');
        }
        const rental = await this.prisma.rental.findUnique({
            where: { id: rentalId },
            include: {
                motorbike: true,
                user: true
            },
        });

        if (!rental) {
            throw new NotFoundException('Không tìm thấy đơn thuê xe');
        }

        // Generate a unique numeric order code (must be numeric for PayOS)
        const orderCode = Date.now();

        const paymentData: any = {
            orderCode,
            amount: Number(rental.totalPrice),
            description: `Rent ${rental.motorbike.name.substring(0, 20)}`,
            items: [
                {
                    name: rental.motorbike.name,
                    quantity: 1,
                    price: Number(rental.totalPrice),
                },
            ],
            returnUrl: this.configService.get<string>('PAYOS_RETURN_URL'),
            cancelUrl: this.configService.get<string>('PAYOS_CANCEL_URL'),
        };

        try {
            const paymentLinkRes = await this.payOS.paymentRequests.create(paymentData);

            // Create or update payment record
            await this.prisma.payment.upsert({
                where: { rentalId },
                update: {
                    transactionId: String(orderCode),
                    amount: rental.totalPrice,
                    status: 'PENDING',
                },
                create: {
                    rentalId,
                    amount: rental.totalPrice,
                    method: 'BANK_TRANSFER',
                    status: 'PENDING',
                    transactionId: String(orderCode),
                },
            });

            return paymentLinkRes;
        } catch (error) {
            this.logger.error('PayOS Create Link Error:', error);
            throw new BadRequestException(error.message || 'Không thể tạo liên kết thanh toán');
        }
    }

    async handleWebhook(body: any) {
        try {
            const verifiedData = await this.payOS.webhooks.verify(body);
            const { orderCode, code } = verifiedData;

            if (code === '00') {
                const payment = await this.prisma.payment.findUnique({
                    where: { transactionId: String(orderCode) },
                });

                if (payment && payment.status !== 'COMPLETED') {
                    await this.prisma.$transaction(async (tx) => {
                        await tx.payment.update({
                            where: { id: payment.id },
                            data: {
                                status: 'COMPLETED',
                                transactionDate: new Date(),
                            },
                        });

                        await tx.rental.update({
                            where: { id: payment.rentalId },
                            data: { status: 'CONFIRMED' },
                        });
                    });
                    this.logger.log(`Payment confirmed for order: ${orderCode}`);
                }
            }

            return { success: true };
        } catch (error) {
            this.logger.error('PayOS Webhook Error:', error);
            return { success: false, message: error.message };
        }
    }

    async getPaymentDetail(orderCode: string) {
        try {
            const detail = await this.payOS.paymentRequests.get(Number(orderCode));
            return detail;
        } catch (error) {
            this.logger.error('PayOS Get Detail Error:', error);
            throw new BadRequestException('Không thể lấy thông tin thanh toán');
        }
    }

    async confirmWebhook(webhookUrl: string) {
        try {
            return await this.payOS.webhooks.confirm(webhookUrl);
        } catch (error) {
            this.logger.error('PayOS Confirm Webhook Error:', error);
            throw new BadRequestException('Không thể xác nhận webhook');
        }
    }

    async updatePaymentStatusByOrderCode(orderCode: number, payosStatus: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { transactionId: String(orderCode) },
        });

        if (!payment) return;

        // Map PayOS status 'PAID' to Prisma Enum 'COMPLETED'
        const dbStatus = payosStatus === 'PAID' ? 'COMPLETED' : 'FAILED';

        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: dbStatus },
        });

        // Cập nhật rental thành CONFIRMED nếu thanh toán thành công
        if (dbStatus === 'COMPLETED') {
            await this.prisma.rental.update({
                where: { id: payment.rentalId },
                data: { status: 'CONFIRMED' },
            });
        }
    }
}

