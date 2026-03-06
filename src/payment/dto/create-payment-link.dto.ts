import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePaymentLinkDto {
    @IsString()
    @IsNotEmpty()
    rentalId: string;
}
