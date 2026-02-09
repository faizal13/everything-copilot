# Grading Rubric

## Quality Dimensions

Grade agent output across five dimensions, each scored 1-5:

### 1. Correctness (Does it work?)
| Score | Criteria |
|-------|---------|
| 5 | All tests pass, handles all edge cases, no bugs |
| 4 | All tests pass, minor edge cases missed |
| 3 | Most tests pass, some edge cases cause failures |
| 2 | Core functionality works but significant bugs |
| 1 | Does not work, tests fail, fundamental errors |

### 2. Completeness (Does it cover the requirements?)
| Score | Criteria |
|-------|---------|
| 5 | All requirements met, plus helpful extras |
| 4 | All requirements met |
| 3 | Most requirements met, some gaps |
| 2 | Only partial requirements met |
| 1 | Requirements not addressed |

### 3. Code Quality (Is it maintainable?)
| Score | Criteria |
|-------|---------|
| 5 | Clean, readable, follows conventions, excellent naming, well-structured |
| 4 | Good readability, follows conventions, minor style issues |
| 3 | Readable but some conventions broken, adequate naming |
| 2 | Hard to read, poor naming, inconsistent style |
| 1 | Unreadable, no structure, terrible naming |

### 4. Performance (Is it efficient?)
| Score | Criteria |
|-------|---------|
| 5 | Optimal algorithms, no unnecessary work, well-cached |
| 4 | Good performance, minor optimization opportunities |
| 3 | Acceptable performance, some unnecessary work |
| 2 | Noticeable performance issues, N+1 queries, redundant computation |
| 1 | Severe performance problems, blocking operations, memory leaks |

### 5. Security (Is it safe?)
| Score | Criteria |
|-------|---------|
| 5 | No vulnerabilities, input validated, output encoded, secrets managed |
| 4 | No known vulnerabilities, most inputs validated |
| 3 | Minor security gaps (missing input validation on non-critical paths) |
| 2 | Security vulnerabilities present (XSS, SQL injection potential) |
| 1 | Critical security flaws (exposed secrets, no auth, injection) |

## Automated Grading Criteria

Map measurable signals to dimension scores:

```json
{
  "correctness": {
    "tests_pass_rate": { ">=0.95": 5, ">=0.85": 4, ">=0.70": 3, ">=0.50": 2, "<0.50": 1 }
  },
  "code_quality": {
    "lint_errors": { "0": 5, "<=2": 4, "<=5": 3, "<=10": 2, ">10": 1 },
    "type_errors": { "0": 5, "<=1": 4, "<=3": 3, ">3": 2 }
  },
  "security": {
    "vulnerabilities": { "0_critical_0_high": 5, "0_critical": 4, "<=1_high": 3, ">1_high": 2 }
  }
}
```

## Human Review Triggers

Escalate to human review when:
- Any dimension scores ≤ 2
- Overall average score < 3.0
- Security dimension scores ≤ 3
- Automated grading confidence is low (conflicting signals)
- Task is in a critical path (auth, payment, data migration)

## Task-Specific Rubrics

### Bug Fix
- **Correctness weight: 2x** — The fix must actually fix the bug
- **Regression check** — No new tests broken
- **Root cause** — Fix addresses root cause, not just symptom

### Feature Implementation
- **Completeness weight: 2x** — All acceptance criteria met
- **Test coverage** — New code has ≥ 80% coverage
- **Documentation** — API docs updated if applicable

### Refactoring
- **Code Quality weight: 2x** — Measurable improvement in complexity/readability
- **Correctness** — All existing tests still pass (zero regressions)
- **Performance** — No performance degradation

## Overall Score

```
overall = (correctness * w1 + completeness * w2 + quality * w3 + performance * w4 + security * w5) / sum(weights)
```

Default weights: `[2, 2, 1.5, 1, 1.5]` — correctness and completeness matter most.

| Overall | Verdict |
|---------|---------|
| ≥ 4.5 | Excellent — auto-approve |
| 3.5-4.4 | Good — minor review needed |
| 2.5-3.4 | Needs improvement — detailed review required |
| < 2.5 | Reject — rework needed |

## Checklist
- [ ] Rubric defined before work begins (not after)
- [ ] All five dimensions scored
- [ ] Automated signals mapped to scores where possible
- [ ] Human review triggered for low scores or critical tasks
- [ ] Task-specific weights applied (bug fix vs feature vs refactor)
- [ ] Overall score calculated and tracked over time
