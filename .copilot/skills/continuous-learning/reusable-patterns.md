# Converting Instincts to Reusable Patterns

## When to Formalize

An instinct is ready for promotion to a formal pattern when:
- Confidence ≥ 0.8
- Used 5+ times successfully
- Applies across multiple files or contexts (not just one spot)
- No conflicting patterns exist

## Pattern Template

```markdown
# Pattern: [Name]

## Problem
[One sentence describing the problem this pattern solves]

## Context
[When does this pattern apply? What conditions trigger it?]

## Solution
[Step-by-step solution or code template]

## Example
[Concrete code example]

## Constraints
[Limitations, edge cases, when NOT to use this]

## Anti-Patterns
[Common mistakes this pattern avoids]

## Related Patterns
[Links to similar or complementary patterns]
```

## Promotion Workflow

1. **Identify candidate** — Instinct with high confidence and frequent use
2. **Expand documentation** — Add context, constraints, anti-patterns
3. **Test generalizability** — Apply to a new situation, verify it works
4. **Review with team** — Share for feedback (is this universal or personal preference?)
5. **Create formal pattern** — Move from instinct store to a skill file
6. **Retire the instinct** — Archive the original instinct, link to the pattern

## Testing Patterns

Before formalizing, verify the pattern works in contexts beyond the original:

- Apply it to a different file in the same project
- Apply it to a different project entirely
- Ask: would a new team member understand and benefit from this?
- Check: does it conflict with any existing coding standard or convention?

## Sharing Patterns Across Team

```bash
# Export high-confidence instincts
node scripts/instinct-manager.js export --min-confidence=0.8 --file=team-patterns.json

# Team member imports
node scripts/instinct-manager.js import team-patterns.json --merge
```

**Merge strategies:**
- If same name exists: keep higher confidence version
- If different name but similar pattern: flag for manual review
- New patterns: import with confidence reduced by 20% (not yet validated by recipient)

## Pattern Retirement

Retire a pattern when:
- The technology it applies to is no longer used
- A better pattern supersedes it
- The codebase has evolved past it
- It caused more confusion than it solved

Move to `archive/` — don't delete. Historical patterns can inform future decisions.

## Evolution Path

```
Observation → Instinct (0.5) → Validated Instinct (0.8+) → Formal Pattern → Skill File
```

This progression ensures only battle-tested knowledge gets promoted to the permanent skill library.
