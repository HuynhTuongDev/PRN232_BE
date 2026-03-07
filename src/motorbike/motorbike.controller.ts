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
    UsePipes,
    UseInterceptors,
    UploadedFiles,
    UseFilters,
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MotorbikeService } from './motorbike.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ApiResponse, CreateMotorbikeDto, UpdateMotorbikeDto, MotorbikeFilterDto } from '../shared';
import { SupabaseService } from '../shared/supabase/supabase.service';

@Injectable()
export class ParseFormDataInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        if (request.body) {
            if (request.body.pricePerDay) {
                request.body.pricePerDay = parseFloat(request.body.pricePerDay);
            }
            if (request.body.year) {
                request.body.year = parseInt(request.body.year);
            }
            if (request.body.images && typeof request.body.images === 'string') {
                request.body.images = [request.body.images];
            }
            // NestJS/Multer sometimes puts multiple 'images' fields as an array automatically
            // but we need to ensure it's handled if it's 'images[]' in FormData
            if (request.body['images[]']) {
                request.body.images = Array.isArray(request.body['images[]'])
                    ? request.body['images[]']
                    : [request.body['images[]']];
                delete request.body['images[]'];
            }
        }
        return next.handle();
    }
}

@Controller('motorbikes')
export class MotorbikeController {
    constructor(
        private readonly motorbikeService: MotorbikeService,
        private readonly supabaseService: SupabaseService
    ) { }

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
    @UseInterceptors(FilesInterceptor('files', 10), ParseFormDataInterceptor)
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async create(
        @Body() createDto: CreateMotorbikeDto,
        @UploadedFiles() files: Express.Multer.File[]
    ): Promise<ApiResponse> {
        try {
            // Upload images to Supabase if any
            if (files && files.length > 0) {
                const uploadPromises = files.map(file =>
                    this.supabaseService.uploadImage(file, undefined, 'motorbikes')
                );
                const urls = await Promise.all(uploadPromises);
                createDto.images = [...(createDto.images || []), ...urls];
            }

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
    @UseInterceptors(FilesInterceptor('files', 10), ParseFormDataInterceptor)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateMotorbikeDto,
        @UploadedFiles() files: Express.Multer.File[]
    ): Promise<ApiResponse> {
        try {
            // Upload new images to Supabase if any
            if (files && files.length > 0) {
                const uploadPromises = files.map(file =>
                    this.supabaseService.uploadImage(file, undefined, 'motorbikes')
                );
                const urls = await Promise.all(uploadPromises);

                // Nếu Frontend gửi lên mảng ảnh cũ, chúng ta nối thêm ảnh mới vào
                // Nếu không, chúng ta chỉ lấy ảnh mới
                updateDto.images = [...(updateDto.images || []), ...urls];
            }

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

