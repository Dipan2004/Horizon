import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  openaiApiKey: text("openai_api_key"),
  huggingfaceApiKey: text("huggingface_api_key"),
  preferredAiProvider: text("preferred_ai_provider").default("huggingface"), // "openai" or "huggingface"
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  skills: text("skills").array(),
  experience: text("experience"),
  achievements: text("achievements").array(),
});

export const companyInsights = pgTable("company_insights", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  position: text("position").notNull(),
  culture: text("culture"),
  mission: text("mission"),
  recentNews: text("recent_news"),
  requiredSkills: text("required_skills").array(),
  insights: jsonb("insights"),
});

export const interviewSessions = pgTable("interview_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  companyName: text("company_name"),
  position: text("position"),
  questions: jsonb("questions"),
  responses: jsonb("responses"),
  feedback: jsonb("feedback"),
  completed: boolean("completed").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  openaiApiKey: true,
  huggingfaceApiKey: true,
  preferredAiProvider: true,
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
});

export const insertCompanyInsightsSchema = createInsertSchema(companyInsights).omit({
  id: true,
});

export const insertInterviewSessionSchema = createInsertSchema(interviewSessions).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Resume = typeof resumes.$inferSelect;
export type CompanyInsights = typeof companyInsights.$inferSelect;
export type InterviewSession = typeof interviewSessions.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type InsertCompanyInsights = z.infer<typeof insertCompanyInsightsSchema>;
export type InsertInterviewSession = z.infer<typeof insertInterviewSessionSchema>;
