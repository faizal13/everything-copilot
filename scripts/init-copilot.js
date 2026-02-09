#!/usr/bin/env node

/**
 * init-copilot.js - Initialize a Copilot workspace in a target directory.
 *
 * Usage:
 *   node init-copilot.js [--target <directory>]
 *
 * What it does:
 *   1. Resolves the target directory (defaults to cwd).
 *   2. Checks whether `.copilot/` already exists in the target.
 *   3. Copies the template `.copilot/` tree from *this* project into the target.
 *   4. Prints success information and next steps.
 */

'use strict';

const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const path = require('node:path');
const { log, fileExists } = require('./lib/utils');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Directory name we manage. */
const COPILOT_DIR = '.copilot';

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

/**
 * Minimal argument parser. Supports `--target <dir>` and `--help`.
 *
 * @returns {{ target: string, help: boolean }}
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = { target: process.cwd(), help: false };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--target':
      case '-t':
        if (i + 1 < args.length) {
          result.target = path.resolve(args[++i]);
        } else {
          log('error', '--target requires a directory argument.');
          process.exit(1);
        }
        break;

      case '--help':
      case '-h':
        result.help = true;
        break;

      default:
        // Treat a bare positional argument as the target.
        if (!args[i].startsWith('-')) {
          result.target = path.resolve(args[i]);
        } else {
          log('warn', `Unknown option: ${args[i]}`);
        }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Recursive copy helper
// ---------------------------------------------------------------------------

/**
 * Recursively copy `src` directory to `dest`, creating directories as needed.
 * Works cross-platform (no shell commands).
 *
 * @param {string} src  - Source directory (absolute path).
 * @param {string} dest - Destination directory (absolute path).
 */
async function copyDirRecursive(src, dest) {
  await fsPromises.mkdir(dest, { recursive: true });

  const entries = await fsPromises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      await fsPromises.copyFile(srcPath, destPath);
    }
    // Symlinks and other special entries are intentionally skipped.
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs();

  if (opts.help) {
    console.log(`
Usage: node init-copilot.js [--target <directory>]

Initialise a .copilot/ workspace in the target directory.

Options:
  --target, -t <dir>  Directory to initialise (default: current directory)
  --help,   -h        Show this help message
`);
    process.exit(0);
  }

  const targetDir = opts.target;
  const destCopilot = path.join(targetDir, COPILOT_DIR);

  // Locate the template .copilot/ directory shipped with this project.
  // It lives alongside the scripts/ folder in the repo root.
  const scriptDir = __dirname;
  const projectRoot = path.resolve(scriptDir, '..');
  const srcCopilot = path.join(projectRoot, COPILOT_DIR);

  // --------------------------------------------------
  // Pre-flight checks
  // --------------------------------------------------

  // Verify the source template exists.
  if (!(await fileExists(srcCopilot))) {
    log('error', `Template ${COPILOT_DIR}/ not found at ${srcCopilot}.`);
    log('error', 'Make sure you are running this script from the everything-copilot repo.');
    process.exit(1);
  }

  // Verify the target directory exists.
  if (!(await fileExists(targetDir))) {
    log('error', `Target directory does not exist: ${targetDir}`);
    process.exit(1);
  }

  // Warn (but do not abort) if .copilot/ already exists in the target.
  if (await fileExists(destCopilot)) {
    log('warn', `${COPILOT_DIR}/ already exists in ${targetDir}.`);
    log('warn', 'Existing files will be overwritten. Press Ctrl+C to abort.');
    // Give a brief pause so the user can read the warning in interactive mode.
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  // --------------------------------------------------
  // Copy
  // --------------------------------------------------

  log('info', `Copying ${COPILOT_DIR}/ to ${targetDir} ...`);

  try {
    await copyDirRecursive(srcCopilot, destCopilot);
  } catch (err) {
    log('error', `Copy failed: ${err.message}`);
    process.exit(1);
  }

  // --------------------------------------------------
  // Success
  // --------------------------------------------------

  log('success', `${COPILOT_DIR}/ workspace initialised in ${targetDir}`);
  console.log(`
Next steps:

  1. Review ${COPILOT_DIR}/instructions/ for your coding guidelines.
  2. Customise skills in ${COPILOT_DIR}/skills/ to match your project.
  3. Validate your setup:

       node ${path.relative(targetDir, path.join(scriptDir, 'validate-agents.js'))}
       node ${path.relative(targetDir, path.join(scriptDir, 'validate-skills.js'))}

  4. Start coding with Copilot!
`);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

main().catch((err) => {
  log('error', `Unexpected error: ${err.message}`);
  process.exit(1);
});
