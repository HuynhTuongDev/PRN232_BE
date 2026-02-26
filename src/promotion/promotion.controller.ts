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
    UsePipes
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto, UpdatePromotionDto, ApiResponse, UserRole } from '@goride/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('promotions')
export class PromotionController {
    constructor(private readonly promotionService: PromotionService) { }

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
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async create(@Body() dto: CreatePromotionDto): Promise<ApiResponse> {
        try {
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
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async update(@Param('id') id: string, @Body() dto: UpdatePromotionDto): Promise<ApiResponse> {
        try {
            const result = await this.promotionService.update(id, dto);
            return {
                success: true,
                data: result.promotion,
                message: 'Cập nhật chương trình ưu đãi thành công',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Cập nhật chương trình ưu đãi thất bại',
            };
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string): Promise<ApiResponse> {
        try {
            const result = await this.promotionService.delete(id);
            return {
                success: true,
                message: result.message,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Xóa chương trình ưu đãi thất bại',
            };
        }
    }
}
