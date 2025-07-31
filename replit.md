# InvestMe Platform - Project Documentation

## Project Overview
InvestMe is a comprehensive business platform connecting entrepreneurs with investors through three specialized portals: Entrepreneur Portal, Investor Portal, and Administrative Backoffice. The system facilitates company registration, credit requests, investment analysis, and business networking with complete mobile responsiveness.

## Recent Changes
- **2025-01-31**: ✅ Fixed admin dashboard pending approvals count by correcting query endpoints 
- **2025-01-31**: ✅ Corrected pendingEntrepreneurs query to use /api/admin/entrepreneurs instead of /api/admin/users
- **2025-01-31**: ✅ Dashboard now accurately shows 3 entrepreneurs + 1 investor = 4 pending approvals
- **2025-01-31**: ✅ Fixed critical crash in pending profile changes approval system with improved error handling
- **2025-01-31**: ✅ Corrected tab filtering to show proper data separation (pending/approved/rejected changes)
- **2025-01-31**: ✅ Added back button to dashboard navigation in pending changes page
- **2025-01-31**: ✅ Enhanced reviewPendingProfileChange method with detailed logging and validation
- **2025-01-31**: ✅ Completed pending profile changes system for entrepreneurs with admin approval workflow
- **2025-01-31**: ✅ Created pendingProfileChanges table and backend endpoints for change management
- **2025-01-31**: ✅ Built /backoffice/pending-changes page with approval/rejection interface and user feedback
- **2025-01-31**: ✅ Fixed API call syntax errors in frontend mutations for proper request formatting
- **2025-01-31**: ✅ Implemented credit request editing functionality with document management
- **2025-01-31**: ✅ Added PUT /api/credit-requests/:id endpoint for editing solicitações
- **2025-01-31**: ✅ Added DELETE /api/credit-requests/:id/documents endpoint for removing documents
- **2025-01-31**: ✅ Created comprehensive edit modal with form validation and file upload/removal
- **2025-01-31**: ✅ Editing only allowed for requests with status 'na_rede' (not yet in analysis)
- **2025-01-31**: ✅ Full document management: view, download, remove existing, upload new files
- **2025-01-31**: ✅ Implemented automatic data refresh system for entrepreneur portal navigation
- **2025-01-31**: ✅ Created useEntrepreneurNavigation hook to invalidate TanStack Query caches when navigating
- **2025-01-31**: ✅ All entrepreneur portal pages now automatically reload data when accessed from sidebar
- **2025-01-31**: ✅ Fixed "Ver Detalhes" modal in credit requests with complete information display
- **2025-01-31**: ✅ Corrected credit request API to return all necessary fields (prazoMeses, finalidade, etc.)
- **2025-01-31**: ✅ Fixed entrepreneur profile endpoint to use entrepreneurs table instead of users table
- **2025-01-30**: ✅ Enhanced visual design of company cards in entrepreneur details modal
- **2025-01-30**: ✅ Added color-coded status badges (green for approved, red for rejected, yellow for pending)
- **2025-01-30**: ✅ Improved spacing and typography in company information display
- **2025-01-30**: ✅ Fixed entrepreneur granular approval system in backoffice by removing duplicate endpoint
- **2025-01-30**: ✅ Corrected entrepreneur approval to use entrepreneurs table instead of users table
- **2025-01-30**: ✅ Added getEntrepreneur and updateEntrepreneur methods to storage interface
- **2025-01-30**: ✅ Implemented AWS S3 integration for credit request document uploads
- **2025-01-30**: ✅ Created separate S3 multer configuration for documents (PDF, DOC, DOCX, images)
- **2025-01-30**: ✅ Updated credit request endpoint to store documents in S3 bucket doc.investme.com.br/credit-documents/
- **2025-01-30**: ✅ Implemented automatic data refresh system for backoffice navigation
- **2025-01-30**: ✅ Created useBackofficeNavigation hook to invalidate caches when navigating between admin pages
- **2025-01-30**: ✅ All backoffice pages now automatically reload data when accessed from sidebar navigation
- **2025-01-30**: ✅ Implemented AWS S3 integration for company image uploads using doc.investme.com.br bucket
- **2025-01-30**: ✅ Updated company image upload endpoint to store files in S3 instead of local storage
- **2025-01-30**: ✅ Fixed entrepreneur management page endpoints and added missing address fields
- **2025-01-30**: ✅ Corrected companies query to filter by entrepreneurId for proper data isolation
- **2025-01-30**: ✅ Enhanced getEntrepreneurs method to include complete address information
- **2025-01-30**: ✅ Fixed email confirmation URLs to use correct Replit domain instead of localhost
- **2025-01-30**: ✅ Activated real AWS SES email delivery for all email types (confirmation, password reset)
- **2025-01-30**: ✅ Fixed error message display across all authentication pages to show user-friendly messages instead of raw JSON
- **2025-01-30**: Enhanced error handling in backoffice login, forgot password, reset password, and registration pages
- **2025-01-30**: ✅ All mutation error responses now properly throw parsed error data for consistent error display
- **2025-01-30**: ✅ Email confirmation system fully implemented with mandatory verification before login
- **2025-01-30**: Updated registration flows to automatically send confirmation emails for entrepreneurs and investors
- **2025-01-30**: Enhanced login process to block access until email is confirmed with user-friendly error handling
- **2025-01-30**: Created dedicated confirmation page with token validation and resend functionality
- **2025-01-30**: ✅ AWS SES integration fully tested and validated with real email sending capability
- **2025-01-30**: ✅ Real email sending confirmed working with MessageId tracking for all email types
- **2025-01-30**: Finalized dual-mode email system: simulation for development, real AWS SES for production
- **2025-01-30**: Confirmed email verification in AWS console - system production-ready
- **2025-01-29**: Configured email service FROM address to suporte@investme.com.br
- **2025-01-29**: Completed password recovery system with AWS SES integration and development fallback
- **2025-01-29**: Implemented password reset tokens with 1-hour expiration and secure email verification
- **2025-01-24**: Implemented collapsible filters for mobile network pages (entrepreneur and investor)
- **2025-01-24**: Enhanced mobile responsiveness for investor profile navigation with 2x2 grid layout
- **2025-01-24**: Fixed card headers and button layouts for better mobile experience
- **2025-01-24**: Added responsive typography and spacing throughout the platform
- **2025-01-23**: Completed Instagram-style image galleries for company profiles
- **2025-01-23**: Integrated real-time messaging system between investors and entrepreneurs
- **2025-01-22**: Fixed credit request analysis workflow with proper cache invalidation

## Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript, Wouter routing, TanStack Query
- **Backend**: Express.js + TypeScript, JWT authentication
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui components
- **Mobile**: Responsive design with collapsible navigation

### Three-Portal Structure
1. **Entrepreneur Portal** (`/entrepreneur-*`) - Company management and credit requests
2. **Investor Portal** (`/investor-*`) - Investment analysis and networking
3. **Backoffice Portal** (`/backoffice-*`) - Administrative oversight

## Key Features Implemented

### Authentication & User Management
- JWT-based authentication with role separation
- Email verification and password reset
- Session management with PostgreSQL store

### Entrepreneur Capabilities
- Company registration with document upload
- Credit request submission and tracking
- Real-time communication with investors
- Profile and company data management

### Investor Capabilities
- Investment opportunity browsing with advanced filters
- "Minhas Análises" workflow for detailed company analysis
- Real-time messaging with entrepreneurs
- Instagram-style company gallery viewing
- Mobile-responsive profile management

### Administrative Features
- User and company approval workflows
- System metrics and analytics dashboard
- Credit request triaging and management
- Network oversight with comprehensive reporting

### Mobile Responsiveness
- Collapsible filters for network pages (entrepreneur and investor)
- 2x2 grid layout for investor profile navigation tabs
- Responsive card headers and button layouts
- Touch-friendly interface elements
- Optimized typography and spacing

## Database Schema
- Core tables: users, entrepreneurs, investors, companies, credit_requests
- Supporting: messages, notifications, states, cities
- Relationships: Users→Roles (1:1), Companies→Entrepreneurs (N:1)

## API Architecture
- RESTful endpoints with role-based access
- File upload handling with Multer
- Real-time messaging endpoints
- Geographic data (states/cities) integration

## User Preferences
- Mobile-first responsive design approach
- Clean, professional interface without excessive animations
- Practical functionality over decorative elements
- Fast, efficient user interactions with minimal loading states

## Development Guidelines
- Use Drizzle ORM for all database operations
- Implement proper TypeScript typing throughout
- Follow shadcn/ui component patterns
- Maintain consistent responsive breakpoints (sm, md, lg, xl)
- Test mobile layouts on actual devices when possible

## Deployment Configuration
- Configured for Replit Deployments
- PostgreSQL database integration
- Environment variable management for secrets
- Static file serving for uploads and assets

## Next Development Priorities
1. Advanced filtering and search capabilities
2. Enhanced reporting and analytics features
3. Integration with external financial services
4. Advanced notification system improvements
5. Performance optimizations for large datasets

---
*This documentation serves as the primary reference for project context, technical decisions, and development guidelines.*