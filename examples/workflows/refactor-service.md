# Workflow: Refactor a Service

Workflow for safely refactoring a service using the everything-copilot toolkit.
This example refactors a monolithic `OrderService` into separate bounded
contexts: `OrderService`, `PaymentService`, and `NotificationService`.

---

## Phase 1: Architecture Analysis

**Agent:** Architect | **Purpose:** Understand current structure and plan the split

```
Analyze the OrderService in src/services/order-service.ts. It currently handles
order creation, payment processing, and email notifications. Propose a
refactoring plan to split it into three focused services.
```

The Architect will:
1. Map all dependencies and callers of `OrderService`.
2. Identify the boundaries between order logic, payment logic, and notifications.
3. Produce a component diagram showing the target architecture.
4. Create an ADR documenting the decision and migration strategy.

**Key output:** A dependency map and a target architecture diagram.

---

## Phase 2: Plan the Refactor

**Agent:** Planner | **Command:** `/plan`

```
/plan Refactor OrderService into OrderService, PaymentService, and
NotificationService following the architecture in docs/adr/ADR-012.md
```

The Planner will produce ordered tasks:
1. Extract `PaymentService` interface and implementation.
2. Extract `NotificationService` interface and implementation.
3. Update `OrderService` to delegate to the new services.
4. Update all callers to use the new service boundaries.
5. Update tests for each service independently.
6. Remove dead code from the original `OrderService`.

---

## Phase 3: Write Characterization Tests

**Agent:** TDD Guide | **Purpose:** Lock in current behavior before changing it

Before modifying any code, write tests that capture the existing behavior:

```
/tdd src/services/order-service (characterization tests)
```

These tests ensure that the refactored code produces the same outputs as the
original. Cover:
- All public methods with their current inputs and expected outputs.
- Edge cases: empty orders, failed payments, notification failures.
- Integration points: database calls, external API calls.

Run the test suite. All characterization tests must pass. This is your safety
net for the refactor.

---

## Phase 4: Execute the Refactor

**Agent:** TDD Guide | **Command:** `/tdd`

Work through each task from the plan. For each extracted service:

```
/tdd src/services/payment-service
```

1. **RED** -- Write tests for `PaymentService` based on the behavior extracted
   from `OrderService`. These tests initially fail because the service does
   not exist yet.
2. **GREEN** -- Move the payment logic from `OrderService` into
   `PaymentService`. Tests pass.
3. **REFACTOR** -- Clean up interfaces, remove duplication, simplify the
   `OrderService` to delegate to `PaymentService`.

After each extraction, run the full characterization test suite to verify no
regressions.

---

## Phase 5: Verify No Regressions

**Command:** `/code-review` and `/e2e`

Run a code review on the refactored code:

```
/code-review src/services/order-service.ts src/services/payment-service.ts src/services/notification-service.ts
```

Then run E2E tests to verify the full workflow still works:

```
/e2e User places an order, payment is processed, and confirmation email is sent
```

**Regression checklist:**
- [ ] All existing unit tests pass.
- [ ] All characterization tests pass.
- [ ] E2E tests pass without modification.
- [ ] No new linter warnings.
- [ ] Coverage has not decreased.

---

## Phase 6: Clean Up

1. Remove dead code from the original `OrderService`.
2. Update import paths across the codebase.
3. Update documentation to reflect the new service boundaries.
4. Remove characterization tests that are now redundant (covered by the new
   service-specific tests).

---

## Agents and Commands Used

| Phase | Agent/Command | Purpose |
|-------|---------------|---------|
| Analysis | Architect | Map dependencies, design target |
| Planning | `/plan` | Ordered task list for the refactor |
| Safety net | `/tdd` | Characterization tests |
| Execution | `/tdd` | Extract services with TDD |
| Verification | `/code-review`, `/e2e` | Regression checks |
| Cleanup | Manual | Remove dead code and update docs |
