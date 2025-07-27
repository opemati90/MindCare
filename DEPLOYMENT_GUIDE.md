# 🚀 Mindcare Platform Deployment Guide

## 📋 Overview

This guide provides comprehensive instructions for deploying the Mindcare healthcare platform to various environments.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Patient Web   │    │  Provider Web   │    │ Admin Dashboard │
│   (Next.js)     │    │   (Next.js)     │    │   (Next.js)     │
│   Port 3000     │    │   Port 3002     │    │   Port 3003     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Backend API   │
                    │ (Node.js/Express)│
                    │   Port 3001     │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │    Database     │
                    │ (PostgreSQL/    │
                    │    SQLite)      │
                    └─────────────────┘

                    ┌─────────────────┐
                    │  Mobile App     │
                    │   (Flutter)     │
                    │   + Firebase    │
                    └─────────────────┘
```

## 🌐 Deployment Options

### **Option 1: Local Development**

```bash
# Clone repository
git clone https://github.com/opemati90/MindCare.git
cd MindCare

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database
cd backend
npm run db:generate
npm run db:push
npm run db:seed

# Start all services
npm run dev
```

### **Option 2: Docker Deployment**

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual services
docker build -t mindcare-backend ./backend
docker build -t mindcare-patient-web ./apps/patient-web
docker build -t mindcare-provider-web ./apps/provider-web
docker build -t mindcare-admin-dashboard ./apps/admin-dashboard
```

### **Option 3: Cloud Deployment (Vercel + Railway)**

#### **Frontend (Vercel)**
```bash
# Deploy each frontend app to Vercel
vercel --prod ./apps/patient-web
vercel --prod ./apps/provider-web
vercel --prod ./apps/admin-dashboard
```

#### **Backend (Railway)**
```bash
# Deploy backend to Railway
railway login
railway new mindcare-backend
railway add
railway deploy
```

### **Option 4: AWS Deployment**

#### **Infrastructure as Code (Terraform)**
```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

# ECS Cluster for containers
resource "aws_ecs_cluster" "mindcare" {
  name = "mindcare-cluster"
}

# RDS for PostgreSQL
resource "aws_db_instance" "mindcare_db" {
  identifier = "mindcare-db"
  engine     = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  
  db_name  = "mindcare"
  username = "mindcare_user"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot = true
}
```

## 🔧 Environment Configuration

### **Production Environment Variables**

```bash
# Production .env
NODE_ENV=production

# Database (PostgreSQL for production)
DATABASE_URL="postgresql://username:password@host:5432/mindcare_prod"

# JWT Secrets (Generate strong secrets)
JWT_SECRET="your-super-secure-jwt-secret-256-bits"
REFRESH_TOKEN_SECRET="your-super-secure-refresh-secret-256-bits"

# CORS Origins (Your production domains)
CORS_ORIGIN="https://patient.mindcare.com,https://provider.mindcare.com,https://admin.mindcare.com"

# Email Service (Production SMTP)
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT=587
EMAIL_USER="apikey"
EMAIL_PASS="your-sendgrid-api-key"

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="mindcare-files-prod"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
LOG_LEVEL="warn"

# Rate Limiting (Stricter for production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

## 🗄️ Database Migration

### **PostgreSQL Setup**

```sql
-- Create production database
CREATE DATABASE mindcare_prod;
CREATE USER mindcare_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE mindcare_prod TO mindcare_user;
```

### **Migration Commands**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed production data (optional)
npx prisma db seed
```

## 🔒 Security Checklist

### **Pre-Deployment Security**

- [ ] **Environment Variables**: All secrets in environment variables, not code
- [ ] **HTTPS**: SSL certificates configured for all domains
- [ ] **Database**: Database credentials secured and rotated
- [ ] **API Keys**: All API keys secured and scoped appropriately
- [ ] **CORS**: CORS configured for production domains only
- [ ] **Rate Limiting**: Appropriate rate limits for production traffic
- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **Error Handling**: No sensitive information in error messages
- [ ] **Logging**: Comprehensive logging without sensitive data
- [ ] **Backup**: Database backup strategy implemented

### **HIPAA Compliance Checklist**

- [ ] **Data Encryption**: Data encrypted at rest and in transit
- [ ] **Access Controls**: Role-based access control implemented
- [ ] **Audit Logging**: All data access logged and monitored
- [ ] **User Authentication**: Strong authentication mechanisms
- [ ] **Data Minimization**: Only necessary data collected and stored
- [ ] **Backup Security**: Backups encrypted and secured
- [ ] **Incident Response**: Incident response plan documented
- [ ] **Staff Training**: Team trained on HIPAA requirements

## 📱 Mobile App Deployment

### **Firebase Setup**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Deploy Firebase functions (if any)
firebase deploy --only functions

# Deploy Firebase hosting (if using)
firebase deploy --only hosting
```

### **App Store Deployment**

#### **iOS (App Store)**
```bash
# Build iOS app
cd apps/patient-mobile
flutter build ios --release

# Upload to App Store Connect
# Use Xcode or Application Loader
```

#### **Android (Google Play)**
```bash
# Build Android app
flutter build appbundle --release

# Upload to Google Play Console
# Use Google Play Console web interface
```

## 🔍 Monitoring & Observability

### **Application Monitoring**

```javascript
// Sentry configuration
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### **Health Checks**

```bash
# API Health Check
curl https://api.mindcare.com/health

# Database Health Check
curl https://api.mindcare.com/health/db

# External Services Health Check
curl https://api.mindcare.com/health/services
```

### **Logging Strategy**

```javascript
// Production logging configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

## 🚀 CI/CD Pipeline

### **GitHub Actions Workflow**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          railway deploy

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          vercel --prod
```

## 📊 Performance Optimization

### **Backend Optimization**

- **Database Indexing**: Add indexes for frequently queried fields
- **Caching**: Implement Redis caching for frequently accessed data
- **Connection Pooling**: Configure database connection pooling
- **Compression**: Enable gzip compression for API responses

### **Frontend Optimization**

- **Code Splitting**: Implement route-based code splitting
- **Image Optimization**: Use Next.js Image component
- **Bundle Analysis**: Analyze and optimize bundle sizes
- **CDN**: Use CDN for static assets

## 🔄 Backup & Recovery

### **Database Backup**

```bash
# Automated daily backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_20240127.sql
```

### **File Storage Backup**

```bash
# S3 backup with versioning enabled
aws s3 sync s3://mindcare-files-prod s3://mindcare-files-backup
```

## 📞 Support & Maintenance

### **Monitoring Alerts**

- **API Response Time**: Alert if response time > 2 seconds
- **Error Rate**: Alert if error rate > 1%
- **Database Connections**: Alert if connection pool exhausted
- **Disk Space**: Alert if disk usage > 80%
- **Memory Usage**: Alert if memory usage > 85%

### **Maintenance Schedule**

- **Daily**: Monitor logs and metrics
- **Weekly**: Review security alerts and updates
- **Monthly**: Performance optimization review
- **Quarterly**: Security audit and penetration testing
- **Annually**: HIPAA compliance audit

## 🎯 Post-Deployment Checklist

- [ ] **All services running**: Verify all applications are accessible
- [ ] **Database connected**: Confirm database connectivity
- [ ] **Authentication working**: Test login/logout functionality
- [ ] **API endpoints responding**: Test critical API endpoints
- [ ] **Mobile app connecting**: Verify mobile app can connect to API
- [ ] **Monitoring active**: Confirm monitoring and alerting working
- [ ] **Backups configured**: Verify backup systems are running
- [ ] **SSL certificates valid**: Check SSL certificate status
- [ ] **Performance acceptable**: Verify response times are acceptable
- [ ] **Security scan passed**: Run security vulnerability scan

---

**🎉 Congratulations! Your Mindcare platform is now deployed and ready to serve patients and healthcare providers!**
