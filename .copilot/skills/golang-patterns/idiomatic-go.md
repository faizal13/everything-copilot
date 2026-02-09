# Idiomatic Go

## Naming Conventions

```go
// Exported: MixedCaps (PascalCase)
func ProcessPayment(amount int) error { ... }

// Unexported: mixedCaps (camelCase)
func validateInput(s string) bool { ... }

// Acronyms: ALL CAPS
var httpClient *http.Client
type XMLParser struct { ... }
func ServeHTTP(w http.ResponseWriter, r *http.Request) { ... }

// Single-letter receivers
func (s *Server) Start() error { ... }   // Not: func (server *Server)
func (c *Config) Validate() error { ... } // Not: func (config *Config)
```

## Package Layout

```
myproject/
├── cmd/
│   └── myapp/
│       └── main.go          # Entry point
├── internal/                 # Private packages (can't be imported externally)
│   ├── auth/
│   │   ├── auth.go
│   │   └── auth_test.go
│   └── database/
│       ├── postgres.go
│       └── postgres_test.go
├── pkg/                      # Public packages (can be imported)
│   └── api/
│       └── types.go
├── go.mod
└── go.sum
```

**Rules:**
- One package per directory
- Package name = directory name (lowercase, no underscores)
- `internal/` for packages not meant for external use
- `cmd/` for executable entry points
- Test files alongside source: `foo.go` → `foo_test.go`

## Error Handling

```go
// Always check errors — never ignore them
result, err := doSomething()
if err != nil {
    return fmt.Errorf("doSomething failed: %w", err) // Wrap with %w
}

// Sentinel errors for expected conditions
var ErrNotFound = errors.New("not found")
var ErrUnauthorized = errors.New("unauthorized")

// Check sentinel errors
if errors.Is(err, ErrNotFound) {
    return http.StatusNotFound
}

// Custom error types for rich context
type ValidationError struct {
    Field   string
    Message string
}
func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation: %s: %s", e.Field, e.Message)
}
```

## Zero Value Usefulness

Design types so the zero value is useful:

```go
// sync.Mutex — zero value is an unlocked mutex (ready to use)
var mu sync.Mutex

// bytes.Buffer — zero value is an empty buffer (ready to use)
var buf bytes.Buffer
buf.WriteString("hello")

// Your own types:
type Counter struct {
    count int // zero value: 0 (useful!)
}
func (c *Counter) Increment() { c.count++ }
```

## Constants and Iota

```go
type Status int

const (
    StatusPending  Status = iota // 0
    StatusActive                  // 1
    StatusInactive                // 2
)

func (s Status) String() string {
    switch s {
    case StatusPending:  return "pending"
    case StatusActive:   return "active"
    case StatusInactive: return "inactive"
    default:             return fmt.Sprintf("unknown(%d)", s)
    }
}
```

## init() Function

Use sparingly — prefer explicit initialization:

```go
// Acceptable: registering database drivers
func init() {
    sql.Register("mydriver", &MyDriver{})
}

// Avoid: complex logic, I/O, or anything that can fail
// Use explicit New() or Init() functions instead
```

## Checklist
- [ ] Exported names use PascalCase, unexported use camelCase
- [ ] All errors checked (no `_` for error returns)
- [ ] Errors wrapped with `%w` for context
- [ ] Package names are lowercase, single-word
- [ ] Test files alongside source code
- [ ] Zero values are useful where possible
- [ ] `init()` used only for simple registration
