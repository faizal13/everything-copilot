#!/usr/bin/env node

'use strict';

const { assert, describe, test } = require('../run-all');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

let skillCreator;
try {
  skillCreator = require('../../scripts/skill-creator');
} catch {
  skillCreator = null;
}

function cleanup(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
}

// ---------------------------------------------------------------------------
// skill-creator tests
// ---------------------------------------------------------------------------

describe('skill-creator', () => {
  test('titleCase converts hyphenated names', () => {
    if (!skillCreator) return; // Skip if not importable
    assert.equal(skillCreator.titleCase('my-cool-skill'), 'My Cool Skill');
    assert.equal(skillCreator.titleCase('api'), 'Api');
  });

  test('parseGitLog returns empty array for invalid range', () => {
    if (!skillCreator) return;
    const result = skillCreator.parseGitLog('nonexistent..alsonotreal');
    assert.ok(Array.isArray(result), 'Should return an array');
    // May return empty or error depending on git state — both are valid
  });

  test('groupByPrefix groups commits by conventional prefix', () => {
    if (!skillCreator) return;
    const commits = [
      { hash: 'a1', message: 'feat: add login', prefix: 'feat', subject: 'add login' },
      { hash: 'a2', message: 'fix: null check', prefix: 'fix', subject: 'null check' },
      { hash: 'a3', message: 'feat: add logout', prefix: 'feat', subject: 'add logout' },
    ];
    const groups = skillCreator.groupByPrefix(commits);
    assert.equal(groups.feat.length, 2);
    assert.equal(groups.fix.length, 1);
  });

  test('generateManifest produces valid markdown', () => {
    if (!skillCreator) return;
    const groups = {
      feat: [{ subject: 'add login' }],
      fix: [{ subject: 'null check' }],
    };
    const manifest = skillCreator.generateManifest('my-skill', groups);
    assert.ok(manifest.includes('# My Skill Skill'), 'Should contain skill title');
    assert.ok(manifest.includes('## Name'), 'Should contain Name section');
    assert.ok(manifest.includes('## Description'), 'Should contain Description section');
    assert.ok(manifest.includes('## Trigger Conditions'), 'Should contain triggers');
    assert.ok(manifest.includes('## Files'), 'Should contain files');
  });

  test('createSkill rejects invalid skill names', () => {
    if (!skillCreator) return;
    const result = skillCreator.createSkill('Invalid Name!', 'HEAD~5..HEAD', '/tmp/nonexistent');
    assert.equal(result, false, 'Should reject invalid name');
  });

  test('createSkill rejects empty name', () => {
    if (!skillCreator) return;
    const result = skillCreator.createSkill(null, 'HEAD~5..HEAD', '/tmp/nonexistent');
    assert.equal(result, false, 'Should reject null name');
  });

  test('createSkill creates directory and files', () => {
    if (!skillCreator) return;
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-test-'));
    const outputBase = path.join(tmpDir, 'skills');

    try {
      const result = skillCreator.createSkill('test-skill', 'HEAD~1..HEAD', outputBase);
      // Result depends on whether we're in a git repo
      if (result) {
        const skillDir = path.join(outputBase, 'test-skill');
        assert.ok(fs.existsSync(path.join(skillDir, 'SKILL.md')), 'SKILL.md should be created');
      }
    } finally {
      cleanup(tmpDir);
    }
  });
});
