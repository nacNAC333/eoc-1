/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

// The values here are replaced automatically by the .rultor.yml script,
// at the "release" pipeline:
const pkg = (() => {
  try {
    return require(path.join(__dirname, '../package.json'));
  } catch {
    return {version: '0.0.0', date: '0000-00-00'};
  }
})();

module.exports = {
  what: pkg.version,
  when: pkg.date || '0000-00-00'
};
