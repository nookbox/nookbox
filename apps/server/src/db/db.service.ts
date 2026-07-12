import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '@/db/schema';

export const DATABASE = Symbol('DATABASE');

export type Database = PostgresJsDatabase<typeof schema>;
