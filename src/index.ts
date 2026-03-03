import 'reflect-metadata';
import { register } from 'tsconfig-paths';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load and register aliases from tsconfig.json
try {
    const tsconfig = JSON.parse(readFileSync(join(process.cwd(), 'tsconfig.json'), 'utf8'));
    register({
        baseUrl: './',
        paths: tsconfig.compilerOptions.paths,
    });
} catch (e) {
    console.warn('Could not register path aliases:', e.message);
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
server.get('/health', (req, res) => res.status(200).send('OK'));
server.get('/env-check', (req, res) => {
    res.json({
        hasDbUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasJwtRefreshSecret: !!process.env.JWT_REFRESH_SECRET,
        nodeEnv: process.env.NODE_ENV,
        apiPrefix: process.env.API_PREFIX,
        timestamp: new Date().toISOString()
    });
});

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
        const allowedOrigins = process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
            : [
                'http://localhost:3002',
                'http://localhost:3003',
                'https://prn-232-fe-admin.vercel.app',
                'https://prn-232-fe-admin-git-main-huynh-tuongs-projects.vercel.app'
            ];

        app.enableCors({
            origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
                console.log(`CORS Check - Origin: ${origin}`);
                console.log(`CORS Check - Allowed: ${JSON.stringify(allowedOrigins)}`);

                // Allow requests with no origin (e.g. mobile apps, curl, Postman)
                if (!origin) return callback(null, true);

                // If no whitelist is configured, allow all
                if (!allowedOrigins || allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
                    return callback(null, true);
                }

                // Always allow local development URLs
                if (origin === 'http://localhost:3002' || origin === 'http://localhost:3003') {
                    return callback(null, true);
                }

                // Check if origin is in the whitelist
                if (allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }

                // Check for Vercel preview URLs
                if (origin.endsWith('.vercel.app') && allowedOrigins.some(o => o.includes('vercel.app'))) {
                    return callback(null, true);
                }

                console.warn(`CORS Blocking origin: ${origin}`);
                // Instead of throwing an error which might cause a 500, we just return false
                return callback(null, false);
            },
            credentials: true,
            methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        });

        const apiPrefix = process.env.API_PREFIX || 'api/v1';
        app.setGlobalPrefix(apiPrefix);

        console.log(`NestJS initialized. ENV CHECK: DB=${!!process.env.DATABASE_URL}, JWT=${!!process.env.JWT_SECRET}`);
        await app.init();
    }
};

export default async (req: any, res: any) => {
    try {
        console.log(`Incoming request: ${req.method} ${req.url}`);
        await bootstrap();
        server(req, res);
    } catch (err) {
        console.error('--- FATAL GATEWAY ERROR ---');
        console.error(err);
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
