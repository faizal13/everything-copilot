# Go Testing Patterns

## Table-Driven Tests

The standard Go testing pattern:

```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive", 2, 3, 5},
        {"negative", -1, -2, -3},
        {"zero", 0, 0, 0},
        {"mixed", -1, 5, 4},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := Add(tt.a, tt.b)
            if got != tt.expected {
                t.Errorf("Add(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.expected)
            }
        })
    }
}
```

## Test Helpers

```go
// t.Helper() marks a function as a test helper — errors report caller's line
func assertNoError(t *testing.T, err error) {
    t.Helper()
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
}

func createTestUser(t *testing.T, db *Database) User {
    t.Helper()
    user := User{Name: "test", Email: "test@example.com"}
    err := db.CreateUser(&user)
    assertNoError(t, err)
    return user
}
```

## Subtests

Group related tests with `t.Run`:

```go
func TestUserService(t *testing.T) {
    t.Run("Create", func(t *testing.T) {
        t.Run("valid user", func(t *testing.T) { /* ... */ })
        t.Run("duplicate email", func(t *testing.T) { /* ... */ })
        t.Run("missing name", func(t *testing.T) { /* ... */ })
    })
    t.Run("Delete", func(t *testing.T) {
        t.Run("existing user", func(t *testing.T) { /* ... */ })
        t.Run("nonexistent user", func(t *testing.T) { /* ... */ })
    })
}
```

Run a specific subtest: `go test -run TestUserService/Create/valid_user`

## Benchmarks

```go
func BenchmarkSort(b *testing.B) {
    data := generateData(1000)
    b.ResetTimer() // Don't count setup time

    for i := 0; i < b.N; i++ {
        // Copy data to avoid sorting already-sorted slice
        d := make([]int, len(data))
        copy(d, data)
        sort.Ints(d)
    }
    b.ReportAllocs() // Report memory allocations
}
```

Run: `go test -bench=BenchmarkSort -benchmem`

## Fuzzing (Go 1.18+)

```go
func FuzzParseURL(f *testing.F) {
    // Seed corpus
    f.Add("https://example.com")
    f.Add("http://localhost:8080/path?q=1")
    f.Add("")

    f.Fuzz(func(t *testing.T, input string) {
        url, err := ParseURL(input)
        if err != nil {
            return // Invalid input is OK — just don't crash
        }
        // Round-trip: parsed URL should serialize back
        if url.String() != input {
            // This may be OK (normalization), but flag for review
        }
    })
}
```

Run: `go test -fuzz=FuzzParseURL -fuzztime=30s`

## httptest for HTTP Handlers

```go
func TestGetUser(t *testing.T) {
    handler := NewUserHandler(mockDB)

    req := httptest.NewRequest("GET", "/users/123", nil)
    w := httptest.NewRecorder()

    handler.ServeHTTP(w, req)

    if w.Code != http.StatusOK {
        t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
    }

    var user User
    json.NewDecoder(w.Body).Decode(&user)
    if user.ID != "123" {
        t.Errorf("user.ID = %q, want %q", user.ID, "123")
    }
}
```

## TestMain

Setup and teardown for an entire test package:

```go
func TestMain(m *testing.M) {
    // Setup
    db := setupTestDB()
    defer db.Close()

    // Run tests
    code := m.Run()

    // Teardown
    cleanupTestDB(db)
    os.Exit(code)
}
```

## Golden Files

Compare output against saved "golden" files:

```go
func TestRender(t *testing.T) {
    got := Render(input)
    golden := filepath.Join("testdata", t.Name()+".golden")

    if *update { // -update flag
        os.WriteFile(golden, []byte(got), 0644)
    }

    expected, _ := os.ReadFile(golden)
    if got != string(expected) {
        t.Errorf("output mismatch (run with -update to refresh golden file)")
    }
}
```

## Coverage

```bash
go test -cover ./...                          # Summary
go test -coverprofile=cover.out ./...         # Profile
go tool cover -html=cover.out                 # Visual report
go tool cover -func=cover.out                 # Per-function
```

## Checklist
- [ ] Table-driven tests for functions with multiple inputs
- [ ] Test helpers use `t.Helper()` for correct error reporting
- [ ] Subtests group related test cases
- [ ] HTTP handlers tested with `httptest`
- [ ] Benchmarks for performance-critical code
- [ ] Coverage checked: `go test -cover`
- [ ] Race detector used: `go test -race`
