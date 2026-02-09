# API Design Patterns

## REST API Design

### URL Structure
```
# Resources are nouns, plural
GET    /api/v1/users          # list users
POST   /api/v1/users          # create user
GET    /api/v1/users/:id      # get user
PUT    /api/v1/users/:id      # replace user
PATCH  /api/v1/users/:id      # partial update
DELETE /api/v1/users/:id      # delete user

# Nested resources for relationships
GET    /api/v1/users/:id/orders       # user's orders
POST   /api/v1/users/:id/orders       # create order for user

# Actions as sub-resources (when CRUD does not fit)
POST   /api/v1/users/:id/activate     # non-CRUD action
POST   /api/v1/orders/:id/refund      # non-CRUD action
```

### HTTP Status Codes
| Code | Meaning | When to Use |
|------|---------|-------------|
| 200  | OK | Successful GET, PUT, PATCH, DELETE |
| 201  | Created | Successful POST that creates a resource |
| 204  | No Content | Successful DELETE with no response body |
| 400  | Bad Request | Validation errors, malformed input |
| 401  | Unauthorized | Missing or invalid authentication |
| 403  | Forbidden | Authenticated but not authorized |
| 404  | Not Found | Resource does not exist |
| 409  | Conflict | Duplicate resource, version conflict |
| 422  | Unprocessable Entity | Semantically invalid input |
| 429  | Too Many Requests | Rate limit exceeded |
| 500  | Internal Server Error | Unexpected server failure |

### Response Envelope
```json
{
  "data": { "id": "usr_123", "name": "Alice", "email": "alice@example.com" },
  "meta": { "requestId": "req_abc123", "timestamp": "2025-01-15T10:30:00Z" }
}

// Error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "must be a valid email address" }
    ]
  },
  "meta": { "requestId": "req_abc124" }
}
```

## Pagination

### Cursor-Based (Preferred)
```json
// Request
GET /api/v1/users?limit=20&after=cursor_abc123

// Response
{
  "data": [...],
  "pagination": {
    "hasMore": true,
    "nextCursor": "cursor_def456",
    "prevCursor": "cursor_abc123"
  }
}
```

### Offset-Based (Simple but Fragile)
```json
// Request
GET /api/v1/users?page=3&perPage=20

// Response
{
  "data": [...],
  "pagination": {
    "page": 3,
    "perPage": 20,
    "total": 542,
    "totalPages": 28
  }
}
```

**Cursor-based advantages:** Stable during inserts/deletes, performs well on large datasets, no page-skip issues.

## Versioning

### URL Path Versioning (Recommended)
```
/api/v1/users
/api/v2/users
```

### Header Versioning (Alternative)
```
Accept: application/vnd.myapp.v2+json
```

### Rules
- Never break existing clients without a version bump
- Support at least N-1 version concurrently
- Deprecate with `Sunset` header and advance notice
- Document breaking changes in a changelog

## GraphQL Patterns

### Schema Design
```graphql
type Query {
  user(id: ID!): User
  users(filter: UserFilter, first: Int, after: String): UserConnection!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type User {
  id: ID!
  name: String!
  email: String!
  orders(first: Int, after: String): OrderConnection!
}

input UserFilter {
  role: UserRole
  isActive: Boolean
  search: String
}
```

### N+1 Prevention with DataLoader
```javascript
const userLoader = new DataLoader(async (ids) => {
  const users = await db.users.findMany({ where: { id: { in: ids } } });
  const userMap = new Map(users.map(u => [u.id, u]));
  return ids.map(id => userMap.get(id) ?? null);
});
```

## gRPC Patterns

### Service Definition
```protobuf
syntax = "proto3";
package user.v1;

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc StreamUpdates(StreamUpdatesRequest) returns (stream UserEvent);
}

message GetUserRequest {
  string user_id = 1;
}

message GetUserResponse {
  User user = 1;
}

message ListUsersRequest {
  int32 page_size = 1;
  string page_token = 2;
}
```

### When to Use Each Protocol
| Protocol | Best For |
|----------|----------|
| REST | Public APIs, browser clients, CRUD operations |
| GraphQL | Complex queries, mobile clients, varied data needs |
| gRPC | Internal microservices, streaming, high performance |

## Rate Limiting
```
# Response headers
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1699900800
Retry-After: 30
```

Implement with token bucket or sliding window algorithms. Apply per-user and per-endpoint limits.

## Idempotency
```
# Client sends idempotency key
POST /api/v1/payments
Idempotency-Key: idem_abc123

# Server checks if this key was already processed
# If yes: return the original response
# If no: process and store the result keyed by idem_abc123
```

## Checklist
- [ ] All endpoints return consistent response envelopes
- [ ] Error responses include machine-readable codes and human-readable messages
- [ ] Pagination is cursor-based for list endpoints with large datasets
- [ ] API is versioned and documented (OpenAPI/Swagger)
- [ ] Rate limiting is applied and documented
- [ ] Idempotency keys are supported for mutating operations
- [ ] CORS is configured appropriately for browser clients
- [ ] Request/response validation happens at the API boundary
