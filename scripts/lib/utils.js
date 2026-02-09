#!/usr/bin/env node

/**
 * utils.js - Cross-platform utility functions for the everything-copilot project.
 *
 * Provides file I/O helpers, project root detection, markdown parsing,
 * colored logging, and a simple pluralization helper.
 *
 * All built-in imports use the `node:` prefix for clarity.
 */

'use strict';

const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const path = require('node:path');

// ---------------------------------------------------------------------------
// ANSI colour helpers (gracefully degrades when NO_COLOR or TERM=dumb)
// ---------------------------------------------------------------------------

const supportsColor = (() => {
  if (process.env.NO_COLOR || process.env.TERM === 'dumb') return false;
  if (process.env.FORCE_COLOR) return true;
  if (process.stdout && typeof process.stdout.hasColors === 'function') {
    return process.stdout.hasColors();
  }
  return process.stdout.isTTY === true;
})();

const colours = supportsColor
  ? {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      dim: '\x1b[2m',
    }
  : { reset: '', red: '', green: '', yellow: '', blue: '', cyan: '', dim: '' };

// ---------------------------------------------------------------------------
// readFile(filePath) -> Promise<string>
// ---------------------------------------------------------------------------

/**
 * Read a file and return its contents as a UTF-8 string.
 * Returns `null` when the file does not exist or cannot be read.
 *
 * @param {string} filePath - Absolute or relative path to the file.
 * @returns {Promise<string|null>}
 */
async function readFile(filePath) {
  try {
    const resolved = path.resolve(filePath);
    const content = await fsPromises.readFile(resolved, 'utf-8');
    return content;
  } catch (err) {
    if (err.code === 'ENOENT') {
      log('warn', `File not found: ${filePath}`);
      return null;
    }
    log('error', `Failed to read file ${filePath}: ${err.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// writeFile(filePath, content) -> Promise<boolean>
// ---------------------------------------------------------------------------

/**
 * Write content to a file, creating intermediate directories as needed.
 * Returns `true` on success, `false` on failure.
 *
 * @param {string} filePath - Absolute or relative path to the file.
 * @param {string} content  - String content to write.
 * @returns {Promise<boolean>}
 */
async function writeFile(filePath, content) {
  try {
    const resolved = path.resolve(filePath);
    const dir = path.dirname(resolved);

    // Ensure the parent directory tree exists (recursive mkdir).
    await fsPromises.mkdir(dir, { recursive: true });
    await fsPromises.writeFile(resolved, content, 'utf-8');
    return true;
  } catch (err) {
    log('error', `Failed to write file ${filePath}: ${err.message}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// fileExists(filePath) -> Promise<boolean>
// ---------------------------------------------------------------------------

/**
 * Check whether a file (or directory) exists at the given path.
 *
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
async function fileExists(filePath) {
  try {
    const resolved = path.resolve(filePath);
    await fsPromises.access(resolved, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// listFiles(dir, pattern) -> Promise<string[]>
// ---------------------------------------------------------------------------

/**
 * Recursively list files under `dir` that match `pattern`.
 *
 * `pattern` is a simple glob-like string:
 *   - `*`    matches any sequence of characters except path separators
 *   - `**`   matches any sequence of characters *including* path separators
 *   - `.ext` is compared literally
 *
 * This is a lightweight, dependency-free implementation.  For heavy-duty
 * globbing, consider the `glob` or `fast-glob` packages.
 *
 * @param {string} dir     - Directory to search.
 * @param {string} pattern - Simple glob pattern (e.g. "*.md", "**\/*.js").
 * @returns {Promise<string[]>} Absolute paths of matching files.
 */
async function listFiles(dir, pattern = '*') {
  const resolved = path.resolve(dir);
  const results = [];

  // Convert the simple glob pattern into a regular expression.
  const regexStr = pattern
    .replace(/\./g, '\\.') // Escape dots
    .replace(/\*\*/g, '{{GLOBSTAR}}') // Placeholder for **
    .replace(/\*/g, '[^/\\\\]*') // * -> anything except path sep
    .replace(/\{\{GLOBSTAR\}\}/g, '.*'); // ** -> anything
  const regex = new RegExp(`^${regexStr}$`);

  async function walk(currentDir) {
    let entries;
    try {
      entries = await fsPromises.readdir(currentDir, { withFileTypes: true });
    } catch {
      return; // Skip directories we cannot read.
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        // Build the relative path from `resolved` and test the pattern.
        const rel = path.relative(resolved, fullPath).split(path.sep).join('/');
        if (regex.test(rel) || regex.test(entry.name)) {
          results.push(fullPath);
        }
      }
    }
  }

  await walk(resolved);
  return results.sort();
}

// ---------------------------------------------------------------------------
// getProjectRoot() -> string
// ---------------------------------------------------------------------------

/**
 * Walk up from `process.cwd()` until we find a directory that contains
 * `package.json` **or** `.git`.  Returns the first match, or `process.cwd()`
 * if neither marker is found (i.e. we hit the filesystem root).
 *
 * This function is *synchronous* because it is typically called once during
 * startup to resolve paths.
 *
 * @returns {string} Absolute path of the project root.
 */
function getProjectRoot() {
  let current = process.cwd();

  while (true) {
    // Check for common project root markers.
    if (
      fs.existsSync(path.join(current, 'package.json')) ||
      fs.existsSync(path.join(current, '.git'))
    ) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      // Reached the filesystem root without finding a marker.
      return process.cwd();
    }
    current = parent;
  }
}

// ---------------------------------------------------------------------------
// parseMarkdown(content) -> { headings, sections }
// ---------------------------------------------------------------------------

/**
 * Extract headings and their associated content sections from markdown text.
 *
 * @param {string} content - Raw markdown string.
 * @returns {{ headings: Array<{ level: number, text: string, line: number }>, sections: Record<string, string> }}
 *   `headings` is an ordered list of every heading found.
 *   `sections` maps each heading text (lower-cased) to the body text
 *   that follows it (up to the next heading of equal or higher level).
 */
function parseMarkdown(content) {
  if (!content || typeof content !== 'string') {
    return { headings: [], sections: {} };
  }

  const lines = content.split(/\r?\n/);
  const headings = [];
  const sections = {};

  // First pass: identify all headings.
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: i,
      });
    }
  }

  // Second pass: extract section bodies.
  for (let h = 0; h < headings.length; h++) {
    const startLine = headings[h].line + 1;
    const endLine = h + 1 < headings.length ? headings[h + 1].line : lines.length;
    const body = lines.slice(startLine, endLine).join('\n').trim();
    sections[headings[h].text.toLowerCase()] = body;
  }

  return { headings, sections };
}

// ---------------------------------------------------------------------------
// log(level, message)
// ---------------------------------------------------------------------------

/**
 * Write a coloured, prefixed log message to the console.
 *
 * @param {'info'|'warn'|'error'|'success'} level
 * @param {string} message
 */
function log(level, message) {
  const prefixes = {
    info: `${colours.blue}[INFO]${colours.reset}`,
    warn: `${colours.yellow}[WARN]${colours.reset}`,
    error: `${colours.red}[ERROR]${colours.reset}`,
    success: `${colours.green}[OK]${colours.reset}`,
  };

  const prefix = prefixes[level] || prefixes.info;
  const stream = level === 'error' ? process.stderr : process.stdout;
  stream.write(`${prefix} ${message}\n`);
}

// ---------------------------------------------------------------------------
// pluralize(count, singular, plural)
// ---------------------------------------------------------------------------

/**
 * Return the singular or plural form of a word depending on `count`.
 *
 * @param {number} count
 * @param {string} singular - e.g. "file"
 * @param {string} [plural] - e.g. "files". Defaults to `singular + 's'`.
 * @returns {string} e.g. "3 files" or "1 file".
 */
function pluralize(count, singular, plural) {
  const form = count === 1 ? singular : (plural || `${singular}s`);
  return `${count} ${form}`;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  readFile,
  writeFile,
  fileExists,
  listFiles,
  getProjectRoot,
  parseMarkdown,
  log,
  pluralize,
  // Re-export colours for other scripts that want them.
  colours,
};
