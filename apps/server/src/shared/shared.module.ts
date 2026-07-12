import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { AllExceptionsFilter } from '@/shared/filters/all-exceptions.filter';

// nestjs-pino가 pino-http로 요청/응답 로깅을 자동 처리하므로 별도 인터셉터는 두지 않는다.
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        name: 'Nook',
        level: process.env.LOG_LEVEL ?? 'info',
        // 개발 환경에서만 사람이 읽기 좋은 포맷으로. 운영은 JSON 라인.
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
  ],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class SharedModule {}
