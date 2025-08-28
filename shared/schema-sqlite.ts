import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["STUDENT", "BUYER", "ADMIN"] }).notNull().default("STUDENT"),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const studentProfiles = sqliteTable("student_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id).unique().notNull(),
  university: text("university").notNull(),
  studentId: text("student_id").notNull(),
  program: text("program").notNull(),
  verificationStatus: text("verification_status", { 
    enum: ["PENDING", "APPROVED", "REJECTED"] 
  }).notNull().default("PENDING"),
  verificationNotes: text("verification_notes"),
  idDocUrl: text("id_doc_url"),
  selfieUrl: text("selfie_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const buyerProfiles = sqliteTable("buyer_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id).unique().notNull(),
  companyName: text("company_name"),
  website: text("website"),
  billingAddress: text("billing_address"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  skills: text("skills").notNull().default("[]"), // JSON string
  tags: text("tags").notNull().default("[]"), // JSON string
  price: integer("price").notNull(),
  status: text("status", { 
    enum: ["DRAFT", "LISTED", "HIRED", "IN_PROGRESS", "DELIVERED", "CLOSED"] 
  }).notNull().default("DRAFT"),
  visibility: text("visibility", { enum: ["PUBLIC", "PRIVATE"] }).notNull().default("PUBLIC"),
  coverImageUrl: text("cover_image_url"),
  deliveryTime: integer("delivery_time").notNull(), // weeks
  revisions: integer("revisions").notNull().default(3),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const teams = sqliteTable("teams", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const teamMembers = sqliteTable("team_members", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  teamId: text("team_id").references(() => teams.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  role: text("role", { enum: ["OWNER", "MEMBER"] }).notNull().default("MEMBER"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const favorites = sqliteTable("favorites", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  buyerId: text("buyer_id").references(() => users.id).notNull(),
  projectId: text("project_id").references(() => projects.id).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id).notNull(),
  buyerId: text("buyer_id").references(() => users.id).notNull(),
  studentId: text("student_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(),
  status: text("status", { 
    enum: ["PENDING", "PAID", "REFUNDED", "DISPUTED"] 
  }).notNull().default("PENDING"),
  stripeSessionId: text("stripe_session_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id").references(() => orders.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  payload: text("payload").notNull(), // JSON string
  readAt: integer("read_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  actorId: text("actor_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  metadata: text("metadata"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertBuyerProfileSchema = createInsertSchema(buyerProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;

export type BuyerProfile = typeof buyerProfiles.$inferSelect;
export type InsertBuyerProfile = z.infer<typeof insertBuyerProfileSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
