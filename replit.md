# Investme MVP - Intelligent Credit Platform

## Overview

Investme MVP is a comprehensive financial platform connecting entrepreneurs and investors through intelligent credit analysis and enterprise valuation technologies. The platform provides a complete ecosystem for business loan applications, investor analysis, and administrative oversight with advanced features like DCF valuation, real-time messaging, and granular approval workflows.

## System Architecture

The application follows a modern full-stack architecture with clear separation of concerns:

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and CSS variables
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with role-based access control
- **File Upload**: Multer for handling company document and image uploads
- **API Design**: RESTful API with consistent error handling and response formats

### Database Design
- **Database**: PostgreSQL with comprehensive schema design
- **Migration System**: Drizzle Kit for database migrations
- **Multi-tenant Support**: Role-based data access (entrepreneurs, investors, admins)
- **Audit Trail**: Complete audit logging for all administrative actions
- **Relationships**: Well-defined foreign key relationships with proper indexing

## Key Components

### User Management System
- **Multi-role Architecture**: Entrepreneurs, investors, and administrators with distinct permissions
- **Granular Approval Process**: Separate approval stages for registration, email confirmation, and document verification
- **Profile Management**: Comprehensive user profiles with address, contact, and business information

### Company Management
- **Company Registration**: Detailed company information including financial data, shareholders, and guarantees
- **Document Upload**: Support for company images and documentation
- **Status Tracking**: Multi-stage approval process with administrative oversight
- **Financial Data**: Integration of revenue, EBITDA, debt, and employee count

### Credit Request System
- **Loan Applications**: Comprehensive credit request forms linked to company profiles
- **Investor Analysis**: 24-hour analysis window for investor responses
- **Document Management**: File upload support for supporting documentation
- **Status Workflow**: Pending, approved, rejected, and under review states

### Valuation Engine
- **DCF Analysis**: Discounted Cash Flow calculations with configurable parameters
- **Market Multiples**: Valuation using industry multiples (P/E, EV/EBITDA, etc.)
- **Historical Tracking**: Storage and comparison of multiple valuation scenarios
- **Export Functionality**: PDF generation for valuation reports

### Messaging System
- **Real-time Communication**: Conversation threads between entrepreneurs and investors
- **Context-aware Messaging**: Messages linked to specific credit requests
- **Notification System**: Unread message tracking and alerts
- **Administrative Oversight**: Backoffice access to all communication

### Administrative Dashboard
- **Comprehensive Analytics**: KPIs and metrics for platform performance
- **Approval Workflows**: Granular control over user, company, and credit approvals
- **Audit Logging**: Complete trail of all administrative actions
- **User Management**: Admin user creation and role management

## Data Flow

### User Registration Flow
1. User selects type (entrepreneur/investor) and completes registration
2. System creates user record with pending status
3. Admin reviews and approves registration
4. User receives confirmation and can access platform features

### Credit Request Flow
1. Entrepreneur creates company profile with financial data
2. Company undergoes administrative review and approval
3. Entrepreneur submits credit request with supporting documents
4. Request appears in investor network for analysis
5. Investors have 24 hours to analyze and respond
6. Administrative team reviews investor responses
7. Final approval/rejection communicated to entrepreneur

### Valuation Flow
1. Company financial data serves as input for valuation models
2. System supports both DCF and multiples-based valuations
3. Valuations are stored with versioning for historical comparison
4. Results integrate with credit request evaluation process

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT authentication
- **multer**: File upload handling

### Development Dependencies
- **TypeScript**: Static typing across the stack
- **Vite**: Development server and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

### Optional Integrations
- **SMTP**: Email notifications (configurable)
- **SSL/TLS**: HTTPS support for production deployment

## Deployment Strategy

### Development Environment
- **Database**: PostgreSQL with Drizzle migrations
- **Development Server**: Vite with hot module replacement
- **Port Configuration**: Development server on port 5000
- **Environment Variables**: Separate configuration for development and production

### Production Deployment
- **Build Process**: Vite build for frontend, ESBuild for backend
- **Database**: PostgreSQL with SSL required
- **Security**: JWT secrets, HTTPS enforcement, input validation
- **File Storage**: Local file system with configurable upload limits
- **Monitoring**: Structured logging and error handling

### Platform Compatibility
- **Node.js**: Version 18+ LTS required
- **Database**: PostgreSQL 14+ with SSL support
- **Memory**: Minimum 2GB RAM for production
- **SSL**: Certificate required for production deployment

## Changelog

```
Changelog:
- June 23, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```