# 🚀 Developer Quick Reference Card

**ReceiptShield Development Standards** | [Full Playbook](../DEVELOPER_PLAYBOOK.md)

---

## ⚡ Daily Workflow

```bash
# 1. Start your day
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# 2. TDD Cycle (repeat)
npm test -- --watch my-feature.test.ts  # Write failing test
# Write code to pass test
# Refactor

# 3. Before committing
npm run lint                             # Check linting
npm run typecheck                        # Check types
npm test                                 # Run all tests

# 4. Commit & push
git add .
git commit -m "feat: my feature description"
git push origin feature/my-feature
```

---

## 🧪 TDD Red-Green-Refactor

```
🔴 RED    → Write a failing test
🟢 GREEN  → Write minimal code to pass
🔵 REFACTOR → Improve code, keep tests green
```

**Remember:** Write the test FIRST!

---

## ✅ Pre-Commit Checklist

Before every commit, ensure:

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] No console.logs in code
- [ ] No sensitive data (API keys, tokens)
- [ ] Comments explain complex logic
- [ ] Commit message follows convention

---

## 📝 Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code change (no functionality change)
- `test:` Adding tests
- `chore:` Maintenance

**Examples:**
```bash
feat(receipts): add bulk upload functionality
fix(auth): resolve token expiration issue
test(receipts): add integration tests
docs(api): update authentication endpoints
```

---

## 🎯 Testing Commands

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode (TDD)
npm test -- --coverage     # With coverage
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only

# Run specific test
npm test -- useReceipts.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should fetch"
```

---

## 🏗️ Component Structure Template

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type { Props } from './types';

interface MyComponentProps {
  data: DataType;
  onAction?: (id: string) => void;
}

export function MyComponent({ data, onAction }: MyComponentProps) {
  // 1️⃣ State
  const [loading, setLoading] = useState(false);
  
  // 2️⃣ Hooks
  const { user } = useAuth();
  
  // 3️⃣ Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // 4️⃣ Handlers
  const handleClick = useCallback(() => {
    // Handle action
  }, []);
  
  // 5️⃣ Early returns
  if (loading) return <LoadingSpinner />;
  
  // 6️⃣ Render
  return <div>{/* JSX */}</div>;
}
```

---

## 🚫 Never Do This

```typescript
// ❌ Using 'any'
const process = (data: any) => { ... };

// ❌ No error handling
await uploadFile(file);

// ❌ Inline business logic
<button onClick={() => {
  // 50 lines of logic here
}}>

// ❌ No validation
await saveData(userInput);

// ❌ Hardcoded values
const apiUrl = 'https://api.example.com';
```

---

## ✅ Always Do This

```typescript
// ✅ Proper typing
const process = (data: DataType): Result => { ... };

// ✅ Error handling
try {
  await uploadFile(file);
} catch (error) {
  handleError(error);
}

// ✅ Extract to handler
const handleClick = async () => {
  // Business logic
};
<button onClick={handleClick}>

// ✅ Validate input
const validated = schema.parse(userInput);
await saveData(validated);

// ✅ Use environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

---

## 🧰 Quick Commands

### Development
```bash
npm run dev              # Start dev server (port 9003)
npm run build            # Build for production
npm run start            # Start production server
```

### Quality Checks
```bash
npm run lint             # Check linting
npm run lint:fix         # Fix linting issues
npm run typecheck        # Check types
npm run format           # Format code
npm run format:check     # Check formatting
```

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage
```

### Firebase
```bash
npm run firebase:emulators  # Start emulators
npm run firebase:deploy     # Deploy to Firebase
```

---

## 📊 Test Coverage Goals

| Type | Target | Priority |
|------|--------|----------|
| Unit Tests | 80%+ | 🔴 Critical |
| Integration | 60%+ | 🟠 High |
| E2E | Key flows | 🟡 Medium |

---

## 🎨 Code Style

### TypeScript
- ✅ Always use strict types
- ✅ No `any` types
- ✅ Use `interface` for objects
- ✅ Use `type` for unions/intersections
- ✅ Export types with code

### React
- ✅ Functional components only
- ✅ Use hooks appropriately
- ✅ Keep components small (<200 lines)
- ✅ Composition over inheritance
- ✅ Memoize when needed

### Naming
- ✅ Components: `PascalCase`
- ✅ Functions: `camelCase`
- ✅ Hooks: `useCamelCase`
- ✅ Constants: `UPPER_SNAKE_CASE`
- ✅ Types: `PascalCase`

---

## 🔐 Security Checklist

- [ ] Never commit API keys or secrets
- [ ] Always validate user input
- [ ] Check authentication/authorization
- [ ] Sanitize data before display
- [ ] Use environment variables for config
- [ ] Follow RBAC for access control

---

## 📚 Key Resources

| Resource | Purpose |
|----------|---------|
| [Developer Playbook](../DEVELOPER_PLAYBOOK.md) | Complete guide |
| [Testing Setup](testing/SETUP_TESTING.md) | Setup tests |
| [AGENTS.md](../AGENTS.md) | AI collaboration |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | How to contribute |

---

## 🎯 Code Review - Give Feedback

Use this format:

```
**[Type]** Location
Description

Example:
[Code Style] src/components/Receipt.tsx:45
Consider extracting this logic to a custom hook for reusability.
```

**Types:**
- `[Critical]` - Must fix
- `[Issue]` - Should fix
- `[Suggestion]` - Consider
- `[Question]` - Clarify
- `[Praise]` - Good work!

---

## 💡 Pro Tips

1. **Write Tests First** - TDD saves time in the long run
2. **Keep PRs Small** - Easier to review, faster to merge
3. **Ask for Help** - Don't struggle alone
4. **Review Your Own Code** - Before requesting review
5. **Learn from Reviews** - Feedback is a gift
6. **Document Why** - Not just what, but why
7. **Refactor Constantly** - Keep code clean
8. **Use Git Properly** - Meaningful commits, clear history

---

## 🆘 Need Help?

1. Check [Developer Playbook](../DEVELOPER_PLAYBOOK.md)
2. Search existing code for examples
3. Ask the team in chat
4. Create a GitHub issue
5. Consult documentation

---

## 🎓 Remember

> **Quality is not an act, it is a habit.** - Aristotle

- Tests give you confidence
- Types prevent bugs
- Reviews make us better
- Automation saves time
- Clean code is maintainable

---

**Print this and keep it handy!** 📌

*Last Updated: January 2025*

