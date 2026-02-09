# Frontend Team Configuration

## Recommended Agents
- **Code Reviewer** — Component quality, naming, accessibility
- **E2E Runner** — Playwright tests for user flows
- **Refactor Agent** — Component decomposition, dead CSS removal
- **Performance Optimizer** — Bundle size, Web Vitals, render performance

## Skills to Enable
- `frontend-patterns` — React, state management, responsive design, performance
- `test-driven-development` — Jest patterns, coverage validation
- `coding-standards` — JavaScript + TypeScript

## AGENTS.md Additions

```markdown
## Frontend Review Rules
- Components must be under 200 lines
- No inline styles — use CSS modules or styled-components
- All interactive elements must have keyboard support
- Images must have alt text
- Performance budget: initial JS < 200KB gzipped
- Accessibility: WCAG 2.1 AA compliance
```

## Recommended MCP Tools
- Storybook (component documentation)
- Lighthouse (performance audits)
- Figma API (design-to-code sync)

## Conventions
- Component files: `PascalCase.tsx`
- Hook files: `useHookName.ts`
- Style files: `ComponentName.module.css`
- Test files: `ComponentName.test.tsx`
- One component per file
