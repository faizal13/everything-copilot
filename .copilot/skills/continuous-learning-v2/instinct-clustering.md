# Instinct Clustering

## Purpose

Group related instincts to:
- Identify themes (recurring patterns in the same domain)
- Reduce noise (merge near-duplicates)
- Prepare clusters for skill evolution

## Similarity Detection

Compare instincts on three dimensions:

### 1. Category Match
Instincts in the same category are more likely related.

### 2. Tag Overlap
Calculate Jaccard similarity between tag sets:
```
similarity = |A ∩ B| / |A ∪ B|
```
Threshold: ≥ 0.3 (at least 30% tag overlap)

### 3. Name/Pattern Keyword Overlap
Tokenize names and patterns, compare keywords:
```
tokens_a = tokenize("api-error-response-format")  // ["api", "error", "response", "format"]
tokens_b = tokenize("api-validation-error")        // ["api", "validation", "error"]
overlap = 2 / 5 = 0.4
```

## Clustering Algorithm

Simple hierarchical approach (no ML dependencies needed):

```
1. Score similarity between all instinct pairs
2. Group instincts with similarity ≥ 0.4 into clusters
3. Name each cluster by most common category + top keywords
4. Merge single-instinct "clusters" back into unclustered pool
```

## Cluster Quality Metrics

| Metric | Good | Action if Poor |
|--------|------|---------------|
| **Cohesion** (avg intra-cluster similarity) | ≥ 0.5 | Split cluster into subclusters |
| **Size** | 3-10 instincts | Merge tiny clusters, split large ones |
| **Confidence spread** | Similar confidence levels | Flag outliers for review |

## Cluster Naming

Auto-generate from common elements:
```
Cluster: ["api-error-format", "api-validation-response", "api-status-codes", "api-error-logging"]
→ Name: "api-error-handling" (category: code-pattern)
```

## Splitting and Merging

**Split** a cluster when:
- Size exceeds 10 instincts
- Cohesion drops below 0.3
- Two distinct sub-themes are visible

**Merge** clusters when:
- High inter-cluster similarity (> 0.6)
- Combined size is still ≤ 10
- Categories match

## Example Clustering Output

```
Cluster: "api-error-handling" (4 instincts, avg confidence: 0.72)
  - api-error-response-format (0.85)
  - api-validation-error-details (0.75)
  - api-error-status-codes (0.65)
  - api-error-logging-pattern (0.62)
  → READY FOR EVOLUTION (4 instincts, avg confidence > 0.7)

Cluster: "database-query-patterns" (2 instincts, avg confidence: 0.55)
  - query-pagination-pattern (0.60)
  - query-index-hints (0.50)
  → NOT READY (< 3 instincts)

Unclustered: (3 instincts)
  - deployment-checklist (0.45)
  - css-z-index-convention (0.40)
  - git-commit-message-format (0.55)
```

## Visualization

Text-based tree for terminal display:

```
Learned Patterns
├── api-error-handling (4 patterns, confidence: 0.72) ★ READY
│   ├── api-error-response-format (0.85)
│   ├── api-validation-error-details (0.75)
│   ├── api-error-status-codes (0.65)
│   └── api-error-logging-pattern (0.62)
├── database-query-patterns (2 patterns, confidence: 0.55)
│   ├── query-pagination-pattern (0.60)
│   └── query-index-hints (0.50)
└── unclustered (3 patterns)
    ├── deployment-checklist (0.45)
    ├── css-z-index-convention (0.40)
    └── git-commit-message-format (0.55)
```
