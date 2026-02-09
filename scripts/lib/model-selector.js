#!/usr/bin/env node

/**
 * model-selector.js - Model routing logic for the everything-copilot project.
 *
 * Maps task types to the most cost-effective Claude model, exposes per-model
 * configuration, and provides lightweight helpers for token estimation and
 * budget checking.
 *
 * Model hierarchy (descending capability / ascending cost):
 *   opus   - Complex reasoning, architecture, security review
 *   sonnet - General coding, refactoring, code review
 *   haiku  - Quick lookups, formatting, simple generation
 */

'use strict';

// ---------------------------------------------------------------------------
// TASK_CATEGORIES
// ---------------------------------------------------------------------------

/**
 * Maps a human-readable task category to the recommended Claude model.
 *
 * Each entry contains:
 *   - `model`       : default model name
 *   - `description` : what this category covers
 *
 * @type {Record<string, { model: string, description: string }>}
 */
const TASK_CATEGORIES = {
  // --- Opus-level tasks (high complexity) ---
  architecture: {
    model: 'opus',
    description: 'System design, architecture decisions, complex refactoring',
  },
  'security-review': {
    model: 'opus',
    description: 'Security audits, vulnerability analysis, threat modeling',
  },
  'complex-debugging': {
    model: 'opus',
    description: 'Multi-file debugging, race conditions, memory leaks',
  },
  'code-migration': {
    model: 'opus',
    description: 'Large-scale migrations, framework upgrades, language ports',
  },
  planning: {
    model: 'opus',
    description: 'Project planning, technical specifications, RFC drafting',
  },

  // --- Sonnet-level tasks (medium complexity) ---
  coding: {
    model: 'sonnet',
    description: 'General feature implementation and bug fixes',
  },
  'code-review': {
    model: 'sonnet',
    description: 'Pull request reviews, code quality checks',
  },
  refactoring: {
    model: 'sonnet',
    description: 'Code restructuring, pattern application, cleanup',
  },
  testing: {
    model: 'sonnet',
    description: 'Test generation, test review, coverage improvement',
  },
  documentation: {
    model: 'sonnet',
    description: 'API docs, READMEs, inline documentation',
  },

  // --- Haiku-level tasks (low complexity) ---
  formatting: {
    model: 'haiku',
    description: 'Code formatting, linting fixes, style adjustments',
  },
  'simple-generation': {
    model: 'haiku',
    description: 'Boilerplate, templates, repetitive patterns',
  },
  lookup: {
    model: 'haiku',
    description: 'API lookups, syntax checks, quick answers',
  },
  summarization: {
    model: 'haiku',
    description: 'Summarizing files, changelogs, commit messages',
  },
  translation: {
    model: 'haiku',
    description: 'i18n string translation, locale file generation',
  },
};

// ---------------------------------------------------------------------------
// MODEL_CONFIGS
// ---------------------------------------------------------------------------

/**
 * Per-model configuration: context window size, output limits, and an
 * approximate cost tier (relative, not actual pricing).
 *
 * @type {Record<string, { contextWindow: number, maxOutput: number, costTier: string, inputCostPer1k: number, outputCostPer1k: number }>}
 */
const MODEL_CONFIGS = {
  opus: {
    contextWindow: 200000,
    maxOutput: 32000,
    costTier: 'high',
    // Approximate costs in USD per 1 000 tokens (illustrative).
    inputCostPer1k: 0.015,
    outputCostPer1k: 0.075,
  },
  sonnet: {
    contextWindow: 200000,
    maxOutput: 16000,
    costTier: 'medium',
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
  },
  haiku: {
    contextWindow: 200000,
    maxOutput: 8000,
    costTier: 'low',
    inputCostPer1k: 0.00025,
    outputCostPer1k: 0.00125,
  },
};

// ---------------------------------------------------------------------------
// selectModel(task) -> string
// ---------------------------------------------------------------------------

/**
 * Given a task description or category name, return the recommended model.
 *
 * Resolution order:
 *   1. Exact match against `TASK_CATEGORIES` keys.
 *   2. Fuzzy keyword match in the task string against category keys.
 *   3. Default to `'sonnet'` (best general-purpose trade-off).
 *
 * @param {string} task - A task category key or free-text description.
 * @returns {string} One of `'opus'`, `'sonnet'`, `'haiku'`.
 */
function selectModel(task) {
  if (!task || typeof task !== 'string') {
    return 'sonnet';
  }

  const normalised = task.trim().toLowerCase();

  // 1. Exact match.
  if (TASK_CATEGORIES[normalised]) {
    return TASK_CATEGORIES[normalised].model;
  }

  // 2. Keyword search: check if any category key appears in the task text.
  for (const [category, config] of Object.entries(TASK_CATEGORIES)) {
    // Match either the key or significant words in the description.
    const keywords = [
      category,
      ...config.description.toLowerCase().split(/[\s,]+/),
    ];
    for (const kw of keywords) {
      if (kw.length > 3 && normalised.includes(kw)) {
        return config.model;
      }
    }
  }

  // 3. Fallback.
  return 'sonnet';
}

// ---------------------------------------------------------------------------
// getModelConfig(model) -> object
// ---------------------------------------------------------------------------

/**
 * Return the configuration object for a given model.
 *
 * @param {string} model - One of 'opus', 'sonnet', 'haiku'.
 * @returns {{ contextWindow: number, maxOutput: number, costTier: string, inputCostPer1k: number, outputCostPer1k: number } | null}
 */
function getModelConfig(model) {
  if (!model || typeof model !== 'string') return null;
  return MODEL_CONFIGS[model.toLowerCase()] || null;
}

// ---------------------------------------------------------------------------
// estimateTokens(text) -> number
// ---------------------------------------------------------------------------

/**
 * Quick-and-dirty token estimation.  A common heuristic for English text
 * processed by BPE tokenisers is ~4 characters per token.
 *
 * @param {string} text
 * @returns {number} Estimated token count (always >= 0).
 */
function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  return Math.ceil(text.length / 4);
}

// ---------------------------------------------------------------------------
// isWithinBudget(model, estimatedTokens, budget) -> boolean
// ---------------------------------------------------------------------------

/**
 * Check whether sending `estimatedTokens` to `model` fits within the given
 * dollar `budget`.
 *
 * The cost is computed as input cost only (output cost is unpredictable).
 * This provides a conservative lower-bound check.
 *
 * @param {string} model           - One of 'opus', 'sonnet', 'haiku'.
 * @param {number} estimatedTokens - Estimated input token count.
 * @param {number} budget          - Maximum spend in USD.
 * @returns {boolean}
 */
function isWithinBudget(model, estimatedTokens, budget) {
  const config = getModelConfig(model);
  if (!config) return false;
  if (typeof budget !== 'number' || budget <= 0) return false;

  const estimatedCost = (estimatedTokens / 1000) * config.inputCostPer1k;
  return estimatedCost <= budget;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  TASK_CATEGORIES,
  MODEL_CONFIGS,
  selectModel,
  getModelConfig,
  estimateTokens,
  isWithinBudget,
};
