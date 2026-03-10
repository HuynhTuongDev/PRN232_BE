import { Controller, Post, Get, Put, Body, Param, Query, HttpCode, HttpStatus, UsePipes, ValidationPipe, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../shared';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('create-payment-link')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: false, whitelist: false }))
    async createPaymentLink(@Body() body: any) {
        const rentalId = body?.rentalId ?? body?.rental_id ?? body?.id;
        const result = await this.paymentService.createPaymentLink(rentalId);
        return {
            success: true,
            data: result,
            message: 'Tạo liên kết thanh toán thành công',
        };
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
        @Res() res: Response,
    ) {
        // Cập nhật trạng thái payment trong DB nếu thanh toán thành công
        if (code === '00' && status === 'PAID') {
            try {
                await this.paymentService.updatePaymentStatusByOrderCode(Number(orderCode), 'PAID');
            } catch (e) {
                // Log nhưng không throw để user vẫn thấy trang thành công
            }
        }

        // Redirect về frontend success page (Port 3002)
        return res.redirect(`http://localhost:3002/payment/success?orderCode=${orderCode}&code=${code}&status=${status}`);
    }

    // PayOS redirect khi huỷ thanh toán
    @Get('cancel')
    async paymentCancel(
        @Query('code') code: string,
        @Query('id') id: string,
        @Query('orderCode') orderCode: string,
        @Res() res: Response,
    ) {
        // Redirect về frontend cancel page (Port 3002)
        return res.redirect(`http://localhost:3002/payment/cancel?orderCode=${orderCode}&code=${code}`);
    }

    @Get('all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async findAll() {
        const payments = await this.paymentService.findAll();
        return {
            success: true,
            data: payments,
            message: 'Lấy danh sách thanh toán thành công',
        };
    }

    @Put(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        const result = await this.paymentService.updateStatus(id, body.status);
        return {
            success: true,
            data: result,
            message: 'Cập nhật trạng thái thanh toán thành công',
        };
    }
}
