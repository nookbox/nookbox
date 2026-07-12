import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { users } from './auth';

// 온보딩 프로필. 이 테이블에 row가 있으면 = 가입 완료(온보딩 통과).
// row가 없으면 = 첫 가입 → 온보딩으로 보냄. (form/upsert는 온보딩 세팅 시 추가)
export const profiles = pgTable('profiles', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  nickname: varchar('nickname', { length: 20 }).unique(),
  image: text('image').default(''),
  bio: varchar({ length: 160 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export type ProfileRow = typeof profiles.$inferSelect;
export type NewProfileRow = typeof profiles.$inferInsert;
