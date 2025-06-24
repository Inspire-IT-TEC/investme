# InvestMe Platform - Complete Project Overview

## Project Description
InvestMe is a comprehensive business platform that connects entrepreneurs with investors through a sophisticated multi-portal system. The platform facilitates company registration, credit requests, investment analysis, and business networking with full administrative oversight.

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query (React Query v5)
- **Routing**: Wouter
- **Authentication**: JWT with session management
- **File Handling**: Multer for uploads
- **Real-time**: WebSocket support

### Portal Structure
1. **Entrepreneur Portal** - Company registration and credit requests
2. **Investor Portal** - Investment analysis and decision making
3. **Backoffice Portal** - Administrative oversight and approvals

## Current Implementation Status

### ✅ Completed Features

#### Authentication & User Management
- User registration and login for entrepreneurs and investors
- JWT-based authentication with session management
- Email verification system
- Password reset functionality
- Role-based access control

#### Entrepreneur Portal
- Complete dashboard with metrics and notifications
- Company registration with document upload
- Credit request submission with detailed forms
- Real-time status tracking
- Mobile-responsive design
- Profile management with company data

#### Investor Portal
- Modern dashboard with investment metrics
- Credit request analysis workflow
- "Minhas Análises" (My Analysis) section
- Company network browsing with Instagram-style galleries
- Real-time messaging system with entrepreneurs
- Mobile-responsive profile navigation
- Collapsible filters for network pages

#### Backoffice Portal
- Administrative dashboard with system metrics
- User management and oversight
- Company approval workflow
- Credit request triaging
- Network management with Instagram-style company galleries
- Analytics and reporting tools

#### Core Systems
- PostgreSQL database with comprehensive schema
- File upload and management system
- Real-time notification system
- Messaging system between investors and entrepreneurs
- Image gallery system with navigation
- Mobile-responsive design across all portals

### 🔄 Recent Improvements
- Fixed mobile responsiveness for investor profile tabs (2x2 grid layout)
- Implemented collapsible filters for mobile network pages
- Enhanced card headers with responsive layouts
- Improved button sizing and spacing for mobile devices
- Added proper typography scaling for different screen sizes

## Database Schema

### Core Tables
- `users` - User authentication and basic info
- `entrepreneurs` - Entrepreneur-specific data
- `investors` - Investor-specific data
- `companies` - Company information and documents
- `credit_requests` - Credit/investment requests
- `messages` - Communication system
- `notifications` - System notifications
- `states` & `cities` - Geographic data

### Key Relationships
- Users → Entrepreneurs/Investors (1:1)
- Companies → Entrepreneurs (N:1)
- Credit Requests → Companies (N:1)
- Messages → Users (N:N via conversations)

## API Endpoints

### Authentication
- `POST /api/entrepreneurs/register` - Entrepreneur registration
- `POST /api/investors/register` - Investor registration
- `POST /api/entrepreneurs/login` - Entrepreneur login
- `POST /api/investors/login` - Investor login

### Company Management
- `POST /api/companies` - Create company
- `GET /api/companies/:id` - Get company details
- `PUT /api/companies/:id` - Update company

### Credit Requests
- `POST /api/credit-requests` - Create credit request
- `GET /api/credit-requests` - List credit requests
- `PUT /api/credit-requests/:id/status` - Update status

### Investment Analysis
- `GET /api/investor/credit-requests` - Available requests
- `GET /api/investor/my-analysis` - Investor's analyses
- `POST /api/investor/accept-analysis` - Accept for analysis
- `POST /api/investor/approve-request` - Approve investment

### Messaging
- `GET /api/conversations/:id` - Get conversation
- `POST /api/conversations/:id/messages` - Send message

### Network & Social
- `GET /api/network/companies` - Company network
- `GET /api/network/posts` - Social posts
- `POST /api/network/posts` - Create post

## Key Features

### 1. Multi-Portal Architecture
- Separate interfaces for entrepreneurs, investors, and administrators
- Role-based access control and permissions
- Unified backend with portal-specific endpoints

### 2. Investment Workflow
- Company registration and approval process
- Credit request submission and triaging
- Investor analysis and decision workflow
- Real-time communication between parties

### 3. Social Network Features
- Company profiles with image galleries
- Instagram-style photo navigation
- Social posting and interaction capabilities
- Business networking and discovery

### 4. Mobile-First Design
- Responsive layouts for all screen sizes
- Collapsible navigation and filters
- Touch-friendly interface elements
- Optimized mobile user experience

### 5. Real-Time Communication
- WebSocket-based messaging
- Live notifications and updates
- Conversation history and management
- File attachment support

## Business Logic Flow

### 1. Entrepreneur Journey
1. Register and verify email
2. Complete profile and company registration
3. Wait for backoffice approval
4. Submit credit requests
5. Communicate with interested investors
6. Receive investment decisions

### 2. Investor Journey
1. Register and complete investment profile
2. Browse company network
3. Request analysis of interesting companies
4. Analyze documents and communicate
5. Make investment decisions
6. Track investment portfolio

### 3. Administrative Oversight
1. Review and approve company registrations
2. Triage credit requests for network release
3. Monitor system metrics and user activity
4. Manage user accounts and permissions
5. Generate reports and analytics

## Security Implementation
- JWT token authentication
- Password hashing with bcrypt
- Session management with PostgreSQL store
- Input validation with Zod schemas
- SQL injection protection via Drizzle ORM
- File upload restrictions and validation

## Performance Optimizations
- TanStack Query for efficient data fetching
- Optimistic updates for better UX
- Image optimization and lazy loading
- Database indexing for key queries
- Connection pooling for database access

## Mobile Responsiveness
- Tailwind CSS breakpoints (sm, md, lg, xl)
- Flexible grid layouts that adapt to screen size
- Collapsible navigation and filter systems
- Touch-friendly button and interaction sizes
- Responsive typography and spacing

## Development Workflow
- TypeScript for type safety
- Drizzle ORM for database operations
- shadcn/ui for consistent UI components
- ESLint and Prettier for code quality
- Hot reload development environment

## Deployment Configuration
- Configured for Replit Deployments
- Environment variable management
- PostgreSQL database integration
- Static file serving
- Production-ready Express server

---

This platform represents a complete business ecosystem connecting entrepreneurs with investors through a sophisticated, mobile-responsive web application with comprehensive administrative oversight.