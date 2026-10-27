// Single-line gate bar (SDD-09, AC-002): ✓ done, ● current, ○ open, without separators. Below the
// width the full bar needs, a condensed form keeps every mark and still names the current gate.

import { GATES } from './run-state.mjs';

const GLYPH = Object.freeze({ done: '✓', current: '●', open: '○' });

export function gateMarks(run) {
  const done = run.lifecycle === 'completed';
  const approved = new Set(run.approved);
  return GATES.map(gate => ({
    gate,
    mark: done || approved.has(gate) ? 'done' : gate === run.gate ? 'current' : 'open',
  }));
}

export const fullGateBar = marks => marks.map(({ gate, mark }) => `${GLYPH[mark]}${gate}`).join(' ');

export function condensedGateBar(marks) {
  const current = marks.find(({ mark }) => mark === 'current');
  const glyphs = marks.map(({ mark }) => GLYPH[mark]).join('');
  return current ? `${glyphs} ${current.gate}` : glyphs;
}

// The glyphs and gate codes are single-width; columns is the pane's bodyColumns.
export function gateBar(marks, columns = Infinity) {
  const full = fullGateBar(marks);
  return full.length <= columns ? full : condensedGateBar(marks);
}
