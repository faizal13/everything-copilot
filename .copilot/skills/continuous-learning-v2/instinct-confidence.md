# Instinct Confidence Scoring

## Initial Assignment

New instincts start at 0.5 (neutral). Adjust based on extraction context:

| Context | Initial Confidence |
|---------|-------------------|
| Explicit user correction ("always do X") | 0.7 |
| Repeated pattern observed (3+ times) | 0.6 |
| Novel solution (first time) | 0.5 |
| Uncertain or experimental approach | 0.3 |

## Confidence Growth

Confidence increases on successful use (pattern applied and not reverted):

```
new_confidence = min(0.95, current + 0.05)
```

Growth is linear with a hard cap at 0.95. No instinct should reach 1.0 — always allow room for refinement.

## Confidence Decay

Unused instincts lose confidence over time:

```
days_since_last_use = (now - lastUsed) / (24 * 60 * 60 * 1000)
weeks_unused = floor(days_since_last_use / 7)
decay = weeks_unused * 0.01
new_confidence = max(0.1, current - decay)
```

**Minimum floor:** 0.1 (never reaches 0 — archived instead)

## Decay Exemptions

Some instincts shouldn't decay even if unused:
- Manually pinned by user (`"pinned": true`)
- Part of a formal skill (already promoted)
- Security-related instincts (rare but critical when triggered)

## Action Thresholds

| Confidence | Agent Behavior |
|------------|---------------|
| 0.0 - 0.2 | Archive candidate — don't suggest |
| 0.2 - 0.5 | Suggest only when explicitly relevant |
| 0.5 - 0.7 | Suggest proactively when context matches |
| 0.7 - 0.9 | Apply automatically, mention in output |
| 0.9 - 0.95 | Apply automatically, candidate for skill promotion |

## Confidence Calibration

Periodically validate predictions:

1. Track cases where an instinct was suggested but rejected by user
2. If rejection rate > 30%, reduce confidence by 0.1
3. If instinct contradicts a later decision, reduce by 0.15
4. Log calibration events for review

```json
{
  "instinct_id": "inst-a3f2c4d8",
  "event": "rejected_by_user",
  "previous_confidence": 0.75,
  "new_confidence": 0.65,
  "reason": "Pattern doesn't apply to async context",
  "timestamp": "2024-01-20T14:15:00Z"
}
```

## Context-Dependent Confidence

A pattern might be highly reliable in one domain but untested in another:

```json
{
  "name": "retry-with-backoff",
  "confidence_by_context": {
    "api-calls": 0.9,
    "database-queries": 0.6,
    "file-operations": 0.3
  }
}
```

Default to the base confidence when context doesn't match any known domain.
