import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { BacklogRow } from '../src/BacklogRows';
import { validateData } from '../src/api';
import { projectCockpitList } from '../../core/lib/control-inspect/cockpit-list.js';
import { backlog, pointer, runData, runScope } from './scoped-fixtures';
import { RunDetail } from '../src/RunDetail';
import type { SavedSummary } from '../src/types';
const target = 'sha256:' + 'a'.repeat(64);
const summary: SavedSummary = { provenance_state: 'recorded', code: null, label_de: 'QA-Nachweis offen',
  limitation_de: 'Gespeicherte Beobachtung; aktueller Run noch nicht verglichen.', authorizes: false,
  record: { schema_version: 1, target_id: target, run_id: 'run-a', section: 'Active Backlog', row_digest: 'sha256:' + 'b'.repeat(64),
    revision_id: '11111111-1111-4111-8111-111111111111', observed_at: '2026-10-09T12:00:00Z', kind: 'qa_evidence_open', phase: 'QA',
    qa_outcome: 'revise', lifecycle: 'active', recorded_approvals: ['UR', 'PRD', 'SD', 'TP'],
    decisive_obligation: { id: 'QF-001', routing_target: 'evidence_obligation', action: 'Capture the full visible native observation sequence', source_path: '.agdf/control/artefacts/run-a/QA_REPORT.md' },
    open_obligation_count: 2, display_action: 'Capture the full visible native observation sequence. Then rerun QA with refreshed evidence.',
    sources: [{ path: '.agdf/control/artefacts/run-a/QA_REPORT.md', digest: 'sha256:' + 'c'.repeat(64), state: 'available' }], limitations: [], authorizes: false } };
const entry = { ...pointer('run-a', 'Clear undertaking'), saved_summary: summary };
const inventory = { ...backlog([entry]), target: { target_id: target, display_path: '/fixture' } };
afterEach(cleanup);
it.each([true, false])('concrete obligation, source limitation and next step are direct in compact=%s', compact => {
  const row = projectCockpitList(inventory.data!).rows[0]; render(<ul><BacklogRow row={row} current onSelect={vi.fn()} compact={compact}/></ul>);
  expect(screen.getByText('QA · QA-Nachweis offen · 2 offene Berichtsbefunde').closest('details')).toBeNull();
  expect(screen.getByText(/^Nächster Schritt laut Backlog: Capture the full/).closest('details')).toBeNull();
  expect(screen.getByText(summary.limitation_de).closest('details')).toBeNull();
  expect(screen.getByText('QF-001 · evidence_obligation').closest('details')?.open).toBe(false);
  expect(screen.getByText('Stored next step')).toBeTruthy();
});
it('selected comparison and original concrete action are visible; malformed current summary is rejected', () => {
  const data = { ...runData('run-a'), work_summary: summary.record!, backlog_comparison: { state: 'different' as const,
    reason: 'saved_observation_differs', saved_revision_id: summary.record!.revision_id, authorizes: false as const } };
  render(<RunDetail result={{ ...inventory, data }} onOpen={vi.fn()}/>);
  expect(screen.getByText(/^Die gespeicherte Backlog-Beobachtung weicht/)).toBeTruthy();
  expect(screen.getByText(summary.record!.display_action)).toBeTruthy();
  expect(() => validateData('/api/runs/run-a', runScope(data))).not.toThrow();
  for (const modified of [{ ...data.work_summary, qa_outcome: 'probably_pass' }, { ...data.work_summary, sources: [{ path: '.agdf/control/artefacts/foreign/QA.md', digest: 'sha256:' + 'c'.repeat(64), state: 'available' }] }]) {
    expect(() => validateData('/api/runs/run-a', runScope({ ...data, work_summary: modified }))).toThrow('dto_invalid');
  }
});
it('optional DTO is backwards compatible but malformed present provenance never reaches rendering', () => {
  expect(() => validateData('/api/snapshot', backlog())).not.toThrow();
  expect(() => validateData('/api/snapshot', inventory)).not.toThrow();
  for (const invalid of [null, { ...summary, authorizes: true }, { ...summary, record: { ...summary.record!, schema_version: 2 } },
    { ...summary, record: { ...summary.record!, run_id: 'foreign' } }, { ...summary, record: { ...summary.record!, target_id: 'sha256:' + '0'.repeat(64) } },
    { ...summary, record: { ...summary.record!, sources: [{ path: '../../secret', digest: 'bad', state: 'available' }] } }]) {
    expect(() => validateData('/api/snapshot', { ...inventory, data: { ...inventory.data!, entries: [{ ...entry, saved_summary: invalid }] } } as never)).toThrow('dto_invalid');
  }
});

it.each([true, false])('open QA report findings cannot appear as zero open points in summaryOnly=%s', summaryOnly => {
  const base = runData('run-a');
  const qaPath = summary.record!.sources[0].path;
  const data = { ...base, evaluation: { ...base.evaluation!, missing_evidence: [] }, work_summary: summary.record!,
    resources: [...base.resources, { resource_id: 'qa-report', run_id: 'run-a', type: 'QA', path: qaPath, registered_reference: qaPath, status: 'registered' }] };
  const open = vi.fn(); render(<RunDetail result={{ ...inventory, data }} onOpen={open} summaryOnly={summaryOnly}/>);
  expect(screen.queryByText('Nachweise und offene Punkte · 0')).toBeNull();
  expect(screen.getByText('Nachweise und offene Punkte · 2 offene Berichtsbefunde')).toBeTruthy();
  expect(screen.getByText('2 offene Berichtsbefunde in den registrierten Berichten.')).toBeTruthy();
  expect(screen.queryByText(/2 offene Aufgaben/)).toBeNull();
  const disclosure = screen.getByText('Nachweise und offene Punkte · 2 offene Berichtsbefunde').closest('details')!;
  expect(disclosure.textContent).toContain('Ein Sachverhalt kann in mehreren Berichten geführt sein.');
  expect(disclosure.textContent).toContain('Im Run-Dokument sind keine Nachweislücken gespeichert.');
  expect(disclosure.textContent).toContain('QF-001');
  const source = disclosure.querySelector<HTMLButtonElement>('[data-focus-id="report:qa-report"]')!;
  source.click(); expect(open).toHaveBeenCalledWith(data.resources.at(-1), 'report:qa-report');
});
it('Run-document gaps and report findings retain distinct source scopes without an invented total', () => {
  const base = runData('run-a');
  const data = { ...base, evaluation: { ...base.evaluation!, missing_evidence: ['Run-document gap'] }, work_summary: summary.record! };
  render(<RunDetail result={{ ...inventory, data }} onOpen={vi.fn()}/>);
  expect(screen.getByText('Nachweise und offene Punkte · 2 offene Berichtsbefunde')).toBeTruthy();
  expect(screen.getByText(/^1 Nachweislücke ist im Run-Dokument gespeichert/)).toBeTruthy();
  expect(screen.getByText('Run-document gap', { selector: 'strong' })).toBeTruthy();
  expect(screen.queryByText(/3 offene/)).toBeNull();
});
