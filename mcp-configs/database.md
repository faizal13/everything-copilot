# Database MCP Tools Guide

## Overview

Database MCP servers provide AI assistants with direct access to query, inspect, and manage
relational databases. This guide covers PostgreSQL, MySQL, and SQLite integrations with
emphasis on query safety and practical development workflows.

---

## PostgreSQL

### Setup

```bash
npm install -g @modelcontextprotocol/server-postgres
```

**MCP configuration:**

```json
{
  "mcpServers": {
    "postgresql": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost:5432/mydb"
      }
    }
  }
}
```

### Available Tools
- **query** - Execute a SQL query and return results as structured data.
- **list_tables** - List all tables in the current schema.
- **describe_table** - Show column names, types, constraints, and indexes for a table.
- **list_schemas** - Enumerate all schemas in the database.
- **explain_query** - Run EXPLAIN ANALYZE on a query to show the execution plan.
- **get_foreign_keys** - List all foreign key relationships for a table.

### Usage Pattern: Schema Exploration

```
User: What tables exist and how are they related?
Agent: [calls list_tables] -> gets all tables
       [calls describe_table for each] -> gathers columns and types
       [calls get_foreign_keys for each] -> maps relationships
       -> produces entity-relationship summary
```

### Usage Pattern: Query Optimization

```
User: This query is slow, help me optimize it
Agent: [calls explain_query with the slow SQL]
       -> identifies sequential scans, missing indexes, join inefficiencies
       -> suggests CREATE INDEX statements and query rewrites
```

---

## MySQL

### Setup

```bash
npm install -g @benborla29/mcp-server-mysql
```

**MCP configuration:**

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["-y", "@benborla29/mcp-server-mysql"],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "dev_user",
        "MYSQL_PASSWORD": "<password>",
        "MYSQL_DATABASE": "mydb"
      }
    }
  }
}
```

### Available Tools
- **query** - Execute a SQL query and return results.
- **list_tables** - List all tables in the current database.
- **describe_table** - Show columns, types, keys, and defaults.
- **show_create_table** - Return the CREATE TABLE statement for a table.
- **show_indexes** - List all indexes on a table with cardinality.

### Usage Pattern: Migration Preparation

```
User: I need to add a created_at column to the orders table
Agent: [calls describe_table for orders] -> checks current schema
       [calls query "SELECT COUNT(*) FROM orders"] -> assesses table size for lock time
       -> generates ALTER TABLE with appropriate default, suggests running during low traffic
```

---

## SQLite

### Setup

```bash
npm install -g @modelcontextprotocol/server-sqlite
```

**MCP configuration:**

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "./local.db"],
      "env": {}
    }
  }
}
```

### Available Tools
- **query** - Execute SQL against the local SQLite database.
- **list_tables** - List all tables in the database file.
- **describe_table** - Show table schema using pragma table_info.
- **create_table** - Create a new table with column definitions.
- **export_csv** - Export query results to CSV format.

### Usage Pattern: Local Prototyping

```
User: Create a table for tracking experiments and insert sample data
Agent: [calls create_table with schema definition]
       [calls query with INSERT statements for sample rows]
       [calls query with SELECT to verify] -> shows results
```

---

## Query Safety

### Read-Only Mode

For production databases, always configure read-only access:

**PostgreSQL:**
```sql
CREATE ROLE readonly_user WITH LOGIN PASSWORD 'secure_pass';
GRANT CONNECT ON DATABASE prod_db TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

**MySQL:**
```sql
CREATE USER 'readonly_user'@'%' IDENTIFIED BY 'secure_pass';
GRANT SELECT ON prod_db.* TO 'readonly_user'@'%';
FLUSH PRIVILEGES;
```

### Transaction Support

When write access is needed, wrap operations in explicit transactions:

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
-- Agent reviews the changes before committing
COMMIT;
```

### Query Guardrails

Adopt these rules in your workflow instructions:

1. **Always LIMIT results** - Add `LIMIT 100` to exploratory queries to avoid returning millions of rows.
2. **No DROP or TRUNCATE** - Never execute destructive DDL against production.
3. **Use EXPLAIN first** - Run EXPLAIN on any query against large tables before execution.
4. **Parameterize inputs** - Never interpolate user strings directly into SQL.
5. **Time-bound queries** - Set `statement_timeout` (PostgreSQL) or `max_execution_time` (MySQL).

---

## Schema Visualization

The database MCP tools can generate schema documentation:

```
User: Generate a schema diagram for the billing module
Agent: [calls list_tables] -> filters billing-related tables
       [calls describe_table + get_foreign_keys for each]
       -> produces a Mermaid ER diagram:

erDiagram
    customers ||--o{ invoices : "has"
    invoices ||--|{ line_items : "contains"
    invoices ||--o| payments : "paid_by"
    line_items }|--|| products : "references"
```

This output can be pasted directly into Markdown files or documentation tools that
render Mermaid diagrams.
