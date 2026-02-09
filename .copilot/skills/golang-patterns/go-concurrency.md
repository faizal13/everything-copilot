# Go Concurrency Patterns

## Goroutines

```go
// Launch a goroutine
go func() {
    result := heavyComputation()
    fmt.Println(result)
}()

// ALWAYS manage goroutine lifetime — never fire and forget
// Use sync.WaitGroup, channels, or context for coordination
```

## Channels

```go
// Unbuffered: sender blocks until receiver is ready
ch := make(chan int)

// Buffered: sender blocks only when buffer is full
ch := make(chan int, 10)

// Directional channels in function signatures
func producer(out chan<- int) { out <- 42 }      // Send only
func consumer(in <-chan int) { val := <-in }     // Receive only

// Always close channels from the sender side
close(ch)
```

## Select Statement

```go
select {
case msg := <-msgCh:
    handle(msg)
case err := <-errCh:
    handleError(err)
case <-time.After(5 * time.Second):
    fmt.Println("timeout")
case <-ctx.Done():
    fmt.Println("cancelled")
default:
    // Non-blocking: runs if no channel is ready
}
```

## sync.WaitGroup (Fan-Out/Fan-In)

```go
func processAll(items []Item) {
    var wg sync.WaitGroup

    for _, item := range items {
        wg.Add(1)
        go func(it Item) {
            defer wg.Done()
            process(it)
        }(item)
    }

    wg.Wait() // Block until all goroutines finish
}
```

## context.Context

```go
// Create with timeout
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel() // Always defer cancel to release resources

// Pass to functions
func fetchData(ctx context.Context, url string) ([]byte, error) {
    req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err // Will return context.DeadlineExceeded on timeout
    }
    defer resp.Body.Close()
    return io.ReadAll(resp.Body)
}

// Check cancellation in loops
for {
    select {
    case <-ctx.Done():
        return ctx.Err()
    default:
        // Do work
    }
}
```

## errgroup (Concurrent Error Handling)

```go
import "golang.org/x/sync/errgroup"

func fetchAll(ctx context.Context, urls []string) ([]Result, error) {
    g, ctx := errgroup.WithContext(ctx)
    results := make([]Result, len(urls))

    for i, url := range urls {
        i, url := i, url // Capture loop vars
        g.Go(func() error {
            res, err := fetch(ctx, url)
            if err != nil {
                return err // First error cancels all goroutines
            }
            results[i] = res
            return nil
        })
    }

    if err := g.Wait(); err != nil {
        return nil, err
    }
    return results, nil
}
```

## Worker Pool

```go
func workerPool(jobs <-chan Job, results chan<- Result, workers int) {
    var wg sync.WaitGroup

    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range jobs {
                results <- process(job)
            }
        }()
    }

    wg.Wait()
    close(results)
}
```

## Pipeline Pattern

```go
func generate(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums { out <- n }
        close(out)
    }()
    return out
}

func square(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in { out <- n * n }
        close(out)
    }()
    return out
}

// Usage: generate → square → consume
for val := range square(generate(1, 2, 3, 4)) {
    fmt.Println(val) // 1, 4, 9, 16
}
```

## Mutex

```go
type SafeCounter struct {
    mu    sync.Mutex
    count int
}

func (c *SafeCounter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.count++
}

// RWMutex: multiple readers OR one writer
type Cache struct {
    mu   sync.RWMutex
    data map[string]string
}

func (c *Cache) Get(key string) (string, bool) {
    c.mu.RLock()         // Multiple goroutines can read
    defer c.mu.RUnlock()
    val, ok := c.data[key]
    return val, ok
}
```

## Race Detection

```bash
# Always test with race detector during development
go test -race ./...
go run -race main.go
```

## Checklist
- [ ] Every goroutine has a clear lifetime (WaitGroup, context, or channel)
- [ ] Channels closed by sender, never by receiver
- [ ] context.Context passed as first parameter, cancel always deferred
- [ ] errgroup used for concurrent operations that can fail
- [ ] sync.Mutex/RWMutex protects shared state
- [ ] Race detector (`go test -race`) passes
- [ ] No goroutine leaks (all goroutines exit when work is done)
