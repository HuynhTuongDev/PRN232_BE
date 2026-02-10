import { IsString, IsNotEmpty, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateBlogDto {
    @IsString({ message: 'Tiêu đề phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
    @MaxLength(200, { message: 'Tiêu đề không được vượt quá 200 ký tự' })
    title: string;

    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
    @MaxLength(500, { message: 'Mô tả không được vượt quá 500 ký tự' })
    description?: string;

    @IsString({ message: 'Nội dung phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Nội dung không được để trống' })
    content: string;

    @IsUrl({}, { message: 'Đường dẫn hình ảnh không hợp lệ' })
    @IsNotEmpty({ message: 'Hình ảnh không được để trống' })
    image: string;

    @IsOptional()
    @IsString({ message: 'Thẻ phải là chuỗi ký tự' })
    tag?: string;

    @IsOptional()
    @IsString({ message: 'Tác giả phải là chuỗi ký tự' })
    author?: string;
}

export class UpdateBlogDto {
    @IsOptional()
    @IsString({ message: 'Tiêu đề phải là chuỗi ký tự' })
    @MaxLength(200, { message: 'Tiêu đề không được vượt quá 200 ký tự' })
    title?: string;

    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
    @MaxLength(500, { message: 'Mô tả không được vượt quá 500 ký tự' })
    description?: string;

    @IsOptional()
    @IsString({ message: 'Nội dung phải là chuỗi ký tự' })
    content?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Đường dẫn hình ảnh không hợp lệ' })
    image?: string;

    @IsOptional()
    @IsString({ message: 'Thẻ phải là chuỗi ký tự' })
    tag?: string;

    @IsOptional()
    @IsString({ message: 'Tác giả phải là chuỗi ký tự' })
    author?: string;
}
