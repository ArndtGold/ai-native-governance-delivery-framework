import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';
import type { Envelope, ReadingScope } from '../src/types';
import type { ReadTransport } from '../src/api';
import { runData, runScope, fixtureMeta } from './scoped-fixtures';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
for (const compact of [false, true]) it(`${compact ? 'compact' : 'expanded'} refresh keeps the dot through failure, clears it only after a successful read`, async () => {
  let finish!: (result: Envelope<ReadingScope>) => void, fail!: (error: Error) => void, deliver!: () => void;
  let initial = true;
  const scope = runScope(runData('run-a', 'My undertaking'));
  const read = vi.fn(async (path: string) => {
    if (path.startsWith('/api/freshness')) return { ...fixtureMeta, data: null, state: 'stale', code: 'source_changed' };
    if (initial) { initial = false; return scope; }
    return new Promise<Envelope<ReadingScope>>((resolve, reject) => { finish = resolve; fail = reject; });
  }) as ReadTransport;
  read.waitForChanges = vi.fn((_snapshot, signal) => new Promise<Envelope<{ changed: boolean }>>((resolve, reject) => {
    deliver = () => resolve({ ...fixtureMeta, data: { changed: true } });
    signal.addEventListener('abort', () => reject(Error('cancelled')), { once: true });
  }));
  render(<App compact={compact} transport={read} initialRunId="run-a"/>);
  await screen.findByRole('button', { name: 'Neu laden' });
  await act(async () => deliver());
  const refreshing = await screen.findByRole('button', { name: 'Stand wird aktualisiert …' });
  expect(refreshing.hasAttribute('disabled')).toBe(true);
  expect(refreshing.getAttribute('data-refreshing')).toBe('true');
  expect(refreshing.querySelector('.refresh-update-dot')).toBeTruthy();
  expect(screen.queryByText('Veraltet')).toBeNull();
  await act(async () => fail(Error('read_failed')));
  await screen.findByText('Die Daten konnten nicht gelesen werden. Quelle oder lokalen Dienst prüfen und wiederholen.');
  expect(screen.getByText('Aktualisierung fehlgeschlagen', { selector: '.notice strong' })).toBeTruthy();
  expect(screen.getByText('Vorheriger Datenstand bleibt sichtbar.', { selector: '.notice p' })).toBeTruthy();
  expect(document.querySelector(compact ? '.compact-footnote' : 'main footer')?.textContent).toContain('Vorheriger Datenstand bleibt sichtbar');
  if (!compact) expect(document.querySelector('main footer')?.textContent).toContain('Aktualisierung fehlgeschlagen');
  expect(screen.queryByText('Veraltet')).toBeNull();
  const retry = screen.getByRole('button', { name: 'Aktualisierung fehlgeschlagen · Wiederholen' });
  expect(retry.querySelector('.refresh-update-dot')).toBeTruthy();
  fireEvent.click(retry);
  expect(screen.getByRole('button', { name: 'Stand wird aktualisiert …' }).querySelector('.refresh-update-dot')).toBeTruthy();
  await act(async () => finish({ ...scope, snapshot_id: 'fresh-read' }));
  await waitFor(() => expect(document.querySelector('.refresh-update-dot')).toBeNull());
  expect(screen.getByRole('button', { name: 'Neu laden' }).getAttribute('data-refreshing')).toBe('false');
  expect(screen.queryByText('Die Daten konnten nicht gelesen werden. Quelle oder lokalen Dienst prüfen und wiederholen.')).toBeNull();
  expect(document.querySelector(compact ? '.compact-footnote' : 'main footer')?.textContent).not.toContain('Vorheriger Datenstand');
});
it('a read failure without a confirmed source change never gets a blue new-data dot', async () => {
  let initial = true;
  const read = vi.fn(async () => {
    if (initial) { initial = false; return runScope(runData('run-a', 'My undertaking')); }
    throw Error('read_failed');
  }) as ReadTransport;
  render(<App transport={read} initialRunId="run-a"/>);
  fireEvent.click(await screen.findByRole('button', { name: 'Neu laden' }));
  await screen.findByText('Die Daten konnten nicht gelesen werden. Quelle oder lokalen Dienst prüfen und wiederholen.');
  expect(screen.getByRole('button', { name: 'Aktualisierung fehlgeschlagen · Wiederholen' })).toBeTruthy();
  expect(document.querySelector('main footer')?.textContent).toContain('Aktualisierung fehlgeschlagen');
  expect(document.querySelector('main footer')?.textContent).not.toContain('Neuer Stand verfügbar');
  expect(document.querySelector('.refresh-update-dot')).toBeNull();
});
