# Continuous Learning

## Overview

Continuous learning is the system by which GitHub Copilot sessions generate reusable knowledge over time. Instead of treating every session as isolated, the continuous learning pipeline extracts patterns, stores them as instincts, builds confidence through repeated use, clusters related instincts, and eventually promotes them to formal skills.

## The Learning Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Extract   │ →  │   Store     │ →  │   Score     │ →  │   Cluster   │ →  │   Evolve    │
│             │    │             │    │             │    │             │    │             │
│  Patterns   │    │  Instincts  │    │ Confidence  │    │  Group by   │    │  Promote to │
│  from work  │    │  as JSON    │    │  tracking   │    │  similarity │    │  formal     │
│             │    │             │    │             │    │             │    │  skills     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Stage 1: Pattern Extraction

Patterns emerge naturally during coding sessions. The `/learn` command triggers extraction.

### What Gets Extracted

| Category | Example | Trigger |
|----------|---------|---------|
| **code-pattern** | "Always validate API input with Zod" | Repeated code structure |
| **workflow** | "Run tests before committing" | Process you follow |
| **debugging** | "CORS errors usually mean missing headers" | Problem-solution pairs |
| **architecture** | "Use repository pattern for data access" | Design decisions |
| **testing** | "Mock external APIs, never call them" | Test strategies |
| **tooling** | "Use vitest over jest for Vite projects" | Tool preferences |

### Extraction Process

1. **Identify repetition** — Same pattern applied 2+ times in a session
2. **Abstract the pattern** — Remove project-specific details, keep the rule
3. **Categorize** — Assign to one of the six categories
4. **Tag** — Add searchable keywords
5. **Store** — Save as an instinct with initial confidence

### Quality Criteria

A pattern worth extracting must be:
- **Repeatable** — Applies across multiple situations
- **Non-obvious** — Not something any developer would do by default
- **Specific enough** — Actionable, not vague advice
- **Project-relevant** — Matters for this codebase or team

```
❌ "Write good code"              → Too vague
❌ "Use semicolons in JavaScript" → Too obvious
✅ "Wrap all database calls in a transaction service that handles rollback on error"
✅ "Use discriminated unions for API response types instead of optional fields"
```

## Stage 2: Instinct Storage

Extracted patterns are stored as instincts in JSON format.

### Storage Location

```
.copilot/skills/continuous-learning/learned/instincts.json
```

### Instinct Schema

```json
{
  "id": "inst_a1b2c3",
  "name": "Zod validation for API inputs",
  "category": "code-pattern",
  "pattern": "All API endpoint handlers should validate request body/params using a Zod schema before processing. Define schemas adjacent to route handlers.",
  "confidence": 0.65,
  "created": "2024-01-15T10:30:00Z",
  "lastUsed": "2024-01-20T14:15:00Z",
  "useCount": 4,
  "tags": ["api", "validation", "zod", "typescript"]
}
```

### Managing Instincts

```bash
# Add a new instinct
node scripts/instinct-manager.js add \
  --name "Error boundary placement" \
  --category "code-pattern" \
  --pattern "Place error boundaries around async components and route boundaries, not around every component" \
  --tags react,error-handling,boundaries

# List all instincts
node scripts/instinct-manager.js list

# List by category
node scripts/instinct-manager.js list --category debugging

# Remove an instinct
node scripts/instinct-manager.js remove --id inst_a1b2c3

# Check status
node scripts/instinct-manager.js status
```

## Stage 3: Confidence Scoring

Confidence reflects how reliable an instinct is. It changes over time based on usage.

### Initial Confidence

| Source | Initial Confidence |
|--------|-------------------|
| Extracted from single session | 0.3 |
| Confirmed across 2 sessions | 0.5 |
| Team-shared pattern | 0.6 |
| Imported from another developer | 0.4 (original × 0.8) |
| Documented best practice | 0.7 |

### Confidence Growth

Each successful use increases confidence:

```
new_confidence = min(0.95, current + 0.05)
```

Example progression:
```
Use 1:  0.30 → 0.35
Use 2:  0.35 → 0.40
Use 3:  0.40 → 0.45
...
Use 13: 0.90 → 0.95 (cap)
```

### Confidence Decay

Unused instincts decay over time:

```
weekly_decay = 0.01
floor = 0.10

decayed = max(floor, current - (weeks_since_use × weekly_decay))
```

Example: An instinct at 0.70 unused for 10 weeks → 0.60

### Action Thresholds

| Confidence | Action |
|------------|--------|
| ≥ 0.80 | Auto-apply — suggest proactively |
| 0.50 – 0.79 | Suggest — offer when relevant |
| 0.30 – 0.49 | Available — use only if explicitly asked |
| 0.10 – 0.29 | Dormant — candidate for pruning |
| ≤ 0.10 | Prune — remove or archive |

## Stage 4: Instinct Clustering

Related instincts are grouped into clusters. Clusters that grow large enough become skill candidates.

### Similarity Detection

Instincts are compared using:
- **Tag overlap** — Jaccard similarity of tag sets
- **Category match** — Same category gets a boost
- **Pattern keyword overlap** — Shared meaningful words

### Clustering Rules

- Minimum cluster size: 2 instincts
- Maximum cluster size: 10 instincts (split if larger)
- Cluster name derived from most common tags
- Clusters are re-evaluated when instincts are added or removed

### Example Cluster

```
Cluster: "API Validation Patterns"
├── inst_001: Zod validation for API inputs (0.85)
├── inst_007: Schema-first API design (0.72)
├── inst_012: Validate pagination params (0.68)
└── inst_019: Sanitize string inputs before DB (0.55)

Average confidence: 0.70
Size: 4 instincts
Skill candidate: YES (≥3 instincts, avg confidence ≥0.70)
```

## Stage 5: Evolution to Skills

When a cluster meets readiness criteria, it can evolve into a formal skill.

### Readiness Criteria

- **3+ instincts** in the cluster
- **Average confidence ≥ 0.70** across the cluster
- **At least 1 instinct ≥ 0.80** confidence
- **Active usage** — cluster instincts used in the last 30 days

### Evolution Process

```bash
node scripts/instinct-manager.js evolve
```

This command:

1. **Scans** all instincts for cluster readiness
2. **Generates** a new skill directory:
   ```
   .copilot/skills/api-validation/
   ├── SKILL.md           # Auto-generated manifest
   └── validation-patterns.md  # Compiled from instincts
   ```
3. **Creates SKILL.md** with:
   - Name derived from cluster name
   - Trigger conditions from instinct tags
   - File list pointing to generated docs
4. **Compiles patterns** from instinct descriptions into structured documentation
5. **Archives** source instincts (removes from active, keeps in archive)

### Post-Evolution

- The new skill is auto-loaded when trigger conditions match
- Source instincts are archived, not deleted
- The skill should be reviewed and refined by a human
- Version tracking records which instincts generated the skill

## Commands Reference

| Command | Purpose |
|---------|---------|
| `/learn` | Extract patterns from current session |
| `/instinct-status` | Show instinct counts, confidence distribution |
| `/instinct-export` | Export instincts to JSON file |
| `/instinct-import` | Import instincts from JSON file |
| `/evolve` | Promote ready clusters to skills |
| `/skill-create` | Manually create a new skill |

## Workflow Example

### Week 1
```
Session 1: Build user registration → Extract: "Zod validation pattern"
Session 2: Build profile update → Extract: "Input sanitization pattern"
Session 3: Build search API → Extract: "Pagination validation pattern"
```

### Week 2
```
Instinct status:
- "Zod validation" → confidence 0.55 (used 5 times)
- "Input sanitization" → confidence 0.45 (used 3 times)
- "Pagination validation" → confidence 0.40 (used 2 times)

Cluster formed: "API Input Patterns" (3 instincts)
Not ready to evolve yet (avg confidence 0.47)
```

### Week 4
```
Instinct status:
- "Zod validation" → confidence 0.80
- "Input sanitization" → confidence 0.70
- "Pagination validation" → confidence 0.65
- "Request body size limits" → confidence 0.60

Cluster: "API Input Patterns" (4 instincts, avg 0.69)
Almost ready to evolve...
```

### Week 5
```
After more use:
- Cluster avg confidence: 0.74

→ node scripts/instinct-manager.js evolve

New skill created: .copilot/skills/api-input-validation/
Source instincts archived.
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Extracting everything | Noise drowns out signal | Apply quality criteria strictly |
| Never pruning | Stale instincts mislead | Run status checks monthly |
| Skipping review after evolution | Generated skills may be inaccurate | Always review evolved skills |
| Not sharing across team | Everyone re-learns the same things | Use export/import regularly |
| Setting initial confidence too high | Unproven patterns applied too eagerly | Start at 0.3, let usage prove value |

## Checklist

- [ ] Run `/learn` at end of productive sessions
- [ ] Review instinct status weekly
- [ ] Prune instincts below 0.10 confidence
- [ ] Check for evolution-ready clusters monthly
- [ ] Review and refine evolved skills
- [ ] Export and share instincts with team quarterly
- [ ] Archive rather than delete — maintain learning history
