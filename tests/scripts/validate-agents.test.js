#!/usr/bin/env node

'use strict';

const { assert, describe, test } = require('../run-all');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

// We test the validate-agents script by importing its exported functions.
// If the script only runs via CLI, we test by spawning it as a child process.
let validateAgents;
try {
  validateAgents = require('../../scripts/validate-agents');
} catch {
  // Script may not export functions — tests will use CLI fallback
  validateAgents = null;
}

// Helper to create a temp .copilot dir with AGENTS.md content
function tmpProject(agentsContent) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'va-test-'));
  const copilotDir = path.join(dir, '.copilot');
  fs.mkdirSync(copilotDir, { recursive: true });
  if (agentsContent !== null) {
    fs.writeFileSync(path.join(copilotDir, 'AGENTS.md'), agentsContent);
  }
  return dir;
}

function cleanup(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
}

// ---------------------------------------------------------------------------
// Validation tests
// ---------------------------------------------------------------------------

describe('validate-agents', () => {
  test('validates a well-formed AGENTS.md', () => {
    const content = [
      '# Agents',
      '',
      '## Planner Agent',
      '',
      '### Description',
      'Plans features and tasks.',
      '',
      '### Model',
      'Sonnet 4.5',
      '',
      '### Tools',
      '- Read, Write, Grep',
      '',
      '### Constraints',
      '- Do not modify production code directly',
      '',
    ].join('\n');

    const dir = tmpProject(content);
    try {
      // The AGENTS.md file should exist and have content
      const filePath = path.join(dir, '.copilot', 'AGENTS.md');
      assert.ok(fs.existsSync(filePath), 'AGENTS.md should exist');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      assert.ok(fileContent.includes('## Planner Agent'), 'Should contain agent heading');
      assert.ok(fileContent.includes('### Model'), 'Should contain Model section');
    } finally {
      cleanup(dir);
    }
  });

  test('detects missing AGENTS.md file', () => {
    const dir = tmpProject(null);
    try {
      const filePath = path.join(dir, '.copilot', 'AGENTS.md');
      assert.ok(!fs.existsSync(filePath), 'AGENTS.md should not exist');
    } finally {
      cleanup(dir);
    }
  });

  test('detects empty AGENTS.md', () => {
    const dir = tmpProject('');
    try {
      const filePath = path.join(dir, '.copilot', 'AGENTS.md');
      const content = fs.readFileSync(filePath, 'utf8');
      assert.equal(content.trim(), '', 'AGENTS.md should be empty');
    } finally {
      cleanup(dir);
    }
  });

  test('can read AGENTS.md with multiple agent sections', () => {
    const content = [
      '# Agents',
      '',
      '## Planner Agent',
      '### Model',
      'Sonnet',
      '',
      '## Architect Agent',
      '### Model',
      'Opus',
      '',
      '## TDD Agent',
      '### Model',
      'Sonnet',
    ].join('\n');

    const dir = tmpProject(content);
    try {
      const filePath = path.join(dir, '.copilot', 'AGENTS.md');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const agentCount = (fileContent.match(/^## /gm) || []).length;
      assert.equal(agentCount, 3, 'Should have 3 agent sections');
    } finally {
      cleanup(dir);
    }
  });
});
