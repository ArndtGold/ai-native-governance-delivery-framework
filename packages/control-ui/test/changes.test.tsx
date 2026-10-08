import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';
import type { Envelope } from '../src/types';
import type { ReadTransport } from '../src/api';
import { backlog, pointer, runData, runScope, fixtureMeta } from './scoped-fixtures';
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('background Run refresh retains source focus after opaque resource IDs are replaced', async () => {
  const run = runData('run-a', 'My undertaking');
  const source = { resource_id: 'old-source', run_id: 'run-a', type: 'Run State', path: '.agdf/control/runs/run-a/RUN_STATE.md', registered_reference: '.agdf/control/runs/run-a/RUN_STATE.md', status: 'registered' };
  run.resources = [source];
  let changed = false, deliver!: () => void;
  const read = vi.fn(async (path: string) => path.startsWith('/api/freshness')
    ? { ...fixtureMeta, data: null, state: 'stale', code: 'source_changed' }
    : runScope(changed ? { ...run, resources: [{ ...source, resource_id: 'new-source' }] } : run)) as ReadTransport;
  read.waitForChanges = vi.fn((_snapshot, signal) => new Promise<Envelope<{ changed: boolean }>>((resolve, reject) => {
    deliver = () => resolve({ ...fixtureMeta, data: { changed: true } });
    signal.addEventListener('abort', () => reject(Error('cancelled')), { once: true });
  }));
  render(<App transport={read} initialRunId="run-a"/>);
  const button = await screen.findByRole('button', { name: 'Stand des Vorhabens öffnen' }); button.focus();
  changed = true; await act(async () => deliver());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Stand des Vorhabens öffnen' }).getAttribute('data-focus-id')).toContain('new-source'));
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Stand des Vorhabens öffnen' }));
});
it('an open original stays readable after a change and requires a deliberate reload', async () => {
  const run = runData('run-a', 'My undertaking');
  const resource = { resource_id: 'source', run_id: 'run-a', type: 'Run State', registered_reference: '.agdf/control/runs/run-a/RUN_STATE.md', path: '.agdf/control/runs/run-a/RUN_STATE.md', status: 'registered' };
  run.resources = [resource];
  let deliver!: () => void;
  const read = vi.fn(async (path: string) => path.startsWith('/api/documents/')
    ? { ...fixtureMeta, snapshot_id: 'document', data: { kind: 'document', run, document: { resource, content: '# Original stays here', format: 'markdown', content_digest: 'digest', links: {} } } }
    : path.startsWith('/api/freshness') ? { ...fixtureMeta, data: null, state: 'stale', code: 'source_changed' } : runScope(run)) as ReadTransport;
  read.waitForChanges = vi.fn((_snapshot, signal) => new Promise<Envelope<{ changed: boolean }>>((resolve, reject) => {
    deliver = () => resolve({ ...fixtureMeta, data: { changed: true } });
    signal.addEventListener('abort', () => reject(Error('cancelled')), { once: true });
  }));
  render(<App transport={read} initialRunId="run-a"/>);
  fireEvent.click(await screen.findByRole('button', { name: 'Stand des Vorhabens öffnen' }));
  fireEvent.click(await screen.findByText('Originaldokument lesen', { exact: true }));
  await screen.findByRole('heading', { name: 'Original stays here' });
  const before = vi.mocked(read).mock.calls.filter(c => c[0].startsWith('/api/snapshot')).length;
  await act(async () => deliver());
  const reload = await screen.findByRole('button', { name: 'Quelle geändert · Neu laden' });
  expect(reload.querySelector('.refresh-update-dot')).toBeTruthy();
  expect(screen.queryByText('Veraltet')).toBeNull();
  expect(document.querySelector('main footer')?.textContent).toContain('Neuer Stand verfügbar · Vorheriger Datenstand bleibt sichtbar');
  expect(screen.getByRole('heading', { name: 'Original stays here' })).toBeTruthy();
  expect(vi.mocked(read).mock.calls.filter(c => c[0].startsWith('/api/snapshot'))).toHaveLength(before);
  fireEvent.click(reload);
  await waitFor(() => expect(document.querySelector('.refresh-update-dot')).toBeNull());
  expect(document.querySelector('main footer')?.textContent).not.toContain('Vorheriger Datenstand');
  expect(vi.mocked(read).mock.calls.filter(c => c[0].startsWith('/api/snapshot'))).toHaveLength(before + 1);
});
it('change signal refreshes before polling and retains filter, disclosure and scroll', async () => {
  let changed = false, deliver!: () => void;
  const read = vi.fn(async (path: string) => path.startsWith('/api/freshness')
    ? { ...backlog([]), data: null, state: 'stale', code: 'source_changed' }
    : backlog([{ ...pointer('run-a', 'My undertaking'), stored_status: changed ? 'Awaiting UAT' : 'Awaiting QA' }])) as ReadTransport;
  read.waitForChanges = vi.fn((_snapshot, signal) => new Promise<Envelope<{ changed: boolean }>>((resolve, reject) => {
    deliver = () => resolve({ ...backlog([]), data: { changed: true } });
    signal.addEventListener('abort', () => reject(Error('cancelled')), { once: true });
  }));
  render(<App transport={read}/>); await screen.findByText('Gespeicherter Stand laut Backlog: Awaiting QA');
  screen.getByRole('searchbox').focus();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'My undertaking' } });
  screen.getByText('Gespeicherte Angaben und Quellen').closest('details')!.open = true;
  const workspace = document.querySelector('.workspace')!; workspace.scrollTop = 180;
  changed = true; await act(async () => deliver());
  await screen.findByText('Gespeicherter Stand laut Backlog: Awaiting UAT');
  expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('My undertaking');
  expect(screen.getByText('Gespeicherte Angaben und Quellen').closest('details')?.open).toBe(true);
  expect(document.activeElement).toBe(screen.getByRole('searchbox')); expect(workspace.scrollTop).toBe(180); expect(screen.queryByText('Veraltet')).toBeNull(); expect(read).toHaveBeenCalledTimes(3);
});
it('hidden view cancels its waiting request and rechecks on return', async () => {
  const read = vi.fn(async (path: string) => path.startsWith('/api/freshness') ? { ...backlog([]), data: { unchanged: true } } : backlog([pointer('run-a', 'My undertaking')])) as ReadTransport;
  let waiting!: AbortSignal;
  read.waitForChanges = vi.fn((_snapshot, signal) => new Promise<Envelope<{ changed: boolean }>>((_resolve, reject) => {
    waiting = signal; signal.addEventListener('abort', () => reject(Error('cancelled')), { once: true });
  }));
  const descriptor = Object.getOwnPropertyDescriptor(document, 'hidden');
  try {
    render(<App transport={read}/>); await screen.findByRole('button', { name: 'My undertaking' });
    await waitFor(() => expect(waiting).toBeTruthy());
    Object.defineProperty(document, 'hidden', { configurable: true, value: true }); fireEvent(document, new Event('visibilitychange')); expect(waiting.aborted).toBe(true);
    const count = vi.mocked(read).mock.calls.length;
    Object.defineProperty(document, 'hidden', { configurable: true, value: false }); fireEvent(document, new Event('visibilitychange'));
    await waitFor(() => expect(read).toHaveBeenCalledTimes(count + 1)); expect(vi.mocked(read).mock.calls.at(-1)?.[0]).toContain('/api/freshness');
  } finally { if (descriptor) Object.defineProperty(document, 'hidden', descriptor); else Reflect.deleteProperty(document, 'hidden'); }
});
