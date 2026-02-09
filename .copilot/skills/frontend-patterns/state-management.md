# State Management Patterns

## Decision Matrix

| Approach | Best For | Complexity | Bundle Size |
|----------|----------|-----------|-------------|
| `useState` | Local component state | Low | 0 |
| `useReducer` | Complex local state with actions | Low | 0 |
| Context API | Theme, auth, locale (infrequent updates) | Low | 0 |
| Zustand | Global UI state, simple stores | Low | ~1KB |
| Redux Toolkit | Complex shared state, time-travel debug | Medium | ~11KB |
| TanStack Query | Server state (API data) | Medium | ~12KB |
| XState | State machines, complex workflows | Medium | ~15KB |

## Local State: useState & useReducer

```jsx
// Simple values → useState
const [count, setCount] = useState(0);

// Complex state with multiple actions → useReducer
function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { ...state, count: state.count + 1 };
    case 'setName': return { ...state, name: action.payload };
    default: throw new Error(`Unknown action: ${action.type}`);
  }
}
const [state, dispatch] = useReducer(reducer, { count: 0, name: '' });
```

## Context API

Good for: values that change infrequently and are needed across many components.

```jsx
const ThemeContext = createContext('light');

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Split read/write contexts for performance
const ThemeValueContext = createContext('light');
const ThemeSetterContext = createContext(() => {});
```

**Pitfall:** Context causes ALL consumers to re-render on any value change. Split contexts or use selectors.

## Zustand

Minimal global state with selectors:

```js
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  reset: () => set({ count: 0 }),
}));

// Select only what you need (prevents unnecessary re-renders)
const count = useStore((s) => s.count);
```

## Redux Toolkit (RTK)

For complex apps needing middleware, time-travel debugging, or RTK Query:

```js
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; }, // Immer allows mutation
    set: (state, action) => { state.value = action.payload; },
  },
});

export const { increment, set } = counterSlice.actions;
export const store = configureStore({ reducer: { counter: counterSlice.reducer } });
```

## Server State: TanStack Query

Separate server state from client state:

```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000, // 5 min
});

const mutation = useMutation({
  mutationFn: updateUser,
  onSuccess: () => queryClient.invalidateQueries(['users']),
});
```

## Anti-Patterns

- Storing derived state (compute from source instead)
- Syncing state between components with useEffect (lift state up or use shared store)
- Putting everything in global state (keep local what can stay local)
- Forgetting to clean up subscriptions

## Checklist
- [ ] Local state stays local (useState/useReducer)
- [ ] Server state uses a data-fetching library (TanStack Query, SWR)
- [ ] Global UI state uses a lightweight store (Zustand, Redux Toolkit)
- [ ] Context is reserved for infrequent changes (theme, locale, auth)
- [ ] No derived state stored — compute from source of truth
- [ ] Selectors used to prevent unnecessary re-renders
