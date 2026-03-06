import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('create-payment-link')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: false, whitelist: false }))
    async createPaymentLink(@Body() body: any) {
        const rentalId = body?.rentalId ?? body?.rental_id ?? body?.id;
        return this.paymentService.createPaymentLink(rentalId);
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: false, whitelist: false }))
    async handleWebhook(@Body() body: any) {
        return this.paymentService.handleWebhook(body);
    }

    @Get('detail/:orderCode')
    async getPaymentDetail(@Param('orderCode') orderCode: string) {
        return this.paymentService.getPaymentDetail(orderCode);
    }

    // PayOS redirect sau khi thanh toán thành công
    @Get('success')
    async paymentSuccess(
        @Query('code') code: string,
        @Query('id') id: string,
        @Query('cancel') cancel: string,
        @Query('status') status: string,
        @Query('orderCode') orderCode: string,
    ) {
        // Cập nhật trạng thái payment trong DB nếu thanh toán thành công
        if (code === '00' && status === 'PAID') {
            try {
                await this.paymentService.updatePaymentStatusByOrderCode(Number(orderCode), 'PAID');
            } catch (e) {
                // Log nhưng không throw để user vẫn thấy trang thành công
            }
        }

        return {
            success: true,
            message: 'Thanh toán thành công!',
            data: { code, id, status, orderCode, cancel },
        };
    }

    // PayOS redirect khi huỷ thanh toán
    @Get('cancel')
    async paymentCancel(
        @Query('code') code: string,
        @Query('id') id: string,
        @Query('orderCode') orderCode: string,
    ) {
        return {
            success: false,
            message: 'Thanh toán đã bị huỷ.',
            data: { code, id, orderCode },
        };
    }
}
