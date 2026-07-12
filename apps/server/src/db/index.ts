import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

// 단일 postgres 커넥션 풀을 better-auth 어댑터와 앱 서비스가 공유한다.
const sql = postgres(databaseUrl, { max: 10 });
export const db = drizzle(sql, { schema });
