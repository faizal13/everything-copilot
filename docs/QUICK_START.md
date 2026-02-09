# Quick Start Guide

Get Everything Copilot running in your project in under 5 minutes.

## Prerequisites

- VS Code with the GitHub Copilot extension installed
- A GitHub Copilot subscription (Individual, Business, or Enterprise)
- Node.js 18+ (only needed for validation scripts)

## Step 1: Copy the Configuration

Clone the repository and copy `.copilot/` into your project root:

```bash
git clone https://github.com/your-org/everything-copilot.git
cp -r everything-copilot/.copilot /path/to/your-project/
```

That single directory is all Copilot needs. It contains agent definitions, skills, and instructions that Copilot loads automatically.

## Step 2: Open in VS Code

Open your project in VS Code. Copilot reads `.copilot/` from the workspace root on startup. No extension settings or configuration files need to change.

If you are using Copilot Chat with agent mode enabled, the agents and skills are available immediately.

## Step 3: Try Your First Command

Open Copilot Chat and invoke a command:

```
/plan Add user authentication with JWT tokens
```

Copilot will activate the Planner Agent, scan your codebase for context, and produce a structured implementation plan with tasks, dependencies, and acceptance criteria.

Other commands to try:

```
/tdd src/services/auth-service
/code-review src/api/handler.ts
/build-fix
```

## Step 4: Customize for Your Project

**Add domain-specific skills.** Create a directory in `.copilot/skills/` with a `SKILL.md` manifest:

```bash
mkdir -p .copilot/skills/your-domain
```

See [SKILLS_GUIDE.md](SKILLS_GUIDE.md) for the full manifest format.

**Adjust agent behavior.** Edit `.copilot/AGENTS.md` to modify agent responsibilities, model preferences, or tool access.

**Add context modes.** Drop a markdown file into `contexts/` to create a new context mode (e.g., `debug.md`, `deploy.md`).

## Verify It Works

Run these checks to confirm the setup is correct:

**1. Copilot recognizes agents.** Open Copilot Chat and ask:
```
What agents are available?
```
Copilot should list agents defined in `.copilot/AGENTS.md`.

**2. Skills load on trigger.** Open a source file (e.g., a `.ts` file) and ask Copilot to review it. The coding-standards skill should activate and reference TypeScript conventions.

**3. Validation scripts pass.** If you have Node.js installed:
```bash
cd everything-copilot
npm run validate:agents
npm run validate:skills
```

Both commands should report zero errors.

**4. Commands produce structured output.** Run `/plan` with a simple feature description. The output should contain numbered tasks with acceptance criteria, not freeform prose.

## Next Steps

| Goal | Guide |
|------|-------|
| Understand the system architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Configure agents | [AGENTS_GUIDE.md](AGENTS_GUIDE.md) |
| Create custom skills | [SKILLS_GUIDE.md](SKILLS_GUIDE.md) |
| Browse all commands | [COMMANDS_REFERENCE.md](COMMANDS_REFERENCE.md) |
| Set up MCP integrations | [MCP_INTEGRATION.md](MCP_INTEGRATION.md) |
| Migrate from Claude Code | [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) |
