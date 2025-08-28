import { randomUUID } from "crypto";

// Type definitions
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "STUDENT" | "BUYER" | "ADMIN";
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertUser {
  email: string;
  password: string;
  name: string;
  role: "STUDENT" | "BUYER" | "ADMIN";
  avatarUrl?: string | null;
}

export interface StudentProfile {
  userId: string;
  university: string;
  studentId: string;
  program: string;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  verificationNotes: string | null;
  idDocUrl: string | null;
  selfieUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertStudentProfile {
  userId: string;
  university: string;
  studentId: string;
  program: string;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  verificationNotes?: string | null;
  idDocUrl?: string | null;
  selfieUrl?: string | null;
}

export interface BuyerProfile {
  userId: string;
  companyName: string | null;
  website: string | null;
  billingAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertBuyerProfile {
  userId: string;
  companyName?: string | null;
  website?: string | null;
  billingAddress?: string | null;
}

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  skills: string[];
  tags: string[];
  price: number;
  deliveryTime: number;
  revisions: number;
  status: "DRAFT" | "LISTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  visibility: "PUBLIC" | "PRIVATE";
  slug: string;
  coverImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertProject {
  ownerId: string;
  title: string;
  description: string;
  skills: string[];
  tags: string[];
  price: number;
  deliveryTime: number;
  revisions?: number;
  status?: "DRAFT" | "LISTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  visibility?: "PUBLIC" | "PRIVATE";
  slug: string;
  coverImageUrl?: string | null;
}

export interface Order {
  id: string;
  projectId: string;
  buyerId: string;
  studentId: string;
  amount: number;
  status: "PENDING" | "PAID" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  stripeSessionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertOrder {
  projectId: string;
  buyerId: string;
  studentId: string;
  amount: number;
  status?: "PENDING" | "PAID" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  stripeSessionId?: string | null;
}

export interface Favorite {
  id: string;
  buyerId: string;
  projectId: string;
  createdAt: Date;
}

export interface InsertFavorite {
  buyerId: string;
  projectId: string;
}

export interface Review {
  id: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface InsertReview {
  orderId: string;
  rating: number;
  comment: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "ORDER_UPDATE" | "VERIFICATION_UPDATE" | "PROJECT_UPDATE" | "PAYMENT_RECEIVED";
  payload: any;
  readAt: Date | null;
  createdAt: Date;
}

export interface InsertNotification {
  userId: string;
  type: "ORDER_UPDATE" | "VERIFICATION_UPDATE" | "PROJECT_UPDATE" | "PAYMENT_RECEIVED";
  payload: any;
  readAt?: Date | null;
}

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

// In-memory implementation
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
      updatedAt: new Date(),
    };
    this.users.set(adminId, admin);

    // Create demo student
    const studentId = randomUUID();
    const student: User = {
      id: studentId,
      email: "student@university.edu",
      password: "student123",
      name: "John Student",
      role: "STUDENT",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(studentId, student);

    const studentProfile: StudentProfile = {
      userId: studentId,
      university: "Tech University",
      studentId: "STU-2024-001",
      program: "Computer Science",
      verificationStatus: "APPROVED",
      verificationNotes: "Documents verified successfully",
      idDocUrl: "https://example.com/id-doc.jpg",
      selfieUrl: "https://example.com/selfie.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.studentProfiles.set(studentId, studentProfile);

    // Create demo buyer
    const buyerId = randomUUID();
    const buyer: User = {
      id: buyerId,
      email: "buyer@company.com",
      password: "buyer123",
      name: "Jane Buyer",
      role: "BUYER",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(buyerId, buyer);

    const buyerProfile: BuyerProfile = {
      userId: buyerId,
      companyName: "Tech Solutions Inc",
      website: "https://techsolutions.com",
      billingAddress: "123 Business St, Tech City, TC 12345",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.buyerProfiles.set(buyerId, buyerProfile);

    // Create demo projects
    const project1Id = randomUUID();
    const project1: Project = {
      id: project1Id,
      ownerId: studentId,
      title: "Modern E-commerce Website",
      description: "A full-stack e-commerce platform with React frontend and Node.js backend. Features include user authentication, product catalog, shopping cart, payment integration, and admin dashboard.",
      skills: ["React", "Node.js", "MongoDB", "Stripe", "TypeScript"],
      tags: ["web-development", "e-commerce", "full-stack"],
      price: 500,
      deliveryTime: 14,
      revisions: 3,
      status: "LISTED",
      visibility: "PUBLIC",
      slug: "modern-ecommerce-website",
      coverImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(project1Id, project1);

    const project2Id = randomUUID();
    const project2: Project = {
      id: project2Id,
      ownerId: studentId,
      title: "Mobile App for Task Management",
      description: "A cross-platform mobile application for task and project management. Built with React Native, featuring real-time collaboration, push notifications, and offline support.",
      skills: ["React Native", "Firebase", "Redux", "TypeScript", "Expo"],
      tags: ["mobile-development", "task-management", "cross-platform"],
      price: 800,
      deliveryTime: 21,
      revisions: 2,
      status: "LISTED",
      visibility: "PUBLIC",
      slug: "mobile-task-management-app",
      coverImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(project2Id, project2);

    const project3Id = randomUUID();
    const project3: Project = {
      id: project3Id,
      ownerId: studentId,
      title: "Data Analysis Dashboard",
      description: "An interactive dashboard for data visualization and analysis. Built with Python, featuring machine learning models, real-time data processing, and beautiful charts.",
      skills: ["Python", "Pandas", "Matplotlib", "Scikit-learn", "Flask"],
      tags: ["data-science", "machine-learning", "visualization"],
      price: 600,
      deliveryTime: 18,
      revisions: 3,
      status: "LISTED",
      visibility: "PUBLIC",
      slug: "data-analysis-dashboard",
      coverImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(project3Id, project3);
  }

  // Users
  async getUser(id: string) {
    return this.users.get(id);
  }

  async getUserByEmail(email: string) {
    const users = Array.from(this.users.values());
    for (const user of users) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser) {
    const newUser: User = {
      id: randomUUID(),
      ...user,
      avatarUrl: user.avatarUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>) {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Student Profiles
  async getStudentProfile(userId: string) {
    return this.studentProfiles.get(userId);
  }

  async createStudentProfile(profile: InsertStudentProfile) {
    const newProfile: StudentProfile = {
      ...profile,
      verificationStatus: profile.verificationStatus || "PENDING",
      verificationNotes: profile.verificationNotes || null,
      idDocUrl: profile.idDocUrl || null,
      selfieUrl: profile.selfieUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.studentProfiles.set(profile.userId, newProfile);
    return newProfile;
  }

  async updateStudentProfile(userId: string, updates: Partial<StudentProfile>) {
    const profile = this.studentProfiles.get(userId);
    if (!profile) {
      throw new Error("Student profile not found");
    }
    const updatedProfile = { ...profile, ...updates, updatedAt: new Date() };
    this.studentProfiles.set(userId, updatedProfile);
    return updatedProfile;
  }

  async getPendingVerifications() {
    return Array.from(this.studentProfiles.values()).filter(
      (profile) => profile.verificationStatus === "PENDING"
    );
  }

  // Buyer Profiles
  async getBuyerProfile(userId: string) {
    return this.buyerProfiles.get(userId);
  }

  async createBuyerProfile(profile: InsertBuyerProfile) {
    const newProfile: BuyerProfile = {
      ...profile,
      companyName: profile.companyName || null,
      website: profile.website || null,
      billingAddress: profile.billingAddress || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.buyerProfiles.set(profile.userId, newProfile);
    return newProfile;
  }

  // Projects
  async getProject(id: string) {
    return this.projects.get(id);
  }

  async getProjectBySlug(slug: string) {
    const projects = Array.from(this.projects.values());
    for (const project of projects) {
      if (project.slug === slug) {
        return project;
      }
    }
    return undefined;
  }

  async getProjects(filters?: { ownerId?: string; status?: string; limit?: number; offset?: number }) {
    let projects = Array.from(this.projects.values());

    if (filters?.ownerId) {
      projects = projects.filter((p) => p.ownerId === filters.ownerId);
    }

    if (filters?.status) {
      projects = projects.filter((p) => p.status === filters.status);
    }

    // Sort by creation date (newest first)
    projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filters?.offset) {
      projects = projects.slice(filters.offset);
    }

    if (filters?.limit) {
      projects = projects.slice(0, filters.limit);
    }

    return projects;
  }

  async createProject(project: InsertProject) {
    const newProject: Project = {
      id: randomUUID(),
      ...project,
      revisions: project.revisions || 3,
      status: project.status || "DRAFT",
      visibility: project.visibility || "PUBLIC",
      coverImageUrl: project.coverImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(newProject.id, newProject);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>) {
    const project = this.projects.get(id);
    if (!project) {
      throw new Error("Project not found");
    }
    const updatedProject = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async searchProjects(query: string, _filters?: { category?: string; university?: string; priceRange?: string }) {
    const projects = Array.from(this.projects.values());
    const searchTerm = query.toLowerCase();

    return projects.filter((project) => {
      const titleMatch = project.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = project.description.toLowerCase().includes(searchTerm);
      const skillsMatch = project.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm));
      const tagsMatch = project.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm));

      return titleMatch || descriptionMatch || skillsMatch || tagsMatch;
    });
  }

  // Orders
  async getOrder(id: string) {
    return this.orders.get(id);
  }

  async getOrders(filters?: { buyerId?: string; studentId?: string; status?: string }) {
    let orders = Array.from(this.orders.values());

    if (filters?.buyerId) {
      orders = orders.filter((o) => o.buyerId === filters.buyerId);
    }

    if (filters?.studentId) {
      orders = orders.filter((o) => o.studentId === filters.studentId);
    }

    if (filters?.status) {
      orders = orders.filter((o) => o.status === filters.status);
    }

    // Sort by creation date (newest first)
    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return orders;
  }

  async createOrder(order: InsertOrder) {
    const newOrder: Order = {
      id: randomUUID(),
      ...order,
      status: order.status || "PENDING",
      stripeSessionId: order.stripeSessionId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(newOrder.id, newOrder);
    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<Order>) {
    const order = this.orders.get(id);
    if (!order) {
      throw new Error("Order not found");
    }
    const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Favorites
  async getFavorites(buyerId: string) {
    return Array.from(this.favorites.values()).filter((f) => f.buyerId === buyerId);
  }

  async createFavorite(favorite: InsertFavorite) {
    const newFavorite: Favorite = {
      id: randomUUID(),
      ...favorite,
      createdAt: new Date(),
    };
    this.favorites.set(newFavorite.id, newFavorite);
    return newFavorite;
  }

  async deleteFavorite(buyerId: string, projectId: string) {
    const favorites = Array.from(this.favorites.entries());
    for (const [id, favorite] of favorites) {
      if (favorite.buyerId === buyerId && favorite.projectId === projectId) {
        this.favorites.delete(id);
        return;
      }
    }
  }

  async isFavorite(buyerId: string, projectId: string) {
    const favorites = Array.from(this.favorites.values());
    for (const favorite of favorites) {
      if (favorite.buyerId === buyerId && favorite.projectId === projectId) {
        return true;
      }
    }
    return false;
  }

  // Reviews
  async getReviewsByProject(projectId: string) {
    const reviews: Review[] = [];
    const reviewsList = Array.from(this.reviews.values());
    for (const review of reviewsList) {
      const order = this.orders.get(review.orderId);
      if (order && order.projectId === projectId) {
        reviews.push(review);
      }
    }
    return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createReview(review: InsertReview) {
    const newReview: Review = {
      id: randomUUID(),
      ...review,
      createdAt: new Date(),
    };
    this.reviews.set(newReview.id, newReview);
    return newReview;
  }

  // Notifications
  async getNotifications(userId: string) {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(notification: InsertNotification) {
    const newNotification: Notification = {
      id: randomUUID(),
      ...notification,
      readAt: notification.readAt || null,
      createdAt: new Date(),
    };
    this.notifications.set(newNotification.id, newNotification);
    return newNotification;
  }

  async markNotificationRead(id: string) {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.readAt = new Date();
      this.notifications.set(id, notification);
    }
  }
}

// Export the storage instance
export const storage = new MemStorage();
