import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto, UpdateBlogDto } from '@goride/shared';

@Injectable()
export class BlogService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.blog.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        const blog = await this.prisma.blog.findUnique({
            where: { id },
        });
        if (!blog) throw new NotFoundException('Không tìm thấy bài viết');
        return { blog };
    }

    async create(dto: CreateBlogDto) {
        const blog = await this.prisma.blog.create({
            data: dto,
        });
        return { blog };
    }

    async update(id: string, dto: UpdateBlogDto) {
        await this.findById(id);
        const blog = await this.prisma.blog.update({
            where: { id },
            data: dto,
        });
        return { blog };
    }

    async delete(id: string) {
        await this.findById(id);
        await this.prisma.blog.delete({
            where: { id },
        });
        return { success: true, message: 'Xóa bài viết thành công' };
    }
}
