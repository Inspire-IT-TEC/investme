# InvestMe Platform

## Overview
InvestMe is a comprehensive business platform designed to connect entrepreneurs with investors through three specialized portals: Entrepreneur, Investor, and Administrative Backoffice. Its primary purpose is to facilitate company registration, credit requests, investment analysis, and business networking. The platform aims to be fully mobile-responsive and provide a streamlined experience for all users, fostering business growth and investment opportunities.

## User Preferences
- Mobile-first responsive design approach
- Clean, professional interface without excessive animations
- Practical functionality over decorative elements
- Fast, efficient user interactions with minimal loading states

## System Architecture
The InvestMe platform is built with a three-portal structure: Entrepreneur Portal (`/entrepreneur-*`), Investor Portal (`/investor-*`), and Backoffice Portal (`/backoffice-*`). The core technology stack includes **React 18 + TypeScript** for the frontend, utilizing Wouter for routing and TanStack Query for data management. The backend is powered by **Express.js + TypeScript** with JWT authentication. **PostgreSQL** serves as the database, managed by Drizzle ORM with separate `entrepreneurs` and `investors` tables (legacy `users` table removed August 2025). The UI is designed with **Tailwind CSS** and **shadcn/ui components**, ensuring a responsive and modern aesthetic.

### Environment Management
The platform implements a comprehensive environment management system using `config/environments.js` with automatic environment detection:
- **Development**: Local workspace environment with debug features, extensive logging, and development optimizations
- **Staging**: Pre-production testing environment with production-like configurations but test data
- **Production**: Live environment with automatic detection via `REPLIT_DEPLOYMENT=1`, optimized performance and security settings

Key architectural decisions include:
- **Authentication**: JWT-based with role separation, email verification, password reset, and session management.
- **Data Management**: Drizzle ORM for all database operations, ensuring type safety and efficient queries.
- **UI/UX**: Focus on a clean, professional interface with a mobile-first approach. Responsive design is a core principle, featuring collapsible filters for mobile views, 2x2 grid layouts for investor profiles, and optimized typography.
- **Deployment Strategy**: Multi-environment setup with branch-based deployment workflow (develop → staging → main), automated environment detection, and comprehensive deployment scripts.
- **Feature Specifications**:
    - **Entrepreneur Portal**: Company registration with document upload, credit request submission and tracking, real-time communication, profile and company data management.
    - **Investor Portal**: Investment opportunity browsing with advanced filters, a "Minhas Análises" workflow for detailed company analysis, real-time messaging, and Instagram-style company gallery viewing.
    - **Administrative Backoffice**: User and company approval workflows, system metrics, credit request triaging, and network oversight.
- **File Management**: Integrated AWS S3 for secure and scalable storage of company images and credit request documents.
- **Email Service**: Dual-mode email system with real AWS SES integration for production and a development fallback, supporting email confirmation and password recovery.
- **Environment Configuration**: Automated environment detection system with separate configurations for development, staging, and production environments, including environment-specific settings for CORS, logging, database connections, and feature flags.

## External Dependencies
- **AWS S3**: Used for storing company images and credit request documents (bucket: `doc.investme.com.br`).
- **AWS SES**: Utilized for sending all platform emails, including confirmations and password resets.
- **PostgreSQL**: The relational database used for all application data, accessed via Drizzle ORM.
- **JWT (JSON Web Tokens)**: Used for secure user authentication and authorization.
- **TanStack Query**: Client-side data fetching, caching, and synchronization library.
- **Wouter**: A minimalist React routing library.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **shadcn/ui**: A collection of reusable components built with Tailwind CSS.