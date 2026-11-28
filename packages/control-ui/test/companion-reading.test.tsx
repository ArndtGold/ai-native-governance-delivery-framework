import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';
import { StrictMode } from 'react';
import type { ReadTransport } from '../src/api';
import type { CompanionContinuation } from '../src/mcp/companion-continuation';
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

it.each([360, 850])('keeps the current UAT presentation in place through approval at %i pixels', async availableWidth => {
  width(availableWidth);
  const { run } = fixture();
  const digest = 'b'.repeat(64);
  const path = 'control/presentations/current.document';
  const resource = { resource_id: 'presentation', run_id: run.run_id, type: 'UAT Presentation', path,
    registered_reference: path, status: 'registered' };
  run.resources.push(resource);
  run.evaluation = { ...run.evaluation!, current_gate: 'UAT', missing_approval: 'Approval: UAT' };
  run.persisted!.current_gate = 'UAT';
  run.companion!.uat_presentation = { resource_id: resource.resource_id, content_digest: digest };
  const presentation = { resource, format: 'markdown', content: '## Nutzerabnahme prüfen und entscheiden\n\nGeliefertes Ergebnis.',
    content_digest: digest, links: {} };
  const reportPath = `.agdf/control/runs/${run.run_id}/documents/OR.md`;
  const reportResource = { resource_id: 'report', run_id: run.run_id, type: 'OR', path: reportPath, registered_reference: reportPath, status: 'registered' };
  const report = { resource: reportResource, format: 'markdown', content: '# Ergebnis des Runs', content_digest: 'c'.repeat(64), links: {} };
  let current = run;
  const read = vi.fn(async (url: string) => {
    if (url.startsWith('/api/freshness')) return { ...fixtureMeta, code: 'source_changed', data: null };
    if (url.startsWith('/api/documents/report?')) return { ...fixtureMeta, snapshot_id: 'report', data: { kind: 'document', run: current, document: report } };
    if (url.startsWith('/api/documents/')) return { ...fixtureMeta, snapshot_id: 'document', data: { kind: 'document', run, document: presentation } };
    return runScope(current, current.revision_id!);
  }) as unknown as ReadTransport;
  render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
  await screen.findByText('Prüfe das gelieferte Ergebnis und die offenen Punkte. Entscheide dann, ob du das Ergebnis abnimmst.');
  if (availableWidth === 360) {
    expect(sourceReads(read)).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Abnahmeunterlage öffnen' }));
  }
  await screen.findByRole('heading', { name: 'Nutzerabnahme prüfen und entscheiden' });
  const body = screen.getByRole('article', { name: 'Originaldokument' });
  const viewport = screen.getByRole('generic', { name: 'Dokumentinhalt' });
  viewport.scrollTop = 217; viewport.focus(); fireEvent.scroll(viewport);
  const notice = () => screen.queryByText('Deine Abnahme ist erfasst.');
  expect(notice()).toBeNull();
  vi.useFakeTimers();
  current = structuredClone(run);
  current.revision_id = 'approved-revision';
  current.persisted!.current_gate = current.evaluation!.current_gate = 'OR';
  current.evaluation!.approvals.push({ gate: 'UAT', status: 'approved', evidence: 'Approval: UAT' });
  current.evaluation!.missing_approval = 'none';
  current.evaluation!.control_assessment = { state: 'open', authorizes: false };
  delete current.companion!.uat_presentation;
  delete current.companion!.decision_material_version;
  current.companion!.next_text = 'Den Lieferbericht erstellen.';
  const refresh = () => act(async () => { fireEvent(document, new Event('visibilitychange')); });
  await refresh();
  expect(notice()?.getAttribute('role')).toBe('status');
  expect(screen.queryByRole('button', { name: 'Zum nächsten Schritt' })).toBeNull();
  if (availableWidth === 850) expect(screen.getByText('Den Lieferbericht erstellen.')).toBeTruthy();
  await act(async () => { vi.advanceTimersByTime(2500); });
  await refresh();
  await act(async () => { vi.advanceTimersByTime(2499); });
  expect(notice()).toBeTruthy();
  await act(async () => { vi.advanceTimersByTime(1); });
  expect(notice()).toBeNull();
  await refresh();
  expect(notice()).toBeNull();
  expect(screen.queryByText('Aktueller Stand nicht bestätigt.')).toBeNull();
  expect(screen.getByRole('article', { name: 'Originaldokument' })).toBe(body);
  expect([viewport.scrollTop, document.activeElement]).toEqual([217, viewport]);
  expect(sourceReads(read)).toBe(1);
  const reportButton = { name: 'Lieferbericht öffnen' };
  expect(screen.queryByRole('button', reportButton)).toBeNull();
  current = structuredClone(current);
  current.lifecycle = 'completed';
  current.revision_id = 'completion-revision';
  current.evaluation!.control_assessment = { state: 'completed', authorizes: false };
  current.evaluation!.completion = { status: 'completed', gate: 'OR', fulfilled: true };
  current.companion!.next_text = 'Der Run ist abgeschlossen.';
  current.resources.push(reportResource);
  current.companion!.closeout_report = { resource_id: reportResource.resource_id, content_digest: report.content_digest };
  await refresh();
  const openReport = screen.getByRole('button', reportButton);
  expect(sourceReads(read)).toBe(1);
  expect(screen.getByRole('article', { name: 'Originaldokument' })).toBe(body);
  expect([viewport.scrollTop, document.activeElement]).toEqual([217, viewport]);
  await act(async () => { fireEvent.click(openReport); });
  expect(screen.getByRole('region', { name: 'Lieferbericht lesen' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Ergebnis des Runs' })).toBeTruthy();
  expect(sourceReads(read)).toBe(2);
  expect(viewport.scrollTop).toBe(0);
  expect(screen.queryByRole('button', reportButton)).toBeNull();
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: availableWidth === 360 ? 'Zurück zum Companion' : 'Lieferbericht schließen' })); });
  expect(screen.getByRole('button', reportButton)).toBeTruthy();
  expect(screen.queryByRole('region', { name: 'Lieferbericht lesen' })).toBeNull();
});

it('opens the actual Markdown beside the card at 850 available pixels without expanding the host', async () => {
  width(850);
  const { run, read } = fixture(), expand = vi.fn();
  render(<App host="codex" compact transport={read} initialRunId={run.run_id} onExpand={expand}/>);
  await screen.findByRole('heading', { name: 'Vollständiger Entwurf' });
  expect(screen.getByRole('article', { name: 'Companion-Statuskarte' })).toBeTruthy();
  expect(screen.getByText('Letzter Absatz.')).toBeTruthy();
  expect(expand).not.toHaveBeenCalled();
  // The download appears only once the reader has confirmed the shown source. Closing earlier
  // rereads the Run in the background on a slow runner instead of the freshness check below.
  await screen.findByRole('link', { name: 'Originaldatei herunterladen' });
  const callsBeforeClose = vi.mocked(read).mock.calls.length;
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Entwurf schließen' })); });
  const reopen = screen.getByRole('button', { name: 'PRD-Entwurf öffnen' });
  expect(reopen).toBe(document.activeElement);
  expect(reopen.getAttribute('aria-disabled')).toBeNull();
  expect(vi.mocked(read).mock.calls.slice(callsBeforeClose).map(([path]) => path.split('?')[0])).toEqual(['/api/freshness']);
  fireEvent.click(reopen);
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
  expect(screen.getByText(widthHint).closest('details')?.open).toBe(false);
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
  const continuation: CompanionContinuation = { status: async () => 'ready', start: async () => 'pending' };
  render(<App host="codex" compact transport={read} initialRunId={current.run_id} continuation={continuation}/>);
  await screen.findByText('Letzter Absatz.');
  const approval = () => screen.queryByText('Approval: PRD', { exact: true });
  const approvalAction = { name: 'Freigabe prüfen' };
  expect(approval()).toBeTruthy();
  await screen.findByRole('button', approvalAction);
  const header = screen.getByRole('region', { name: 'Entwurf lesen' }).querySelector('header')!;
  const sources = () => screen.getByText('Dokumentdetails', { selector: 'summary' }).closest('details')!;
  const revision = () => sources().querySelector('dd code')?.textContent;
  const capturedRevision = revision();
  expect(capturedRevision).toBe(current.revision_id);
  expect(sources().open).toBe(false);
  expect(header.querySelector('h2')?.textContent).toBe('Produktanforderungen · Entwurf');
  expect(header.textContent).not.toContain(current.title);
  expect(header.textContent).not.toContain('Run-Revision');
  const viewport = screen.getByRole('generic', { name: 'Dokumentinhalt' }); viewport.scrollTop = 300; fireEvent.scroll(viewport);
  const next = (version: string) => {
    current = { ...current, title: 'Aktuelles Vorhaben ' + version, revision_id: version, companion: { ...current.companion!, decision_material_version: 'sha256:' + version.repeat(64) },
      document_states: current.document_states!.map(r => ({ ...r, revision_id: version, content_digest: version.repeat(64) })) };
    content = '# Neue Fassung ' + version;
  };
  next('b'); reload();
  expect(await screen.findAllByRole('button', { name: 'Aktuelle Fassung öffnen' })).toHaveLength(1);
  expect(screen.queryByRole('button', { name: 'PRD-Entwurf öffnen' })).toBeNull();
  expect(approval()).toBeNull();
  expect(screen.queryByRole('button', approvalAction)).toBeNull();
  expect(revision()).toBe(capturedRevision);
  expect(screen.getByText('Letzter Absatz.')).toBeTruthy();
  expect(screen.queryByText('Neue Fassung b')).toBeNull();
  expect(viewport.scrollTop).toBe(300);
  expect(screen.queryByRole('link', { name: 'Originaldatei herunterladen' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Aktuelle Fassung öffnen' }));
  await screen.findByRole('heading', { name: 'Neue Fassung b' });
  expect(approval()).toBeTruthy();
  await screen.findByRole('button', approvalAction);
  expect(revision()).toBe('b');
  expect(header.textContent).not.toContain('Aktuelles Vorhaben b');
  expect(viewport.scrollTop).toBe(0);
  expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Produktanforderungen · Entwurf' }));
  next('c'); reload(); await screen.findByRole('button', { name: 'Aktuelle Fassung öffnen' });
  close(); await screen.findByRole('button', { name: 'PRD-Entwurf öffnen' });
  reload(); resize(320); resize(1360);
  await waitFor(() => expect(screen.getByText('Du bist dran')).toBeTruthy());
  expect(screen.queryByRole('region', { name: 'Entwurf lesen' })).toBeNull();
  next('d'); reload();
  await screen.findByRole('heading', { name: 'Neue Fassung d' });
  expect(screen.queryByRole('button', { name: 'Aktuelle Fassung öffnen' })).toBeNull();
});

it('keeps the same decision and reading position through an unrelated background snapshot change', async () => {
  width(1360);
  const base = fixture();
  let refresh = false;
  let finish!: (value: ReturnType<typeof runScope>) => void;
  const pending = new Promise<ReturnType<typeof runScope>>(resolve => { finish = resolve; });
  const read = vi.fn(async (path: string) => {
    if (path.startsWith('/api/freshness')) return { ...fixtureMeta, code: 'source_changed', data: null };
    if (path.startsWith('/api/documents/')) return { ...fixtureMeta, snapshot_id: 'document', data: { kind: 'document', run: base.run, document: base.document } };
    return refresh ? pending : runScope(base.run, 'before-change');
  }) as unknown as ReadTransport;
  render(<App host="codex" compact transport={read} initialRunId={base.run.run_id}/>);
  const body = await screen.findByRole('article', { name: 'Originaldokument' });
  const viewport = screen.getByRole('generic', { name: 'Dokumentinhalt' });
  viewport.scrollTop = 310; viewport.scrollLeft = 12; viewport.focus(); fireEvent.scroll(viewport);
  const notices = () => screen.getByRole('region', { name: 'Entwurf lesen' }).querySelectorAll('.companion-reader-notice');
  refresh = true;
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(notices()).toHaveLength(0);
  const refreshed = structuredClone(base.run);
  const prd = refreshed.resources.find(source => source.type === 'PRD')!;
  refreshed.document_states!.find(row => row.type === 'PRD')!.resource_id = prd.resource_id = 'new-scope-prd';
  refreshed.active_run_ids = [refreshed.run_id, 'other-run'];
  await act(async () => { finish(runScope(refreshed, 'after-change')); });
  // The switcher may need a further render after the capture settles; the checks below still pin the reader.
  expect(await screen.findByRole('navigation', { name: 'Aktive Runs' })).toBeTruthy();
  expect(screen.getByRole('article', { name: 'Originaldokument' })).toBe(body);
  expect(notices()).toHaveLength(0);
  expect(sourceReads(read)).toBe(1);
  expect([viewport.scrollTop, viewport.scrollLeft, document.activeElement]).toEqual([310, 12, viewport]);
  expect(screen.getByRole('link', { name: 'Originaldatei herunterladen' })).toBeTruthy();
});

it('keeps an approved draft open for reference and shows the next gate instead of a replacement prompt', async () => {
  width(1360);
  const base = fixture();
  let run = base.run;
  const read = vi.fn(async (path: string) => path.startsWith('/api/documents/')
    ? { ...fixtureMeta, snapshot_id: 'document', data: { kind: 'document', run: base.run, document: base.document } }
    : runScope(run, run === base.run ? 'before' : 'after')) as unknown as ReadTransport;
  render(<App host="codex" compact transport={read} initialRunId={base.run.run_id}/>);
  await screen.findByRole('article', { name: 'Originaldokument' });
  run = structuredClone(base.run);
  run.persisted!.current_gate = run.evaluation!.current_gate = 'SD';
  run.evaluation!.missing_approval = 'none';
  run.evaluation!.control_assessment = { state: 'open', authorizes: false };
  run.companion!.next_text = 'Lösungsdesign vorbereiten.';
  delete run.companion!.decision_material_version;
  const row = run.document_states!.find(document => document.type === 'PRD')!;
  row.state = row.version_kind = 'approved';
  row.recorded_approval = { status: 'approved', evidence: 'Approval: PRD' };
  reload();
  await screen.findByText('Deine Abnahme ist erfasst.');
  expect(screen.getByText('Lösungsdesign vorbereiten.')).toBeTruthy();
  expect(screen.getByRole('article', { name: 'Originaldokument' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Aktuelle Fassung öffnen' })).toBeNull();
  expect(screen.queryByText('Aktueller Stand nicht bestätigt.')).toBeNull();
  expect(sourceReads(read)).toBe(1);
  expect(screen.queryByRole('button', { name: 'Zum nächsten Schritt' })).toBeNull();
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

it('confirms the same-source refresh without fetching the document again and preserves reading position and download bytes', async () => {
  width(1360); const { run, read, document: source } = fixture();
  render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
  await screen.findByText('Letzter Absatz.');
  const viewport = screen.getByRole('generic', { name: 'Dokumentinhalt' }); viewport.scrollTop = 140; fireEvent.scroll(viewport);
  const before = sourceReads(read);
  reload();
  await waitFor(() => expect(screen.getByRole('link', { name: 'Originaldatei herunterladen' })).toBeTruthy());
  expect(viewport.scrollTop).toBe(140);
  expect(decodeURIComponent(screen.getByRole('link', { name: 'Originaldatei herunterladen' }).getAttribute('href')!.split(',')[1])).toBe(source.content);
  expect(sourceReads(read)).toBe(before);
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
  expect(screen.getByRole('button', { name: 'Aktuelle Fassung öffnen' })).toBeTruthy();
  expect(start).not.toHaveBeenCalled();
});

it.each([false, true])('recovers after a failed switch (user moved focus: %s)', async focusMoved => {
  width(1360); const base = fixture();
  let run = base.run, fail = false;
  let rejectDocument!: (error: Error) => void;
  const read = vi.fn(async (path: string) => {
    if (!path.startsWith('/api/documents/')) return runScope(structuredClone(run));
    if (fail) return new Promise((_, reject) => { rejectDocument = reject; });
    return { ...fixtureMeta, snapshot_id: 'document', data: { kind: 'document', run: structuredClone(run), document: base.document } };
  }) as unknown as ReadTransport;
  render(<App host="codex" compact transport={read} initialRunId="run-a"/>);
  await screen.findByText('Letzter Absatz.');
  const viewport = screen.getByRole('generic', { name: 'Dokumentinhalt' }); viewport.scrollTop = 251; viewport.scrollLeft = 17; fireEvent.scroll(viewport);
  run = { ...run, companion: { ...run.companion!, decision_material_version: 'sha256:' + 'b'.repeat(64) } };
  reload();
  const sameBytes = await screen.findByRole('button', { name: 'Aktuelle Fassung öffnen' });
  expect(screen.queryByText('Approval: PRD', { exact: true })).toBeNull();
  fireEvent.click(sameBytes);
  // This same-byte decision is still an explicit new decision; switch failure must keep the old reading.
  // A second decision creates a controlled failure after the first successful transition.
  await screen.findByRole('link', { name: 'Originaldatei herunterladen' });
  viewport.scrollTop = 251; viewport.scrollLeft = 17; fireEvent.scroll(viewport);
  run = { ...run, companion: { ...run.companion!, decision_material_version: 'sha256:' + 'c'.repeat(64) } };
  reload();
  const replace = await screen.findByRole('button', { name: 'Aktuelle Fassung öffnen' });
  fail = true;
  replace.focus();
  fireEvent.click(replace);
  await screen.findByText('Entwurf wird geladen …');
  if (focusMoved) viewport.focus();
  await act(async () => rejectDocument(Error('read_failed')));
  await screen.findByText(/Die gewählte Fassung konnte nicht bestätigt werden/);
  const retry = screen.getByRole('button', { name: 'Erneut prüfen' });
  expect(document.activeElement).toBe(focusMoved ? viewport : retry);
  expect(screen.queryByText('Approval: PRD', { exact: true })).toBeNull();
  expect(screen.getByText('Letzter Absatz.')).toBeTruthy();
  expect([viewport.scrollTop, viewport.scrollLeft]).toEqual([251, 17]);
  const before = sourceReads(read);
  fail = false;
  fireEvent.click(retry);
  const openLatest = await screen.findByRole('button', { name: 'Aktuelle Fassung öffnen' });
  await waitFor(() => expect((openLatest as HTMLButtonElement).disabled).toBe(false));
  fireEvent.click(screen.getByRole('button', { name: 'Aktuelle Fassung öffnen' }));
  await screen.findByRole('link', { name: 'Originaldatei herunterladen' });
  expect(screen.getByText('Letzter Absatz.')).toBeTruthy();
  expect(screen.queryByText(/Die gewählte Fassung konnte nicht bestätigt werden/)).toBeNull();
  expect(sourceReads(read)).toBe(before + 1);
});


it.each(['CD+Tests', 'CR'])('shows confirmed %s work on the selected Codex card and clears it without a reload', async gate => {
  width(gate === 'CR' ? 360 : 650);
  const run = runData('run-a');
  run.persisted!.current_gate = gate;
  run.evaluation!.current_gate = gate;
  run.companion = gate === 'CR' ? {
    route: 'structured_slice', path: [{ gate: 'TP', status: 'fulfilled' }, { gate: 'QA', status: 'open' }],
    next_text: 'Code-Review durchführen.', blocking_text: 'none',
  } : { route: 'structured_slice', path: [{ gate: 'TP', status: 'fulfilled' }], next_text: run.evaluation!.next_action_de!, blocking_text: 'none' };
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
  expect(screen.getByText('Das Vorhaben ist in der Phase „Umsetzung und Tests“.', { selector: '.companion-signal' })).toBeTruthy();
  const work = screen.getByText(/Ich arbeite gerade daran/);
  expect(screen.getByText('Einen Augenblick').nextElementSibling).toBe(work);
  if (gate === 'CR') {
    expect(work.textContent).toContain('Code-Prüfung');
    expect(screen.getByRole('list', { name: 'Gate-Fortschritt' }).querySelector('[aria-current="step"]')?.textContent)
      .toBe('CD+Tests Aktuell');
  } else {
    const next = screen.getByText('Nächster Schritt');
    expect(next.nextElementSibling).toBe(screen.getByText(run.evaluation!.next_action_de!));
    const progress = screen.getByRole('list', { name: 'Gate-Fortschritt' });
    expect(work.compareDocumentPosition(progress) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(progress.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  }
  activity = { ...record, expires_at: Date.now() - 1 };
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(screen.queryByText('Einen Augenblick')).toBeNull();
  expect(screen.getByText('Codex ist als Nächstes dran')).toBeTruthy();
  expect(screen.queryByText(/Ich arbeite gerade daran/)).toBeNull();
  expect(screen.queryByText('Nächster Schritt')).toBeNull();
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
  expect(screen.getByText('Das Vorhaben ist in der Phase „Umsetzung und Tests“.', { selector: '.companion-signal' })).toBeTruthy();
  const hint = screen.getByText('Ob Codex gerade an diesem Run arbeitet, ist unklar.');
  const details = hint.closest('details')!;
  expect(details.open).toBe(false);
  fireEvent.click(details.querySelector('summary')!);
  expect(details.open).toBe(true);
  expect(screen.queryByText('Einen Augenblick')).toBeNull();
  const card = screen.getByRole('article', { name: 'Companion-Statuskarte' });
  expect(card.getAttribute('data-tone')).toBeNull();
  expect(screen.getByText('Codex ist als Nächstes dran')).toBeTruthy();
  observation = undefined;
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(screen.queryByText('Aktivität unbekannt')).toBeNull();
  expect(screen.queryByText(/Ob Codex gerade an diesem Run arbeitet/)).toBeNull();
  expect(screen.getByText('Codex ist als Nächstes dran')).toBeTruthy();
  const record = { target_id: fixtureMeta.target.target_id, run_id: run.run_id, revision_id: run.revision_id!, gate, expires_at: Date.now() + 25_000 };
  observation = { activity: record };
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(screen.getByText('Das Vorhaben ist in der Phase „Umsetzung und Tests“.', { selector: '.companion-signal' })).toBeTruthy();
  expect(screen.queryByText('Aktivität unbekannt')).toBeNull();
  expect(card.getAttribute('data-tone')).toBe('working');
});

it('dates earlier events of the selected Codex Run and hides the history once the session expires', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 17, 12, 0));
  width(650);
  const run = runData('run-a');
  const event = (id: string, at: Date, kind: string, gate: string | null) => ({ id, at: at.toISOString(), run_id: run.run_id, kind, gate, reason: null });
  let observation: Record<string, unknown> = { run_id: run.run_id, revision_id: run.revision_id, events: { state: 'available', items: [
    event('e-3', new Date(2026, 10, 17, 9, 5), 'approval_requested', 'PRD'),
    event('e-2', new Date(2026, 10, 14, 16, 30), 'document_recorded', 'UR'),
    event('e-1', new Date(2025, 11, 31, 23, 59), 'material_staged', null),
  ] } };
  let expired = false;
  const read: ReadTransport = async path => {
    if (!path.startsWith('/api/freshness')) return { ...runScope(run), companion_observation: observation } as never;
    if (expired) throw Error('session_expired');
    return { ...fixtureMeta, data: { unchanged: true }, companion_observation: observation } as never;
  };
  render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
  await screen.findByRole('heading', { name: run.run_id });
  const history = screen.getByRole('region', { name: 'Ereignisse' });
  expect([...history.querySelectorAll('time')].map(time => time.textContent)).toEqual(['09:05', '14.11. 16:30', '31.12.2025 23:59']);
  expect(history.textContent).toContain('Freigabe angefragt für Produktanforderungen');
  // The selected run's own events name no run.
  expect(history.textContent).not.toContain('run-a');
  observation = { ...observation, events: { state: 'unavailable', items: [] } };
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(screen.getByRole('region', { name: 'Ereignisse' }).textContent).toContain('Ereignisse nicht verfügbar');
  expired = true;
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(screen.getByRole('article', { name: 'Companion-Statuskarte' })).toBeTruthy();
  expect(screen.queryByRole('region', { name: 'Ereignisse' })).toBeNull();
  expect(screen.queryByText(/Ereignisse nicht verfügbar/)).toBeNull();
});

// Run run-71aa7dbb (SCN-010, SCN-011; SD SDD-006): the card lists a recorded approval or completion
// only once the run detail confirms it, and keeps a still-uncertain outcome beyond the five newest
// lines until the run recorded a later operation.
it('lists confirmed durable events and keeps uncertain outcomes of the selected Codex Run', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 17, 12, 0));
  width(650);
  const lines = async (lastActivity: Date, lifecycle = 'active') => {
    const run = runData('run-a');
    run.lifecycle = lifecycle;
    run.last_activity = lastActivity.toISOString();
    run.companion = { route: 'structured_slice', path: [{ gate: 'UR', status: 'fulfilled' }, { gate: 'PRD', status: 'current' }], next_text: '', blocking_text: '' };
    const event = (id: string, minute: number, kind: string, gate: string | null) =>
      ({ id, at: new Date(2026, 10, 17, 9, minute).toISOString(), run_id: run.run_id, kind, gate, reason: null });
    const observation = { run_id: run.run_id, revision_id: run.revision_id, events: { state: 'available', items: [
      event('p', 59, 'approval_recorded', 'PRD'), event('u', 58, 'approval_recorded', 'UR'), event('c', 57, 'run_completed', 'OR'),
      ...[56, 55, 54, 53, 52].map(minute => event(`d${minute}`, minute, 'document_recorded', 'SD')),
      event('x', 1, 'effect_unknown', 'EVIDENCE'),
    ] } };
    const read: ReadTransport = async path => (path.startsWith('/api/freshness')
      ? { ...fixtureMeta, data: { unchanged: true }, companion_observation: observation }
      : { ...runScope(run), companion_observation: observation }) as never;
    render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
    await screen.findByRole('heading', { name: run.run_id });
    const found = [...screen.getByRole('region', { name: 'Ereignisse' }).querySelectorAll('li')].map(item => item.textContent ?? '');
    cleanup();
    return found;
  };
  const uncertain = await lines(new Date(2026, 10, 17, 8, 0));
  expect(uncertain).toHaveLength(5);
  expect(uncertain.filter(line => line.includes('Freigabe erfasst für'))).toEqual(['09:58 Freigabe erfasst für Nutzeranforderungen']);
  expect(uncertain.some(line => line.includes('Run abgeschlossen'))).toBe(false);
  expect(uncertain.at(-1)).toBe('09:01 Wirkung unbekannt – Vorgangsstatus prüfen');
  const resolved = await lines(new Date(2026, 10, 17, 10, 0), 'completed');
  expect(resolved).toHaveLength(5);
  expect(resolved.some(line => line.includes('Wirkung unbekannt'))).toBe(false);
  expect(resolved.slice(0, 2)).toEqual(['09:58 Freigabe erfasst für Nutzeranforderungen', '09:57 Run abgeschlossen']);
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

it.each([
  ['UR', 'Nutzeranforderungen'],
  ['PRD', 'Produktanforderungen'],
  ['SD', 'Systemdesign'],
  ['TP', 'Arbeits- und Testplan'],
  ['CD+Tests', 'Umsetzung und Tests'],
  ['QA', 'Qualitätsprüfung'],
  ['UAT', 'Abnahme'],
  ['OR', 'Abschlussnachweise'],
])('names the %s phase in a sentence before the next step', async (gate, phase) => {
  const run = runData('run-a');
  run.persisted!.current_gate = gate;
  run.evaluation!.current_gate = gate;
  run.evaluation!.next_action_de = 'Nächsten Schritt ausführen.';
  const read: ReadTransport = async () => ({ ...runScope(run), companion_observation: { liveness: 'unknown' } }) as never;
  render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
  const status = await screen.findByText(`Das Vorhaben ist in der Phase „${phase}“.`, { selector: '.companion-signal' });
  const step = screen.getByText('Nächsten Schritt ausführen.');
  expect(status.compareDocumentPosition(step) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it('keeps code review within CD+Tests in current and retained views until a new snapshot is confirmed', async () => {
  width(320);
  const run = runData('run-a');
  run.persisted!.current_gate = 'CR';
  run.evaluation!.current_gate = 'CR';
  run.companion = {
    route: 'structured_slice',
    path: [{ gate: 'TP', status: 'fulfilled' }, { gate: 'QA', status: 'open' }],
    next_text: 'Code-Review durchführen.',
    blocking_text: 'none',
  };
  const refreshed = structuredClone(run);
  refreshed.persisted!.current_gate = 'QA';
  refreshed.evaluation!.current_gate = 'QA';
  refreshed.companion!.path[1].status = 'current';
  refreshed.companion!.next_text = 'Qualität prüfen.';
  let change = false;
  let fail = true;
  const read: ReadTransport = async path => {
    if (path.startsWith('/api/freshness')) return { ...fixtureMeta, code: 'source_changed', data: null } as never;
    if (change && fail) throw Error('source_changed');
    return runScope(change ? refreshed : run) as never;
  };
  render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
  await screen.findByText('Das Vorhaben ist in der Phase „Umsetzung und Tests“.', { selector: '.companion-signal' });
  const progress = screen.getByRole('list', { name: 'Gate-Fortschritt' });
  expect(progress.querySelector('[aria-current="step"]')?.textContent).toBe('CD+Tests Aktuell');
  expect(screen.getByText('Code-Review durchführen.')).toBeTruthy();
  change = true;
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(await screen.findByText('Zuletzt war das Vorhaben in der Phase „Umsetzung und Tests“.')).toBeTruthy();
  expect(progress.querySelector('[aria-current]')).toBeNull();
  expect(progress.textContent).toContain('CD+Tests Zuletzt aktuell');
  const reload = () => screen.findByRole('button', { name: 'Neu laden' });
  fireEvent.click(await reload());
  expect(await screen.findByText('Aktualisierung fehlgeschlagen')).toBeTruthy();
  expect(screen.getByText('Zuletzt war das Vorhaben in der Phase „Umsetzung und Tests“.')).toBeTruthy();
  expect(screen.getByText('Code-Review durchführen.')).toBeTruthy();
  fail = false;
  fireEvent.click(await reload());
  await screen.findByText('Das Vorhaben ist in der Phase „Qualitätsprüfung“.', { selector: '.companion-signal' });
  expect(screen.getByText('Qualität prüfen.')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Neu laden' })).toBeNull();
});

it.each(['freshness rejection', 'snapshot timeout'])('recovers the same Companion Run after a transient %s', async fault => {
  width(320);
  const { run } = fixture();
  const paths: string[] = [];
  let captures = 0;
  const read: ReadTransport = async path => {
    paths.push(path);
    if (path.startsWith('/api/freshness')) {
      if (fault === 'freshness rejection') throw Error('read_failed');
      return { ...fixtureMeta, code: 'source_changed', data: null } as never;
    }
    ++captures;
    if (fault === 'snapshot timeout' && captures === 2) return { ...fixtureMeta, snapshot_id: null,
      state: 'error', code: 'timeout', data: null, retryable: true } as never;
    return runScope(run, `capture-${captures}`) as never;
  };
  render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
  await screen.findByRole('button', { name: 'PRD-Entwurf öffnen' });
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  const capture = `/api/snapshot?run_id=${run.run_id}`;
  expect(paths).toEqual([capture, '/api/freshness?snapshot=capture-1', capture, ...(fault === 'snapshot timeout' ? [capture] : [])]);
  expect(screen.getByRole('button', { name: 'PRD-Entwurf öffnen' }).getAttribute('aria-disabled')).toBeNull();
  expect(screen.queryByText('Aktueller Stand nicht bestätigt')).toBeNull();
});

it.each(['pending', 'changed response', 'changed rejection'])('automatically offers the new draft after a pending write and a %s retry', async retry => {
  vi.useFakeTimers();
  width(1360);
  const { run, document: original } = fixture();
  const next = { ...run, revision_id: 'revision-b',
    companion: { ...run.companion!, decision_material_version: 'sha256:' + 'b'.repeat(64) },
    document_states: run.document_states!.map(row => ({ ...row, revision_id: 'revision-b', content_digest: 'b'.repeat(64) })) };
  let stage: 'before' | 'writing' | 'retry' | 'after' = 'before';
  const capture = '/api/snapshot?run_id=' + run.run_id;
  const read = vi.fn(async (path: string) => {
    if (path.startsWith('/api/freshness')) return { ...fixtureMeta, state: 'blocked', code: 'source_changed', data: null };
    if (path.startsWith('/api/documents/')) return { ...fixtureMeta, snapshot_id: 'document', data: { kind: 'document', run, document: original } };
    if (stage === 'retry' && retry === 'changed rejection') throw Error('source_changed');
    if (stage === 'retry' && retry === 'changed response') return { ...fixtureMeta, state: 'stale', code: 'source_changed', data: null, retryable: true };
    if (stage === 'writing' || stage === 'retry') return { ...fixtureMeta, state: 'blocked', code: 'run_step_pending', data: null, retryable: true };
    return stage === 'after' ? runScope(next, 'after-write') : runScope(run, 'before-write');
  }) as unknown as ReadTransport;
  await act(async () => { render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>); });
  const body = screen.getByRole('article', { name: 'Originaldokument' });
  const viewport = screen.getByRole('generic', { name: 'Dokumentinhalt' });
  viewport.scrollTop = 250;
  fireEvent.scroll(viewport);
  const captures = () => vi.mocked(read).mock.calls.filter(([path]) => path === capture).length;
  expect(captures()).toBe(1);

  stage = 'writing';
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(captures()).toBe(2);
  expect(screen.queryByText('Approval: PRD', { exact: true })).toBeNull();
  expect(screen.queryByText('Aktueller Stand nicht bestätigt.')).toBeNull();
  stage = 'retry';
  await act(async () => { await vi.advanceTimersByTimeAsync(200); });
  expect(captures()).toBe(3);
  expect(screen.getByRole('article', { name: 'Originaldokument' })).toBe(body);

  stage = 'after';
  await act(async () => { await vi.advanceTimersByTimeAsync(600); });
  expect(captures()).toBe(4);
  expect(screen.getAllByRole('button', { name: 'Aktuelle Fassung öffnen' })).toHaveLength(1);
  expect(screen.queryByRole('button', { name: 'PRD-Entwurf öffnen' })).toBeNull();
  expect(screen.getByRole('article', { name: 'Originaldokument' })).toBe(body);
  expect(viewport.scrollTop).toBe(250);
  expect(sourceReads(read)).toBe(1);
});

it.each(['timeout', 'session_invalid'])('identifies both Runs and offers the applicable recovery after a switch fails with %s', async failure => {
  width(1360);
  const base = fixture();
  base.run.title = 'Projekt Alpha';
  base.run.active_run_ids = [base.run.run_id, 'run-b'];
  const target = runData('run-b', 'Projekt Beta');
  const requests: string[] = [];
  const read: ReadTransport = async (path, signal, expected) => {
    if (path === '/api/snapshot?run_id=run-b') {
      requests.push(path);
      if (requests.length === 1) throw Error(failure);
      return runScope(target, 'snapshot-b') as never;
    }
    return base.read(path, signal, expected);
  };
  render(<App host="codex" compact transport={read} initialRunId={base.run.run_id}/>);
  const original = await screen.findByRole('article', { name: 'Originaldokument' });
  fireEvent.click(screen.getByRole('button', { name: 'Nächster Run' }));
  const notice = await screen.findByText(/Run „run-b“ konnte nicht geöffnet werden/);
  expect(notice?.textContent).toContain('run-b');
  expect(notice?.textContent).toContain('Projekt Alpha');
  expect(screen.queryByRole('button', { name: 'Erneut prüfen' })).toBeNull();
  expect(screen.getByRole('article', { name: 'Originaldokument' })).toBe(original);
  if (failure === 'session_invalid') {
    expect(notice.textContent).toContain('Öffne den Begleiter im Chat erneut.');
    expect(screen.queryByRole('button', { name: 'Wechsel erneut versuchen' })).toBeNull();
    return;
  }
  fireEvent.click(screen.getByRole('button', { name: 'Wechsel erneut versuchen' }));
  await screen.findByRole('heading', { name: target.title! });
  expect(requests).toEqual(['/api/snapshot?run_id=run-b', '/api/snapshot?run_id=run-b']);
  expect(screen.queryByText('Letzter Absatz.')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Wechsel erneut versuchen' })).toBeNull();
});

it.each(['session_invalid', 'budget exhausted', 'unmount'])('stops the scoped write retries on %s', async stop => {
  vi.useFakeTimers();
  width(1360);
  const base = fixture();
  let writeStarted = false;
  let captures = 0;
  const read: ReadTransport = async (path, signal, expected) => {
    if (path.startsWith('/api/freshness')) return { ...fixtureMeta, code: 'source_changed', data: null } as never;
    if (writeStarted && path.startsWith('/api/snapshot')) {
      expect(path).toBe('/api/snapshot?run_id=' + base.run.run_id);
      captures++;
      if (captures === 1) return { ...fixtureMeta, state: 'blocked', code: 'run_step_pending', retryable: true, data: null } as never;
      throw Error(stop === 'session_invalid' ? stop : 'source_changed');
    }
    return base.read(path, signal, expected);
  };
  await act(async () => { render(<App host="codex" compact transport={read} initialRunId={base.run.run_id}/>); });
  writeStarted = true;
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  if (stop === 'unmount') cleanup();
  await act(async () => { await vi.advanceTimersByTimeAsync(15_000); });
  if (stop === 'unmount') {
    expect(captures).toBe(1);
  } else if (stop === 'session_invalid') {
    expect(captures).toBe(2);
    expect(screen.getByText(/Die Sitzung ist ungültig/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Erneut prüfen' })).toBeNull();
  } else {
    expect(captures).toBe(5);
    expect(screen.getByRole('button', { name: 'Erneut prüfen' })).toBeTruthy();
    expect(screen.getByText('Letzter Absatz.')).toBeTruthy();
  }
});

it('keeps the past Companion observation and offers reload when the scoped retry also fails', async () => {
  width(320);
  const { run } = fixture();
  let captures = 0;
  let unavailable = true;
  const read: ReadTransport = async path => {
    if (path.startsWith('/api/freshness')) throw Error('read_failed');
    if (++captures > 1 && unavailable) throw Error('read_failed');
    return runScope(run, `capture-${captures}`) as never;
  };
  render(<App host="codex" compact transport={read} initialRunId={run.run_id}/>);
  await screen.findByRole('button', { name: 'PRD-Entwurf öffnen' });
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(await screen.findByText('Aktueller Stand nicht bestätigt')).toBeTruthy();
  expect(screen.getByText('Der Begleiter zeigt den zuletzt gelesenen Stand.')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'PRD-Entwurf öffnen' }).getAttribute('aria-disabled')).toBe('true');
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  expect(captures).toBe(3);
  unavailable = false;
  fireEvent.click(screen.getByRole('button', { name: 'Neu laden' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'PRD-Entwurf öffnen' }).getAttribute('aria-disabled')).toBeNull());
  expect(screen.queryByText('Aktueller Stand nicht bestätigt')).toBeNull();
});

it('shows a single recovery notice at the open draft and logs the operation and typed error', async () => {
  width(1360);
  const base = fixture();
  const log = vi.spyOn(console, 'warn').mockImplementation(() => {});
  let failing = false;
  const read: ReadTransport = async path => {
    if (path.startsWith('/api/freshness')) return { ...fixtureMeta, code: 'source_changed', data: null } as never;
    if (path.startsWith('/api/documents/')) return { ...fixtureMeta, snapshot_id: 'document',
      data: { kind: 'document', run: base.run, document: base.document } } as never;
    if (failing) throw Error('timeout');
    return runScope(base.run, 'named-run') as never;
  };
  render(<App host="codex" compact transport={read} initialRunId={base.run.run_id}/>);
  const body = await screen.findByRole('article', { name: 'Originaldokument' });
  failing = true;
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  // The failed capture settles after the freshness check; a loaded runner may need a further render.
  const notices = await waitFor(() => {
    const found = screen.getByRole('region', { name: 'Entwurf lesen' }).querySelectorAll('.companion-reader-notice');
    expect(found).toHaveLength(1);
    return found;
  });
  expect(notices[0].textContent).toContain('Aktueller Stand nicht bestätigt.');
  expect(screen.queryByText('Aktualisierung fehlgeschlagen')).toBeNull();
  expect(screen.getByRole('article', { name: 'Originaldokument' })).toBe(body);
  expect(log).toHaveBeenCalledWith(`AGDF Companion read ${JSON.stringify({ operation: 'snapshot', code: 'timeout', run_id: base.run.run_id })}`);
  failing = false;
  fireEvent.click(screen.getByRole('button', { name: 'Erneut prüfen' }));
  await screen.findByRole('link', { name: 'Originaldatei herunterladen' });
  expect(screen.queryByText('Aktueller Stand nicht bestätigt.', { exact: false })).toBeNull();
});

it.each([
  { code: 'session_invalid', state: 'ungültig', size: 1360 },
  { code: 'session_invalid', state: 'ungültig', size: 320 },
  { code: 'session_expired', state: 'abgelaufen', size: 1360 },
])('keeps the reading and offers chat reopening for $code at $size px', async ({ code, state, size }) => {
  width(size);
  const base = fixture();
  let rejectSession = false;
  const read: ReadTransport = async (path, signal, expected) => {
    if (path.startsWith('/api/freshness')) throw Error(rejectSession ? code : 'cancelled');
    return base.read(path, signal, expected);
  };
  render(<App host="codex" compact transport={read} initialRunId={base.run.run_id}/>);
  if (size === 320) fireEvent.click(await screen.findByRole('button', { name: 'PRD-Entwurf öffnen' }));
  const body = await screen.findByRole('article', { name: 'Originaldokument' });
  rejectSession = true;
  await act(async () => { fireEvent(document, new Event('visibilitychange')); });
  const reader = screen.getByRole('region', { name: 'Entwurf lesen' });
  const notice = reader.querySelector('.companion-reader-notice');
  expect(notice?.textContent).toBe(`Die Sitzung ist ${state}. Öffne den Begleiter im Chat erneut.`);
  expect(notice?.querySelector('button')).toBeNull();
  expect(screen.getByRole('article', { name: 'Originaldokument' })).toBe(body);
  expect(screen.queryByRole('link', { name: 'Originaldatei herunterladen' })).toBeNull();
  const readsBefore = vi.mocked(base.read).mock.calls.length;
  if (size === 320) await act(async () => { close(); });
  fireEvent.click(screen.getByRole('button', { name: 'AGDF Companion' }));
  const reloadItem = screen.getByRole('menuitem', { name: 'Neu lesen' });
  expect(reloadItem.hasAttribute('disabled')).toBe(true);
  await act(async () => { fireEvent.click(reloadItem); });
  expect(vi.mocked(base.read).mock.calls.length).toBe(readsBefore);
});
