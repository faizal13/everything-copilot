# /evolve

## Overview

The Evolve command analyzes the instinct store and clusters related patterns into formal skills. It groups instincts by similarity, identifies coherent themes, generates skill candidates, and creates structured skill documents from the most promising clusters. This is the bridge between ad-hoc learned patterns and reusable, codified skills.

**Model:** Sonnet 4.5

## Usage

```
/evolve
```

**Arguments:**

This command takes no arguments. It operates on the entire instinct store.

## Prerequisites

- An instinct store with at least 5 instincts (more instincts produce better clusters).
- Active instincts (confidence >= 0.5) are prioritized; dormant instincts are included but weighted lower.
- Write access to `.copilot/skills/` for creating new skill directories.

## Workflow Steps

1. **Load All Instincts** -- Read the full instinct store and prepare each pattern with its metadata: name, description, category, confidence, and usage history.
2. **Cluster by Similarity** -- Group instincts that share categories, overlapping descriptions, or complementary behaviors. Use semantic similarity on descriptions and co-occurrence in sessions as clustering signals.
3. **Generate Skill Candidates** -- For each cluster with three or more instincts, propose a skill candidate. Name it, describe its purpose, and list the constituent instincts.
4. **Create Formal Skill** -- For accepted candidates, generate a full skill directory under `.copilot/skills/` with a `SKILL.md` file, any template files, and verification criteria derived from the combined instincts.

## Example

```
/evolve
```

**Interaction:**

```
Loading instinct store... 14 instincts (12 active, 2 dormant)

Clustering by similarity...

Cluster 1: "error-handling-patterns" (4 instincts, avg confidence: 0.84)
  - api-error-logging (0.85)
  - consistent-error-codes (0.88)
  - db-error-wrapping (0.80)
  - retry-transient-errors (0.82)

Cluster 2: "test-conventions" (3 instincts, avg confidence: 0.79)
  - test-name-convention (0.78)
  - test-fixture-setup (0.82)
  - mock-external-services (0.76)

Cluster 3: "code-style" (2 instincts) -- too small, skipped

Skill candidates:
  1. error-handling-patterns (STRONG - 4 instincts, high confidence)
  2. test-conventions (GOOD - 3 instincts, moderate confidence)

Creating skills...

Created: .copilot/skills/error-handling-patterns/
  SKILL.md (trigger, steps, verification)
  Source instincts: 4 (marked as evolved)

Created: .copilot/skills/test-conventions/
  SKILL.md (trigger, steps, verification)
  Source instincts: 3 (marked as evolved)

Summary:
  Clusters found: 3
  Skills created: 2
  Instincts evolved: 7
  Instincts remaining: 7
```

## Output Format

The command outputs:

- Instinct store loading summary.
- Each cluster with its name, instinct count, average confidence, and member list.
- Clusters too small to form skills are noted and skipped.
- Skill candidates with strength assessment (strong, good, weak).
- Created skill directory paths and contents.
- Summary with cluster, skill, and instinct counts.

## Notes

- Evolved instincts are marked in the store but not removed. They continue to exist independently and can still gain confidence.
- Clusters need at least three instincts to qualify as a skill candidate. Smaller groups remain as individual instincts.
- The command is idempotent -- running it again with the same instincts will not create duplicate skills.
- New instincts added after evolving may form new clusters or strengthen existing skills on the next run.
- Skills created by `/evolve` follow the same format as those created by `/skill-create` and are loaded by all other commands.
- For best results, run `/learn` regularly to build up the instinct store, then `/evolve` periodically to consolidate.
