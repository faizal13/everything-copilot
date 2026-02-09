#!/usr/bin/env node

/**
 * ecp — Everything Copilot CLI
 *
 * The main entry point for everything-copilot.
 * Provides a simple, plugin-like interface for setup, skill creation,
 * validation, and management.
 *
 * Usage:
 *   npx everything-copilot init              # Install to current project
 *   npx everything-copilot init --minimal    # Install only agents + instructions
 *   npx everything-copilot skill:create      # Create a new skill interactively
 *   npx everything-copilot skill:create <name> --from-context <file>
 *   npx everything-copilot validate          # Validate agents + skills
 *   npx everything-copilot doctor            # Health check
 *   npx everything-copilot list              # List installed agents & skills
 *   npx everything-copilot add:skill <name>  # Add a built-in skill
 *   npx everything-copilot add:agent <name>  # Add a built-in agent
 *   npx everything-copilot instinct          # Manage learned instincts
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const readline = require('node:readline');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(__dirname, '..');
const CWD = process.cwd();
const COPILOT_DIR = '.copilot';
const VERSION = require(path.join(REPO_ROOT, 'package.json')).version;

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

const ICONS = {
  success: `${COLORS.green}✔${COLORS.reset}`,
  warn: `${COLORS.yellow}⚠${COLORS.reset}`,
  error: `${COLORS.red}✖${COLORS.reset}`,
  info: `${COLORS.cyan}ℹ${COLORS.reset}`,
  arrow: `${COLORS.cyan}→${COLORS.reset}`,
  skill: `${COLORS.magenta}◆${COLORS.reset}`,
  agent: `${COLORS.blue}●${COLORS.reset}`,
};

// ---------------------------------------------------------------------------
// Built-in Skills & Agents registry
// ---------------------------------------------------------------------------

const BUILT_IN_SKILLS = [
  { name: 'coding-standards', desc: 'Per-language code style (JS, TS, Python, Go, Rust, Java)' },
  { name: 'frontend-patterns', desc: 'React, state management, responsive design, performance' },
  { name: 'backend-patterns', desc: 'API design, databases, caching, event-driven' },
  { name: 'golang-patterns', desc: 'Idiomatic Go, interfaces, testing, concurrency' },
  { name: 'java-spring-boot', desc: 'Spring Boot, JPA/Hibernate, Spring Security, testing' },
  { name: 'test-driven-development', desc: 'TDD workflow, Jest, pytest, JUnit, coverage' },
  { name: 'verification-loop', desc: 'Checkpoints, evals, pass@k metrics, grading rubrics' },
  { name: 'security-review', desc: 'OWASP Top 10, dependency scanning, secret detection' },
  { name: 'continuous-learning', desc: 'Pattern extraction, instinct storage, reusable patterns' },
  { name: 'continuous-learning-v2', desc: 'Confidence scoring, clustering, evolution to skills' },
  { name: 'iterative-retrieval', desc: 'Context refinement, subagent orchestration' },
  { name: 'strategic-compact', desc: 'Token optimization, compaction, context preservation' },
];

const BUILT_IN_AGENTS = [
  { name: 'planner', model: 'opus', desc: 'Strategic implementation planning' },
  { name: 'architect', model: 'opus', desc: 'System design and architecture decisions' },
  { name: 'tdd', model: 'sonnet', desc: 'Test-driven development (RED→GREEN→REFACTOR)' },
  { name: 'code-reviewer', model: 'sonnet', desc: 'General code review' },
  { name: 'security-reviewer', model: 'opus', desc: 'Security-focused code review' },
  { name: 'build-error-resolver', model: 'sonnet', desc: 'Build/compile error fixing' },
  { name: 'e2e-runner', model: 'sonnet', desc: 'End-to-end test management' },
  { name: 'refactor-cleaner', model: 'sonnet', desc: 'Code refactoring and cleanup' },
  { name: 'doc-updater', model: 'haiku', desc: 'Documentation maintenance' },
  { name: 'go-reviewer', model: 'sonnet', desc: 'Go-specific code review' },
  { name: 'go-build-resolver', model: 'sonnet', desc: 'Go build error fixing' },
  { name: 'java-reviewer', model: 'sonnet', desc: 'Java/Spring Boot code review' },
  { name: 'performance-optimizer', model: 'sonnet', desc: 'Performance profiling and fixes' },
];

// Preset bundles
const PRESETS = {
  minimal: {
    desc: 'Agents + instructions only (lightest setup)',
    skills: [],
    includeAgents: true,
    includeInstructions: true,
  },
  standard: {
    desc: 'Agents + instructions + core skills',
    skills: ['coding-standards', 'test-driven-development', 'security-review'],
    includeAgents: true,
    includeInstructions: true,
  },
  full: {
    desc: 'Everything — all agents, skills, scripts, tests',
    skills: BUILT_IN_SKILLS.map((s) => s.name),
    includeAgents: true,
    includeInstructions: true,
  },
  frontend: {
    desc: 'Frontend-focused (React, CSS, performance, TDD)',
    skills: ['coding-standards', 'frontend-patterns', 'test-driven-development', 'verification-loop'],
    includeAgents: true,
    includeInstructions: true,
  },
  backend: {
    desc: 'Backend-focused (APIs, DB, security, TDD)',
    skills: ['coding-standards', 'backend-patterns', 'security-review', 'test-driven-development'],
    includeAgents: true,
    includeInstructions: true,
  },
  go: {
    desc: 'Go-focused (Go patterns, TDD, security)',
    skills: ['coding-standards', 'golang-patterns', 'test-driven-development', 'security-review'],
    includeAgents: true,
    includeInstructions: true,
  },
  java: {
    desc: 'Java/Spring Boot (JPA, Security, TDD with JUnit)',
    skills: ['coding-standards', 'java-spring-boot', 'backend-patterns', 'test-driven-development', 'security-review'],
    includeAgents: true,
    includeInstructions: true,
  },
};

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function log(icon, msg) {
  console.log(`  ${icon} ${msg}`);
}

function header(title) {
  console.log();
  console.log(`  ${COLORS.bold}${title}${COLORS.reset}`);
  console.log();
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function countFiles(dir) {
  if (!exists(dir)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`  ${COLORS.cyan}?${COLORS.reset} ${question} `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function printBanner() {
  console.log();
  console.log(`  ${COLORS.bold}${COLORS.cyan}everything-copilot${COLORS.reset} ${COLORS.dim}v${VERSION}${COLORS.reset}`);
  console.log(`  ${COLORS.dim}Production-grade GitHub Copilot agent toolkit${COLORS.reset}`);
}

// ---------------------------------------------------------------------------
// Command: init
// ---------------------------------------------------------------------------

async function cmdInit(args) {
  printBanner();
  header('Initialize Copilot Workspace');

  const targetDir = args.target || CWD;
  const destCopilot = path.join(targetDir, COPILOT_DIR);
  const srcCopilot = path.join(REPO_ROOT, COPILOT_DIR);

  // Determine preset
  let preset = null;
  if (args.minimal) preset = 'minimal';
  else if (args.standard) preset = 'standard';
  else if (args.full) preset = 'full';
  else if (args.frontend) preset = 'frontend';
  else if (args.backend) preset = 'backend';
  else if (args.go) preset = 'go';
  else if (args.java || args.springboot || args['spring-boot']) preset = 'java';
  else if (args.preset) preset = args.preset;

  // Interactive selection if no preset specified
  if (!preset) {
    console.log(`  ${COLORS.dim}Select a preset (or use --preset=<name>):${COLORS.reset}`);
    console.log();
    const presetNames = Object.keys(PRESETS);
    presetNames.forEach((name, i) => {
      const p = PRESETS[name];
      const label = name === 'standard' ? `${name} (recommended)` : name;
      console.log(`    ${COLORS.bold}${i + 1}.${COLORS.reset} ${label} ${COLORS.dim}— ${p.desc}${COLORS.reset}`);
    });
    console.log();

    const choice = await ask('Enter number or preset name [2/standard]:');
    const num = parseInt(choice, 10);

    if (!choice || choice === '2' || choice === 'standard') {
      preset = 'standard';
    } else if (num >= 1 && num <= presetNames.length) {
      preset = presetNames[num - 1];
    } else if (PRESETS[choice]) {
      preset = choice;
    } else {
      preset = 'standard';
    }
  }

  const config = PRESETS[preset];
  log(ICONS.info, `Using preset: ${COLORS.bold}${preset}${COLORS.reset} — ${config.desc}`);
  console.log();

  // Check for existing .copilot
  if (exists(destCopilot)) {
    log(ICONS.warn, `${COPILOT_DIR}/ already exists in ${targetDir}`);
    const overwrite = await ask('Overwrite existing files? [y/N]:');
    if (overwrite.toLowerCase() !== 'y') {
      log(ICONS.info, 'Aborted. No changes made.');
      return;
    }
  }

  // Step 0: Copy .github/agents/ (proper VS Code format)
  const srcAgentsDir = path.join(REPO_ROOT, '.github', 'agents');
  const destGithub = path.join(targetDir, '.github');
  if (config.includeAgents && exists(srcAgentsDir)) {
    const destAgentsDir = path.join(destGithub, 'agents');
    copyDirSync(srcAgentsDir, destAgentsDir);
    const agentCount = fs.readdirSync(destAgentsDir).filter((f) => f.endsWith('.agent.md')).length;
    log(ICONS.success, `.github/agents/ ${COLORS.dim}(${agentCount} agent files — VS Code native)${COLORS.reset}`);
  }

  // Step 0b: Copy .github/copilot-instructions.md
  const srcCopilotInstr = path.join(REPO_ROOT, '.github', 'copilot-instructions.md');
  if (config.includeInstructions && exists(srcCopilotInstr)) {
    fs.mkdirSync(destGithub, { recursive: true });
    fs.copyFileSync(srcCopilotInstr, path.join(destGithub, 'copilot-instructions.md'));
    log(ICONS.success, `.github/copilot-instructions.md ${COLORS.dim}(repo-wide rules)${COLORS.reset}`);
  }

  // Step 0c: Copy .github/instructions/ (file-type specific)
  const srcGithubInstr = path.join(REPO_ROOT, '.github', 'instructions');
  if (config.includeInstructions && exists(srcGithubInstr)) {
    const destGithubInstr = path.join(destGithub, 'instructions');
    copyDirSync(srcGithubInstr, destGithubInstr);
    const instrCount = fs.readdirSync(destGithubInstr).filter((f) => f.endsWith('.instructions.md')).length;
    log(ICONS.success, `.github/instructions/ ${COLORS.dim}(${instrCount} language-specific rules)${COLORS.reset}`);
  }

  // Step 1: Copy legacy AGENTS.md (for backward compat with .copilot/)
  if (config.includeAgents) {
    const src = path.join(srcCopilot, 'AGENTS.md');
    const dest = path.join(destCopilot, 'AGENTS.md');
    fs.mkdirSync(destCopilot, { recursive: true });
    if (exists(src)) {
      fs.copyFileSync(src, dest);
      log(ICONS.success, `.copilot/AGENTS.md ${COLORS.dim}(legacy format — also included)${COLORS.reset}`);
    }
  }

  // Step 2: Copy instructions/
  if (config.includeInstructions) {
    const src = path.join(srcCopilot, 'instructions');
    const dest = path.join(destCopilot, 'instructions');
    copyDirSync(src, dest);
    log(ICONS.success, `instructions/ ${COLORS.dim}(4 instruction files)${COLORS.reset}`);
  }

  // Step 3: Copy selected skills
  if (config.skills.length > 0) {
    const skillsDir = path.join(destCopilot, 'skills');
    fs.mkdirSync(skillsDir, { recursive: true });

    for (const skillName of config.skills) {
      const src = path.join(srcCopilot, 'skills', skillName);
      const dest = path.join(skillsDir, skillName);
      if (exists(src)) {
        copyDirSync(src, dest);
        const fileCount = countFiles(dest);
        log(ICONS.success, `skills/${skillName}/ ${COLORS.dim}(${fileCount} files)${COLORS.reset}`);
      } else {
        log(ICONS.warn, `skills/${skillName}/ — not found in source, skipping`);
      }
    }
  }

  // Step 4: Copy scripts (for full preset)
  if (preset === 'full') {
    const scriptsSrc = path.join(REPO_ROOT, 'scripts');
    const scriptsDest = path.join(targetDir, 'scripts', 'copilot');
    copyDirSync(scriptsSrc, scriptsDest);
    log(ICONS.success, `scripts/copilot/ ${COLORS.dim}(utility scripts)${COLORS.reset}`);
  }

  // Summary
  console.log();
  log(ICONS.success, `${COLORS.green}${COLORS.bold}Done!${COLORS.reset} Copilot workspace initialized.`);
  console.log();
  console.log(`  ${COLORS.dim}Next steps:${COLORS.reset}`);
  console.log(`    1. ${ICONS.arrow} Review ${COPILOT_DIR}/instructions/ for your project conventions`);
  console.log(`    2. ${ICONS.arrow} Customize ${COPILOT_DIR}/AGENTS.md for your team`);
  if (config.skills.length > 0) {
    console.log(`    3. ${ICONS.arrow} Add custom skills: ${COLORS.cyan}npx everything-copilot skill:create${COLORS.reset}`);
  } else {
    console.log(`    3. ${ICONS.arrow} Add skills: ${COLORS.cyan}npx everything-copilot add:skill coding-standards${COLORS.reset}`);
  }
  console.log(`    4. ${ICONS.arrow} Validate: ${COLORS.cyan}npx everything-copilot validate${COLORS.reset}`);
  console.log();
}

// ---------------------------------------------------------------------------
// Command: skill:create
// ---------------------------------------------------------------------------

async function cmdSkillCreate(args) {
  printBanner();
  header('Create a New Skill');

  const destCopilot = path.join(CWD, COPILOT_DIR);
  const skillsDir = path.join(destCopilot, 'skills');

  if (!exists(destCopilot)) {
    log(ICONS.error, `No ${COPILOT_DIR}/ found. Run ${COLORS.cyan}npx everything-copilot init${COLORS.reset} first.`);
    return;
  }

  // Get skill name
  let name = args._positional[0] || null;
  if (!name) {
    name = await ask('Skill name (kebab-case, e.g., "payment-patterns"):');
  }

  if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
    log(ICONS.error, 'Invalid skill name. Use lowercase with hyphens (e.g., "my-skill").');
    return;
  }

  const skillDir = path.join(skillsDir, name);
  if (exists(skillDir)) {
    log(ICONS.error, `Skill "${name}" already exists at ${skillDir}`);
    return;
  }

  // Get description
  const description = args.desc || await ask('Description (what does this skill cover?):');

  // Get trigger conditions
  const triggersRaw = args.triggers || await ask('Trigger conditions (comma-separated, e.g., "working on payments, stripe integration"):');
  const triggers = triggersRaw ? triggersRaw.split(',').map((t) => t.trim()).filter(Boolean) : ['General development tasks'];

  // Get file patterns (optional — skip if all other flags are provided)
  let patternsRaw = args.files || '';
  if (!patternsRaw && !args.desc && !args.triggers) {
    patternsRaw = await ask('File patterns to match (comma-separated, e.g., "*payment*, *checkout*") [optional]:');
  }
  const filePatterns = patternsRaw ? patternsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

  // Check for --from-context
  let customContext = '';
  if (args['from-context']) {
    const contextFile = path.resolve(args['from-context']);
    if (exists(contextFile)) {
      customContext = fs.readFileSync(contextFile, 'utf8');
      log(ICONS.info, `Loading context from: ${contextFile}`);
    } else {
      log(ICONS.warn, `Context file not found: ${contextFile}`);
    }
  }

  // Generate SKILL.md
  const titleCase = name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const patternsFileName = `${name}-patterns.md`;

  const skillMd = [
    `# ${titleCase} Skill`,
    '',
    '## Name',
    titleCase,
    '',
    '## Description',
    description || `Patterns and knowledge for ${titleCase}.`,
    '',
    '## Trigger Conditions',
    ...triggers.map((t) => `- ${t}`),
    ...(filePatterns.length > 0 ? [`- Files matching: ${filePatterns.map((p) => `\`${p}\``).join(', ')}`] : []),
    '',
    '## Files',
    `- \`${patternsFileName}\` — Core patterns and guidelines`,
    '',
    '## Model Recommendation',
    '- **Sonnet** for implementation and applying patterns',
    '- **Opus** for architecture-level decisions',
    '',
  ].join('\n');

  // Generate patterns file
  let patternsContent;
  if (customContext) {
    patternsContent = [
      `# ${titleCase} Patterns`,
      '',
      customContext,
      '',
    ].join('\n');
  } else {
    patternsContent = [
      `# ${titleCase} Patterns`,
      '',
      '## Overview',
      '',
      `Add your ${titleCase.toLowerCase()} patterns and guidelines here.`,
      '',
      '## Rules',
      '',
      '- TODO: Add your rules',
      '',
      '## Code Patterns',
      '',
      '```',
      '// TODO: Add example code patterns',
      '```',
      '',
      '## Anti-Patterns',
      '',
      '| Anti-Pattern | Problem | Fix |',
      '|-------------|---------|-----|',
      '| TODO | TODO | TODO |',
      '',
      '## Checklist',
      '',
      '- [ ] Add patterns specific to your project',
      '- [ ] Add code examples',
      '- [ ] Update trigger conditions in SKILL.md',
      '- [ ] Validate: npx everything-copilot validate',
      '',
    ].join('\n');
  }

  // Write files
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMd);
  fs.writeFileSync(path.join(skillDir, patternsFileName), patternsContent);

  console.log();
  log(ICONS.success, `${COLORS.green}${COLORS.bold}Skill created!${COLORS.reset}`);
  console.log();
  console.log(`  ${ICONS.skill} ${skillDir}/`);
  console.log(`    ├── SKILL.md`);
  console.log(`    └── ${patternsFileName}`);
  console.log();
  console.log(`  ${COLORS.dim}Next steps:${COLORS.reset}`);
  console.log(`    1. ${ICONS.arrow} Edit ${COLORS.cyan}${patternsFileName}${COLORS.reset} with your custom patterns`);
  console.log(`    2. ${ICONS.arrow} Validate: ${COLORS.cyan}npx everything-copilot validate${COLORS.reset}`);
  console.log(`    3. ${ICONS.arrow} Open a matching file in VS Code — the skill will auto-load!`);
  console.log();
}

// ---------------------------------------------------------------------------
// Command: add:skill
// ---------------------------------------------------------------------------

function cmdAddSkill(args) {
  printBanner();
  header('Add Built-in Skill');

  const name = args._positional[0];
  if (!name) {
    console.log(`  ${COLORS.dim}Available skills:${COLORS.reset}`);
    console.log();
    for (const skill of BUILT_IN_SKILLS) {
      console.log(`    ${ICONS.skill} ${COLORS.bold}${skill.name}${COLORS.reset} — ${skill.desc}`);
    }
    console.log();
    console.log(`  ${COLORS.dim}Usage: ${COLORS.cyan}npx everything-copilot add:skill <name>${COLORS.reset}`);
    console.log();
    return;
  }

  const skill = BUILT_IN_SKILLS.find((s) => s.name === name);
  if (!skill) {
    log(ICONS.error, `Unknown skill: "${name}". Run ${COLORS.cyan}npx everything-copilot add:skill${COLORS.reset} to see available skills.`);
    return;
  }

  const src = path.join(REPO_ROOT, COPILOT_DIR, 'skills', name);
  const dest = path.join(CWD, COPILOT_DIR, 'skills', name);

  if (!exists(src)) {
    log(ICONS.error, `Source skill not found at ${src}`);
    return;
  }

  if (exists(dest)) {
    log(ICONS.warn, `Skill "${name}" already installed.`);
    return;
  }

  fs.mkdirSync(path.join(CWD, COPILOT_DIR, 'skills'), { recursive: true });
  copyDirSync(src, dest);

  const fileCount = countFiles(dest);
  log(ICONS.success, `Installed ${COLORS.bold}${name}${COLORS.reset} ${COLORS.dim}(${fileCount} files)${COLORS.reset}`);
}

// ---------------------------------------------------------------------------
// Command: add:agent (extract specific agent from AGENTS.md — info only)
// ---------------------------------------------------------------------------

function cmdAddAgent(args) {
  printBanner();
  header('Agent Information');

  const name = args._positional[0];
  if (!name) {
    console.log(`  ${COLORS.dim}Available agents (all included in AGENTS.md):${COLORS.reset}`);
    console.log();
    for (const agent of BUILT_IN_AGENTS) {
      const modelColor = agent.model === 'opus' ? COLORS.red : agent.model === 'haiku' ? COLORS.green : COLORS.yellow;
      console.log(`    ${ICONS.agent} ${COLORS.bold}${agent.name}${COLORS.reset} ${COLORS.dim}[${modelColor}${agent.model}${COLORS.reset}${COLORS.dim}]${COLORS.reset} — ${agent.desc}`);
    }
    console.log();
    console.log(`  ${COLORS.dim}All agents are defined in ${COLORS.cyan}.copilot/AGENTS.md${COLORS.reset}`);
    console.log(`  ${COLORS.dim}Docs available in ${COLORS.cyan}agents/<name>.md${COLORS.reset}`);
    console.log();
    return;
  }

  const agent = BUILT_IN_AGENTS.find((a) => a.name === name);
  if (!agent) {
    log(ICONS.error, `Unknown agent: "${name}".`);
    return;
  }

  log(ICONS.agent, `${COLORS.bold}${agent.name}${COLORS.reset}`);
  console.log(`    Model: ${agent.model}`);
  console.log(`    Description: ${agent.desc}`);
  console.log(`    Config: .copilot/AGENTS.md`);
  console.log(`    Docs: agents/${agent.name}.md`);
}

// ---------------------------------------------------------------------------
// Command: validate
// ---------------------------------------------------------------------------

function cmdValidate() {
  printBanner();
  header('Validate Configuration');

  const destCopilot = path.join(CWD, COPILOT_DIR);

  if (!exists(destCopilot)) {
    log(ICONS.error, `No ${COPILOT_DIR}/ found. Run ${COLORS.cyan}npx everything-copilot init${COLORS.reset} first.`);
    return;
  }

  let hasErrors = false;

  // Check AGENTS.md
  const agentsFile = path.join(destCopilot, 'AGENTS.md');
  if (exists(agentsFile)) {
    const content = fs.readFileSync(agentsFile, 'utf8');
    const agentCount = (content.match(/^## /gm) || []).length;
    log(ICONS.success, `AGENTS.md — ${agentCount} agents defined`);
  } else {
    log(ICONS.error, 'AGENTS.md — missing');
    hasErrors = true;
  }

  // Check instructions/
  const instrDir = path.join(destCopilot, 'instructions');
  if (exists(instrDir)) {
    const files = fs.readdirSync(instrDir).filter((f) => f.endsWith('.md'));
    log(ICONS.success, `instructions/ — ${files.length} files`);
  } else {
    log(ICONS.warn, 'instructions/ — missing (optional but recommended)');
  }

  // Check skills/
  const skillsDir = path.join(destCopilot, 'skills');
  if (exists(skillsDir)) {
    const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
    let validSkills = 0;
    let invalidSkills = 0;

    for (const dir of skillDirs) {
      const skillMd = path.join(skillsDir, dir.name, 'SKILL.md');
      if (exists(skillMd)) {
        const content = fs.readFileSync(skillMd, 'utf8');
        const hasName = /## Name/i.test(content);
        const hasTriggers = /## Trigger Conditions/i.test(content);
        const hasFiles = /## Files/i.test(content);

        if (hasName && hasTriggers && hasFiles) {
          validSkills++;
        } else {
          const missing = [];
          if (!hasName) missing.push('Name');
          if (!hasTriggers) missing.push('Trigger Conditions');
          if (!hasFiles) missing.push('Files');
          log(ICONS.warn, `skills/${dir.name}/ — SKILL.md missing sections: ${missing.join(', ')}`);
          invalidSkills++;
        }
      } else {
        log(ICONS.error, `skills/${dir.name}/ — missing SKILL.md`);
        invalidSkills++;
        hasErrors = true;
      }
    }

    if (validSkills > 0) {
      log(ICONS.success, `skills/ — ${validSkills} valid skill(s)${invalidSkills > 0 ? `, ${invalidSkills} need attention` : ''}`);
    }
  } else {
    log(ICONS.info, 'skills/ — none installed (add with: npx everything-copilot add:skill <name>)');
  }

  console.log();
  if (hasErrors) {
    log(ICONS.error, `${COLORS.red}Validation failed.${COLORS.reset} Fix the issues above.`);
  } else {
    log(ICONS.success, `${COLORS.green}${COLORS.bold}All checks passed!${COLORS.reset}`);
  }
  console.log();
}

// ---------------------------------------------------------------------------
// Command: list
// ---------------------------------------------------------------------------

function cmdList() {
  printBanner();
  header('Installed Components');

  const destCopilot = path.join(CWD, COPILOT_DIR);

  if (!exists(destCopilot)) {
    log(ICONS.error, `No ${COPILOT_DIR}/ found. Run ${COLORS.cyan}npx everything-copilot init${COLORS.reset} first.`);
    return;
  }

  // Agents
  const agentsFile = path.join(destCopilot, 'AGENTS.md');
  if (exists(agentsFile)) {
    const content = fs.readFileSync(agentsFile, 'utf8');
    const agents = content.match(/^## (.+)/gm) || [];
    console.log(`  ${COLORS.bold}Agents (${agents.length}):${COLORS.reset}`);
    for (const agent of agents) {
      const name = agent.replace('## ', '');
      console.log(`    ${ICONS.agent} ${name}`);
    }
    console.log();
  }

  // Instructions
  const instrDir = path.join(destCopilot, 'instructions');
  if (exists(instrDir)) {
    const files = fs.readdirSync(instrDir).filter((f) => f.endsWith('.md'));
    console.log(`  ${COLORS.bold}Instructions (${files.length}):${COLORS.reset}`);
    for (const file of files) {
      console.log(`    ${ICONS.info} ${file}`);
    }
    console.log();
  }

  // Skills
  const skillsDir = path.join(destCopilot, 'skills');
  if (exists(skillsDir)) {
    const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
    console.log(`  ${COLORS.bold}Skills (${skillDirs.length}):${COLORS.reset}`);
    for (const dir of skillDirs) {
      const fileCount = countFiles(path.join(skillsDir, dir.name));
      console.log(`    ${ICONS.skill} ${dir.name} ${COLORS.dim}(${fileCount} files)${COLORS.reset}`);
    }
    console.log();
  }

  // Not installed
  if (exists(skillsDir)) {
    const installed = new Set(fs.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name));
    const notInstalled = BUILT_IN_SKILLS.filter((s) => !installed.has(s.name));
    if (notInstalled.length > 0) {
      console.log(`  ${COLORS.bold}Available to add (${notInstalled.length}):${COLORS.reset}`);
      for (const skill of notInstalled) {
        console.log(`    ${COLORS.dim}${skill.name} — ${skill.desc}${COLORS.reset}`);
      }
      console.log();
      console.log(`  ${COLORS.dim}Add with: ${COLORS.cyan}npx everything-copilot add:skill <name>${COLORS.reset}`);
      console.log();
    }
  }
}

// ---------------------------------------------------------------------------
// Command: doctor
// ---------------------------------------------------------------------------

function cmdDoctor() {
  printBanner();
  header('Health Check');

  const checks = [];

  // Check Node.js version
  const nodeVersion = process.versions.node;
  const major = parseInt(nodeVersion.split('.')[0], 10);
  if (major >= 18) {
    checks.push({ ok: true, msg: `Node.js ${nodeVersion}` });
  } else {
    checks.push({ ok: false, msg: `Node.js ${nodeVersion} (need ≥18)` });
  }

  // Check .copilot exists
  const destCopilot = path.join(CWD, COPILOT_DIR);
  checks.push({
    ok: exists(destCopilot),
    msg: exists(destCopilot) ? `.copilot/ directory found` : `.copilot/ not found — run: npx everything-copilot init`,
  });

  // Check AGENTS.md
  const agentsFile = path.join(destCopilot, 'AGENTS.md');
  checks.push({
    ok: exists(agentsFile),
    msg: exists(agentsFile) ? 'AGENTS.md present' : 'AGENTS.md missing',
  });

  // Check instructions
  const instrDir = path.join(destCopilot, 'instructions');
  checks.push({
    ok: exists(instrDir),
    msg: exists(instrDir) ? 'instructions/ present' : 'instructions/ missing',
  });

  // Check git
  let hasGit = false;
  try {
    execSync('git rev-parse --is-inside-work-tree', { encoding: 'utf8', stdio: 'pipe' });
    hasGit = true;
  } catch {
    // not in a git repo
  }
  checks.push({
    ok: hasGit,
    msg: hasGit ? 'Git repository detected' : 'Not a git repository (some features won\'t work)',
  });

  // Check VS Code
  let hasCode = false;
  try {
    execSync('which code', { encoding: 'utf8', stdio: 'pipe' });
    hasCode = true;
  } catch {
    // no code command
  }
  checks.push({
    ok: hasCode,
    msg: hasCode ? 'VS Code CLI available' : 'VS Code CLI not found (optional)',
  });

  // Print results
  for (const check of checks) {
    log(check.ok ? ICONS.success : (check.msg.includes('optional') ? ICONS.warn : ICONS.error), check.msg);
  }

  const failures = checks.filter((c) => !c.ok && !c.msg.includes('optional'));
  console.log();
  if (failures.length === 0) {
    log(ICONS.success, `${COLORS.green}${COLORS.bold}Everything looks good!${COLORS.reset}`);
  } else {
    log(ICONS.warn, `${failures.length} issue(s) found. Fix them for the best experience.`);
  }
  console.log();
}

// ---------------------------------------------------------------------------
// Command: help
// ---------------------------------------------------------------------------

function cmdHelp() {
  printBanner();
  console.log();
  console.log(`  ${COLORS.bold}Usage:${COLORS.reset}`);
  console.log(`    ${COLORS.cyan}npx everything-copilot${COLORS.reset} <command> [options]`);
  console.log();
  console.log(`  ${COLORS.bold}Setup:${COLORS.reset}`);
  console.log(`    ${COLORS.cyan}init${COLORS.reset}                       Initialize .copilot/ in your project`);
  console.log(`      --minimal                  Agents + instructions only`);
  console.log(`      --standard                 Core agents + instructions + key skills`);
  console.log(`      --full                     Everything (all skills, scripts, tests)`);
  console.log(`      --frontend                 Frontend preset (React, CSS, performance)`);
  console.log(`      --backend                  Backend preset (APIs, DB, security)`);
  console.log(`      --go                       Go preset (Go patterns, testing)`);
  console.log();
  console.log(`  ${COLORS.bold}Skills:${COLORS.reset}`);
  console.log(`    ${COLORS.cyan}skill:create${COLORS.reset} [name]           Create a new custom skill interactively`);
  console.log(`      --from-context <file>      Pre-fill patterns from a file`);
  console.log(`      --desc "description"       Skill description`);
  console.log(`    ${COLORS.cyan}add:skill${COLORS.reset} <name>             Install a built-in skill`);
  console.log(`    ${COLORS.cyan}add:skill${COLORS.reset}                    List all available built-in skills`);
  console.log();
  console.log(`  ${COLORS.bold}Agents:${COLORS.reset}`);
  console.log(`    ${COLORS.cyan}add:agent${COLORS.reset}                    List all available agents and models`);
  console.log(`    ${COLORS.cyan}add:agent${COLORS.reset} <name>             Show agent details`);
  console.log();
  console.log(`  ${COLORS.bold}Maintenance:${COLORS.reset}`);
  console.log(`    ${COLORS.cyan}validate${COLORS.reset}                     Validate agents and skills configuration`);
  console.log(`    ${COLORS.cyan}list${COLORS.reset}                         List installed agents, skills, instructions`);
  console.log(`    ${COLORS.cyan}doctor${COLORS.reset}                       Run environment health check`);
  console.log();
  console.log(`  ${COLORS.bold}Learning:${COLORS.reset}`);
  console.log(`    ${COLORS.cyan}instinct${COLORS.reset} <subcommand>        Manage learned instincts`);
  console.log(`      list | add | remove | export | import | evolve | status`);
  console.log();
  console.log(`  ${COLORS.bold}Examples:${COLORS.reset}`);
  console.log(`    ${COLORS.dim}# Quick start${COLORS.reset}`);
  console.log(`    ${COLORS.cyan}npx everything-copilot init --standard${COLORS.reset}`);
  console.log();
  console.log(`    ${COLORS.dim}# Create a custom skill from your context file${COLORS.reset}`);
  console.log(`    ${COLORS.cyan}npx everything-copilot skill:create payments --from-context my-patterns.md${COLORS.reset}`);
  console.log();
  console.log(`    ${COLORS.dim}# Add individual skills${COLORS.reset}`);
  console.log(`    ${COLORS.cyan}npx everything-copilot add:skill security-review${COLORS.reset}`);
  console.log(`    ${COLORS.cyan}npx everything-copilot add:skill frontend-patterns${COLORS.reset}`);
  console.log();
  console.log(`    ${COLORS.dim}# Check everything is working${COLORS.reset}`);
  console.log(`    ${COLORS.cyan}npx everything-copilot doctor${COLORS.reset}`);
  console.log();
}

// ---------------------------------------------------------------------------
// Argument parser
// ---------------------------------------------------------------------------

function parseCliArgs() {
  const raw = process.argv.slice(2);
  const command = raw[0] || 'help';
  const args = { _positional: [] };

  for (let i = 1; i < raw.length; i++) {
    const arg = raw[i];
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx > 0) {
        args[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else if (i + 1 < raw.length && !raw[i + 1].startsWith('-')) {
        args[arg.slice(2)] = raw[++i];
      } else {
        args[arg.slice(2)] = true;
      }
    } else if (!arg.startsWith('-')) {
      args._positional.push(arg);
    }
  }

  return { command, args };
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

async function main() {
  const { command, args } = parseCliArgs();

  switch (command) {
    case 'init':
      await cmdInit(args);
      break;
    case 'skill:create':
    case 'skill-create':
    case 'create-skill':
      await cmdSkillCreate(args);
      break;
    case 'add:skill':
    case 'add-skill':
      cmdAddSkill(args);
      break;
    case 'add:agent':
    case 'add-agent':
      cmdAddAgent(args);
      break;
    case 'validate':
      cmdValidate();
      break;
    case 'list':
    case 'ls':
      cmdList();
      break;
    case 'doctor':
      cmdDoctor();
      break;
    case 'instinct':
      // Delegate to instinct-manager
      try {
        const instinctScript = path.join(REPO_ROOT, 'scripts', 'instinct-manager.js');
        const subcmd = args._positional.join(' ');
        execSync(`node "${instinctScript}" ${subcmd}`, { stdio: 'inherit' });
      } catch {
        // exit code already printed by child
      }
      break;
    case 'help':
    case '--help':
    case '-h':
      cmdHelp();
      break;
    case 'version':
    case '--version':
    case '-v':
      console.log(VERSION);
      break;
    default:
      console.log(`  Unknown command: ${command}`);
      console.log(`  Run ${COLORS.cyan}npx everything-copilot help${COLORS.reset} for usage.`);
      break;
  }
}

main().catch((err) => {
  console.error(`  ${ICONS.error} ${err.message}`);
  process.exit(1);
});
