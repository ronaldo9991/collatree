export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "BUYER" | "ADMIN";
  avatarUrl?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  university: string;
  studentId: string;
  program: string;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  verificationNotes?: string;
  idDocUrl?: string;
  selfieUrl?: string;
}

export interface BuyerProfile {
  id: string;
  userId: string;
  companyName?: string;
  website?: string;
  billingAddress?: string;
}

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  description: string;
  skills: string[];
  tags: string[];
  price: number;
  status: "DRAFT" | "LISTED" | "HIRED" | "IN_PROGRESS" | "DELIVERED" | "CLOSED";
  visibility: "PUBLIC" | "PRIVATE";
  coverImageUrl?: string;
  deliveryTime: number;
  revisions: number;
  createdAt: Date;
  owner?: AuthUser;
  studentProfile?: StudentProfile;
}

export interface Order {
  id: string;
  projectId: string;
  buyerId: string;
  studentId: string;
  amount: number;
  status: "PENDING" | "PAID" | "REFUNDED" | "DISPUTED";
  stripeSessionId?: string;
  createdAt: Date;
  project?: Project;
  buyer?: AuthUser;
  student?: AuthUser;
}

export interface Favorite {
  id: string;
  buyerId: string;
  projectId: string;
  createdAt: Date;
  project?: Project;
}

export interface Stats {
  totalEarnings?: number;
  activeOrders?: number;
  totalProjects?: number;
  activeProjects?: number;
  totalPurchases?: number;
  activePurchases?: number;
  totalFavorites?: number;
  totalSpent?: number;
  totalStudents?: number;
  pendingVerifications?: number;
  monthlyGMV?: number;
}
