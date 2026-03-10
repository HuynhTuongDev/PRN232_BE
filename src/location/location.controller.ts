import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { LocationService } from './location.service';

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
}
