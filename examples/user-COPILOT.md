# Example User-Level Copilot Configuration

This file shows personal preferences for a developer's Copilot setup. Place
this in your user-level Copilot configuration (e.g., `~/.copilot/config.md`
or equivalent) to apply these defaults across all projects.

---

## Personal Preferences

```markdown
# User: Jane Developer

## Model Preferences
- **Default model:** Sonnet 4.5 for everyday coding tasks
- **Planning and architecture:** Opus 4.5 for complex design work
- **Quick edits and formatting:** Haiku 3.5 for simple, fast changes

## Coding Style
- Prefer functional programming patterns over imperative loops
- Use early returns to reduce nesting depth
- Always destructure function parameters when there are 3+ properties
- Prefer `const` over `let`; never use `var`
- Write self-documenting code; add comments only for "why", not "what"
- Maximum line length: 100 characters

## Review Preferences
- **Strictness:** High -- flag all warnings, not just critical issues
- **Focus areas:** Error handling, type safety, test coverage
- **Ignore:** Minor formatting issues (handled by Prettier/Black)
- **Tone:** Direct and concise; skip pleasantries in review comments

## Language Preferences (ordered by familiarity)
1. TypeScript -- primary language, strict mode always
2. Python -- type hints required, Black formatting
3. Go -- follow Effective Go, no globals
4. Rust -- prefer Result over panic, minimize unsafe

## Editor Settings
- Indentation: 2 spaces for JS/TS/JSON, 4 spaces for Python, tabs for Go
- Trailing newline: always
- Trailing whitespace: remove
- Quote style: single quotes for JS/TS, double quotes for Python
- Semicolons: no (in JS/TS)

## Personal Shortcuts
- When I say "ship it", run tests, lint, and commit with a conventional message
- When I say "quick fix", make the smallest change possible and skip refactoring
- When I say "full review", run /code-review with high strictness on all changed files
- When I say "plan this out", use the Planner agent with Opus 4.5

## Test Preferences
- Always write tests for new functions and methods
- Prefer integration tests over unit tests for API endpoints
- Use factories and builders for test data, never raw object literals
- Name tests descriptively: "should_reject_expired_token" not "test_token_3"

## Git Preferences
- Commit messages: conventional commits format
- Rebase over merge for feature branches
- Squash commits before opening a PR
- Never commit directly to main

## Documentation Preferences
- JSDoc for public TypeScript functions
- Docstrings for all public Python functions
- README updates when adding new commands or changing setup steps
- Architecture Decision Records for non-trivial technical choices

## Things I Dislike
- Over-abstraction and premature generalization
- Magic strings and magic numbers without named constants
- Deeply nested callbacks (prefer async/await or pipelines)
- Comments that restate the code
- Unused imports and dead code left in the file
```

## How to Use This Configuration

1. Create a user-level config file in your Copilot configuration directory.
2. Copy and modify the preferences above to match your personal style.
3. These settings apply as defaults across all projects unless a project-level
   config overrides them.
4. Review and update periodically as your preferences evolve.

## Tips

- **Model selection matters.** Use faster models for routine tasks and reserve
  expensive models for complex reasoning. This saves cost and time.
- **Shortcuts save keystrokes.** Define personal shortcuts for your most common
  multi-step workflows.
- **Be honest about preferences.** The more accurately you describe your style,
  the less you need to correct the agent's output.
- **Project configs override user configs.** When working on a team project,
  the project-level AGENTS.md takes precedence over your personal preferences.
