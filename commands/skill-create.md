# /skill-create

## Overview

The Skill Create command generates a formal skill from patterns found in the git history. It analyzes recent commits to extract recurring development patterns, then produces a `SKILL.md` file with supporting documentation that codifies the pattern for reuse across sessions and team members.

**Model:** Sonnet 4.5

## Usage

```
/skill-create <pattern name>
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `pattern name` | Yes | A short identifier for the skill to create (e.g., `api-endpoint`, `react-form`) |

## Prerequisites

- A git repository with at least 10 commits of relevant history.
- The repository should contain examples of the pattern being codified.
- Write access to `.copilot/skills/` directory.

## Workflow Steps

1. **Analyze Recent Commits** -- Scan the last 50-100 commits for structural patterns: repeated file creation sequences, consistent code structures, recurring refactoring motions, and common dependency additions.
2. **Extract Patterns** -- Identify the generalizable pattern behind the commits. Capture: the trigger condition (when to apply), the sequence of actions, file templates involved, naming conventions, and testing expectations.
3. **Generate SKILL.md** -- Create a structured skill document with: name, description, trigger conditions, step-by-step instructions, code templates, and verification criteria.
4. **Create Supporting Docs** -- Generate any supplementary files the skill needs: template files, example code, checklists, or configuration fragments. Place them alongside the SKILL.md in the skill directory.

## Example

```
/skill-create api-endpoint
```

**Interaction:**

```
Analyzing git history for API endpoint patterns...
Scanned 67 commits, found 12 endpoint additions.

Extracted pattern:
  Trigger: Adding a new REST API endpoint
  Frequency: ~2 per week
  Consistency: 85% follow the same structure

Generated skill:
  .copilot/skills/api-endpoint/
    SKILL.md
    templates/handler.ts.tmpl
    templates/handler.test.ts.tmpl
    templates/route.ts.tmpl

## Skill: api-endpoint

### Trigger
When adding a new REST API endpoint to the Express application.

### Steps
1. Create handler in `src/handlers/<resource>.handler.ts`
2. Define request/response types in `src/types/<resource>.ts`
3. Add route in `src/routes/<resource>.routes.ts`
4. Write integration test in `src/handlers/__tests__/<resource>.test.ts`
5. Update OpenAPI spec in `docs/openapi.yaml`

### Templates
- Handler: follows singleton pattern with dependency injection
- Tests: uses supertest with database fixtures
- Routes: RESTful with auth middleware on write operations

### Verification
- Handler test exists and passes
- Route is registered in the router
- OpenAPI spec reflects the new endpoint
```

## Output Format

The command creates a skill directory containing:

- `SKILL.md` -- The primary skill document with trigger, steps, templates, and verification criteria.
- `templates/` -- Any code template files referenced by the skill.
- A summary output listing all generated files and the pattern metrics.

```
Skill created: api-endpoint
  Files: 4
  Pattern source: 12 commits over 6 weeks
  Confidence: 85%
  Location: .copilot/skills/api-endpoint/
```

## Notes

- Skills are more structured and formal than instincts. Use `/learn` for quick pattern capture and `/skill-create` for well-established patterns.
- The command requires sufficient git history to identify a meaningful pattern. Sparse history produces lower-confidence skills.
- Generated templates use placeholder syntax (`<resource>`, `<name>`) that other commands can fill in.
- Existing skills can be updated by re-running `/skill-create` with the same name -- it will merge new findings.
- Skills created here are automatically loaded by other commands (e.g., `/code-review` checks against skill conventions).
