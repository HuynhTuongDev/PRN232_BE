import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLocationDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên địa điểm không được để trống' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'Số lượng xe không được để trống' })
    count: string;

    @IsString()
    @IsNotEmpty({ message: 'Hình ảnh không được để trống' })
    image: string;
}

export class UpdateLocationDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    count?: string;

    @IsString()
    @IsOptional()
    image?: string;
}
