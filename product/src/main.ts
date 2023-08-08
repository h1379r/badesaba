import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import appEnvConfig from './config/app-env.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService =
    app.get<ConfigService<ConfigType<typeof appEnvConfig>>>(ConfigService);

  const pathPrefix = configService.get('pathPrefix', { infer: true });

  app.enableCors();

  app.setGlobalPrefix(pathPrefix);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // swagger configuration
  const config = new DocumentBuilder()
    .setTitle('api documentation')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // set validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
    }),
  );

  const port = configService.get('port');

  await app.listen(port);
  Logger.log(`Application listening on port:${port}`);
}
bootstrap();
