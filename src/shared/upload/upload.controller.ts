import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    UploadedFiles,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly supabaseService: SupabaseService) { }

    @Post('image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Check if it's an image
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
            throw new BadRequestException('Only image files are allowed');
        }

        const url = await this.supabaseService.uploadImage(file);
        return { url };
    }

    @Post('images')
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }

        const uploadPromises = files.map((file) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                throw new BadRequestException(`File ${file.originalname} is not an image`);
            }
            return this.supabaseService.uploadImage(file);
        });

        const urls = await Promise.all(uploadPromises);
        return { urls };
    }
}
