# Testing Setup Guide

This guide will help you set up the testing infrastructure for ReceiptShield from scratch.

## Overview

We use the following testing stack:
- **Jest** - Test runner and framework
- **React Testing Library** - Component testing utilities
- **ts-jest** - TypeScript support for Jest
- **Playwright** (optional) - End-to-end testing

## Installation

### Step 1: Install Testing Dependencies

```bash
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @types/jest \
  jest-environment-jsdom \
  ts-jest
```

### Step 2: Install Optional Dependencies

For end-to-end testing:

```bash
npm install --save-dev @playwright/test
npx playwright install
```

For test coverage:

```bash
npm install --save-dev @jest/globals
```

## Configuration

### Step 3: Create Jest Configuration

Create `jest.config.js` in the root directory:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts?(x)',
    '**/__tests__/**/*.spec.ts?(x)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/app/**', // Exclude Next.js app directory
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
};
```

### Step 4: Create Jest Setup File

Create `jest.setup.js` in the root directory:

```javascript
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-auth-domain';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
```

### Step 5: Update package.json Scripts

Update the test scripts in `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:e2e": "playwright test",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

## Directory Structure

Create the following test directory structure:

```bash
mkdir -p src/__tests__/{unit,integration,e2e,fixtures,__mocks__}
mkdir -p src/__tests__/unit/{components,hooks,lib,services}
```

Your structure should look like:

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── services/
│   ├── integration/
│   ├── e2e/
│   ├── fixtures/
│   └── __mocks__/
├── app/
├── components/
├── lib/
└── ...
```

## Writing Your First Test

### Example 1: Test a Utility Function

Create `src/__tests__/unit/lib/formatCurrency.test.ts`:

```typescript
import { formatCurrency } from '@/lib/utils/formatCurrency';

describe('formatCurrency', () => {
  it('should format USD correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
```

Run the test:

```bash
npm test
```

### Example 2: Test a React Component

Create `src/__tests__/unit/components/Button.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Continuous Integration

Add testing to your CI pipeline. See the Developer Playbook for GitHub Actions examples.

## Best Practices

1. **Test Naming**: Use descriptive test names
   - ✅ `should render receipt information`
   - ❌ `test1`

2. **Arrange-Act-Assert**: Structure tests clearly
   ```typescript
   it('should do something', () => {
     // Arrange - set up test data
     const data = { ... };
     
     // Act - perform action
     const result = doSomething(data);
     
     // Assert - verify result
     expect(result).toBe(expected);
   });
   ```

3. **One Assertion Per Test**: Keep tests focused
   - ✅ Multiple tests, each with one assertion
   - ❌ One test with many assertions

4. **Mock External Dependencies**: Don't test Firebase, test your code
   ```typescript
   jest.mock('@/lib/firebase', () => ({
     db: jest.fn(),
   }));
   ```

5. **Use Testing Library Queries**: Follow best practices
   - Prefer: `getByRole`, `getByLabelText`, `getByText`
   - Avoid: `getByTestId` (use only when necessary)

## Troubleshooting

### Issue: Module not found

**Solution**: Check `moduleNameMapper` in `jest.config.js` matches your `tsconfig.json` paths.

### Issue: TypeScript errors

**Solution**: Ensure `ts-jest` is configured correctly and your `tsconfig.json` is valid.

### Issue: Firebase mocks not working

**Solution**: Make sure `jest.setup.js` is loaded via `setupFilesAfterEnv` in `jest.config.js`.

### Issue: Coverage not working

**Solution**: Check `collectCoverageFrom` patterns in `jest.config.js`.

## Next Steps

1. Start with utility function tests (easiest)
2. Add component tests
3. Add integration tests for API routes
4. Set up E2E tests for critical user flows
5. Configure pre-commit hooks to run tests
6. Add testing to CI/CD pipeline

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Developer Playbook](../../DEVELOPER_PLAYBOOK.md)
- [Test-Driven Development Guide](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Questions?** Refer to the [Developer Playbook](../../DEVELOPER_PLAYBOOK.md) or ask the team.

