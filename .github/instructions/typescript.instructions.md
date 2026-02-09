---
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript Instructions

- Use `strict: true` in tsconfig.json
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use `const` over `let`, never `var`
- Named exports only — no default exports
- Use discriminated unions for state machines
- Handle `null`/`undefined` with nullish coalescing (`??`) and optional chaining (`?.`)
- Use `unknown` over `any` — narrow types with type guards
- Prefer `Record<K, V>` over `{[key: string]: V}`
- Use `satisfies` operator for type-safe object literals
- Use `as const` for literal types
