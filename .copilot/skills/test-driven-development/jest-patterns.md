# Jest Patterns

## Configuration

```js
// jest.config.js
module.exports = {
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverageFrom: ['src/**/*.{js,ts,jsx,tsx}', '!src/**/*.d.ts'],
  coverageThreshold: { global: { branches: 80, functions: 80, lines: 80, statements: 80 } },
  setupFilesAfterSetup: ['./jest.setup.js'],
};
```

## Mocking

### Module Mocks

```js
// Mock entire module
jest.mock('./database');
const db = require('./database');
db.query.mockResolvedValue([{ id: 1, name: 'Alice' }]);

// Mock with implementation
jest.mock('./logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));
```

### Function Mocks

```js
const callback = jest.fn();
callback.mockReturnValue(42);
callback.mockReturnValueOnce(1).mockReturnValueOnce(2);

// Assertions
expect(callback).toHaveBeenCalledTimes(2);
expect(callback).toHaveBeenCalledWith('arg1', expect.any(Number));
```

### Spy on Methods

```js
const spy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
// ... run code ...
expect(spy).toHaveBeenCalled();
spy.mockRestore(); // Clean up
```

## Async Testing

```js
// async/await
test('fetches user', async () => {
  const user = await getUser(1);
  expect(user.name).toBe('Alice');
});

// resolves/rejects
test('rejects with not found', async () => {
  await expect(getUser(999)).rejects.toThrow('Not found');
});

// Fake timers
test('debounce fires after delay', () => {
  jest.useFakeTimers();
  const fn = jest.fn();
  const debounced = debounce(fn, 300);

  debounced();
  expect(fn).not.toHaveBeenCalled();

  jest.advanceTimersByTime(300);
  expect(fn).toHaveBeenCalledTimes(1);

  jest.useRealTimers();
});
```

## Snapshot Testing

```js
test('renders user card', () => {
  const { container } = render(<UserCard name="Alice" role="Admin" />);
  expect(container).toMatchSnapshot();
});

// Inline snapshots (easier to review)
test('formats date', () => {
  expect(formatDate('2024-01-15')).toMatchInlineSnapshot(`"January 15, 2024"`);
});
```

**When to use snapshots:**
- Serializable output (JSON, HTML, rendered components)
- NOT for logic testing — use explicit assertions instead

**When to update:** `jest --updateSnapshot` — review every change carefully

## Setup and Teardown

```js
describe('Database tests', () => {
  beforeAll(async () => { await db.connect(); });
  afterAll(async () => { await db.disconnect(); });

  beforeEach(async () => { await db.seed(); });
  afterEach(async () => { await db.clean(); });

  test('inserts record', async () => { /* ... */ });
});
```

## Custom Matchers

```js
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () => `expected ${received} to be within [${floor}, ${ceiling}]`,
    };
  },
});

test('score is passing', () => {
  expect(score).toBeWithinRange(70, 100);
});
```

## Checklist
- [ ] Coverage thresholds configured (80%+ recommended)
- [ ] Module mocks restore after each test (mockRestore/mockClear)
- [ ] Async tests use async/await (no done callback unless necessary)
- [ ] Fake timers cleaned up with `jest.useRealTimers()`
- [ ] Snapshots reviewed on every update — no blind `--updateSnapshot`
- [ ] No test depends on execution order
