#!/usr/bin/env node

/**
 * package-manager.js - Package manager detection and command generation.
 *
 * Detects which package manager (npm, yarn, pnpm, bun) is in use by
 * inspecting lockfiles, and provides helpers that return the correct
 * CLI commands for each manager.
 *
 * Also includes an interactive prompt for manual selection when no
 * lockfile is found.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

// ---------------------------------------------------------------------------
// Lockfile -> package manager mapping
// ---------------------------------------------------------------------------

/**
 * Ordered list of lockfile names and the package manager they belong to.
 * Checked in order; the first match wins.
 */
const LOCKFILE_MAP = [
  { file: 'bun.lockb', pm: 'bun' },
  { file: 'bun.lock', pm: 'bun' },
  { file: 'pnpm-lock.yaml', pm: 'pnpm' },
  { file: 'yarn.lock', pm: 'yarn' },
  { file: 'package-lock.json', pm: 'npm' },
];

/**
 * The set of supported package managers.
 * @type {readonly ['npm', 'yarn', 'pnpm', 'bun']}
 */
const SUPPORTED_PMS = ['npm', 'yarn', 'pnpm', 'bun'];

// ---------------------------------------------------------------------------
// detectPackageManager(projectRoot) -> string | null
// ---------------------------------------------------------------------------

/**
 * Detect the package manager in use by scanning for lockfiles in
 * `projectRoot`.  Returns the name of the detected package manager
 * (`'npm'`, `'yarn'`, `'pnpm'`, or `'bun'`) or `null` if none is found.
 *
 * Also checks for the `packageManager` field in `package.json` as a
 * secondary signal.
 *
 * @param {string} [projectRoot=process.cwd()] - Directory to inspect.
 * @returns {string|null}
 */
function detectPackageManager(projectRoot = process.cwd()) {
  const root = path.resolve(projectRoot);

  // 1. Check lockfiles (most reliable signal).
  for (const { file, pm } of LOCKFILE_MAP) {
    if (fs.existsSync(path.join(root, file))) {
      return pm;
    }
  }

  // 2. Check the `packageManager` field in package.json (corepack convention).
  try {
    const pkgPath = path.join(root, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (typeof pkg.packageManager === 'string') {
        // Format: "pnpm@8.15.0" or "yarn@4.0.2+sha256.abc..."
        const name = pkg.packageManager.split('@')[0];
        if (SUPPORTED_PMS.includes(name)) {
          return name;
        }
      }
    }
  } catch {
    // Ignore parse errors - we will fall through to null.
  }

  return null;
}

// ---------------------------------------------------------------------------
// getInstallCommand(pm) -> string
// ---------------------------------------------------------------------------

/**
 * Return the command that installs all dependencies for the given PM.
 *
 * @param {string} pm - One of 'npm', 'yarn', 'pnpm', 'bun'.
 * @returns {string}
 */
function getInstallCommand(pm) {
  const commands = {
    npm: 'npm install',
    yarn: 'yarn install',
    pnpm: 'pnpm install',
    bun: 'bun install',
  };
  return commands[pm] || 'npm install';
}

// ---------------------------------------------------------------------------
// getRunCommand(pm) -> string
// ---------------------------------------------------------------------------

/**
 * Return the command prefix used to run package.json scripts.
 *
 * @param {string} pm - One of 'npm', 'yarn', 'pnpm', 'bun'.
 * @returns {string}
 */
function getRunCommand(pm) {
  const commands = {
    npm: 'npm run',
    yarn: 'yarn',
    pnpm: 'pnpm run',
    bun: 'bun run',
  };
  return commands[pm] || 'npm run';
}

// ---------------------------------------------------------------------------
// getAddCommand(pm, dev) -> string
// ---------------------------------------------------------------------------

/**
 * Return the command used to add a dependency.
 *
 * @param {string}  pm  - One of 'npm', 'yarn', 'pnpm', 'bun'.
 * @param {boolean} [dev=false] - Whether to add as a dev dependency.
 * @returns {string}
 */
function getAddCommand(pm, dev = false) {
  const devFlag = {
    npm: '--save-dev',
    yarn: '--dev',
    pnpm: '--save-dev',
    bun: '--dev',
  };

  const base = {
    npm: 'npm install',
    yarn: 'yarn add',
    pnpm: 'pnpm add',
    bun: 'bun add',
  };

  const cmd = base[pm] || 'npm install';
  return dev ? `${cmd} ${devFlag[pm] || '--save-dev'}` : cmd;
}

// ---------------------------------------------------------------------------
// promptPackageManager() -> Promise<string>
// ---------------------------------------------------------------------------

/**
 * Interactively ask the user to choose a package manager from the supported
 * list.  Works in any terminal that supports readline (cross-platform).
 *
 * Returns a Promise that resolves with the chosen PM name.
 *
 * @returns {Promise<string>}
 */
function promptPackageManager() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\nWhich package manager would you like to use?\n');
    SUPPORTED_PMS.forEach((pm, i) => {
      console.log(`  ${i + 1}) ${pm}`);
    });
    console.log('');

    const ask = () => {
      rl.question('Enter number (1-4) or name: ', (answer) => {
        const trimmed = answer.trim().toLowerCase();

        // Accept numeric choice.
        const num = parseInt(trimmed, 10);
        if (num >= 1 && num <= SUPPORTED_PMS.length) {
          rl.close();
          return resolve(SUPPORTED_PMS[num - 1]);
        }

        // Accept name directly.
        if (SUPPORTED_PMS.includes(trimmed)) {
          rl.close();
          return resolve(trimmed);
        }

        console.log('  Invalid choice. Please try again.');
        ask();
      });
    };

    ask();
  });
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  SUPPORTED_PMS,
  LOCKFILE_MAP,
  detectPackageManager,
  getInstallCommand,
  getRunCommand,
  getAddCommand,
  promptPackageManager,
};
