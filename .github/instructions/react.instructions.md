---
applyTo: "**/*.tsx,**/*.jsx,**/components/**,**/pages/**,**/app/**"
---

# React Instructions

- Use functional components with hooks — no class components
- Custom hooks for reusable logic: `useXxx()` naming
- Use `React.memo()` only when profiling shows unnecessary re-renders
- Prefer `const` component declarations: `const MyComponent: FC<Props> = () => {}`
- Colocate: component + styles + tests + types in same directory
- Use error boundaries for async components
- Prefer server components (React 19+ / Next.js) by default — add `'use client'` only when needed
- State management: `useState` → `useReducer` → Context → Zustand → TanStack Query
- Always provide `key` props on lists — never use array index as key
- Keep components under 100 lines — extract sub-components when larger
