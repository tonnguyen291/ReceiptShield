# AI Agent Collaboration Guide

This guide helps AI coding assistants collaborate effectively with developers on the ReceiptShield project.

## Purpose

This document provides context, patterns, and guidelines for AI agents (like Cursor, GitHub Copilot, or ChatGPT) to understand the ReceiptShield codebase and provide better assistance.

## Project Context

### What is ReceiptShield?

ReceiptShield is an enterprise receipt management system with AI-powered processing and fraud detection. It helps organizations:
- Automate receipt processing with OCR
- Detect fraudulent submissions using ML
- Manage expenses across teams
- Provide analytics and reporting

### Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query for state management

**Backend:**
- Firebase (Authentication, Firestore, Storage)
- Next.js API Routes
- Google Gemini AI (via Genkit)

**ML/AI:**
- Python scikit-learn for fraud detection
- Google Gemini for OCR and analysis
- Tesseract.js for text extraction

### User Roles

1. **Admin** - Full system access, user management
2. **Manager** - Team oversight, approval workflows
3. **Employee** - Submit receipts, view own data

## Code Organization Philosophy

### Directory Structure Logic

```
src/
├── app/              # Next.js pages + API routes (App Router)
├── components/       # UI components (role-based organization)
├── lib/             # Shared utilities, Firebase config
├── hooks/           # Reusable React hooks
├── contexts/        # Global state (auth, theme)
├── types/           # TypeScript definitions
└── ai/              # Genkit AI flows
```

**Why this structure?**
- **Role-based components**: Easy to find admin vs employee features
- **Lib separation**: Utilities are framework-agnostic
- **Type centralization**: Single source of truth for types

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `ReceiptCard.tsx` |
| Utility Functions | camelCase | `formatCurrency.ts` |
| Custom Hooks | camelCase + `use` | `useReceipts.ts` |
| API Routes | kebab-case | `upload-receipt/route.ts` |
| Types/Interfaces | PascalCase | `Receipt`, `UserRole` |

## Common Patterns

### 1. Component Structure

```typescript
// Standard component template
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  // Props with clear types
  userId: string;
  onComplete?: () => void;
}

export function ComponentName({ userId, onComplete }: ComponentProps) {
  // 1. State
  const [loading, setLoading] = useState(false);
  
  // 2. Hooks
  const { user } = useAuth();
  
  // 3. Handlers
  const handleAction = async () => {
    setLoading(true);
    try {
      // Action logic
      onComplete?.();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // 4. Render
  return (
    <div>
      <Button onClick={handleAction} disabled={loading}>
        {loading ? 'Loading...' : 'Action'}
      </Button>
    </div>
  );
}
```

### 2. Firebase Interactions

```typescript
// Always use typed Firestore operations
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Receipt } from '@/types';

async function fetchUserReceipts(userId: string): Promise<Receipt[]> {
  const receiptsRef = collection(db, 'receipts');
  const q = query(receiptsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Receipt));
}
```

### 3. Role-Based Access Control

```typescript
// Check roles before rendering sensitive UI
const { user } = useAuth();

if (user?.role === 'admin') {
  return <AdminDashboard />;
}

if (user?.role === 'manager') {
  return <ManagerDashboard />;
}

return <EmployeeDashboard />;
```

### 4. AI/Genkit Flows

```typescript
// ai/flows/processReceipt.ts
import { defineFlow } from 'genkit';
import { z } from 'zod';

export const processReceiptFlow = defineFlow(
  {
    name: 'processReceipt',
    inputSchema: z.object({
      imageUrl: z.string().url(),
      userId: z.string(),
    }),
    outputSchema: z.object({
      amount: z.number(),
      vendor: z.string(),
      date: z.string(),
      category: z.string(),
      fraudScore: z.number(),
    }),
  },
  async ({ imageUrl, userId }) => {
    // 1. OCR processing
    // 2. Data extraction
    // 3. Fraud analysis
    // 4. Return structured data
  }
);
```

## Key Principles for AI Assistance

### When Writing Code

1. **Always use TypeScript** - No `any` types unless absolutely necessary
2. **Follow existing patterns** - Look at similar files before creating new ones
3. **Maintain consistency** - Use the same style as surrounding code
4. **Think security** - Validate inputs, check permissions, protect data
5. **Consider performance** - Optimize queries, lazy load components
6. **Update documentation** - If changing functionality, update relevant docs

### When Suggesting Changes

1. **Understand context** - Read related files to understand the full picture
2. **Explain tradeoffs** - Discuss pros/cons of your suggestions
3. **Provide examples** - Show concrete code, not just descriptions
4. **Consider edge cases** - Think about error states, loading states
5. **Think about users** - How does this affect UX?

### When Debugging

1. **Check logs** - Firebase console, browser console, server logs
2. **Verify environment** - Are env vars set correctly?
3. **Test permissions** - Firebase Security Rules might be blocking
4. **Check types** - TypeScript errors often reveal issues
5. **Review recent changes** - What was changed recently?

## Common Tasks & Solutions

### Task: Add a New Feature

```typescript
// 1. Create types first
// types/index.ts
export interface NewFeature {
  id: string;
  name: string;
  // ...
}

// 2. Create component
// components/features/NewFeature.tsx
export function NewFeature() {
  // Component logic
}

// 3. Add to appropriate page
// app/features/page.tsx
import { NewFeature } from '@/components/features/NewFeature';

export default function FeaturesPage() {
  return <NewFeature />;
}

// 4. Add API route if needed
// app/api/features/route.ts
export async function POST(request: Request) {
  // Handle feature creation
}

// 5. Update documentation
// docs/features/NEW_FEATURE.md
```

### Task: Fix a Bug

```typescript
// 1. Reproduce the issue
// 2. Identify the root cause
// 3. Write a test that fails
// 4. Fix the bug
// 5. Verify the test passes
// 6. Check for similar issues elsewhere
// 7. Update error handling if needed
```

### Task: Optimize Performance

```typescript
// 1. Identify bottleneck (React DevTools, Lighthouse)
// 2. Consider solutions:
//    - Memoization (React.memo, useMemo, useCallback)
//    - Code splitting (dynamic imports)
//    - Database query optimization
//    - Image optimization (Next.js Image)
// 3. Measure improvement
// 4. Document changes
```

## AI-Specific Tips

### Understanding User Intent

When a user asks for help:

1. **Clarify ambiguity** - Ask questions if the request is unclear
2. **Suggest alternatives** - Multiple ways to solve a problem
3. **Consider scope** - Is this a quick fix or a larger refactor?
4. **Think about impact** - What else might this change affect?

### Providing Code Snippets

When providing code:

1. **Show context** - Include imports, file structure
2. **Add comments** - Explain complex logic
3. **Include types** - Always TypeScript, properly typed
4. **Show usage** - How to use the code you're providing
5. **Mention caveats** - Edge cases, limitations

### Best Practices for Collaboration

1. **Be proactive** - Suggest improvements, catch issues
2. **Be thorough** - Check related code, consider edge cases
3. **Be clear** - Explain your reasoning, use examples
4. **Be safe** - Prioritize security and correctness
5. **Be respectful** - The developer knows the requirements best

## Project-Specific Knowledge

### Authentication Flow

```typescript
// 1. User signs in (email/password or Google)
// 2. Firebase Auth creates/returns user
// 3. Auth context updates with user data
// 4. Role is fetched from Firestore users collection
// 5. UI renders based on role
```

### Receipt Processing Flow

```typescript
// 1. User uploads receipt image
// 2. Image stored in Firebase Storage
// 3. Genkit flow processes image (OCR + AI)
// 4. ML model calculates fraud score
// 5. Receipt data saved to Firestore
// 6. Manager notified if fraud score is high
// 7. User sees receipt in dashboard
```

### Data Flow

```
User Action → Component → Hook/Context → Firebase → Firestore/Storage
     ↓            ↓           ↓              ↓            ↓
   Event      Handler    State Update    API Call    Data Storage
```

## Warning Signs (Don't Do These!)

❌ **Don't:**
- Use `any` type without justification
- Skip error handling
- Hardcode sensitive data
- Ignore TypeScript errors
- Break existing patterns
- Forget to update documentation
- Skip input validation
- Ignore role-based access control

✅ **Do:**
- Follow existing patterns
- Use proper TypeScript
- Handle errors gracefully
- Validate all inputs
- Check user permissions
- Update documentation
- Write clean, readable code
- Consider security implications

## Quick Reference

### Key Files to Know

| File | Purpose |
|------|---------|
| `src/lib/firebase.ts` | Firebase initialization |
| `src/contexts/auth-context.tsx` | Auth state management |
| `src/types/index.ts` | Global type definitions |
| `src/components/ui/` | Base UI components (shadcn) |
| `src/app/api/` | API routes |
| `ml/scripts/` | ML training/prediction |

### Important Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
npm run typecheck    # Check TypeScript
```

### Environment Variables

Always use environment variables for:
- API keys
- Firebase config
- External service URLs
- Feature flags

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Genkit Docs](https://firebase.google.com/docs/genkit)
- [Project README](../../README.md)
- [Contributing Guide](../../CONTRIBUTING.md)

## Questions?

When helping with code:
1. Check this guide first
2. Review similar code in the project
3. Consult the project documentation
4. Ask the developer if still unclear

Remember: You're a collaborator, not a replacement. Work WITH the developer to create the best solution.

