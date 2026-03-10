import 'reflect-metadata';
import { register } from 'tsconfig-paths';
import { readFileSync } from 'fs';
import { join } from 'path';


import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

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
            forbidNonWhitelisted: false,
            transformOptions: { enableImplicitConversion: true }
        }));

        // Standardize error responses
        app.useGlobalFilters(new GlobalExceptionFilter());

        // Enable CORS đơn giản
        app.enableCors({
            origin: [
                'http://localhost:3002',
                'http://localhost:3003',
                'https://prn-232-fe-admin.vercel.app',
                'https://prn-232-fe-admin-git-main-huynh-tuongs-projects.vercel.app'
            ],
            credentials: true,
            methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
        });

        const apiPrefix = process.env.API_PREFIX || 'api/v1';
        app.setGlobalPrefix(apiPrefix);

        console.log(`NestJS initialized. ENV CHECK: DB=${!!process.env.DATABASE_URL}, JWT=${!!process.env.JWT_SECRET}`);
        await app.init();
    }
};


export default async (req: any, res: any) => {
    try {
        await bootstrap();
        server(req, res);
    } catch (err) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Internal Server Error (Gateway Crash)',
            error: err.message,
            stack: err.stack,
            path: req.url
        });
    }
};
