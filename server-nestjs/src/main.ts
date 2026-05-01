import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { TransformInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security & Middleware
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  // Increase body parser limits for large image uploads
  const { json, urlencoded } = require('express');
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.setGlobalPrefix('api');

  // CORS Configuration
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? true
        : [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'https://fustanecoomerce.netlify.app',
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

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
  logger.log(
    `📚 Swagger documentation available at: ${await app.getUrl()}/api/docs`,
  );
}
bootstrap();
