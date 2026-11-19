import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';
import { StrictMode } from 'react';
import type { ReadTransport } from '../src/api';
import { documentFixture, fixtureMeta, runData, runScope } from './scoped-fixtures';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

function fixture() {
  const run = documentFixture();
  run.evaluation = { ...run.evaluation!, current_gate: 'PRD', missing_approval: 'Approval: PRD', control_assessment: { state: 'blocked', authorizes: false } };
  run.persisted = { ...run.persisted!, current_gate: 'PRD' };
  run.companion = { route: 'structured_slice', path: [], next_text: 'Entwurf lesen.', blocking_text: 'none', decision_material_version: 'sha256:' + 'a'.repeat(64) };
  const resource = run.resources.find(r => r.type === 'PRD')!;
  const row = run.document_states!.find(r => r.resource_id === resource.resource_id)!;
  const document = { resource, format: 'markdown', content: '# Vollständiger Entwurf\n\nAnfang.\n\n## Schluss\n\nLetzter Absatz.', content_digest: row.content_digest!, document_state: row, links: {} };
  const read = vi.fn(async (path: string) => path.startsWith('/api/documents/')
    ? { ...fixtureMeta, snapshot_id: 'document-snapshot', data: { kind: 'document', run, document } }
    : runScope(run)) as unknown as ReadTransport;
  return { run, read, document };
}

function width(initial: number) {
  let value = initial;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({ width: value, height: 0, top: 0, bottom: 0, left: 0, right: value, x: 0, y: 0, toJSON() {} }));
  return (next: number) => { value = next; fireEvent(window, new Event('resize')); };
}
function reload() {
  fireEvent.click(screen.getByRole('button', { name: 'AGDF Companion' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Neu lesen' }));
}
const close = () => fireEvent.click(screen.getByRole('button', { name: /Entwurf schließen|Zurück zum Companion/ }));
const sourceReads = (read: ReadTransport) => vi.mocked(read).mock.calls.filter(([path]) => path.startsWith('/api/documents/')).length;

it('opens the actual Markdown beside the card at 850 available pixels without expanding the host', async () => {
  width(850);
  const { run, read } = fixture(), expand = vi.fn();
  render(<App host="codex" compact transport={read} initialRunId={run.run_id} onExpand={expand}/>);
  await screen.findByRole('heading', { name: 'Vollständiger Entwurf' });
  expect(screen.getByRole('article', { name: 'Companion-Statuskarte' })).toBeTruthy();
  expect(screen.getByText('Letzter Absatz.')).toBeTruthy();
  expect(expand).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Entwurf schließen' }));
  await waitFor(() => expect(screen.queryByRole('heading', { name: 'Vollständiger Entwurf' })).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: 'PRD-Entwurf öffnen' }));
  await screen.findByRole('heading', { name: 'Vollständiger Entwurf' });
});

it.each([false, true])('rebinds the first automatic read to a fresh capture (decision changed: %s)', async changed => {
  width(1360);
  const { run, document } = fixture();
  const freshRun = structuredClone(run);
  const oldId = document.resource.resource_id;
  const freshResource = freshRun.resources.find(row => row.resource_id === oldId)!;
  const freshDocument = freshRun.document_states!.find(row => row.resource_id === oldId)!;
  freshResource.resource_id = freshDocument.resource_id = 'fresh-prd';
  if (changed) freshRun.companion!.decision_material_version = 'sha256:' + 'b'.repeat(64);
  let snapshotReads = 0;
  const requests: string[] = [];
  const read: ReadTransport = async path => {
    requests.push(path);
    if (path.startsWith('/api/snapshot')) return (++snapshotReads === 1
      ? runScope(run, 'old') : runScope(freshRun, 'fresh')) as never;
    if (path.includes('snapshot=old')) throw Error('resource_denied');
    return { ...fixtureMeta, snapshot_id: 'document', data: {
      kind: 'document', run: freshRun, document: { ...document, resource: freshResource, document_state: freshDocument },
    } } as never;
  };
  render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
  if (changed) {
    await screen.findByRole('alert', { name: '' });
    expect(screen.queryByText('Letzter Absatz.')).toBeNull();
  } else {
    await screen.findByText('Letzter Absatz.');
  }
  expect(requests).toEqual([
    `/api/snapshot?run_id=${run.run_id}`,
    `/api/documents/${oldId}?snapshot=old`,
    `/api/snapshot?run_id=${run.run_id}`,
    ...(!changed ? ['/api/documents/fresh-prd?snapshot=fresh'] : []),
  ]);
});

it('keeps the Companion on shrinking and restores the Reader and both offsets on reopening', async () => {
  const resize = width(849), { run, read } = fixture();
  render(<StrictMode><App host="codex" compact transport={read} initialRunId={run.run_id}/></StrictMode>);
  const source = await screen.findByRole('button', { name: 'PRD-Entwurf öffnen' });
  const widthHint = 'In einer breiteren Ansicht öffnet sich der Entwurf automatisch daneben.';
  expect(source.getAttribute('aria-describedby')).toBe(screen.getByText(widthHint).id);
  expect(screen.queryByRole('region', { name: 'Entwurf lesen' })).toBeNull();
  source.focus(); resize(850);
  await screen.findByText('Letzter Absatz.');
  expect(screen.queryByText(widthHint)).toBeNull();
  const heading = screen.getByRole('article', { name: 'Companion-Statuskarte' }).querySelector('h2')!;
  expect(document.activeElement).toBe(heading);
  expect(source.isConnected).toBe(false);
  expect(screen.queryByRole('button', { name: 'Zum Entwurf' })).toBeNull();
  const viewport = screen.getByRole('generic', { name: 'Dokumentinhalt' });
  viewport.scrollTop = 231; viewport.scrollLeft = 19; fireEvent.scroll(viewport);
  const reads = sourceReads(read);
  viewport.focus();
  expect(viewport).toBe(document.activeElement);
  expect(sourceReads(read)).toBe(reads);
  resize(320);
  expect(screen.queryByRole('region', { name: 'Entwurf lesen' })).toBeNull();
  const narrowSource = screen.getByRole('button', { name: 'PRD-Entwurf öffnen' });
  expect(document.activeElement).toBe(narrowSource);
  fireEvent.click(narrowSource);
  expect(screen.getByRole('heading', { name: 'Produktanforderungen · Entwurf' })).toBe(document.activeElement);
  expect(screen.queryByRole('article', { name: 'Companion-Statuskarte' })).toBeNull();
  resize(800);
  expect(screen.getByRole('button', { name: 'Zurück zum Companion' })).toBeTruthy();
  expect(screen.queryByRole('article', { name: 'Companion-Statuskarte' })).toBeNull();
  resize(1360);
  heading.focus(); resize(764);
  expect(screen.getByRole('generic', { name: 'Dokumentinhalt' })).toBe(viewport);
  resize(763);
  expect(document.activeElement).toBe(heading);
  expect(screen.queryByRole('region', { name: 'Entwurf lesen' })).toBeNull();
  resize(764);
  expect(screen.getByRole('generic', { name: 'Dokumentinhalt' })).toBe(viewport);
  expect([viewport.scrollTop, viewport.scrollLeft]).toEqual([231, 19]);
  expect(sourceReads(read)).toBe(reads);
  close();
  fireEvent.click(await screen.findByRole('button', { name: 'PRD-Entwurf öffnen' }));
  await screen.findByText('Letzter Absatz.');
  expect(screen.getByRole('generic', { name: 'Dokumentinhalt' }).scrollTop).toBe(231);
});

it('does not steal surviving focus when a pending automatic read removes its former action (SCN-CDR-046)', async () => {
  const resize = width(849), base = fixture();
  let finish!: (result: unknown) => void;
  const read = vi.fn(async (path: string) => path.startsWith('/api/documents/')
    ? new Promise(resolve => { finish = resolve; }) : runScope(base.run)) as unknown as ReadTransport;
  render(<StrictMode><App host="codex" compact transport={read} initialRunId={base.run.run_id}/></StrictMode>);
  const source = await screen.findByRole('button', { name: 'PRD-Entwurf öffnen' });
  source.focus(); resize(850);
  await screen.findByText('Entwurf wird geladen …');
  expect(screen.getByRole('heading', { name: 'Produktanforderungen · Entwurf' })).toBeTruthy();
  expect(source.isConnected).toBe(true);
  const menu = screen.getByRole('button', { name: 'AGDF Companion' });
  menu.focus();
  await act(async () => finish({ ...fixtureMeta, snapshot_id: 'document', data: { kind: 'document', run: base.run, document: base.document } }));
  await screen.findByText('Letzter Absatz.');
  expect(source.isConnected).toBe(false);
  expect(document.activeElement).toBe(menu);
  fireEvent(window, new Event('resize'));
  expect(document.activeElement).toBe(menu);
});

it('keeps old bytes and focus on new decisions, switches deliberately, and dismisses both known decisions on close', async () => {
  const resize = width(1360), fixtureA = fixture();
  let current = structuredClone(fixtureA.run), content = fixtureA.document.content;
  const read = vi.fn(async (path: string) => {
    const row = current.document_states!.find(r => r.type === 'PRD')!, resource = current.resources.find(r => r.type === 'PRD')!;
    return path.startsWith('/api/documents/') ? { ...fixtureMeta, snapshot_id: 'doc-' + current.revision_id,
      data: { kind: 'document', run: structuredClone(current), document: { ...fixtureA.document, resource, content, content_digest: row.content_digest!, document_state: row } } }
      : runScope(structuredClone(current), 'run-' + current.revision_id);
  }) as unknown as ReadTransport;
  render(<App host="codex" compact transport={read} initialRunId={current.run_id}/>);
  await screen.findByText('Letzter Absatz.');
  const capturedRevision = document.querySelector('.companion-reader-revision')!.textContent;
  const capturedTitle = document.querySelector('.companion-reader-title')!.textContent;
  const viewport = screen.getByRole('generic', { name: 'Dokumentinhalt' }); viewport.scrollTop = 300; fireEvent.scroll(viewport);
  const next = (version: string) => {
    current = { ...current, title: 'Aktuelles Vorhaben ' + version, revision_id: version, companion: { ...current.companion!, decision_material_version: 'sha256:' + version.repeat(64) },
      document_states: current.document_states!.map(r => ({ ...r, revision_id: version, content_digest: version.repeat(64) })) };
    content = '# Neue Fassung ' + version;
  };
  next('b'); reload();
  await screen.findByRole('button', { name: 'Aktuellen Entwurf öffnen' });
  expect(document.querySelector('.companion-reader-revision')!.textContent).toBe(capturedRevision);
  expect(document.querySelector('.companion-reader-title')!.textContent).toBe(capturedTitle);
  expect(screen.getByText('Letzter Absatz.')).toBeTruthy();
  expect(screen.queryByText('Neue Fassung b')).toBeNull();
  expect(viewport.scrollTop).toBe(300);
  expect(screen.queryByRole('link', { name: 'Originaldatei herunterladen' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Aktuellen Entwurf öffnen' }));
  await screen.findByRole('heading', { name: 'Neue Fassung b' });
  expect(document.querySelector('.companion-reader-revision')!.textContent).toBe('Run-Revision: b');
  expect(document.querySelector('.companion-reader-title')!.textContent).toBe('Aktuelles Vorhaben b');
  expect(viewport.scrollTop).toBe(0);
  expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Produktanforderungen · Entwurf' }));
  next('c'); reload(); await screen.findByRole('button', { name: 'Aktuellen Entwurf öffnen' });
  close(); await screen.findByRole('button', { name: 'PRD-Entwurf öffnen' });
  reload(); resize(320); resize(1360);
  await waitFor(() => expect(screen.getByText('Du bist dran')).toBeTruthy());
  expect(screen.queryByRole('region', { name: 'Entwurf lesen' })).toBeNull();
  next('d'); reload();
  await screen.findByRole('heading', { name: 'Neue Fassung d' });
  expect(screen.queryByRole('button', { name: 'Aktuellen Entwurf öffnen' })).toBeNull();
});

it.each(['missing material', 'finding', 'unregistered', 'mismatch', 'unavailable'])('does not auto-open %s', async kind => {
  width(1360); const { run, read } = fixture();
  if (kind === 'missing material') delete run.companion!.decision_material_version;
  if (kind === 'finding') { run.evaluation!.missing_approval = 'none'; run.evaluation!.blocking_reason = 'review'; run.companion!.finding = { resource_id: 'PRD', content_digest: 'a'.repeat(64) }; }
  if (kind === 'unregistered') run.resources = [];
  if (kind === 'mismatch') run.persisted!.current_gate = 'SD';
  if (kind === 'unavailable') run.document_states = [];
  render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
  await screen.findByRole('article', { name: 'Companion-Statuskarte' });
  expect(screen.queryByRole('region', { name: 'Entwurf lesen' })).toBeNull();
  expect(sourceReads(read)).toBe(0);
});

it('ignores a late source reply after closing, without reopening or expanding', async () => {
  width(320); const base = fixture();
  let finish!: (value: unknown) => void;
  const pending = new Promise(resolve => { finish = resolve; });
  const read = vi.fn(async (path: string) => path.startsWith('/api/documents/') ? pending : runScope(base.run)) as unknown as ReadTransport;
  const expand = vi.fn();
  render(<App host="codex" compact transport={read} initialRunId={base.run.run_id} onExpand={expand}/>);
  fireEvent.click(await screen.findByRole('button', { name: 'PRD-Entwurf öffnen' }));
  close();
  await screen.findByText('Du bist dran');
  await act(async () => { finish({ ...fixtureMeta, data: { kind: 'document', run: base.run, document: base.document } }); });
  expect(screen.queryByRole('region', { name: 'Entwurf lesen' })).toBeNull();
  expect(screen.queryByText('Letzter Absatz.')).toBeNull();
  expect(expand).not.toHaveBeenCalled();
});

it('revalidates a same-source refresh once and preserves reading position and download bytes', async () => {
  width(1360); const { run, read, document: source } = fixture();
  render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
  await screen.findByText('Letzter Absatz.');
  const viewport = screen.getByRole('generic', { name: 'Dokumentinhalt' }); viewport.scrollTop = 140; fireEvent.scroll(viewport);
  const before = sourceReads(read);
  reload();
  await waitFor(() => expect(sourceReads(read)).toBe(before + 1));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'PRD-Entwurf öffnen' })).toBeNull());
  expect(viewport.scrollTop).toBe(140);
  expect(decodeURIComponent(screen.getByRole('link', { name: 'Originaldatei herunterladen' }).getAttribute('href')!.split(',')[1])).toBe(source.content);
  expect(sourceReads(read)).toBe(before + 1);
});

it('retains per-Run intent and positions, releases inactive bytes, and never substitutes an unavailable remembered version', async () => {
  width(1360);
  const a = fixture(), b = fixture();
  for (const item of [a, b]) item.run.active_run_ids = ['run-a', 'run-b'];
  b.run.run_id = 'run-b'; b.run.title = 'Zweiter Run';
  b.run.resources = b.run.resources.map(r => ({ ...r, run_id: 'run-b' }));
  b.run.document_states = b.run.document_states!.map(r => ({ ...r, run_id: 'run-b' }));
  let selected = a;
  const read = vi.fn(async (path: string) => {
    if (!path.startsWith('/api/documents/')) selected = path.includes('run-b') ? b : a;
    const run = structuredClone(selected.run), resource = run.resources.find(r => r.type === 'PRD')!, row = run.document_states!.find(r => r.type === 'PRD')!;
    return path.startsWith('/api/documents/') ? { ...fixtureMeta, snapshot_id: run.run_id + '-document', data: { kind: 'document', run,
      document: { ...selected.document, resource, document_state: row, content_digest: row.content_digest!, content: '# Quelle ' + run.run_id } } } : runScope(run, run.run_id + '-run');
  }) as unknown as ReadTransport;
  render(<App host="codex" compact transport={read} initialRunId="run-a"/>);
  await screen.findByRole('heading', { name: 'Quelle run-a' });
  screen.getByRole('generic', { name: 'Dokumentinhalt' }).scrollTop = 190;
  fireEvent.scroll(screen.getByRole('generic', { name: 'Dokumentinhalt' }));
  fireEvent.click(screen.getByRole('button', { name: 'Nächster Run' }));
  await screen.findByRole('heading', { name: 'Quelle run-b' });
  expect(screen.queryByRole('heading', { name: 'Quelle run-a' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Vorheriger Run' }));
  await screen.findByRole('heading', { name: 'Quelle run-a' });
  expect(screen.getByRole('generic', { name: 'Dokumentinhalt' }).scrollTop).toBe(190);
  fireEvent.click(screen.getByRole('button', { name: 'Nächster Run' }));
  await screen.findByRole('heading', { name: 'Quelle run-b' });
  a.run.companion!.decision_material_version = 'sha256:' + 'b'.repeat(64);
  a.run.document_states = a.run.document_states!.map(r => ({ ...r, content_digest: 'b'.repeat(64) }));
  const before = sourceReads(read);
  fireEvent.click(screen.getByRole('button', { name: 'Vorheriger Run' }));
  await screen.findByText(/Die zuvor gelesene Fassung ist nicht mehr verfügbar/);
  expect(screen.queryByRole('heading', { name: 'Quelle run-b' })).toBeNull();
  expect(sourceReads(read)).toBe(before);
  close(); await screen.findByRole('button', { name: 'PRD-Entwurf öffnen' });
  fireEvent.click(screen.getByRole('button', { name: 'Nächster Run' }));
  await screen.findByRole('heading', { name: 'Quelle run-b' });
  fireEvent.click(screen.getByRole('button', { name: 'Vorheriger Run' }));
  await screen.findByRole('button', { name: 'PRD-Entwurf öffnen' });
  expect(screen.queryByRole('region', { name: 'Entwurf lesen' })).toBeNull();
});

it('keeps the workspace freshness loop running while the narrow card is hidden and silences its sound', async () => {
  width(320); const base = fixture(), start = vi.fn();
  vi.stubGlobal('AudioContext', class { state = 'running'; destination = {}; resume = async () => {}; decodeAudioData = async () => ({}); close = async () => {}; createBufferSource = () => ({ connect() {}, start }); });
  let run = base.run, changed = false;
  const read = vi.fn(async (path: string) => {
    if (path.startsWith('/api/freshness')) return { ...fixtureMeta, code: changed ? 'source_changed' : null, data: changed ? null : { unchanged: true } };
    if (path.startsWith('/api/documents/')) return { ...fixtureMeta, snapshot_id: 'document', data: { kind: 'document', run: structuredClone(run), document: base.document } };
    return runScope(structuredClone(run));
  }) as unknown as ReadTransport;
  render(<App host="codex" compact transport={read} initialRunId="run-a"/>);
  await screen.findByText('Du bist dran');
  fireEvent.click(screen.getByRole('button', { name: 'AGDF Companion' }));
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Hinweiston' }));
  fireEvent.click(screen.getByRole('button', { name: 'PRD-Entwurf öffnen' }));
  await screen.findByText('Letzter Absatz.');
  run = { ...run, companion: { ...run.companion!, decision_material_version: 'sha256:' + 'b'.repeat(64) } }; changed = true;
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(vi.mocked(read).mock.calls.some(([path]) => path.startsWith('/api/freshness'))).toBe(true);
  expect(screen.getByRole('button', { name: 'Aktuellen Entwurf öffnen' })).toBeTruthy();
  expect(start).not.toHaveBeenCalled();
});

it('preserves old bytes and offsets after a failed switch, then permits a deliberate retry', async () => {
  width(1360); const base = fixture();
  let run = base.run, fail = false;
  const read = vi.fn(async (path: string) => {
    if (!path.startsWith('/api/documents/')) return runScope(structuredClone(run));
    if (fail) throw Error('read_failed');
    return { ...fixtureMeta, snapshot_id: 'document', data: { kind: 'document', run: structuredClone(run), document: base.document } };
  }) as unknown as ReadTransport;
  render(<App host="codex" compact transport={read} initialRunId="run-a"/>);
  await screen.findByText('Letzter Absatz.');
  const viewport = screen.getByRole('generic', { name: 'Dokumentinhalt' }); viewport.scrollTop = 251; viewport.scrollLeft = 17; fireEvent.scroll(viewport);
  run = { ...run, companion: { ...run.companion!, decision_material_version: 'sha256:' + 'b'.repeat(64) } };
  reload();
  fireEvent.click(await screen.findByRole('button', { name: 'Aktuellen Entwurf öffnen' }));
  // This same-byte decision is still an explicit new decision; switch failure must keep the old reading.
  // A second decision creates a controlled failure after the first successful transition.
  await waitFor(() => expect(screen.queryByRole('button', { name: 'PRD-Entwurf öffnen' })).toBeNull());
  viewport.scrollTop = 251; viewport.scrollLeft = 17; fireEvent.scroll(viewport);
  run = { ...run, companion: { ...run.companion!, decision_material_version: 'sha256:' + 'c'.repeat(64) } };
  reload(); await screen.findByRole('button', { name: 'Aktuellen Entwurf öffnen' });
  fail = true;
  fireEvent.click(screen.getByRole('button', { name: 'Aktuellen Entwurf öffnen' }));
  await screen.findByText(/Die gewählte Fassung konnte nicht bestätigt werden/);
  expect(screen.getByText('Letzter Absatz.')).toBeTruthy();
  expect([viewport.scrollTop, viewport.scrollLeft]).toEqual([251, 17]);
  const before = sourceReads(read);
  fail = false;
  fireEvent.click(screen.getByRole('button', { name: 'Run neu lesen' }));
  await screen.findByRole('button', { name: 'Aktuellen Entwurf öffnen' });
  await waitFor(() => expect(screen.getByRole('button', { name: 'PRD-Entwurf öffnen' }).getAttribute('aria-disabled')).not.toBe('true'));
  fireEvent.click(screen.getByRole('button', { name: 'Aktuellen Entwurf öffnen' }));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'PRD-Entwurf öffnen' })).toBeNull());
  expect(screen.getByText('Letzter Absatz.')).toBeTruthy();
  expect(screen.queryByText(/Die gewählte Fassung konnte nicht bestätigt werden/)).toBeNull();
  expect(sourceReads(read)).toBe(before + 1);
});


it('shows confirmed work on the selected Codex card and clears it on freshness without a reload', async () => {
  width(650);
  const gate = 'CD+Tests';
  const run = runData('run-a');
  run.evaluation!.next_operation = { actor: 'agent', type: 'implement_approved_plan', operation_key: 'delivery.implementation.complete',
    effect: 'preparation', gate };
  const record = { target_id: fixtureMeta.target.target_id, run_id: run.run_id, revision_id: run.revision_id!, gate,
    expires_at: Date.now() + 25_000 };
  let activity = { ...record, run_id: 'other-run' };
  const read: ReadTransport = async path => (path.startsWith('/api/freshness')
    ? { ...fixtureMeta, data: { unchanged: true }, companion_observation: { activity } }
    : { ...runScope(run), companion_observation: { activity } }) as never;
  render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
  await screen.findByRole('heading', { name: run.run_id });
  expect(screen.queryByText('Einen Augenblick')).toBeNull();
  activity = record;
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(screen.getByText('Einen Augenblick')).toBeTruthy();
  expect(screen.getByText(/Ich arbeite gerade daran/)).toBeTruthy();
  activity = { ...record, expires_at: Date.now() - 1 };
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(screen.queryByText('Einen Augenblick')).toBeNull();
  expect(screen.getByText('Codex ist als Nächstes dran')).toBeTruthy();
});

// SCN-005 and SCN-023 (AC-003, AC-017): without a sign of life of the Codex hooks the card says that activity is
// unknown, in a neutral tone, and returns to the resting step on the next freshness response without a reload.
it('says that activity is unknown while the Codex hooks give no sign of life', async () => {
  width(650);
  const gate = 'CD+Tests';
  const run = runData('run-a');
  run.evaluation!.next_operation = { actor: 'agent', type: 'implement_approved_plan', operation_key: 'delivery.implementation.complete',
    effect: 'preparation', gate };
  let observation: Record<string, unknown> | undefined = { liveness: 'unknown' };
  const read: ReadTransport = async path => (path.startsWith('/api/freshness')
    ? { ...fixtureMeta, data: { unchanged: true }, ...(observation ? { companion_observation: observation } : {}) }
    : { ...runScope(run), ...(observation ? { companion_observation: observation } : {}) }) as never;
  render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
  await screen.findByRole('heading', { name: run.run_id });
  expect(screen.getByText('Aktivität unbekannt')).toBeTruthy();
  expect(screen.getByText('Die Companion sieht gerade nicht, ob Codex arbeitet. Prüfe in Codex unter /hooks, ob die AGDF-Hooks freigegeben sind.')).toBeTruthy();
  expect(screen.queryByText('Einen Augenblick')).toBeNull();
  const card = screen.getByRole('article', { name: 'Companion-Statuskarte' });
  expect(card.getAttribute('data-tone')).toBeNull();
  expect(screen.getByText('Codex ist als Nächstes dran')).toBeTruthy();
  observation = undefined;
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(screen.queryByText('Aktivität unbekannt')).toBeNull();
  expect(screen.queryByText(/AGDF-Hooks freigegeben/)).toBeNull();
  expect(screen.getByText('Codex ist als Nächstes dran')).toBeTruthy();
  const record = { target_id: fixtureMeta.target.target_id, run_id: run.run_id, revision_id: run.revision_id!, gate, expires_at: Date.now() + 25_000 };
  observation = { activity: record };
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(screen.getByText('Einen Augenblick')).toBeTruthy();
  expect(screen.queryByText('Aktivität unbekannt')).toBeNull();
  expect(card.getAttribute('data-tone')).toBe('working');
});

it('polls the Codex card quickly only while the shown step waits for the agent', async () => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
  width(650);
  const quickChecks = async (actor: 'agent' | 'human') => {
    const run = runData(`run-${actor}`);
    run.evaluation!.next_operation = { actor, type: 'implement_approved_plan', operation_key: 'delivery.implementation.complete',
      effect: 'preparation', gate: 'CD+Tests' };
    const read = vi.fn(async (path: string) => (path.startsWith('/api/freshness')
      ? { ...fixtureMeta, data: { unchanged: true } } : runScope(run))) as unknown as ReadTransport;
    const view = render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
    await screen.findByRole('heading', { name: run.run_id });
    const checks = () => vi.mocked(read).mock.calls.filter(([path]) => path.startsWith('/api/freshness')).length;
    const before = checks();
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    const quick = checks() - before;
    view.unmount();
    return quick;
  };
  expect(await quickChecks('agent')).toBe(1);
  expect(await quickChecks('human')).toBe(0);
});
