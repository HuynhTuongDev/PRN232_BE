import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { RentalStatus } from '../types';

export class CreateRentalDto {
    @IsString({ message: 'ID xe máy phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'ID xe máy không được để trống' })
    motorbikeId: string;

    @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
    @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
    startDate: string;

    @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
    @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
    endDate: string;

    @IsString({ message: 'Địa điểm nhận xe phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Địa điểm nhận xe không được để trống' })
    pickupLocation: string;

    @IsString({ message: 'Địa điểm trả xe phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Địa điểm trả xe không được để trống' })
    returnLocation: string;

    @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
    @IsOptional()
    notes?: string;
}

export class UpdateRentalStatusDto {
    @IsEnum(RentalStatus, { message: 'Trạng thái đơn thuê không hợp lệ' })
    @IsNotEmpty({ message: 'Trạng thái không được để trống' })
    status: RentalStatus;
}

export class RentalFilterDto {
    @IsNumber({}, { message: 'Trang phải là một số' })
    @IsOptional()
    @Min(1, { message: 'Trang phải lớn hơn hoặc bằng 1' })
    page?: number = 1;

    @IsNumber({}, { message: 'Giới hạn phải là một số' })
    @IsOptional()
    @Min(1, { message: 'Giới hạn phải lớn hơn hoặc bằng 1' })
    limit?: number = 10;

    @IsEnum(RentalStatus, { message: 'Trạng thái không hợp lệ' })
    @IsOptional()
    status?: RentalStatus;
}
