import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto, UpdateLocationDto } from '../shared/dto/location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../shared';

@Controller('locations')
export class LocationController {
    constructor(private readonly locationService: LocationService) { }

    @Get()
    async findAll() {
        const locations = await this.locationService.findAll();
        return {
            success: true,
            data: locations,
            message: 'Lấy danh sách địa điểm thành công',
        };
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const location = await this.locationService.findOne(id);
        return {
            success: true,
            data: location,
            message: 'Lấy thông tin địa điểm thành công',
        };
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async create(@Body() createLocationDto: CreateLocationDto) {
        const location = await this.locationService.create(createLocationDto);
        return {
            success: true,
            data: location,
            message: 'Tạo địa điểm mới thành công',
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateLocationDto: UpdateLocationDto) {
        const location = await this.locationService.update(id, updateLocationDto);
        return {
            success: true,
            data: location,
            message: 'Cập nhật địa điểm thành công',
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.locationService.remove(id);
        return {
            success: true,
            message: 'Xóa địa điểm thành công',
        };
    }
}
