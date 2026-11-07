// Golden status-card comparison over the companion fixture set (TP T-001, SCN-018, SD SDD-002).
// The baseline is captured on unchanged code; afterwards CLI and MCP status card bytes and status
// fields must stay identical. Record a new baseline only for a deliberate, reviewed change:
//   AGDF_GOLDEN_RECORD=1 node --test packages/core/test/status-card-golden-test.js
import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCompanionFixtures, volatileValues } from './fixtures/companion-fixtures.js';
import { evaluateGateCheck, printGateCheckReport } from '../lib/control-evaluation/gate-check.js';
import { captureControlScope } from '../lib/control-read/snapshot.js';

const GOLDEN = fileURLToPath(new URL('./fixtures/companion/status-card-golden.json', import.meta.url));
const LANGUAGES = Object.freeze(['de', 'en']);

function cliStatusCard(report) {
  const lines = [];
  printGateCheckReport(report, false, true, { log: (line = '') => lines.push(String(line)) });
  return lines.join('\n');
}
const statusFields = report => ({
  status: report.status, current_gate: report.current_gate, blocking_reason: report.blocking_reason,
  missing_approval: report.missing_approval, next_allowed_action: report.next_allowed_action,
  allowed: report.allowed, forbidden: report.forbidden, next_operation: report.next_operation?.type ?? null,
  card: report.status_card ? {
    status: report.status_card.status, current_gate: report.status_card.current_gate, breadcrumb: report.status_card.breadcrumb,
    missing_approval: report.status_card.missing_approval, blocking_condition: report.status_card.blocking_condition,
    next_step: report.status_card.next_step, next_user_gate: report.status_card.next_user_gate,
    user_action_required: report.status_card.user_action_required } : null,
});
function evaluate(fx, language, mcp) {
  const selection = { runId: fx.runId, ignoreRunIdEnv: true, presentationLanguage: language };
  try {
    const report = mcp ? captureControlScope(fx.root, view => evaluateGateCheck(view.root, selection)).data : evaluateGateCheck(fx.root, selection);
    return mcp
      ? { markdown: report.status_presentation?.markdown ?? report.approval_presentation?.preview_markdown ?? null, status_card_variant: cliStatusCard(report), fields: statusFields(report) }
      : { status_card: cliStatusCard(report), fields: statusFields(report) };
  } catch (error) { return { error: error.message }; }
}

// Replaces only exact values the fixture wrote, in order of first appearance.
function normalize(value, volatile) {
  const strings = [];
  const collect = item => { if (typeof item === 'string') strings.push(item); else if (item && typeof item === 'object') Object.values(item).forEach(collect); };
  collect(value);
  const joined = strings.join('\n');
  const order = volatile.map(text => ({ text, at: joined.indexOf(text) })).filter(row => row.at >= 0).sort((a, b) => a.at - b.at || b.text.length - a.text.length);
  const tokens = new Map(order.map((row, index) => [row.text, `{{volatile-${index + 1}}}`]));
  const replace = text => [...tokens.keys()].sort((a, b) => b.length - a.length).reduce((out, key) => out.split(key).join(tokens.get(key)), text);
  const walk = item => typeof item === 'string' ? replace(item) : Array.isArray(item) ? item.map(walk)
    : item && typeof item === 'object' ? Object.fromEntries(Object.entries(item).map(([key, entry]) => [key, walk(entry)])) : item;
  return walk(value);
}

// The absolute paths of the files the fixture wrote, as the platform joins them, each mapped to the root
// followed by its POSIX relative path. Exact strings only, so the golden is the same on Windows and Linux
// (artefact links in the cards); on POSIX hosts every pair is identical and nothing changes.
function portablePaths(value, root) {
  const pairs = [];
  const walkFiles = dir => { for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(path);
    else pairs.push([path, `${root}/${relative(root, path).split(sep).join('/')}`]);
  } };
  walkFiles(join(root, '.agdf', 'control'));
  const changed = pairs.filter(([native, portable]) => native !== portable).sort((a, b) => b[0].length - a[0].length);
  const replace = text => changed.reduce((out, [native, portable]) => out.split(native).join(portable), text);
  const walk = item => typeof item === 'string' ? replace(item) : Array.isArray(item) ? item.map(walk)
    : item && typeof item === 'object' ? Object.fromEntries(Object.entries(item).map(([key, entry]) => [key, walk(entry)])) : item;
  return walk(value);
}

export function captureGolden(fx) {
  const capture = Object.fromEntries(LANGUAGES.map(language => [language, { cli: evaluate(fx, language, false), mcp: evaluate(fx, language, true) }]));
  return { name: fx.name, ...normalize(portablePaths(capture, fx.root), volatileValues(fx.root)) };
}

test('status card output for the companion fixture set equals the recorded baseline', t => {
  const fixtures = buildCompanionFixtures(t);
  const actual = Object.fromEntries(fixtures.map(fx => [fx.id, captureGolden(fx)]));
  if (process.env.AGDF_GOLDEN_RECORD === '1') {
    writeFileSync(GOLDEN, `${JSON.stringify(actual, null, 2)}\n`);
    t.diagnostic(`recorded ${fixtures.length} fixtures to ${GOLDEN}`);
    return;
  }
  assert.ok(existsSync(GOLDEN), 'golden baseline is missing; record it on the unchanged baseline first');
  const expected = JSON.parse(readFileSync(GOLDEN, 'utf8'));
  assert.deepEqual(Object.keys(actual), Object.keys(expected), 'fixture set changed');
  for (const id of Object.keys(expected)) assert.deepEqual(actual[id], expected[id], `${id} ${expected[id].name}: status card bytes or fields changed`);
});
