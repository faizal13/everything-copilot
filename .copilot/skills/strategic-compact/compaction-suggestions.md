# Compaction Suggestions

## When to Compact

| Trigger | Confidence | Action |
|---------|-----------|--------|
| Context window > 80% full | High | Compact now |
| Session > 20 turns | Medium | Consider compaction |
| Agent repeats previous answers | High | Context is degraded — compact |
| Agent forgets earlier decisions | High | Critical context lost — compact |
| Switching to a new task area | Medium | Good breakpoint to compact |
| Manual request from user | High | Compact immediately |

## What Triggers Quality Degradation

Signs the agent is losing context:
- Asks about something already discussed
- Proposes a solution that was already rejected
- Forgets file paths or function names mentioned earlier
- Contradicts an earlier decision without acknowledging the change
- Output quality noticeably drops

## Compaction vs Fresh Session

| Situation | Recommendation |
|-----------|---------------|
| Same task, long conversation | Compact — preserve task context |
| Switching to unrelated task | Fresh session — clean slate |
| Deep debugging with many dead ends | Compact — keep only successful path |
| Architecture discussion with many options | Compact — keep decisions, drop exploration |

## Compaction Strategy

### Step 1: Identify What to Drop
- Raw command output (keep summary only)
- Exploration paths that led nowhere
- Superseded plans (keep final plan only)
- Verbose error messages (keep error type + fix only)

### Step 2: Identify What to Summarize
- Multi-turn discussions → single paragraph decision
- Multiple file reads → summary of what was learned
- Iterative search → final relevant files list

### Step 3: Identify What to Preserve Verbatim
- Current task description and acceptance criteria
- Architectural decisions with reasoning
- Active file paths and line numbers
- Test results and coverage numbers
- Unresolved questions or blockers

### Step 4: Execute
Create a compacted context that includes:
1. Task summary (2-3 sentences)
2. Key decisions made (bulleted list)
3. Current state (what's done, what's next)
4. Critical context (file paths, error details, constraints)
5. Open questions

## Manual Compaction Prompt

When the user requests compaction, use this template:

```
Compacted Context:
- Task: [what we're doing]
- Progress: [what's done]
- Current focus: [what we're working on now]
- Key decisions: [list]
- Active files: [paths]
- Next steps: [ordered list]
- Open questions: [list]
```
