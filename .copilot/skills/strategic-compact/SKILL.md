# Strategic Compact Skill

## Name
Strategic Compact

## Description
Token optimization strategies for managing long sessions. Covers when and how to compact context, what to preserve, and budget management across models.

## Trigger Conditions
- Context window approaching capacity (80%+ used)
- Long sessions (20+ turns)
- Agent showing signs of context loss (repeating, forgetting)
- Explicit compaction request

## Files
- `compaction-suggestions.md` — When and how to trigger compaction
- `token-optimization.md` — Token budget management and estimation
- `context-preservation.md` — What to keep, summarize, or drop

## Model Recommendation
- **Haiku** for token estimation and quick compaction
- **Sonnet** for intelligent summarization decisions
