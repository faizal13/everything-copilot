# Evolving Instincts to Skills

## Cluster Readiness Criteria

A cluster is ready for evolution when:
- **3+ instincts** in the cluster
- **Average confidence ≥ 0.7**
- **Coherent theme** — all instincts relate to the same domain
- **No conflicting** instincts within the cluster

## Evolution Process

### 1. Select Cluster
```bash
node scripts/instinct-manager.js evolve
# Lists ready clusters and prompts for selection
```

### 2. Generate SKILL.md
Auto-generate a manifest from the cluster:

```markdown
# [Cluster Name] Skill

## Name
[Derived from cluster name]

## Description
[Synthesized from instinct patterns and contexts]

## Trigger Conditions
[Union of all instinct contexts in the cluster]

## Files
- [cluster-name].md — Combined patterns from instincts
```

### 3. Generate Supporting Documents
Merge instinct patterns into structured documentation:

```markdown
# [Cluster Name] Patterns

## [Instinct 1 Name]
**Context:** [from instinct.context]
**Pattern:** [from instinct.pattern]
**Example:** [from instinct.example]

## [Instinct 2 Name]
...
```

### 4. Review and Refine
- Review generated files for accuracy
- Add introduction and connecting text
- Remove redundancy between merged instincts
- Add a checklist section
- Verify trigger conditions are correct

### 5. Install the Skill
```bash
# Move to skills directory
mv generated-skill/ .copilot/skills/[skill-name]/

# Validate
node scripts/validate-skills.js
```

### 6. Archive Source Instincts
Mark evolved instincts as promoted:

```json
{
  "id": "inst-a3f2c4d8",
  "status": "evolved",
  "evolved_to_skill": "api-error-handling",
  "evolved_date": "2024-01-25T10:00:00Z"
}
```

## Version Tracking

Track the lineage from instincts to skills:

```json
{
  "skill": "api-error-handling",
  "version": "1.0.0",
  "evolved_from": ["inst-a3f2c4d8", "inst-b5e1d9a2", "inst-c7f3e6b4", "inst-d8g2h1a5"],
  "evolved_date": "2024-01-25",
  "instinct_count": 4,
  "avg_confidence_at_evolution": 0.72
}
```

## Post-Evolution

After evolving:
1. New instincts in the same domain are compared against the skill first
2. If they add new information → update the skill
3. If they duplicate existing skill content → discard
4. The skill becomes the source of truth for that domain

## Example Walkthrough

```
Input cluster: "react-form-patterns" (4 instincts)
  - form-validation-on-blur (0.85)
  - controlled-vs-uncontrolled (0.80)
  - form-error-display (0.70)
  - form-submit-loading-state (0.75)

Output skill: .copilot/skills/react-form-patterns/
  - SKILL.md (manifest)
  - react-form-patterns.md (merged patterns with examples)

Instincts archived with status: "evolved"
```
