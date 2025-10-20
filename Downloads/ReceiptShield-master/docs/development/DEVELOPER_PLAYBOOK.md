# 📘 Developer Playbook

**ReceiptShield Development Standards & Best Practices**

> *Version 1.0 | Last Updated: January 2025*

---

## Table of Contents

1. [Introduction](#introduction)
2. [Project Structure Review](#project-structure-review)
3. [Coding Standards](#coding-standards)
4. [Test-Driven Development (TDD)](#test-driven-development-tdd)
5. [Everything as Code](#everything-as-code)
6. [CI/CD Best Practices](#cicd-best-practices)
7. [Code Quality & Reviews](#code-quality--reviews)
8. [Development Workflow](#development-workflow)
9. [Quick Reference](#quick-reference)

---

## Introduction

### Purpose

This playbook serves as the **definitive guide** for all developers working on ReceiptShield. It establishes:
- ✅ **Consistent code standards** across the team
- ✅ **Quality assurance** through TDD and automation
- ✅ **Efficient workflows** for rapid, safe delivery
- ✅ **Best practices** for maintainable, scalable code

### Principles

Our development philosophy is built on:

1. **🎯 Test-First Mentality** - Write tests before code
2. **🔒 Security by Default** - Never compromise on security
3. **📏 Type Safety First** - Leverage TypeScript fully
4. **🚀 Automation Over Manual** - Automate everything possible
5. **📚 Documentation as Code** - Code should be self-documenting
6. **♻️ DRY & SOLID Principles** - Write clean, reusable code
7. **🔄 Continuous Improvement** - Always refactor and improve

---

## Project Structure Review

### Current Architecture

```
ReceiptShield/
├── 📱 Frontend (Next.js 15 + React 18 + TypeScript)
├── 🔥 Backend (Firebase: Auth, Firestore, Storage)
├── 🤖 AI/ML (Google Gemini + Python scikit-learn)
├── 📊 Analytics (Custom dashboards + monitoring)
└── 🔐 Security (RBAC, validation, encryption)
```

### Directory Organization

#### ✅ **Strengths**

| Aspect | Rating | Notes |
|--------|--------|-------|
| **Separation of Concerns** | ⭐⭐⭐⭐⭐ | Clear boundaries between frontend, backend, ML |
| **Role-Based Structure** | ⭐⭐⭐⭐⭐ | Components organized by user role (admin/manager/employee) |
| **Documentation** | ⭐⭐⭐⭐⭐ | Comprehensive docs for architecture, deployment, testing |
| **Type Definitions** | ⭐⭐⭐⭐☆ | Centralized in `src/types/`, some gaps exist |
| **Utility Organization** | ⭐⭐⭐⭐⭐ | Clean separation in `src/lib/` |

#### 🔴 **Areas for Improvement**

| Issue | Priority | Solution |
|-------|----------|----------|
| **No Test Directory** | 🔴 Critical | Create `src/__tests__/` structure |
| **Mixed Component Patterns** | 🟠 High | Standardize on composition patterns |
| **Large API Routes** | 🟡 Medium | Split into services layer |
| **ML Code Integration** | 🟡 Medium | Better Python-TS bridge |
| **Duplicate Logic** | 🟡 Medium | Extract to shared utilities |

### Recommended Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # App layout group
│   ├── (auth)/            # Auth layout group
│   ├── api/               # API routes
│   └── ...
├── components/            # React components
│   ├── ui/               # Base shadcn components
│   ├── admin/            # Admin-specific
│   ├── manager/          # Manager-specific
│   ├── employee/         # Employee-specific
│   └── shared/           # Shared components
├── lib/                   # Business logic & utilities
│   ├── services/         # Service layer (NEW)
│   │   ├── receipt.service.ts
│   │   ├── user.service.ts
│   │   └── fraud.service.ts
│   ├── utils/            # Pure utility functions
│   ├── validators/       # Zod schemas (NEW)
│   └── constants/        # Constants & enums (NEW)
├── hooks/                 # Custom React hooks
├── contexts/              # React contexts
├── types/                 # TypeScript definitions
├── ai/                    # Genkit AI flows
├── __tests__/            # Test files (NEW)
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   ├── e2e/              # End-to-end tests
│   └── fixtures/         # Test data & mocks
└── __mocks__/            # Jest mocks (NEW)

ml/                        # Python ML models
├── models/               # Trained models (*.pkl)
├── scripts/              # Training scripts
├── data/                 # Datasets
├── tests/                # Python tests (NEW)
└── services/             # ML API services (NEW)

docs/                      # Documentation
scripts/                   # Automation scripts
tools/                     # Development tools
```

---

## Coding Standards

### TypeScript Standards

#### 1. **Type Safety - No Compromises**

```typescript
// ❌ BAD - Using 'any' defeats TypeScript
const processData = (data: any) => {
  return data.map((item: any) => item.value);
};

// ✅ GOOD - Proper typing
interface DataItem {
  id: string;
  value: number;
  timestamp: Date;
}

const processData = (data: DataItem[]): number[] => {
  return data.map(item => item.value);
};

// ✅ BEST - Generic for reusability
function processData<T extends { value: number }>(data: T[]): number[] {
  return data.map(item => item.value);
}
```

#### 2. **Strict Configuration**

Ensure `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### 3. **Type Definition Best Practices**

```typescript
// ✅ Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

// ✅ Use type for unions, intersections, utilities
type UserRole = 'admin' | 'manager' | 'employee';
type UserWithReceipts = User & { receipts: Receipt[] };
type PartialUser = Partial<User>;

// ✅ Use enums sparingly (prefer string unions)
// Enums generate runtime code, unions don't

// ❌ Avoid
enum Status { Pending, Approved, Rejected }

// ✅ Prefer
type Status = 'pending' | 'approved' | 'rejected';
```

### React Best Practices

#### 1. **Component Structure**

```typescript
/**
 * Standard Component Template
 * Follow this structure for all components
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import type { ComponentProps } from './types';

interface ReceiptCardProps {
  receipt: Receipt;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;
  variant?: 'compact' | 'detailed';
}

/**
 * ReceiptCard - Displays a single receipt with actions
 * 
 * @param receipt - Receipt object to display
 * @param onEdit - Optional callback when edit is clicked
 * @param onDelete - Optional async callback when delete is clicked
 * @param variant - Display variant (default: 'compact')
 */
export function ReceiptCard({
  receipt,
  onEdit,
  onDelete,
  variant = 'compact',
}: ReceiptCardProps) {
  // 1️⃣ State declarations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2️⃣ Context/hooks
  const { user } = useAuth();

  // 3️⃣ Derived state (useMemo if expensive)
  const canEdit = user?.id === receipt.userId;

  // 4️⃣ Effects
  useEffect(() => {
    // Side effects here
  }, [receipt.id]);

  // 5️⃣ Event handlers (useCallback if passed to children)
  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await onDelete(receipt.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  }, [receipt.id, onDelete]);

  // 6️⃣ Early returns for loading/error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // 7️⃣ Main render
  return (
    <div className="receipt-card">
      {/* Component JSX */}
    </div>
  );
}
```

#### 2. **Component Composition**

```typescript
// ✅ GOOD - Composable, single responsibility
export function Receipt({ data }: ReceiptProps) {
  return (
    <Card>
      <ReceiptHeader data={data} />
      <ReceiptDetails data={data} />
      <ReceiptActions data={data} />
    </Card>
  );
}

// ❌ BAD - Monolithic, hard to maintain
export function Receipt({ data }: ReceiptProps) {
  return (
    <div>
      {/* 500 lines of JSX */}
    </div>
  );
}
```

#### 3. **Custom Hooks**

```typescript
// ✅ Extract reusable logic into hooks
function useReceipts(userId: string) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    const fetchReceipts = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'receipts'),
          where('userId', '==', userId),
          orderBy('date', 'desc')
        );
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Receipt));
          setReceipts(data);
          setLoading(false);
        });
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchReceipts();

    return () => unsubscribe?.();
  }, [userId]);

  return { receipts, loading, error };
}

// Usage
function ReceiptList() {
  const { user } = useAuth();
  const { receipts, loading, error } = useReceipts(user.id);
  
  // Render logic
}
```

#### 4. **Performance Optimization**

```typescript
// ✅ Memoize expensive computations
const sortedReceipts = useMemo(() => {
  return receipts.sort((a, b) => b.amount - a.amount);
}, [receipts]);

// ✅ Memoize callback functions passed to children
const handleClick = useCallback((id: string) => {
  // Handle click
}, [/* dependencies */]);

// ✅ Memoize components that re-render unnecessarily
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // Complex rendering logic
});

// ✅ Code splitting for large components
const AdminPanel = lazy(() => import('./AdminPanel'));
```

### Service Layer Pattern

#### Create Separation Between UI and Business Logic

```typescript
// src/lib/services/receipt.service.ts

import { db, storage } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Receipt, ReceiptCreateData } from '@/types';

/**
 * Receipt Service
 * Handles all receipt-related business logic
 */
export class ReceiptService {
  private static receiptsCollection = collection(db, 'receipts');

  /**
   * Upload receipt image to storage
   */
  static async uploadImage(file: File, userId: string): Promise<string> {
    const storageRef = ref(storage, `receipts/${userId}/${Date.now()}-${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  }

  /**
   * Create a new receipt
   */
  static async create(data: ReceiptCreateData): Promise<Receipt> {
    const docRef = await addDoc(this.receiptsCollection, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      id: docRef.id,
      ...data,
    };
  }

  /**
   * Get receipts by user ID
   */
  static async getByUserId(userId: string): Promise<Receipt[]> {
    const q = query(
      this.receiptsCollection,
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Receipt));
  }

  /**
   * Calculate fraud score for receipt
   */
  static async calculateFraudScore(receipt: Receipt): Promise<number> {
    // Call ML service
    const response = await fetch('/api/fraud-detection', {
      method: 'POST',
      body: JSON.stringify(receipt),
    });
    
    const { fraudScore } = await response.json();
    return fraudScore;
  }
}

// Usage in component
async function handleUpload(file: File) {
  const imageUrl = await ReceiptService.uploadImage(file, user.id);
  const receipt = await ReceiptService.create({
    userId: user.id,
    imageUrl,
    amount: 0, // Will be extracted
    // ...
  });
}
```

### Error Handling Standards

```typescript
// ✅ Custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public data?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, data?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, data);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

// ✅ Centralized error handler
export function handleError(error: unknown): { message: string; code: string } {
  console.error('Error occurred:', error);

  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof FirebaseError) {
    return {
      message: 'Firebase error occurred',
      code: error.code,
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

// Usage
try {
  await uploadReceipt(file);
} catch (error) {
  const { message, code } = handleError(error);
  toast.error(message);
  logError(code, error);
}
```

---

## Test-Driven Development (TDD)

### TDD Philosophy

> **Red → Green → Refactor**
> 
> 1. **Red**: Write a failing test
> 2. **Green**: Write minimal code to pass
> 3. **Refactor**: Improve code while keeping tests green

### Why TDD?

| Benefit | Impact |
|---------|--------|
| **🐛 Fewer Bugs** | Catch issues before production |
| **📐 Better Design** | Forces modular, testable code |
| **📚 Living Documentation** | Tests show how code should be used |
| **🔒 Confidence** | Refactor without fear |
| **⚡ Faster Development** | Less debugging, more building |

### Test Setup

#### 1. **Install Testing Dependencies**

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

#### 2. **Jest Configuration**

```javascript
// jest.config.js
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

#### 3. **Jest Setup File**

```javascript
// jest.setup.js
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
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
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
```

### TDD Examples

#### Example 1: Testing a Utility Function

```typescript
// src/lib/utils/formatCurrency.ts
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
```

```typescript
// src/__tests__/unit/utils/formatCurrency.test.ts
import { formatCurrency } from '@/lib/utils/formatCurrency';

describe('formatCurrency', () => {
  it('should format USD correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should format with zero decimal places for whole numbers', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });

  it('should handle negative amounts', () => {
    expect(formatCurrency(-50.25)).toBe('-$50.25');
  });

  it('should handle different currencies', () => {
    expect(formatCurrency(1000, 'EUR')).toContain('€');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
```

#### Example 2: Testing a React Component

```typescript
// src/components/shared/ReceiptCard.tsx
import { formatCurrency } from '@/lib/utils/formatCurrency';

interface ReceiptCardProps {
  receipt: {
    id: string;
    amount: number;
    vendor: string;
    date: Date;
  };
  onDelete?: (id: string) => void;
}

export function ReceiptCard({ receipt, onDelete }: ReceiptCardProps) {
  return (
    <div data-testid="receipt-card">
      <h3>{receipt.vendor}</h3>
      <p>{formatCurrency(receipt.amount)}</p>
      <p>{receipt.date.toLocaleDateString()}</p>
      {onDelete && (
        <button
          onClick={() => onDelete(receipt.id)}
          data-testid="delete-button"
        >
          Delete
        </button>
      )}
    </div>
  );
}
```

```typescript
// src/__tests__/unit/components/ReceiptCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ReceiptCard } from '@/components/shared/ReceiptCard';

describe('ReceiptCard', () => {
  const mockReceipt = {
    id: '123',
    amount: 50.99,
    vendor: 'Starbucks',
    date: new Date('2025-01-15'),
  };

  it('should render receipt information', () => {
    render(<ReceiptCard receipt={mockReceipt} />);
    
    expect(screen.getByText('Starbucks')).toBeInTheDocument();
    expect(screen.getByText('$50.99')).toBeInTheDocument();
    expect(screen.getByText('1/15/2025')).toBeInTheDocument();
  });

  it('should not render delete button when onDelete is not provided', () => {
    render(<ReceiptCard receipt={mockReceipt} />);
    
    expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
  });

  it('should render delete button when onDelete is provided', () => {
    const onDelete = jest.fn();
    render(<ReceiptCard receipt={mockReceipt} onDelete={onDelete} />);
    
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  it('should call onDelete with receipt id when delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<ReceiptCard receipt={mockReceipt} onDelete={onDelete} />);
    
    fireEvent.click(screen.getByTestId('delete-button'));
    
    expect(onDelete).toHaveBeenCalledWith('123');
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
```

#### Example 3: Testing Custom Hooks

```typescript
// src/hooks/useReceipts.ts
import { useState, useEffect } from 'react';
import { ReceiptService } from '@/lib/services/receipt.service';
import type { Receipt } from '@/types';

export function useReceipts(userId: string) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setLoading(true);
        const data = await ReceiptService.getByUserId(userId);
        setReceipts(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [userId]);

  return { receipts, loading, error };
}
```

```typescript
// src/__tests__/unit/hooks/useReceipts.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useReceipts } from '@/hooks/useReceipts';
import { ReceiptService } from '@/lib/services/receipt.service';

jest.mock('@/lib/services/receipt.service');

describe('useReceipts', () => {
  const mockReceipts = [
    { id: '1', amount: 50, vendor: 'Store A' },
    { id: '2', amount: 75, vendor: 'Store B' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch receipts on mount', async () => {
    (ReceiptService.getByUserId as jest.Mock).mockResolvedValue(mockReceipts);

    const { result } = renderHook(() => useReceipts('user123'));

    expect(result.current.loading).toBe(true);
    expect(result.current.receipts).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.receipts).toEqual(mockReceipts);
    expect(result.current.error).toBeNull();
    expect(ReceiptService.getByUserId).toHaveBeenCalledWith('user123');
  });

  it('should handle errors', async () => {
    const error = new Error('Fetch failed');
    (ReceiptService.getByUserId as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useReceipts('user123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.receipts).toEqual([]);
  });

  it('should refetch when userId changes', async () => {
    (ReceiptService.getByUserId as jest.Mock).mockResolvedValue(mockReceipts);

    const { result, rerender } = renderHook(
      ({ userId }) => useReceipts(userId),
      { initialProps: { userId: 'user1' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(ReceiptService.getByUserId).toHaveBeenCalledWith('user1');

    // Change userId
    rerender({ userId: 'user2' });

    await waitFor(() => {
      expect(ReceiptService.getByUserId).toHaveBeenCalledWith('user2');
    });
  });
});
```

#### Example 4: Testing API Routes

```typescript
// src/app/api/receipts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ReceiptService } from '@/lib/services/receipt.service';
import { auth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decodedToken = await auth.verifyIdToken(token);
    const receipts = await ReceiptService.getByUserId(decodedToken.uid);

    return NextResponse.json({ receipts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/__tests__/integration/api/receipts.test.ts
import { GET } from '@/app/api/receipts/route';
import { ReceiptService } from '@/lib/services/receipt.service';
import { auth } from '@/lib/firebase-admin';

jest.mock('@/lib/services/receipt.service');
jest.mock('@/lib/firebase-admin');

describe('GET /api/receipts', () => {
  const mockReceipts = [
    { id: '1', amount: 50, vendor: 'Store A' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return receipts for authenticated user', async () => {
    (auth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'user123' });
    (ReceiptService.getByUserId as jest.Mock).mockResolvedValue(mockReceipts);

    const request = new Request('http://localhost:3000/api/receipts', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ receipts: mockReceipts });
    expect(ReceiptService.getByUserId).toHaveBeenCalledWith('user123');
  });

  it('should return 401 when no token provided', async () => {
    const request = new Request('http://localhost:3000/api/receipts');

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 500 on service error', async () => {
    (auth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'user123' });
    (ReceiptService.getByUserId as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    const request = new Request('http://localhost:3000/api/receipts', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});
```

### Test Coverage Goals

| Test Type | Target Coverage | Priority |
|-----------|----------------|----------|
| **Unit Tests** | 80%+ | 🔴 Critical |
| **Integration Tests** | 60%+ | 🟠 High |
| **E2E Tests** | Key user flows | 🟡 Medium |
| **Critical Paths** | 100% | 🔴 Critical |

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- useReceipts.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should fetch receipts"
```

### Add to package.json

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

---

## Everything as Code

### Infrastructure as Code (IaC)

#### Firebase Configuration

```typescript
// firebase.config.ts
export const firebaseConfig = {
  production: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    appId: process.env.FIREBASE_APP_ID!,
    apiKey: process.env.FIREBASE_API_KEY!,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
  },
  staging: {
    projectId: process.env.FIREBASE_STAGING_PROJECT_ID!,
    // ... staging config
  },
  development: {
    projectId: 'local-dev',
    // ... local config
  },
};

export function getFirebaseConfig() {
  const env = process.env.NODE_ENV;
  return firebaseConfig[env as keyof typeof firebaseConfig] || firebaseConfig.development;
}
```

#### Firestore Rules as Code

```javascript
// firestore.rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function hasRole(role) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) || hasRole('admin');
    }
    
    // Receipts collection
    match /receipts/{receiptId} {
      allow read: if isAuthenticated() && (
        isOwner(resource.data.userId) ||
        hasRole('manager') ||
        hasRole('admin')
      );
      
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      
      allow update: if isOwner(resource.data.userId) || hasRole('manager');
      allow delete: if hasRole('admin');
    }
  }
}
```

### Configuration as Code

```typescript
// src/config/app.config.ts
export const appConfig = {
  app: {
    name: 'ReceiptShield',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  },
  
  features: {
    fraudDetection: true,
    emailNotifications: true,
    bulkUpload: false, // Feature flag
    advancedAnalytics: process.env.NODE_ENV === 'production',
  },
  
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFilesPerUpload: 5,
    maxReceiptsPerMonth: 1000,
  },
  
  ml: {
    fraudThreshold: 0.7, // 70% confidence
    modelVersion: '1.2.0',
    endpoint: process.env.ML_API_ENDPOINT,
  },
  
  email: {
    provider: 'sendgrid',
    from: process.env.EMAIL_FROM,
    templates: {
      welcome: 'd-xxxxx',
      receiptApproved: 'd-yyyyy',
      fraudAlert: 'd-zzzzz',
    },
  },
} as const;

// Type-safe config access
export type AppConfig = typeof appConfig;
```

### Database Schema as Code

```typescript
// src/lib/schema/collections.ts
import { z } from 'zod';

// User schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'manager', 'employee']),
  department: z.string().optional(),
  managerId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Receipt schema
export const ReceiptSchema = z.object({
  id: z.string(),
  userId: z.string(),
  imageUrl: z.string().url(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  vendor: z.string(),
  date: z.date(),
  category: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  fraudScore: z.number().min(0).max(1),
  ocrData: z.object({
    raw: z.string(),
    confidence: z.number(),
  }),
  metadata: z.object({
    ipAddress: z.string().optional(),
    deviceInfo: z.string().optional(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Receipt = z.infer<typeof ReceiptSchema>;

// Validation helpers
export function validateUser(data: unknown): User {
  return UserSchema.parse(data);
}

export function validateReceipt(data: unknown): Receipt {
  return ReceiptSchema.parse(data);
}
```

### API Contracts as Code

```typescript
// src/lib/api/contracts.ts
import { z } from 'zod';

// Request/Response schemas for type-safe APIs
export const CreateReceiptRequest = z.object({
  imageUrl: z.string().url(),
  amount: z.number().positive(),
  vendor: z.string().min(1),
  date: z.string().datetime(),
  category: z.string(),
});

export const CreateReceiptResponse = z.object({
  id: z.string(),
  receipt: ReceiptSchema,
  fraudScore: z.number(),
});

export const GetReceiptsRequest = z.object({
  userId: z.string(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export const GetReceiptsResponse = z.object({
  receipts: z.array(ReceiptSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

// Type exports
export type CreateReceiptRequest = z.infer<typeof CreateReceiptRequest>;
export type CreateReceiptResponse = z.infer<typeof CreateReceiptResponse>;
export type GetReceiptsRequest = z.infer<typeof GetReceiptsRequest>;
export type GetReceiptsResponse = z.infer<typeof GetReceiptsResponse>;
```

### Deployment as Code

```yaml
# .github/workflows/deploy.yml
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
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:ci
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
```

### Documentation as Code

```typescript
// src/lib/api/docs.ts
/**
 * @swagger
 * /api/receipts:
 *   get:
 *     summary: Get user receipts
 *     description: Retrieve all receipts for authenticated user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 receipts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Receipt'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
```

---

## CI/CD Best Practices

### Continuous Integration

#### Pre-commit Hooks (Husky)

```bash
# Install Husky
npm install --save-dev husky lint-staged

# Initialize
npx husky install
npm set-script prepare "husky install"
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint-staged
npm run typecheck
npm run test:unit
```

#### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck
      
      - name: Format check
        run: npm run format:check
  
  test:
    name: Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Unit tests
        run: npm run test:unit -- --coverage
      
      - name: Integration tests
        run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
  
  build:
    name: Build
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Archive build
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next
```

### Continuous Deployment

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags:
      - 'v*'

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          # ... other env vars
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: receiptshield-prod
      
      - name: Create Sentry release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: receiptshield
          SENTRY_PROJECT: web
        with:
          environment: production
```

---

## Code Quality & Reviews

### Code Review Checklist

#### Before Creating PR

- [ ] All tests pass locally
- [ ] Code is formatted (Prettier)
- [ ] No linting errors (ESLint)
- [ ] No TypeScript errors
- [ ] Added tests for new functionality
- [ ] Updated documentation
- [ ] Verified no console.logs or debugger statements
- [ ] Checked for sensitive data (API keys, tokens)

#### During Code Review

**Functionality**
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Performance is acceptable

**Code Quality**
- [ ] Follows project conventions
- [ ] Is maintainable and readable
- [ ] Has appropriate comments for complex logic
- [ ] Uses descriptive variable/function names
- [ ] No unnecessary complexity
- [ ] DRY principle followed

**Testing**
- [ ] Has adequate test coverage
- [ ] Tests are meaningful
- [ ] Tests are not brittle

**Security**
- [ ] No security vulnerabilities
- [ ] Input validation is present
- [ ] Authentication/authorization checked
- [ ] Sensitive data is protected

### ESLint Configuration

```javascript
// eslint.config.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

---

## Development Workflow

### Branch Strategy

```
main                    # Production-ready code
  └── develop          # Integration branch
       ├── feature/*   # New features
       ├── bugfix/*    # Bug fixes
       ├── hotfix/*    # Critical production fixes
       └── refactor/*  # Code improvements
```

### Feature Development Flow

1. **Create branch from develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/receipt-bulk-upload
   ```

2. **Write tests first (TDD)**
   ```bash
   # Create test file
   touch src/__tests__/unit/services/bulkUpload.test.ts
   
   # Write failing tests
   npm test -- --watch bulkUpload.test.ts
   ```

3. **Implement feature**
   ```bash
   # Write code to pass tests
   # Refactor while keeping tests green
   ```

4. **Commit with conventional commits**
   ```bash
   git add .
   git commit -m "feat: add bulk receipt upload functionality"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/receipt-bulk-upload
   # Create PR on GitHub
   ```

6. **Code review and merge**
   ```bash
   # After approval
   git checkout develop
   git merge --no-ff feature/receipt-bulk-upload
   git push origin develop
   ```

### Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semi colons, etc
- `refactor`: Code change that neither fixes nor adds feature
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintain

**Examples:**
```bash
feat(receipts): add bulk upload functionality
fix(auth): resolve token expiration issue
docs(api): update authentication endpoints
test(receipts): add integration tests for fraud detection
refactor(services): extract receipt processing logic
```

---

## Quick Reference

### Daily Workflow

```bash
# Start your day
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# TDD cycle
npm test -- --watch my-feature.test.ts  # Write test
# Write code to pass test
# Refactor

# Before committing
npm run lint                             # Check linting
npm run typecheck                        # Check types
npm test                                 # Run all tests
git add .
git commit -m "feat: my feature"
git push origin feature/my-feature
```

### Testing Commands

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
```

### Quality Checks

```bash
npm run lint              # Lint code
npm run lint:fix          # Fix linting issues
npm run typecheck         # Type check
npm run format            # Format code
npm run format:check      # Check formatting
```

### Build Commands

```bash
npm run dev               # Development server
npm run build             # Production build
npm run start             # Start production server
npm run analyze           # Bundle analysis
```

---

## Conclusion

This playbook is a **living document**. As we learn and improve, we update these standards.

### Key Takeaways

1. **Write tests first** - TDD leads to better code
2. **Type everything** - TypeScript is our friend
3. **Automate everything** - CI/CD is mandatory
4. **Code as documentation** - Self-documenting code
5. **Review everything** - No code goes unreviewed
6. **Commit conventions** - Clear, consistent history

### Questions?

- Refer to [CONTRIBUTING.md](./CONTRIBUTING.md)
- Check [docs/README.md](./docs/README.md)
- Ask in team chat
- Review existing code examples

---

**Remember:** Quality is not an act, it is a habit.

*Happy coding! 🚀*

