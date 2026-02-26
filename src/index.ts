import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
server.get('/_health', (req, res) => res.send('OK'));

let app: any;

const bootstrap = async () => {
    if (!app) {
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

        await app.init();
    }
};

export default async (req: any, res: any) => {
    try {
        await bootstrap();
        server(req, res);
    } catch (err) {
        console.error('Error during request handling:', err);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
            error: err.message
        });
    }
};
