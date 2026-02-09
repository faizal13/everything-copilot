# Copilot CLI & Terminal Workflow

## Overview

GitHub Copilot works in both VS Code (GUI) and the terminal (CLI). This guide covers how to use Copilot's agent mode effectively from the command line, including terminal setup, workflow patterns, and integration with shell tools.

## Getting Started

### Prerequisites

- **GitHub Copilot subscription** (Individual, Business, or Enterprise)
- **VS Code** with GitHub Copilot extension installed
- **GitHub CLI** (`gh`) for terminal-based operations

### VS Code Terminal Integration

Copilot Chat in VS Code can execute terminal commands through agent mode:

1. Open the Copilot Chat panel (`Ctrl+Shift+I` / `Cmd+Shift+I`)
2. Select an agent (e.g., `@workspace`)
3. Ask Copilot to run commands — it will execute them in the integrated terminal

### GitHub CLI Copilot Extension

```bash
# Install GitHub CLI
brew install gh       # macOS
sudo apt install gh   # Ubuntu/Debian

# Authenticate
gh auth login

# Install Copilot extension
gh extension install github/gh-copilot

# Use Copilot from terminal
gh copilot suggest "find large files in git history"
gh copilot explain "git rebase -i HEAD~5"
```

## Terminal Workflows

### Workflow 1: Agent-Driven Development

Use Copilot's agent mode to drive the full development cycle from chat:

```
You: "Create a new Express API endpoint for user registration with
     Zod validation, bcrypt password hashing, and Prisma for storage."

Copilot:
  1. Creates src/routes/register.ts
  2. Adds Zod schema for validation
  3. Implements bcrypt hashing
  4. Writes Prisma query
  5. Runs: npm test
  6. Reports: "All tests pass. Endpoint ready at POST /api/register"
```

### Workflow 2: Test-Driven Development

```
You: "/tdd Create a function that validates email addresses"

Copilot:
  1. Creates tests/email-validator.test.ts with test cases
  2. Runs: npm test → RED (tests fail, no implementation)
  3. Creates src/utils/email-validator.ts
  4. Runs: npm test → GREEN (tests pass)
  5. Refactors if needed
  6. Runs: npm test → Still GREEN
  7. Reports results
```

### Workflow 3: Build Error Resolution

```
You: "/build-fix"

Copilot:
  1. Runs: npm run build
  2. Parses error output
  3. Identifies: "TypeScript error TS2345 in src/api/users.ts:42"
  4. Reads the file, understands the type mismatch
  5. Applies fix
  6. Runs: npm run build → Success
  7. Runs: npm test → All pass
  8. Reports fix summary
```

### Workflow 4: Code Review

```
You: "/code-review src/services/auth.ts"

Copilot:
  1. Reads the file
  2. Analyzes for: bugs, security issues, performance, style
  3. Reports findings with severity levels
  4. Suggests specific fixes
  5. Optionally applies fixes with your approval
```

## Command Patterns

### Running Commands Through Copilot

In agent mode, Copilot can execute shell commands:

```
"Run the test suite and show me failures"
"Build the project and fix any TypeScript errors"
"Run the linter and auto-fix what you can"
"Check for security vulnerabilities in dependencies"
```

### Using gh copilot suggest

Get command suggestions for terminal tasks:

```bash
# Get a git command
gh copilot suggest "undo last commit but keep changes"
# → git reset --soft HEAD~1

# Get a shell command
gh copilot suggest "find files modified in the last 24 hours"
# → find . -type f -mtime -1

# Get a GitHub CLI command
gh copilot suggest "create a PR from current branch"
# → gh pr create --fill
```

### Using gh copilot explain

Understand complex commands:

```bash
gh copilot explain "awk '{print $NF}' file.txt"
# → Explains: prints the last field of each line

gh copilot explain "git log --oneline --graph --all --decorate"
# → Explains: shows a visual branch graph of all commits

gh copilot explain "docker run -d -p 3000:3000 --env-file .env app"
# → Explains: runs container in background with port mapping and env file
```

## Shell Integration

### Git Hooks with Copilot

Set up pre-commit hooks that leverage your Copilot configuration:

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Run validation scripts
node scripts/validate-agents.js
node scripts/validate-skills.js

# Run tests
npm test

# Check types
npx tsc --noEmit
```

### npm Scripts

The `package.json` includes scripts that work well from the terminal:

```bash
# Initialize Copilot configuration
npm run init

# Validate agent definitions
npm run validate:agents

# Validate skill configurations
npm run validate:skills

# Run all tests
npm test

# Create a new skill from git history
npm run skill:create -- my-new-skill

# Manage learned instincts
npm run instinct:manage -- status
npm run instinct:manage -- list
npm run instinct:manage -- evolve
```

### Makefile Integration

For teams that prefer `make`:

```makefile
.PHONY: init validate test skill instinct

init:
	node scripts/init-copilot.js

validate: validate-agents validate-skills

validate-agents:
	node scripts/validate-agents.js

validate-skills:
	node scripts/validate-skills.js

test:
	node tests/run-all.js

skill:
	node scripts/skill-creator.js $(name)

instinct:
	node scripts/instinct-manager.js $(cmd)
```

Usage:
```bash
make init
make validate
make test
make skill name=api-patterns
make instinct cmd=status
```

## VS Code Terminal Tips

### Split Terminal for Development

```
┌─────────────────────────────────────────┐
│  Editor (main code)                     │
├─────────────────────┬───────────────────┤
│  Terminal 1          │  Terminal 2       │
│  (test watcher)      │  (dev server)    │
│  npm test -- --watch │  npm run dev     │
└─────────────────────┴───────────────────┘
```

### Useful Keybindings

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| Toggle terminal | `` Ctrl+` `` | `` Ctrl+` `` |
| New terminal | `Ctrl+Shift+`` ` | `Ctrl+Shift+`` ` |
| Split terminal | `Cmd+\` | `Ctrl+\` |
| Open Copilot Chat | `Cmd+Shift+I` | `Ctrl+Shift+I` |
| Focus editor | `Cmd+1` | `Ctrl+1` |
| Focus terminal | `Cmd+J` | `Ctrl+J` |

### Terminal Profiles

Configure VS Code terminal profiles for different workflows:

```json
// .vscode/settings.json
{
  "terminal.integrated.profiles.osx": {
    "dev": {
      "path": "bash",
      "args": ["-c", "npm run dev"],
      "icon": "rocket"
    },
    "test": {
      "path": "bash",
      "args": ["-c", "npm test -- --watch"],
      "icon": "beaker"
    }
  }
}
```

## Agent Mode in Terminal

### How Agent Mode Works

When Copilot operates in agent mode, it can:
- Read and write files
- Execute terminal commands
- Chain multiple operations
- React to command output
- Self-correct on failures

### Effective Agent Prompts

```
# Specific and actionable
"Run npm test, fix any failures, and re-run until all tests pass"

# Multi-step with clear sequence
"1. Create a migration for adding an 'avatar_url' column to users table
 2. Run the migration
 3. Update the User model
 4. Add tests for the new field"

# Contextual
"The build is failing with TypeScript errors. Read the error output,
fix the type issues, and verify the build succeeds."
```

### Agent Mode Constraints

Things agent mode handles well:
- File creation and modification
- Running build/test/lint commands
- Iterating on failures
- Multi-file refactoring

Things to be cautious with:
- Destructive operations (deletions, force pushes)
- Production deployments
- Database migrations on live systems
- Operations requiring interactive input

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `gh copilot` not found | Run `gh extension install github/gh-copilot` |
| Authentication errors | Run `gh auth login` and re-authenticate |
| Copilot not executing commands | Ensure agent mode is enabled in VS Code settings |
| Commands timing out | Break complex tasks into smaller steps |
| Terminal output not captured | Use VS Code integrated terminal, not external |

## Checklist

- [ ] GitHub CLI installed and authenticated
- [ ] gh-copilot extension installed
- [ ] VS Code terminal configured
- [ ] npm scripts working for validation and testing
- [ ] Git hooks set up for pre-commit checks
- [ ] Agent mode enabled in VS Code
- [ ] Team members trained on CLI workflows
