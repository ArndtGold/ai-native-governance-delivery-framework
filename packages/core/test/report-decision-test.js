import assert from 'node:assert/strict';
import { readReportDecision } from '../lib/control-evaluation/report-decision.js';
import { readFileSync } from 'node:fs';
import { reportContextCases, reportInternalCases } from './fixtures/report-decision-cases.js';
const accepted = [
  ['Status: pass\nDecision: pass\n', 'pass'],
  ['Status: draft\nDecision: pass\n', 'pass'],
  ['Status: done\n- decision: pass\n', 'pass'],
  ['- decision: pass\n', 'pass'],
  ['Decision: `pass`\r\nStatus: pass\r\n', 'pass'],
  ['STATUS: PASS\nDECISION: PASS\n', 'pass'],
  ['Decision: passed\nStatus: pass\n', 'pass'],
  ['Decision: revise\n- decision: revise\n', 'revise'],
  ['Status: block\nDecision: block\n', 'block'],
];
for (const [text, expected] of accepted) assert.equal(readReportDecision(text), expected, text);
for (const text of [null, '', 'Status: draft\n', 'Status: pass\nDecision: revise\n',
  'Decision: pass\nDecision: block\n', 'Status: block\nDecision: pass\n',
  'Status: pass\nDecision: unknown\n', 'Status: pass\nDecision:\n',
  'Status: pass\nDecision: pass | revise | block\n', 'Decision: pass extra\n']) {
  assert.equal(readReportDecision(text), null, String(text));
}
console.log('Shared report-result compatibility, consistent duplicates, aliases, lifecycle metadata and conflict/unknown/missing refusal passed (19 cases).');
for (const [name, text, expected] of reportContextCases) assert.equal(readReportDecision(text), expected, name);
for (const [name, text, expected] of reportInternalCases) assert.equal(readReportDecision(text, { allowNotApplicable: true }), expected, name);
assert.equal(readReportDecision('Decision: not_applicable\n'), null, 'QA domain excludes internal not_applicable');
const template = readFileSync(new URL('../../../plugins/agdf/control/templates/artefacts/QA_REPORT.md', import.meta.url), 'utf8');
assert.equal(readReportDecision(template.replace('<Title>', 'Populated canonical report').replace('`pass | revise | block`', 'pass')), 'pass', 'Populated canonical QA template field placement remains valid');
console.log(`Authored report contexts and code/quote/HTML exclusion passed (${reportContextCases.length} context cases, ${reportInternalCases.length} internal cases, canonical template and default-domain check).`);
