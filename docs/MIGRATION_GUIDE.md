# Migration Guide: Claude Code → GitHub Copilot

## Overview

This guide walks you through migrating an existing Claude Code setup (using `CLAUDE.md`) to GitHub Copilot's `.copilot/` directory structure. The migration preserves all your rules, patterns, and workflows while adapting them to Copilot's structured format.

## Migration Overview

```
Claude Code                          GitHub Copilot
───────────                          ──────────────
CLAUDE.md (root)          →          .copilot/AGENTS.md
                                     .copilot/instructions/*.md
                                     .copilot/skills/*/

src/CLAUDE.md             →          .copilot/skills/<domain>/
tests/CLAUDE.md           →          .copilot/instructions/testing-instructions.md

Slash commands (/plan)    →          commands/plan.md + skill triggers
.claude/commands/         →          commands/

MCP config                →          mcp-configs/mcp-servers.json
```

## Step-by-Step Migration

### Step 1: Create Directory Structure

```bash
mkdir -p .copilot/instructions
mkdir -p .copilot/skills
mkdir -p commands
mkdir -p contexts
mkdir -p mcp-configs
mkdir -p agents
mkdir -p docs
```

Or use the init script:
```bash
npx everything-copilot init
# or
node scripts/init-copilot.js
```

### Step 2: Migrate Root CLAUDE.md

Your root `CLAUDE.md` likely contains several types of content. Split it into the appropriate Copilot files.

**Before — CLAUDE.md:**
```markdown
You are a senior TypeScript engineer.

## Rules
- Use strict TypeScript
- Prefer functional programming
- Always write tests
- Use Zod for validation

## Testing
- Use Vitest
- Aim for 80% coverage
- Mock external services

## Security
- Never log secrets
- Validate all inputs
- Use parameterized queries

## Project Context
- This is a Next.js 14 app
- Using Prisma with PostgreSQL
- Deployed on Vercel
```

**After — Split into Copilot files:**

**`.copilot/instructions/system-prompts.md`:**
```markdown
# System Prompts

## Identity
You are a senior TypeScript engineer working on a Next.js 14 application.

## Project Context
- Framework: Next.js 14 (App Router)
- Database: PostgreSQL via Prisma
- Deployment: Vercel
- Language: TypeScript (strict mode)
```

**`.copilot/instructions/coding-instructions.md`:**
```markdown
# Coding Instructions

## TypeScript
- Enable strict mode in all files
- Prefer functional programming patterns
- Use Zod for runtime validation
- Prefer `const` over `let`, never use `var`

## Style
- Named exports over default exports
- Barrel exports via index.ts
- Error handling with Result types
```

**`.copilot/instructions/testing-instructions.md`:**
```markdown
# Testing Instructions

## Framework
- Use Vitest for all tests
- Target 80% code coverage minimum

## Patterns
- Mock external services (APIs, databases)
- Use factories for test data
- Arrange-Act-Assert pattern
- One assertion concept per test
```

**`.copilot/instructions/security-instructions.md`:**
```markdown
# Security Instructions

- Never log secrets, tokens, or passwords
- Validate all inputs at API boundaries
- Use parameterized queries (never string concatenation)
- Sanitize outputs to prevent XSS
```

### Step 3: Migrate Directory-Specific CLAUDE.md Files

If you have `CLAUDE.md` files in subdirectories, convert them to skills.

**Before — `src/api/CLAUDE.md`:**
```markdown
## API Guidelines
- All endpoints return JSON
- Use proper HTTP status codes
- Validate request body with Zod
- Add rate limiting to public endpoints
- Use cursor pagination for lists
```

**After — `.copilot/skills/backend-patterns/api-design.md`:**
```markdown
# API Design Patterns

## Response Format
All endpoints return JSON with consistent structure.

## Status Codes
| Code | Usage |
|------|-------|
| 200 | Successful GET/PUT |
| 201 | Successful POST (created) |
| 204 | Successful DELETE |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 429 | Rate limited |
| 500 | Server error |

## Validation
Validate request body with Zod at the handler level:
```typescript
const schema = z.object({ email: z.string().email() });
const body = schema.parse(req.body);
```

## Pagination
Use cursor-based pagination:
```typescript
GET /api/users?cursor=abc123&limit=20
```
```

**Create the skill manifest — `.copilot/skills/backend-patterns/SKILL.md`:**
```markdown
---
Name: Backend Patterns
Description: API design, database patterns, and caching strategies
Trigger Conditions:
  - Working with API endpoints or route handlers
  - Database queries or models
  - Server-side logic
Files:
  - api-design.md
  - database-patterns.md
  - caching-strategies.md
---
```

### Step 4: Migrate Slash Commands

**Before — `.claude/commands/plan.md`:**
```markdown
Create a detailed implementation plan for the requested feature.
Break it into phases, identify risks, and estimate complexity.
```

**After — `commands/plan.md`:**
```markdown
# /plan

## Purpose
Create a detailed implementation plan for a feature or change.

## Workflow
1. Understand the requirement
2. Analyze the current codebase
3. Identify affected files and dependencies
4. Design the implementation approach
5. Break into phases with clear deliverables
6. Identify risks and mitigation strategies
7. Estimate complexity (S/M/L/XL)

## Output Format
### Plan: [Feature Name]

**Objective:** [One sentence]

**Phase 1: [Name]**
- [ ] Task 1
- [ ] Task 2

**Phase 2: [Name]**
- [ ] Task 3

**Risks:**
- Risk 1 → Mitigation

**Complexity:** [S/M/L/XL]

## Agent
Use the **Planner** agent (Opus model) for complex plans.
```

### Step 5: Create Agent Definitions

If you had different personas or modes in Claude Code, convert them to agents.

**`.copilot/AGENTS.md`:**
```markdown
## Planner
You are a strategic software architect. Create detailed implementation plans.

### Instructions
- Break features into phases
- Identify risks early
- Estimate complexity honestly

### Model
opus

---

## Implementer
You are a senior TypeScript engineer. Write clean, tested code.

### Instructions
- Follow project coding standards
- Write tests alongside implementation
- Handle errors properly

### Model
sonnet

---

## Reviewer
You are a thorough code reviewer. Find bugs, security issues, and improvements.

### Instructions
- Check for security vulnerabilities
- Verify error handling
- Assess test coverage

### Model
sonnet
```

### Step 6: Migrate MCP Configuration

**Before — `.claude/mcp.json`:**
```json
{
  "servers": {
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"]
    }
  }
}
```

**After — `mcp-configs/mcp-servers.json`:**
```json
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

### Step 7: Add New Copilot-Specific Features

After migrating existing config, add features unique to this toolkit:

**Verification loops:**
```bash
# Add verification skill
cp -r everything-copilot/.copilot/skills/verification-loop .copilot/skills/
```

**Continuous learning:**
```bash
# Add learning skills
cp -r everything-copilot/.copilot/skills/continuous-learning .copilot/skills/
cp -r everything-copilot/.copilot/skills/continuous-learning-v2 .copilot/skills/
```

**Scripts:**
```bash
cp everything-copilot/scripts/skill-creator.js scripts/
cp everything-copilot/scripts/instinct-manager.js scripts/
```

## Migration Checklist

### Configuration Files

- [ ] Root `CLAUDE.md` split into `instructions/*.md`
- [ ] Directory `CLAUDE.md` files converted to skills
- [ ] Slash commands migrated to `commands/` directory
- [ ] MCP configuration migrated to `mcp-configs/`
- [ ] Agent definitions created in `.copilot/AGENTS.md`

### Verification

- [ ] Run `node scripts/validate-agents.js` — passes
- [ ] Run `node scripts/validate-skills.js` — passes
- [ ] Run `npm test` — all tests pass
- [ ] Test each agent in Copilot Chat
- [ ] Verify skills auto-load for relevant files
- [ ] Confirm MCP servers connect

### Cleanup

- [ ] Remove old `CLAUDE.md` files (or keep for Claude Code compatibility)
- [ ] Update `.gitignore` for new directories
- [ ] Update team documentation
- [ ] Notify team members of new workflow

## Keeping Both

You can keep both configurations simultaneously if your team uses both tools:

```
project/
├── CLAUDE.md                  # Claude Code reads this
├── .copilot/                  # GitHub Copilot reads this
│   ├── AGENTS.md
│   ├── instructions/
│   └── skills/
└── ...
```

The two tools read different config files and don't conflict. However, you'll need to keep them in sync manually — any rule change should be applied to both.

### Sync Strategy

1. Choose one as the source of truth (recommend `.copilot/` for richer structure)
2. When updating rules, update the source of truth first
3. Periodically sync the other configuration
4. Consider a script that generates `CLAUDE.md` from `.copilot/` files

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Dumping entire CLAUDE.md into one instructions file | Split by concern: coding, testing, security |
| Forgetting to create SKILL.md manifests | Every skill directory needs a SKILL.md |
| Not testing agent mode after migration | Verify each agent works in Copilot Chat |
| Keeping stale CLAUDE.md alongside .copilot/ | Either remove or commit to syncing both |
| Not updating team documentation | Write migration notes for the team |
| Missing MCP environment variables | Set up `.env` with required tokens |

## Rollback

If the migration doesn't work out:

1. Your `CLAUDE.md` files are unchanged (if you kept them)
2. The `.copilot/` directory can be deleted entirely
3. Claude Code will work exactly as before
4. No project code is affected — only configuration files changed
