# ReceiptShield 🛡️

<div align="center">

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/tonnguyen291/ReceiptShield)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11-orange)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**AI-Powered Receipt Management & Fraud Detection System**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Scripts](#-scripts)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Security](#-security)
- [License](#-license)

## 🌟 Overview

ReceiptShield is an enterprise-grade receipt management system powered by AI that automates receipt processing, detects fraudulent submissions, and provides comprehensive expense tracking and analytics. Built with Next.js 15, Firebase, and Google Gemini AI.

### Key Capabilities

- **🤖 AI-Powered Processing**: Automated OCR and data extraction using Google Gemini
- **🔍 Fraud Detection**: Machine learning model identifies suspicious receipts
- **👥 Multi-Role Management**: Admin, Manager, and Employee role hierarchy
- **📊 Real-Time Analytics**: Comprehensive dashboards and reporting
- **🔒 Enterprise Security**: Firebase Auth, RBAC, and encrypted storage
- **📱 Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui

## ✨ Features

### Receipt Management
- **Upload & Process**: Drag-and-drop receipt upload with instant OCR
- **Smart Categorization**: Automatic expense category detection
- **Duplicate Detection**: Identifies potential duplicate submissions
- **Bulk Operations**: Process multiple receipts simultaneously

### Fraud Detection
- **ML-Based Analysis**: Advanced fraud detection model
- **Risk Scoring**: Real-time fraud probability scoring
- **Pattern Recognition**: Identifies suspicious patterns and anomalies
- **Alert System**: Automated notifications for high-risk receipts

### Role-Based Features

#### 👔 Admin
- User management and access control
- System configuration and settings
- Comprehensive analytics and reports
- Audit logs and compliance tracking

#### 📊 Manager
- Team receipt approval workflows
- Department budget management
- Team analytics and insights
- Expense report generation

#### 👤 Employee
- Receipt submission and tracking
- Personal expense dashboard
- Receipt history and status
- Mobile-friendly interface

### Analytics & Reporting
- Real-time spending analytics
- Custom date range filtering
- Category-wise breakdowns
- Export to PDF/CSV
- Budget tracking and alerts

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + TanStack Query
- **Forms**: React Hook Form + Zod validation

### Backend
- **Platform**: Firebase
  - Authentication (with MFA)
  - Firestore (NoSQL database)
  - Storage (file uploads)
  - App Hosting (deployment)
- **AI/ML**: Google Gemini AI (Genkit)
- **Email**: SendGrid

### Machine Learning
- **Framework**: Python with scikit-learn
- **OCR**: Tesseract.js
- **Model**: Fraud detection classifier
- **Features**: Receipt metadata, text analysis, image properties

### Development Tools
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier (via ESLint)
- **Testing**: Jest + React Testing Library
- **CI/CD**: GitHub Actions (or Firebase App Hosting)

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.0.0
npm or yarn
Python >= 3.8 (for ML features)
Firebase CLI
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ReceiptShield.git
   cd ReceiptShield
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your Firebase and API credentials.

4. **Set up Firebase**
   ```bash
   ./scripts/setup/setup-firebase.sh
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:9003](http://localhost:9003) in your browser.

### ML Setup (Optional)

For fraud detection features:

```bash
cd ml/scripts
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

## 📁 Project Structure

```
ReceiptShield/
├── src/                      # Application source code
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   │   ├── ui/             # Base UI components
│   │   ├── admin/          # Admin-specific components
│   │   ├── manager/        # Manager-specific components
│   │   └── employee/       # Employee-specific components
│   ├── lib/                # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React contexts
│   ├── types/              # TypeScript types
│   └── ai/                 # AI/Genkit integration
│
├── ml/                      # Machine Learning module
│   ├── models/             # Trained ML models
│   ├── scripts/            # Training & prediction scripts
│   └── data/               # Training datasets
│
├── docs/                    # Documentation
│   ├── architecture/       # System architecture & C4 diagrams
│   ├── api/                # API documentation
│   ├── deployment/         # Deployment guides
│   ├── firebase/           # Firebase setup guides
│   ├── email/              # Email configuration
│   ├── monitoring/         # Monitoring setup
│   ├── testing/            # Testing guides
│   ├── features/           # Feature documentation
│   └── development/        # Development notes
│
├── scripts/                 # Automation scripts
│   ├── deployment/         # Deployment automation
│   ├── setup/              # Setup & configuration
│   ├── testing/            # Testing scripts
│   └── tools/              # Utility tools
│
├── tools/                   # Development tools
│   ├── plantuml.jar        # PlantUML for diagrams
│   └── generate-diagrams.sh # Diagram generation script
│
├── assets/                  # Static assets
│   └── data/               # Data files (OCR models, etc.)
│
└── [config files]          # Configuration files at root
```

## 📚 Documentation

**[📖 Complete Documentation Index](docs/README.md)** | [Quick Start](docs/getting-started/QUICK_START.md)

### 🚀 Start Here

| I want to... | Go to... |
|-------------|----------|
| **Get started quickly** | [Quick Start Guide](docs/getting-started/QUICK_START.md) ⚡ |
| **Learn development standards** | [Developer Playbook](docs/development/DEVELOPER_PLAYBOOK.md) 📘 |
| **Set up testing** | [Testing Setup Guide](docs/testing/SETUP_TESTING.md) 🧪 |
| **Understand architecture** | [C4 Architecture](docs/architecture/C4_ARCHITECTURE.md) 🏗️ |
| **See product vision** | [Product Roadmap](docs/product/ROADMAP.md) 🗺️ |
| **Check quality status** | [Quality Assessment](QUALITY_ASSESSMENT.md) 📊 |

### 📂 Documentation by Category

#### 💻 For Developers
- **[Developer Playbook](docs/development/DEVELOPER_PLAYBOOK.md)** - Complete development guide (1,700+ lines)
- **[Quick Reference](docs/development/DEVELOPER_QUICK_REFERENCE.md)** - Daily workflow cheat sheet
- **[AI Agent Guide](docs/development/AGENTS.md)** - For AI coding assistants
- **[Testing Setup](docs/testing/SETUP_TESTING.md)** - Step-by-step testing infrastructure

#### 🗺️ For Product Teams
- **[Product Roadmap](docs/product/ROADMAP.md)** - Quick visual timeline (v0.5 → v3.0)
- **[Detailed Roadmap](docs/product/PRODUCT_ROADMAP.md)** - Complete product vision (23KB)
- **[Quality Assessment](QUALITY_ASSESSMENT.md)** - Quality rating (7.2/10)
- **[Playbook Summary](docs/product/PLAYBOOK_SUMMARY.md)** - Implementation overview

#### 🏗️ For Architects
- **[C4 Architecture](docs/architecture/C4_ARCHITECTURE.md)** - System architecture overview
- **[CTO Review](docs/architecture/CTO_ARCHITECTURE_REVIEW.md)** - Technical assessment (31KB)
- **[Architecture Roadmap](docs/architecture/ARCHITECTURE_ROADMAP.md)** - 12-month technical plan
- **[Executive Summary](docs/architecture/EXECUTIVE_SUMMARY.md)** - One-page CTO assessment

#### 🚀 For DevOps
- **[Deployment Guide](docs/deployment/DEPLOYMENT_SETUP_GUIDE.md)** - Step-by-step deployment
- **[Firebase Setup](docs/firebase/FIREBASE_SETUP.md)** - Firebase configuration
- **[Monitoring Guide](docs/monitoring/MONITORING_GUIDE.md)** - System monitoring
- **[Domain Setup](docs/operations/DOMAIN_SETUP_GUIDE.md)** - Custom domain config

### 📋 Essential Links
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community standards
- [Security Policy](SECURITY.md) - Security & vulnerability reporting
- [Changelog](CHANGELOG.md) - Version history

## 🔧 Scripts

### Development
```bash
npm run dev              # Start development server (port 9003)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues
npm run typecheck        # TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:ci          # Run tests in CI mode
```

### Firebase
```bash
npm run firebase:emulators      # Start Firebase emulators
npm run firebase:deploy:rules   # Deploy Firestore/Storage rules
npm run firebase:deploy         # Deploy to Firebase
```

### Deployment
```bash
./scripts/deployment/deploy.sh          # Full deployment
./scripts/deployment/test-deployment.sh # Test deployment
```

### ML/AI
```bash
npm run extract-dataset  # Extract dataset from receipts
npm run genkit:dev       # Start Genkit development server
```

See [`scripts/README.md`](scripts/README.md) for detailed script documentation.

## 💻 Development

### Developer Resources

📘 **[Read the Developer Playbook](DEVELOPER_PLAYBOOK.md)** for complete development guidelines.

### Code Style

This project follows strict TypeScript and ESLint conventions:

```bash
# Check code quality
npm run lint
npm run typecheck
npm run format:check

# Auto-fix issues
npm run lint:fix
npm run format
```

### Testing

We follow **Test-Driven Development (TDD)** practices:

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode for TDD
npm run test:coverage      # Generate coverage report
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
```

**First time?** See [Testing Setup Guide](docs/testing/SETUP_TESTING.md) to configure testing infrastructure.

### Architecture

ReceiptShield follows a clean architecture with:
- **Separation of concerns**: Clear boundaries between UI, business logic, and data
- **Role-based access control**: Firebase Security Rules + app-level checks
- **Modular design**: Reusable components and utilities
- **Type safety**: Comprehensive TypeScript coverage

View [architecture diagrams](docs/architecture/C4_ARCHITECTURE.md) for details.

### Environment Variables

Required environment variables (see `env.example`):

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
# ... (see env.example for complete list)

# Email
SENDGRID_API_KEY=
EMAIL_FROM=

# AI
GOOGLE_GENAI_API_KEY=
```

## 🚢 Deployment

### Firebase App Hosting (Recommended)

```bash
# Build and deploy
npm run deploy:production

# Or use the deployment script
./scripts/deployment/deploy.sh
```

### Vercel (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

See [deployment documentation](docs/deployment/) for detailed guides.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the coding standards in [CONTRIBUTING.md](CONTRIBUTING.md)
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 🔒 Security

Security is a top priority. Please review our [Security Policy](SECURITY.md) for:
- Supported versions
- Reporting vulnerabilities
- Security best practices

**Do not report security vulnerabilities through public issues.**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI processing
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/tonnguyen291/ReceiptShield/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tonnguyen291/ReceiptShield/discussions)

---

<div align="center">

Built with ❤️ by the Ton Nguyen

[Website](https://receiptshield.com) • [Documentation](docs/) • [Report Bug](https://github.com/tonnguyen291/ReceiptShield/issues) • [Request Feature](https://github.com/tonnguyen291/ReceiptShield/issues)

</div>
