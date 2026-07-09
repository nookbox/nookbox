import { defineConfig } from '@hey-api/openapi-ts';

// 서버가 부팅 시 apps/server/openapi.json 을 떨궈줌.
// 스펙 갱신: 서버 한번 실행 → `pnpm --filter @nookbox/web gen:api`
export default defineConfig({
  input: '../server/openapi.json',
  output: 'src/client',
  plugins: ['@hey-api/client-fetch', '@hey-api/typescript', '@hey-api/sdk'],
});
