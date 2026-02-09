# /build-fix

## Overview

The Build Fix command diagnoses and resolves build errors automatically. It runs the project build, parses error output, identifies root causes, applies targeted fixes, and re-runs the build to confirm the errors are resolved. This command handles compilation errors, missing dependencies, configuration issues, and type errors.

**Model:** Sonnet 4.5

## Usage

```
/build-fix
```

**Arguments:**

This command takes no arguments. It detects the build system and configuration automatically.

## Prerequisites

- A configured build system (npm/yarn/pnpm scripts, Makefile, go build, cargo build, etc.).
- The project must have a recognizable build command in `package.json`, `Makefile`, `Cargo.toml`, or equivalent.
- Source files must be present and version-controlled so fixes can be reviewed.

## Workflow Steps

1. **Run Build** -- Execute the project's build command and capture stdout and stderr output. Detect the build tool from project configuration files.
2. **Parse Errors** -- Extract structured error information: file path, line number, error code, and error message. Group related errors that share a root cause.
3. **Identify Root Cause** -- Analyze error patterns to determine the underlying issue. Common causes include missing imports, type mismatches, stale dependencies, and configuration drift.
4. **Apply Fix** -- Make the minimum change required to resolve each root cause. Changes may include adding imports, updating types, installing packages, or fixing configuration files.
5. **Re-run Build** -- Execute the build again to verify all errors are resolved. If new errors surface, repeat from step 2 for up to three additional cycles.

## Example

```
/build-fix
```

**Interaction:**

```
Detected build system: npm (TypeScript)
Running: npm run build

Build failed with 3 errors:

Error 1: src/utils/format.ts(12,5)
  TS2307: Cannot find module 'date-fns/format'
  Root cause: date-fns v3 changed import paths
  Fix: Update import to 'date-fns' (named export)

Error 2: src/api/handler.ts(45,18)
  TS2345: Argument of type 'string' is not assignable to 'number'
  Root cause: API response type changed in recent commit
  Fix: Add parseInt() conversion at line 45

Error 3: src/api/handler.ts(52,3)
  TS2339: Property 'status' does not exist on type 'Response'
  Root cause: Same type change as Error 2
  Fix: Update Response interface in src/types/api.ts

Applied 3 fixes across 3 files.
Re-running build... SUCCESS
```

## Output Format

The command reports each cycle as:

- Build command executed and result (pass/fail with error count).
- For each error group: file location, error message, root cause analysis, and fix applied.
- Final build result confirming success or listing remaining unresolved errors.

```
Build Cycle 1: FAILED (3 errors)
  Fixed: 3 root causes across 3 files
Build Cycle 2: PASSED
```

## Notes

- The command will not apply fixes that change public API behavior without confirmation.
- A maximum of four build cycles are attempted before stopping to prevent infinite loops.
- Dependency installation (e.g., `npm install`) is performed automatically when missing packages are detected.
- All changes are made to the working tree and are not committed -- review them before committing.
- For Go-specific build errors, prefer `/go-build` which handles module and dependency resolution natively.
