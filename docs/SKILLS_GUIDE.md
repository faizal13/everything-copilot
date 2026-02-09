# Skills Guide

How to create, organize, and share skill modules for Everything Copilot.

## What Skills Are

A skill is a self-contained knowledge module that teaches the agent domain-specific patterns, conventions, and rules. Skills live in `.copilot/skills/<skill-name>/` and are loaded conditionally based on trigger conditions -- file patterns, conversation topics, or explicit references.

Skills differ from instructions and contexts:

| Concept | Scope | Loaded When | Location |
|---------|-------|-------------|----------|
| Instruction | Global coding rules | Always | `.copilot/instructions/` |
| Skill | Domain knowledge | When triggered | `.copilot/skills/` |
| Context | Session mode | Per-task | `contexts/` |

## SKILL.md Manifest Format

Every skill directory must contain a `SKILL.md` file. This is the manifest that tells Copilot what the skill does and when to load it.

```markdown
# Skill Name

## Metadata
- **Name:** skill-name
- **Version:** 1.0.0
- **Description:** One-sentence description of what this skill covers.
- **Author:** your-team

## Trigger Conditions
This skill activates when:
- Condition 1 (e.g., "Writing or reviewing Go code")
- Condition 2 (e.g., "A pull request touches database migrations")
- Condition 3 (e.g., "The user asks about caching strategies")

## File Globs
- `*.go` - Go source files
- `**/migrations/**` - Migration files
- `**/cache/**` - Cache-related files

## Skill Files
| File | Purpose |
|------|---------|
| `patterns.md` | Core patterns and conventions |
| `anti-patterns.md` | Common mistakes and how to avoid them |
| `examples.md` | Annotated code examples |

## Usage
Brief instructions on how to apply this skill's knowledge.

## Priority Rules
1. Rule with highest priority
2. Rule with second priority
```

### Required Fields

- **Name**: Must match the directory name.
- **Description**: Loaded into context to help Copilot decide relevance.
- **Trigger Conditions**: Without these, Copilot cannot determine when to load the skill.
- **Skill Files**: Maps filenames to their purpose so Copilot loads the right subset.

### Optional Fields

- **Version**: Useful for tracking changes across teams.
- **File Globs**: Enables automatic activation when matching files are opened.
- **Priority Rules**: Resolves conflicts when multiple skills apply.

## How Skills Are Loaded

```
1. Developer opens a file or starts a task
2. Copilot checks file path against all skills' File Globs
3. Copilot checks conversation topic against Trigger Conditions
4. Matching skills are loaded into context
5. Skill Files listed in the manifest are read
6. Knowledge is applied to the current task
```

Only matching skills are loaded. A TypeScript project will never load Go patterns, keeping the context window efficient.

## Creating a New Skill

### Step 1: Create the Directory

```bash
mkdir -p .copilot/skills/your-skill-name
```

### Step 2: Write the SKILL.md Manifest

Start with the template above. Be specific about trigger conditions -- vague triggers cause the skill to load unnecessarily, wasting context tokens.

### Step 3: Add Knowledge Files

Each file should cover one topic. Keep files between 50 and 200 lines. If a file exceeds 200 lines, split it by subtopic.

Good file organization:
```
.copilot/skills/api-design/
  SKILL.md              # Manifest
  rest-conventions.md   # REST API naming, versioning, pagination
  error-responses.md    # Error format, status codes, error codes
  authentication.md     # Auth patterns (JWT, OAuth, API keys)
  rate-limiting.md      # Rate limit headers, strategies, client guidance
```

Bad file organization:
```
.copilot/skills/api-design/
  SKILL.md
  everything.md         # Too broad -- 500+ lines of mixed topics
```

### Step 4: Validate

```bash
npm run validate:skills
```

This verifies every skill directory has a `SKILL.md`, all listed files exist, and metadata is complete.

### Step 5: Test the Skill

Open a file that matches the skill's glob patterns. Ask Copilot a question related to the skill's domain. Verify the response incorporates the skill's knowledge.

## Skill File Organization

### Recommended Structure

```
.copilot/skills/
  coding-standards/       # Language conventions
    SKILL.md
    javascript.md
    typescript.md
    python.md
    go.md
    rust.md
  backend-patterns/       # Architecture patterns
    SKILL.md
    api-design.md
    database-patterns.md
    caching-strategies.md
  security-review/        # Security rules
    SKILL.md
    owasp-top-10.md
    auth-patterns.md
    input-validation.md
  verification-loop/      # Quality verification
    SKILL.md
    checkpoint-evals.md
    grading-rubrics.md
```

### Naming Conventions

- Directory names: `kebab-case` (e.g., `coding-standards`, `backend-patterns`)
- File names: `kebab-case.md` (e.g., `api-design.md`, `error-handling.md`)
- Manifest: Always `SKILL.md` (uppercase)

## Trigger Conditions

Triggers are evaluated in two ways:

**File-based triggers**: The `File Globs` field matches against the file currently open or being edited. Uses standard glob syntax (`*.go`, `**/tests/**/*.ts`).

**Topic-based triggers**: The `Trigger Conditions` field matches against the conversation topic. These are evaluated semantically by Copilot, so use natural language descriptions.

Effective triggers:
```
- Writing or reviewing Go code
- Creating database migration files
- Discussing API error handling patterns
```

Ineffective triggers:
```
- When coding                    # Too vague, matches everything
- When the user asks a question  # Too vague, matches everything
```

## Testing Skills

1. **Activation test**: Open a file that matches the glob. Ask Copilot to apply the skill's rules. Verify it references the skill content.
2. **Isolation test**: Open a file that does not match. Verify the skill does not leak into unrelated tasks.
3. **Conflict test**: If two skills could apply simultaneously (e.g., `coding-standards` and `backend-patterns` both matching a handler file), verify they complement rather than contradict each other.

## Sharing Skills Across Teams

Skills are portable. To share:

1. Copy the skill directory to another project's `.copilot/skills/`.
2. Adjust File Globs if the project uses a different directory structure.
3. Commit to the repository. All team members get the skill automatically.

For organization-wide skills, maintain a shared repository and use a script to sync skills:

```bash
# Sync shared skills into your project
cp -r shared-skills/coding-standards .copilot/skills/
cp -r shared-skills/security-review .copilot/skills/
```

Skills can also be published as npm packages or git submodules for versioned distribution.
