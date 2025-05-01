import { pgTable, text, serial, integer, boolean, jsonb, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const waitlistEntries = pgTable("waitlist_entries", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  parish: text("parish"),
  role: text("role").notNull(),
  createdAt: text("created_at").notNull()
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull().unique(),
  url: text("url").notNull(),
  icon: text("icon").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const parishes = pgTable("parishes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  active: boolean("active").notNull().default(true),
  createdAt: text("created_at").notNull()
});

// Email template trigger types
export const emailTriggerTypeEnum = pgEnum('email_trigger_type', [
  'immediate', // Send immediately after creation
  'scheduled', // Send at a specific date/time
  'delay',     // Send X days after subscription
  'sequence',  // Part of a sequence of emails
]);

// Email template status
export const emailStatusEnum = pgEnum('email_status', [
  'draft',     // Still being edited
  'active',    // Ready to be sent
  'paused',    // Temporarily paused
  'archived'   // No longer in use
]);

// Email templates table
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),             // Internal name for the template
  subject: text("subject").notNull(),       // Email subject line
  body: text("body").notNull(),             // HTML email body
  plainText: text("plain_text"),            // Plain text version (optional)
  fromName: text("from_name").notNull(),    // Sender name
  fromEmail: text("from_email").notNull(),  // Sender email
  status: emailStatusEnum("status").notNull().default('draft'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Email campaigns table
export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),                  // Campaign name
  description: text("description"),              // Campaign description
  templateId: integer("template_id").notNull(),  // Reference to the email template
  triggerType: emailTriggerTypeEnum("trigger_type").notNull(),
  triggerValue: text("trigger_value"),           // Could be a date, number of days, or null for immediate
  status: emailStatusEnum("status").notNull().default('draft'),
  audience: jsonb("audience"),                   // JSON for audience filtering criteria
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Email sending history/logs
export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),  // Associated campaign
  recipientEmail: text("recipient_email").notNull(),
  recipientName: text("recipient_name"),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  status: text("status").notNull(),              // "sent", "delivered", "opened", "clicked", "bounced", "failed"
  error: text("error"),                          // Error message if failed
  metadata: jsonb("metadata")                    // Additional metadata (opens, clicks, etc.)
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWaitlistSchema = createInsertSchema(waitlistEntries).pick({
  fullName: true,
  email: true,
  phone: true,
  parish: true,
  role: true,
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).pick({
  key: true,
  value: true,
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).pick({
  platform: true,
  url: true,
  icon: true,
});

export const insertParishSchema = createInsertSchema(parishes).pick({
  name: true,
  active: true,
});

export const waitlistFormSchema = insertWaitlistSchema.extend({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  parish: z.string().optional(),
  role: z.string().min(1, {
    message: "Please select your current role.",
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWaitlistEntry = z.infer<typeof insertWaitlistSchema>;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;

export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;

export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;

export type InsertParish = z.infer<typeof insertParishSchema>;
export type Parish = typeof parishes.$inferSelect;

// Zod schema for email templates
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).pick({
  name: true,
  subject: true,
  body: true,
  plainText: true,
  fromName: true,
  fromEmail: true,
  status: true,
});

// Add validation rules for email templates
export const emailTemplateFormSchema = insertEmailTemplateSchema.extend({
  name: z.string().min(3, {
    message: "Template name must be at least 3 characters.",
  }),
  subject: z.string().min(2, {
    message: "Subject line is required.",
  }),
  body: z.string().min(10, {
    message: "Email body must be at least 10 characters.",
  }),
  plainText: z.string().optional(),
  fromName: z.string().min(2, {
    message: "Sender name is required.",
  }),
  fromEmail: z.string().email({
    message: "Please enter a valid email address for the sender.",
  }),
  status: z.enum(['draft', 'active', 'paused', 'archived']),
});

// Zod schema for email campaigns
export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).pick({
  name: true,
  description: true,
  templateId: true,
  triggerType: true,
  triggerValue: true,
  status: true,
  audience: true,
});

// Add validation rules for email campaigns
export const emailCampaignFormSchema = insertEmailCampaignSchema.extend({
  name: z.string().min(3, {
    message: "Campaign name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  templateId: z.number().positive({
    message: "Please select an email template.",
  }),
  triggerType: z.enum(['immediate', 'scheduled', 'delay', 'sequence']),
  triggerValue: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'archived']),
  audience: z.any().optional(),
});

// Define types
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;

export type EmailLog = typeof emailLogs.$inferSelect;
