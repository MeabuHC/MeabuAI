import { config } from 'dotenv';

// Load environment variables first, before any other imports
config();

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { RoleGuard } from './auth/guards/role.guard';
import * as morgan from 'morgan';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  // Remove global RoleGuard to avoid conflicts with route-specific guards
  // const reflector = app.get(Reflector);
  // app.useGlobalGuards(new RoleGuard(reflector));

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(morgan('dev'));

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('Meabu AI API')
    .setDescription('The Meabu AI API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  // Log the API docs URL
  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(
    `📚 API Documentation available at: http://localhost:${port}/api/docs`,
  );
  console.log(`🔗 API Base URL: http://localhost:${port}/api/v1`);
}

bootstrap();
