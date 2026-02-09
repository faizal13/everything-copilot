# Instinct Storage

## Instinct Schema

```json
{
  "id": "inst-a3f2c4d8",
  "name": "api-error-response-format",
  "category": "code-pattern",
  "pattern": "All API error responses should follow { error: string, code: string, details?: object } format",
  "context": "When creating or modifying API error responses",
  "example": "res.status(400).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors })",
  "confidence": 0.75,
  "created": "2024-01-15T10:30:00Z",
  "lastUsed": "2024-01-20T14:15:00Z",
  "useCount": 5,
  "tags": ["api", "error-handling", "response-format"]
}
```

## Storage Location

```
.copilot/skills/continuous-learning/learned/
├── instincts.json          # All instincts in a single file
└── archive/                # Retired/low-confidence instincts
    └── instincts-archive.json
```

## Confidence Scoring

| Score | Meaning | Action |
|-------|---------|--------|
| 0.0 - 0.3 | Low confidence, unvalidated | Suggest only when directly relevant |
| 0.3 - 0.5 | Initial extraction, needs validation | Suggest with caveat |
| 0.5 - 0.7 | Validated by repeated use | Suggest proactively |
| 0.7 - 0.9 | Well-established, frequently used | Auto-apply when context matches |
| 0.9 - 0.95 | Highly reliable (cap) | Consider formalizing into a skill |

**Confidence updates:**
- New instinct: starts at 0.5
- Each successful use: +0.05 (capped at 0.95)
- Unused for 30 days: -0.01 per week
- Contradicted by a newer pattern: -0.15
- Manually validated by user: set to 0.8

## Category Taxonomy

```
code-pattern       → Reusable code structures and approaches
workflow           → Step-by-step processes for common tasks
debugging          → Diagnosis and fix strategies for errors
architecture       → Design decisions and system structure
testing            → Test patterns, fixtures, mocking strategies
tooling            → CLI commands, configs, build patterns
convention         → Project-specific naming and style rules
performance        → Optimization techniques and benchmarks
```

## Operations

### Search
```bash
# By category
node scripts/instinct-manager.js list --category=debugging

# By keyword
node scripts/instinct-manager.js list --search="api error"

# By confidence threshold
node scripts/instinct-manager.js list --min-confidence=0.7
```

### Pruning
Remove instincts that are no longer useful:
- Confidence dropped below 0.2
- Not used in 90+ days AND confidence < 0.5
- Contradicted by a formal skill or documentation

### Backup
```bash
# Export for sharing or backup
node scripts/instinct-manager.js export --file=team-instincts.json

# Import from teammate
node scripts/instinct-manager.js import team-instincts.json
```
