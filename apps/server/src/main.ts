import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000' });

  const config = new DocumentBuilder()
    .setTitle('Nookbox API')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // UI: /api-docs, spec JSON: /api-docs-json (hey-api가 읽음)
  SwaggerModule.setup('api-docs', app, document);
  // ponytail: dev 편의로 스펙을 파일로도 떨궈 hey-api가 서버 안 띄워도 읽게 함
  writeFileSync('openapi.json', JSON.stringify(document, null, 2));

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
