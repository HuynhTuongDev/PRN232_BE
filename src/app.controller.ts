import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('db-status')
  async getDbStatus() {
    try {
      // Try a simple query
      const userCount = await this.prisma.user.count();
      return {
        status: 'connected',
        userCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Database Status Error:', error);
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Could not connect to database',
        error: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      });
    }
  }
}
