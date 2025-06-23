# Investme MVP - Plataforma Inteligente de Crédito Empresarial

## Overview

Investme is a comprehensive financial platform that connects entrepreneurs seeking business credit with investors through intelligent credit analysis and advanced valuation technologies. The platform serves as an intermediary marketplace with three primary user types: entrepreneurs (credit seekers), investors (credit analyzers), and administrators (platform managers).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and builds
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Theme System**: Custom CSS variables with support for light/dark modes and role-based color schemes

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript for type safety across the entire stack
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with role-based access control
- **File Upload**: Multer for handling company document and image uploads
- **API Design**: RESTful API with consistent error handling and response formats

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL adapter for type-safe database operations
- **Schema**: Comprehensive relational schema supporting multi-user roles, financial data, and audit trails
- **Key Tables**: users, companies, credit_requests, valuations, messages, audit_log
- **Migrations**: Managed through Drizzle Kit with version control

## Key Components

### User Management System
- **Multi-role Support**: Entrepreneurs, investors, and admin users with granular permissions
- **Approval Workflow**: Staged approval process for user registration and document verification
- **Profile Management**: Comprehensive user profiles with address, contact, and financial information

### Company Registration & Management
- **Comprehensive Data Collection**: Legal information, financial metrics, operational data
- **Document Upload**: Support for company documents and images
- **Shareholders & Guarantees**: Detailed tracking of company ownership and collateral
- **Status Management**: Approval workflow for company registrations

### Credit Request System
- **Request Creation**: Entrepreneurs can create credit requests linked to approved companies
- **Investor Analysis**: 24-hour time-boxed analysis window for investors
- **Document Management**: File upload support for supporting documentation
- **Status Tracking**: Complete lifecycle management from submission to approval/rejection

### Valuation Engine
- **DCF Analysis**: Discounted Cash Flow calculations with configurable parameters
- **Multiple Valuation**: Market multiple-based valuations (P/E, EV/EBITDA, etc.)
- **Historical Tracking**: Version control for valuation calculations
- **Export Functionality**: PDF generation for valuation reports

### Communication System
- **Messages**: Internal messaging system between entrepreneurs, investors, and admins
- **Notifications**: Platform-wide notification system with read tracking
- **Network Posts**: Social network-style posting for user engagement
- **Real-time Updates**: Periodic refresh for live communication

### Administrative Backoffice
- **User Management**: Admin tools for approving users and managing roles
- **Content Moderation**: Review and approval workflows for companies and credit requests
- **Audit System**: Comprehensive logging of all administrative actions
- **Analytics Dashboard**: Key metrics and KPIs for platform monitoring

## Data Flow

### User Registration Flow
1. User selects role (entrepreneur/investor) and completes registration
2. Email verification and document upload
3. Admin review and approval process
4. Account activation and access to platform features

### Credit Request Flow
1. Entrepreneur registers company with financial data
2. Admin approves company registration
3. Entrepreneur creates credit request
4. Investors review and analyze request within 24-hour window
5. Admin makes final approval/rejection decision
6. Communication and follow-up through messaging system

### Valuation Process
1. Company financial data input
2. Selection of valuation method (DCF or multiples)
3. Parameter configuration and calculation
4. Results review and export
5. Historical tracking and comparison

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless adapter
- **bcrypt**: Password hashing for security
- **jsonwebtoken**: JWT token generation and validation
- **multer**: File upload handling
- **drizzle-orm**: Type-safe database operations

### UI Dependencies
- **@radix-ui/**: Complete suite of accessible UI primitives
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form management
- **zod**: Runtime type validation
- **tailwindcss**: Utility-first CSS framework

### Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety across the stack
- **drizzle-kit**: Database migration management
- **esbuild**: Fast bundling for production builds

## Deployment Strategy

### Environment Configuration
- **Development**: Local development with hot reload via Vite
- **Production**: Node.js server with built static assets
- **Database**: PostgreSQL with SSL support required
- **File Storage**: Local file system for uploads (scalable to cloud storage)

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Build Process**: `npm run build` creates production bundle
- **Start Command**: `npm run start` for production, `npm run dev` for development
- **Port Configuration**: Application serves on port 5000

### Security Considerations
- JWT tokens with configurable expiration
- Password hashing with bcrypt
- File upload restrictions and validation
- CORS configuration for allowed origins
- Environment variable management for sensitive data

## Changelog

Changelog:
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.