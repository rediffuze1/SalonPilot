# SalonPilot - Salon Appointment Booking Application

## Overview

SalonPilot is a web application designed for hair salons to manage appointments and allow clients to book services online. The application features both traditional form-based booking and voice-based AI receptionist functionality. Built with a modern tech stack, it provides salon owners with comprehensive management tools while offering clients a seamless booking experience.

**Key Features:**
- Client appointment booking via web forms or voice interface
- Salon management dashboard for owners/managers
- Service, stylist, and client management
- Calendar and scheduling system
- Replit Authentication integration
- Pink-themed, minimal, premium UI design

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript
- Vite as build tool and development server
- Wouter for client-side routing
- TanStack Query (React Query) for server state management
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom pink color scheme

**Design System:**
- Custom color palette with primary pink (#FF3EB5) on white background
- Inter font family for typography
- Glassmorphism button styling with subtle animations
- Organic shapes background animations for visual interest
- Fully responsive design with mobile-first approach

**Key Architectural Decisions:**
- Component-based architecture with reusable UI components from Shadcn
- Type-safe routing with Wouter instead of React Router for lighter bundle size
- Centralized API request handling through custom query client wrapper
- Form validation using React Hook Form with Zod schemas
- Separate authenticated and unauthenticated route handling based on user session

### Backend Architecture

**Technology Stack:**
- Express.js server
- TypeScript throughout
- Drizzle ORM for database operations
- Neon serverless PostgreSQL database
- Session-based authentication via Replit Auth (OpenID Connect)

**Server Structure:**
- Single entry point (`server/index.ts`) with middleware setup
- Route registration pattern for API endpoints
- Request logging middleware for debugging
- Session storage using PostgreSQL via connect-pg-simple
- Storage layer abstraction for database operations

**Key Architectural Decisions:**
- RESTful API design with `/api/*` routes
- Separation of concerns: routes, storage layer, and database connection
- Middleware-based authentication checks using `isAuthenticated` guard
- Type-safe database schemas shared between client and server via `@shared/schema`
- Session persistence in database for scalability

### Data Architecture

**Database Schema (PostgreSQL via Drizzle):**

**Core Tables:**
- `sessions` - Required for Replit Auth session management
- `users` - User accounts (required for Replit Auth)
- `salons` - Salon information linked to user accounts
- `services` - Services offered by salons (duration, pricing, tags)
- `stylists` - Salon staff members with specialties
- `clients` - Customer records with contact information
- `appointments` - Scheduled bookings linking clients, stylists, and services
- `salonHours` - Operating hours configuration
- `stylistSchedule` - Individual stylist availability

**Schema Design Patterns:**
- UUID primary keys generated via PostgreSQL
- Foreign key relationships with proper constraints
- JSON/JSONB for flexible array data (tags, specialties)
- Timestamp tracking (createdAt, updatedAt) on all major tables
- Zod schemas for runtime validation matching database schema

**Key Architectural Decisions:**
- Drizzle ORM chosen for type-safety and lightweight design
- Schema-first approach with TypeScript types derived from Drizzle definitions
- Shared schema location (`shared/schema.ts`) for client-server type consistency
- Decimal type for pricing to avoid floating-point issues
- Support for multi-tenancy via userId linking

### Authentication & Authorization

**Replit Auth Integration:**
- OpenID Connect (OIDC) based authentication
- Passport.js strategy for session management
- Mandatory `sessions` and `users` tables for Replit Auth compatibility
- Session stored server-side in PostgreSQL
- HTTP-only secure cookies for session tokens

**Authorization Model:**
- Protected routes require authentication via `isAuthenticated` middleware
- Salon ownership verified via userId matching
- Public routes: landing, booking form, voice interface
- Protected routes: dashboard, management pages

**Key Architectural Decisions:**
- Session-based auth chosen over JWT for simplicity and security
- Replit Auth provides OAuth integration (Google, Apple) out of the box
- User data synchronized from OIDC claims to local database
- Graceful handling of unauthorized requests with 401 redirects

## External Dependencies

### Third-Party Services

**Replit Platform:**
- Replit Auth (OIDC) for user authentication
- Replit deployment environment variables
- Replit development plugins (Cartographer, dev banner, error overlay)

**Database:**
- Neon Serverless PostgreSQL
- WebSocket connection support for serverless environments
- Connection pooling via @neondatabase/serverless

**Payment Processing:**
- Stripe integration (@stripe/stripe-js, @stripe/react-stripe-js)
- Client-side Stripe.js for PCI compliance
- React components for payment forms

### Key Libraries & Frameworks

**UI & Styling:**
- Radix UI primitives (30+ components for accessible UI)
- Tailwind CSS with custom configuration
- class-variance-authority for component variants
- react-day-picker for calendar functionality
- date-fns for date manipulation and formatting (French locale support)

**State Management:**
- @tanstack/react-query for server state and caching
- React Hook Form for form state management
- Zod for schema validation

**Development Tools:**
- tsx for TypeScript execution in development
- esbuild for production server bundling
- Vite for frontend development and building
- Drizzle Kit for database migrations

**Utilities:**
- wouter for lightweight client-side routing
- nanoid for generating unique IDs
- memoizee for caching expensive operations
- ws for WebSocket support (Neon database)

### API Integrations (Planned/Future)

**Voice Recognition & AI:**
- Voice interface component exists but requires external speech-to-text API
- AI receptionist functionality needs integration with LLM service

**Key Architectural Decisions:**
- Dependencies kept minimal to reduce bundle size and complexity
- Shadcn components used as source code (not package) for customization
- Serverless-first database choice for Replit deployment compatibility
- French locale support throughout (date-fns, UI text)