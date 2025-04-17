import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWaitlistSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

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
  app.get("/api/waitlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
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

  const httpServer = createServer(app);

  return httpServer;
}
