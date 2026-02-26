import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { RentalService } from './rental.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ApiResponse, CreateRentalDto, UpdateRentalStatusDto, RentalFilterDto } from '@goride/shared';

@Controller('rentals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RentalController {
    constructor(private readonly rentalService: RentalService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Req() req: any, @Body() createDto: CreateRentalDto): Promise<ApiResponse> {
        const userId = req.user.sub;
        const result = await this.rentalService.create({ ...createDto, userId });
        return {
            success: true,
            data: result.rental,
            message: 'Đăng ký thuê xe thành công',
        };
    }

    @Get('my')
    @HttpCode(HttpStatus.OK)
    async findMyRentals(
        @Req() req: any,
        @Query() filters: RentalFilterDto,
    ): Promise<ApiResponse> {
        const userId = req.user.sub;
        const result = await this.rentalService.listByUser(userId, Number(filters.page) || 1, Number(filters.limit) || 10);
        return {
            success: true,
            data: result,
            message: 'Lấy danh sách thuê xe của bạn thành công',
        };
    }

    @Get('all')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() filters: RentalFilterDto): Promise<ApiResponse> {
        const result = await this.rentalService.listAll(
            Number(filters.page) || 1,
            Number(filters.limit) || 10,
            filters.status,
        );
        return {
            success: true,
            data: result,
            message: 'Lấy toàn bộ danh sách thuê xe thành công',
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Req() req: any, @Param('id') id: string): Promise<ApiResponse> {
        const userId = req.user.sub;
        const userRole = req.user.role;
        const result = await this.rentalService.findById(id);

        if (result.rental.userId !== userId && userRole !== 'ADMIN') {
            return {
                success: false,
                message: 'Bạn không có quyền xem thông tin đơn thuê này',
                error: 'Bạn không có quyền xem thông tin đơn thuê này',
            };
        }

        return {
            success: true,
            data: result.rental,
            message: 'Lấy thông tin đơn thuê xe thành công',
        };
    }

    @Put(':id/status')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateStatus(
        @Param('id') id: string,
        @Body() updateDto: UpdateRentalStatusDto,
    ): Promise<ApiResponse> {
        const result = await this.rentalService.updateStatus(id, updateDto.status);
        return {
            success: true,
            data: result.rental,
            message: 'Cập nhật trạng thái đơn thuê thành công',
        };
    }
}
