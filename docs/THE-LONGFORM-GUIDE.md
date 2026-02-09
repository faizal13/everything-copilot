# The Longform Guide to Everything Copilot

> A comprehensive deep-dive into every system, pattern, and workflow. This is the guide you read when you want to truly master AI-assisted development with GitHub Copilot.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Architecture](#architecture)
3. [Agent System](#agent-system)
4. [Model Strategy](#model-strategy)
5. [Skill System](#skill-system)
6. [Instructions & Context](#instructions--context)
7. [Commands](#commands)
8. [Verification Loops](#verification-loops)
9. [Continuous Learning](#continuous-learning)
10. [Token Optimization](#token-optimization)
11. [MCP Integration](#mcp-integration)
12. [Scripts & Tooling](#scripts--tooling)
13. [Team Configuration](#team-configuration)
14. [Workflows](#workflows)
15. [Customization](#customization)
16. [Troubleshooting](#troubleshooting)

---

## Philosophy

### The Problem

AI coding assistants are powerful but generic. Out of the box, they don't know your project's conventions, your team's preferences, or the domain you're working in. Every session starts from zero.

### The Solution

Everything Copilot creates a structured knowledge layer that sits between your codebase and the AI. It provides:

- **Specialized agents** that behave like experienced team members
- **Auto-loaded skills** that inject relevant knowledge based on context
- **Model routing** that matches task complexity to model capability
- **Verification loops** that catch errors before they compound
- **Continuous learning** that gets smarter over time

### Design Principles

1. **Convention over configuration** — Sensible defaults, override when needed
2. **Progressive disclosure** — Simple to start, powerful when you go deep
3. **Right-sizing** — Match model power to task complexity
4. **Verify always** — Quality checks at every step, not just at the end
5. **Learn continuously** — Every session produces reusable knowledge
6. **Domain-agnostic** — Works for web apps, CLI tools, libraries, infrastructure

---

## Architecture

### Directory Layout

```
your-project/
├── .copilot/                        # Copilot configuration root
│   ├── AGENTS.md                    # Agent definitions (always available)
│   ├── instructions/                # Always-loaded context
│   │   ├── system-prompts.md        # AI identity and project context
│   │   ├── coding-instructions.md   # Code style and patterns
│   │   ├── testing-instructions.md  # Test framework and coverage
│   │   └── security-instructions.md # Security requirements
│   └── skills/                      # Conditionally-loaded knowledge
│       ├── coding-standards/        # Per-language standards
│       │   ├── SKILL.md
│       │   ├── javascript.md
│       │   ├── typescript.md
│       │   ├── python.md
│       │   ├── go.md
│       │   └── rust.md
│       ├── frontend-patterns/       # UI/React/CSS knowledge
│       ├── backend-patterns/        # API/DB/caching/events
│       ├── golang-patterns/         # Go-specific patterns
│       ├── test-driven-development/ # TDD methodology
│       ├── verification-loop/       # Quality evaluation system
│       ├── security-review/         # Security analysis
│       ├── continuous-learning/     # Pattern extraction
│       ├── continuous-learning-v2/  # Evolution pipeline
│       ├── iterative-retrieval/     # Context management
│       └── strategic-compact/       # Token optimization
├── agents/                          # Extended agent documentation
│   ├── planner.md
│   ├── architect.md
│   ├── tdd-guide.md
│   ├── code-reviewer.md
│   ├── security-reviewer.md
│   ├── build-error-resolver.md
│   ├── e2e-runner.md
│   ├── refactor-cleaner.md
│   ├── doc-updater.md
│   ├── go-reviewer.md
│   ├── go-build-resolver.md
│   └── performance-optimizer.md
├── commands/                        # Command workflow documentation
│   ├── README.md
│   ├── plan.md ... (18 commands)
├── contexts/                        # Workflow-specific contexts
│   ├── dev.md
│   ├── review.md
│   └── research.md
├── scripts/                         # Node.js utilities
│   ├── init-copilot.js
│   ├── validate-agents.js
│   ├── validate-skills.js
│   ├── skill-creator.js
│   ├── instinct-manager.js
│   ├── setup-package-manager.js
│   └── lib/
│       ├── utils.js
│       ├── package-manager.js
│       └── model-selector.js
├── tests/                           # Validation test suite
├── mcp-configs/                     # MCP server configurations
├── examples/                        # Team and language examples
├── docs/                            # Documentation (you are here)
└── .github/                         # CI/CD and templates
```

### How It All Connects

```
User asks a question in Copilot Chat
         │
         ▼
┌─────────────────┐
│  AGENTS.md      │ ← Determines which agent persona responds
│  (always loaded) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Instructions   │ ← Universal rules always in context
│  (always loaded) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Skills         │ ← Relevant skills auto-load based on triggers
│  (conditional)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Model Router   │ ← Agent definition determines Opus/Sonnet/Haiku
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Response       │ ← Informed by all loaded context
└─────────────────┘
```

---

## Agent System

### What Are Agents?

Agents are specialized personas that shape how Copilot behaves for different tasks. Instead of a generic assistant, you get targeted expertise.

### Agent Definition Format

Every agent in `.copilot/AGENTS.md` follows this structure:

```markdown
## Agent Name

[System prompt — who the agent is and how it behaves]

### Instructions
- Specific rules and constraints
- Workflow steps
- Quality standards

### Model
[opus | sonnet | haiku]
```

### The 12 Agents

#### Planner (Opus)

Creates implementation plans before any code is written. Breaks features into phases, identifies risks, estimates complexity.

**When to use:** Starting a new feature, major refactoring, architecture decisions.

**Workflow:**
1. Analyze the requirement
2. Map affected files and dependencies
3. Design phased approach
4. Identify risks with mitigations
5. Estimate complexity

#### Architect (Opus)

Makes high-level system design decisions. Evaluates trade-offs between patterns, technologies, and approaches.

**When to use:** System design, technology selection, scalability planning.

#### TDD Agent (Sonnet)

Drives test-driven development using the RED→GREEN→REFACTOR cycle.

**When to use:** Writing new functions, fixing bugs with test coverage, building features with clear acceptance criteria.

**Workflow:**
1. Write a failing test (RED)
2. Implement minimum code to pass (GREEN)
3. Refactor while keeping tests green
4. Repeat

#### Code Reviewer (Sonnet)

Reviews code for bugs, maintainability, performance, and style.

**When to use:** Before merging PRs, after implementing features, periodic codebase reviews.

**Checks:** Logic errors, error handling, naming clarity, DRY violations, unused code, complexity.

#### Security Reviewer (Opus)

Performs security-focused code review against OWASP Top 10 and project-specific requirements.

**When to use:** Auth/authz code, user input handling, dependency updates, pre-deployment review.

**Checks:** Injection, broken access control, cryptography, secrets exposure, SSRF, XSS.

#### Build Error Resolver (Sonnet)

Diagnoses and fixes build failures, compile errors, and type errors.

**When to use:** When `npm run build`, `tsc`, or `go build` fails.

**Workflow:**
1. Run the build command
2. Parse error output
3. Identify root cause
4. Apply fix
5. Re-run build to verify
6. Run tests to prevent regressions

#### E2E Runner (Sonnet)

Manages end-to-end test suites — writing, running, and debugging.

**When to use:** Integration testing, user flow validation, regression testing.

#### Refactor/Cleaner (Sonnet)

Improves code structure without changing behavior.

**When to use:** Code smell reduction, pattern migration, readability improvements.

**Rule:** Tests must pass before AND after refactoring.

#### Documentation Updater (Haiku)

Keeps documentation in sync with code changes.

**When to use:** After API changes, new features, updated configurations.

#### Go Reviewer (Sonnet)

Go-specific code review with idiomatic Go expertise.

**When to use:** Reviewing Go code for idioms, error handling, concurrency patterns.

#### Go Build Resolver (Sonnet)

Resolves Go-specific build issues — module errors, type mismatches, import cycles.

**When to use:** When `go build` or `go vet` fails.

#### Performance Optimizer (Sonnet)

Identifies and resolves performance bottlenecks.

**When to use:** Slow queries, memory leaks, render performance, bundle size.

---

## Model Strategy

### Why Model Routing Matters

Using Opus for every task wastes money. Using Haiku for complex reasoning produces poor results. Model routing optimizes the cost-quality trade-off.

### The Three Tiers

**Tier 1 — Opus (Complex Reasoning)**
- Architecture and system design
- Security vulnerability analysis
- Complex multi-file refactoring
- Novel problem solving

**Tier 2 — Sonnet (Implementation)**
- Feature implementation
- Test-driven development
- Code review
- Bug fixing
- Build error resolution

**Tier 3 — Haiku (Mechanical Tasks)**
- Documentation updates
- Code formatting
- Commit messages
- Simple renaming
- Boilerplate generation

### Cost Impact

By routing appropriately, a typical development session uses:

```
60% Haiku  → $0.25/M input  = Very cheap
35% Sonnet → $3.00/M input  = Moderate
 5% Opus   → $15.00/M input = Expensive (but rare)

Blended cost ≈ $1.20/M input tokens
vs. all-Opus ≈ $15.00/M input tokens
= ~12× cost reduction
```

### Model Selection in Code

The `scripts/lib/model-selector.js` library automates this:

```javascript
const { selectModel } = require('./lib/model-selector');

selectModel('architecture');    // → 'opus'
selectModel('implementation');  // → 'sonnet'
selectModel('documentation');   // → 'haiku'
selectModel('security-review'); // → 'opus'
selectModel('test-writing');    // → 'sonnet'
```

---

## Skill System

### How Skills Work

Skills are the knowledge injection mechanism. They live in `.copilot/skills/` and contain domain-specific information that loads automatically when relevant.

### Anatomy of a Skill

Every skill is a directory with:

```
.copilot/skills/my-skill/
├── SKILL.md           # Manifest (required)
├── topic-one.md       # Knowledge file
├── topic-two.md       # Knowledge file
└── topic-three.md     # Knowledge file
```

### The SKILL.md Manifest

```yaml
---
Name: My Skill
Description: What this skill provides
Trigger Conditions:
  - When condition A is true
  - When condition B is true
Files:
  - topic-one.md
  - topic-two.md
  - topic-three.md
---

## Overview
Brief description of what this skill covers.
```

The trigger conditions determine when Copilot should load this skill's files. When you're editing a React component, the frontend-patterns skill triggers. When you're reviewing auth code, the security-review skill triggers.

### Included Skills

| Skill | Files | Purpose |
|-------|-------|---------|
| coding-standards | 6 | Per-language code style |
| frontend-patterns | 5 | React, state, CSS, performance |
| backend-patterns | 5 | APIs, databases, caching, events |
| golang-patterns | 5 | Go idioms, interfaces, testing, concurrency |
| test-driven-development | 5 | TDD workflow, Jest, pytest, coverage |
| verification-loop | 5 | Checkpoints, evals, pass@k, rubrics |
| security-review | 5 | OWASP, dependencies, secrets, best practices |
| continuous-learning | 4 | Pattern extraction, storage, reuse |
| continuous-learning-v2 | 4 | Confidence, clustering, evolution |
| iterative-retrieval | 4 | Context refinement, subagents |
| strategic-compact | 4 | Token optimization, compaction |

### Creating Custom Skills

Use the skill creator script:

```bash
node scripts/skill-creator.js my-new-skill
```

Or manually:

1. Create directory: `.copilot/skills/my-skill/`
2. Write `SKILL.md` with name, description, triggers, file list
3. Create knowledge files referenced in SKILL.md
4. Validate: `node scripts/validate-skills.js`

### Skill Best Practices

- **One topic per file** — Don't combine unrelated knowledge
- **Under 200 lines per file** — Keep files scannable
- **Concrete examples** — Show code, not just descriptions
- **Specific triggers** — Don't over-match; skills should load when actually relevant
- **Test your triggers** — Edit different file types and verify the right skills load

---

## Instructions & Context

### Instructions Directory

Files in `.copilot/instructions/` are loaded into **every** Copilot session. They define the universal rules.

#### system-prompts.md

Defines who the AI is and how it should behave:

```markdown
# System Prompts

## Identity
You are a senior software engineer with expertise in [your stack].

## Behavior
- Think step-by-step before implementing
- Explain trade-offs when multiple approaches exist
- Ask clarifying questions for ambiguous requirements
- Verify changes don't break existing functionality
```

#### coding-instructions.md

Code style and patterns:

```markdown
# Coding Instructions

## Style
- Use TypeScript strict mode
- Prefer functional patterns
- Named exports only
- No default exports

## Error Handling
- Use Result<T, E> types
- Never swallow errors silently
- Log errors with context
```

#### testing-instructions.md

Test requirements:

```markdown
# Testing Instructions

## Coverage
- Minimum 80% line coverage
- 90% for critical paths (auth, payments)

## Patterns
- Arrange-Act-Assert
- One concept per test
- Descriptive test names
```

#### security-instructions.md

Security non-negotiables:

```markdown
# Security Instructions

- Validate all inputs at boundaries
- Use parameterized queries
- Never log secrets or PII
- Rotate tokens quarterly
```

### Context Files

Context files in `contexts/` provide mode-specific information:

- **dev.md** — Development context: "I'm building features. Focus on implementation quality."
- **review.md** — Review context: "I'm reviewing code. Focus on bugs, security, and maintainability."
- **research.md** — Research context: "I'm exploring options. Focus on trade-offs and comparisons."

---

## Commands

### Command System

Commands are documented workflows in `commands/`. They guide structured interactions.

### Development Commands

| Command | Agent | Purpose |
|---------|-------|---------|
| `/plan` | Planner (Opus) | Create implementation plan |
| `/tdd` | TDD (Sonnet) | RED→GREEN→REFACTOR cycle |
| `/build-fix` | Build Resolver (Sonnet) | Fix compile/build errors |
| `/e2e` | E2E Runner (Sonnet) | Run end-to-end tests |
| `/refactor-clean` | Refactor (Sonnet) | Improve code structure |

### Review Commands

| Command | Agent | Purpose |
|---------|-------|---------|
| `/code-review` | Code Reviewer (Sonnet) | General code review |
| `/go-review` | Go Reviewer (Sonnet) | Go-specific review |
| `/go-test` | Go Reviewer (Sonnet) | Go test execution |
| `/go-build` | Go Build Resolver (Sonnet) | Go build fixes |

### Quality Commands

| Command | Agent | Purpose |
|---------|-------|---------|
| `/checkpoint` | Verification | Save quality baseline |
| `/verify` | Verification | Run verification loop |

### Learning Commands

| Command | Agent | Purpose |
|---------|-------|---------|
| `/learn` | Continuous Learning | Extract session patterns |
| `/skill-create` | Learning | Create skill from patterns |
| `/instinct-status` | Learning | Show instinct overview |
| `/instinct-export` | Learning | Export instincts to file |
| `/instinct-import` | Learning | Import instincts from file |
| `/evolve` | Learning | Promote clusters to skills |

### Setup Commands

| Command | Purpose |
|---------|---------|
| `/setup-pm` | Configure package manager |

---

## Verification Loops

### The Core Loop

```
CHECKPOINT → CHANGE → EVALUATE → COMPARE → DECIDE
     ↑                                        │
     └────────────── (on fail) ───────────────┘
```

This loop runs continuously, not just at the end of development.

### Checkpoint System

A checkpoint is a snapshot of project quality:
- Test results (pass/fail counts)
- Coverage percentages
- Lint error counts
- Build status
- Type error counts

Create checkpoints before features, refactors, and at end of sessions.

### Evaluation Dimensions

Every change is evaluated on five dimensions:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Correctness | 30% | Right output for all inputs |
| Completeness | 25% | All requirements covered |
| Code Quality | 20% | Readable, maintainable |
| Performance | 15% | Efficient, no waste |
| Security | 10% | Safe, no vulnerabilities |

### Scoring

Each dimension scored 1-5:
- **5** — Exceeds requirements, production-ready
- **4** — Meets all requirements
- **3** — Meets core requirements, has gaps
- **2** — Missing requirements
- **1** — Does not work

**Overall = weighted sum. Ship at ≥ 4.0. Rework at < 3.0.**

### Regression Rules

1. Test count must not decrease
2. Coverage must not drop > 2%
3. Lint errors must not increase
4. Build must stay green
5. Type errors must stay at zero

---

## Continuous Learning

### The Five Stages

#### Stage 1: Extract

During productive sessions, patterns emerge — repeated code structures, debugging techniques, workflow preferences. The `/learn` command captures these.

**Quality filter:** Only extract patterns that are repeatable, non-obvious, specific, and project-relevant.

#### Stage 2: Store

Patterns become instincts — JSON objects with metadata:

```json
{
  "id": "inst_abc123",
  "name": "Pattern name",
  "category": "code-pattern",
  "pattern": "Description of the pattern",
  "confidence": 0.5,
  "created": "2024-01-15T10:00:00Z",
  "lastUsed": "2024-01-15T10:00:00Z",
  "useCount": 1,
  "tags": ["tag1", "tag2"]
}
```

Categories: code-pattern, workflow, debugging, architecture, testing, tooling.

#### Stage 3: Score

Confidence is a 0.0–0.95 value that reflects reliability:

- **Growth:** +0.05 per successful use (cap at 0.95)
- **Decay:** -0.01 per week of non-use (floor at 0.10)
- **Import discount:** Imported instincts start at 80% of their original confidence

**Thresholds:**
| Confidence | Behavior |
|------------|----------|
| ≥ 0.80 | Auto-apply proactively |
| 0.50–0.79 | Suggest when relevant |
| 0.30–0.49 | Available on request |
| < 0.30 | Candidate for pruning |

#### Stage 4: Cluster

Related instincts group based on:
- Tag similarity (Jaccard index)
- Category match
- Pattern keyword overlap

Clusters are named by common tags and re-evaluated as instincts change.

#### Stage 5: Evolve

When a cluster reaches readiness (3+ instincts, average confidence ≥ 0.70), it can evolve into a formal skill:

```bash
node scripts/instinct-manager.js evolve
```

This generates a new `.copilot/skills/` directory with SKILL.md and compiled documentation from the source instincts.

---

## Token Optimization

### Context Window Budget

```
Total: ~200K tokens
├── 15% System (30K) — Instructions, agent definitions
├── 60% Context (120K) — Code, tests, conversation
└── 25% Reserve (50K) — Output generation
```

Within the context allocation:
```
50% Source code under discussion
20% Test files
15% Related modules
10% Documentation
 5% Configuration
```

### Estimation

Quick rule: ~4 characters per token for English, ~3.5 for code.

| File Size | Token Estimate |
|-----------|---------------|
| 50 lines | ~400 tokens |
| 200 lines | ~1,600 tokens |
| 500 lines | ~4,000 tokens |
| 1000 lines | ~8,000 tokens |

### Compaction

When context fills up:

1. **Summarize completed work** — Replace long conversations with short summaries
2. **Drop resolved context** — Remove fixed error messages, rejected approaches
3. **Reference, don't include** — Point to files instead of pasting them
4. **Consolidate instructions** — Merge scattered corrections into one block

**Always preserve:** Current objective, key decisions, active constraints, unresolved issues, file paths.

### Prompt Efficiency

- Be specific: "Add email validation to createUser in src/api/users.ts" not "help with this code"
- Provide structure: File, line, error, expected behavior
- Batch requests: Multiple related changes in one message

---

## MCP Integration

### What Is MCP?

Model Context Protocol (MCP) lets Copilot call external tools — GitHub APIs, databases, monitoring systems, and custom services.

### Configuration

```json
// mcp-configs/mcp-servers.json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Available Servers

| Server | Purpose |
|--------|---------|
| GitHub | Issues, PRs, code search |
| Filesystem | File read/write |
| PostgreSQL | Database queries |
| Slack | Messaging |
| Memory | Persistent storage |

### Custom Servers

Use templates in `mcp-configs/templates/` to create custom integrations for REST APIs, internal tools, and specialized services.

### Security

- Use environment variables for all credentials
- Read-only access for databases
- Least-privilege token scopes
- Never commit `.env` files

---

## Scripts & Tooling

### Utility Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `init-copilot.js` | Initialize `.copilot/` in a project | `npm run init` |
| `validate-agents.js` | Validate AGENTS.md structure | `npm run validate:agents` |
| `validate-skills.js` | Validate skill directories | `npm run validate:skills` |
| `skill-creator.js` | Create skills from git history | `npm run skill:create -- name` |
| `instinct-manager.js` | Manage learned instincts | `npm run instinct:manage -- cmd` |
| `setup-package-manager.js` | Detect and configure PM | `node scripts/setup-package-manager.js` |

### Shared Libraries

**`scripts/lib/utils.js`** — File I/O, logging, markdown parsing:
- `readFile(path)` / `writeFile(path, content)`
- `parseMarkdown(content)` — Extract sections and headers
- `log.info()` / `log.warn()` / `log.error()` / `log.success()`

**`scripts/lib/package-manager.js`** — Package manager detection:
- `detectPackageManager(dir)` — Returns npm/yarn/pnpm/bun
- `getInstallCommand(pm)` / `getRunCommand(pm, script)` / `getAddCommand(pm, pkg)`

**`scripts/lib/model-selector.js`** — Task-to-model routing:
- `selectModel(taskType)` — Returns opus/sonnet/haiku
- `getModelConfig(model)` — Returns model metadata
- `estimateTokens(text)` / `isWithinBudget(text, max)`

### Design Principles for Scripts

- **CommonJS** — `'use strict'` and `require()`
- **`node:` prefix** — For built-in modules (`node:fs`, `node:path`)
- **No external deps** — Everything uses Node.js built-ins only
- **Cross-platform** — Works on macOS, Linux, Windows
- **Exported functions** — Every script exports its functions for testing

---

## Team Configuration

### Frontend Team

Focus agents: Code Reviewer, TDD, Performance Optimizer
Key skills: frontend-patterns, coding-standards, test-driven-development
MCP tools: GitHub, Figma, Storybook

### Backend Team

Focus agents: Architect, Security Reviewer, TDD
Key skills: backend-patterns, security-review, coding-standards
MCP tools: GitHub, PostgreSQL, Redis, monitoring

### DevOps Team

Focus agents: Build Error Resolver, Security Reviewer, Performance Optimizer
Key skills: security-review, strategic-compact
MCP tools: GitHub, AWS, Kubernetes, Terraform

### Full-Stack Team

All agents active, all skills available.
Customize by adjusting model routing based on which domain is most active.

### Example Configurations

See `examples/team-configs/` for ready-to-use setups:
- `frontend-team.md`
- `backend-team.md`
- `devops-team.md`
- `fullstack-team.md`

And `examples/language-specific/` for language setups:
- `javascript-setup.md`
- `typescript-setup.md`
- `python-setup.md`
- `go-setup.md`
- `rust-setup.md`

---

## Workflows

### Feature Development

```
1. /plan           → Design the implementation approach
2. /checkpoint     → Save baseline quality state
3. /tdd            → Write tests, then implement
4. /verify         → Confirm no regressions
5. /code-review    → Review for quality issues
6. /checkpoint     → Save new baseline
7. /learn          → Extract patterns from session
```

### Bug Fixing

```
1. Reproduce the bug in a test
2. /tdd            → RED (test captures the bug)
3. Fix the bug     → GREEN
4. /verify         → No regressions
5. /learn          → Capture debugging pattern
```

### Code Review

```
1. /code-review    → Automated review
2. Fix critical issues
3. /verify         → Confirm fixes
4. For security-sensitive code: switch to Security Reviewer agent
5. /checkpoint     → Save post-review state
```

### Refactoring

```
1. /checkpoint     → Save pre-refactor baseline
2. /verify         → Confirm everything passes first
3. /refactor-clean → Apply improvements
4. /verify         → Confirm behavior unchanged
5. /checkpoint     → Save post-refactor state
```

### New Project Setup

```
1. node scripts/init-copilot.js
2. Customize .copilot/instructions/ for your project
3. Select relevant skills from .copilot/skills/
4. Configure agents in .copilot/AGENTS.md
5. Set up MCP servers in mcp-configs/
6. Run npm run validate:agents && npm run validate:skills
7. Start developing with /plan for first feature
```

---

## Customization

### Adding an Agent

Edit `.copilot/AGENTS.md`:

```markdown
## My Custom Agent

You are a [role] specialist with expertise in [domain].

### Instructions
- Rule 1
- Rule 2
- Workflow steps

### Model
sonnet
```

Then create `agents/my-custom-agent.md` with extended documentation.

### Adding a Skill

```bash
node scripts/skill-creator.js my-domain
```

This creates the directory structure. Fill in the SKILL.md triggers and create knowledge files.

### Modifying Model Routing

Edit the agent's `### Model` section in AGENTS.md:
- Change `sonnet` to `opus` for tasks needing more reasoning
- Change `sonnet` to `haiku` for simpler tasks to save cost

### Adding Commands

Create `commands/my-command.md`:

```markdown
# /my-command

## Purpose
What this command does.

## Workflow
1. Step one
2. Step two

## Agent
Which agent handles this (and model).

## Output Format
What the output should look like.
```

### Customizing Instructions

Edit files in `.copilot/instructions/` to match your project:
- Add project-specific conventions
- Set framework and library preferences
- Define team agreements and ADRs

---

## Troubleshooting

### Agent Issues

| Problem | Solution |
|---------|----------|
| Wrong agent responding | Check AGENTS.md format — ensure `## Name` and `### Model` headers are correct |
| Agent ignoring instructions | Instructions may be too long — keep each agent under 20 lines |
| Inconsistent behavior | Check for conflicting rules between instructions and skills |

### Skill Issues

| Problem | Solution |
|---------|----------|
| Skill not loading | Verify SKILL.md has correct trigger conditions |
| Wrong skill loading | Make triggers more specific |
| Skill files not found | Check file list in SKILL.md matches actual files |
| Validate: `node scripts/validate-skills.js` | |

### Build/Test Issues

| Problem | Solution |
|---------|----------|
| `validate-agents.js` fails | Check AGENTS.md has `## Agent Name` headers |
| `validate-skills.js` fails | Each skill dir needs SKILL.md with Name field |
| Tests fail | Run `node tests/run-all.js` for detailed output |

### Performance Issues

| Problem | Solution |
|---------|----------|
| Slow responses | Check if you're using Opus when Sonnet would suffice |
| Context running out | Use `/compact` or switch to strategic-compact skill |
| Session ending early | Summarize completed work, drop resolved context |

### MCP Issues

| Problem | Solution |
|---------|----------|
| Server not starting | Check `npx -y @modelcontextprotocol/server-<name>` manually |
| Auth failures | Verify `.env` has correct tokens |
| Tools not available | Check tool names match server's tool list |

---

## Quick Reference

### File Hierarchy (What Loads When)

| File | When Loaded | Purpose |
|------|-------------|---------|
| `.copilot/AGENTS.md` | Always | Agent definitions |
| `.copilot/instructions/*` | Always | Universal rules |
| `.copilot/skills/*/SKILL.md` | On trigger match | Domain knowledge |
| `contexts/*.md` | On workflow selection | Mode-specific context |

### Model Quick-Select

| Task | Model |
|------|-------|
| Architecture | Opus |
| Security | Opus |
| Implementation | Sonnet |
| Testing | Sonnet |
| Review | Sonnet |
| Documentation | Haiku |
| Formatting | Haiku |

### Essential Commands

```bash
# Setup
npm run init                           # Initialize project
npm run validate:agents                # Validate agents
npm run validate:skills                # Validate skills

# Development
npm test                               # Run all tests

# Learning
npm run instinct:manage -- status      # Check instinct status
npm run instinct:manage -- evolve      # Evolve to skills
npm run skill:create -- name           # Create new skill
```

---

## Conclusion

Everything Copilot transforms GitHub Copilot from a generic assistant into a structured AI development environment. The agent system provides specialized expertise. Skills inject the right knowledge at the right time. Verification loops catch errors early. Continuous learning makes the system smarter over time. And token optimization ensures you get the most from every session.

Start simple — use the agents and instructions. As you grow comfortable, add skills, enable verification loops, and begin capturing instincts. Over time, your AI assistant becomes deeply specialized for your project and team.

**Start here:**
1. Copy `.copilot/` to your project
2. Customize `instructions/` for your conventions
3. Try `/plan` for your next feature
4. Use `/tdd` for implementation
5. Run `/learn` when you discover a useful pattern

The system grows with you.
