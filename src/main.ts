import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'; // IMPORT LOCAL FILTER

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false,
    transformOptions: { enableImplicitConversion: true }
  }));

  // Standardize error responses (USE LOCAL FILTER)
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
  });

  // Global prefix
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API Gateway is running on: http://localhost:${port}/${apiPrefix}`);
}
bootstrap();
