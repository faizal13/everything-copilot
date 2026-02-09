# Context Refinement

## Funnel Approach

Start broad, narrow iteratively:

```
Pass 1: Directory structure scan (what exists?)
Pass 2: File identification via grep/search (which files are relevant?)
Pass 3: Deep read of key files (what does the code do?)
Pass 4: Cross-reference (how do components connect?)
```

## Context Window Budget

Allocate tokens across content types:

| Content Type | Budget | Priority |
|-------------|--------|----------|
| Source code under active work | 50% | Critical |
| Tests for active code | 20% | High |
| Related modules / dependencies | 15% | Medium |
| Documentation / comments | 10% | Low |
| Configuration / build files | 5% | Low |

## Pass 1: Structure Scan

```bash
# Get directory tree (depth-limited)
tree -L 3 -I 'node_modules|.git|dist|build'

# Or: list directories
find . -type d -maxdepth 3 | grep -v node_modules | sort
```

**Goal:** Understand the project layout. Takes ~100 tokens.

## Pass 2: File Identification

```bash
# Search for relevant files by keyword
grep -rl "authentication" src/ --include='*.ts'

# Search for specific patterns
grep -rn "class.*Controller" src/ --include='*.ts'

# Find by naming convention
find src/ -name "*auth*" -o -name "*login*" -o -name "*session*"
```

**Goal:** Narrow to 5-15 relevant files. Takes ~500 tokens.

## Pass 3: Deep Read

Read the most relevant files fully. Prioritize:
1. Entry points (routes, handlers, controllers)
2. Core logic (services, models, utilities)
3. Tests (understand expected behavior)
4. Types/interfaces (understand contracts)

**Goal:** Understand the code's behavior. Takes ~2000-5000 tokens.

## Pass 4: Cross-Reference

Trace connections between components:
- Who calls this function? (`grep -rn "functionName("`)
- What does this import? (read import statements)
- What tests cover this? (find corresponding test file)
- What config affects this? (search for env vars, feature flags)

## When to Stop Refining

Stop when:
- You can answer the original question with confidence
- Further search returns no new relevant information
- You've read 15+ files (diminishing returns — time to act)
- The remaining uncertainty is acceptable for the task

## Relevance Scoring

When search returns many results, rank by:
1. **Direct match** — File name contains the keyword → highest
2. **Import proximity** — File imports/is imported by known-relevant files → high
3. **Test coverage** — File has a corresponding test → medium (more important)
4. **Recency** — Recently modified files → higher for bug investigations
5. **File size** — Smaller focused files → higher (less noise)
