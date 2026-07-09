import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 모노레포라 루트를 명시 (turbopack 다중 lockfile 경고 제거)
  turbopack: { root: path.join(__dirname, '..', '..') },
};

export default nextConfig;
