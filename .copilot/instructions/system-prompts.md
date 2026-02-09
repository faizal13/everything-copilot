# System Prompts (Context Files)

Context files are dynamic system prompts that prime the agent for specific modes of work. They live in the `contexts/` directory and set the agent's mindset, priorities, and workflow for different tasks.

## Available Contexts

### `dev.md` - Development Mode
Use when you need the agent to write code. Activates an implementation-first mindset with TDD, frequent commits, and minimal changes. The agent will follow existing patterns, run tests, and ask for clarification on ambiguous requirements.

**When to use:** Feature implementation, bug fixes, refactoring, adding tests.

### `review.md` - Code Review Mode
Use when you need the agent to review code changes. Activates a critical analysis mindset with severity-labeled feedback (critical, warning, suggestion, nitpick). The agent will check correctness, security, test coverage, and performance.

**When to use:** Pull request reviews, code audits, pre-merge checks.

### `research.md` - Research Mode
Use when you need the agent to investigate a problem or evaluate options. Activates an exploratory mindset focused on gathering evidence and presenting structured analysis. The agent will not modify code unless explicitly asked.

**When to use:** Architecture decisions, technology evaluation, debugging complex issues, understanding unfamiliar code.

## How to Switch Contexts

Load a context by referencing it at the start of a conversation or task:

```
Use the dev context for this task.
```

```
Switch to review mode and look at the recent changes.
```

```
Research mode: investigate how we handle authentication.
```

## Creating Custom Contexts

To create a new context, add a markdown file to `contexts/` following this structure:

1. **Title and role statement** - One sentence defining what the agent does in this mode.
2. **Mindset** - Core principles that guide decisions.
3. **Workflow** - Step-by-step process the agent should follow.
4. **What to avoid** - Explicit anti-patterns to prevent.
5. **Output format** (optional) - How to structure responses.

### Guidelines for Custom Contexts
- Keep each context file between 40 and 80 lines.
- Use imperative language ("Do X", not "You should consider doing X").
- Be specific about priorities. Vague instructions lead to inconsistent behavior.
- Include checklists where applicable. They are easy to follow and verify.
- Do not duplicate content from skills or instructions. Reference them instead.
- Test a new context by running it against a real task before sharing it.

## Context vs. Skills vs. Instructions

| Concept | Purpose | Location | When loaded |
|---------|---------|----------|-------------|
| **Context** | Sets the agent's mode and mindset | `contexts/` | Start of task |
| **Skill** | Provides domain knowledge and rules | `.copilot/skills/` | When relevant files are touched |
| **Instruction** | Defines persistent coding standards | `.copilot/instructions/` | Always active |

Contexts are ephemeral (per-task). Instructions are persistent (always apply). Skills are conditional (triggered by file patterns or topics).
