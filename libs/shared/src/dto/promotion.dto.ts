import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, IsUrl, MaxLength } from 'class-validator';

export class CreatePromotionDto {
    @IsString({ message: 'Tiêu đề phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
    @MaxLength(200, { message: 'Tiêu đề không được vượt quá 200 ký tự' })
    title: string;

    @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Mô tả không được để trống' })
    description: string;

    @IsUrl({}, { message: 'Đường dẫn hình ảnh không hợp lệ' })
    @IsNotEmpty({ message: 'Hình ảnh không được để trống' })
    image: string;

    @IsOptional()
    @IsString({ message: 'Nhãn phải là chuỗi ký tự' })
    badge?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
    endDate?: string;

    @IsOptional()
    @IsBoolean({ message: 'Trạng thái hoạt động phải là kiểu boolean' })
    isActive?: boolean;
}

export class UpdatePromotionDto {
    @IsOptional()
    @IsString({ message: 'Tiêu đề phải là chuỗi ký tự' })
    @MaxLength(200, { message: 'Tiêu đề không được vượt quá 200 ký tự' })
    title?: string;

    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
    description?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Đường dẫn hình ảnh không hợp lệ' })
    image?: string;

    @IsOptional()
    @IsString({ message: 'Nhãn phải là chuỗi ký tự' })
    badge?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
    endDate?: string;

    @IsOptional()
    @IsBoolean({ message: 'Trạng thái hoạt động phải là kiểu boolean' })
    isActive?: boolean;
}
