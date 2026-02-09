# /instinct-import

## Overview

The Instinct Import command loads learned patterns from an external JSON or YAML file into the local instinct store. This enables sharing patterns across team members, bootstrapping new projects with established conventions, and restoring instincts from backups.

## Usage

```
/instinct-import <file>
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `file` | Yes | Path to a JSON or YAML file containing instinct definitions |

## Prerequisites

- The import file must be valid JSON or YAML matching the instinct schema.
- Write access to the instinct store (defaults to `.copilot/instincts/`).
- The instinct store directory must exist or be creatable.

## Workflow Steps

1. **Read Import File** -- Load and parse the specified file. Validate that each entry contains the required fields: name, description, category, and confidence.
2. **Check for Conflicts** -- Compare imported instincts against existing ones in the store. Identify duplicates by name.
3. **Resolve Duplicates** -- For matching names, merge by averaging confidence scores (weighted toward the higher value). Update the description if the imported version is newer.
4. **Write to Store** -- Save all new and merged instincts to the instinct store. Report what was added, merged, and skipped.

## Example

```
/instinct-import team-instincts.json
```

**Interaction:**

```
Reading: team-instincts.json
Found 12 instincts in file.

Conflict check:
  3 new instincts (not in local store)
  2 duplicates (will merge confidence scores)
  7 already present with higher confidence (skipped)

Importing...
  Added: consistent-error-codes (0.88)
  Added: api-versioning-header (0.76)
  Added: db-index-convention (0.71)
  Merged: prefer-early-return (0.92 -> 0.93)
  Merged: test-name-convention (0.78 -> 0.80)
  Skipped: 7 (local confidence higher)

Import complete: 3 added, 2 merged, 7 skipped
Total instincts in store: 10
```

## Output Format

The command outputs:

- Source file path and number of instincts found.
- Conflict analysis: new, duplicate, and skippable counts.
- Per-instinct action: added (with score), merged (with old/new score), or skipped (with reason).
- Summary line with counts per action.
- Updated total instinct count.

**Import File Schema (JSON):**

```json
{
  "instincts": [
    {
      "name": "consistent-error-codes",
      "description": "Use numeric error codes from the shared error catalog",
      "category": "error-handling",
      "confidence": 0.88,
      "source_session": "2025-01-10T09:00:00Z"
    }
  ],
  "exported_at": "2025-01-15T12:00:00Z",
  "source_project": "my-api"
}
```

## Notes

- Imported instincts retain their original confidence scores unless merged with a local duplicate.
- The merge strategy uses a weighted average biased 60/40 toward the higher confidence value.
- YAML files are supported for readability; JSON is the canonical format for machine exchange.
- Import files created by `/instinct-export` are always compatible.
- Use `/instinct-status` after importing to verify the store contents.
- To share instincts, export them first with `/instinct-export` and distribute the file.
