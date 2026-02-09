# GitHub MCP Integration Guide

## Overview

The GitHub MCP server provides full access to the GitHub API through the Model Context Protocol.
This enables AI assistants to interact with repositories, issues, pull requests, actions, and
code search without leaving the development workflow.

## Setup

### 1. Install the Server

```bash
npm install -g @modelcontextprotocol/server-github
```

### 2. Authentication

**Personal Access Token (recommended for individual use):**

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

Required token scopes: `repo`, `read:org`, `workflow`, `read:packages`.

**GitHub App (recommended for teams and CI):**

1. Create a GitHub App in your organization settings.
2. Generate a private key and install the app on target repositories.
3. Set the following environment variables:

```bash
export GITHUB_APP_ID="123456"
export GITHUB_APP_PRIVATE_KEY_PATH="/path/to/private-key.pem"
export GITHUB_APP_INSTALLATION_ID="78901234"
```

### 3. Configuration Entry

Add to your MCP client configuration (e.g., `.copilot/mcp.json`):

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}
```

## Available Tools

### Repository Operations
- **get_file_contents** - Read files and directories from a repository.
- **create_or_update_file** - Create or update a single file with a commit message.
- **push_files** - Push multiple files in a single commit.
- **search_repositories** - Search for repositories by keyword or topic.
- **create_repository** - Create a new repository with optional initialization.
- **fork_repository** - Fork an existing repository.
- **list_branches** - List all branches in a repository.

### Issue Operations
- **create_issue** - Open a new issue with title, body, labels, and assignees.
- **list_issues** - List issues with filtering by state, label, and assignee.
- **update_issue** - Edit issue title, body, state, labels, or assignees.
- **search_issues** - Full-text search across issues and pull requests.
- **add_issue_comment** - Add a comment to an existing issue.

### Pull Request Operations
- **create_pull_request** - Open a new PR with title, body, base, and head branches.
- **list_pull_requests** - List PRs filtered by state, head, or base branch.
- **get_pull_request_diff** - Retrieve the diff for a specific PR.
- **merge_pull_request** - Merge a PR using merge, squash, or rebase strategy.
- **create_review** - Submit a review with approve, request changes, or comment.

### Actions and Workflows
- **list_workflow_runs** - List recent workflow runs with status filtering.
- **get_workflow_run** - Get details of a specific workflow run.
- **trigger_workflow** - Manually trigger a workflow dispatch event.

## Usage Patterns

### Reviewing a Pull Request

```
User: Review PR #42 in our backend repo
Agent: [calls get_pull_request_diff] -> analyzes changes
       [calls get_file_contents] -> reads related files for context
       [calls create_review] -> submits review with inline comments
```

### Triaging Issues

```
User: Show me all critical bugs from this week
Agent: [calls search_issues with "is:issue is:open label:bug label:critical created:>2026-02-01"]
       -> summarizes findings and suggests priorities
```

### Creating a Feature Branch Workflow

```
User: Create a branch and PR for the login redesign
Agent: [calls create_branch] -> creates feature/login-redesign
       [calls push_files] -> commits initial changes
       [calls create_pull_request] -> opens draft PR with description
```

## Rate Limiting

GitHub enforces API rate limits that apply to all MCP operations:

| Auth Method         | Limit              | Reset Window |
|--------------------|--------------------|--------------|
| Personal Token     | 5,000 requests/hr  | Rolling hour |
| GitHub App         | 5,000 requests/hr per installation | Rolling hour |
| Unauthenticated   | 60 requests/hr     | Rolling hour |

**Best practices:**
- Use conditional requests (ETags) when polling for changes.
- Batch related operations to reduce call count.
- Cache repository metadata locally when possible.
- Monitor `X-RateLimit-Remaining` headers in server logs.
- For high-volume workflows, prefer GitHub App authentication with multiple installations.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| 401 Unauthorized | Expired or invalid token | Regenerate PAT; verify scopes |
| 403 Forbidden | Insufficient permissions | Add required scopes to token |
| 404 Not Found | Private repo without `repo` scope | Ensure token has `repo` scope |
| 422 Validation Failed | Invalid request payload | Check required fields in tool args |
| Rate limit exceeded | Too many requests | Wait for reset; switch to GitHub App auth |
