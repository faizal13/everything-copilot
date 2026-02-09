# /setup-pm

## Overview

The Setup Package Manager command detects the project type and configures the appropriate package manager. It identifies available options, lets the user choose, and sets up the lockfile, scripts, and any workspace configuration needed for a consistent development environment.

**Model:** Haiku 4.5

## Usage

```
/setup-pm
```

**Arguments:**

This command takes no arguments. It auto-detects the project type and presents options interactively.

## Prerequisites

- A project directory with at least one manifest file (`package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, etc.).
- The desired package manager binary should be installed on the system or installable via standard channels.

## Workflow Steps

1. **Detect Project Type** -- Scan the project root for manifest files and configuration to determine the ecosystem (Node.js, Go, Rust, Python, etc.) and any existing package manager signals (lockfiles, `.npmrc`, `volta` config).
2. **Identify Available Package Managers** -- List compatible package managers installed on the system. For Node.js, this includes npm, yarn (classic/berry), pnpm, and bun. For Python: pip, poetry, uv. For other ecosystems: the standard toolchain.
3. **Let User Choose** -- Present the available options with pros and cons for the detected project. Highlight the recommended option based on project size, monorepo structure, and existing configuration.
4. **Configure Lockfile and Scripts** -- Initialize the selected package manager, generate the lockfile, configure scripts, set up workspace definitions if applicable, and add the appropriate entries to `.gitignore`.

## Example

```
/setup-pm
```

**Interaction:**

```
Detected: Node.js project (monorepo with 3 packages)
Existing signals: yarn.lock found, no .npmrc

Available package managers:
  1. npm    (v10.2.0) - Default, wide compatibility
  2. yarn   (v4.1.0)  - Already in use, Plug'n'Play support
  3. pnpm   (v8.15.0) - Fast, strict, excellent monorepo support [RECOMMENDED]
  4. bun    (v1.0.25) - Fastest install, newer ecosystem

Recommendation: pnpm (best monorepo support for your workspace structure)

> User selects: 3 (pnpm)

Configuring pnpm...
- Created pnpm-workspace.yaml with 3 packages
- Generated pnpm-lock.yaml
- Updated package.json scripts to use pnpm
- Added node_modules to .gitignore
- Removed stale yarn.lock

Setup complete. Run `pnpm install` to verify.
```

## Output Format

The command outputs:

- Detection results: project type, existing signals, and workspace structure.
- Numbered list of available package managers with versions and brief descriptions.
- A recommendation with reasoning.
- After selection: a list of actions taken (files created, updated, removed).
- A final verification command to run.

## Notes

- Existing lockfiles from a different package manager will be removed after confirmation.
- For monorepos, workspace configuration is generated automatically based on detected package locations.
- The command respects `.nvmrc`, `.node-version`, and Volta configuration for Node.js version constraints.
- Running `/setup-pm` in an already-configured project will offer to reconfigure or validate the current setup.
- This command pairs well with `/build-fix` when dependency issues are the root cause of build failures.
