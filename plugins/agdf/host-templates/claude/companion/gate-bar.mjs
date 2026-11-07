// Single-line gate bar (SDD-02, AC-001, AC-003): ✓ done, ● current, ○ open, without separators. It
// draws the status card's own path from the run view (SD SDD-001) and adds the build phase as
// `CD+Tests` between TP and QA on structured paths. Below the width the full bar needs, a condensed
// form keeps every mark and still names the current gate.

import { BUILD_GATES, isStructured } from './run-state.mjs';

const GLYPH = Object.freeze({ done: '✓', current: '●', open: '○' });
export const BUILD_MARK = 'CD+Tests';
// The status card's breadcrumb states; a blocked gate is the current one.
const MARK = Object.freeze({ fulfilled: 'done', current: 'current', blocked: 'current', open: 'open' });
const AFTER_BUILD = new Set(['QA', 'UAT', 'OR']);

export function gateMarks(run) {
  const path = run.path ?? [];
  const marks = path.map(({ gate, status }) => ({ gate, mark: MARK[status] ?? 'open' }));
  const qa = marks.findIndex(({ gate }) => gate === 'QA');
  if (!isStructured(run.route) || qa < 0) return marks;
  const build = BUILD_GATES.includes(run.gate) ? 'current' : AFTER_BUILD.has(run.gate) || run.lifecycle === 'completed' ? 'done' : 'open';
  marks.splice(qa, 0, { gate: BUILD_MARK, mark: build });
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
