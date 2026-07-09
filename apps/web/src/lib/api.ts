import { client } from '@/client/client.gen';

// hey-api 클라이언트 base URL 설정. 앱 어디서든 이 모듈을 import하면 적용됨.
client.setConfig({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
});

export * from '@/client';
