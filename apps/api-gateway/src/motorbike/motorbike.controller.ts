import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    ValidationPipe,
    UsePipes
} from '@nestjs/common';
import { MotorbikeService } from './motorbike.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ApiResponse, CreateMotorbikeDto, UpdateMotorbikeDto, MotorbikeFilterDto } from '@goride/shared';

@Controller('motorbikes')
export class MotorbikeController {
    constructor(private readonly motorbikeService: MotorbikeService) { }

    /**
     * Search and list motorbikes (Public)
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() filters: MotorbikeFilterDto): Promise<ApiResponse> {
        try {
            const result = await this.motorbikeService.findAll(filters);
            return {
                success: true,
                data: result,
                message: 'Lấy danh sách xe thành công',
            };
        } catch (error) {
            return {
                success: false,
                error: error.details || error.message || 'Không thể lấy danh sách xe',
            };
        }
    }

    /**
     * Get motorbike by ID (Public)
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string): Promise<ApiResponse> {
        try {
            const result: { motorbike: any } = await this.motorbikeService.findById(id);
            return {
                success: true,
                data: result.motorbike,
                message: 'Lấy thông tin xe thành công',
            };
        } catch (error) {
            return {
                success: false,
                error: error.details || error.message || 'Không tìm thấy xe',
            };
        }
    }

    /**
     * Create new motorbike (Admin only)
     */
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async create(@Body() createDto: CreateMotorbikeDto): Promise<ApiResponse> {
        try {
            const result: { motorbike: any } = await this.motorbikeService.create(createDto);
            return {
                success: true,
                data: result.motorbike,
                message: 'Thêm xe mới thành công',
            };
        } catch (error) {
            return {
                success: false,
                error: error.details || error.message || 'Thêm xe mới thất bại',
            };
        }
    }

    /**
     * Update motorbike (Admin only)
     */
    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateMotorbikeDto,
    ): Promise<ApiResponse> {
        try {
            const result: { motorbike: any } = await this.motorbikeService.update(id, updateDto);
            return {
                success: true,
                data: result.motorbike,
                message: 'Cập nhật thông tin xe thành công',
            };
        } catch (error) {
            return {
                success: false,
                error: error.details || error.message || 'Cập nhật xe thất bại',
            };
        }
    }

    /**
     * Delete motorbike (Admin only)
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string): Promise<ApiResponse> {
        try {
            const result: { message: string } = await this.motorbikeService.delete(id);
            return {
                success: true,
                message: result.message,
            };
        } catch (error) {
            return {
                success: false,
                error: error.details || error.message || 'Xóa xe thất bại',
            };
        }
    }
}
