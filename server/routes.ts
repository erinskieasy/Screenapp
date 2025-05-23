import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertWaitlistSchema, 
  insertSiteSettingSchema, 
  insertSocialLinkSchema, 
  emailTemplateFormSchema,
  emailCampaignFormSchema,
  type InsertParish,
  type InsertEmailTemplate,
  type InsertEmailCampaign
} from "@shared/schema";
import { Resend } from 'resend';
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Setup file uploads
const uploadDir = path.join(process.cwd(), "client", "src", "assets");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow images and videos
const fileFilter = function(req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'));
  }
};

const upload = multer({ 
  storage: storage_multer,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  }
});

// Auth middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: "Authentication required"
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Waitlist endpoint
  app.post("/api/waitlist", async (req, res) => {
    try {
      // Validate the request body against the schema
      const data = insertWaitlistSchema.parse({
        ...req.body,
        createdAt: new Date().toISOString()
      });
      
      // Add to storage
      const entry = await storage.addWaitlistEntry({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        parish: data.parish,
        role: data.role,
        createdAt: new Date().toISOString()
      });
      
      // Return the entry
      return res.status(201).json({ 
        success: true, 
        message: "Successfully added to waitlist",
        entry 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while adding you to the waitlist" 
      });
    }
  });

  // Admin endpoint to get all waitlist entries
  app.get("/api/waitlist", isAuthenticated, async (req, res) => {
    try {
      const entries = await storage.getWaitlistEntries();
      return res.status(200).json({
        success: true,
        entries
      });
    } catch (error) {
      console.error("Error fetching waitlist entries:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching waitlist entries"
      });
    }
  });
  
  // Admin endpoint to delete a waitlist entry
  app.delete("/api/waitlist/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format"
        });
      }
      
      const success = await storage.deleteWaitlistEntry(id);
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: "Waitlist entry deleted successfully"
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Waitlist entry not found"
        });
      }
    } catch (error) {
      console.error("Error deleting waitlist entry:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the waitlist entry"
      });
    }
  });

  // Download waitlist entries as CSV
  app.get("/api/waitlist/download", isAuthenticated, async (req, res) => {
    try {
      const entries = await storage.getWaitlistEntries();
      
      // Convert to CSV
      const header = "Full Name,Email,Phone,Parish,Role,Created At\n";
      const rows = entries.map(entry => {
        return `"${entry.fullName}","${entry.email}","${entry.phone || ''}","${entry.parish || ''}","${entry.role}","${entry.createdAt}"`;
      }).join("\n");
      
      const csv = header + rows;
      
      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=waitlist_entries.csv');
      
      return res.send(csv);
    } catch (error) {
      console.error("Error downloading waitlist entries:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while downloading waitlist entries"
      });
    }
  });

  // Site Settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
      
      // Convert to key-value object
      const settingsObject = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      
      return res.status(200).json({
        success: true,
        settings: settingsObject
      });
    } catch (error) {
      console.error("Error fetching site settings:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching site settings"
      });
    }
  });
  
  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSiteSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({
          success: false,
          message: "Setting not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        setting
      });
    } catch (error) {
      console.error(`Error fetching site setting ${req.params.key}:`, error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching site setting"
      });
    }
  });
  
  app.post("/api/settings", isAuthenticated, async (req, res) => {
    try {
      // Validate the request body
      const data = insertSiteSettingSchema.parse(req.body);
      
      // Update or insert setting
      const setting = await storage.upsertSiteSetting({
        key: data.key,
        value: data.value,
        updatedAt: new Date().toISOString()
      });
      
      return res.status(200).json({
        success: true,
        setting
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message
        });
      }
      
      console.error("Error updating site setting:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating site setting"
      });
    }
  });

  // Social Links endpoints
  app.get("/api/social-links", async (req, res) => {
    try {
      const links = await storage.getAllSocialLinks();
      return res.status(200).json({
        success: true,
        links
      });
    } catch (error) {
      console.error("Error fetching social links:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching social links"
      });
    }
  });
  
  app.post("/api/social-links", isAuthenticated, async (req, res) => {
    try {
      // Validate the request body
      const data = insertSocialLinkSchema.parse(req.body);
      
      // Update or insert social link
      const link = await storage.upsertSocialLink({
        platform: data.platform,
        url: data.url,
        icon: data.icon,
        updatedAt: new Date().toISOString()
      });
      
      return res.status(200).json({
        success: true,
        link
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message
        });
      }
      
      console.error("Error updating social link:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating social link"
      });
    }
  });

  // File upload endpoint for hero background image
  app.post("/api/upload/hero-background", isAuthenticated, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }
      
      // Get the file path relative to assets directory
      const filePath = req.file.filename;
      
      // Update site setting
      await storage.upsertSiteSetting({
        key: "heroBackgroundImage",
        value: filePath,
        updatedAt: new Date().toISOString()
      });
      
      return res.status(200).json({
        success: true,
        file: {
          path: filePath,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error("Error uploading hero background image:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while uploading hero background image"
      });
    }
  });
  
  // File upload endpoint for site logo
  app.post("/api/upload/site-logo", isAuthenticated, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }
      
      // Get the file path relative to assets directory
      const filePath = req.file.filename;
      
      // Update site setting
      await storage.upsertSiteSetting({
        key: "siteLogo",
        value: filePath,
        updatedAt: new Date().toISOString()
      });
      
      return res.status(200).json({
        success: true,
        file: {
          path: filePath,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error("Error uploading site logo:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while uploading site logo"
      });
    }
  });
  
  // File upload endpoint for dark mode site logo
  app.post("/api/upload/dark-site-logo", isAuthenticated, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }
      
      // Get the file path relative to assets directory
      const filePath = req.file.filename;
      
      // Update site setting
      await storage.upsertSiteSetting({
        key: "darkSiteLogo",
        value: filePath,
        updatedAt: new Date().toISOString()
      });
      
      return res.status(200).json({
        success: true,
        file: {
          path: filePath,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error("Error uploading dark mode site logo:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while uploading dark mode site logo"
      });
    }
  });

  // Serve uploaded media (images and videos) from assets directory
  app.use('/image', (req, res, next) => {
    const mediaPath = req.path;
    const fullPath = path.join(uploadDir, mediaPath);
    
    // Check if the file exists
    if (fs.existsSync(fullPath)) {
      // Get file extension to set the correct content type
      const ext = path.extname(fullPath).toLowerCase();
      
      // Set appropriate content type for common video formats
      if (ext === '.mp4') {
        res.setHeader('Content-Type', 'video/mp4');
      } else if (ext === '.webm') {
        res.setHeader('Content-Type', 'video/webm');
      } else if (ext === '.mov') {
        res.setHeader('Content-Type', 'video/quicktime');
      } else if (ext === '.ogg') {
        res.setHeader('Content-Type', 'video/ogg');
      }
      
      res.sendFile(fullPath);
    } else {
      next();
    }
  });

  // Parish endpoints
  app.get("/api/parishes", async (req, res) => {
    try {
      const parishes = await storage.getActiveParishes();
      return res.status(200).json({
        success: true,
        parishes
      });
    } catch (error) {
      console.error("Error fetching parishes:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching parishes"
      });
    }
  });
  
  app.get("/api/parishes/all", isAuthenticated, async (req, res) => {
    try {
      const parishes = await storage.getAllParishes();
      return res.status(200).json({
        success: true,
        parishes
      });
    } catch (error) {
      console.error("Error fetching all parishes:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching all parishes"
      });
    }
  });
  
  app.post("/api/parishes", isAuthenticated, async (req, res) => {
    try {
      const { name, active } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "Parish name is required"
        });
      }
      
      // Check if parish already exists
      const existingParish = await storage.getParishByName(name);
      if (existingParish) {
        return res.status(400).json({
          success: false,
          message: "A parish with this name already exists"
        });
      }
      
      const parish = await storage.createParish({
        name,
        active: active !== undefined ? active : true,
        createdAt: new Date().toISOString()
      });
      
      return res.status(201).json({
        success: true,
        parish
      });
    } catch (error) {
      console.error("Error creating parish:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the parish"
      });
    }
  });
  
  app.put("/api/parishes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parish ID"
        });
      }
      
      const { name, active } = req.body;
      const updateData: Partial<InsertParish> = {};
      
      if (name !== undefined) {
        updateData.name = name;
      }
      
      if (active !== undefined) {
        updateData.active = active;
      }
      
      // Check if parish exists
      const existingParish = await storage.getParish(id);
      if (!existingParish) {
        return res.status(404).json({
          success: false,
          message: "Parish not found"
        });
      }
      
      // If changing name, make sure it doesn't conflict
      if (name && name !== existingParish.name) {
        const parishWithSameName = await storage.getParishByName(name);
        if (parishWithSameName) {
          return res.status(400).json({
            success: false,
            message: "A parish with this name already exists"
          });
        }
      }
      
      const parish = await storage.updateParish(id, updateData);
      
      return res.status(200).json({
        success: true,
        parish
      });
    } catch (error) {
      console.error(`Error updating parish:`, error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the parish"
      });
    }
  });
  
  app.delete("/api/parishes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parish ID"
        });
      }
      
      const success = await storage.deleteParish(id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Parish not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Parish deleted successfully"
      });
    } catch (error) {
      console.error(`Error deleting parish:`, error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the parish"
      });
    }
  });

  // Email template endpoints
  app.get("/api/email-templates", isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getAllEmailTemplates();
      return res.status(200).json({
        success: true,
        templates
      });
    } catch (error) {
      console.error("Error fetching email templates:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching email templates"
      });
    }
  });
  
  app.get("/api/email-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid template ID"
        });
      }
      
      const template = await storage.getEmailTemplate(id);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Email template not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        template
      });
    } catch (error) {
      console.error(`Error fetching email template ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching email template"
      });
    }
  });
  
  app.post("/api/email-templates", isAuthenticated, async (req, res) => {
    try {
      // Validate the request body
      const data = emailTemplateFormSchema.parse(req.body);
      
      // Create template
      const template = await storage.createEmailTemplate(data);
      
      return res.status(201).json({
        success: true,
        template
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message
        });
      }
      
      console.error("Error creating email template:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the email template"
      });
    }
  });
  
  app.patch("/api/email-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid template ID"
        });
      }
      
      // Check if template exists
      const existingTemplate = await storage.getEmailTemplate(id);
      if (!existingTemplate) {
        return res.status(404).json({
          success: false,
          message: "Email template not found"
        });
      }
      
      // Validate updates
      const updates = req.body;
      
      // Update template
      const template = await storage.updateEmailTemplate(id, updates);
      
      return res.status(200).json({
        success: true,
        template
      });
    } catch (error) {
      console.error(`Error updating email template ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the email template"
      });
    }
  });
  
  app.delete("/api/email-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid template ID"
        });
      }
      
      // Delete template
      const success = await storage.deleteEmailTemplate(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Email template not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Email template deleted successfully"
      });
    } catch (error) {
      console.error(`Error deleting email template ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the email template"
      });
    }
  });
  
  // Email campaign endpoints
  app.get("/api/email-campaigns", isAuthenticated, async (req, res) => {
    try {
      const campaigns = await storage.getAllEmailCampaigns();
      return res.status(200).json({
        success: true,
        campaigns
      });
    } catch (error) {
      console.error("Error fetching email campaigns:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching email campaigns"
      });
    }
  });
  
  app.get("/api/email-campaigns/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid campaign ID"
        });
      }
      
      const campaign = await storage.getEmailCampaign(id);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Email campaign not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        campaign
      });
    } catch (error) {
      console.error(`Error fetching email campaign ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching email campaign"
      });
    }
  });
  
  app.post("/api/email-campaigns", isAuthenticated, async (req, res) => {
    try {
      // Validate the request body
      const data = emailCampaignFormSchema.parse(req.body);
      
      // Verify template exists
      const template = await storage.getEmailTemplate(data.templateId);
      if (!template) {
        return res.status(400).json({
          success: false,
          message: "Email template not found"
        });
      }
      
      // Create campaign
      const campaign = await storage.createEmailCampaign(data);
      
      return res.status(201).json({
        success: true,
        campaign
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message
        });
      }
      
      console.error("Error creating email campaign:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the email campaign"
      });
    }
  });
  
  app.patch("/api/email-campaigns/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid campaign ID"
        });
      }
      
      // Check if campaign exists
      const existingCampaign = await storage.getEmailCampaign(id);
      if (!existingCampaign) {
        return res.status(404).json({
          success: false,
          message: "Email campaign not found"
        });
      }
      
      // If templateId is being updated, verify it exists
      if (req.body.templateId) {
        const template = await storage.getEmailTemplate(req.body.templateId);
        if (!template) {
          return res.status(400).json({
            success: false,
            message: "Email template not found"
          });
        }
      }
      
      // Update campaign
      const campaign = await storage.updateEmailCampaign(id, req.body);
      
      return res.status(200).json({
        success: true,
        campaign
      });
    } catch (error) {
      console.error(`Error updating email campaign ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the email campaign"
      });
    }
  });
  
  app.delete("/api/email-campaigns/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid campaign ID"
        });
      }
      
      // Delete campaign
      const success = await storage.deleteEmailCampaign(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Email campaign not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Email campaign deleted successfully"
      });
    } catch (error) {
      console.error(`Error deleting email campaign ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the email campaign"
      });
    }
  });
  
  // Email sending endpoint
  app.post("/api/email-campaigns/:id/send", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid campaign ID"
        });
      }
      
      // Get campaign
      const campaign = await storage.getEmailCampaign(id);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Email campaign not found"
        });
      }
      
      // Get template
      const template = await storage.getEmailTemplate(campaign.templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Email template not found"
        });
      }
      
      // Check Resend API key is set
      if (!resend) {
        return res.status(500).json({
          success: false,
          message: "Email service is not configured. Please set the RESEND_API_KEY environment variable."
        });
      }
      
      // Get waitlist entries for sending
      const waitlistEntries = await storage.getWaitlistEntries();
      if (waitlistEntries.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No recipients found in waitlist"
        });
      }
      
      // Tracking for successful and failed emails
      const results = {
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };
      
      // Send emails to each waitlist entry
      for (const entry of waitlistEntries) {
        try {
          // Send email
          const { data, error } = await resend.emails.send({
            from: `${template.fromName} <${template.fromEmail}>`,
            to: entry.email,
            subject: template.subject,
            html: template.body
              .replace(/{{name}}/g, entry.fullName)
              .replace(/{{email}}/g, entry.email),
            text: template.plainText 
              ? template.plainText
                  .replace(/{{name}}/g, entry.fullName)
                  .replace(/{{email}}/g, entry.email)
              : undefined
          });
          
          if (error) {
            throw new Error(error.message);
          }
          
          // Log the email
          await storage.createEmailLog({
            campaignId: campaign.id,
            recipientEmail: entry.email,
            recipientName: entry.fullName,
            status: "sent",
            metadata: { messageId: data?.id }
          });
          
          results.successful++;
        } catch (error: any) {
          // Log the error
          await storage.createEmailLog({
            campaignId: campaign.id,
            recipientEmail: entry.email,
            recipientName: entry.fullName,
            status: "failed",
            error: error.message
          });
          
          results.failed++;
          results.errors.push(`Failed to send to ${entry.email}: ${error.message}`);
        }
      }
      
      // Update campaign status if all emails were sent successfully
      if (results.failed === 0) {
        await storage.updateEmailCampaign(campaign.id, { status: 'active' });
      }
      
      return res.status(200).json({
        success: true,
        message: `Sent ${results.successful} emails, ${results.failed} failed`,
        results
      });
    } catch (error: any) {
      console.error(`Error sending email campaign ${req.params.id}:`, error);
      return res.status(500).json({
        success: false,
        message: `An error occurred while sending the email campaign: ${error.message}`
      });
    }
  });
  
  // Email logs endpoints
  app.get("/api/email-logs", isAuthenticated, async (req, res) => {
    try {
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      const logs = await storage.getEmailLogs(campaignId);
      
      return res.status(200).json({
        success: true,
        logs
      });
    } catch (error) {
      console.error("Error fetching email logs:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching email logs"
      });
    }
  });
  
  app.get("/api/email-logs/recipient/:email", isAuthenticated, async (req, res) => {
    try {
      const email = req.params.email;
      const logs = await storage.getEmailLogsByRecipient(email);
      
      return res.status(200).json({
        success: true,
        logs
      });
    } catch (error) {
      console.error(`Error fetching email logs for recipient ${req.params.email}:`, error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching email logs"
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
