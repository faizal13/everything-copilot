# The Shortform Guide to Everything Copilot

> The complete system in one document. Read this to understand everything. Read the longform guide to master it.

## What This Is

A toolkit that makes GitHub Copilot behave like a team of specialized AI engineers — each with the right expertise, the right model, and the right context for the task at hand.

## Core Concepts

### 1. Agents

Agents are specialized personas defined in `.copilot/AGENTS.md`. Each agent has a role, instructions, and a model assignment.

```markdown
## TDD Agent

You are a test-driven development specialist.

### Instructions
- Always write tests FIRST (RED)
- Implement minimum code to pass (GREEN)
- Refactor only when green (REFACTOR)
- Never skip the red phase

### Model
sonnet
```

**12 agents included:** Planner, Architect, TDD, Code Reviewer, Security Reviewer, Build Error Resolver, E2E Runner, Refactor/Cleaner, Documentation Updater, Go Reviewer, Go Build Resolver, Performance Optimizer.

### 2. Model Routing

Different tasks need different models:

| Model | Use For | Cost |
|-------|---------|------|
| **Opus** | Architecture, security, complex reasoning | High |
| **Sonnet** | Implementation, TDD, code review | Medium |
| **Haiku** | Documentation, formatting, quick fixes | Low |

Rule of thumb: Haiku 60%, Sonnet 35%, Opus 5%.

### 3. Skills

Skills are knowledge modules in `.copilot/skills/` that auto-load when relevant.

```
.copilot/skills/
├── frontend-patterns/     # Loads when editing React/CSS
├── backend-patterns/      # Loads when editing APIs
├── security-review/       # Loads when editing auth code
├── test-driven-development/
├── verification-loop/
├── continuous-learning/
├── golang-patterns/
└── ...
```

Each skill has a `SKILL.md` manifest defining trigger conditions and file list:

```yaml
---
Name: Frontend Patterns
Trigger Conditions:
  - Working with React components
  - CSS or styling tasks
Files:
  - react-patterns.md
  - state-management.md
  - responsive-design.md
  - performance.md
---
```

### 4. Instructions

Always-loaded rules in `.copilot/instructions/`:

| File | Content |
|------|---------|
| `system-prompts.md` | Identity, behavior, project context |
| `coding-instructions.md` | Code style, naming, patterns |
| `testing-instructions.md` | Test framework, coverage targets |
| `security-instructions.md` | Security rules, auth requirements |

### 5. Commands

18 command docs in `commands/` guide workflows:

| Command | Purpose |
|---------|---------|
| `/plan` | Create implementation plan |
| `/tdd` | Test-driven development cycle |
| `/code-review` | Review code for issues |
| `/e2e` | End-to-end test execution |
| `/build-fix` | Resolve build errors |
| `/refactor-clean` | Refactor and clean code |
| `/learn` | Extract patterns from session |
| `/checkpoint` | Save quality baseline |
| `/verify` | Run verification loop |
| `/go-review` | Go-specific code review |
| `/skill-create` | Create skill from patterns |
| `/evolve` | Promote instincts to skills |

## Directory Structure

```
your-project/
├── .copilot/
│   ├── AGENTS.md                 # 12 agent definitions
│   ├── instructions/             # Always-loaded rules
│   │   ├── system-prompts.md
│   │   ├── coding-instructions.md
│   │   ├── testing-instructions.md
│   │   └── security-instructions.md
│   └── skills/                   # Auto-loaded knowledge
│       ├── coding-standards/     # Language-specific standards
│       ├── frontend-patterns/    # React, CSS, performance
│       ├── backend-patterns/     # APIs, databases, events
│       ├── golang-patterns/      # Go idioms, testing, concurrency
│       ├── test-driven-development/
│       ├── verification-loop/    # Quality checks and evals
│       ├── security-review/      # OWASP, secrets, deps
│       ├── continuous-learning/  # Pattern extraction
│       ├── continuous-learning-v2/ # Evolution pipeline
│       ├── iterative-retrieval/  # Context management
│       └── strategic-compact/    # Token optimization
├── agents/                       # Detailed agent documentation
├── commands/                     # Command reference docs
├── contexts/                     # Workflow context files
├── scripts/                      # Node.js utilities
│   ├── init-copilot.js          # Project initialization
│   ├── validate-agents.js       # Agent config validation
│   ├── validate-skills.js       # Skill config validation
│   ├── skill-creator.js         # Create skills from git history
│   ├── instinct-manager.js      # Manage learned patterns
│   └── lib/                     # Shared libraries
├── tests/                        # Test suite
├── mcp-configs/                  # MCP server configurations
├── examples/                     # Team and language configs
├── docs/                         # This documentation
└── .github/                      # Actions and templates
```

## Verification Loops

Every meaningful change follows:

```
CHECKPOINT → CHANGE → EVALUATE → COMPARE → DECIDE
```

- **Checkpoint:** Capture test results, coverage, lint status
- **Change:** Implement the feature or fix
- **Evaluate:** Run tests, types, lint, build
- **Compare:** Diff against checkpoint
- **Decide:** Pass → continue. Fail → fix.

### Quality Gates

| Gate | When | What |
|------|------|------|
| Per-save | File save | Lint + types |
| Per-commit | Before commit | Tests + lint + types |
| Pre-push | Before push | Full suite + coverage |
| Pre-merge | PR review | All evals + security |

## Continuous Learning

Knowledge evolves through five stages:

```
Extract → Store → Score → Cluster → Evolve
```

1. **Extract** — Identify patterns during sessions (`/learn`)
2. **Store** — Save as instincts (JSON with confidence scores)
3. **Score** — Confidence grows with use (+0.05), decays without (-0.01/week)
4. **Cluster** — Related instincts group together
5. **Evolve** — Mature clusters become formal skills (`/evolve`)

### Confidence Thresholds

| Level | Action |
|-------|--------|
| ≥ 0.80 | Auto-apply |
| 0.50–0.79 | Suggest |
| 0.30–0.49 | Available |
| < 0.30 | Prune candidate |

## Token Optimization

### Budget Allocation

```
15%  System prompt + instructions
60%  Context (code, docs, conversation)
25%  Output generation reserve
```

### Compaction Triggers

- Context > 80% full
- Conversation > 20 turns
- Task focus has shifted
- Repeated information

### Priority Ranking

| Priority | Content | On Compaction |
|----------|---------|---------------|
| Critical | Current file, errors | Always keep |
| Important | Dependencies, tests | Keep if space |
| Reference | Related modules, docs | Summarize |
| Disposable | Old messages, resolved issues | Remove |

## MCP Integration

MCP servers connect Copilot to external tools:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}" }
    }
  }
}
```

Available integrations: GitHub, filesystem, PostgreSQL, Slack, memory, and custom REST APIs.

## Quick Start

### Option 1: Copy

```bash
# Copy the .copilot directory to your project
cp -r everything-copilot/.copilot your-project/.copilot
```

### Option 2: Init Script

```bash
cd your-project
node path/to/everything-copilot/scripts/init-copilot.js
```

### Option 3: Cherry-Pick

Copy only what you need:
```bash
# Just agents and instructions
cp -r everything-copilot/.copilot/AGENTS.md your-project/.copilot/
cp -r everything-copilot/.copilot/instructions your-project/.copilot/

# Add specific skills
cp -r everything-copilot/.copilot/skills/security-review your-project/.copilot/skills/
```

## Validation

```bash
# Validate configuration
node scripts/validate-agents.js
node scripts/validate-skills.js

# Run tests
node tests/run-all.js
```

## Key Principles

1. **Right model for the right task** — Don't use Opus for formatting
2. **Skills over instructions** — Load knowledge conditionally, not always
3. **Verify continuously** — Every change, not just at the end
4. **Learn and evolve** — Extract patterns, build confidence, promote to skills
5. **Optimize tokens** — Include only what's relevant, summarize the rest

## Next Steps

- **Customize agents** — Edit `.copilot/AGENTS.md` for your team
- **Add project skills** — Create domain-specific skills
- **Set up MCP** — Connect GitHub, databases, APIs
- **Start learning** — Use `/learn` to build project instincts
- **Read the longform guide** — [THE-LONGFORM-GUIDE.md](./THE-LONGFORM-GUIDE.md) for deep dives
