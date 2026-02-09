# TypeScript Setup

## Tooling
- **Type Checker:** `tsc` (TypeScript compiler) with `--strict`
- **Linter:** ESLint with `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`
- **Formatter:** Prettier
- **Test Runner:** Vitest (recommended) or Jest with `ts-jest`
- **Build:** `tsc` for type checking, esbuild/swc for fast bundling

## tsconfig.json (Recommended Strict Settings)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ES2022"
  }
}
```

## Skills to Enable
- `coding-standards/typescript.md` — Strict mode, generics, type guards, utility types
- `frontend-patterns/` — If building React/UI
- `backend-patterns/` — If building API/server

## AGENTS.md Snippet

```markdown
## TypeScript Project Rules
- strict: true in tsconfig — no exceptions
- No `any` without a comment explaining why (prefer `unknown`)
- Use discriminated unions for state machines and variant types
- Prefer interfaces for object shapes, type aliases for unions/intersections
- Zod or similar for runtime validation at API boundaries
- No type assertions (as) unless unavoidable — use type guards instead
- Utility types preferred: Pick, Omit, Partial, Required, Record
```

## Common Gotchas
- **Type narrowing:** Use `typeof`, `instanceof`, `in`, or custom type guards — not `as`
- **Declaration files:** Add `*.d.ts` for untyped dependencies
- **Module resolution:** `"moduleResolution": "bundler"` for modern setups
- **`any` escape hatch:** Every `any` should have a TODO to fix or a comment explaining why
- **Enums:** Prefer `as const` objects over TypeScript enums (better tree-shaking)

```typescript
// Prefer const objects over enums
const Status = { Active: 'active', Inactive: 'inactive' } as const;
type Status = typeof Status[keyof typeof Status]; // 'active' | 'inactive'
```
