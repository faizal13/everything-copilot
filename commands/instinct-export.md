# /instinct-export

## Overview

The Instinct Export command writes all learned instincts from the local store to a shareable JSON file. This enables distributing patterns to team members, backing up instincts before major changes, and seeding new projects with established conventions.

## Usage

```
/instinct-export <file>
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `file` | Yes | Output file path for the exported JSON (e.g., `team-instincts.json`) |

## Prerequisites

- An instinct store with at least one entry (defaults to `.copilot/instincts/`).
- Write access to the target file location.

## Workflow Steps

1. **Load Instincts** -- Read all instincts from the local store. Validate each entry for completeness.
2. **Filter and Sort** -- Optionally exclude dormant instincts (confidence < 0.5) if the `--active-only` flag is used. Sort by category, then by confidence descending.
3. **Build Export Document** -- Assemble the export JSON with metadata: export timestamp, source project name, instinct count, and the full instinct array.
4. **Write File** -- Save the export document to the specified path. Report the number of instincts exported and the file size.

## Example

```
/instinct-export team-instincts.json
```

**Interaction:**

```
Loading instinct store...
Found 7 instincts (6 active, 1 dormant)

Exporting all 7 instincts...

Written: team-instincts.json
  Instincts: 7
  Categories: 6
  File size: 2.1 KB

Export contents:
  code-style (2): prefer-early-return, css-module-naming
  error-handling (1): api-error-logging
  testing (1): test-name-convention
  dependencies (1): date-fns-v3-imports
  frontend (1): form-validation-order
  backend (1): db-transaction-scope
```

## Output Format

The export file is structured as:

```json
{
  "exported_at": "2025-01-15T14:00:00Z",
  "source_project": "my-project",
  "instinct_count": 7,
  "instincts": [
    {
      "name": "prefer-early-return",
      "description": "Use early returns instead of deep nesting in conditionals",
      "category": "code-style",
      "confidence": 0.92,
      "source_session": "2025-01-15T10:30:00Z",
      "last_used": "2025-01-15T10:30:00Z"
    }
  ]
}
```

The command output shows:

- Store loading summary with active/dormant counts.
- Written file path, instinct count, category count, and file size.
- Category-grouped listing of exported instinct names.

## Notes

- By default, all instincts are exported including dormant ones. Use `--active-only` to exclude low-confidence patterns.
- The export format is compatible with `/instinct-import` on any project.
- Export files are plain JSON and can be version-controlled, shared via chat, or stored in a team repository.
- Consider exporting before running `/evolve`, which may reorganize instincts into skills.
- For large teams, maintain a shared instinct file in a central repository that team members import periodically.
- The file is human-readable and can be manually edited if needed.
