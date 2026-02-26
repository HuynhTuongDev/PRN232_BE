import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        // Prisma connects lazily on the first query. 
        // Explicitly calling $connect can cause issues in serverless environments.
        // await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
