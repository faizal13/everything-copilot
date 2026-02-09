---
applyTo: "**/*.rs,**/Cargo.toml"
---

# Rust Instructions

- Use `rustfmt` formatting — no exceptions
- Prefer `Result<T, E>` over panicking, `?` operator for propagation
- Use `thiserror` for library errors, `anyhow` for application errors
- Naming: `snake_case` for functions/variables, `PascalCase` for types, `SCREAMING_SNAKE` for constants
- Use `clippy` lints: `#![warn(clippy::all, clippy::pedantic)]`
- Prefer `&str` over `String` in function parameters
- Use `impl Trait` for return types when possible
- Minimize `unsafe` — document invariants when necessary
- Use `#[derive(Debug, Clone, PartialEq)]` for data types
- Write doc comments with `///` including examples
- Prefer iterators over manual loops
