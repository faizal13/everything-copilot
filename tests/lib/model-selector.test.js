#!/usr/bin/env node

'use strict';

const { assert, describe, test } = require('../run-all');
const ms = require('../../scripts/lib/model-selector');

// ---------------------------------------------------------------------------
// selectModel
// ---------------------------------------------------------------------------

describe('selectModel', () => {
  test('routes architecture tasks to opus', () => {
    const model = ms.selectModel('architecture');
    assert.equal(model, 'opus');
  });

  test('routes security tasks to opus', () => {
    const model = ms.selectModel('security');
    assert.equal(model, 'opus');
  });

  test('routes implementation tasks to sonnet', () => {
    const model = ms.selectModel('implementation');
    assert.equal(model, 'sonnet');
  });

  test('routes tdd tasks to sonnet', () => {
    const model = ms.selectModel('tdd');
    assert.equal(model, 'sonnet');
  });

  test('routes code-review tasks to sonnet', () => {
    const model = ms.selectModel('code-review');
    assert.equal(model, 'sonnet');
  });

  test('routes documentation tasks to haiku', () => {
    const model = ms.selectModel('documentation');
    assert.equal(model, 'haiku');
  });

  test('routes formatting tasks to haiku', () => {
    const model = ms.selectModel('formatting');
    assert.equal(model, 'haiku');
  });

  test('defaults to sonnet for unknown task type', () => {
    const model = ms.selectModel('unknown-task-xyz');
    assert.equal(model, 'sonnet');
  });
});

// ---------------------------------------------------------------------------
// getModelConfig
// ---------------------------------------------------------------------------

describe('getModelConfig', () => {
  test('returns config for opus', () => {
    const config = ms.getModelConfig('opus');
    assert.ok(config, 'Expected config object for opus');
    assert.ok(config.maxOutput > 0, 'Expected positive maxOutput');
  });

  test('returns config for sonnet', () => {
    const config = ms.getModelConfig('sonnet');
    assert.ok(config, 'Expected config object for sonnet');
  });

  test('returns config for haiku', () => {
    const config = ms.getModelConfig('haiku');
    assert.ok(config, 'Expected config object for haiku');
  });
});

// ---------------------------------------------------------------------------
// estimateTokens
// ---------------------------------------------------------------------------

describe('estimateTokens', () => {
  test('estimates ~25 tokens for 100 characters', () => {
    const text = 'a'.repeat(100);
    const tokens = ms.estimateTokens(text);
    assert.equal(tokens, 25);
  });

  test('returns 0 for empty string', () => {
    assert.equal(ms.estimateTokens(''), 0);
  });

  test('rounds up partial tokens', () => {
    const tokens = ms.estimateTokens('hi'); // 2 chars → 0.5 → ceil = 1
    assert.ok(tokens >= 1, 'Expected at least 1 token');
  });
});

// ---------------------------------------------------------------------------
// isWithinBudget
// ---------------------------------------------------------------------------

describe('isWithinBudget', () => {
  test('returns true with sufficient budget', () => {
    assert.ok(ms.isWithinBudget('sonnet', 1000, 5000));
  });

  test('returns false with insufficient budget', () => {
    assert.equal(ms.isWithinBudget('opus', 100000, 0.001), false);
  });
});

// ---------------------------------------------------------------------------
// TASK_CATEGORIES
// ---------------------------------------------------------------------------

describe('TASK_CATEGORIES', () => {
  test('has expected categories', () => {
    assert.ok(ms.TASK_CATEGORIES, 'Expected TASK_CATEGORIES to be exported');
    assert.ok(typeof ms.TASK_CATEGORIES === 'object', 'Expected object');
  });
});
