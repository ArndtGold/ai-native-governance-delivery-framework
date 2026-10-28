// Single-line gate bar (SDD-02, AC-001, AC-003): ✓ done, ● current, ○ open, without separators. It
// follows the status card's path for the run's route and adds the build phase as `CD+Tests` between
// TP and QA on structured paths. Below the width the full bar needs, a condensed form keeps every
// mark and still names the current gate.

import { BUILD_GATES, isStructured } from './run-state.mjs';

const GLYPH = Object.freeze({ done: '✓', current: '●', open: '○' });
const STRUCTURED = Object.freeze(['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT', 'OR']);
// The status card's paths (`BREADCRUMB_PATH_TEMPLATES`, gate-check.js); parity-tested.
export const PATHS = Object.freeze({
  structured_delivery: STRUCTURED,
  structured_slice: STRUCTURED,
  verified_change: Object.freeze(['UR', 'Verified Change', 'OR']),
  quick_task: Object.freeze(['UR', 'Compact Delivery']),
  block: Object.freeze(['UR', 'Block']),
  undecided: Object.freeze(['UR']),
});
export const BUILD_MARK = 'CD+Tests';
const USER_GATES = new Set(['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT']);
const AFTER_BUILD = new Set(['QA', 'UAT', 'OR']);
const COMPACT = Object.freeze({ 'Verified Change': 'verified_change', 'Compact Delivery': 'quick_task', Block: 'block' });

// One path entry's mark as `buildBreadcrumbPath` derives it; a completed run at OR has its closeout.
function cardMark(gate, run) {
  if (USER_GATES.has(gate)) return run.approved.includes(gate) ? 'done' : gate === run.gate ? 'current' : 'open';
  if (gate === 'OR' && run.gate === 'OR' && run.lifecycle === 'completed') return 'done';
  if (gate === run.gate) return 'current';
  if ((gate === 'Verified Change' || gate === 'Compact Delivery') && run.gate === 'OR') return 'done';
  return Object.hasOwn(COMPACT, gate) && COMPACT[gate] === run.route ? 'current' : 'open';
}

export function gateMarks(run) {
  const path = Object.hasOwn(PATHS, run.route) ? PATHS[run.route] : PATHS.undecided;
  const marks = path.map(gate => ({ gate, mark: cardMark(gate, run) }));
  if (!isStructured(run.route)) return marks;
  const build = BUILD_GATES.includes(run.gate) ? 'current' : AFTER_BUILD.has(run.gate) || run.lifecycle === 'completed' ? 'done' : 'open';
  marks.splice(path.indexOf('QA'), 0, { gate: BUILD_MARK, mark: build });
  return marks;
}

export const fullGateBar = marks => marks.map(({ gate, mark }) => `${GLYPH[mark]}${gate}`).join(' ');

export function condensedGateBar(marks) {
  const current = marks.find(({ mark }) => mark === 'current');
  const glyphs = marks.map(({ mark }) => GLYPH[mark]).join('');
  return current ? `${glyphs} ${current.gate}` : glyphs;
}

// The glyphs and gate names are single-width; columns is the pane's bodyColumns.
export function gateBar(marks, columns = Infinity) {
  const full = fullGateBar(marks);
  return full.length <= columns ? full : condensedGateBar(marks);
}
