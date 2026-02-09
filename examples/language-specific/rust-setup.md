# Rust Setup

## Tooling
- **Formatter:** `cargo fmt` (rustfmt)
- **Linter:** `cargo clippy` (lint with suggestions)
- **Test Runner:** `cargo test`
- **Security:** `cargo audit` (vulnerability scanning)
- **Build:** `cargo build --release` for optimized builds

## Skills to Enable
- `coding-standards/rust.md` — Ownership, error handling, traits, unsafe

## AGENTS.md Snippet

```markdown
## Rust Project Rules
- cargo fmt produces no changes
- cargo clippy passes with zero warnings (use #[allow] sparingly with comment)
- No unsafe blocks without a // SAFETY: comment explaining the invariant
- Use Result<T, E> for fallible operations — avoid panic!/unwrap in library code
- Prefer &str over &String and &[T] over &Vec<T> in function parameters
- Derive common traits: Debug, Clone, PartialEq where appropriate
- Dependencies pinned with exact versions in production crates
- Tests use assert_eq!/assert! with descriptive messages
```

## Workspace Configuration

For multi-crate projects:

```toml
# Cargo.toml (workspace root)
[workspace]
members = ["crates/*"]

[workspace.dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1", features = ["full"] }
```

## Common Gotchas
- **Borrow checker:** Start with `.clone()`, optimize later when patterns are clear
- **Lifetime annotations:** Start with owned types, add references as optimization
- **Async runtime:** Choose tokio or async-std early — they don't mix well
- **Compilation time:** Use `cargo check` for fast feedback, build only when needed
- **Feature flags:** Use them for optional dependencies, not conditional compilation of core logic
