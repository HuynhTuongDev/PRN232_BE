import { NestFactory } from '@nestjs/core';
import { AppModule } from '../apps/api-gateway/src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from '../apps/api-gateway/src/common/filters/global-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';

const server = express();
let cachedApp: any;

const bootstrap = async () => {
    if (!cachedApp) {
        const app = await NestFactory.create(
            AppModule,
            new ExpressAdapter(server),
            { logger: ['error', 'warn'] }
        );

        // Standard configuration
        app.useGlobalPipes(new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }));

        app.useGlobalFilters(new GlobalExceptionFilter());

        app.enableCors({
            origin: '*',
            credentials: true,
        });

        const apiPrefix = process.env.API_PREFIX || 'api/v1';
        app.setGlobalPrefix(apiPrefix);

        // Safe Swagger setup for Serverless
        try {
            const config = new DocumentBuilder()
                .setTitle('GoRide API Documentation')
                .setDescription('The official API documentation for GoRide')
                .setVersion('1.0')
                .addBearerAuth()
                .build();
            const document = SwaggerModule.createDocument(app, config);
            SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
                customSiteTitle: 'GoRide API Docs',
            });
        } catch (e) {
            console.warn('Swagger failed to load, continuing without it:', e);
        }

        await app.init();
        cachedApp = app;
    }
    return cachedApp;
};

export default async (req: any, res: any) => {
    try {
        await bootstrap();
        server(req, res);
    } catch (err) {
        console.error('CRITICAL STARTUP ERROR:', err);
        res.status(500).json({
            success: false,
            message: 'Backend failed to start',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
