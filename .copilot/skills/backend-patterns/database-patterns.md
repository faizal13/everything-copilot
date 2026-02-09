# Database Patterns

## Schema Design

### Primary Keys
```sql
-- PREFER: UUID or ULID for distributed systems
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- ...
);

-- ALTERNATIVE: BIGINT with GENERATED for single-database systems
CREATE TABLE orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- ...
);

-- AVOID: SERIAL (legacy), meaningful keys (email as PK)
```

### Naming Conventions
- **Tables:** plural snake_case: `users`, `order_items`, `audit_logs`
- **Columns:** singular snake_case: `user_id`, `created_at`, `is_active`
- **Indexes:** `idx_{table}_{columns}`: `idx_users_email`, `idx_orders_user_id_status`
- **Foreign keys:** `fk_{table}_{ref_table}`: `fk_orders_users`
- **Constraints:** `chk_{table}_{description}`: `chk_orders_positive_amount`

### Standard Columns
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ  -- soft delete
);

-- Auto-update updated_at with trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## Migrations

### Migration File Structure
```
migrations/
  001_create_users.up.sql
  001_create_users.down.sql
  002_create_orders.up.sql
  002_create_orders.down.sql
  003_add_users_phone.up.sql
  003_add_users_phone.down.sql
```

### Migration Rules
1. **Every up migration has a corresponding down migration**
2. **Never edit a migration that has been applied** -- create a new one
3. **Keep migrations small and focused** -- one logical change per file
4. **Test down migrations** -- they must cleanly reverse the up
5. **Use transactions** for DDL when the database supports it

### Safe Column Operations
```sql
-- SAFE: Add nullable column (no table rewrite, no lock)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- SAFE: Add column with default (Postgres 11+ avoids rewrite)
ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'viewer';

-- DANGEROUS: Rename column (breaks existing queries)
-- Instead: add new column, migrate data, drop old column

-- DANGEROUS: Change column type
-- Instead: add new column with new type, backfill, switch, drop old
```

## Indexing

### When to Add Indexes
- Columns in `WHERE` clauses queried frequently
- Columns used in `JOIN` conditions
- Columns used in `ORDER BY` with `LIMIT`
- Foreign key columns (almost always)

### Index Types
```sql
-- B-tree (default, good for equality and range)
CREATE INDEX idx_users_email ON users (email);

-- Composite index (column order matters: most selective first)
CREATE INDEX idx_orders_user_status ON orders (user_id, status);

-- Partial index (index a subset of rows)
CREATE INDEX idx_users_active_email ON users (email) WHERE is_active = true;

-- GIN index (for JSONB, arrays, full-text search)
CREATE INDEX idx_products_tags ON products USING gin (tags);

-- Covering index (includes columns to avoid table lookup)
CREATE INDEX idx_orders_user_covering ON orders (user_id) INCLUDE (status, total);
```

### Index Anti-Patterns
- Do not index low-cardinality columns alone (e.g., boolean)
- Do not create indexes you never query against
- Do not rely on composite indexes for queries that skip the leading column
- Review unused indexes periodically: `pg_stat_user_indexes`

## Query Optimization

### EXPLAIN ANALYZE
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.is_active = true
GROUP BY u.id
ORDER BY order_count DESC
LIMIT 20;

-- Look for:
-- Seq Scan on large tables (missing index)
-- Nested Loop with high row estimates (consider Hash Join)
-- Sort with high memory usage (add index for ORDER BY)
```

### Common Optimizations
```sql
-- Use EXISTS instead of COUNT for existence checks
-- BAD
SELECT * FROM users WHERE (SELECT COUNT(*) FROM orders WHERE user_id = users.id) > 0;

-- GOOD
SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- Batch inserts instead of row-by-row
INSERT INTO audit_logs (user_id, action, created_at)
VALUES
    ('usr_1', 'login', now()),
    ('usr_2', 'login', now()),
    ('usr_3', 'logout', now());

-- Use CTEs for readability, but know the optimizer behavior
WITH active_users AS (
    SELECT id, name FROM users WHERE is_active = true
)
SELECT au.name, COUNT(o.id)
FROM active_users au
JOIN orders o ON o.user_id = au.id
GROUP BY au.id, au.name;
```

### Connection Pooling
- Use PgBouncer or application-level pooling (e.g., HikariCP, sqlx pool)
- Set pool size to `(2 * CPU cores) + effective_spindle_count` as a starting point
- Monitor for pool exhaustion with metrics on wait time and active connections
- Set statement timeout to prevent runaway queries: `SET statement_timeout = '30s'`

## Data Integrity Patterns

### Optimistic Locking
```sql
-- Add version column
ALTER TABLE orders ADD COLUMN version INT NOT NULL DEFAULT 1;

-- Update with version check
UPDATE orders
SET status = 'shipped', version = version + 1
WHERE id = 'ord_123' AND version = 5;
-- If rows_affected = 0, someone else modified it; retry or fail
```

### Audit Trail
```sql
CREATE TABLE audit_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL,  -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Checklist
- [ ] All tables have a primary key (UUID or BIGINT IDENTITY)
- [ ] Foreign keys have indexes on the referencing column
- [ ] Migrations are reversible and tested in both directions
- [ ] No `SELECT *` in production queries; specify columns explicitly
- [ ] Queries hitting production are profiled with EXPLAIN ANALYZE
- [ ] Connection pooling is configured with appropriate limits
- [ ] Soft deletes use `deleted_at` timestamp, not boolean
- [ ] `created_at` and `updated_at` are present on all tables
- [ ] Sensitive data is encrypted at rest
- [ ] Database credentials are in environment variables, not in code
