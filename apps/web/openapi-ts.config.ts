import { defineConfig } from '@hey-api/openapi-ts';

// 서버가 부팅 시 apps/server/openapi.json 을 떨궈줌.
// 스펙 갱신: 서버 한번 실행 → `pnpm --filter @nookbox/web gen:api`
export default defineConfig({
  input: '../server/openapi.json',
  // BFF 패턴(lib/api/server.ts, 서버 전용 fetch + 쿠키 포워딩)을 쓰므로
  // SDK/HTTP 클라이언트는 생성하지 않고 타입만 생성한다.
  output: 'src/lib/api/generated',
  plugins: ['@hey-api/typescript'],
});
