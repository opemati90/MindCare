# Mindcare Platform - Project Structure

## 📁 Complete Folder Structure

```
mindcare-platform/
├── 📄 README.md                     # Project documentation
├── 📄 package.json                  # Root package.json with workspaces
├── 📄 turbo.json                    # Turborepo configuration
├── 📄 docker-compose.yml            # Docker development environment
├── 📄 .env.example                  # Environment variables template
├── 📄 .eslintrc.js                  # ESLint configuration
├── 📄 .prettierrc                   # Prettier configuration
├── 📄 .gitignore                    # Git ignore rules
├── 📄 PROJECT_STRUCTURE.md          # This file
│
├── 📁 .github/
│   └── 📁 workflows/
│       └── 📄 ci.yml                # GitHub Actions CI/CD pipeline
│
├── 📁 apps/                         # All applications
│   ├── 📁 patient-web/              # Patient web interface (Next.js)
│   │   ├── 📄 package.json
│   │   ├── 📄 next.config.js
│   │   ├── 📄 tailwind.config.js
│   │   ├── 📄 tsconfig.json
│   │   └── 📁 src/
│   │       ├── 📁 app/              # Next.js 13+ app directory
│   │       ├── 📁 components/       # React components
│   │       ├── 📁 lib/              # Utilities and configurations
│   │       ├── 📁 hooks/            # Custom React hooks
│   │       ├── 📁 store/            # Zustand state management
│   │       └── 📁 types/            # TypeScript type definitions
│   │
│   ├── 📁 patient-mobile/           # Patient mobile app (Flutter)
│   │   ├── 📄 pubspec.yaml
│   │   ├── 📁 lib/
│   │   │   ├── 📁 main.dart
│   │   │   ├── 📁 features/         # Feature-based architecture
│   │   │   ├── 📁 shared/           # Shared widgets and utilities
│   │   │   ├── 📁 core/             # Core functionality
│   │   │   └── 📁 data/             # Data layer (repositories, models)
│   │   ├── 📁 android/
│   │   ├── 📁 ios/
│   │   └── 📁 assets/
│   │
│   ├── 📁 provider-web/             # Healthcare provider interface (Next.js)
│   │   ├── 📄 package.json
│   │   ├── 📄 next.config.js
│   │   ├── 📄 tailwind.config.js
│   │   ├── 📄 tsconfig.json
│   │   └── 📁 src/
│   │       ├── 📁 app/              # Next.js 13+ app directory
│   │       ├── 📁 components/       # React components
│   │       ├── 📁 lib/              # Utilities and configurations
│   │       ├── 📁 hooks/            # Custom React hooks
│   │       ├── 📁 store/            # Zustand state management
│   │       └── 📁 types/            # TypeScript type definitions
│   │
│   └── 📁 admin-dashboard/          # Admin dashboard (Next.js)
│       ├── 📄 package.json
│       ├── 📄 next.config.js
│       ├── 📄 tailwind.config.js
│       ├── 📄 tsconfig.json
│       └── 📁 src/
│           ├── 📁 app/              # Next.js 13+ app directory
│           ├── 📁 components/       # React components
│           ├── 📁 lib/              # Utilities and configurations
│           ├── 📁 hooks/            # Custom React hooks
│           ├── 📁 store/            # Zustand state management
│           └── 📁 types/            # TypeScript type definitions
│
├── 📁 backend/                      # API server and database
│   ├── 📄 package.json
│   ├── 📁 prisma/
│   │   ├── 📄 schema.prisma         # Database schema
│   │   └── 📁 migrations/           # Database migrations
│   └── 📁 src/
│       ├── 📄 index.ts              # Main server file
│       ├── 📁 config/               # Configuration files
│       ├── 📁 controllers/          # Route controllers
│       ├── 📁 middleware/           # Express middleware
│       ├── 📁 routes/               # API routes
│       ├── 📁 services/             # Business logic
│       ├── 📁 utils/                # Utility functions
│       ├── 📁 lib/                  # External library configurations
│       ├── 📁 types/                # TypeScript types
│       └── 📁 socket/               # WebSocket handlers
│
├── 📁 packages/                     # Shared packages
│   ├── 📁 shared-types/             # Shared TypeScript types
│   │   ├── 📄 package.json
│   │   ├── 📄 tsconfig.json
│   │   └── 📁 src/
│   │       ├── 📄 index.ts          # Main types export
│   │       ├── 📄 auth.ts           # Authentication types
│   │       └── 📄 api.ts            # API types
│   │
│   ├── 📁 ui-components/            # Shared React components
│   │   ├── 📄 package.json
│   │   ├── 📄 tsconfig.json
│   │   └── 📁 src/
│   │       ├── 📄 index.ts          # Components export
│   │       ├── 📁 components/       # Reusable UI components
│   │       ├── 📁 hooks/            # Shared React hooks
│   │       └── 📁 utils/            # Component utilities
│   │
│   └── 📁 utils/                    # Shared utilities
│       ├── 📄 package.json
│       ├── 📄 tsconfig.json
│       └── 📁 src/
│           ├── 📄 index.ts          # Utilities export
│           ├── 📄 cn.ts             # Class name utility
│           ├── 📄 formatters.ts     # Data formatters
│           ├── 📄 validators.ts     # Validation utilities
│           ├── 📄 constants.ts      # Shared constants
│           ├── 📄 api.ts            # API utilities
│           ├── 📄 date.ts           # Date utilities
│           ├── 📄 storage.ts        # Storage utilities
│           └── 📄 auth.ts           # Authentication utilities
│
└── 📁 tools/                        # Development and deployment tools
    ├── 📁 scripts/                  # Build and deployment scripts
    ├── 📁 docker/                   # Docker configurations
    └── 📁 docs/                     # Additional documentation
```

## 🏗️ Architecture Overview

### **Monorepo Structure**
- **Turborepo** for efficient build system and caching
- **Workspaces** for shared dependencies and code
- **Shared packages** for type safety and code reuse

### **Frontend Applications**
1. **Patient Web** (Next.js 15 + TypeScript)
   - Responsive web interface for patients
   - Appointment booking, medical records, communication
   - NextAuth.js authentication
   - Zustand state management

2. **Patient Mobile** (Flutter + Dart)
   - Native mobile experience
   - Offline capabilities and push notifications
   - Firebase Authentication
   - Riverpod state management

3. **Provider Web** (Next.js 15 + TypeScript)
   - Healthcare provider dashboard
   - Patient management, scheduling, clinical workflows
   - Advanced data tables and calendar views

4. **Admin Dashboard** (Next.js 15 + TypeScript)
   - Administrative interface
   - User management, analytics, system configuration
   - Role-based access control

### **Backend API** (Node.js + Express + TypeScript)
- RESTful API with comprehensive endpoints
- PostgreSQL database with Prisma ORM
- JWT authentication with refresh tokens
- WebSocket support for real-time features
- Comprehensive error handling and logging

### **Shared Packages**
- **shared-types**: TypeScript definitions for all platforms
- **ui-components**: Reusable React components
- **utils**: Common utilities and helper functions

## 🛠️ Technology Stack

### **Frontend Web**
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Zustand for state management
- React Query for server state
- React Hook Form for forms
- Framer Motion for animations

### **Mobile**
- Flutter 3.16+ with Dart
- Riverpod for state management
- Firebase for authentication
- Dio for HTTP requests
- Go Router for navigation

### **Backend**
- Node.js with Express
- TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication
- Socket.IO for real-time features
- Winston for logging
- Zod for validation

### **Development Tools**
- Turborepo for monorepo management
- ESLint + Prettier for code quality
- GitHub Actions for CI/CD
- Docker for containerization
- Jest for testing

## 🚀 Getting Started

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd mindcare-platform
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Database Setup**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 📋 Available Scripts

- `npm run dev` - Start all development servers
- `npm run build` - Build all applications
- `npm run test` - Run all tests
- `npm run lint` - Lint all code
- `npm run type-check` - Type check TypeScript
- `npm run format` - Format code with Prettier

## 🔐 Security Features

- HIPAA-compliant data handling
- End-to-end encryption for sensitive data
- Role-based access control (RBAC)
- Audit logging for critical operations
- Rate limiting and security headers
- Input validation and sanitization

## 📱 Platform Support

- **Web**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile**: iOS 12+ and Android 8+ (API level 26+)
- **Responsive**: Optimized for desktop, tablet, and mobile devices

This structure provides a solid foundation for a scalable, maintainable healthcare platform with modern development practices and comprehensive feature coverage.
