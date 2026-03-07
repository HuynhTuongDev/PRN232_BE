import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
    ValidationPipe,
    UsePipes,
    UseInterceptors,
    UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto, ApiResponse, UserRole } from '../shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SupabaseService } from '../shared/supabase/supabase.service';

@Controller('blogs')
export class BlogController {
    constructor(
        private readonly blogService: BlogService,
        private readonly supabaseService: SupabaseService
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<ApiResponse> {
        try {
            const blogs = await this.blogService.findAll();
            return {
                success: true,
                data: blogs,
                message: 'Lấy danh sách bài viết thành công',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Không thể lấy danh sách bài viết',
            };
        }
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string): Promise<ApiResponse> {
        try {
            const result = await this.blogService.findById(id);
            return {
                success: true,
                data: result.blog,
                message: 'Lấy chi tiết bài viết thành công',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Không tìm thấy bài viết',
            };
        }
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async create(
        @Body() createBlogDto: CreateBlogDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<ApiResponse> {
        try {
            if (!file && !createBlogDto.image) {
                return {
                    success: false,
                    error: 'Vui lòng cung cấp hình ảnh hoặc tải lên tập tin',
                };
            }

            if (file) {
                const url = await this.supabaseService.uploadImage(file, undefined, 'blogs');
                createBlogDto.image = url;
            }
            const result = await this.blogService.create(createBlogDto);
            return {
                success: true,
                data: result.blog,
                message: 'Tạo bài viết mới thành công',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Tạo bài viết thất bại',
            };
        }
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async update(
        @Param('id') id: string,
        @Body() updateBlogDto: UpdateBlogDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<ApiResponse> {
        try {
            if (file) {
                const url = await this.supabaseService.uploadImage(file, undefined, 'blogs');
                updateBlogDto.image = url;
            }
            const result = await this.blogService.update(id, updateBlogDto);
            return {
                success: true,
                data: result.blog,
                message: 'Cập nhật bài viết thành công',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Cập nhật bài viết thất bại',
            };
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string): Promise<ApiResponse> {
        try {
            const result = await this.blogService.delete(id);
            return {
                success: true,
                message: result.message,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Xóa bài viết thất bại',
            };
        }
    }
}

