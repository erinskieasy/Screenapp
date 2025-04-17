import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWaitlistSchema, insertSiteSettingSchema, insertSocialLinkSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";

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

const upload = multer({ storage: storage_multer });

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

  // Download waitlist entries as CSV
  app.get("/api/waitlist/download", isAuthenticated, async (req, res) => {
    try {
      const entries = await storage.getWaitlistEntries();
      
      // Convert to CSV
      const header = "Full Name,Email,Phone,Role,Created At\n";
      const rows = entries.map(entry => {
        return `"${entry.fullName}","${entry.email}","${entry.phone || ''}","${entry.role}","${entry.createdAt}"`;
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

  // Serve uploaded images from assets directory
  app.use('/image', (req, res, next) => {
    const imagePath = req.path;
    const fullPath = path.join(uploadDir, imagePath);
    
    // Check if the file exists
    if (fs.existsSync(fullPath)) {
      res.sendFile(fullPath);
    } else {
      next();
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
