import assert from 'node:assert/strict';
import { readReportDecision } from '../lib/control-evaluation/report-decision.js';
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
