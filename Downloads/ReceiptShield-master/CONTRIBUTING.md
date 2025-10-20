# Contributing to ReceiptShield

Thank you for your interest in contributing to ReceiptShield! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. **Fork the repository** to your GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ReceiptShield.git
   cd ReceiptShield
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/ReceiptShield.git
   ```

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for ML components)
- Firebase CLI
- Git

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Set up ML environment** (if working on ML features):
   ```bash
   cd ml/scripts
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

## How to Contribute

### Reporting Bugs

- Use the GitHub issue tracker
- Check if the bug has already been reported
- Include detailed steps to reproduce
- Provide system information (OS, Node version, etc.)
- Include error messages and stack traces

### Suggesting Enhancements

- Use the GitHub issue tracker with the "enhancement" label
- Clearly describe the feature and its use case
- Explain why this enhancement would be useful
- Consider the scope and maintainability

### Code Contributions

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

4. **Commit your changes** with clear messages:
   ```bash
   git commit -m "feat: add new receipt validation feature"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Adding or updating tests
   - `chore:` Maintenance tasks

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**

## Pull Request Process

1. **Update documentation** for any changed functionality
2. **Add tests** for new features
3. **Ensure all tests pass** and no linting errors exist
4. **Update CHANGELOG.md** with your changes
5. **Request review** from maintainers
6. **Address feedback** promptly and professionally

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No linting errors
- [ ] CHANGELOG.md updated
- [ ] Branch is up to date with main

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for public APIs

### React/Next.js

- Use functional components with hooks
- Follow React best practices
- Keep components focused and reusable
- Use proper prop typing
- Implement proper error boundaries

### Python (ML Code)

- Follow PEP 8 style guide
- Use type hints
- Add docstrings for functions and classes
- Keep functions pure when possible

### File Organization

```
src/
├── app/              # Next.js app router
├── components/       # Reusable React components
├── lib/             # Utility functions
├── types/           # TypeScript type definitions
├── hooks/           # Custom React hooks
└── contexts/        # React contexts
```

## Testing Guidelines

### Frontend Tests

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Backend/API Tests

```bash
npm run test:api
```

### ML Model Tests

```bash
cd ml/scripts
python -m pytest
```

### End-to-End Tests

```bash
npm run test:e2e
```

## Documentation

### Code Documentation

- Add JSDoc/docstrings for public APIs
- Comment complex algorithms
- Keep comments up-to-date with code

### Project Documentation

Documentation is organized in the `docs/` directory:

- `docs/architecture/` - System architecture and design
- `docs/api/` - API documentation
- `docs/deployment/` - Deployment guides
- `docs/firebase/` - Firebase setup and configuration
- `docs/development/` - Development guides

### API Documentation

When adding/modifying APIs:

1. Update OpenAPI/Swagger specs
2. Add usage examples
3. Document error responses
4. Update `docs/api/` accordingly

## Questions?

- Open an issue for questions
- Join our community discussions
- Check existing documentation in `docs/`

## Recognition

Contributors are recognized in our README.md and release notes. Thank you for your contributions!

---

By contributing to ReceiptShield, you agree that your contributions will be licensed under the MIT License.

