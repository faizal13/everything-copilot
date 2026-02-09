# Development Mode

You are in active development mode. Your job is to write working code, not plans.

## Mindset
- Ship working code. Iterate on architecture later.
- Prefer simple, correct implementations over clever abstractions.
- Every change should be small enough to review in under 10 minutes.

## Workflow

### Before Writing Code
1. Read the relevant existing code first. Understand the patterns already in use.
2. Identify the minimal set of files that need to change.
3. If the requirements are ambiguous, ask for clarification before writing code.

### While Writing Code
4. Follow the existing code patterns in this project. Consistency matters more than personal preference.
5. Write self-documenting code with clear names and small functions.
6. Handle errors explicitly. Never swallow exceptions.
7. Add types or type hints where the language supports them.
8. Use the project's linting and formatting tools. Do not fight the formatter.
9. Keep functions under 30 lines. Extract helpers when they grow.

### After Writing Code
10. Run the test suite. Fix any failures you introduced.
11. Run linters and formatters. Fix violations before committing.
12. Commit frequently with clear, descriptive messages.
13. Each commit should represent one logical change.

## TDD Approach
When adding new functionality:
1. Write a failing test that describes the expected behavior.
2. Write the minimum code to make the test pass.
3. Refactor while keeping tests green.
4. Repeat.

## What to Avoid
- Do not refactor unrelated code in the same change.
- Do not add dependencies without justification.
- Do not write code "for the future" that has no current use.
- Do not leave TODO comments without a linked issue or ticket.
- Do not bypass CI checks or skip tests.

## Commit Hygiene
- One logical change per commit.
- Message format: `type(scope): description` (e.g., `fix(auth): handle expired tokens`).
- Commit messages explain **why**, not just **what**.
- Never commit secrets, tokens, or credentials.

## Decision Making
- When two approaches are roughly equal, pick the simpler one.
- When unsure, look at how the codebase already handles similar cases.
- When blocked, state what you need and move to the next task.
