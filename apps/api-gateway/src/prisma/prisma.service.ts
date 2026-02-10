import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        try {
            console.log('Connecting to database...');
            await this.$connect();
            console.log('Database connected successfully.');
        } catch (error) {
            console.error('Failed to connect to database:', error);
            // Don't throw error here to let the app start (so we can see other errors)
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
