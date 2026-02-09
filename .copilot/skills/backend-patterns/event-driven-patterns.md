# Event-Driven Architecture Patterns

## Message Queue Patterns

### Producer/Consumer
```
Producer → Queue → Consumer
```
- Producer publishes messages, consumer processes them asynchronously
- Guarantees at-least-once delivery with acknowledgments
- Use dead letter queues for failed messages

### Fan-Out
```
Producer → Exchange → Queue A → Consumer A
                   → Queue B → Consumer B
```
- One event triggers multiple consumers
- Each consumer processes independently
- Use when multiple services need the same event

## Event Sourcing

Store state changes as a sequence of events rather than current state:

```json
// Instead of: { "balance": 150 }
// Store events:
[
  { "type": "ACCOUNT_CREATED", "data": { "initialBalance": 0 }, "timestamp": "..." },
  { "type": "DEPOSIT", "data": { "amount": 200 }, "timestamp": "..." },
  { "type": "WITHDRAWAL", "data": { "amount": 50 }, "timestamp": "..." }
]
```

**Benefits:** Complete audit trail, time-travel debugging, event replay.
**Costs:** More storage, eventual consistency, more complex queries.

## CQRS (Command Query Responsibility Segregation)

Separate write model (commands) from read model (queries):

```
Commands → Write DB (normalized, events)
Queries  → Read DB (denormalized, projections)
```

Use when read and write patterns differ significantly (e.g., complex writes, simple reads).

## Saga Pattern

Coordinate distributed transactions across services:

```
Order Service → Payment Service → Inventory Service → Shipping Service
     ↓ (if any fails)
Compensating transactions in reverse order
```

**Choreography:** Each service listens for events and acts
**Orchestration:** Central coordinator manages the flow

## Idempotency

Ensure processing the same event multiple times produces the same result:

```js
async function processPayment(event) {
  // Check idempotency key
  const existing = await db.findByIdempotencyKey(event.id);
  if (existing) return existing.result; // Already processed

  const result = await chargeCard(event.data);
  await db.saveWithIdempotencyKey(event.id, result);
  return result;
}
```

## Topic Naming Convention

```
<domain>.<entity>.<event>
orders.order.created
payments.payment.completed
users.profile.updated
```

## Checklist
- [ ] Dead letter queue configured for failed messages
- [ ] Idempotency keys on all event handlers
- [ ] Event schema versioned (handle old and new formats)
- [ ] Monitoring on queue depth and processing latency
- [ ] Compensating transactions defined for saga failures
- [ ] Events carry only necessary data (not entire entity)
