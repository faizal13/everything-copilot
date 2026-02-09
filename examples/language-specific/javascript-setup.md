# JavaScript / Node.js Setup

## Tooling
- **Linter:** ESLint with `eslint.config.js` (flat config)
- **Formatter:** Prettier (run via ESLint plugin or standalone)
- **Test Runner:** Jest or Vitest
- **Package Manager:** npm, yarn, pnpm, or bun

## Module System
- **New projects:** ESM (`"type": "module"` in package.json)
- **Existing projects:** Keep current system; don't mix CJS and ESM
- **Libraries:** Ship both CJS and ESM builds

## Skills to Enable
- `coding-standards/javascript.md` — ES6+, async patterns, error handling
- `test-driven-development/jest-patterns.md` — Jest mocking, async tests
- `frontend-patterns/` — If building UI

## AGENTS.md Snippet

```markdown
## JavaScript Project Rules
- Use `const` by default, `let` when reassignment needed, never `var`
- Async functions: always use async/await, avoid raw promises
- Error handling: wrap async calls in try/catch, use custom error classes
- No console.log in production code — use a logger
- ESLint must pass with zero errors before commit
- Prettier formatting enforced via pre-commit hook
```

## Common Gotchas
- **`this` binding:** Arrow functions don't have their own `this`
- **Module resolution:** Use explicit extensions in ESM (`import './foo.js'`)
- **Async errors:** Unhandled promise rejections crash Node.js 15+
- **Dependencies:** Use `npm ci` in CI (not `npm install`)
