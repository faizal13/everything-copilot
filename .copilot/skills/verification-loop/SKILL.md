# Verification Loop Skill

## Name
Verification Loop

## Description
Evaluation and validation system for verifying agent output quality through checkpoint evals, continuous monitoring, pass@k metrics, and grading rubrics.

## Trigger Conditions
- Running quality checks or evaluations
- Creating or comparing checkpoints
- Measuring agent reliability (pass@k)
- Grading code or implementation quality
- Post-implementation verification

## Files
- `checkpoint-evals.md` — Save/restore verification state, regression detection
- `continuous-evals.md` — Ongoing validation during development
- `pass-k-metrics.md` — Pass@k calculation, confidence scoring, retry strategies
- `grading-rubric.md` — Quality criteria, automated grading, human review triggers

## Model Recommendation
- **Sonnet** for running evaluations and analyzing results
- **Haiku** for quick checkpoint comparisons
- **Opus** for designing evaluation rubrics
