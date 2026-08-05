import path from 'node:path';
import type { NextConfig } from 'next';

const monorepoRoot = path.join(__dirname, '..', '..');

const nextConfig: NextConfig = {
  // 모노레포라 루트를 명시 (turbopack 다중 lockfile 경고 제거)
  turbopack: { root: monorepoRoot },
  // 도커 배포용. .next/standalone 에 필요한 파일만 추려서 담는다.
  output: 'standalone',
  // 모노레포에서는 추적 기준이 앱 폴더라 워크스페이스 루트의 node_modules를 놓친다.
  // 루트를 명시해야 standalone에 의존성이 제대로 들어간다.
  outputFileTracingRoot: monorepoRoot,
};

export default nextConfig;
