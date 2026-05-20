/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {execSync} = require('child_process');

/**
 * Maven Central repository URL.
 */
const MAVEN_REPO = 'https://repo.maven.apache.org/maven2';

/**
 * Extract release version from Maven metadata XML.
 * @param {String} xml - Maven metadata XML content
 * @return {String} Release version
 */
function parseReleaseVersion(xml) {
  const {XMLParser} = require('fast-xml-parser');
  const parsed = new XMLParser().parse(xml);
  return parsed.metadata.versioning.release;
}

/**
 * Fetch Maven metadata XML for a given artifact.
 * @param {String} groupId - Maven group ID (e.g., org/eolang)
 * @param {String} artifactId - Maven artifact ID (e.g., eo-maven-plugin)
 * @return {String} Maven metadata XML
 */
function fetchMavenMetadata(groupId, artifactId) {
  const repoPath = `${groupId.replace(/\./g, '/')}/${artifactId}`;
  const url = `${MAVEN_REPO}/${repoPath}/maven-metadata.xml`;
  return execSync(`curl -sL --max-time 10 ${url}`, {encoding: 'utf8'});
}

/**
 * Validate that a specific Maven version exists.
 * @param {String} groupId - Maven group ID
 * @param {String} artifactId - Maven artifact ID
 * @param {String} version - Version to validate
 * @return {Boolean} True if version exists
 */
function validateMavenVersion(groupId, artifactId, version) {
  const repoPath = `${groupId.replace(/\./g, '/')}/${artifactId}/${version}`;
  const url = `${MAVEN_REPO}/${repoPath}/${artifactId}-${version}.pom`;
  try {
    const result = execSync(`curl -sL -o /dev/null -w "%{http_code}" --max-time 5 ${url}`, {encoding: 'utf8'});
    return result.trim() === '200';
  } catch {
    return false;
  }
}

/**
 * Load the latest version from Maven Central.
 * @return {String} Latest version, for example '0.23.1'
 */
const version = module.exports = {
  value: '',

  /**
   * Get the latest Maven parser version.
   * @return {String} Latest version string
   */
  get() {
    if (version.value !== '') {
      return version.value;
    }
    // Fetch and parse Maven metadata
    const repo = 'org/eolang/eo-maven-plugin';
    const groupId = 'org.eolang';
    const artifactId = 'eo-maven-plugin';
    try {
      const url = `${MAVEN_REPO}/${groupId.replace(/\./g, '/')}/${artifactId}/maven-metadata.xml`;
      const xml = execSync(`curl -sL --max-time 10 ${url}`, {encoding: 'utf8'});
      version.value = parseReleaseVersion(xml);
      console.info('The latest version of %s at Maven Central is %s', repo, version.value);
    } catch (e) {
      console.error('Failed to fetch Maven metadata: %s', e.message);
      throw e;
    }
    return version.value;
  },

  /**
   * Check if a specific Maven parser version exists.
   * @param {String} ver - Version to check
   * @return {Boolean} True if version exists in Maven Central
   */
  exists(ver) {
    if (!ver || ver === 'undefined' || ver === 'null' || ver === '') {
      return false;
    }
    try {
      const groupId = 'org.eolang';
      const artifactId = 'eo-maven-plugin';
      const url = `${MAVEN_REPO}/org/eolang/${artifactId}/${ver}/${artifactId}-${ver}.pom`;
      // Use curl to check if version exists
      const result = execSync(`curl -sL -o /dev/null -w "%{http_code}" --max-time 5 ${url}`, {encoding: 'utf8'});
      return result.trim() === '200';
    } catch {
      return false;
    }
  }
};
