# Agents Guide

How to configure, customize, and create agents in Everything Copilot.

## How Agents Work

Agents are defined in `.copilot/AGENTS.md` at the repository root. Copilot reads this file on startup and uses it to assign specialized behavior to different tasks. Each agent is a section of markdown that tells Copilot what role to play, what tools to use, and what constraints to follow.

Agent documentation (the detailed reference for humans) lives separately in `agents/`. The `.copilot/AGENTS.md` file is the operational configuration that Copilot consumes.

## Anatomy of an Agent Definition

Every agent definition follows this structure:

```markdown
## Agent Name

### Overview
One paragraph explaining the agent's role and when to use it.

### Responsibilities
- Bullet list of specific tasks the agent handles.
- Each responsibility should be concrete and testable.

### Model Recommendation
| Model | Reason |
|-------|--------|
| Sonnet 4.5 | Why this model suits this agent's workload |

### Tools Required
- `Read` - What the agent uses this tool for.
- `Edit` - What the agent uses this tool for.
- `Bash` - What the agent uses this tool for.

### Workflow
1. Step-by-step process the agent follows.
2. Each step describes an action with expected output.

### Constraints
- Hard rules the agent must not violate.
- Boundaries on what the agent will and will not do.

### Delegation Rules
| Condition | Delegate To |
|-----------|-------------|
| When X happens | Another Agent |
```

### Required Sections

- **Overview**: Defines scope. Without it, Copilot cannot determine when to activate the agent.
- **Responsibilities**: Defines what the agent does. Must be specific enough to prevent overlap with other agents.
- **Constraints**: Defines what the agent must not do. This prevents scope creep and unsafe behavior.

### Optional but Recommended

- **Model Recommendation**: Guides cost-effective model selection.
- **Delegation Rules**: Enables multi-agent workflows where one agent hands off to another.
- **Workflow**: Gives Copilot a step-by-step process to follow, improving consistency.

## Creating a Custom Agent

### Step 1: Identify the Gap

Before creating a new agent, check whether an existing agent already covers the use case. Common mistakes:
- Creating a "database agent" when the Code Reviewer already handles SQL review.
- Creating a "React agent" when a frontend-patterns skill would suffice.

An agent is warranted when the task requires a distinct workflow, different model selection, or unique constraints that would conflict with existing agents.

### Step 2: Write the Definition

Add a new section to `.copilot/AGENTS.md`:

```markdown
## Database Migration Agent

### Overview
Generates and validates database migrations. Ensures migrations are
reversible, idempotent, and do not cause data loss in production.

### Responsibilities
- Generate migration files from schema changes.
- Validate that every UP migration has a corresponding DOWN.
- Check for destructive operations (DROP TABLE, DROP COLUMN) and require confirmation.
- Verify migration ordering and dependency chains.

### Model Recommendation
| Model | Reason |
|-------|--------|
| Sonnet 4.5 | Schema analysis needs good reasoning without Opus cost |

### Tools Required
- `Read` - Examine existing migrations and schema files.
- `Edit` - Create new migration files.
- `Bash` - Run migration dry-runs and validation commands.

### Constraints
- Never execute migrations against production databases.
- Always generate both UP and DOWN migrations.
- Flag any operation that drops data and require explicit confirmation.

### Delegation Rules
| Condition | Delegate To |
|-----------|-------------|
| Migration affects API contracts | Architect Agent |
| Migration needs performance review | Performance Optimizer |
```

### Step 3: Add Documentation

Create a corresponding file in `agents/your-agent.md` with extended documentation, examples, and usage scenarios. This file is for human reference and is not loaded by Copilot.

### Step 4: Validate

```bash
npm run validate:agents
```

This checks that every agent in `AGENTS.md` has the required sections and consistent formatting.

## Model Selection Guidelines

| Criteria | Opus | Sonnet | Haiku |
|----------|------|--------|-------|
| Multi-file reasoning | Best | Good | Limited |
| Code generation speed | Slow | Fast | Fastest |
| Security analysis depth | Best | Good | Basic |
| Cost per task | High | Medium | Low |
| Architecture decisions | Best | Good | Avoid |
| Boilerplate generation | Overkill | Good | Best |

**Rules of thumb:**
- Default to Sonnet for most agents. It covers 80% of tasks well.
- Use Opus only when the agent makes irreversible or high-stakes decisions.
- Use Haiku for agents that produce high-volume, low-complexity output.

## Tool Access Configuration

Each agent should declare only the tools it needs. Restricting tool access prevents unintended side effects.

| Tool | When to Grant | Risk Level |
|------|---------------|------------|
| `Read` | Almost always. Needed to understand context. | Low |
| `Grep` / `Glob` | When the agent searches across files. | Low |
| `Edit` | When the agent modifies code. | Medium |
| `Bash` | When the agent runs commands (tests, builds, linters). | Medium |
| `WebFetch` | When the agent needs external documentation. | Low |
| `TodoWrite` | When the agent tracks multi-step processes. | Low |

Agents that only produce analysis (Planner, Architect, Code Reviewer) should not have `Edit` access. Agents that modify code (TDD Guide, Build Fixer) need both `Edit` and `Bash`.

## Safety Constraints

Every agent should include at minimum:

1. **Scope boundary**: What the agent does and does not do.
2. **Destructive operation guard**: Require confirmation before deleting files, dropping tables, or force-pushing.
3. **Secret protection**: Never commit, log, or display credentials, tokens, or API keys.
4. **Output limits**: Maximum number of findings, tasks, or changes per invocation to prevent runaway behavior.

## Agent Delegation Patterns

### Linear Handoff
```
Planner -> TDD Guide -> Code Reviewer
```
The Planner produces a task list. The TDD Guide implements each task. The Code Reviewer validates the result.

### Fan-Out
```
Architect -> [TDD Guide, Security Reviewer, Performance Optimizer]
```
The Architect produces a design. Multiple specialist agents review different aspects in parallel.

### Escalation
```
Code Reviewer -> Security Reviewer (when vulnerability found)
Code Reviewer -> Architect (when architectural concern found)
```
The primary agent escalates to a specialist when it detects an issue outside its expertise.

### Key Rule

Agents do not share memory. Each delegation is a clean handoff where the output of agent A becomes the input of agent B. This prevents context contamination and keeps each agent's reasoning focused.
