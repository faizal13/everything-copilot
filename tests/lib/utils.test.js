#!/usr/bin/env node

/**
 * Tests for scripts/lib/utils.js
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { assert, describe, test } = require('../run-all.js');

const utils = require('../../scripts/lib/utils.js');

// Helper: create a temp directory for file I/O tests.
function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'utils-test-'));
}

// ---------------------------------------------------------------------------
// readFile
// ---------------------------------------------------------------------------

describe('readFile', () => {
  test('reads an existing file and returns its content', async () => {
    const tmp = makeTmpDir();
    const file = path.join(tmp, 'hello.txt');
    fs.writeFileSync(file, 'hello world', 'utf-8');

    const content = await utils.readFile(file);
    assert.equal(content, 'hello world');

    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('returns null for a non-existent file', async () => {
    const content = await utils.readFile('/tmp/__does_not_exist_99999__.txt');
    assert.equal(content, null);
  });
});

// ---------------------------------------------------------------------------
// writeFile
// ---------------------------------------------------------------------------

describe('writeFile', () => {
  test('creates file and parent directories', async () => {
    const tmp = makeTmpDir();
    const file = path.join(tmp, 'deep', 'nested', 'output.txt');

    const ok = await utils.writeFile(file, 'created');
    assert.equal(ok, true);

    const content = fs.readFileSync(file, 'utf-8');
    assert.equal(content, 'created');

    fs.rmSync(tmp, { recursive: true, force: true });
  });
});

// ---------------------------------------------------------------------------
// fileExists
// ---------------------------------------------------------------------------

describe('fileExists', () => {
  test('returns true for an existing file', async () => {
    const tmp = makeTmpDir();
    const file = path.join(tmp, 'exists.txt');
    fs.writeFileSync(file, '', 'utf-8');

    const result = await utils.fileExists(file);
    assert.equal(result, true);

    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('returns false for a non-existent file', async () => {
    const result = await utils.fileExists('/tmp/__no_such_file_88888__.txt');
    assert.equal(result, false);
  });
});

// ---------------------------------------------------------------------------
// parseMarkdown
// ---------------------------------------------------------------------------

describe('parseMarkdown', () => {
  test('extracts headings correctly', () => {
    const md = '# Title\nSome text\n## Section A\nBody A\n### Sub\nBody Sub';
    const result = utils.parseMarkdown(md);

    assert.equal(result.headings.length, 3);
    assert.equal(result.headings[0].level, 1);
    assert.equal(result.headings[0].text, 'Title');
    assert.equal(result.headings[1].level, 2);
    assert.equal(result.headings[1].text, 'Section A');
    assert.equal(result.headings[2].level, 3);
    assert.equal(result.headings[2].text, 'Sub');
  });

  test('handles empty content', () => {
    const result = utils.parseMarkdown('');
    assert.deepEqual(result, { headings: [], sections: {} });
  });

  test('handles null/undefined input', () => {
    const result = utils.parseMarkdown(null);
    assert.deepEqual(result, { headings: [], sections: {} });
  });

  test('maps section bodies by heading text (lower-cased)', () => {
    const md = '# Intro\nHello world\n## Details\nMore info here';
    const result = utils.parseMarkdown(md);

    assert.equal(result.sections['intro'], 'Hello world');
    assert.equal(result.sections['details'], 'More info here');
  });
});

// ---------------------------------------------------------------------------
// log
// ---------------------------------------------------------------------------

describe('log', () => {
  test('does not throw for each log level', () => {
    // We cannot easily capture stdout in-process, so just verify no errors.
    utils.log('info', 'test info message');
    utils.log('warn', 'test warn message');
    utils.log('error', 'test error message');
    utils.log('success', 'test success message');
    assert.ok(true);
  });
});

// ---------------------------------------------------------------------------
// pluralize
// ---------------------------------------------------------------------------

describe('pluralize', () => {
  test('returns singular form for count 1', () => {
    assert.equal(utils.pluralize(1, 'file'), '1 file');
  });

  test('returns plural form for count 0', () => {
    assert.equal(utils.pluralize(0, 'file'), '0 files');
  });

  test('returns plural form for count 2', () => {
    assert.equal(utils.pluralize(2, 'file'), '2 files');
  });

  test('uses custom plural form when provided', () => {
    assert.equal(utils.pluralize(2, 'child', 'children'), '2 children');
  });
});

// ---------------------------------------------------------------------------
// getProjectRoot
// ---------------------------------------------------------------------------

describe('getProjectRoot', () => {
  test('returns a string that is an absolute path', () => {
    const root = utils.getProjectRoot();
    assert.ok(typeof root === 'string');
    assert.ok(path.isAbsolute(root), 'Expected absolute path');
  });
});
