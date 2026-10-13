import { afterEach, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { FlowEvidence } from '../src/FlowEvidence';
import { validateData } from '../src/api';
import { runData, runScope } from './scoped-fixtures';
import registry from '../../../plugins/agdf/meta/agdf-interaction-locales.json';
afterEach(() => { cleanup(); document.documentElement.lang = 'de'; });
it.each(['en', 'de'] as const)('renders current, earlier and unknown evidence separately in %s; reads only positively matched registered bytes', locale => {
  document.documentElement.lang = locale; const l = registry.locales[locale].flowEvidence, data = runData('run-a');
  const path = '.agdf/control/artefacts/run-a/CR.md';
  data.resources.push({ resource_id: 'source', run_id: 'run-a', type: 'CR', path, registered_reference: path, status: 'registered' });
  data.evidence_applicability = { current: [{ step: 'CR', path, reason: 'current_exact_association', available: true }],
    superseded: [{ step: 'QA', path: '.agdf/control/artefacts/run-a/OLD_QA.md', reason: 'source_version_superseded', available: true }],
    applicability_unknown: [{ step: null, path: 'Legacy free reference', reason: 'no_writer_owned_association', available: null }] };
  data.evaluation!.next_operation = { type: 'human_gate_decision', operation_key: 'approval.record', actor: 'human', effect: 'decision', gate: 'QA' };
  const onOpen = vi.fn(); render(<FlowEvidence data={data} onOpen={onOpen}/>);
  expect(screen.getByRole('heading', { name: `${l.current} · 1` })).toBeTruthy();
  expect(screen.getByText(`${l.next}: ${l.human} ·`, { exact: false })).toBeTruthy();
  expect(screen.getByText(`${l.superseded} · 1`)).toBeTruthy(); expect(screen.getByText(`${l.applicability_unknown} · 1`)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: l.open })); expect(onOpen).toHaveBeenCalledWith(data.resources[0]);
  expect(onOpen).toHaveBeenCalledTimes(1);
});
it.each(['en', 'de'] as const)('keeps empty/retained/unconfirmed/completed states truthful in %s', locale => {
  document.documentElement.lang = locale; const l = registry.locales[locale].flowEvidence, data = runData('run-a');
  data.evidence_applicability = { current: [], superseded: [], applicability_unknown: [] };
  data.evaluation!.completion = { status: 'unconfirmed', gate: 'OR', fulfilled: false };
  const rendered = render(<FlowEvidence data={data} onOpen={vi.fn()}/>);
  expect(screen.getByText(l.emptyDescription)).toBeTruthy(); expect(screen.getByText(l.unconfirmedDescription)).toBeTruthy();
  data.evaluation!.completion = { status: 'completed', gate: 'OR', fulfilled: true };
  rendered.rerender(<FlowEvidence data={data} onOpen={vi.fn()} current={false}/>);
  expect(screen.getByText(l.retainedDescription)).toBeTruthy(); expect(screen.queryByText(l.completed)).toBeNull();
  rendered.rerender(<FlowEvidence data={data} onOpen={vi.fn()}/>); expect(screen.getByText(l.completed)).toBeTruthy();
});
it('preserves legacy additive DTO compatibility and rejects malformed authority/association/completion claims', () => {
  const data = runData('run-a'); expect(() => validateData('/api/runs/run-a', runScope(data))).not.toThrow();
  data.evidence_applicability = { current: [], superseded: [], applicability_unknown: [] };
  data.evaluation!.completion = { status: 'pending', gate: 'OR', fulfilled: false };
  expect(() => validateData('/api/runs/run-a', runScope(data))).not.toThrow();
  for (const mutate of [(v: typeof data) => { v.evaluation!.completion!.fulfilled = true; },
    (v: typeof data) => { v.evaluation!.next_operation = { type: 'run', operation_key: 'shell', actor: 'model' as 'agent', effect: 'arbitrary', gate: 'OR' }; },
    (v: typeof data) => { v.evidence_applicability!.current = [{ step: 'QA', path: null, reason: 'unknown', available: 'approved' as unknown as boolean }]; }]) {
    const changed = structuredClone(data); mutate(changed); expect(() => validateData('/api/runs/run-a', runScope(changed))).toThrow('dto_invalid');
  }
});
