import { 
  type User, 
  type InsertUser,
  type StudentProfile,
  type InsertStudentProfile,
  type BuyerProfile,
  type InsertBuyerProfile,
  type Project,
  type InsertProject,
  type Order,
  type InsertOrder,
  type Favorite,
  type InsertFavorite,
  type Review,
  type InsertReview,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Student Profiles
  getStudentProfile(userId: string): Promise<StudentProfile | undefined>;
  createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  updateStudentProfile(userId: string, updates: Partial<StudentProfile>): Promise<StudentProfile>;
  getPendingVerifications(): Promise<StudentProfile[]>;

  // Buyer Profiles
  getBuyerProfile(userId: string): Promise<BuyerProfile | undefined>;
  createBuyerProfile(profile: InsertBuyerProfile): Promise<BuyerProfile>;

  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getProjectBySlug(slug: string): Promise<Project | undefined>;
  getProjects(filters?: { ownerId?: string; status?: string; limit?: number; offset?: number }): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  searchProjects(query: string, filters?: { category?: string; university?: string; priceRange?: string }): Promise<Project[]>;

  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getOrders(filters?: { buyerId?: string; studentId?: string; status?: string }): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order>;

  // Favorites
  getFavorites(buyerId: string): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(buyerId: string, projectId: string): Promise<void>;
  isFavorite(buyerId: string, projectId: string): Promise<boolean>;

  // Reviews
  getReviewsByProject(projectId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private studentProfiles: Map<string, StudentProfile>;
  private buyerProfiles: Map<string, BuyerProfile>;
  private projects: Map<string, Project>;
  private orders: Map<string, Order>;
  private favorites: Map<string, Favorite>;
  private reviews: Map<string, Review>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.studentProfiles = new Map();
    this.buyerProfiles = new Map();
    this.projects = new Map();
    this.orders = new Map();
    this.favorites = new Map();
    this.reviews = new Map();
    this.notifications = new Map();

    // Seed with demo data
    this.seedData();
  }

  private seedData() {
    // Create admin user
    const adminId = randomUUID();
    const admin: User = {
      id: adminId,
      email: "admin@collabotree.com",
      password: "admin123",
      name: "Admin User",
      role: "ADMIN",
      avatarUrl: null,
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);

    // Create student users
    const studentUsers = [
      {
        email: "alex.kim@mit.edu",
        name: "Alex Kim",
        university: "MIT",
        studentId: "STU-2024-001",
        program: "Computer Science",
        skills: ["React", "Node.js", "MongoDB", "JavaScript"],
        projects: [
          {
            title: "Full-Stack React Application",
            description: "I'll build a modern, responsive web application using React, Node.js, and MongoDB with authentication and payment integration.",
            price: 299,
            category: "Web Development",
            deliveryTime: 8,
          }
        ]
      },
      {
        email: "emma.rodriguez@stanford.edu",
        name: "Emma Rodriguez",
        university: "Stanford",
        studentId: "STU-2024-002",
        program: "Design",
        skills: ["UI/UX", "Figma", "Branding", "Graphic Design"],
        projects: [
          {
            title: "Brand Identity Package",
            description: "Complete brand identity design including logo, business cards, letterhead, and brand guidelines for startups.",
            price: 149,
            category: "Design",
            deliveryTime: 3,
          }
        ]
      },
      {
        email: "david.park@berkeley.edu",
        name: "David Park",
        university: "UC Berkeley",
        studentId: "STU-2024-003",
        program: "Data Science",
        skills: ["Python", "Machine Learning", "Tableau", "SQL"],
        projects: [
          {
            title: "Data Analysis & Visualization",
            description: "Comprehensive data analysis with Python, machine learning insights, and interactive dashboards using Tableau.",
            price: 399,
            category: "Data Science",
            deliveryTime: 6,
          }
        ]
      },
      {
        email: "sarah.chen@berkeley.edu",
        name: "Sarah Chen",
        university: "UC Berkeley",
        studentId: "STU-2024-004",
        program: "Computer Science",
        skills: ["React", "TypeScript", "Node.js"],
        projects: []
      }
    ];

    studentUsers.forEach((studentData, index) => {
      const userId = randomUUID();
      const user: User = {
        id: userId,
        email: studentData.email,
        password: "password123",
        name: studentData.name,
        role: "STUDENT",
        avatarUrl: null,
        createdAt: new Date(),
      };
      this.users.set(userId, user);

      const profileId = randomUUID();
      const profile: StudentProfile = {
        id: profileId,
        userId,
        university: studentData.university,
        studentId: studentData.studentId,
        program: studentData.program,
        verificationStatus: index === 3 ? "PENDING" : "APPROVED", // Last one pending for demo
        verificationNotes: null,
        idDocUrl: null,
        selfieUrl: null,
        createdAt: new Date(),
      };
      this.studentProfiles.set(userId, profile);

      // Create projects for this student
      studentData.projects.forEach((projectData) => {
        const projectId = randomUUID();
        const slug = projectData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const project: Project = {
          id: projectId,
          ownerId: userId,
          title: projectData.title,
          slug,
          description: projectData.description,
          skills: studentData.skills,
          tags: [projectData.category],
          price: projectData.price,
          status: "LISTED",
          visibility: "PUBLIC",
          coverImageUrl: null,
          deliveryTime: projectData.deliveryTime,
          revisions: 3,
          createdAt: new Date(),
        };
        this.projects.set(projectId, project);
      });
    });

    // Create buyer users
    const buyerUsers = [
      {
        email: "buyer1@company.com",
        name: "John Smith",
        companyName: "Tech Startup Inc",
      },
      {
        email: "buyer2@business.com",
        name: "Jane Doe",
        companyName: "Marketing Solutions",
      }
    ];

    buyerUsers.forEach((buyerData) => {
      const userId = randomUUID();
      const user: User = {
        id: userId,
        email: buyerData.email,
        password: "password123",
        name: buyerData.name,
        role: "BUYER",
        avatarUrl: null,
        createdAt: new Date(),
      };
      this.users.set(userId, user);

      const profileId = randomUUID();
      const profile: BuyerProfile = {
        id: profileId,
        userId,
        companyName: buyerData.companyName,
        website: null,
        billingAddress: null,
        createdAt: new Date(),
      };
      this.buyerProfiles.set(userId, profile);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "STUDENT",
      avatarUrl: insertUser.avatarUrl || null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Student Profile methods
  async getStudentProfile(userId: string): Promise<StudentProfile | undefined> {
    return this.studentProfiles.get(userId);
  }

  async createStudentProfile(insertProfile: InsertStudentProfile): Promise<StudentProfile> {
    const id = randomUUID();
    const profile: StudentProfile = { 
      ...insertProfile, 
      id, 
      verificationStatus: insertProfile.verificationStatus || "PENDING",
      verificationNotes: insertProfile.verificationNotes || null,
      idDocUrl: insertProfile.idDocUrl || null,
      selfieUrl: insertProfile.selfieUrl || null,
      createdAt: new Date() 
    };
    this.studentProfiles.set(insertProfile.userId, profile);
    return profile;
  }

  async updateStudentProfile(userId: string, updates: Partial<StudentProfile>): Promise<StudentProfile> {
    const profile = this.studentProfiles.get(userId);
    if (!profile) throw new Error("Student profile not found");
    
    const updatedProfile = { ...profile, ...updates };
    this.studentProfiles.set(userId, updatedProfile);
    return updatedProfile;
  }

  async getPendingVerifications(): Promise<StudentProfile[]> {
    return Array.from(this.studentProfiles.values())
      .filter(profile => profile.verificationStatus === "PENDING");
  }

  // Buyer Profile methods
  async getBuyerProfile(userId: string): Promise<BuyerProfile | undefined> {
    return this.buyerProfiles.get(userId);
  }

  async createBuyerProfile(insertProfile: InsertBuyerProfile): Promise<BuyerProfile> {
    const id = randomUUID();
    const profile: BuyerProfile = { 
      ...insertProfile, 
      id, 
      companyName: insertProfile.companyName || null,
      website: insertProfile.website || null,
      billingAddress: insertProfile.billingAddress || null,
      createdAt: new Date() 
    };
    this.buyerProfiles.set(insertProfile.userId, profile);
    return profile;
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    return Array.from(this.projects.values()).find(project => project.slug === slug);
  }

  async getProjects(filters?: { ownerId?: string; status?: string; limit?: number; offset?: number }): Promise<Project[]> {
    let projects = Array.from(this.projects.values());
    
    if (filters?.ownerId) {
      projects = projects.filter(p => p.ownerId === filters.ownerId);
    }
    
    if (filters?.status) {
      projects = projects.filter(p => p.status === filters.status);
    }
    
    projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (filters?.offset) {
      projects = projects.slice(filters.offset);
    }
    
    if (filters?.limit) {
      projects = projects.slice(0, filters.limit);
    }
    
    return projects;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { 
      ...insertProject, 
      id, 
      status: insertProject.status || "DRAFT",
      visibility: insertProject.visibility || "PUBLIC",
      coverImageUrl: insertProject.coverImageUrl || null,
      revisions: insertProject.revisions || 3,
      createdAt: new Date() 
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) throw new Error("Project not found");
    
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async searchProjects(query: string, filters?: { category?: string; university?: string; priceRange?: string }): Promise<Project[]> {
    let projects = Array.from(this.projects.values())
      .filter(p => p.status === "LISTED" && p.visibility === "PUBLIC");
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      projects = projects.filter(p => 
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.skills.some(skill => skill.toLowerCase().includes(lowerQuery)) ||
        p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    
    if (filters?.category && filters.category !== "All Categories") {
      projects = projects.filter(p => p.tags.includes(filters.category!));
    }
    
    return projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrders(filters?: { buyerId?: string; studentId?: string; status?: string }): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    
    if (filters?.buyerId) {
      orders = orders.filter(o => o.buyerId === filters.buyerId);
    }
    
    if (filters?.studentId) {
      orders = orders.filter(o => o.studentId === filters.studentId);
    }
    
    if (filters?.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      ...insertOrder, 
      id, 
      status: insertOrder.status || "PENDING",
      stripeSessionId: insertOrder.stripeSessionId || null,
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");
    
    const updatedOrder = { ...order, ...updates };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Favorite methods
  async getFavorites(buyerId: string): Promise<Favorite[]> {
    return Array.from(this.favorites.values())
      .filter(f => f.buyerId === buyerId);
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = randomUUID();
    const favorite: Favorite = { 
      ...insertFavorite, 
      id, 
      createdAt: new Date() 
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async deleteFavorite(buyerId: string, projectId: string): Promise<void> {
    const favorite = Array.from(this.favorites.entries())
      .find(([_, f]) => f.buyerId === buyerId && f.projectId === projectId);
    
    if (favorite) {
      this.favorites.delete(favorite[0]);
    }
  }

  async isFavorite(buyerId: string, projectId: string): Promise<boolean> {
    return Array.from(this.favorites.values())
      .some(f => f.buyerId === buyerId && f.projectId === projectId);
  }

  // Review methods
  async getReviewsByProject(projectId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(r => {
        const order = Array.from(this.orders.values())
          .find(o => o.id === r.orderId);
        return order?.projectId === projectId;
      });
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = { 
      ...insertReview, 
      id, 
      comment: insertReview.comment || null,
      createdAt: new Date() 
    };
    this.reviews.set(id, review);
    return review;
  }

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      readAt: null,
      createdAt: new Date() 
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.readAt = new Date();
      this.notifications.set(id, notification);
    }
  }
}

export const storage = new MemStorage();
