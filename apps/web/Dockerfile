# syntax=docker/dockerfile:1
#
# @nookbox/web (Next.js 프론트) 운영 이미지
#
#   docker build -f apps/web/Dockerfile \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
#     -t nookbox-web .
#
# 빌드 컨텍스트는 워크스페이스 루트다(apps/web 아님).

FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.10.0 --activate
WORKDIR /repo

# =============================================================
# 1단계: deps
# =============================================================
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/

RUN --mount=type=cache,id=pnpm-nookbox,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter "@nookbox/web..."

# =============================================================
# 2단계: build
# =============================================================
FROM deps AS build

COPY apps/web apps/web

# ⚠️ NEXT_PUBLIC_* 은 "빌드 시점"에 JS 번들 안에 문자열로 박힌다.
# 컨테이너를 띄울 때 환경변수로 바꿔도 안 바뀐다. 반드시 빌드 인자로 넘겨야 한다.
# 즉 운영용 이미지와 개발용 이미지는 별개로 빌드해야 한다.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @nookbox/web build

# =============================================================
# 3단계: runner
# =============================================================
FROM node:22-slim AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# standalone의 server.js가 읽는 값. 0.0.0.0 이어야 컨테이너 밖에서 접속된다.
ENV HOSTNAME=0.0.0.0
ENV PORT=3030

WORKDIR /app

# output:'standalone' + outputFileTracingRoot(워크스페이스 루트) 조합이라
# standalone 안에도 apps/web/... 구조가 그대로 유지된다.
COPY --from=build /repo/apps/web/.next/standalone ./

# standalone은 public 과 .next/static 을 "일부러" 빼놓는다(원래 CDN이 담당하는 영역).
# 우리는 CDN이 없으니 직접 넣는다. 안 넣으면 CSS/이미지가 전부 깨진다.
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public

USER node
EXPOSE 3030

CMD ["node", "apps/web/server.js"]
