# JavaScript / ES6+ Coding Standards

## Naming Conventions

### Variables and Functions
- **camelCase** for variables and functions: `getUserName`, `totalCount`
- **PascalCase** for classes and constructors: `UserService`, `HttpClient`
- **UPPER_SNAKE_CASE** for constants: `MAX_RETRY_COUNT`, `API_BASE_URL`
- **Prefix booleans** with `is`, `has`, `can`, `should`: `isActive`, `hasPermission`

### Files and Modules
- **kebab-case** for file names: `user-service.js`, `api-client.js`
- One primary export per file; name file after the export
- Index files only for barrel exports, never for logic

## Variable Declarations
```javascript
// PREFER const by default
const config = loadConfig();

// USE let only when reassignment is needed
let retryCount = 0;

// NEVER use var - it has function scope, not block scope
```

## Async Patterns

### Prefer async/await over raw Promises
```javascript
// GOOD: async/await with proper error handling
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Failed to fetch user', { id, error: error.message });
    throw error;
  }
}

// BAD: nested .then chains
function fetchUser(id) {
  return fetch(`/api/users/${id}`)
    .then(res => res.json())
    .then(data => processUser(data))
    .then(user => saveUser(user));
}
```

### Parallel Execution
```javascript
// GOOD: run independent operations concurrently
const [users, roles, permissions] = await Promise.all([
  fetchUsers(),
  fetchRoles(),
  fetchPermissions(),
]);

// Use Promise.allSettled when failures are acceptable
const results = await Promise.allSettled(urls.map(url => fetch(url)));
const successful = results.filter(r => r.status === 'fulfilled');
```

## Error Handling

### Custom Error Classes
```javascript
class AppError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
  }
}
```

### Never swallow errors silently
```javascript
// BAD
try { riskyOperation(); } catch (e) {}

// GOOD
try {
  riskyOperation();
} catch (error) {
  logger.warn('Non-critical operation failed', { error: error.message });
}
```

## Destructuring and Spread
```javascript
// Destructure function parameters for clarity
function createUser({ name, email, role = 'viewer' }) {
  return { name, email, role, createdAt: new Date() };
}

// Shallow clone with spread (do not use for deep objects)
const updated = { ...original, status: 'active' };

// Array destructuring for swaps and multiple returns
const [first, ...rest] = items;
```

## Module Organization
```javascript
// 1. External dependencies
import express from 'express';
import { z } from 'zod';

// 2. Internal modules (absolute paths)
import { UserService } from '@/services/user-service';
import { logger } from '@/lib/logger';

// 3. Relative imports (same feature)
import { validateInput } from './validators';
import { USER_ROLES } from './constants';
```

## Array Methods over Loops
```javascript
// PREFER functional methods
const activeUsers = users
  .filter(user => user.isActive)
  .map(user => ({ id: user.id, name: user.name }));

// USE reduce for accumulation
const totals = orders.reduce((acc, order) => acc + order.amount, 0);

// USE for...of when you need break/continue or async iteration
for (const item of items) {
  if (item.skip) continue;
  await processItem(item);
}
```

## Checklist
- [ ] No `var` declarations
- [ ] All async functions have error handling
- [ ] No unused variables or imports
- [ ] Consistent semicolon usage (pick one; enforce with ESLint)
- [ ] No magic numbers; use named constants
- [ ] Functions are under 30 lines; extract helpers for complex logic
- [ ] No nested ternaries deeper than one level
- [ ] Template literals over string concatenation
- [ ] Optional chaining (`?.`) over manual null checks
- [ ] Nullish coalescing (`??`) over `||` for defaults that might be 0 or ''
