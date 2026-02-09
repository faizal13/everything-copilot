#!/usr/bin/env node

/**
 * run-all.js - Self-contained test runner for the everything-copilot project.
 *
 * Usage:
 *   node tests/run-all.js                  # Run all tests
 *   node tests/run-all.js --filter=lib     # Run only tests/lib/*.test.js
 *   node tests/run-all.js --filter=scripts # Run only tests/scripts/*.test.js
 *
 * No external dependencies required. Uses only built-in Node.js modules.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// ---------------------------------------------------------------------------
// ANSI colours
// ---------------------------------------------------------------------------

const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

// ---------------------------------------------------------------------------
// Built-in assertion library
// ---------------------------------------------------------------------------

const assert = {
  ok(value, message) {
    if (!value) {
      throw new Error(message || `Expected truthy value, got ${JSON.stringify(value)}`);
    }
  },

  equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
      );
    }
  },

  deepEqual(actual, expected, message) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) {
      throw new Error(message || `Deep equal failed:\n  actual:   ${a}\n  expected: ${e}`);
    }
  },

  throws(fn, message) {
    let threw = false;
    try {
      fn();
    } catch {
      threw = true;
    }
    if (!threw) {
      throw new Error(message || 'Expected function to throw, but it did not');
    }
  },

  notEqual(actual, expected, message) {
    if (actual === expected) {
      throw new Error(
        message || `Expected values to differ, but both are ${JSON.stringify(actual)}`
      );
    }
  },

  match(actual, pattern, message) {
    if (!pattern.test(actual)) {
      throw new Error(
        message || `Expected ${JSON.stringify(actual)} to match ${pattern}`
      );
    }
  },
};

// ---------------------------------------------------------------------------
// Test registration: describe() and test()
// ---------------------------------------------------------------------------

const _suites = [];
let _currentSuite = null;

function describe(name, fn) {
  const suite = { name, tests: [] };
  const prev = _currentSuite;
  _currentSuite = suite;
  fn();
  _currentSuite = prev;
  _suites.push(suite);
}

function test(name, fn) {
  if (_currentSuite) {
    _currentSuite.tests.push({ name, fn });
  } else {
    // Top-level test without describe block.
    let defaultSuite = _suites.find((s) => s.name === '(top-level)');
    if (!defaultSuite) {
      defaultSuite = { name: '(top-level)', tests: [] };
      _suites.push(defaultSuite);
    }
    defaultSuite.tests.push({ name, fn });
  }
}

// ---------------------------------------------------------------------------
// Runner logic
// ---------------------------------------------------------------------------

async function runSuites() {
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const suite of _suites) {
    console.log(`\n${c.bold}${c.cyan}  ${suite.name}${c.reset}`);
    for (const t of suite.tests) {
      try {
        const result = t.fn();
        if (result && typeof result.then === 'function') {
          await result;
        }
        passed++;
        console.log(`    ${c.green}PASS${c.reset} ${c.dim}${t.name}${c.reset}`);
      } catch (err) {
        failed++;
        console.log(`    ${c.red}FAIL${c.reset} ${t.name}`);
        console.log(`         ${c.red}${err.message}${c.reset}`);
        failures.push({ suite: suite.name, test: t.name, error: err.message });
      }
    }
  }

  return { passed, failed, failures };
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

function discoverTestFiles(baseDir, filter) {
  const results = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
        results.push(full);
      }
    }
  }

  if (filter) {
    const filterDir = path.join(baseDir, filter);
    if (fs.existsSync(filterDir)) {
      walk(filterDir);
    }
  } else {
    walk(baseDir);
  }

  return results.sort();
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const filterArg = args.find((a) => a.startsWith('--filter='));
  const filter = filterArg ? filterArg.split('=')[1] : null;

  const testsDir = path.dirname(__filename);
  const testFiles = discoverTestFiles(testsDir, filter);

  if (testFiles.length === 0) {
    console.log(`${c.yellow}No test files found.${c.reset}`);
    process.exit(0);
  }

  console.log(`${c.bold}Running ${testFiles.length} test file(s)...${c.reset}`);

  let totalPassed = 0;
  let totalFailed = 0;
  const allFailures = [];

  for (const file of testFiles) {
    const rel = path.relative(testsDir, file);
    console.log(`\n${c.bold}${c.cyan}--- ${rel} ---${c.reset}`);

    // Reset suites for each file.
    _suites.length = 0;
    _currentSuite = null;

    // Load and execute the test file.
    try {
      require(file);
    } catch (err) {
      console.log(`  ${c.red}ERROR loading file: ${err.message}${c.reset}`);
      totalFailed++;
      allFailures.push({ suite: rel, test: '(load)', error: err.message });
      continue;
    }

    const { passed, failed, failures } = await runSuites();
    totalPassed += passed;
    totalFailed += failed;
    allFailures.push(...failures);
  }

  // Summary
  console.log(`\n${c.bold}${'='.repeat(50)}${c.reset}`);
  console.log(
    `${c.bold}Results: ${c.green}${totalPassed} passed${c.reset}, ` +
      `${totalFailed > 0 ? c.red : c.dim}${totalFailed} failed${c.reset}`
  );

  if (allFailures.length > 0) {
    console.log(`\n${c.red}${c.bold}Failures:${c.reset}`);
    for (const f of allFailures) {
      console.log(`  ${c.red}- [${f.suite}] ${f.test}: ${f.error}${c.reset}`);
    }
  }

  console.log('');
  process.exit(totalFailed > 0 ? 1 : 0);
}

// ---------------------------------------------------------------------------
// Exports (so test files can import utilities)
// ---------------------------------------------------------------------------

module.exports = { assert, describe, test };

// Run if executed directly.
if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
