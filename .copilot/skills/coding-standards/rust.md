# Rust Coding Standards

## Naming Conventions
- **snake_case** for functions, variables, modules, crate names: `get_user`, `total_count`
- **PascalCase** for types, traits, enums, structs: `UserService`, `HttpClient`
- **SCREAMING_SNAKE_CASE** for constants and statics: `MAX_CONNECTIONS`
- **Lifetime parameters**: short lowercase letters: `'a`, `'b`, `'ctx`

## Ownership and Borrowing

### Borrow Instead of Cloning
```rust
// GOOD: borrow with &str when you only need to read
fn greet(name: &str) -> String {
    format!("Hello, {name}!")
}

// BAD: unnecessary ownership transfer
fn greet(name: String) -> String {
    format!("Hello, {name}!")
}

// Take ownership only when the function needs to store or move the value
fn register_user(name: String) -> User {
    User { name, created_at: Utc::now() }
}
```

### Use `Cow` for Flexible Ownership
```rust
use std::borrow::Cow;

fn normalize_path(path: &str) -> Cow<'_, str> {
    if path.contains("//") {
        Cow::Owned(path.replace("//", "/"))
    } else {
        Cow::Borrowed(path)
    }
}
```

## Lifetimes

### Explicit Lifetimes When Needed
```rust
// The compiler cannot infer the lifetime here
struct Parser<'a> {
    input: &'a str,
    position: usize,
}

impl<'a> Parser<'a> {
    fn new(input: &'a str) -> Self {
        Parser { input, position: 0 }
    }

    fn peek(&self) -> Option<char> {
        self.input[self.position..].chars().next()
    }
}
```

### Lifetime Elision
```rust
// These are equivalent - let the compiler elide when possible
fn first_word(s: &str) -> &str { ... }         // elided (preferred)
fn first_word<'a>(s: &'a str) -> &'a str { ... } // explicit (unnecessary)
```

## Error Handling with Result

### Define Domain Errors with thiserror
```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("user {0} not found")]
    NotFound(String),

    #[error("validation failed: {field} - {message}")]
    Validation { field: String, message: String },

    #[error("database error")]
    Database(#[from] sqlx::Error),

    #[error("external service error")]
    ExternalService(#[from] reqwest::Error),
}
```

### Use the `?` Operator
```rust
// GOOD: propagate errors with ?
fn load_config(path: &Path) -> Result<Config, AppError> {
    let contents = fs::read_to_string(path)
        .map_err(|e| AppError::Io { path: path.to_owned(), source: e })?;
    let config: Config = toml::from_str(&contents)?;
    Ok(config)
}

// BAD: manual match chains
fn load_config(path: &Path) -> Result<Config, AppError> {
    let contents = match fs::read_to_string(path) {
        Ok(c) => c,
        Err(e) => return Err(AppError::Io { path: path.to_owned(), source: e }),
    };
    // ...
}
```

### anyhow for Application Code, thiserror for Libraries
```rust
// Application binary: use anyhow for convenience
use anyhow::{Context, Result};

fn main() -> Result<()> {
    let config = load_config("config.toml")
        .context("failed to load configuration")?;
    run_server(config).context("server crashed")?;
    Ok(())
}

// Library crate: use thiserror for typed errors
// Consumers need to match on specific error variants
```

## Trait Patterns

### Define Small, Composable Traits
```rust
pub trait Repository {
    type Item;
    type Error;

    fn find_by_id(&self, id: &str) -> Result<Option<Self::Item>, Self::Error>;
    fn save(&self, item: &Self::Item) -> Result<(), Self::Error>;
}

// Blanket implementations for common patterns
impl<T: Repository> RepositoryExt for T {
    fn find_or_create(&self, id: &str, default: Self::Item) -> Result<Self::Item, Self::Error> {
        match self.find_by_id(id)? {
            Some(item) => Ok(item),
            None => { self.save(&default)?; Ok(default) }
        }
    }
}
```

### Trait Objects vs Generics
```rust
// Use generics for performance (monomorphized, zero-cost)
fn process<R: Repository<Item = User>>(repo: &R) -> Result<(), R::Error> {
    // ...
}

// Use trait objects for heterogeneous collections or plugin systems
fn process(repo: &dyn Repository<Item = User, Error = AppError>) -> Result<(), AppError> {
    // ...
}
```

## Common Patterns

### Builder Pattern
```rust
pub struct ServerBuilder {
    port: u16,
    host: String,
    max_connections: usize,
}

impl ServerBuilder {
    pub fn new() -> Self {
        Self { port: 8080, host: "127.0.0.1".into(), max_connections: 100 }
    }

    pub fn port(mut self, port: u16) -> Self { self.port = port; self }
    pub fn host(mut self, host: impl Into<String>) -> Self { self.host = host.into(); self }
    pub fn build(self) -> Result<Server, ConfigError> {
        // validate and construct
        Ok(Server { port: self.port, host: self.host, max_connections: self.max_connections })
    }
}
```

### Iterators over Manual Loops
```rust
// GOOD: iterator chains are zero-cost and idiomatic
let active_user_names: Vec<&str> = users
    .iter()
    .filter(|u| u.is_active)
    .map(|u| u.name.as_str())
    .collect();

// Collect into Result to short-circuit on first error
let results: Result<Vec<Output>, Error> = inputs
    .iter()
    .map(|input| process(input))
    .collect();
```

## Clippy Lints
```toml
# Cargo.toml or clippy.toml
[lints.clippy]
pedantic = "warn"
nursery = "warn"
unwrap_used = "deny"
expect_used = "warn"
panic = "deny"
```

## Checklist
- [ ] No `.unwrap()` in production code; use `?`, `.expect("reason")`, or handle the error
- [ ] All public items have `///` doc comments
- [ ] `clippy` passes with `--all-targets -- -D warnings`
- [ ] Errors use `thiserror` (libraries) or `anyhow` (applications)
- [ ] `#[must_use]` on functions whose return values should not be ignored
- [ ] No `unsafe` blocks without a `// SAFETY:` comment explaining the invariant
- [ ] Prefer `&str` over `&String` and `&[T]` over `&Vec<T>` in function parameters
- [ ] `cargo fmt` produces no changes
- [ ] Tests use `#[test]` and `assert_eq!`/`assert!` with descriptive messages
- [ ] Dependencies are pinned with exact versions in production crates
