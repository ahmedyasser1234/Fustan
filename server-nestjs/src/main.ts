import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import compression from 'compression';
import { TransformInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security & Middleware
  // Security headers are now handled by Nginx to avoid duplication.
  
  // HTTPS Redirection Middleware (Production)
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.get('host')}${req.url}`);
    }
    next();
  });
  app.use(compression());
  app.use(cookieParser());

  // Increase body parser limits for large image uploads (within safe bounds)
  const { json, urlencoded } = require('express');
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.setGlobalPrefix('api');

  // CORS Configuration
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS')?.split(',') || [
    'https://fustan.cloud',
    'https://www.fustan.cloud',
  ];

  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? allowedOrigins
        : [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'https://fustanecoomerce.netlify.app',
            ...allowedOrigins,
          ],
    credentials: true,
  });

  // Global Interceptors & Filters
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: 422,
    }),
  );

  // Swagger Documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Fustan API')
      .setDescription('The Fustan E-commerce Platform API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('fustan')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
    logger.log(
      `📚 Swagger documentation available at: ${await app.getUrl()}/api/docs`,
    );
  }

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
