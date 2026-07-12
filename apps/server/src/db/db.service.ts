import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '@/db/schema';

// DI 토큰. 런타임 db 인스턴스는 DbModule이 이 토큰으로 주입한다.
export const DATABASE = Symbol('DATABASE');

// db = drizzle(sql, { schema }) 의 타입. 런타임 import를 피해 커넥션을 열지 않는다
// (테스트에서 이 파일을 import해도 postgres에 연결하지 않도록).
export type Database = PostgresJsDatabase<typeof schema>;
