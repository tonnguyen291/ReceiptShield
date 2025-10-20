# Changelog

All notable changes to ReceiptShield will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive project organization and structure
- Professional documentation (CONTRIBUTING.md, CODE_OF_CONDUCT.md, LICENSE)
- README files for major directories (ml/, scripts/)
- Enhanced .gitignore with ML and tool exclusions
- Organized ML directory structure (models/, scripts/, data/)
- Tools directory for development utilities

### Changed
- Reorganized project structure for better maintainability
- Moved PlantUML and other tools to dedicated tools/ directory
- Consolidated ML files into logical subdirectories
- Updated documentation hierarchy

### Fixed
- Project structure inconsistencies
- Missing standard open-source files

## [0.1.0] - 2025-01-XX

### Added
- Initial release of ReceiptShield
- AI-powered receipt processing with Google Gemini
- Fraud detection ML model
- Multi-role user management (Admin, Manager, Employee)
- Real-time monitoring dashboard
- Automated expense categorization
- Firebase integration (Auth, Firestore, Storage, Hosting)
- Next.js 15 with App Router
- Comprehensive documentation suite
- Deployment automation scripts
- Email notification system (SendGrid integration)

### Features
- Receipt upload and OCR processing
- Fraud probability scoring
- Role-based access control (RBAC)
- Analytics and reporting
- Budget tracking and alerts
- Invitation system
- Receipt approval workflow
- Export functionality (PDF, CSV)

### Security
- Firebase Authentication
- Secure file storage with Firebase Storage
- Environment variable management
- Role-based security rules

---

## Release Notes Format

### Categories
- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

### Versioning
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

