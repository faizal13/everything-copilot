#!/usr/bin/env node

/**
 * setup-package-manager.js - Configure the package manager for the project.
 *
 * Usage:
 *   node setup-package-manager.js [--pm <npm|yarn|pnpm|bun>]
 *
 * What it does:
 *   1. Detects the current package manager (or prompts if none found).
 *   2. Optionally lets the user switch to a different PM.
 *   3. Writes the appropriate configuration file (.npmrc, .yarnrc.yml, .pnpmrc).
 *   4. Updates package.json `scripts` entries if beneficial.
 *   5. Logs a summary of changes.
 */

'use strict';

const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const path = require('node:path');
const readline = require('node:readline');

const { log, readFile, writeFile, fileExists, getProjectRoot, colours } = require('./lib/utils');
const {
  detectPackageManager,
  getInstallCommand,
  getRunCommand,
  promptPackageManager,
  SUPPORTED_PMS,
} = require('./lib/package-manager');

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { pm: null, help: false };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--pm':
      case '-p':
        if (i + 1 < args.length) {
          result.pm = args[++i].toLowerCase();
          if (!SUPPORTED_PMS.includes(result.pm)) {
            log('error', `Unsupported package manager: ${result.pm}`);
            log('info', `Supported: ${SUPPORTED_PMS.join(', ')}`);
            process.exit(1);
          }
        } else {
          log('error', '--pm requires an argument (npm, yarn, pnpm, or bun).');
          process.exit(1);
        }
        break;

      case '--help':
      case '-h':
        result.help = true;
        break;

      default:
        if (!args[i].startsWith('-')) {
          result.pm = args[i].toLowerCase();
        }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Configuration file templates
// ---------------------------------------------------------------------------

/**
 * Return the config file contents for the chosen package manager.
 *
 * @param {string} pm
 * @returns {{ filename: string, content: string } | null}
 */
function getConfigTemplate(pm) {
  switch (pm) {
    case 'npm':
      return {
        filename: '.npmrc',
        content: [
          '# npm configuration for everything-copilot',
          '# See: https://docs.npmjs.com/cli/v10/configuring-npm/npmrc',
          '',
          '# Use exact versions when adding dependencies.',
          'save-exact=true',
          '',
          '# Automatically install peer dependencies.',
          'legacy-peer-deps=false',
          '',
          '# Engine strictness (uncomment to enforce Node.js version).',
          '# engine-strict=true',
          '',
        ].join('\n'),
      };

    case 'yarn':
      return {
        filename: '.yarnrc.yml',
        content: [
          '# Yarn configuration for everything-copilot',
          '# See: https://yarnpkg.com/configuration/yarnrc',
          '',
          'nodeLinker: node-modules',
          '',
          '# Enable immutable installs in CI.',
          '# enableImmutableInstalls: true',
          '',
        ].join('\n'),
      };

    case 'pnpm':
      return {
        filename: '.npmrc',
        content: [
          '# pnpm configuration for everything-copilot',
          '# See: https://pnpm.io/npmrc',
          '',
          '# Use exact versions when adding dependencies.',
          'save-exact=true',
          '',
          '# Hoist all dependencies (less strict, but more compatible).',
          'shamefully-hoist=true',
          '',
          '# Automatically install peer dependencies.',
          'auto-install-peers=true',
          '',
        ].join('\n'),
      };

    case 'bun':
      // Bun reads bunfig.toml for project-level config.
      return {
        filename: 'bunfig.toml',
        content: [
          '# Bun configuration for everything-copilot',
          '# See: https://bun.sh/docs/runtime/bunfig',
          '',
          '[install]',
          '# Use exact versions when adding dependencies.',
          'exact = true',
          '',
          '[install.lockfile]',
          '# Save the lockfile in text format for better diffs.',
          'print = "yarn"',
          '',
        ].join('\n'),
      };

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// package.json script helpers
// ---------------------------------------------------------------------------

/**
 * Add/update useful scripts in package.json for the chosen PM.
 *
 * @param {string} projectRoot
 * @param {string} pm
 */
async function updatePackageJsonScripts(projectRoot, pm) {
  const pkgPath = path.join(projectRoot, 'package.json');
  let pkg;

  try {
    const raw = await readFile(pkgPath);
    if (!raw) {
      log('warn', 'No package.json found; skipping script updates.');
      return;
    }
    pkg = JSON.parse(raw);
  } catch (err) {
    log('warn', `Could not parse package.json: ${err.message}`);
    return;
  }

  if (!pkg.scripts) {
    pkg.scripts = {};
  }

  // Only add scripts that do not already exist (never overwrite user scripts).
  const newScripts = {
    'copilot:validate-agents': 'node scripts/validate-agents.js',
    'copilot:validate-skills': 'node scripts/validate-skills.js',
    'copilot:init': 'node scripts/init-copilot.js',
  };

  let changed = false;
  for (const [name, cmd] of Object.entries(newScripts)) {
    if (!pkg.scripts[name]) {
      pkg.scripts[name] = cmd;
      changed = true;
    }
  }

  // Set the packageManager field (corepack convention).
  // Only set it if there is no existing value or the user is explicitly switching.
  if (!pkg.packageManager || !pkg.packageManager.startsWith(pm)) {
    // We use a generic version placeholder; the user should pin the real version.
    pkg.packageManager = `${pm}@*`;
    changed = true;
  }

  if (changed) {
    const serialised = JSON.stringify(pkg, null, 2) + '\n';
    const ok = await writeFile(pkgPath, serialised);
    if (ok) {
      log('success', 'Updated package.json scripts and packageManager field.');
    }
  } else {
    log('info', 'package.json scripts already up to date.');
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs();

  if (opts.help) {
    console.log(`
Usage: node setup-package-manager.js [--pm <npm|yarn|pnpm|bun>]

Detect or configure the package manager for this project.

Options:
  --pm, -p <name>  Explicitly set the package manager (npm, yarn, pnpm, bun)
  --help, -h       Show this help message
`);
    process.exit(0);
  }

  const projectRoot = getProjectRoot();

  // Step 1: Detect or select a PM.
  let pm = opts.pm;

  if (!pm) {
    const detected = detectPackageManager(projectRoot);
    if (detected) {
      log('info', `Detected package manager: ${detected}`);
      pm = detected;
    } else {
      log('info', 'No package manager detected.');
      // Interactive selection only when stdin is a TTY.
      if (process.stdin.isTTY) {
        pm = await promptPackageManager();
      } else {
        log('info', 'Non-interactive mode; defaulting to npm.');
        pm = 'npm';
      }
    }
  }

  log('info', `Configuring project for ${pm}...`);

  // Step 2: Write the PM config file.
  const template = getConfigTemplate(pm);
  if (template) {
    const configPath = path.join(projectRoot, template.filename);
    if (await fileExists(configPath)) {
      log('warn', `${template.filename} already exists; skipping (will not overwrite).`);
    } else {
      const ok = await writeFile(configPath, template.content);
      if (ok) {
        log('success', `Created ${template.filename}`);
      }
    }
  }

  // Step 3: Update package.json.
  await updatePackageJsonScripts(projectRoot, pm);

  // Step 4: Summary.
  console.log('');
  log('success', `Package manager configured: ${pm}`);
  console.log(`
Next steps:
  ${getInstallCommand(pm)}    # Install dependencies
`);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

main().catch((err) => {
  log('error', `Unexpected error: ${err.message}`);
  process.exit(1);
});
