// Synthetic calibration cases. Only packet is sent to the reviewer; oracle and
// executable checks stay in the parent process. These are not AGDF host evidence.
const artifact = (path, text) => ({ path, lines: text.trim().split('\n') });

const boundary = inclusive => ({
  requirements: [{ id: 'AC-1', text: 'For integer inputs, allowed(amount, limit) returns true exactly when amount is between zero and limit, inclusive.' }],
  artifacts: [artifact('src/check.cjs', `module.exports = function allowed(amount, limit) {
  return amount >= 0 && amount ${inclusive ? '<=' : '<'} limit;
};`), artifact('tests/check.cjs', `const allowed = require('../src/check.cjs');
assert.equal(allowed(3, 10), true);
assert.equal(allowed(-1, 10), false);
assert.equal(allowed(11, 10), false);`)],
  test_evidence: 'The supplied three assertions passed. No other execution is reported.',
});

const idempotency = correct => ({
  requirements: [{ id: 'AC-1', text: 'For sequential calls and a synchronous write callback that returns normally, apply(cache, id, write) must invoke write exactly once for an id and return its first result on every retry. The same Map is reused.' }],
  artifacts: [artifact('src/check.cjs', correct ? `module.exports = function apply(cache, id, write) {
  if (cache.has(id)) return cache.get(id);
  const value = write();
  cache.set(id, value);
  return value;
};` : `module.exports = function apply(cache, id, write) {
  const value = write();
  if (cache.has(id)) return cache.get(id);
  cache.set(id, value);
  return value;
};`), artifact('tests/check.cjs', `const apply = require('../src/check.cjs');
const cache = new Map();
assert.equal(apply(cache, 'op-1', () => 7), 7);`)],
  test_evidence: 'The supplied first-call assertion passed. No retry was executed in this test.',
});

const evidence = current => ({
  requirements: [{ id: 'AC-1', text: 'The delivery claim requires a completed real-browser save/reload observation for candidate sample-17 in Browser 1. A synthetic DOM test or another candidate does not satisfy it. Judge the supplied report as evidence within this synthetic exercise.' }],
  artifacts: [artifact('src/check.cjs', `module.exports = function save(storage, value) {
  storage.setItem('draft', value);
  return storage.getItem('draft');
};`), artifact('reports/browser.txt', `Result: PASS
Mode: ${current ? 'real browser' : 'synthetic DOM fixture'}
Candidate: ${current ? 'sample-17' : 'sample-16'}
Host: Browser 1
Scenario: enter draft, save, reload, observe persisted draft
Observed: the draft remains visible after reload`)],
  test_evidence: 'Delivery summary: the browser acceptance criterion is satisfied. The attached report is the only supporting observation.',
});

const codeOracle = (fn, check) => ({
  expected: [{ requirement_id: 'AC-1', gap_type: 'implementation_gap', source: 'src/check.cjs', lines: [2, 3] }],
  check: packet => check(fn(packet.artifacts[0].lines.join('\n'))),
});

// Trusted fixture evaluation, never execute model output or supplied repositories.
const load = text => Function('module', `${text}\nreturn module.exports;`)({ exports: {} });
const boundaryOracle = codeOracle(load, fn => fn(10, 10) === true);
const retryOracle = codeOracle(load, fn => {
  let calls = 0;
  const cache = new Map();
  const first = fn(cache, 'id', () => ++calls);
  const second = fn(cache, 'id', () => ++calls);
  return calls === 1 && first === 1 && second === 1;
});
const evidenceOracle = {
  expected: [{ requirement_id: 'AC-1', gap_type: 'evidence_gap', source: 'reports/browser.txt', lines: [2, 3] }],
  check: packet => packet.artifacts[1].lines.includes('Mode: real browser') && packet.artifacts[1].lines.includes('Candidate: sample-17'),
};

export const CASES = [
  { id: 'C01', pair: 'boundary', packet: boundary(false), oracle: boundaryOracle },
  { id: 'C02', pair: 'boundary', packet: boundary(true), oracle: { ...boundaryOracle, expected: [] } },
  { id: 'C03', pair: 'retry', packet: idempotency(false), oracle: retryOracle },
  { id: 'C04', pair: 'retry', packet: idempotency(true), oracle: { ...retryOracle, expected: [] } },
  { id: 'C05', pair: 'evidence', packet: evidence(false), oracle: evidenceOracle },
  { id: 'C06', pair: 'evidence', packet: evidence(true), oracle: { ...evidenceOracle, expected: [] } },
];
