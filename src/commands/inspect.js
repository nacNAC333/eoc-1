/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const path = require('path');
const fs = require('fs');

/**
 * Extract the first balanced JSON array from a string, ignoring any trailing
 * bytes that may have been left over by a non-atomic writer (observed on
 * Windows CI, see issue #782).
 * @param {String} text - Raw file contents
 * @return {String} Substring spanning the first complete `[...]` array
 */
function firstJsonArray(text) {
  const body = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
    } else if (ch === '"') {
      inString = true;
    } else if (ch === '[') {
      if (depth === 0) {
        start = i;
      }
      depth += 1;
    } else if (ch === ']') {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        return body.slice(start, i + 1);
      }
    }
  }
  throw new SyntaxError('No complete JSON array found in foreign catalog');
}

/**
 * Inspects foreign objects and prints a structured report.
 * @param {Hash} opts - All options
 */
module.exports = function(opts) {
  const file = path.resolve(opts.target, 'eo-foreign.json');
  if (!fs.existsSync(file)) {
    console.error('No eo-foreign.json found in %s', rel(path.dirname(file)));
    process.exit(1);
  }
  const all = JSON.parse(firstJsonArray(fs.readFileSync(file, 'utf8')));
  console.info('Foreign catalog: %s (%d objects)', rel(file), all.length);
  console.info('───────────────────────────────────────────────');
  all.forEach((obj) => {
    const status = obj.status || 'unknown';
    console.info('  %s [%s]', obj.id, status);
  });
  console.info('───────────────────────────────────────────────');
  console.info('Total: %d foreign objects', all.length);
};

module.exports.firstJsonArray = firstJsonArray;
