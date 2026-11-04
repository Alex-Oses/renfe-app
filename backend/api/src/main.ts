import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

const app = await NestFactory.create(AppModule);
const config = app.get(ConfigService);

// El chatbot es opcional: sin clave la API arranca, pero conviene verlo en `docker compose logs api`.
if (!config.get<string>('GEMINI_API_KEY')?.trim()) {
  new Logger('Arranque').warn('GEMINI_API_KEY vacía: /chatbot responderá 503 (el resto de la API funciona)');
}

app.enableCors({ origin: config.getOrThrow<string[]>('CORS_ORIGINS') });
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
app.enableShutdownHooks();

const documento = new DocumentBuilder()
  .setTitle('API renfe-app')
  .setDescription(
    'API REST de Andén 0, una demostración tipo Renfe. ' +
      'Horarios y posiciones: datos abiertos de Renfe (CC BY 4.0). ' +
      'Precios, asientos y pagos: simulados.',
  )
  .setVersion('0.1.0')
  .addBearerAuth()
  .build();
SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, documento));

await app.listen(config.getOrThrow<number>('API_PORT'), '0.0.0.0');
