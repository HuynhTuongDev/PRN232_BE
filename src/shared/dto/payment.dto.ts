import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PaymentMethod } from '../types';

export class CreatePaymentDto {
    @IsString()
    rentalId: string;

    @IsEnum(PaymentMethod)
    method: string;

    @IsOptional()
    @IsString()
    transactionId?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdatePaymentStatusDto {
    @IsString()
    status: string;

    @IsOptional()
    @IsString()
    transactionDate?: string;
}
