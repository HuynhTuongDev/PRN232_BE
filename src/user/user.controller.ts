import {
    Controller,
    Get,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    ValidationPipe,
    UsePipes,
    Req
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ApiResponse } from '@goride/shared';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    /**
     * Get current authenticated user info
     */
    @Get('profile')
    @HttpCode(HttpStatus.OK)
    async getProfile(@Req() req: any): Promise<ApiResponse> {
        try {
            const userId = req.user.sub;
            const result: { user: any } = await this.userService.findById(userId);
            return {
                success: true,
                data: result.user,
                message: 'Lấy thông tin cá nhân thành công',
            };
        } catch (error) {
            const errorMsg = error.details || error.message || 'Không thể lấy thông tin cá nhân';
            return {
                success: false,
                error: errorMsg,
                message: errorMsg,
            };
        }
    }

    /**
     * Get user by ID (Admin only)
     */
    @Get(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string): Promise<ApiResponse> {
        try {
            const result: { user: any } = await this.userService.findById(id);
            return {
                success: true,
                data: result.user,
                message: 'Lấy thông tin người dùng thành công',
            };
        } catch (error) {
            const errorMsg = error.details || error.message || 'Không tìm thấy người dùng';
            return {
                success: false,
                error: errorMsg,
                message: errorMsg,
            };
        }
    }

    /**
     * List all users (Admin only)
     */
    @Get()
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async findAll(
        @Query('page') page: any = 1,
        @Query('limit') limit: any = 10,
        @Query('search') search?: string,
    ): Promise<ApiResponse> {
        try {
            const pageNum = Number(page) || 1;
            const limitNum = Number(limit) || 10;

            const result = await this.userService.list(pageNum, limitNum, search);

            return {
                success: true,
                data: result,
                message: 'Lấy danh sách người dùng thành công',
            };
        } catch (error) {
            console.error('[UserController] findAll error:', error);
            return {
                success: false,
                error: error.details || error.message || 'Không thể lấy danh sách người dùng',
            };
        }
    }

    /**
     * Update user (Admin or Owner)
     */
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() updateData: any,
    ): Promise<ApiResponse> {
        try {
            const result: { user: any } = await this.userService.update(id, updateData);
            return {
                success: true,
                data: result.user,
                message: 'Cập nhật thông tin thành công',
            };
        } catch (error) {
            return {
                success: false,
                error: error.details || error.message || 'Cập nhật thất bại',
            };
        }
    }

    /**
     * Delete user (Admin only)
     */
    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async remove(@Param('id') id: string): Promise<ApiResponse> {
        try {
            const result: { message: string } = await this.userService.delete(id);
            return {
                success: true,
                message: result.message,
            };
        } catch (error) {
            return {
                success: false,
                error: error.details || error.message || 'Xóa người dùng thất bại',
            };
        }
    }
}
