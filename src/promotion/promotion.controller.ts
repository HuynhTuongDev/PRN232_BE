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
import { PromotionService } from './promotion.service';
import { CreatePromotionDto, UpdatePromotionDto, ApiResponse, UserRole } from '../shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SupabaseService } from '../shared/supabase/supabase.service';

@Controller('promotions')
export class PromotionController {
    constructor(
        private readonly promotionService: PromotionService,
        private readonly supabaseService: SupabaseService
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<ApiResponse> {
        try {
            const promotions = await this.promotionService.findAll();
            return {
                success: true,
                data: promotions,
                message: 'Lấy danh sách ưu đãi thành công',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Không thể lấy danh sách ưu đãi',
            };
        }
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string): Promise<ApiResponse> {
        try {
            const result = await this.promotionService.findById(id);
            return {
                success: true,
                data: result.promotion,
                message: 'Lấy chi tiết ưu đãi thành công',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Không tìm thấy chương trình ưu đãi',
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
        @Body() dto: CreatePromotionDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<ApiResponse> {
        try {
            if (!file && !dto.image) {
                return {
                    success: false,
                    error: 'Vui lòng cung cấp hình ảnh hoặc tải lên tập tin',
                };
            }

            if (file) {
                const url = await this.supabaseService.uploadImage(file, undefined, 'promotions');
                dto.image = url;
            }
            const result = await this.promotionService.create(dto);
            return {
                success: true,
                data: result.promotion,
                message: 'Tạo chương trình ưu đãi mới thành công',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Tạo chương trình ưu đãi thất bại',
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
        @UploadedFile() file: Express.Multer.File,
        @Body() updatePromotionDto: UpdatePromotionDto,
    ): Promise<ApiResponse> {
        try {
            // Lấy thông tin cũ
            const { promotion: oldPromo } = await this.promotionService.findById(id);

            if (file) {
                const url = await this.supabaseService.uploadImage(file, undefined, 'promotions');
                updatePromotionDto.image = url;

                // Xóa ảnh cũ trên Supabase
                if (oldPromo.image && oldPromo.image.includes('supabase.co')) {
                    await this.supabaseService.deleteImage(oldPromo.image, 'images');
                }
            }

            const result = await this.promotionService.update(id, updatePromotionDto);
            return {
                success: true,
                data: result.promotion,
                message: 'Cập nhật chương trình ưu đãi thành công',
            };
        } catch (error) {
            return {
                success: false,
                error: error.details || error.message || 'Cập nhật chương trình ưu đãi thất bại',
            };
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string): Promise<ApiResponse> {
        try {
            // Lấy thông tin trước khi xóa
            const { promotion } = await this.promotionService.findById(id);

            const result = await this.promotionService.delete(id);

            // Xóa ảnh trên Supabase
            if (promotion.image && promotion.image.includes('supabase.co')) {
                await this.supabaseService.deleteImage(promotion.image, 'images');
            }

            return {
                success: true,
                message: result.message,
            };
        } catch (error) {
            return {
                success: false,
                error: error.details || error.message || 'Xóa chương trình ưu đãi thất bại',
            };
        }
    }
}
