#!/usr/bin/env node

/**
 * validate-skills.js - Validate skill definitions in .copilot/skills/.
 *
 * Usage:
 *   node validate-skills.js [--skills-dir <directory>]
 *
 * For every sub-directory under `.copilot/skills/`:
 *   1. Verifies that a `SKILL.md` file exists.
 *   2. Parses `SKILL.md` for required fields: name, description, triggers.
 *   3. Checks that any file paths referenced in the skill content actually exist.
 *   4. Reports pass / fail with details for each skill.
 *
 * Exits with code 0 when all skills pass, or code 1 if any fail.
 */

'use strict';

const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const path = require('node:path');
const { readFile, fileExists, parseMarkdown, log, pluralize, getProjectRoot, colours } = require('./lib/utils');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Required fields in a SKILL.md file.
 * These are checked as heading text (case-insensitive) or as
 * bold-label patterns like **Name:** within the document body.
 */
const REQUIRED_FIELDS = ['name', 'description', 'triggers'];

/** The expected skill definition filename. */
const SKILL_FILE = 'SKILL.md';

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { skillsDir: null, help: false };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--skills-dir':
      case '-d':
        if (i + 1 < args.length) {
          result.skillsDir = path.resolve(args[++i]);
        } else {
          log('error', '--skills-dir requires a directory argument.');
          process.exit(1);
        }
        break;

      case '--help':
      case '-h':
        result.help = true;
        break;

      default:
        if (!args[i].startsWith('-')) {
          result.skillsDir = path.resolve(args[i]);
        }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Field detection helpers
// ---------------------------------------------------------------------------

/**
 * Determine whether a required field is present in the SKILL.md content.
 *
 * We accept the field if:
 *   - A markdown heading contains the field name (e.g., `## Name` or `### Triggers`).
 *   - A bold-label pattern exists (e.g., `**Name:**` or `**Triggers:**`).
 *   - A YAML-like key exists at the start of a line (e.g., `name:` or `triggers:`).
 *
 * @param {string} field   - Required field name (lowercase).
 * @param {string} content - Raw markdown content.
 * @param {{ headings: Array<{ text: string }> }} parsed - Parsed markdown.
 * @returns {boolean}
 */
function hasField(field, content, parsed) {
  const lower = field.toLowerCase();

  // Check headings.
  if (parsed.headings.some((h) => h.text.toLowerCase().includes(lower))) {
    return true;
  }

  // Check bold labels: **Field:** or **Field**
  const boldRegex = new RegExp(`\\*\\*${field}\\*\\*\\s*:?`, 'i');
  if (boldRegex.test(content)) {
    return true;
  }

  // Check YAML-like key at start of line.
  const yamlRegex = new RegExp(`^${field}\\s*:`, 'im');
  if (yamlRegex.test(content)) {
    return true;
  }

  return false;
}

/**
 * Extract file path references from skill content.
 * Looks for patterns like:
 *   - `file: path/to/file`
 *   - `[link text](path/to/file)`
 *   - Inline code references to `.js`, `.ts`, `.md`, `.json` files
 *
 * @param {string} content  - Raw markdown content.
 * @param {string} skillDir - Absolute path to the skill directory (for resolving relative paths).
 * @returns {string[]} Absolute paths that were referenced.
 */
function extractFileReferences(content, skillDir) {
  const refs = new Set();

  // Pattern 1: YAML-like `file:` or `path:` references.
  const yamlFileRegex = /^(?:file|path|template)\s*:\s*(.+)$/gim;
  let match;
  while ((match = yamlFileRegex.exec(content)) !== null) {
    const refPath = match[1].trim().replace(/^['"]|['"]$/g, '');
    if (refPath && !refPath.startsWith('http')) {
      refs.add(path.resolve(skillDir, refPath));
    }
  }

  // Pattern 2: Markdown links to local files.
  const linkRegex = /\[.*?\]\(([^)]+)\)/g;
  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[1].trim();
    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
      refs.add(path.resolve(skillDir, href));
    }
  }

  return Array.from(refs);
}

// ---------------------------------------------------------------------------
// Validate a single skill directory
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} SkillResult
 * @property {string}   name        - Skill directory name.
 * @property {boolean}  pass        - Overall pass / fail.
 * @property {string[]} errors      - List of error messages.
 * @property {string[]} warnings    - List of warning messages.
 */

/**
 * Validate a single skill directory.
 *
 * @param {string} skillDir - Absolute path to the skill directory.
 * @returns {Promise<SkillResult>}
 */
async function validateSkill(skillDir) {
  const name = path.basename(skillDir);
  const errors = [];
  const warnings = [];

  // 1. Check for SKILL.md
  const skillFilePath = path.join(skillDir, SKILL_FILE);
  if (!(await fileExists(skillFilePath))) {
    errors.push(`Missing ${SKILL_FILE}`);
    return { name, pass: false, errors, warnings };
  }

  // 2. Read and parse SKILL.md
  const content = await readFile(skillFilePath);
  if (content === null) {
    errors.push(`Cannot read ${SKILL_FILE}`);
    return { name, pass: false, errors, warnings };
  }

  if (content.trim().length === 0) {
    errors.push(`${SKILL_FILE} is empty`);
    return { name, pass: false, errors, warnings };
  }

  const parsed = parseMarkdown(content);

  // 3. Check required fields.
  for (const field of REQUIRED_FIELDS) {
    if (!hasField(field, content, parsed)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // 4. Check referenced files.
  const fileRefs = extractFileReferences(content, skillDir);
  for (const refPath of fileRefs) {
    if (!(await fileExists(refPath))) {
      warnings.push(`Referenced file not found: ${path.relative(skillDir, refPath)}`);
    }
  }

  return {
    name,
    pass: errors.length === 0,
    errors,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs();

  if (opts.help) {
    console.log(`
Usage: node validate-skills.js [--skills-dir <directory>]

Validate all skill definitions under .copilot/skills/.

Options:
  --skills-dir, -d <dir>  Path to skills directory (default: .copilot/skills/)
  --help, -h              Show this help message
`);
    process.exit(0);
  }

  const projectRoot = getProjectRoot();
  const skillsDir = opts.skillsDir || path.join(projectRoot, '.copilot', 'skills');

  log('info', `Scanning skills directory: ${skillsDir}`);

  // Verify the skills directory exists.
  if (!(await fileExists(skillsDir))) {
    log('error', `Skills directory not found: ${skillsDir}`);
    process.exit(1);
  }

  // List sub-directories (each one is a skill).
  let entries;
  try {
    entries = await fsPromises.readdir(skillsDir, { withFileTypes: true });
  } catch (err) {
    log('error', `Cannot read skills directory: ${err.message}`);
    process.exit(1);
  }

  const skillDirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => path.join(skillsDir, e.name));

  if (skillDirs.length === 0) {
    log('warn', 'No skill directories found.');
    process.exit(0);
  }

  // Validate each skill.
  const results = [];
  for (const dir of skillDirs) {
    results.push(await validateSkill(dir));
  }

  // Report results.
  console.log('');
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;

  for (const result of results) {
    if (result.pass) {
      log('success', `${result.name}: valid`);
    } else {
      log('error', `${result.name}: INVALID`);
      for (const err of result.errors) {
        console.log(`    ${colours.red}- ${err}${colours.reset}`);
      }
    }

    // Show warnings regardless of pass/fail.
    for (const warn of result.warnings) {
      console.log(`    ${colours.yellow}! ${warn}${colours.reset}`);
    }
  }

  console.log('');
  log(
    'info',
    `Validation complete: ${pluralize(passed, 'skill')} passed, ${pluralize(failed, 'skill')} failed out of ${pluralize(results.length, 'skill')} total.`
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
