#!/usr/bin/env node

'use strict';

const { assert, describe, test } = require('../run-all');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const pm = require('../../scripts/lib/package-manager');

// Helper to create a temp dir with a specific lockfile
function tmpDirWithFile(filename) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-test-'));
  if (filename) {
    fs.writeFileSync(path.join(dir, filename), '');
  }
  return dir;
}

function cleanup(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
}

// ---------------------------------------------------------------------------
// detectPackageManager
// ---------------------------------------------------------------------------

describe('detectPackageManager', () => {
  test('detects npm from package-lock.json', () => {
    const dir = tmpDirWithFile('package-lock.json');
    try {
      const result = pm.detectPackageManager(dir);
      assert.equal(result, 'npm');
    } finally {
      cleanup(dir);
    }
  });

  test('detects yarn from yarn.lock', () => {
    const dir = tmpDirWithFile('yarn.lock');
    try {
      const result = pm.detectPackageManager(dir);
      assert.equal(result, 'yarn');
    } finally {
      cleanup(dir);
    }
  });

  test('detects pnpm from pnpm-lock.yaml', () => {
    const dir = tmpDirWithFile('pnpm-lock.yaml');
    try {
      const result = pm.detectPackageManager(dir);
      assert.equal(result, 'pnpm');
    } finally {
      cleanup(dir);
    }
  });

  test('detects bun from bun.lockb', () => {
    const dir = tmpDirWithFile('bun.lockb');
    try {
      const result = pm.detectPackageManager(dir);
      assert.equal(result, 'bun');
    } finally {
      cleanup(dir);
    }
  });

  test('defaults to npm when no lockfile found', () => {
    const dir = tmpDirWithFile(null);
    try {
      const result = pm.detectPackageManager(dir);
      assert.equal(result, 'npm');
    } finally {
      cleanup(dir);
    }
  });
});

// ---------------------------------------------------------------------------
// getInstallCommand
// ---------------------------------------------------------------------------

describe('getInstallCommand', () => {
  test('returns npm install for npm', () => {
    assert.equal(pm.getInstallCommand('npm'), 'npm install');
  });

  test('returns yarn install for yarn', () => {
    assert.equal(pm.getInstallCommand('yarn'), 'yarn install');
  });

  test('returns pnpm install for pnpm', () => {
    assert.equal(pm.getInstallCommand('pnpm'), 'pnpm install');
  });

  test('returns bun install for bun', () => {
    assert.equal(pm.getInstallCommand('bun'), 'bun install');
  });
});

// ---------------------------------------------------------------------------
// getRunCommand
// ---------------------------------------------------------------------------

describe('getRunCommand', () => {
  test('returns npm run for npm', () => {
    assert.equal(pm.getRunCommand('npm'), 'npm run');
  });

  test('returns yarn for yarn (no run keyword needed)', () => {
    const result = pm.getRunCommand('yarn');
    assert.ok(result.startsWith('yarn'), 'Expected yarn-based run command');
  });
});

// ---------------------------------------------------------------------------
// getAddCommand
// ---------------------------------------------------------------------------

describe('getAddCommand', () => {
  test('returns npm install for npm regular dep', () => {
    const result = pm.getAddCommand('npm', false);
    assert.ok(result.includes('npm'), 'Expected npm add command');
  });

  test('returns dev flag for npm dev dep', () => {
    const result = pm.getAddCommand('npm', true);
    assert.ok(
      result.includes('--save-dev') || result.includes('-D'),
      'Expected dev flag in npm add command'
    );
  });

  test('returns yarn add for yarn', () => {
    const result = pm.getAddCommand('yarn', false);
    assert.ok(result.includes('yarn'), 'Expected yarn add command');
  });
});
