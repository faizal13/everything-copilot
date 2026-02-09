# Third-Party MCP Integrations Guide

## Overview

This guide covers MCP server integrations for third-party services commonly used alongside
development workflows. Each section provides setup instructions, available capabilities,
and practical usage patterns.

---

## Slack

### Setup

```bash
npm install -g @anthropic/mcp-server-slack
```

**Required environment variables:**

```bash
export SLACK_BOT_TOKEN="xoxb-your-bot-token"
export SLACK_APP_TOKEN="xapp-your-app-token"
```

Create a Slack App at https://api.slack.com/apps with these bot scopes:
`channels:read`, `channels:history`, `chat:write`, `reactions:read`, `users:read`.

**MCP configuration:**

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "<your-bot-token>",
        "SLACK_APP_TOKEN": "<your-app-token>"
      }
    }
  }
}
```

### Available Tools
- **send_message** - Post a message to a channel or thread.
- **read_channel** - Retrieve recent messages from a channel.
- **list_channels** - List channels the bot has access to.
- **search_messages** - Search messages across the workspace.
- **add_reaction** - Add an emoji reaction to a message.
- **get_user_info** - Look up a user by ID or display name.

### Usage Pattern: Standup Summary

```
User: Summarize what was discussed in #engineering today
Agent: [calls read_channel with channel=#engineering, limit=50]
       -> groups messages by topic, highlights decisions and action items
```

---

## Jira

### Setup

```bash
npm install -g mcp-server-jira
```

**Required environment variables:**

```bash
export JIRA_BASE_URL="https://your-team.atlassian.net"
export JIRA_EMAIL="your-email@company.com"
export JIRA_API_TOKEN="your-api-token"
```

Generate an API token at https://id.atlassian.com/manage-profile/security/api-tokens.

### Available Tools
- **create_issue** - Create a story, bug, task, or epic with full field support.
- **update_issue** - Modify any field on an existing issue.
- **transition_issue** - Move an issue through workflow states (To Do, In Progress, Done).
- **search_issues** - Run JQL queries to find issues.
- **get_sprint** - Get current sprint details and backlog.
- **add_comment** - Comment on an issue with optional mention notifications.
- **log_work** - Add a work log entry to an issue.

### Usage Pattern: Sprint Planning

```
User: What unfinished stories are in the current sprint?
Agent: [calls get_sprint with board_id] -> retrieves active sprint
       [calls search_issues with JQL "sprint = currentSprint() AND status != Done"]
       -> lists incomplete stories with estimates and assignees
```

---

## Linear

### Setup

```bash
npm install -g mcp-server-linear
```

**Required environment variables:**

```bash
export LINEAR_API_KEY="lin_api_your_key_here"
```

Generate an API key at https://linear.app/settings/api.

### Available Tools
- **create_issue** - Create an issue with team, project, label, and priority.
- **update_issue** - Modify status, assignee, priority, or any other field.
- **search_issues** - Search and filter issues across teams.
- **list_projects** - List all projects and their progress.
- **create_comment** - Add a comment or thread reply.

### Usage Pattern: Bug Triage

```
User: Find all high-priority bugs assigned to me in Linear
Agent: [calls search_issues with filter for assignee, priority=high, label=bug]
       -> returns sorted list with age, description summary, and linked PRs
```

---

## Notion

### Setup

```bash
npm install -g mcp-server-notion
```

**Required environment variables:**

```bash
export NOTION_API_KEY="ntn_your_integration_token"
```

Create an integration at https://www.notion.so/my-integrations, then share target
pages or databases with the integration.

### Available Tools
- **search_pages** - Search pages and databases by title or content.
- **read_page** - Retrieve the full content of a Notion page.
- **create_page** - Create a new page in a specified parent database or page.
- **update_page** - Modify page properties or append content blocks.
- **query_database** - Query a Notion database with filters and sorts.

### Usage Pattern: Meeting Notes

```
User: Create a meeting notes page for today's architecture review
Agent: [calls create_page with template, date, attendees, and agenda sections]
       -> returns link to newly created Notion page
```

---

## Common Setup Patterns

### Environment Variable Management

Store credentials in a `.env` file (never commit this):

```bash
# .env - add to .gitignore
SLACK_BOT_TOKEN=xoxb-...
JIRA_BASE_URL=https://team.atlassian.net
JIRA_API_TOKEN=...
LINEAR_API_KEY=lin_api_...
NOTION_API_KEY=ntn_...
```

### Combining Multiple Services

A typical workflow might chain operations across services:

```
User: When a PR is merged, post to Slack and move the Jira ticket to Done
Agent: [GitHub: watches merge event]
       [Jira: calls transition_issue to "Done"]
       [Slack: calls send_message to #releases with PR summary]
```

### Security Considerations

- Use the principle of least privilege when creating API tokens.
- Rotate tokens on a regular schedule (every 90 days minimum).
- Restrict bot permissions to only the channels, projects, and scopes needed.
- Store all secrets in environment variables or a secrets manager, never in config files.
- Audit MCP server access logs periodically.
