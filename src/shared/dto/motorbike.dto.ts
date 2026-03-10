import {
    IsString,
    IsNotEmpty,
    IsInt,
    IsNumber,
    IsOptional,
    IsEnum,
    IsArray,
    Min,
    Max,
    MAX_LENGTH,
    MaxLength
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { MotorbikeType, MotorbikeStatus } from '../types';

/**
 * DTO for creating a new motorbike
 */
export class CreateMotorbikeDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên xe không được để trống' })
    @MaxLength(100, { message: 'Tên xe không được vượt quá 100 ký tự' })
    name: string;

    @IsEnum(MotorbikeType, { message: 'Loại xe không hợp lệ (MANUAL, SCOOTER, SEMI_AUTO)' })
    @IsNotEmpty({ message: 'Loại xe không được để trống' })
    type: MotorbikeType;

    @IsNumber({}, { message: 'Giá thuê phải là một số' })
    @Min(0, { message: 'Giá thuê không được nhỏ hơn 0' })
    @IsNotEmpty({ message: 'Giá thuê không được để trống' })
    @Type(() => Number)
    pricePerDay: number;

    @IsString()
    @IsOptional()
    @MaxLength(1000, { message: 'Mô tả không được vượt quá 1000 ký tự' })
    description?: string;

    @IsString()
    @IsNotEmpty({ message: 'Biển số xe không được để trống' })
    @MaxLength(20, { message: 'Biển số xe không được vượt quá 20 ký tự' })
    licensePlate: string;

    @IsNumber()
    @IsOptional()
    @Min(1900)
    @Max(new Date().getFullYear())
    @Type(() => Number)
    year?: number;

    @IsArray({ message: 'Danh sách hình ảnh phải là một mảng' })
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? [value] : value)
    images?: string[];

    @IsString()
    @IsOptional()
    fuelCapacity?: string;

    @IsString()
    @IsOptional()
    engineSize?: string;
}

/**
 * DTO for updating an existing motorbike
 */
export class UpdateMotorbikeDto {
    @IsString()
    @IsOptional()
    @MaxLength(100, { message: 'Tên xe không được vượt quá 100 ký tự' })
    name?: string;

    @IsEnum(MotorbikeType)
    @IsOptional()
    type?: MotorbikeType;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    pricePerDay?: number;

    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description?: string;

    @IsEnum(MotorbikeStatus)
    @IsOptional()
    status?: MotorbikeStatus;

    @IsArray()
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? [value] : value)
    images?: string[];

    @IsString()
    @IsOptional()
    @MaxLength(20)
    licensePlate?: string;

    @IsNumber()
    @IsOptional()
    @Min(1900)
    @Max(new Date().getFullYear())
    @Type(() => Number)
    year?: number;

    @IsString()
    @IsOptional()
    fuelCapacity?: string;

    @IsString()
    @IsOptional()
    engineSize?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    licensePlate?: string;

    @IsNumber()
    @IsOptional()
    @Min(1900)
    year?: number;
}

/**
 * DTO for filtering motorbikes
 */
export class MotorbikeFilterDto {
    @IsEnum(MotorbikeType)
    @IsOptional()
    type?: MotorbikeType;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    minPrice?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    maxPrice?: number;

    @IsEnum(MotorbikeStatus)
    @IsOptional()
    status?: MotorbikeStatus;

    @IsString()
    @IsOptional()
    search?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;
}
