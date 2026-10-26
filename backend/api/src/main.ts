import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

const app = await NestFactory.create(AppModule);
const config = app.get(ConfigService);

app.enableCors({ origin: config.getOrThrow<string[]>('CORS_ORIGINS') });
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
app.enableShutdownHooks();

const documento = new DocumentBuilder()
  .setTitle('API renfe-app')
  .setDescription(
    'API REST del proyecto académico tipo Renfe. ' +
      'Horarios y posiciones: datos abiertos de Renfe (CC BY 4.0). ' +
      'Precios, asientos y pagos: simulados.',
  )
  .setVersion('0.1.0')
  .addBearerAuth()
  .build();
SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, documento));

await app.listen(config.getOrThrow<number>('API_PORT'), '0.0.0.0');
