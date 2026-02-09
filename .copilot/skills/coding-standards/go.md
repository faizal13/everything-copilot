# Go Coding Standards

## Naming Conventions

### General Rules
- **MixedCaps** (exported) and **mixedCaps** (unexported): `GetUser`, `parseConfig`
- **Short names** for local variables: `i`, `n`, `err`, `ctx`, `req`, `resp`
- **Descriptive names** for exported symbols: `UserService`, `HandleCreateOrder`
- **Acronyms** stay uppercase: `HTTPClient`, `userID`, `xmlParser`
- **No underscores** in Go names (exception: test functions `Test_specificCase`)

### Package Naming
```go
// GOOD: short, lowercase, singular noun
package user
package http
package config

// BAD: generic, plural, or underscore-separated
package utils     // too vague
package helpers   // too vague
package user_service  // no underscores
```

### Interface Naming
```go
// Single-method interfaces: method name + "er"
type Reader interface { Read(p []byte) (n int, err error) }
type Stringer interface { String() string }

// Multi-method interfaces: descriptive noun
type UserRepository interface {
    Get(ctx context.Context, id string) (*User, error)
    Create(ctx context.Context, user *User) error
    Delete(ctx context.Context, id string) error
}
```

## Error Handling

### Always Check Errors
```go
// GOOD: handle every error
result, err := doSomething()
if err != nil {
    return fmt.Errorf("doSomething failed: %w", err)
}

// BAD: ignoring errors
result, _ := doSomething()
```

### Error Wrapping with Context
```go
func GetUser(ctx context.Context, id string) (*User, error) {
    user, err := db.FindUser(ctx, id)
    if err != nil {
        // Wrap with %w to allow errors.Is/As upstream
        return nil, fmt.Errorf("get user %s: %w", id, err)
    }
    return user, nil
}
```

### Sentinel Errors and Custom Types
```go
// Sentinel errors for expected conditions
var (
    ErrNotFound     = errors.New("not found")
    ErrUnauthorized = errors.New("unauthorized")
)

// Custom error types for rich error data
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation: %s - %s", e.Field, e.Message)
}

// Checking errors upstream
if errors.Is(err, ErrNotFound) {
    http.Error(w, "not found", http.StatusNotFound)
    return
}
var ve *ValidationError
if errors.As(err, &ve) {
    http.Error(w, ve.Error(), http.StatusBadRequest)
    return
}
```

## Struct Design

### Constructor Functions
```go
// Use New* constructors that validate inputs
func NewServer(addr string, opts ...Option) (*Server, error) {
    if addr == "" {
        return nil, errors.New("addr is required")
    }
    s := &Server{addr: addr, timeout: 30 * time.Second}
    for _, opt := range opts {
        opt(s)
    }
    return s, nil
}
```

### Functional Options Pattern
```go
type Option func(*Server)

func WithTimeout(d time.Duration) Option {
    return func(s *Server) { s.timeout = d }
}

func WithLogger(l *slog.Logger) Option {
    return func(s *Server) { s.logger = l }
}

// Usage
srv, err := NewServer(":8080", WithTimeout(10*time.Second), WithLogger(logger))
```

## Package Layout
```
project/
  cmd/
    server/main.go       # entry points
    worker/main.go
  internal/              # private packages
    user/
      user.go            # types and core logic
      repository.go      # data access
      service.go         # business logic
      handler.go         # HTTP handlers
      user_test.go       # tests alongside code
  pkg/                   # public libraries (use sparingly)
    middleware/
  go.mod
  go.sum
```

## Context Usage
```go
// Always pass context as the first parameter
func (s *Service) ProcessOrder(ctx context.Context, orderID string) error {
    // Respect cancellation
    select {
    case <-ctx.Done():
        return ctx.Err()
    default:
    }

    // Pass context to downstream calls
    order, err := s.repo.Get(ctx, orderID)
    if err != nil {
        return fmt.Errorf("get order: %w", err)
    }
    return s.repo.Update(ctx, order)
}
```

## Defer for Cleanup
```go
func ReadFile(path string) ([]byte, error) {
    f, err := os.Open(path)
    if err != nil {
        return nil, err
    }
    defer f.Close() // always close after successful open

    return io.ReadAll(f)
}
```

## Logging with slog (Go 1.21+)
```go
import "log/slog"

logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
logger.Info("request handled",
    slog.String("method", r.Method),
    slog.String("path", r.URL.Path),
    slog.Int("status", status),
    slog.Duration("latency", elapsed),
)
```

## Checklist
- [ ] All errors are checked, never use `_` for error returns
- [ ] Errors are wrapped with `%w` and contextual messages
- [ ] `context.Context` is the first parameter in functions that need it
- [ ] `defer` used for resource cleanup (files, locks, connections)
- [ ] No `init()` functions unless absolutely necessary
- [ ] Exported types and functions have doc comments
- [ ] `go vet` and `staticcheck` pass with no warnings
- [ ] No goroutine leaks; every goroutine has a shutdown path
- [ ] `golangci-lint run` passes
- [ ] Tests are in `_test.go` files alongside the code they test
