# Go Interface Design

## Core Principles

### Accept Interfaces, Return Structs

```go
// GOOD: Accept interface — flexible for callers
func ProcessData(r io.Reader) error {
    data, err := io.ReadAll(r)
    // ...
}

// GOOD: Return concrete type — callers get full API
func NewServer(cfg Config) *Server {
    return &Server{config: cfg}
}
```

### Keep Interfaces Small

```go
// GOOD: 1-2 methods (most Go interfaces)
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Stringer interface {
    String() string
}

// BAD: Large interface (hard to implement, hard to mock)
type Repository interface {
    Create(ctx context.Context, item Item) error
    Read(ctx context.Context, id string) (Item, error)
    Update(ctx context.Context, item Item) error
    Delete(ctx context.Context, id string) error
    List(ctx context.Context, filter Filter) ([]Item, error)
    Count(ctx context.Context, filter Filter) (int, error)
    // ... 10 more methods
}

// BETTER: Split into focused interfaces
type ItemReader interface {
    Read(ctx context.Context, id string) (Item, error)
    List(ctx context.Context, filter Filter) ([]Item, error)
}
type ItemWriter interface {
    Create(ctx context.Context, item Item) error
    Update(ctx context.Context, item Item) error
    Delete(ctx context.Context, id string) error
}
```

### Naming Convention

Interfaces with one method: name ends in `-er`:

```go
type Reader interface { Read(p []byte) (n int, err error) }
type Writer interface { Write(p []byte) (n int, err error) }
type Closer interface { Close() error }
type Stringer interface { String() string }
type Handler interface { ServeHTTP(ResponseWriter, *Request) }
```

## Implicit Satisfaction

No `implements` keyword — a type satisfies an interface by having the right methods:

```go
type MyWriter struct { buf []byte }

func (w *MyWriter) Write(p []byte) (int, error) {
    w.buf = append(w.buf, p...)
    return len(p), nil
}

// MyWriter now satisfies io.Writer — no declaration needed
var w io.Writer = &MyWriter{}
```

**Compile-time check** (useful for documentation):
```go
var _ io.Writer = (*MyWriter)(nil)
```

## Interface Composition

Combine small interfaces into larger ones:

```go
type ReadWriter interface {
    Reader
    Writer
}

type ReadWriteCloser interface {
    Reader
    Writer
    Closer
}
```

## Type Assertions and Type Switches

```go
// Type assertion
if closer, ok := w.(io.Closer); ok {
    defer closer.Close()
}

// Type switch
func describe(i interface{}) string {
    switch v := i.(type) {
    case string: return fmt.Sprintf("string: %s", v)
    case int:    return fmt.Sprintf("int: %d", v)
    case error:  return fmt.Sprintf("error: %v", v)
    default:     return fmt.Sprintf("unknown: %T", v)
    }
}
```

## The `any` Type

`any` is an alias for `interface{}`. Use it sparingly:

```go
// Acceptable: generic containers, JSON parsing
func ParseJSON(data []byte) (map[string]any, error) { ... }

// Prefer type parameters (generics) for type-safe alternatives
func Map[T, U any](slice []T, fn func(T) U) []U { ... }
```

## Testing with Interfaces

```go
// Define interface in the consumer package (not the provider)
type UserStore interface {
    GetUser(ctx context.Context, id string) (User, error)
}

// Mock in tests
type mockUserStore struct {
    users map[string]User
}
func (m *mockUserStore) GetUser(_ context.Context, id string) (User, error) {
    u, ok := m.users[id]
    if !ok { return User{}, ErrNotFound }
    return u, nil
}
```

## Checklist
- [ ] Interfaces have 1-3 methods (split larger ones)
- [ ] Interfaces defined in consumer package, not provider
- [ ] Functions accept interfaces, return concrete types
- [ ] Interface names end in `-er` for single-method interfaces
- [ ] Compile-time satisfaction check: `var _ Interface = (*Type)(nil)`
- [ ] No empty interface (`any`) where a concrete type or generic works
