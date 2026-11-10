import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { App } from '../src/App';
import type { ReadTransport } from '../src/api';
import { backlog, documentFixture, fixtureMeta, pointer, runData, runScope } from './scoped-fixtures';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function width(value: number) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({ width: value, height: 700, top: 0, left: 0, right: value, bottom: 700, x: 0, y: 0, toJSON() {} }));
}
it('uses the run ID until a selected run supplies its real title and searches that title', async () => {
  width(1300);
  const row = { ...pointer('run-a', 'Ein gespeichertes Ziel'), title_source: 'objective' as const };
  const read = vi.fn(async (path: string) => path === '/api/snapshot' ? backlog([row]) : runScope(runData('run-a', 'Werkstattroboter Test'))) as unknown as ReadTransport;
  render(<App transport={read}/>);
  await screen.findByRole('region', { name: 'Ausgewählte Anforderung' });
  fireEvent.click(screen.getByRole('button', { name: 'run-a' }));
  expect(await screen.findByRole('button', { name: 'Werkstattroboter Test' })).toBeTruthy();
  fireEvent.change(screen.getByRole('searchbox', { name: 'Suchen' }), { target: { value: 'Werkstattroboter Test' } });
  expect(screen.getByRole('button', { name: 'Werkstattroboter Test' })).toBeTruthy();
});
it('keeps the list visible and never shows an earlier Run while another is loading', async () => {
  width(1300);
  let finish!: (value: ReturnType<typeof runScope>) => void;
  const read = vi.fn((path: string) => {
    if (path === '/api/snapshot') return Promise.resolve(backlog([pointer('run-a','Erstes Vorhaben'), pointer('run-b','Zweites Vorhaben')]));
    if (path === '/api/snapshot?run_id=run-a') return Promise.resolve(runScope(runData('run-a','Erstes Vorhaben')));
    if (path === '/api/snapshot?run_id=run-b') return new Promise<ReturnType<typeof runScope>>(resolve => { finish = resolve; });
    throw Error('unexpected_request');
  }) as unknown as ReadTransport;
  render(<App transport={read}/>);
  expect(await screen.findByText('Wähle eine Anforderung, um ihren aktuellen Stand zu sehen.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Erstes Vorhaben'}));
  const panel = screen.getByRole('region',{name:'Ausgewählte Anforderung'});
  expect(await within(panel).findByRole('heading',{name:'Erstes Vorhaben'})).toBeTruthy();
  expect(screen.getByRole('button',{name:'Erstes Vorhaben'}).getAttribute('aria-current')).toBe('true');
  fireEvent.click(screen.getByRole('button',{name:'Zweites Vorhaben'}));
  expect(within(panel).getByText('Anforderung wird geladen …')).toBeTruthy();
  expect(within(panel).queryByRole('heading',{name:'Erstes Vorhaben'})).toBeNull();
  await act(async () => finish(runScope(runData('run-b','Zweites Vorhaben'),'second-snapshot')));
  expect(await within(panel).findByRole('heading',{name:'Zweites Vorhaben'})).toBeTruthy();
  expect(screen.getByRole('button',{name:'Zweites Vorhaben'}).getAttribute('aria-current')).toBe('true');
  expect(vi.mocked(read).mock.calls.map(call => call[0])).toEqual(['/api/snapshot','/api/snapshot?run_id=run-a','/api/snapshot?run_id=run-b']);
});
it('uses the regular single-column navigation when the reading surface is narrow', async () => {
  width(500);
  const read = vi.fn(async (path: string) => path === '/api/snapshot' ? backlog([pointer('run-a','Erstes Vorhaben')]) : runScope(runData('run-a','Erstes Vorhaben'))) as unknown as ReadTransport;
  render(<App transport={read}/>);
  fireEvent.click(await screen.findByRole('button',{name:'Erstes Vorhaben'}));
  expect(await screen.findByRole('button',{name:'Alle Vorhaben'})).toBeTruthy();
  expect(screen.queryByRole('region',{name:'Ausgewählte Anforderung'})).toBeNull();
});
it('returns from a document to the selected card with search and list position intact', async () => {
  width(1300);
  const run = documentFixture();
  run.title = 'Erstes Vorhaben';
  run.persisted!.current_gate = 'UR';
  run.evaluation!.current_gate = 'UR';
  run.evaluation!.missing_approval = 'Approval: UR';
  run.evaluation!.control_assessment!.state = 'blocked';
  const resource = run.resources[0];
  const read = vi.fn(async (path: string) => {
    if (path === '/api/snapshot') return backlog([pointer('run-a', 'Erstes Vorhaben'), pointer('run-b', 'Zweites Vorhaben')]);
    if (path.startsWith('/api/documents/')) return { ...fixtureMeta, snapshot_id: 'document', data: { kind: 'document', run,
      document: { resource, format: 'markdown', content: '# Original', content_digest: 'digest', links: {} } } };
    return runScope(run);
  }) as unknown as ReadTransport;
  render(<App transport={read}/>);
  await screen.findByRole('region', { name: 'Ausgewählte Anforderung' });
  const search = await screen.findByRole('searchbox');
  fireEvent.change(search, { target: { value: 'Erstes' } });
  fireEvent.click(screen.getByRole('button', { name: 'Erstes Vorhaben' }));
  const panel = screen.getByRole('region', { name: 'Ausgewählte Anforderung' });
  const action = await within(panel).findByRole('button', { name: /Entwurf ansehen: Anforderungen/ });
  const list = screen.getByRole('region', { name: 'Vorhaben · Runs' });
  list.scrollTop = 87;
  fireEvent.click(action);
  const back = await screen.findByRole('button', { name: 'Zurück zur Übersicht' });
  await waitFor(() => expect((back as HTMLButtonElement).disabled).toBe(false));
  fireEvent.click(back);
  expect(await within(await screen.findByRole('region', { name: 'Ausgewählte Anforderung' })).findByRole('heading', { name: 'Erstes Vorhaben' })).toBeTruthy();
  expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('Erstes');
  expect(screen.getByRole('region', { name: 'Vorhaben · Runs' }).scrollTop).toBe(87);
  expect(screen.getByRole('button', { name: 'Erstes Vorhaben' }).getAttribute('aria-current')).toBe('true');
});

it('uses the selected current evaluation even when the prior list snapshot has another status', async () => {
  width(1300);
  const row = { ...pointer('run-a', 'Erstes Vorhaben'), stored_status: 'Klärung erforderlich', attention_code: 'clarification_required' as const };
  const selected = runData('run-a', 'Erstes Vorhaben');
  const read = vi.fn(async (path: string) => path === '/api/snapshot' ? backlog([row]) : runScope(selected)) as unknown as ReadTransport;
  render(<App transport={read}/>);
  const button = await screen.findByRole('button', { name: 'Erstes Vorhaben' });
  expect(button.closest('li')?.textContent).toContain('Klärung erforderlich');
  await waitFor(() => expect((screen.getByRole('button', { name: 'Erstes Vorhaben' }) as HTMLButtonElement).disabled).toBe(false));
  fireEvent.click(screen.getByRole('button', { name: 'Erstes Vorhaben' }));
  await screen.findByRole('heading', { name: 'In Umsetzung' });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Erstes Vorhaben' }).closest('li')?.textContent).toContain('In Umsetzung'));
  expect(screen.getByRole('button', { name: 'Erstes Vorhaben' }).closest('li')?.textContent).toContain('Aktueller Arbeitsstand');
});
