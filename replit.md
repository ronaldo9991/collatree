# Overview

CollaboTree is a full-stack student-only freelancing marketplace built with React/TypeScript frontend and Express.js backend. The platform connects verified students with buyers looking for student talent, featuring role-based access control for Students, Buyers, and Admins. The application includes project marketplace functionality, user verification systems, and comprehensive dashboard interfaces for each user role.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for client-side routing with role-based route protection
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Authentication**: Session-based auth with role guards protecting routes and components

## Backend Architecture
- **Framework**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Express sessions for stateful authentication
- **File Structure**: Separation of concerns with routes, storage abstraction, and middleware
- **Development**: Vite middleware integration for hot module replacement in development

## Database Design
- **Users Table**: Core user information with role-based access (STUDENT, BUYER, ADMIN)
- **Profile Tables**: Separate student and buyer profile tables with role-specific fields
- **Projects Table**: Project listings with skills, pricing, and status management
- **Verification System**: Student ID verification with document upload and admin approval workflow
- **Relationships**: Foreign key relationships linking users to profiles and projects

## Authentication & Authorization
- **Session Management**: Express-session with secure cookie configuration
- **Role-Based Access Control**: Middleware functions requiring specific roles for route access
- **Route Protection**: Client-side route guards preventing unauthorized access
- **Profile Verification**: Multi-step student verification process with document upload

## Component Architecture
- **Reusable Components**: Modular UI components (NavHeader, ProjectCard, StatCard, etc.)
- **Role-Specific Dashboards**: Separate dashboard interfaces for Students, Buyers, and Admins
- **Form Components**: Type-safe form components with validation and error handling
- **Layout Components**: Consistent navigation and page structure across the application

# External Dependencies

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Headless UI components for accessibility and behavior
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe variant styling system

## Database and ORM
- **PostgreSQL**: Primary database (configured for Neon/Replit hosting)
- **Drizzle ORM**: Type-safe database operations with schema definition
- **Drizzle Kit**: Database migration and schema management tools

## Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast build tool and development server
- **ESBuild**: Production build bundling for server code
- **Zod**: Runtime type validation for forms and API endpoints

## Authentication and Sessions
- **Express Session**: Server-side session management
- **Connect PG Simple**: PostgreSQL session store adapter
- **Crypto**: Node.js crypto for session security and UUID generation

## State Management
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management with performance optimization
- **Hookform Resolvers**: Zod integration for form validation

## Additional Integrations
- **Stripe**: Payment processing (React Stripe.js integration)
- **File Upload**: Planned integration for student ID verification documents
- **Email**: Planned transactional email capabilities
- **Date Handling**: Date-fns library for date manipulation and formatting