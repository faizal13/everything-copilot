#!/usr/bin/env node

/**
 * validate-agents.js - Validate the AGENTS.md file.
 *
 * Usage:
 *   node validate-agents.js [--path <agents-md-path>]
 *
 * Reads the `.copilot/AGENTS.md` file (or a custom path), parses its
 * markdown structure, and verifies that every agent section includes
 * the required sub-sections:
 *
 *   - Description
 *   - Model
 *   - Tools
 *   - Constraints
 *
 * Exits with code 0 when all agents pass, or code 1 if any fail.
 */

'use strict';

const path = require('node:path');
const { readFile, parseMarkdown, log, pluralize, getProjectRoot, colours } = require('./lib/utils');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Sub-sections that every agent definition must contain (case-insensitive).
 */
const REQUIRED_SECTIONS = ['description', 'model', 'tools', 'constraints'];

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { path: null, help: false };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--path':
      case '-p':
        if (i + 1 < args.length) {
          result.path = path.resolve(args[++i]);
        } else {
          log('error', '--path requires a file argument.');
          process.exit(1);
        }
        break;

      case '--help':
      case '-h':
        result.help = true;
        break;

      default:
        if (!args[i].startsWith('-')) {
          result.path = path.resolve(args[i]);
        }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Validation logic
// ---------------------------------------------------------------------------

/**
 * Parse the AGENTS.md content and validate each agent section.
 *
 * The expected structure is:
 *
 *   # AGENTS
 *   ## Agent Name
 *   ### Description
 *   ...
 *   ### Model
 *   ...
 *   ### Tools
 *   ...
 *   ### Constraints
 *   ...
 *
 * Level-2 headings (##) are treated as agent names.
 * Level-3 headings (###) under each agent are the required sub-sections.
 *
 * @param {string} content - Raw markdown content.
 * @returns {{ agents: Array<{ name: string, pass: boolean, missing: string[], found: string[] }>, passed: number, failed: number }}
 */
function validateAgents(content) {
  const { headings } = parseMarkdown(content);

  // Find all level-2 headings (agent names).
  const agentHeadings = headings.filter((h) => h.level === 2);

  if (agentHeadings.length === 0) {
    return { agents: [], passed: 0, failed: 0 };
  }

  const results = [];

  for (let a = 0; a < agentHeadings.length; a++) {
    const agentName = agentHeadings[a].text;
    const agentLine = agentHeadings[a].line;

    // Determine the range of lines belonging to this agent:
    // from its heading to the next level-2 heading (or end of file).
    const nextAgentLine =
      a + 1 < agentHeadings.length ? agentHeadings[a + 1].line : Infinity;

    // Collect level-3 headings within this agent's range.
    const subHeadings = headings
      .filter((h) => h.level === 3 && h.line > agentLine && h.line < nextAgentLine)
      .map((h) => h.text.toLowerCase());

    const found = [];
    const missing = [];

    for (const req of REQUIRED_SECTIONS) {
      if (subHeadings.some((s) => s.includes(req))) {
        found.push(req);
      } else {
        missing.push(req);
      }
    }

    results.push({
      name: agentName,
      pass: missing.length === 0,
      missing,
      found,
    });
  }

  return {
    agents: results,
    passed: results.filter((r) => r.pass).length,
    failed: results.filter((r) => !r.pass).length,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs();

  if (opts.help) {
    console.log(`
Usage: node validate-agents.js [--path <agents-md-path>]

Validate the AGENTS.md file for the everything-copilot project.

Options:
  --path, -p <file>  Path to AGENTS.md (default: .copilot/AGENTS.md)
  --help, -h         Show this help message
`);
    process.exit(0);
  }

  // Resolve the file path.
  const projectRoot = getProjectRoot();
  const agentsPath = opts.path || path.join(projectRoot, '.copilot', 'AGENTS.md');

  log('info', `Validating: ${agentsPath}`);

  // Read the file.
  const content = await readFile(agentsPath);
  if (content === null) {
    log('error', `Cannot read AGENTS.md at ${agentsPath}`);
    process.exit(1);
  }

  // Validate.
  const { agents, passed, failed } = validateAgents(content);

  if (agents.length === 0) {
    log('warn', 'No agent definitions (## headings) found in AGENTS.md.');
    log('warn', 'Expected level-2 headings (## Agent Name) with sub-sections.');
    process.exit(1);
  }

  // Report results.
  console.log('');
  for (const agent of agents) {
    if (agent.pass) {
      log('success', `${agent.name}: all required sections present`);
    } else {
      log('error', `${agent.name}: missing sections: ${agent.missing.join(', ')}`);
      if (agent.found.length > 0) {
        log('info', `  Found: ${agent.found.join(', ')}`);
      }
    }
  }

  console.log('');
  log(
    'info',
    `Validation complete: ${pluralize(passed, 'agent')} passed, ${pluralize(failed, 'agent')} failed.`
  );

  process.exit(failed > 0 ? 1 : 0);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

main().catch((err) => {
  log('error', `Unexpected error: ${err.message}`);
  process.exit(1);
});
