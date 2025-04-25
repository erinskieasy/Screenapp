import { 
  users, 
  waitlistEntries, 
  siteSettings, 
  socialLinks,
  parishes,
  type User, 
  type InsertUser, 
  type WaitlistEntry, 
  type InsertWaitlistEntry,
  type SiteSetting,
  type InsertSiteSetting,
  type SocialLink,
  type InsertSocialLink,
  type Parish,
  type InsertParish
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import { pool } from "./db";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Waitlist operations
  addWaitlistEntry(entry: InsertWaitlistEntry & { createdAt: string }): Promise<WaitlistEntry>;
  getWaitlistEntries(): Promise<WaitlistEntry[]>;
  
  // Site settings operations
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  getAllSiteSettings(): Promise<SiteSetting[]>;
  upsertSiteSetting(setting: InsertSiteSetting & { updatedAt: string }): Promise<SiteSetting>;
  
  // Social links operations
  getSocialLink(platform: string): Promise<SocialLink | undefined>;
  getAllSocialLinks(): Promise<SocialLink[]>;
  upsertSocialLink(link: InsertSocialLink & { updatedAt: string }): Promise<SocialLink>;
  
  // Parish operations
  getParish(id: number): Promise<Parish | undefined>;
  getParishByName(name: string): Promise<Parish | undefined>;
  getAllParishes(): Promise<Parish[]>;
  getActiveParishes(): Promise<Parish[]>;
  createParish(parish: InsertParish & { createdAt: string }): Promise<Parish>;
  updateParish(id: number, data: Partial<InsertParish>): Promise<Parish>;
  deleteParish(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Waitlist operations
  async addWaitlistEntry(entry: InsertWaitlistEntry & { createdAt: string }): Promise<WaitlistEntry> {
    const [waitlistEntry] = await db
      .insert(waitlistEntries)
      .values({
        fullName: entry.fullName,
        email: entry.email,
        phone: entry.phone || null,
        parish: entry.parish || null,
        role: entry.role,
        createdAt: entry.createdAt
      })
      .returning();
    return waitlistEntry;
  }

  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    return await db.select().from(waitlistEntries);
  }
  
  // Site settings operations
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting || undefined;
  }
  
  async getAllSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }
  
  async upsertSiteSetting(setting: InsertSiteSetting & { updatedAt: string }): Promise<SiteSetting> {
    // Check if setting exists
    const existingSetting = await this.getSiteSetting(setting.key);
    
    if (existingSetting) {
      // Update existing setting
      const [updatedSetting] = await db
        .update(siteSettings)
        .set({ 
          value: setting.value, 
          updatedAt: setting.updatedAt 
        })
        .where(eq(siteSettings.key, setting.key))
        .returning();
      return updatedSetting;
    } else {
      // Insert new setting
      const [newSetting] = await db
        .insert(siteSettings)
        .values({
          key: setting.key,
          value: setting.value,
          updatedAt: setting.updatedAt
        })
        .returning();
      return newSetting;
    }
  }
  
  // Social links operations
  async getSocialLink(platform: string): Promise<SocialLink | undefined> {
    const [link] = await db.select().from(socialLinks).where(eq(socialLinks.platform, platform));
    return link || undefined;
  }
  
  async getAllSocialLinks(): Promise<SocialLink[]> {
    return await db.select().from(socialLinks);
  }
  
  async upsertSocialLink(link: InsertSocialLink & { updatedAt: string }): Promise<SocialLink> {
    // Check if link exists
    const existingLink = await this.getSocialLink(link.platform);
    
    if (existingLink) {
      // Update existing link
      const [updatedLink] = await db
        .update(socialLinks)
        .set({ 
          url: link.url, 
          icon: link.icon,
          updatedAt: link.updatedAt 
        })
        .where(eq(socialLinks.platform, link.platform))
        .returning();
      return updatedLink;
    } else {
      // Insert new link
      const [newLink] = await db
        .insert(socialLinks)
        .values({
          platform: link.platform,
          url: link.url,
          icon: link.icon,
          updatedAt: link.updatedAt
        })
        .returning();
      return newLink;
    }
  }
  
  // Parish operations
  async getParish(id: number): Promise<Parish | undefined> {
    const [parish] = await db.select().from(parishes).where(eq(parishes.id, id));
    return parish || undefined;
  }
  
  async getParishByName(name: string): Promise<Parish | undefined> {
    const [parish] = await db.select().from(parishes).where(eq(parishes.name, name));
    return parish || undefined;
  }
  
  async getAllParishes(): Promise<Parish[]> {
    return await db.select().from(parishes);
  }
  
  async getActiveParishes(): Promise<Parish[]> {
    return await db.select().from(parishes).where(eq(parishes.active, true));
  }
  
  async createParish(parish: InsertParish & { createdAt: string }): Promise<Parish> {
    const [newParish] = await db
      .insert(parishes)
      .values({
        name: parish.name,
        active: parish.active !== undefined ? parish.active : true,
        createdAt: parish.createdAt
      })
      .returning();
    return newParish;
  }
  
  async updateParish(id: number, data: Partial<InsertParish>): Promise<Parish> {
    const [updatedParish] = await db
      .update(parishes)
      .set(data)
      .where(eq(parishes.id, id))
      .returning();
    return updatedParish;
  }
  
  async deleteParish(id: number): Promise<boolean> {
    const result = await db
      .delete(parishes)
      .where(eq(parishes.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
