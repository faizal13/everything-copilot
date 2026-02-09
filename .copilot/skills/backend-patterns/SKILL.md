# Backend Patterns

## Metadata
- **Name:** backend-patterns
- **Version:** 1.0.0
- **Description:** Comprehensive backend architecture patterns covering API design, database management, caching strategies, and event-driven architectures for building scalable services.
- **Author:** everything-copilot

## Trigger Conditions
This skill activates when:
- Designing or implementing API endpoints (REST, GraphQL, gRPC)
- Working with database schemas, migrations, or queries
- Implementing caching layers or cache invalidation logic
- Building event-driven systems or message processing pipelines
- Reviewing backend architecture decisions

## File Globs
- `**/routes/**`, `**/api/**`, `**/handlers/**` - API design patterns
- `**/migrations/**`, `**/models/**`, `**/schema/**` - Database patterns
- `**/cache/**`, `**/*cache*` - Caching patterns
- `**/events/**`, `**/queues/**`, `**/subscribers/**` - Event-driven patterns

## Skill Files
| File | Purpose |
|------|---------|
| `api-design.md` | REST, GraphQL, gRPC design, versioning, pagination |
| `database-patterns.md` | Schema design, migrations, indexing, query optimization |
| `caching-strategies.md` | Redis, in-memory, CDN caching and invalidation |
| `event-driven-patterns.md` | Message queues, pub/sub, event sourcing, CQRS |

## Usage
Apply these patterns when building or reviewing any backend service. Cross-reference with coding-standards for language-specific implementation details.

## Principles
1. Design APIs for consumers, not for the database schema
2. Every write should be idempotent where possible
3. Cache aggressively but invalidate correctly
4. Prefer eventual consistency over distributed transactions
5. Log structured data; monitor everything
