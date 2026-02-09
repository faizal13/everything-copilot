# Coding Instructions

These instructions apply to all code written or modified by the agent, regardless of language or context mode.

## Code Style

### Formatting
- Use the project's formatter. Do not manually format code.
- If no formatter is configured, follow the dominant style in the file you are editing.
- Never mix tabs and spaces in the same file.
- Keep lines under 100 characters where practical.

### Naming
- Use descriptive names that reveal intent: `fetchUserById`, not `getData`.
- No single-letter variables except `i`, `j`, `k` in loops and `e` or `err` for errors.
- Boolean variables and functions: prefix with `is`, `has`, `can`, `should`.
- Constants: use UPPER_SNAKE_CASE.
- Follow the language's conventions for everything else (camelCase, snake_case, PascalCase).

### Functions
- Each function does one thing. If you need "and" to describe it, split it.
- Keep functions under 30 lines. Extract helpers for complex logic.
- Limit parameters to 3. Use an options object or struct for more.
- Pure functions are preferred. Minimize side effects.
- Document non-obvious parameters and return values.

## Error Handling
- Handle errors explicitly. Never use empty catch blocks.
- Fail fast: validate inputs at function boundaries.
- Use typed errors or error codes, not string matching.
- Log errors with context (what operation, what input, what went wrong).
- Propagate errors to callers who can handle them. Do not swallow and continue.

## Code Organization
- Group related code together. Separate concerns into distinct modules.
- Follow the existing module structure in the project.
- Import order: external dependencies, then internal modules, then relative imports.
- No circular dependencies between modules.
- Keep files under 300 lines. If a file grows beyond that, split by responsibility.

## Design Principles
- Prefer composition over inheritance.
- Prefer explicit over implicit behavior.
- Avoid premature optimization. Write clear code first, optimize with evidence.
- Avoid premature abstraction. Wait until you see three concrete cases before generalizing.
- Write code that is easy to delete. Loose coupling makes removal safe.

## Types and Safety
- Add type annotations where the language supports them.
- Avoid `any`, `object`, or equivalent escape hatches unless necessary and documented.
- Use enums or union types for fixed sets of values.
- Prefer immutable data structures when mutation is not needed.
- Null safety: handle nullable values explicitly (optional chaining, guard clauses, Option types).

## Dependencies
- Do not add a dependency for something you can write in under 20 lines.
- Check the dependency's maintenance status, license, and security record before adding.
- Pin dependency versions. Do not use floating ranges in production.
- Document why a dependency was chosen if it is not the obvious default.

## Comments
- Comments explain **why**, never **what**. The code explains what.
- Delete commented-out code. Use version control to recover old code.
- Use TODO comments sparingly and always with a linked issue or ticket number.
- Keep comments up to date. Wrong comments are worse than no comments.
