#!/usr/bin/env node

/**
 * instinct-manager.js - Manage learned patterns (instincts).
 *
 * Subcommands:
 *   list     Show all stored instincts
 *   add      Add a new instinct
 *   remove   Remove an instinct by ID
 *   export   Export instincts to JSON file
 *   import   Import instincts from JSON file
 *   evolve   Cluster instincts and suggest skill creation
 *   status   Summary of instinct store
 *
 * Usage:
 *   node scripts/instinct-manager.js <command> [options]
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { log, readFile, writeFile, fileExists, getProjectRoot } = require('./lib/utils');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORE_DIR = '.copilot/skills/continuous-learning/learned';
const STORE_FILE = 'instincts.json';
const INITIAL_CONFIDENCE = 0.5;
const CONFIDENCE_INCREMENT = 0.05;
const CONFIDENCE_CAP = 0.95;
const DECAY_PER_WEEK = 0.01;
const CONFIDENCE_FLOOR = 0.1;

// ---------------------------------------------------------------------------
// Store helpers
// ---------------------------------------------------------------------------

function getStorePath() {
  const root = getProjectRoot() || process.cwd();
  return path.join(root, STORE_DIR, STORE_FILE);
}

function loadInstincts() {
  const storePath = getStorePath();
  if (!fileExists(storePath)) return [];
  try {
    const raw = readFile(storePath);
    return JSON.parse(raw);
  } catch {
    log('warn', 'Could not parse instincts file. Starting fresh.');
    return [];
  }
}

function saveInstincts(instincts) {
  const storePath = getStorePath();
  writeFile(storePath, JSON.stringify(instincts, null, 2) + '\n');
}

function generateId() {
  return 'inst-' + crypto.randomBytes(4).toString('hex');
}

// ---------------------------------------------------------------------------
// Confidence helpers
// ---------------------------------------------------------------------------

function applyDecay(instinct) {
  const now = Date.now();
  const lastUsed = new Date(instinct.lastUsed).getTime();
  const daysSince = (now - lastUsed) / (24 * 60 * 60 * 1000);
  const weeksUnused = Math.floor(daysSince / 7);

  if (weeksUnused > 0) {
    const decay = weeksUnused * DECAY_PER_WEEK;
    instinct.confidence = Math.max(CONFIDENCE_FLOOR, instinct.confidence - decay);
  }
  return instinct;
}

function incrementConfidence(instinct) {
  instinct.confidence = Math.min(CONFIDENCE_CAP, instinct.confidence + CONFIDENCE_INCREMENT);
  instinct.lastUsed = new Date().toISOString();
  instinct.useCount = (instinct.useCount || 0) + 1;
  return instinct;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function addInstinct(name, category, pattern) {
  if (!name || !category || !pattern) {
    log('error', 'Usage: add <name> --category=<cat> --pattern="<description>"');
    return false;
  }

  const instincts = loadInstincts();

  // Check for duplicate name
  if (instincts.some((i) => i.name === name)) {
    log('error', `Instinct "${name}" already exists. Use a different name.`);
    return false;
  }

  const instinct = {
    id: generateId(),
    name,
    category,
    pattern,
    confidence: INITIAL_CONFIDENCE,
    created: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    useCount: 0,
    tags: [],
  };

  instincts.push(instinct);
  saveInstincts(instincts);
  log('success', `Added instinct "${name}" (${instinct.id}) with confidence ${INITIAL_CONFIDENCE}`);
  return true;
}

function removeInstinct(id) {
  if (!id) {
    log('error', 'Usage: remove <id>');
    return false;
  }

  const instincts = loadInstincts();
  const idx = instincts.findIndex((i) => i.id === id);
  if (idx === -1) {
    log('error', `Instinct "${id}" not found.`);
    return false;
  }

  const removed = instincts.splice(idx, 1)[0];
  saveInstincts(instincts);
  log('success', `Removed instinct "${removed.name}" (${removed.id})`);
  return true;
}

function listInstincts(opts = {}) {
  let instincts = loadInstincts().map(applyDecay);

  if (opts.category) {
    instincts = instincts.filter((i) => i.category === opts.category);
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    instincts = instincts.filter(
      (i) => i.name.toLowerCase().includes(q) || i.pattern.toLowerCase().includes(q)
    );
  }
  if (opts.minConfidence) {
    instincts = instincts.filter((i) => i.confidence >= opts.minConfidence);
  }

  if (instincts.length === 0) {
    log('info', 'No instincts found.');
    return;
  }

  instincts.sort((a, b) => b.confidence - a.confidence);

  console.log('');
  console.log(`  ${'ID'.padEnd(14)} ${'Name'.padEnd(30)} ${'Category'.padEnd(16)} ${'Conf'.padEnd(6)} Uses`);
  console.log(`  ${'─'.repeat(14)} ${'─'.repeat(30)} ${'─'.repeat(16)} ${'─'.repeat(6)} ${'─'.repeat(5)}`);

  for (const i of instincts) {
    const conf = i.confidence.toFixed(2);
    console.log(`  ${i.id.padEnd(14)} ${i.name.padEnd(30)} ${i.category.padEnd(16)} ${conf.padEnd(6)} ${i.useCount}`);
  }
  console.log('');
}

function exportInstincts(file) {
  const outFile = file || 'instincts-export.json';
  const instincts = loadInstincts();
  const outPath = path.resolve(process.cwd(), outFile);
  writeFile(outPath, JSON.stringify(instincts, null, 2) + '\n');
  log('success', `Exported ${instincts.length} instincts to ${outPath}`);
}

function importInstincts(file) {
  if (!file) {
    log('error', 'Usage: import <file>');
    return false;
  }

  const filePath = path.resolve(process.cwd(), file);
  if (!fileExists(filePath)) {
    log('error', `File not found: ${filePath}`);
    return false;
  }

  let imported;
  try {
    imported = JSON.parse(readFile(filePath));
  } catch {
    log('error', 'Invalid JSON in import file.');
    return false;
  }

  if (!Array.isArray(imported)) {
    log('error', 'Import file must contain a JSON array of instincts.');
    return false;
  }

  const existing = loadInstincts();
  const existingNames = new Set(existing.map((i) => i.name));
  let added = 0;
  let skipped = 0;

  for (const inst of imported) {
    if (existingNames.has(inst.name)) {
      skipped++;
      continue;
    }
    // Reduce confidence for imported instincts (not yet validated locally)
    inst.confidence = Math.max(CONFIDENCE_FLOOR, (inst.confidence || INITIAL_CONFIDENCE) * 0.8);
    inst.id = generateId();
    existing.push(inst);
    existingNames.add(inst.name);
    added++;
  }

  saveInstincts(existing);
  log('success', `Imported ${added} instincts (${skipped} duplicates skipped).`);
  return true;
}

function evolveInstincts() {
  const instincts = loadInstincts().map(applyDecay);

  // Cluster by category
  const clusters = {};
  for (const inst of instincts) {
    const cat = inst.category || 'uncategorized';
    if (!clusters[cat]) clusters[cat] = [];
    clusters[cat].push(inst);
  }

  console.log('');
  log('info', 'Instinct Clusters:');
  console.log('');

  let readyCount = 0;

  for (const [cat, members] of Object.entries(clusters)) {
    const avgConf = members.reduce((s, m) => s + m.confidence, 0) / members.length;
    const ready = members.length >= 3 && avgConf >= 0.7;
    const marker = ready ? ' ★ READY' : '';

    if (ready) readyCount++;

    console.log(`  ${cat} (${members.length} patterns, avg confidence: ${avgConf.toFixed(2)})${marker}`);
    for (const m of members) {
      console.log(`    - ${m.name} (${m.confidence.toFixed(2)})`);
    }
    console.log('');
  }

  if (readyCount > 0) {
    log('success', `${readyCount} cluster(s) ready for evolution into formal skills.`);
    log('info', 'Run: node scripts/skill-creator.js <name> to create a skill from a cluster.');
  } else {
    log('info', 'No clusters ready for evolution yet. Keep using and validating patterns.');
  }
}

function getStatus() {
  const instincts = loadInstincts().map(applyDecay);

  if (instincts.length === 0) {
    log('info', 'No instincts stored. Use "add" to create your first instinct.');
    return {};
  }

  const categories = {};
  for (const inst of instincts) {
    const cat = inst.category || 'uncategorized';
    if (!categories[cat]) categories[cat] = 0;
    categories[cat]++;
  }

  const avgConf = instincts.reduce((s, i) => s + i.confidence, 0) / instincts.length;
  const highConf = instincts.filter((i) => i.confidence >= 0.7).length;
  const lowConf = instincts.filter((i) => i.confidence < 0.3).length;

  console.log('');
  console.log('  Instinct Store Status');
  console.log('  ─────────────────────');
  console.log(`  Total instincts:      ${instincts.length}`);
  console.log(`  Average confidence:   ${avgConf.toFixed(2)}`);
  console.log(`  High confidence (≥0.7): ${highConf}`);
  console.log(`  Low confidence (<0.3):  ${lowConf}`);
  console.log('');
  console.log('  By category:');
  for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${cat}: ${count}`);
  }
  console.log('');

  return { total: instincts.length, avgConf, highConf, lowConf, categories };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

function parseCliArgs(argv) {
  const args = argv.slice(2);
  const command = args[0];
  const opts = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx > -1) {
        opts[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else {
        opts[arg.slice(2)] = true;
      }
    } else if (!opts._positional) {
      opts._positional = arg;
    }
  }

  return { command, opts };
}

if (require.main === module) {
  const { command, opts } = parseCliArgs(process.argv);

  switch (command) {
    case 'list':
      listInstincts({ category: opts.category, search: opts.search, minConfidence: parseFloat(opts['min-confidence']) || 0 });
      break;
    case 'add':
      addInstinct(opts._positional, opts.category, opts.pattern);
      break;
    case 'remove':
      removeInstinct(opts._positional);
      break;
    case 'export':
      exportInstincts(opts.file || opts._positional);
      break;
    case 'import':
      importInstincts(opts._positional || opts.file);
      break;
    case 'evolve':
      evolveInstincts();
      break;
    case 'status':
      getStatus();
      break;
    default:
      console.log('Usage: node instinct-manager.js <command> [options]');
      console.log('');
      console.log('Commands:');
      console.log('  list     [--category=X] [--search=X] [--min-confidence=0.5]');
      console.log('  add      <name> --category=<cat> --pattern="<desc>"');
      console.log('  remove   <id>');
      console.log('  export   [--file=instincts.json]');
      console.log('  import   <file>');
      console.log('  evolve   Cluster instincts and suggest skill creation');
      console.log('  status   Summary of instinct store');
      process.exit(1);
  }
}

module.exports = { addInstinct, removeInstinct, evolveInstincts, getStatus, loadInstincts, saveInstincts, applyDecay, incrementConfidence };
