# Memory & Persistence

## Overview

GitHub Copilot sessions are stateless by default — each new chat starts fresh. Memory persistence is the practice of storing decisions, patterns, and context so that knowledge survives across sessions and can be shared across teams.

## The Memory Problem

```
Session 1: "Use Zustand for state management"
Session 2: "What state management should I use?" ← Lost context
Session 3: "We decided on Zustand" ← Re-explaining
```

Without persistence, you re-teach Copilot the same decisions every session. This wastes tokens and risks inconsistency.

## Persistence Layers

### Layer 1: Instructions (Always Loaded)

Files in `.copilot/instructions/` are loaded into every session automatically.

```
.copilot/
  instructions/
    system-prompts.md       # Identity and behavior
    coding-instructions.md  # Code style and conventions
    testing-instructions.md # Test patterns
    security-instructions.md # Security requirements
```

**Use for:** Universal rules that never change — code style, naming conventions, security requirements, team agreements.

**Example — coding-instructions.md:**
```markdown
## State Management
- Use Zustand for client state
- Use TanStack Query for server state
- Never use Redux in this project

## Naming
- React components: PascalCase
- Utilities: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case.ts
```

### Layer 2: Skills (Loaded on Match)

Skill files in `.copilot/skills/` are loaded when trigger conditions match.

```
.copilot/
  skills/
    frontend-patterns/
      SKILL.md              # Manifest with triggers
      react-patterns.md     # Loaded when working on React
      state-management.md   # Loaded when managing state
```

**Use for:** Domain-specific knowledge that's relevant only in certain contexts.

### Layer 3: AGENTS.md (Agent Definitions)

`.copilot/AGENTS.md` defines specialized agents with specific instructions and model routing.

**Use for:** Task-specific personas — the TDD agent knows testing patterns, the Security agent knows vulnerability checks.

### Layer 4: Learned Instincts (Session-Derived)

Patterns extracted from sessions and stored as JSON:

```
.copilot/skills/continuous-learning/learned/instincts.json
```

**Use for:** Patterns discovered during work — recurring bug fixes, project-specific idioms, debugging shortcuts.

### Layer 5: Context Files

Project-specific context loaded for particular workflows:

```
contexts/
  dev.md      # Development context
  review.md   # Code review context
  research.md # Research/exploration context
```

**Use for:** Mode-switching — different information depending on whether you're coding, reviewing, or researching.

## Memory Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌───────────┐
│ Discover │ →  │  Store   │ →  │  Recall  │ →  │  Evolve   │
│          │    │          │    │          │    │           │
│ Pattern  │    │ Instinct │    │ Auto-load│    │ Promote   │
│ emerges  │    │ JSON     │    │ on match │    │ to skill  │
│ in work  │    │ file     │    │          │    │           │
└──────────┘    └──────────┘    └──────────┘    └───────────┘
```

### 1. Discover

During a session, patterns emerge:
- "Every time I create an API endpoint, I follow the same validation pattern"
- "This error always means the database connection pool is exhausted"
- "The team always wants error boundaries around async components"

### 2. Store

Capture the pattern as an instinct:

```bash
node scripts/instinct-manager.js add \
  --name "API validation pattern" \
  --category "code-pattern" \
  --pattern "All API endpoints validate input with Zod schema before processing" \
  --tags api,validation,zod
```

### 3. Recall

The instinct is stored in the learned instincts file. When the continuous-learning skill is active, these patterns inform suggestions.

### 4. Evolve

When enough related instincts accumulate (3+ with high confidence), they can evolve into a formal skill:

```bash
node scripts/instinct-manager.js evolve
```

This generates a new skill directory with SKILL.md and supporting docs.

## Persistence Strategies

### Strategy 1: Encode Decisions in Instructions

When the team makes a decision, encode it immediately:

```markdown
<!-- coding-instructions.md -->

## Database
- PostgreSQL for relational data
- Redis for caching (TTL: 1 hour default)
- No MongoDB — decided 2024-01-15, see ADR-007

## API Design
- RESTful for CRUD, GraphQL for complex queries
- Always paginate list endpoints (default: 20, max: 100)
- Use cursor-based pagination, not offset
```

### Strategy 2: Capture Debugging Knowledge

When you solve a tricky bug, store the pattern:

```json
{
  "name": "Prisma connection pool exhaustion",
  "category": "debugging",
  "pattern": "When Prisma throws P2024 (connection pool timeout), check: 1) Pool size in DATABASE_URL (?connection_limit=10), 2) Unreturned connections from long transactions, 3) Missing $disconnect in scripts",
  "confidence": 0.9,
  "tags": ["prisma", "database", "connection-pool", "debugging"]
}
```

### Strategy 3: Session Handoff Notes

At the end of a session, create a handoff summary:

```markdown
## Session Summary — 2024-01-15

### Completed
- Implemented user registration endpoint (src/api/users.ts)
- Added Zod validation for all user fields
- Tests passing: 45/45

### In Progress
- Email verification flow — template done, sending not wired up
- See src/services/email.ts line 42 — TODO marker

### Decisions Made
- Using Resend for email delivery (not SendGrid)
- Verification tokens expire after 24 hours
- Rate limit: 3 verification emails per hour per user

### Known Issues
- Flaky test in auth.test.ts line 89 — timing issue with token expiry
```

### Strategy 4: Architecture Decision Records

For significant decisions, create lightweight ADRs:

```markdown
## ADR-012: Use Zustand over Redux

**Status:** Accepted
**Date:** 2024-01-15

**Context:** Need client-side state management for the dashboard.

**Decision:** Use Zustand.

**Rationale:**
- Simpler API, less boilerplate
- TypeScript support without extra config
- Team already familiar from Project X
- Bundle size: 1.1KB vs 42KB

**Consequences:**
- No Redux DevTools (use Zustand devtools middleware instead)
- No middleware ecosystem (acceptable for our scale)
```

## Cross-Session Patterns

### Pattern: Start-of-Session Priming

When starting a new session, the instruction and skill files prime Copilot with accumulated knowledge. No manual re-explanation needed.

```
Session starts →
  .copilot/instructions/ loaded automatically →
  Agent definitions available →
  Skills loaded on trigger match →
  Copilot knows your project conventions
```

### Pattern: End-of-Session Capture

Before ending a session:

1. Run `/learn` to extract patterns from the session
2. Update instructions if any new conventions were established
3. Create handoff notes if work is in progress
4. Run `/checkpoint` to save quality state

### Pattern: Team Knowledge Sharing

Export and import instincts across team members:

```bash
# Developer A exports patterns
node scripts/instinct-manager.js export --output my-patterns.json

# Developer B imports them (at 80% confidence — 20% reduction)
node scripts/instinct-manager.js import --input my-patterns.json
```

## File Organization

```
project/
├── .copilot/
│   ├── AGENTS.md                    # Agent definitions (persistent)
│   ├── instructions/                 # Universal rules (persistent)
│   │   ├── system-prompts.md
│   │   ├── coding-instructions.md
│   │   ├── testing-instructions.md
│   │   └── security-instructions.md
│   └── skills/                       # Domain knowledge (persistent)
│       ├── coding-standards/
│       ├── frontend-patterns/
│       ├── backend-patterns/
│       ├── security-review/
│       └── continuous-learning/
│           └── learned/
│               └── instincts.json    # Learned patterns (evolving)
├── contexts/                         # Workflow contexts (persistent)
│   ├── dev.md
│   ├── review.md
│   └── research.md
└── docs/                             # Reference (persistent)
    └── decisions/                    # ADRs (persistent)
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Storing everything in instructions | Bloats context, wastes tokens | Use skills for conditional loading |
| No session handoffs | Knowledge lost between sessions | Write end-of-session summaries |
| Duplicating knowledge | Inconsistency when one copy updates | Single source of truth per topic |
| Ignoring instinct decay | Stale patterns persist | Run periodic `instinct-manager.js status` |
| Not encoding team decisions | Re-debating settled questions | Add decisions to instructions immediately |

## Checklist

- [ ] Core conventions captured in `.copilot/instructions/`
- [ ] Domain knowledge organized into skills
- [ ] Agent definitions reflect current workflow
- [ ] Learned instincts stored and periodically reviewed
- [ ] Session handoff notes written for in-progress work
- [ ] Architecture decisions recorded
- [ ] Team patterns shared via instinct export/import
- [ ] Stale instincts pruned regularly
