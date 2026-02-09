# TDD Workflow

## The Cycle: RED → GREEN → REFACTOR

### 1. RED — Write a Failing Test
Write the smallest test that describes the next behavior you want. It must fail.

```js
test('calculates total with tax', () => {
  const cart = new Cart();
  cart.add({ price: 100, quantity: 2 });
  expect(cart.totalWithTax(0.1)).toBe(220);
});
```

**Rules:**
- Test ONE behavior per test
- Use descriptive names: `test('returns empty array when no results match')`
- The test must fail for the right reason (not a syntax error)

### 2. GREEN — Write Minimum Code to Pass
Write the simplest implementation that makes the test pass. No more.

```js
class Cart {
  constructor() { this.items = []; }
  add(item) { this.items.push(item); }
  totalWithTax(rate) {
    const subtotal = this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return subtotal * (1 + rate);
  }
}
```

**Rules:**
- Do NOT write code for future requirements
- Hardcode if it makes the test pass (you'll generalize in refactor)
- Run the test — it must pass

### 3. REFACTOR — Improve Without Changing Behavior
Clean up the code while keeping all tests green.

- Extract methods, rename variables, remove duplication
- Run tests after every change
- If a test breaks, undo and try a smaller refactor

## When TDD Works Best

- **New features**: Define behavior before implementation
- **Bug fixes**: Write a test that reproduces the bug, then fix it
- **Complex logic**: Business rules, calculations, state machines
- **API contracts**: Define expected inputs/outputs

## When TDD May Not Be Appropriate

- Prototyping / exploring solutions (write tests after)
- UI layout and styling (visual testing is better)
- Glue code with no logic (simple delegation)
- One-off scripts

## Arrange-Act-Assert Pattern

```js
test('removes item from cart', () => {
  // Arrange
  const cart = new Cart();
  cart.add({ id: 'a', price: 10, quantity: 1 });

  // Act
  cart.remove('a');

  // Assert
  expect(cart.items).toHaveLength(0);
});
```

## Test Naming Conventions

```
// describe + it (BDD style)
describe('Cart', () => {
  it('calculates subtotal for multiple items', () => { ... });
  it('returns zero for empty cart', () => { ... });
  it('throws when adding item with negative price', () => { ... });
});

// given/when/then
test('given an empty cart, when adding an item, then item count is 1', () => { ... });
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Testing implementation | Breaks on refactor | Test behavior/output only |
| Large test setup | Hard to understand | Extract fixtures, use builders |
| Tests depend on order | Flaky, fragile | Each test is independent |
| Too many mocks | Tests don't catch real bugs | Mock boundaries, not internals |
| No assertion | Test always passes | Every test must assert something |

## Checklist
- [ ] Each test covers one behavior
- [ ] Tests fail before implementation (RED confirmed)
- [ ] Minimum code written to pass (GREEN confirmed)
- [ ] Refactored with tests still passing
- [ ] Test names describe the scenario, not the implementation
- [ ] No test depends on another test's state
