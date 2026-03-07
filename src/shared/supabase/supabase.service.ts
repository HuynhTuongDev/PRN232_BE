import { Injectable, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private readonly supabase: SupabaseClient;
    private readonly logger = new Logger(SupabaseService.name);

    constructor(private readonly configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            this.logger.error('SUPABASE_URL or SUPABASE_KEY is missing in env');
            throw new ConflictException('Supabase configuration is missing');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    /**
     * Upload an image to Supabase Storage
     * @param file The file object from Multer
     * @param bucket Lowercase bucket name (default: 'images')
     * @param folder Optional folder path inside the bucket
     */
    async uploadImage(file: Express.Multer.File, bucket: string = 'images', folder: string = ''): Promise<string> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        // Sanitize filename and add timestamp to avoid collisions
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

        const { data, error } = await this.supabase.storage
            .from(bucket)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            this.logger.error(`Error uploading image to Supabase: ${error.message}`);
            throw new BadRequestException(`Image upload failed: ${error.message}`);
        }

        // Get Public URL
        const { data: publicUrlData } = this.supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        if (!publicUrlData) {
            throw new BadRequestException('Could not get public URL for the uploaded image');
        }

        return publicUrlData.publicUrl;
    }

    /**
     * Delete an image from Supabase Storage
     * @param url The full public URL of the image
     * @param bucket Lowercase bucket name
     */
    async deleteImage(url: string, bucket: string = 'images'): Promise<void> {
        try {
            // Extract path from public URL
            // Example URL: https://xyz.supabase.co/storage/v1/object/public/images/folder/123-abc.jpg
            const urlParts = url.split(`/storage/v1/object/public/${bucket}/`);
            if (urlParts.length < 2) {
                this.logger.warn(`Could not parse path from URL: ${url}`);
                return;
            }

            const filePath = urlParts[1];
            const { error } = await this.supabase.storage.from(bucket).remove([filePath]);

            if (error) {
                this.logger.error(`Error deleting image from Supabase: ${error.message}`);
            }
        } catch (err) {
            this.logger.error(`Unexpected error during image deletion: ${err.message}`);
        }
    }
}
