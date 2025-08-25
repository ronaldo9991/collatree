import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import session from "express-session";
import { randomUUID } from "crypto";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    role?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'collabotree-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.session.role || !roles.includes(req.session.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      next();
    };
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.role = user.role;

      // Get profile data based on role
      let profile = null;
      if (user.role === "STUDENT") {
        profile = await storage.getStudentProfile(user.id);
      } else if (user.role === "BUYER") {
        profile = await storage.getBuyerProfile(user.id);
      }

      res.json({ 
        user: { ...user, password: undefined }, 
        profile 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
        role: z.enum(["STUDENT", "BUYER"]),
        university: z.string().optional(),
        studentId: z.string().optional(),
        program: z.string().optional(),
        companyName: z.string().optional(),
      });

      const data = schema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Validate student email domain
      if (data.role === "STUDENT") {
        const allowedDomains = [".edu", ".ac.uk", ".org"];
        const isValidDomain = allowedDomains.some(domain => data.email.endsWith(domain));
        if (!isValidDomain) {
          return res.status(400).json({ 
            message: "Student registration requires an educational email address (.edu, .ac.uk, .org)" 
          });
        }

        if (!data.university || !data.studentId || !data.program) {
          return res.status(400).json({ 
            message: "University, student ID, and program are required for students" 
          });
        }
      }

      // Create user
      const user = await storage.createUser({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        avatarUrl: null,
      });

      // Create profile based on role
      let profile = null;
      if (data.role === "STUDENT") {
        profile = await storage.createStudentProfile({
          userId: user.id,
          university: data.university!,
          studentId: data.studentId!,
          program: data.program!,
          verificationStatus: "PENDING",
          verificationNotes: null,
          idDocUrl: null,
          selfieUrl: null,
        });
      } else if (data.role === "BUYER") {
        profile = await storage.createBuyerProfile({
          userId: user.id,
          companyName: data.companyName || null,
          website: null,
          billingAddress: null,
        });
      }

      req.session.userId = user.id;
      req.session.role = user.role;

      res.json({ 
        user: { ...user, password: undefined }, 
        profile 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let profile = null;
      if (user.role === "STUDENT") {
        profile = await storage.getStudentProfile(user.id);
      } else if (user.role === "BUYER") {
        profile = await storage.getBuyerProfile(user.id);
      }

      res.json({ 
        user: { ...user, password: undefined }, 
        profile 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const { search, category, university, priceRange, ownerId, status, limit, offset } = req.query;

      let projects;
      if (search) {
        projects = await storage.searchProjects(
          search as string,
          {
            category: category as string,
            university: university as string,
            priceRange: priceRange as string,
          }
        );
      } else {
        projects = await storage.getProjects({
          ownerId: ownerId as string,
          status: status as string,
          limit: limit ? parseInt(limit as string) : undefined,
          offset: offset ? parseInt(offset as string) : undefined,
        });
      }

      // Get owner info for each project
      const projectsWithOwners = await Promise.all(
        projects.map(async (project) => {
          const owner = await storage.getUser(project.ownerId);
          const studentProfile = owner?.role === "STUDENT" 
            ? await storage.getStudentProfile(project.ownerId)
            : null;
          
          return {
            ...project,
            owner: owner ? { ...owner, password: undefined } : null,
            studentProfile,
          };
        })
      );

      res.json(projectsWithOwners);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/projects/:idOrSlug", async (req, res) => {
    try {
      const { idOrSlug } = req.params;
      
      let project = await storage.getProject(idOrSlug);
      if (!project) {
        project = await storage.getProjectBySlug(idOrSlug);
      }
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const owner = await storage.getUser(project.ownerId);
      const studentProfile = owner?.role === "STUDENT" 
        ? await storage.getStudentProfile(project.ownerId)
        : null;

      res.json({
        ...project,
        owner: owner ? { ...owner, password: undefined } : null,
        studentProfile,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/projects", requireAuth, requireRole(["STUDENT"]), async (req, res) => {
    try {
      const schema = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        skills: z.array(z.string()),
        tags: z.array(z.string()),
        price: z.number().min(1),
        deliveryTime: z.number().min(1),
        revisions: z.number().min(0).default(3),
        status: z.enum(["DRAFT", "LISTED"]).default("DRAFT"),
      });

      const data = schema.parse(req.body);
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + randomUUID().slice(0, 8);

      const project = await storage.createProject({
        ...data,
        ownerId: req.session.userId!,
        slug,
        visibility: "PUBLIC",
        coverImageUrl: null,
      });

      res.json(project);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check ownership or admin role
      if (project.ownerId !== req.session.userId && req.session.role !== "ADMIN") {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updates = req.body;
      const updatedProject = await storage.updateProject(id, updates);
      
      res.json(updatedProject);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Favorites routes
  app.get("/api/favorites", requireAuth, requireRole(["BUYER"]), async (req, res) => {
    try {
      const favorites = await storage.getFavorites(req.session.userId!);
      
      const favoritesWithProjects = await Promise.all(
        favorites.map(async (favorite) => {
          const project = await storage.getProject(favorite.projectId);
          return { ...favorite, project };
        })
      );

      res.json(favoritesWithProjects);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/favorites", requireAuth, requireRole(["BUYER"]), async (req, res) => {
    try {
      const schema = z.object({
        projectId: z.string(),
      });

      const { projectId } = schema.parse(req.body);
      const buyerId = req.session.userId!;

      // Check if already favorited
      const isAlreadyFavorite = await storage.isFavorite(buyerId, projectId);
      if (isAlreadyFavorite) {
        return res.status(400).json({ message: "Project already in favorites" });
      }

      const favorite = await storage.createFavorite({
        buyerId,
        projectId,
      });

      res.json(favorite);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/favorites/:projectId", requireAuth, requireRole(["BUYER"]), async (req, res) => {
    try {
      const { projectId } = req.params;
      const buyerId = req.session.userId!;

      await storage.deleteFavorite(buyerId, projectId);
      res.json({ message: "Removed from favorites" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Orders routes
  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      
      let filters: any = { status: status as string };
      
      if (req.session.role === "BUYER") {
        filters.buyerId = req.session.userId;
      } else if (req.session.role === "STUDENT") {
        filters.studentId = req.session.userId;
      }

      const orders = await storage.getOrders(filters);
      
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const project = await storage.getProject(order.projectId);
          const buyer = await storage.getUser(order.buyerId);
          const student = await storage.getUser(order.studentId);
          
          return {
            ...order,
            project,
            buyer: buyer ? { ...buyer, password: undefined } : null,
            student: student ? { ...student, password: undefined } : null,
          };
        })
      );

      res.json(ordersWithDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", requireAuth, requireRole(["BUYER"]), async (req, res) => {
    try {
      const schema = z.object({
        projectId: z.string(),
      });

      const { projectId } = schema.parse(req.body);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const order = await storage.createOrder({
        projectId,
        buyerId: req.session.userId!,
        studentId: project.ownerId,
        amount: project.price,
        status: "PENDING",
        stripeSessionId: null,
      });

      // In a real app, create Stripe checkout session here
      // For demo, mark as paid immediately
      const paidOrder = await storage.updateOrder(order.id, { status: "PAID" });

      res.json(paidOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/verification-queue", requireAuth, requireRole(["ADMIN"]), async (req, res) => {
    try {
      const pendingProfiles = await storage.getPendingVerifications();
      
      const profilesWithUsers = await Promise.all(
        pendingProfiles.map(async (profile) => {
          const user = await storage.getUser(profile.userId);
          return {
            ...profile,
            user: user ? { ...user, password: undefined } : null,
          };
        })
      );

      res.json(profilesWithUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/verify/:userId", requireAuth, requireRole(["ADMIN"]), async (req, res) => {
    try {
      const { userId } = req.params;
      const { status, notes } = req.body;

      if (!["APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedProfile = await storage.updateStudentProfile(userId, {
        verificationStatus: status,
        verificationNotes: notes || null,
      });

      // Create notification for student
      await storage.createNotification({
        userId,
        type: "VERIFICATION_UPDATE",
        payload: { status, notes },
      });

      res.json(updatedProfile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Mock file upload for student ID verification
  app.post("/api/student/verify-id", requireAuth, requireRole(["STUDENT"]), async (req, res) => {
    try {
      // In a real app, handle file upload and OCR here
      const mockOcrData = {
        name: "Extracted Name",
        studentId: "STU-2024-123456",
        university: "Extracted University",
        confidence: 0.87,
      };

      await storage.updateStudentProfile(req.session.userId!, {
        idDocUrl: "mock-document-url.jpg",
        verificationStatus: "PENDING",
      });

      res.json({ 
        message: "ID document uploaded successfully",
        ocrData: mockOcrData 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Statistics for dashboards
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const role = req.session.role!;

      let stats = {};

      if (role === "STUDENT") {
        const projects = await storage.getProjects({ ownerId: userId });
        const orders = await storage.getOrders({ studentId: userId });
        const totalEarnings = orders
          .filter(o => o.status === "PAID")
          .reduce((sum, o) => sum + o.amount, 0);
        
        stats = {
          totalEarnings,
          activeOrders: orders.filter(o => ["PENDING", "PAID"].includes(o.status)).length,
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.status === "LISTED").length,
        };
      } else if (role === "BUYER") {
        const orders = await storage.getOrders({ buyerId: userId });
        const favorites = await storage.getFavorites(userId);
        
        stats = {
          totalPurchases: orders.length,
          activePurchases: orders.filter(o => ["PENDING", "PAID"].includes(o.status)).length,
          totalFavorites: favorites.length,
          totalSpent: orders
            .filter(o => o.status === "PAID")
            .reduce((sum, o) => sum + o.amount, 0),
        };
      } else if (role === "ADMIN") {
        const allUsers = Array.from((storage as any).users.values());
        const pendingVerifications = await storage.getPendingVerifications();
        const allProjects = await storage.getProjects();
        const allOrders = await storage.getOrders();
        
        stats = {
          totalStudents: allUsers.filter((u: any) => u.role === "STUDENT").length,
          pendingVerifications: pendingVerifications.length,
          totalProjects: allProjects.length,
          activeProjects: allProjects.filter(p => p.status === "LISTED").length,
          monthlyGMV: allOrders
            .filter(o => o.status === "PAID")
            .reduce((sum, o) => sum + o.amount, 0),
        };
      }

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
