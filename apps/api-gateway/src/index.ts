import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';

const server = express();

let app: any;

const bootstrap = async () => {
    try {
        if (!app) {
            console.log('Starting NestJS bootstrap...');
            app = await NestFactory.create(
                AppModule,
                new ExpressAdapter(server),
            );

            // Enable global validation pipe
            app.useGlobalPipes(new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true,
            }));

            // Standardize error responses
            app.useGlobalFilters(new GlobalExceptionFilter());

            // Enable CORS
            app.enableCors({
                origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
                credentials: true,
            });

            // Global prefix
            const apiPrefix = process.env.API_PREFIX || 'api/v1';
            app.setGlobalPrefix(apiPrefix);

            // Swagger Documentation
            const config = new DocumentBuilder()
                .setTitle('GoRide API Documentation')
                .setDescription('The official API documentation for GoRide - Motorbike Rental Platform')
                .setVersion('1.0')
                .addBearerAuth()
                .build();
            const document = SwaggerModule.createDocument(app, config);
            SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

            await app.init();
            console.log('NestJS bootstrap completed successfully.');
        }
    } catch (error) {
        console.error('Error during NestJS bootstrap:', error);
        throw error;
    }
};

export default async (req: any, res: any) => {
    try {
        await bootstrap();
        server(req, res);
    } catch (error) {
        console.error('API Handler Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error during startup',
            error: error.message
        });
    }
};
