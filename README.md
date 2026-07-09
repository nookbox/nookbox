# nookbox

pnpm 모노레포 · Next.js(web) + NestJS(server) · 타입은 hey-api로 서버→프론트 공유.

## 구조

```
apps/web     Next.js 16 + Tailwind v4 + shadcn(radix-nova)
apps/server  NestJS 11 + @nestjs/swagger
```

## 실행

```bash
pnpm install
pnpm dev          # web:3000, server:4000 동시 실행
```

## 타입 공유 (hey-api)

서버가 부팅 시 `apps/server/openapi.json` 을 떨궈줌. 이걸로 프론트 타입/클라이언트 생성:

```bash
# 1) 서버 한 번 실행해서 openapi.json 갱신 (pnpm dev 중이면 자동 최신)
# 2) 코드젠 (반드시 루트에서 실행 — pnpm11 quirk)
pnpm gen:api      # → apps/web/src/client/* 재생성
```

프론트에서 사용:

```ts
import { appControllerHealth } from '@/lib/api'; // baseUrl 설정 포함
const res = await appControllerHealth();          // res.data: HealthDto
```
