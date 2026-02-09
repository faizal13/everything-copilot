# Everything Copilot

**Production-grade GitHub Copilot agent toolkit.** 12 agents, 11 skills, 18 commands — universal, domain-agnostic, battle-tested patterns adapted from the Anthropic hackathon-winning [`everything-claude-code`](https://github.com/affaan-m/everything-claude-code).

Works with **Claude Opus, Sonnet, and Haiku** via GitHub Copilot.

---

## Quick Start

### Option 1: Install as Plugin (Recommended)

```bash
# Install to your project
npx everything-copilot init

# Choose a preset when prompted:
#   1. minimal     — Agents + instructions only
#   2. standard    — Core agents + key skills (recommended)
#   3. full        — Everything
#   4. frontend    — React, CSS, performance, TDD
#   5. backend     — APIs, DB, security, TDD
#   6. go          — Go patterns, testing, security
```

Or skip the prompt:

```bash
npx everything-copilot init --standard     # Recommended
npx everything-copilot init --full         # Everything
npx everything-copilot init --frontend     # Frontend preset
npx everything-copilot init --backend      # Backend preset
```

### Option 2: Manual Installation

```bash
git clone https://github.com/your-org/everything-copilot.git
cp -r everything-copilot/.copilot your-project/.copilot
```

### Verify

```bash
npx everything-copilot doctor     # Health check
npx everything-copilot validate   # Validate config
```

---

## Creating Skills

### Create a custom skill interactively

```bash
npx everything-copilot skill:create
# Prompts for: name, description, triggers, file patterns
```

### Create a skill with your own context file

```bash
# Write your patterns/rules in a file
echo "Always use Stripe Payment Intents..." > my-payment-rules.md

# Create skill from that context
npx everything-copilot skill:create payments --from-context my-payment-rules.md
```

### Add a built-in skill

```bash
# See all available skills
npx everything-copilot add:skill

# Install one
npx everything-copilot add:skill security-review
npx everything-copilot add:skill frontend-patterns
npx everything-copilot add:skill golang-patterns
```

---

## What's Inside

### Agents (12)

Specialized AI personas, each with the right model for the job:

| Agent | Model | Purpose |
|-------|-------|---------|
| **Planner** | Opus | Strategic implementation planning |
| **Architect** | Opus | System design and trade-off analysis |
| **TDD** | Sonnet | Test-driven development (RED→GREEN→REFACTOR) |
| **Code Reviewer** | Sonnet | Bugs, maintainability, performance review |
| **Security Reviewer** | Opus | OWASP Top 10, vulnerability detection |
| **Build Error Resolver** | Sonnet | Fix compile/build failures |
| **E2E Runner** | Sonnet | End-to-end test management |
| **Refactor/Cleaner** | Sonnet | Code improvement without behavior change |
| **Doc Updater** | Haiku | Keep docs in sync with code |
| **Go Reviewer** | Sonnet | Go-specific idioms and patterns |
| **Go Build Resolver** | Sonnet | Go build error resolution |
| **Performance Optimizer** | Sonnet | Profiling and optimization |

### Skills (11)

Auto-loading knowledge modules — the right context loads based on what you're working on:

| Skill | What It Teaches Copilot |
|-------|------------------------|
| `coding-standards` | Per-language style (JS, TS, Python, Go, Rust) |
| `frontend-patterns` | React, state management, responsive design, Web Vitals |
| `backend-patterns` | API design, database patterns, caching, event-driven |
| `golang-patterns` | Idiomatic Go, interfaces, testing, concurrency |
| `test-driven-development` | TDD workflow, Jest, pytest, coverage targets |
| `verification-loop` | Checkpoint evals, pass@k metrics, grading rubrics |
| `security-review` | OWASP, dependency scanning, secret detection |
| `continuous-learning` | Pattern extraction, instinct storage |
| `continuous-learning-v2` | Confidence scoring, clustering, evolution to skills |
| `iterative-retrieval` | Context refinement, progressive narrowing |
| `strategic-compact` | Token optimization, context preservation |

### Commands (18)

| Command | Purpose | Agent |
|---------|---------|-------|
| `/plan` | Create implementation plan | Planner (Opus) |
| `/tdd` | RED→GREEN→REFACTOR cycle | TDD (Sonnet) |
| `/code-review` | Review code for issues | Code Reviewer (Sonnet) |
| `/build-fix` | Fix build/compile errors | Build Resolver (Sonnet) |
| `/e2e` | Run end-to-end tests | E2E Runner (Sonnet) |
| `/refactor-clean` | Improve code structure | Refactor (Sonnet) |
| `/checkpoint` | Save quality baseline | Verification |
| `/verify` | Run verification loop | Verification |
| `/learn` | Extract patterns from session | Learning |
| `/evolve` | Promote instincts to skills | Learning |
| `/skill-create` | Create new skill | — |
| `/go-review` | Go-specific review | Go Reviewer |
| `/go-test` | Go test execution | Go Reviewer |
| `/go-build` | Fix Go build errors | Go Build Resolver |
| `/instinct-status` | Show learned patterns | Learning |
| `/instinct-export` | Export patterns | Learning |
| `/instinct-import` | Import patterns | Learning |
| `/setup-pm` | Configure package manager | — |

---

## CLI Reference

```bash
# Setup
npx everything-copilot init               # Interactive preset selection
npx everything-copilot init --standard    # Standard preset (recommended)
npx everything-copilot init --full        # Install everything
npx everything-copilot init --minimal     # Just agents + instructions

# Skills
npx everything-copilot skill:create                              # Interactive
npx everything-copilot skill:create payments                     # Named
npx everything-copilot skill:create payments --from-context f.md # From file
npx everything-copilot add:skill                                 # List built-in
npx everything-copilot add:skill security-review                 # Install one

# Agents
npx everything-copilot add:agent              # List all agents + models
npx everything-copilot add:agent tdd          # Show agent details

# Management
npx everything-copilot validate               # Validate config
npx everything-copilot list                   # Show installed components
npx everything-copilot doctor                 # Environment health check

# Learning
npx everything-copilot instinct status        # Instinct overview
npx everything-copilot instinct list          # List all instincts
npx everything-copilot instinct evolve        # Promote to skills
```

---

## Model Strategy

```
Opus   (5%)  — Architecture, security, complex reasoning     ($15/M tokens)
Sonnet (35%) — Implementation, TDD, review, bug fixes        ($3/M tokens)
Haiku  (60%) — Docs, formatting, quick fixes, boilerplate    ($0.25/M tokens)
```

Blended cost: **~$1.20/M tokens** vs $15/M if using Opus for everything.

---

## How It Works

```
You open a file in VS Code
        │
        ▼
┌──────────────────────────┐
│  .copilot/AGENTS.md      │  ← Always loaded: 12 specialized agents
│  .copilot/instructions/  │  ← Always loaded: coding, testing, security rules
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  .copilot/skills/        │  ← Auto-loaded when file/task matches triggers
│  (e.g., frontend-patterns│
│   loads for *.tsx files)  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Copilot responds with   │  ← Knows your conventions, patterns, and rules
│  full project context     │
└──────────────────────────┘
```

---

## Repository Structure

```
everything-copilot/
├── bin/                       # CLI entry point (npx everything-copilot)
├── .copilot/                  # PRIMARY — gets copied to your project
│   ├── AGENTS.md              # 12 agent definitions
│   ├── instructions/          # Always-loaded rules (4 files)
│   └── skills/                # Auto-loaded skill modules (11 skills, 52 files)
├── agents/                    # Extended agent documentation (12 files)
├── commands/                  # Command workflow docs (19 files)
├── contexts/                  # Dynamic system prompts (3 files)
├── scripts/                   # Node.js utilities (10 files)
├── mcp-configs/               # MCP server registry & templates (8 files)
├── examples/                  # Team configs, language setups (16 files)
├── docs/                      # Comprehensive guides (15 files)
├── tests/                     # Full test suite (7 files)
└── .github/                   # GitHub Actions & templates (7 files)
```

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Quick Start](docs/QUICK_START.md) | Get running in 5 minutes |
| [The Shortform Guide](docs/THE-SHORTFORM-GUIDE.md) | Complete system in one doc |
| [The Longform Guide](docs/THE-LONGFORM-GUIDE.md) | Deep dive into every concept |
| [Architecture](docs/ARCHITECTURE.md) | System design and philosophy |
| [Agents Guide](docs/AGENTS_GUIDE.md) | Agent configuration |
| [Skills Guide](docs/SKILLS_GUIDE.md) | Creating and managing skills |
| [Commands Reference](docs/COMMANDS_REFERENCE.md) | All 18 commands |
| [Verification Loops](docs/VERIFICATION_LOOPS.md) | Quality evaluation system |
| [Token Optimization](docs/TOKEN_OPTIMIZATION.md) | Model selection and budgets |
| [Continuous Learning](docs/CONTINUOUS_LEARNING.md) | Pattern extraction lifecycle |
| [Memory & Persistence](docs/MEMORY_PERSISTENCE.md) | Cross-session knowledge |
| [MCP Integration](docs/MCP_INTEGRATION.md) | External tool connections |
| [Copilot CLI](docs/COPILOT_CLI.md) | Terminal workflow guide |
| [Copilot vs Claude Code](docs/COPILOT_VS_CLAUDE_CODE.md) | Feature comparison |
| [Migration Guide](docs/MIGRATION_GUIDE.md) | Claude Code → Copilot migration |

---

## Examples

### Team Presets

```bash
npx everything-copilot init --frontend    # React, CSS, performance
npx everything-copilot init --backend     # APIs, DB, security
npx everything-copilot init --go          # Go patterns, testing
npx everything-copilot init --full        # Everything
```

See [`examples/team-configs/`](examples/team-configs/) for detailed team setups and [`examples/language-specific/`](examples/language-specific/) for per-language configurations.

### Custom Skill from Your Context

```bash
# 1. Write your rules in a markdown file
cat > my-api-rules.md << 'EOF'
## Our API Standards
- All endpoints return { data, error, meta }
- Use Zod for validation
- Rate limit: 100 req/min for public, 1000 for authenticated
- Cursor pagination, never offset
- Always return proper HTTP status codes
EOF

# 2. Create the skill
npx everything-copilot skill:create api-standards --from-context my-api-rules.md

# 3. Done! Open any API file in VS Code — Copilot knows your rules.
```

---

## Philosophy

- **Universal** — No assumptions about your stack, language, or domain
- **Plugin-like** — `npx` one-liner to install, preset-based setup
- **Extensible** — Create custom skills in seconds with `skill:create`
- **Right-sized** — Match model power to task complexity (Opus/Sonnet/Haiku)
- **Battle-tested** — Based on Anthropic hackathon-winning patterns
- **Production-ready** — Full test suite, validation, CI/CD

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — See [LICENSE](LICENSE) for details.

---

*Adapted from [everything-claude-code](https://github.com/affaan-m/everything-claude-code) for the GitHub Copilot ecosystem.*
