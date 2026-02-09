# Setup Guide

## Prerequisites

- Node.js 18+ (for scripts and validation)
- GitHub Copilot subscription (Individual, Business, or Enterprise)
- VS Code with GitHub Copilot extension, or GitHub Copilot CLI

## Installation

### Option 1: Copy to Existing Project

Copy the `.copilot/` directory to your project root:

```bash
cp -r everything-copilot/.copilot /path/to/your-project/
```

GitHub Copilot automatically reads `.copilot/AGENTS.md` and `.copilot/skills/` from the repository root.

### Option 2: Use the Init Script

```bash
cd everything-copilot
npm run init -- --target /path/to/your-project
```

This copies the core configuration and prompts you for customization options.

### Option 3: Fork and Customize

1. Fork this repository
2. Modify `.copilot/AGENTS.md` for your team's needs
3. Add domain-specific skills to `.copilot/skills/`
4. Push to your organization

## Verification

After setup, verify the configuration:

```bash
# Validate agent definitions
npm run validate:agents

# Validate skill definitions
npm run validate:skills

# Run the test suite
npm test
```

## VS Code Setup

1. Install the GitHub Copilot extension
2. Enable Copilot Agent Mode (if available)
3. Open your project with the `.copilot/` directory
4. Copilot will automatically load agents and skills

## CLI Setup

GitHub Copilot CLI reads the same `.copilot/` configuration:

```bash
# Use with Copilot CLI
gh copilot suggest "implement the feature described in issue #42"
```

## MCP Server Setup

To enable MCP integrations:

1. Copy `mcp-configs/mcp-servers.json` to your project
2. Configure API keys for the services you use
3. See [MCP Integration Guide](docs/MCP_INTEGRATION.md) for details

## Team Setup

For team-wide configuration:

1. Add `.copilot/` to your repository
2. Customize `AGENTS.md` for your team's workflow
3. Add team-specific skills
4. See `examples/team-configs/` for templates

## Troubleshooting

**Copilot doesn't pick up agents**: Ensure `.copilot/AGENTS.md` is in the repository root (not a subdirectory).

**Skills not loading**: Check that each skill directory has a `SKILL.md` manifest file.

**Scripts fail**: Ensure Node.js 18+ is installed. Run `node --version` to check.

**MCP tools not available**: Verify MCP server configuration and API keys. See `mcp-configs/` for setup guides.
