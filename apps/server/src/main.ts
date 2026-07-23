import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { writeFileSync } from 'node:fs';
import { AppModule } from './app.module';
import { auth } from './lib/auth';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  const corsOrigins = [
    ...new Set(
      (
        process.env.CORS_ORIGIN ??
        process.env.WEB_ORIGIN ??
        'http://localhost:3000'
      )
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
  app.enableCors({ origin: corsOrigins, credentials: true });

  // /api/auth/* 는 전부 better-auth가 처리(로그인·콜백·세션·로그아웃).
  app.use('/api/auth', toNodeHandler(auth));
  app.use(cookieParser());
  app.useBodyParser('json');
  app.useBodyParser('urlencoded', { extended: true });

  const config = new DocumentBuilder()
    .setTitle('Nookbox API')
    .setVersion('0.1.0')
    .build();
  // nestjs-zod가 3.1 문법(type: "null")을 섞어 넣는데 문서는 3.0으로 선언된다.
  // cleanupOpenApiDoc이 nullable: true 로 정리해줘야 클라 타입이 string | null 로 나온다.
  const document = cleanupOpenApiDoc(SwaggerModule.createDocument(app, config));
  // UI: /api-docs, spec JSON: /api-docs-json (hey-api가 읽음)
  SwaggerModule.setup('api-docs', app, document);
  writeFileSync('openapi.json', JSON.stringify(document, null, 2));

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
