import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Overview } from '../src/Overview';
import { validateData } from '../src/api';
import { backlog, pointer, runData } from './scoped-fixtures';
import { RunDetail } from '../src/RunDetail';
afterEach(cleanup);
it('run model: shows canonical titles and source order without an auxiliary title source', () => {
  render(<Overview result={backlog([pointer('run-b', 'Beta'), pointer('run-a', 'Alpha')])} onSelect={vi.fn()}/>);
  expect(screen.getAllByRole('heading', { level: 3 }).map(node => node.textContent)).toEqual(['Beta', 'Alpha']);
  expect(screen.queryByText(/Legacy|Masterbacklog|laut Backlog/iu)).toBeNull();
  expect(screen.getAllByText('Zuletzt beobachteter Stand')).toHaveLength(2);
});
it('run model: refuses obsolete or missing layout and removed parallel summary fields', () => {
  const current = backlog();
  expect(() => validateData('/api/snapshot', current)).not.toThrow();
  for (const layout of [undefined, 'planned-urs-v1', 'master-backlog-v1'])
    expect(() => validateData('/api/snapshot', { ...current, data: { ...current.data, layout } })).toThrow();
  expect(() => validateData('/api/snapshot', { ...current, data: { ...current.data, kind: 'backlog' } })).toThrow();
  const rows = current.data!.entries.map(row => ({ ...row, saved_summary: { provenance_state: 'recorded' } }));
  expect(() => validateData('/api/snapshot', { ...current, data: { ...current.data, entries: rows } })).toThrow();
});
it('shows confirmed lifecycle separately from the saved status and leaves unknown lifecycle explicit', () => {
  const rows = [
    { ...pointer('a'), lifecycle: 'active' as const }, { ...pointer('b'), lifecycle: 'completed' as const },
    { ...pointer('c'), lifecycle: 'superseded' as const }, { ...pointer('d'), lifecycle: 'abandoned' as const },
    { ...pointer('e'), lifecycle: null },
  ];
  render(<Overview result={backlog(rows)} onSelect={vi.fn()}/>);
  const lifecycleLabels = [...document.querySelectorAll('.work-row-lifecycle')].map(node => node.textContent);
  for (const value of ['Aktiv', 'Abgeschlossen', 'Abgelöst', 'Abgebrochen', 'Lifecycle unbekannt']) expect(lifecycleLabels.some(label => label?.includes(value))).toBe(true);
  expect(screen.getAllByText('Zuletzt beobachteter Stand')).toHaveLength(5);
});
it('places provenance in the selected run, with an explicit stale observation', () => {
  const data = { ...runData('run-a'), title_source: 'ur' as const, resources: [{resource_id:'source',run_id:'run-a',type:'UR',path:'.agdf/control/runs/run-a/UR.md',registered_reference:'.agdf/control/runs/run-a/UR.md',status:'registered'}] };
  render(<RunDetail result={{ ...backlog(), data }} current={false} onOpen={vi.fn()} sourceEntry={pointer('run-a')}/>);
  const disclosure = screen.getByText('Quellen und Datenstand').closest('details')!;
  expect(disclosure.open).toBe(false);
  fireEvent.click(screen.getByText('Quellen und Datenstand'));
  expect(disclosure.open).toBe(true);
  expect(screen.getByText(/Überschrift des registrierten UR-Dokuments/)).toBeTruthy();
  expect(screen.getByText(/Datenstand nicht aktuell/)).toBeTruthy();
  expect(screen.getByText('Listenquelle')).toBeTruthy();
});
it('run model: current concrete obligation remains visible from the Run without a saved comparison', () => {
  const data = { ...runData('run-a'), work_summary: { kind: 'qa_evidence_open', phase: 'QA', qa_outcome: 'revise', lifecycle: 'active',
    recorded_approvals: ['UR', 'PRD', 'SD', 'TP'], open_obligation_count: 2, display_action: 'Capture the visible native observation sequence.',
    decisive_obligation: { id: 'QF-001', routing_target: 'evidence_obligation', action: 'Capture the visible native observation sequence.', source_path: '.agdf/control/runs/run-a/documents/QA_REPORT.md' },
    sources: [{ path: '.agdf/control/runs/run-a/documents/QA_REPORT.md', digest: 'sha256:'+'a'.repeat(64), state: 'available' }], limitations: [], authorizes: false as const } };
  render(<RunDetail result={{ ...backlog(), data }} onOpen={vi.fn()}/>);
  expect(screen.getByText(data.work_summary.display_action).closest('details')).toBeNull();
  expect(screen.queryByText(/Backlog-Beobachtung|Synchronisierung/)).toBeNull();
});
