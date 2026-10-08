import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';
import { validateData, validateEnvelope, type ReadTransport } from '../src/api';
import type { Detail, Envelope, Inventory, ReadingScope } from '../src/types';

const meta = { schema_version: '1' as const, target: { target_id: 'target', display_path: '/fixture' }, snapshot_id: 'snapshot',
  observed_as_of: '2026-10-07T08:00:00Z', source_digest: 'digest', state: 'available' as const, code: null, retryable: false };
const run: Detail = { run_id: 'run-a', title: 'Unterlagen zuordnen', revision_id: 'revision', lifecycle: 'active', resources: [],
  persisted: { current_gate: 'CD+Tests', next_allowed_action: 'Implement approved scope', decision: 'in_progress', artefacts: [] },
  evaluation: { status: 'open', current_gate: 'CD+Tests', blocking_reason: 'none', missing_approval: 'none', next_allowed_action: 'Implement approved scope',
    next_action_de: 'Freigegebenen Umfang umsetzen.', doctor_status: 'pass', quality_outlook: '', git_evidence: 'unavailable', diagnostics: [], approvals: [], missing_evidence: [], control_assessment: { state: 'open', authorizes: false } } };
const backlog: Inventory = { kind: 'backlog', entries: [{ section: 'Active Backlog', key: 'run-a', original_key: '`run-a`', title: 'Unterlagen zuordnen',
  stored_status: 'Awaiting TP', scope: 'framework-maintenance', priority: '1', stored_next_step: 'Stored next step', source_links: '[UR](UR.md)', current_spec: 'old', selectable: true }], diagnostics: [], source_path: '.agdf/control/MASTER_BACKLOG.md', content_digest: 'digest', counts: { 'Active Backlog': 1 }, file_count: 1, byte_count: 100 };
const focused = { ...meta, data: { kind: 'run' as const, run } };
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

for (const compact of [true, false]) it(`SCN-070/076: direct named opening makes one scoped request with no discovery in ${compact ? 'compact' : 'expanded'} view`, async () => {
  const read = vi.fn(async () => focused) as unknown as ReadTransport;
  render(<App transport={read} compact={compact} initialRunId="run-a"/>);
  await screen.findByRole('heading', { name: run.title, level: compact ? 2 : 1 });
  expect(vi.mocked(read).mock.calls.map(c => c[0])).toEqual(['/api/snapshot?run_id=run-a']);
  expect(screen.queryByRole('combobox')).toBeNull(); expect(screen.queryByRole('searchbox')).toBeNull();
  expect(screen.queryByText(/aktive Runs|0 insgesamt/)).toBeNull();
});

for (const compact of [true, false]) it(`SCN-071: named resource failure preserves ID/retry without an empty Run inventory (${compact})`, async () => {
  const read = vi.fn().mockResolvedValueOnce({ ...meta, snapshot_id: null, state: 'error', code: 'resource_limit', retryable: true, data: null }).mockResolvedValueOnce(focused) as unknown as ReadTransport;
  render(<App transport={read} compact={compact} initialRunId="run-a"/>);
  await screen.findByText(/Ein Ressourcenlimit/); expect(screen.getByText('run-a', { selector: 'code' })).toBeTruthy();
  expect(screen.queryByRole('combobox')).toBeNull(); expect(screen.queryByRole('searchbox')).toBeNull(); expect(screen.queryByText(/Wähle einen Run|0.*Runs/)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: compact ? 'Neu laden' : 'Wiederholen' }));
  await screen.findByRole('heading', { name: run.title, level: compact ? 2 : 1 });
  expect(vi.mocked(read).mock.calls.map(c => c[0])).toEqual(['/api/snapshot?run_id=run-a', '/api/snapshot?run_id=run-a']);
});

it('SCN-062/079: fresh backlog labels stored status and next step, and only deliberate selection checks the Run', async () => {
  const read = vi.fn(async (path: string) => path === '/api/snapshot' ? { ...meta, data: backlog } : { ...focused, snapshot_id: 'selected' }) as unknown as ReadTransport;
  render(<App transport={read}/>);
  await screen.findByText('Gespeicherter Stand laut Backlog: Awaiting TP'); expect(screen.getByText('Nächster Schritt laut Backlog: Stored next step')).toBeTruthy();
  expect(screen.queryByText('Aktuelle Voraussetzungen nicht bestätigt')).toBeNull();
  expect(vi.mocked(read).mock.calls.map(c => c[0])).toEqual(['/api/snapshot']);
  fireEvent.click(screen.getByRole('button', { name: run.title }));
  await screen.findByRole('heading', { name: run.title, level: 1 });
  expect(vi.mocked(read).mock.calls.at(-1)?.[0]).toBe('/api/runs/run-a?snapshot=snapshot');
});

it('SCN-092: selecting during a committed title replacement captures the named Run without old selectors', async () => {
  const observers: { callback: IntersectionObserverCallback; targets: Element[] }[] = [];
  class Observer {
    targets: Element[] = [];
    constructor(callback: IntersectionObserverCallback) { observers.push({ callback, targets: this.targets }); }
    observe(target: Element) { this.targets.push(target); }
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', Observer);
  let completeTitles!: (value: Envelope<Inventory>) => void;
  const row = { ...backlog.entries[0], row_id: '00000000-0000-0000-0000-000000000001' };
  const initial = { ...meta, data: { ...backlog, entries: [row] } };
  // The server committed the replacement, but its response is still in flight.
  // Aborting that response cannot restore the old server-side snapshot.
  const read = vi.fn(async (path: string) => {
    if (path === '/api/snapshot') return initial;
    if (path.startsWith('/api/backlog-titles')) return new Promise<Envelope<Inventory>>(resolve => { completeTitles = resolve; });
    if (path.startsWith('/api/runs/')) throw Error('resource_denied');
    if (path === '/api/snapshot?run_id=run-a') return { ...focused, snapshot_id: 'selected' };
    throw Error('unexpected_request');
  }) as unknown as ReadTransport;
  try {
    render(<App transport={read}/>);
    await screen.findByRole('button', { name: run.title });
    await waitFor(() => {
      const observer = [...observers].reverse().find(o => o.targets.some(target => target.hasAttribute('data-backlog-row')))!;
      const target = observer.targets.find(target => target.hasAttribute('data-backlog-row'))!;
      act(() => observer.callback([{ target, isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
      expect(completeTitles).toBeTypeOf('function');
    }, { interval: 150 });
    fireEvent.click(screen.getByRole('button', { name: run.title }));
    await screen.findByRole('heading', { name: run.title, level: 1 });
    expect(vi.mocked(read).mock.calls.at(-1)?.[0]).toBe('/api/snapshot?run_id=run-a');
    expect(vi.mocked(read).mock.calls.some(call => call[0].startsWith('/api/runs/'))).toBe(false);
    expect(vi.mocked(read).mock.calls.find(call => call[0].startsWith('/api/backlog-titles'))?.[1].aborted).toBe(true);
    await act(async () => completeTitles({ ...initial, snapshot_id: 'late-title-snapshot' }));
    expect(screen.getByRole('heading', { name: run.title, level: 1 })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Aktive Vorhaben' })).toBeNull();
  } finally { vi.unstubAllGlobals(); }
});

it('SCN-070: fresh document bundle replaces the parent and return resolves the new source ID', async () => {
  const source = { resource_id: 'old-source', run_id: 'run-a', type: 'UR', path: '.agdf/control/UR.md', registered_reference: '.agdf/control/UR.md', status: 'registered' };
  const parent = { ...run, resources: [source] };
  const newSource = { ...source, resource_id: 'document-source' }, returnSource = { ...source, resource_id: 'return-source' };
  const read = vi.fn(async (path: string) => path.startsWith('/api/documents/') ? { ...meta, snapshot_id: 'document', data: { kind: 'document', run: { ...parent, resources: [newSource] }, document: { resource: newSource, content: '# Original', format: 'markdown', content_digest: 'doc-digest', links: {} } } }
    : path.startsWith('/api/runs/') ? { ...meta, snapshot_id: 'returned', data: { kind: 'run', run: { ...parent, resources: [returnSource] } } }
    : { ...meta, data: { kind: 'run', run: parent } }) as unknown as ReadTransport;
  render(<App transport={read} initialRunId="run-a"/>);
  await screen.findByRole('heading', { name: run.title, level: 1 });
  fireEvent.click(screen.getByRole('button', { name: 'Details' }));
  fireEvent.click(screen.getByRole('button', { name: /^Anforderungen Beschreibt/ }));
  await screen.findByRole('heading', { name: 'Anforderungen', level: 1 });
  fireEvent.click(screen.getByRole('button', { name: 'Dokument schließen' }));
  await screen.findByRole('heading', { name: run.title, level: 1 });
  await waitFor(() => expect(document.activeElement?.getAttribute('data-focus-id')).toBe('return-source'));
  expect(vi.mocked(read).mock.calls.map(c => c[0])).toEqual(['/api/snapshot?run_id=run-a', '/api/documents/old-source?snapshot=snapshot', '/api/runs/run-a?snapshot=document']);
});

it('SCN-070/072: only explicit scoped replacements accept new snapshots, and incoherent parents/kinds are rejected', () => {
  expect(() => validateEnvelope({ ...focused, snapshot_id: 'new' }, { target: 'target', snapshot: 'snapshot' })).toThrow('dto_invalid');
  expect(() => validateEnvelope({ ...focused, snapshot_id: 'new' }, { target: 'target', snapshot: 'snapshot', replacement: true })).not.toThrow();
  expect(() => validateEnvelope({ ...focused, snapshot_id: 'new' }, { target: 'foreign', snapshot: 'snapshot', replacement: true })).toThrow('dto_invalid');
  expect(() => validateData('/api/snapshot?run_id=run-a', focused)).not.toThrow();
  expect(() => validateData('/api/documents/id', focused)).toThrow('dto_invalid');
  const bad: Envelope<ReadingScope> = { ...meta, data: { kind: 'document', run, document: { resource: { resource_id: 'source', run_id: 'other', type: 'UR', path: 'UR.md', registered_reference: 'UR.md', status: 'registered' } } } };
  expect(() => validateData('/api/documents/id', bad)).toThrow('dto_invalid');
  const invalid = { run_id: 'run-a', revision_id: null, lifecycle: null, resources: [], diagnostics: [] };
  expect(() => validateData('/api/snapshot?run_id=run-a', { ...meta, data: { kind: 'run', run: invalid } })).toThrow('dto_invalid');
  expect(() => validateData('/api/snapshot?run_id=run-a', { ...meta, state: 'invalid', code: 'invalid_run', data: { kind: 'run', run: invalid } })).not.toThrow();
});

it('SCN-062/071: a partial backlog announces its limitation once', async () => {
  const partial = { ...meta, state: 'partial' as const, code: 'backlog_partial', data: { ...backlog, diagnostics: [{ code: 'malformed_pointer', message: 'Stored row is incomplete.' }] } };
  render(<App transport={vi.fn(async () => partial) as unknown as ReadTransport}/>);
  await screen.findByRole('button', { name: 'Unterlagen zuordnen' });
  expect(document.querySelectorAll('.notice')).toHaveLength(1);
  expect(screen.getByText(/Hier sind Tabellen oder Einträge/)).toBeTruthy();
});

for (const removed of [undefined, 'run-a']) it(`SCN-071: an initial named request rejects an unexpected backlog without prior inspected Run (${removed})`, async () => {
  const value = { ...meta, data: { ...backlog, ...(removed ? { removed_run_id: removed } : {}) } };
  render(<App transport={vi.fn(async () => value) as unknown as ReadTransport} initialRunId="run-a"/>);
  await screen.findByText(/Die Antwort des Dienstes passt nicht/);
  expect(screen.getByText('run-a', { selector: 'code' })).toBeTruthy();
  expect(screen.queryByRole('searchbox')).toBeNull();
});
