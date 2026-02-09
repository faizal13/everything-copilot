# Contributing to Everything Copilot

## How to Contribute

### Adding a New Agent

1. Create the agent documentation in `agents/your-agent.md`
2. Add the agent definition to `.copilot/AGENTS.md`
3. Document any required skills
4. Add tests if the agent requires scripts
5. Submit a PR with a clear description of the agent's purpose

### Adding a New Skill

1. Create a directory in `.copilot/skills/your-skill/`
2. Add a `SKILL.md` manifest with: name, description, trigger conditions, and file list
3. Add supporting markdown files for the skill's knowledge
4. Run `npm run validate:skills` to verify
5. Submit a PR

### Adding a New Command

1. Create documentation in `commands/your-command.md`
2. Include: purpose, usage, prerequisites, workflow steps, and examples
3. Update `commands/README.md` with the new command
4. Submit a PR

### Improving Documentation

- Fix typos, clarify instructions, add examples
- Keep guides concise and actionable
- Test any code examples before submitting

## Code Standards

- Scripts are written in Node.js (ESM or CommonJS)
- No external dependencies unless absolutely necessary
- All scripts must have corresponding tests
- Use `node:` prefix for built-in modules

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run validation: `npm run validate:agents && npm run validate:skills`
6. Submit a PR with a clear title and description

## Reporting Issues

Use GitHub Issues with the appropriate template:
- **Agent Task**: Request a new agent or agent improvement
- **Skill Request**: Request a new skill module

## Code of Conduct

Be respectful, constructive, and collaborative. Focus on improving the toolkit for everyone.
