# React Patterns

## Custom Hooks

Extract reusable logic into custom hooks prefixed with `use`:

```jsx
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

**Rules:**
- One responsibility per hook
- Return values as `[value, setter]` or `{ value, actions }`
- Always specify dependencies in useEffect/useMemo/useCallback
- Custom hooks can call other custom hooks

## Compound Components

Compose related components that share implicit state:

```jsx
function Tabs({ children, defaultTab }) {
  const [active, setActive] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      {children}
    </TabsContext.Provider>
  );
}
Tabs.Tab = function Tab({ id, children }) { /* ... */ };
Tabs.Panel = function Panel({ id, children }) { /* ... */ };
```

## Render Optimization

- **React.memo**: Wrap components that receive the same props frequently
- **useMemo**: Cache expensive computations, not simple lookups
- **useCallback**: Stabilize function references passed as props
- **Key prop**: Use stable unique IDs, never array indices for dynamic lists

```jsx
// Good: stable key
{items.map(item => <Item key={item.id} data={item} />)}

// Bad: index key with reordering
{items.map((item, i) => <Item key={i} data={item} />)}
```

## Error Boundaries

Wrap sections of UI to catch render errors gracefully:

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { logError(error, info); }
  render() {
    if (this.state.hasError) return <FallbackUI />;
    return this.props.children;
  }
}
```

## Suspense

Use Suspense for async loading boundaries:

```jsx
<Suspense fallback={<Skeleton />}>
  <LazyComponent />
</Suspense>
```

## Server vs Client Components (Next.js / RSC)

| Type | Use For | Restrictions |
|------|---------|-------------|
| Server | Data fetching, heavy computation, secrets | No useState/useEffect, no browser APIs |
| Client | Interactivity, event handlers, browser APIs | `'use client'` directive at top |

**Default to server components.** Add `'use client'` only when interactivity is needed.

## Component Organization

```
components/
├── ui/              # Primitives (Button, Input, Modal)
├── features/        # Feature-specific (UserProfile, CheckoutForm)
├── layouts/         # Page layouts (Sidebar, Header)
└── providers/       # Context providers (ThemeProvider, AuthProvider)
```

## Checklist
- [ ] Components have a single responsibility
- [ ] Custom hooks extracted for reusable logic
- [ ] Error boundaries around unstable sections
- [ ] Keys are stable unique IDs
- [ ] Memoization used only where measured benefit exists
- [ ] No prop drilling deeper than 2-3 levels (use Context or composition)
- [ ] Side effects cleaned up in useEffect return
