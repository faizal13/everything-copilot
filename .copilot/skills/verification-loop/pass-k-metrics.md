# Pass@k Metrics

## What Pass@k Measures

Pass@k is the probability that at least one of k generated solutions is correct. It answers: "If the agent tries k times, what's the chance it succeeds at least once?"

## Formula

Given n total samples and c correct samples:

```
pass@k = 1 - C(n-c, k) / C(n, k)
```

Where `C(a, b)` is the binomial coefficient "a choose b".

**Simplified:** If you generate k independent solutions, each with success probability p:
```
pass@k = 1 - (1-p)^k
```

## Practical Examples

| pass@1 | pass@5 | pass@10 | Interpretation |
|--------|--------|---------|---------------|
| 90% | 99.99% | ~100% | Highly reliable — use pass@1 |
| 60% | 98.9% | 99.99% | Reliable with retries |
| 30% | 83.2% | 97.2% | Needs multiple attempts |
| 10% | 40.9% | 65.1% | Unreliable — improve prompt/approach |

## Measuring Pass@k for Agent Tasks

1. Define success criteria (tests pass, no lint errors, correct output)
2. Run the agent on the same task k times independently
3. Evaluate each result against the success criteria
4. Calculate pass@k

```js
function calculatePassAtK(n, c, k) {
  if (n - c < k) return 1.0;
  let result = 1.0;
  for (let i = 0; i < k; i++) {
    result *= (n - c - i) / (n - i);
  }
  return 1.0 - result;
}

// Example: 10 attempts, 7 correct, pass@1 and pass@3
console.log(calculatePassAtK(10, 7, 1)); // 0.70
console.log(calculatePassAtK(10, 7, 3)); // 0.97
```

## Confidence Intervals

For small sample sizes, calculate confidence bounds:

- **n < 10**: Results are noisy, report range not point estimate
- **n = 10-30**: Reasonable estimates, report 95% CI
- **n > 30**: Reliable estimates

Use Wilson score interval for proportions:
```
p̂ ± z * sqrt(p̂(1-p̂)/n + z²/(4n²)) / (1 + z²/n)
```

## Retry Strategies Based on Pass@k

| pass@1 | Strategy |
|--------|----------|
| ≥ 90% | Single attempt, auto-accept result |
| 60-89% | Try once, retry on failure with modified prompt |
| 30-59% | Try up to 3 times, escalate if all fail |
| < 30% | Don't retry — the approach needs fundamental change |

## Tracking Over Time

Track pass@k per task category:

```json
{
  "task_category": "bug_fix",
  "pass@1": 0.82,
  "pass@3": 0.99,
  "samples": 50,
  "trend": "improving",
  "last_updated": "2024-01-15"
}
```

**Actionable insights:**
- pass@1 declining → Check if prompts degraded or task complexity increased
- pass@1 improving → Skills or context engineering is working
- pass@k ≫ pass@1 → Inconsistent agent, consider more structured prompts

## Checklist
- [ ] Success criteria defined before measuring pass@k
- [ ] Minimum 10 samples per task category for reliable estimates
- [ ] pass@k tracked per task category (not globally)
- [ ] Retry strategy aligned with pass@k scores
- [ ] Trends monitored over time for degradation
- [ ] Low pass@1 categories investigated for root cause
