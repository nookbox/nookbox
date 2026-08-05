# syntax=docker/dockerfile:1
#
# @nookbox/server (NestJS RP 백엔드) 운영 이미지
#
#   docker build -f apps/server/Dockerfile -t nookbox-server .
#
# 빌드 컨텍스트는 워크스페이스 루트다(apps/server 아님).
# 구조는 idp/apps/auth/Dockerfile 과 같다. pnpm 버전만 이 레포에 맞춰 다르다.

FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# 이 레포의 packageManager 는 pnpm@11.10.0 (idp는 10.33.0). 레포마다 못박는다.
RUN corepack enable && corepack prepare pnpm@11.10.0 --activate
WORKDIR /repo

# =============================================================
# 1단계: deps — 의존성 설치
# =============================================================
FROM base AS deps

# 소스보다 매니페스트를 먼저 복사해야 레이어 캐시가 산다.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/

RUN --mount=type=cache,id=pnpm-nookbox,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter "@nookbox/server..."

# =============================================================
# 2단계: build — 타입스크립트 컴파일
# =============================================================
FROM deps AS build

COPY apps/server/tsconfig.json apps/server/tsconfig.build.json apps/server/nest-cli.json apps/server/
COPY apps/server/src apps/server/src

# nest build → apps/server/dist/main.js
# tsconfig의 "@/*" 별칭은 이 단계에서 상대경로로 치환되므로 런타임에 추가 설정이 필요 없다.
RUN pnpm --filter @nookbox/server build

# 운영에 필요한 것만 /out 으로 추출.
# pnpm의 node_modules는 심볼릭 링크 그물이라 그냥 COPY하면 깨진다. deploy가 풀어준다.
RUN pnpm --filter @nookbox/server deploy --prod --legacy /out

# better-auth는 지원 프레임워크 전부(next, react, svelte, prisma...)를 optional peer로
# 선언한다. 이 워크스페이스에 Next 앱(@nookbox/web)이 같이 있고 pnpm이 better-auth 해석을
# 공유하는 탓에, API 서버인 여기에도 next + swc 바이너리가 딸려온다.
# 이 서버는 better-auth/node 만 쓰므로 전부 죽은 무게다.
RUN rm -rf /out/node_modules/.pnpm/next@* \
           /out/node_modules/.pnpm/@next+* \
           /out/node_modules/.pnpm/@img+* \
           /out/node_modules/.pnpm/sharp@* \
           /out/node_modules/next \
           /out/node_modules/@next

# =============================================================
# (별도) migrate — 스키마 반영 전용 이미지
# =============================================================
# drizzle-kit은 devDependency라 아래 runner에는 없다.
# 앱 시작과 분리해서 일회성으로 돌리는 스테이지를 따로 둔다.
#
#   docker compose --env-file .env.prod -f docker-compose.prod.yml \
#     --profile migrate run --rm migrate
#
# ⚠️ 이 레포는 아직 drizzle 마이그레이션 파일(drizzle/)이 없고 push 방식이다.
#    스키마를 DB에 직접 맞춰버리므로, 컬럼 삭제/타입 변경이 섞이면 데이터가 날아간다.
#    빈 DB 초기 구축에는 문제없지만, 운영 데이터가 쌓인 뒤에는
#    db:generate 로 마이그레이션 파일을 만들어 migrate 로 바꾸는 게 맞다.
#
# ⚠️ push는 파괴적 변경을 감지하면 확인 프롬프트를 띄운다. 컨테이너에는 입력이 없어
#    그대로 멈춘다. 그럴 땐 의도를 확인한 뒤 --force 를 붙여 다시 돌린다.
FROM deps AS migrate

COPY apps/server/tsconfig.json apps/server/drizzle.config.ts apps/server/
COPY apps/server/src apps/server/src

WORKDIR /repo/apps/server
CMD ["pnpm", "exec", "drizzle-kit", "push"]

# =============================================================
# 3단계: runner — 실제로 배포되는 이미지
# =============================================================
FROM node:22-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /out/node_modules ./node_modules
COPY --from=build /repo/apps/server/dist ./dist

USER node
EXPOSE 4000

CMD ["node", "dist/main.js"]
