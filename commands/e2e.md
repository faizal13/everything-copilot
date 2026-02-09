# /e2e

## Overview

The E2E command generates end-to-end tests for a described user flow. It maps the flow into discrete steps, creates Playwright or Cypress test code with meaningful assertions, and scaffolds page objects when the flow interacts with multiple pages or complex UI components.

**Model:** Sonnet 4.5

## Usage

```
/e2e <user flow description>
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `user flow description` | Yes | A plain-language description of the user journey to test |

## Prerequisites

- An E2E test framework installed in the project (Playwright or Cypress).
- The application must be runnable locally or have a configured test environment URL.
- Existing page objects or test utilities in the project will be reused when detected.

## Workflow Steps

1. **Map User Flow** -- Parse the description into an ordered sequence of user actions (navigate, click, type, wait, assert). Identify pages, components, and data involved.
2. **Generate Test Code** -- Create a test file using the detected framework (Playwright by default, Cypress if configured). Each step becomes a test action with appropriate selectors.
3. **Add Assertions** -- Insert assertions at each meaningful checkpoint: page load confirmations, element visibility, API response validations, and final state verification.
4. **Create Page Objects** -- If the flow spans multiple pages or interacts with reusable UI patterns, generate page object classes to encapsulate selectors and common actions.

## Example

```
/e2e User logs in, adds item to cart, and completes checkout
```

**Interaction:**

```
Mapping user flow...
Detected framework: Playwright
Pages involved: Login, Products, Cart, Checkout

Generated files:
  tests/e2e/checkout-flow.spec.ts
  tests/e2e/pages/login.page.ts
  tests/e2e/pages/products.page.ts
  tests/e2e/pages/cart.page.ts
  tests/e2e/pages/checkout.page.ts

## Test: checkout-flow.spec.ts

test('user can log in, add to cart, and checkout', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.authenticate('testuser@example.com', 'password');

  const products = new ProductsPage(page);
  await products.addFirstItemToCart();
  await expect(products.cartBadge).toHaveText('1');

  const cart = new CartPage(page);
  await cart.goto();
  await cart.proceedToCheckout();

  const checkout = new CheckoutPage(page);
  await checkout.fillShippingInfo(testData.shipping);
  await checkout.confirmOrder();
  await expect(checkout.successMessage).toBeVisible();
});
```

## Output Format

The command produces:

- A test spec file containing one or more test cases covering the described flow.
- Page object files (one per page/component) when the flow warrants them.
- A summary listing all generated files and the number of assertions added.

```
Generated:
  - tests/e2e/checkout-flow.spec.ts (1 test, 4 assertions)
  - tests/e2e/pages/login.page.ts
  - tests/e2e/pages/products.page.ts
  - tests/e2e/pages/cart.page.ts
  - tests/e2e/pages/checkout.page.ts
```

## Notes

- The command auto-detects whether Playwright or Cypress is installed and generates appropriate syntax.
- Selectors prefer `data-testid` attributes. If not found, it falls back to accessible roles and text content.
- For complex flows, break the description into smaller steps for more focused tests.
- Generated tests are meant as a starting point -- review selectors and test data before committing.
- Run generated tests with your standard test runner (e.g., `npx playwright test`).
