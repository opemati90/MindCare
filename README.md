# Mindcare Healthcare Platform

A comprehensive healthcare platform with three distinct interfaces: Patient, Healthcare Provider, and Admin Dashboard.

## 🏗️ Architecture

This is a monorepo built with modern technologies and best practices:

- **Frontend Web**: Next.js 15 with TypeScript
- **Mobile Apps**: Flutter with Dart
- **Backend API**: Node.js with Express and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js for web, Firebase Auth for mobile
- **State Management**: Zustand for web, Riverpod for Flutter
- **Styling**: Tailwind CSS for web, Flutter Material Design

## 📁 Project Structure

```
mindcare-platform/
├── apps/
│   ├── patient-web/          # Patient web interface (Next.js)
│   ├── patient-mobile/       # Patient mobile app (Flutter)
│   ├── provider-web/         # Healthcare provider interface (Next.js)
│   └── admin-dashboard/      # Admin dashboard (Next.js)
├── backend/                  # API server and database
├── packages/
│   ├── shared-types/         # Shared TypeScript types
│   ├── ui-components/        # Shared React components
│   ├── utils/               # Shared utilities
│   └── config/              # Shared configuration
└── tools/                   # Development and deployment tools
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Flutter SDK 3.16+
- PostgreSQL 14+
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mindcare-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Set up the database:
```bash
npm run db:generate
npm run db:push
```

5. Start development servers:
```bash
npm run dev
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start all development servers
- `npm run build` - Build all applications
- `npm run test` - Run all tests
- `npm run lint` - Lint all code
- `npm run type-check` - Type check all TypeScript
- `npm run format` - Format code with Prettier

### Database Management

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## 🏥 Platform Interfaces

### Patient Interface
- **Web**: Responsive web application for appointment booking, medical records, and communication
- **Mobile**: Native mobile app with offline capabilities and push notifications

### Healthcare Provider Interface
- **Web**: Comprehensive dashboard for patient management, scheduling, and clinical workflows
- **Responsive**: Optimized for desktop, tablet, and mobile devices

### Admin Dashboard
- **Web**: Administrative interface for user management, analytics, and system configuration
- **Role-based**: Different access levels for various administrative roles

## 🔐 Security & Compliance

- HIPAA-compliant data handling
- End-to-end encryption for sensitive data
- Role-based access control (RBAC)
- Audit logging for all critical operations
- Regular security assessments

## 🧪 Testing

- Unit tests with Jest and React Testing Library
- Integration tests for API endpoints
- E2E tests with Playwright
- Mobile testing with Flutter test framework

## 📦 Deployment

- **Development**: Local development with hot reload
- **Staging**: Automated deployment with GitHub Actions
- **Production**: Multi-environment deployment with Docker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.
