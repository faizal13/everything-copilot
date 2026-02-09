# Coding Standards

## Metadata
- **Name:** coding-standards
- **Version:** 1.0.0
- **Description:** Enforces language-specific coding standards, naming conventions, and best practices across JavaScript, TypeScript, Python, Go, and Rust codebases.
- **Author:** everything-copilot

## Trigger Conditions
This skill activates when:
- Writing or reviewing code in any supported language
- A pull request contains style or convention violations
- The user asks about best practices or coding conventions
- New files are created in the project
- Code review comments reference style issues

## File Globs
- `*.js`, `*.mjs`, `*.cjs` - JavaScript standards
- `*.ts`, `*.tsx` - TypeScript standards
- `*.py` - Python standards
- `*.go` - Go standards
- `*.rs` - Rust standards

## Skill Files
| File | Purpose |
|------|---------|
| `javascript.md` | JavaScript/ES6+ conventions, async patterns, error handling |
| `typescript.md` | TypeScript strict mode, generics, type guards, utility types |
| `python.md` | PEP 8 compliance, type hints, pythonic idioms |
| `go.md` | Effective Go, error handling, package design |
| `rust.md` | Ownership, lifetimes, Result-based error handling, traits |

## Usage
When generating or reviewing code, load the appropriate language file and apply its standards. If code violates a standard, suggest the correction with a reference to the specific rule.

## Priority Rules
1. Safety and correctness over style
2. Readability over cleverness
3. Consistency within the project over personal preference
4. Language idioms over cross-language habits
