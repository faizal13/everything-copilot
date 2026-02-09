#!/usr/bin/env node

'use strict';

const { assert, describe, test } = require('../run-all');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

// Helper to create a temp skills directory
function tmpSkillsDir(skills) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vs-test-'));
  const skillsDir = path.join(dir, '.copilot', 'skills');
  fs.mkdirSync(skillsDir, { recursive: true });

  for (const [name, files] of Object.entries(skills)) {
    const skillDir = path.join(skillsDir, name);
    fs.mkdirSync(skillDir, { recursive: true });
    for (const [fname, content] of Object.entries(files)) {
      fs.writeFileSync(path.join(skillDir, fname), content);
    }
  }

  return dir;
}

function cleanup(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
}

// ---------------------------------------------------------------------------
// Validation tests
// ---------------------------------------------------------------------------

describe('validate-skills', () => {
  test('validates a well-formed skill directory with SKILL.md', () => {
    const skillContent = [
      '# Test Skill',
      '',
      '## Name',
      'Test Skill',
      '',
      '## Description',
      'A test skill for validation.',
      '',
      '## Trigger Conditions',
      '- When testing',
      '',
      '## Files',
      '- `patterns.md` — Test patterns',
    ].join('\n');

    const dir = tmpSkillsDir({
      'test-skill': {
        'SKILL.md': skillContent,
        'patterns.md': '# Patterns\n\nSome patterns here.',
      },
    });

    try {
      const skillMd = path.join(dir, '.copilot', 'skills', 'test-skill', 'SKILL.md');
      assert.ok(fs.existsSync(skillMd), 'SKILL.md should exist');
      const content = fs.readFileSync(skillMd, 'utf8');
      assert.ok(content.includes('## Name'), 'Should contain Name section');
      assert.ok(content.includes('## Description'), 'Should contain Description section');
      assert.ok(content.includes('## Trigger Conditions'), 'Should contain Trigger Conditions');
      assert.ok(content.includes('## Files'), 'Should contain Files section');
    } finally {
      cleanup(dir);
    }
  });

  test('detects missing SKILL.md in skill directory', () => {
    const dir = tmpSkillsDir({
      'bad-skill': {
        'patterns.md': '# Patterns',
      },
    });

    try {
      const skillMd = path.join(dir, '.copilot', 'skills', 'bad-skill', 'SKILL.md');
      assert.ok(!fs.existsSync(skillMd), 'SKILL.md should NOT exist');
    } finally {
      cleanup(dir);
    }
  });

  test('detects SKILL.md without required fields', () => {
    const dir = tmpSkillsDir({
      'incomplete-skill': {
        'SKILL.md': '# Incomplete\n\nNo required sections here.',
      },
    });

    try {
      const skillMd = path.join(dir, '.copilot', 'skills', 'incomplete-skill', 'SKILL.md');
      const content = fs.readFileSync(skillMd, 'utf8');
      assert.ok(!content.includes('## Name'), 'Should be missing Name section');
    } finally {
      cleanup(dir);
    }
  });

  test('validates multiple skill directories at once', () => {
    const validSkill = [
      '# Skill',
      '## Name', 'Skill A',
      '## Description', 'Desc',
      '## Trigger Conditions', '- trigger',
      '## Files', '- `a.md`',
    ].join('\n');

    const dir = tmpSkillsDir({
      'skill-a': { 'SKILL.md': validSkill, 'a.md': '# A' },
      'skill-b': { 'SKILL.md': validSkill.replace('Skill A', 'Skill B'), 'a.md': '# B' },
    });

    try {
      const skillsDir = path.join(dir, '.copilot', 'skills');
      const entries = fs.readdirSync(skillsDir);
      assert.equal(entries.length, 2, 'Should have 2 skill directories');

      for (const name of entries) {
        const skillMd = path.join(skillsDir, name, 'SKILL.md');
        assert.ok(fs.existsSync(skillMd), `${name}/SKILL.md should exist`);
      }
    } finally {
      cleanup(dir);
    }
  });

  test('handles empty skills directory', () => {
    const dir = tmpSkillsDir({});
    try {
      const skillsDir = path.join(dir, '.copilot', 'skills');
      const entries = fs.readdirSync(skillsDir);
      assert.equal(entries.length, 0, 'Should have no skill directories');
    } finally {
      cleanup(dir);
    }
  });
});
