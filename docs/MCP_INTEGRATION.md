# MCP Integration Guide

## Overview

The Model Context Protocol (MCP) extends GitHub Copilot's capabilities by connecting it to external tools and services. MCP servers act as bridges — they expose structured APIs that Copilot can call to read data, execute actions, and interact with systems beyond the editor.

## How MCP Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Copilot    │ ──→ │  MCP Server  │ ──→ │   External   │
│   (Client)   │ ←── │  (Bridge)    │ ←── │   Service    │
└──────────────┘     └──────────────┘     └──────────────┘
     Chat              Tool calls           GitHub, DB,
     Interface         JSON-RPC             APIs, etc.
```

1. Copilot identifies a need for external data (e.g., "list open PRs")
2. Copilot calls the appropriate MCP tool with structured parameters
3. The MCP server executes the request against the external service
4. Results are returned to Copilot in a structured format
5. Copilot incorporates the results into its response

## Configuration

### MCP Config Location

MCP servers are configured in:
```
mcp-configs/mcp-servers.json
```

### Config Structure

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-package"],
      "env": {
        "API_KEY": "${ENV_VAR_NAME}"
      }
    }
  }
}
```

### Environment Variables

Never hardcode secrets. Use environment variables:

```bash
# .env (never committed)
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
DATABASE_URL=postgresql://user:pass@host:5432/db
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxx
```

Reference them in config:
```json
{
  "env": {
    "GITHUB_TOKEN": "${GITHUB_TOKEN}"
  }
}
```

## Built-in MCP Servers

### 1. GitHub MCP Server

Interact with GitHub repositories, issues, PRs, and code.

```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
    }
  }
}
```

**Available Tools:**
| Tool | Purpose | Example |
|------|---------|---------|
| `create_issue` | Create GitHub issues | "Create an issue for the login bug" |
| `list_pull_requests` | List PRs with filters | "Show open PRs for review" |
| `get_file_contents` | Read files from repos | "Get the README from the API repo" |
| `search_code` | Search across repos | "Find all uses of deprecated API" |
| `create_pull_request` | Create PRs | "Create a PR for this feature branch" |

**Required Scopes:** `repo`, `read:org`

### 2. Filesystem MCP Server

Read and write files on the local filesystem.

```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/project"],
    "env": {}
  }
}
```

**Available Tools:**
| Tool | Purpose |
|------|---------|
| `read_file` | Read file contents |
| `write_file` | Write/create files |
| `list_directory` | List directory contents |
| `search_files` | Search by filename pattern |

### 3. PostgreSQL MCP Server

Query PostgreSQL databases directly from chat.

```json
{
  "postgres": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres"],
    "env": {
      "DATABASE_URL": "${DATABASE_URL}"
    }
  }
}
```

**Available Tools:**
| Tool | Purpose |
|------|---------|
| `query` | Execute SELECT queries |
| `describe_table` | Get table schema |
| `list_tables` | List all tables |

**Security:** Read-only by default. Never enable write access in production.

### 4. Slack MCP Server

Send messages and read channels.

```json
{
  "slack": {
    "command": "npx",
    "args": ["-y", "@anthropic/server-slack"],
    "env": {
      "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}"
    }
  }
}
```

### 5. Memory MCP Server

Persistent key-value storage across sessions.

```json
{
  "memory": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-memory"],
    "env": {}
  }
}
```

## Custom MCP Servers

### Using Templates

Templates in `mcp-configs/templates/` provide starting points:

```
mcp-configs/templates/
├── github-mcp-template.json     # GitHub integration
├── rest-api-template.json       # Generic REST API
└── custom-tool-template.json    # Custom tool scaffold
```

### REST API Template

Connect any REST API as an MCP server:

```json
{
  "name": "my-api",
  "description": "Internal API integration",
  "baseUrl": "https://api.example.com/v1",
  "authentication": {
    "type": "bearer",
    "tokenEnvVar": "MY_API_TOKEN"
  },
  "tools": [
    {
      "name": "get_users",
      "description": "List all users",
      "method": "GET",
      "path": "/users",
      "parameters": {
        "page": { "type": "number", "default": 1 },
        "limit": { "type": "number", "default": 20 }
      }
    }
  ]
}
```

### Building a Custom MCP Server

Minimal MCP server in Node.js:

```javascript
const { Server } = require('@modelcontextprotocol/sdk/server');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio');

const server = new Server({
  name: 'my-custom-server',
  version: '1.0.0',
});

// Define a tool
server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'my_tool',
    description: 'Does something useful',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' }
      },
      required: ['query']
    }
  }]
}));

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'my_tool') {
    const { query } = request.params.arguments;
    // Do something with query
    return {
      content: [{ type: 'text', text: `Result for: ${query}` }]
    };
  }
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);
```

## Team Configurations

### Frontend Team

```json
{
  "mcpServers": {
    "github": { "...": "GitHub for PRs and issues" },
    "figma": { "...": "Design tokens and components" },
    "storybook": { "...": "Component documentation" }
  }
}
```

### Backend Team

```json
{
  "mcpServers": {
    "github": { "...": "GitHub for PRs and issues" },
    "postgres": { "...": "Database queries" },
    "redis": { "...": "Cache inspection" },
    "datadog": { "...": "Monitoring and logs" }
  }
}
```

### DevOps Team

```json
{
  "mcpServers": {
    "github": { "...": "GitHub for PRs and issues" },
    "aws": { "...": "AWS resource management" },
    "kubernetes": { "...": "Cluster management" },
    "terraform": { "...": "Infrastructure state" }
  }
}
```

## Security Best Practices

### Authentication

- **Always use environment variables** for tokens and secrets
- **Never commit** `.env` files or hardcoded credentials
- **Use least-privilege tokens** — only the scopes needed
- **Rotate tokens** regularly (quarterly minimum)

### Access Control

```json
{
  "postgres": {
    "env": {
      "DATABASE_URL": "${DATABASE_READ_ONLY_URL}"
    },
    "constraints": {
      "readOnly": true,
      "maxResults": 100,
      "allowedTables": ["users", "products", "orders"]
    }
  }
}
```

### Network Security

- Use HTTPS for all API connections
- Configure timeouts to prevent hanging connections
- Set rate limits to avoid API abuse
- Log all MCP tool calls for audit

### Data Handling

- Never send PII through MCP without necessity
- Mask sensitive fields in responses
- Don't cache credentials or tokens
- Clear sensitive data from context after use

## Troubleshooting

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Server not found" | Package not installed | Run `npx -y @modelcontextprotocol/server-<name>` |
| "Authentication failed" | Missing or invalid token | Check `.env` file and token scopes |
| "Connection timeout" | Server not running or firewall | Check server process and network |
| "Tool not found" | Wrong tool name in request | Check tool names in server config |
| "Permission denied" | Insufficient token scopes | Update token with required scopes |

### Debugging

```bash
# Test MCP server directly
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | \
  npx -y @modelcontextprotocol/server-github

# Check environment variables
env | grep -i github

# Verify server starts
npx -y @modelcontextprotocol/server-github 2>&1
```

## Checklist

- [ ] MCP servers configured in `mcp-configs/mcp-servers.json`
- [ ] Environment variables set in `.env` (not committed)
- [ ] Token scopes follow least-privilege principle
- [ ] Read-only access for database servers
- [ ] Templates customized for team needs
- [ ] Security review completed for custom servers
- [ ] Team-specific configurations documented
- [ ] Troubleshooting steps tested
