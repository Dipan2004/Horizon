import { pgTable, serial, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const resumes = pgTable('resumes', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email').notNull(),
  rawText: text('raw_text').notNull(),
  skills: jsonb('skills').$type<string[]>().default([]),
  experience: text('experience'),
  achievements: jsonb('achievements').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const interviews = pgTable('interviews', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  score: integer('score'),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;