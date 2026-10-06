import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { PassiveMarkdown } from '../src/DocumentView';
import { validateEnvelope, validateData, consumeSession } from '../src/api';
import { ReadState, label } from '../src/feedback';
import { initialState, readingReducer } from '../src/state';
import { App } from '../src/App';
import type { Envelope, Inventory } from '../src/types';
const snapshot: Envelope<Inventory> = { schema_version: '1', target: { target_id: 'target', display_path: '/fixture' }, snapshot_id: 'view-1', source_digest: 'digest', observed_as_of: '2026-10-05T12:00:00Z', state: 'available', code: null, retryable: false, data: { runs: [{ run_id: 'fixture-a', valid: true, title: 'Original title', objective: null, source_path: '.agdf/control/runs/fixture-a/RUN_STATE.md', lifecycle: 'active', revision_id: 'revision', status: 'open', current_gate: 'UR', code: null }], file_count: 1, byte_count: 1 } };
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe('read state and passive documents', () => {
  it('SCN-009/024/027: raw HTML/images/foreign links are inert and registered links are buttons', () => {
    const open = vi.fn();
    const { container } = render(<PassiveMarkdown content={'# Original 日本語\n\n<script>alert(1)</script>\n\n<iframe src="https://evil.invalid"></iframe>\n\n![Bild](https://evil.invalid/a.svg)\n\n[fremd](https://evil.invalid) [active](javascript:alert) [erlaubt](UR.md)'} links={{ 'UR.md': 'registered' }} onOpen={open}/>);
    expect(container.querySelector('script,iframe,img,a,form')).toBeNull(); expect(screen.getByText('Original 日本語')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'erlaubt' })); expect(open).toHaveBeenCalledWith('registered');
  });
  it('SCN-006/015/016: older completions cannot replace selection, failure retains explicitly stale content', () => {
    const state = readingReducer(initialState, { type: 'begin', generation: 2, route: { view: 'overview' } });
    expect(readingReducer(state, { type: 'ready', generation: 1, route: { view: 'overview' }, inventory: snapshot, detail: null, document: null })).toBe(state);
    const ready = readingReducer(state, { type: 'ready', generation: 2, route: { view: 'overview' }, inventory: snapshot, detail: null, document: null });
    const failed = readingReducer(ready, { type: 'error', generation: 2, code: 'read_failed' }); expect(failed.stale).toBe(true); expect(failed.inventory).toBe(snapshot);
    expect(readingReducer(ready, { type: 'stale', snapshot: 'foreign', code: 'source_changed' })).toBe(ready);
  });
  it('SCN-006: malformed DTO/version/target/snapshot is denied', () => {
    expect(() => validateEnvelope(snapshot, { target: 'other', snapshot: 'view-1' })).toThrow('dto_invalid');
    expect(() => validateEnvelope(snapshot, { target: 'target', snapshot: 'other' })).toThrow('dto_invalid');
    expect(() => validateEnvelope({ ...snapshot, schema_version: '2' })).toThrow('dto_invalid');
    expect(() => validateEnvelope({ ...snapshot, retryable: 'yes' })).toThrow('dto_invalid');
    expect(() => validateData('/api/snapshot', { ...snapshot, data: { runs: [{}] } } as unknown as Envelope<unknown>)).toThrow('dto_invalid');
    expect(() => validateData('/api/runs/removed', { ...snapshot, state: 'missing', data: { run_id: 'removed', resources: [] } } as unknown as Envelope<unknown>)).not.toThrow();
  });
  it('SCN-032: session fragment is removed without durable storage', () => {
    window.history.replaceState(null, '', '/#' + 'a'.repeat(64)); const storage = vi.spyOn(Storage.prototype, 'setItem');
    expect(consumeSession()).toBe('a'.repeat(64)); expect(window.location.hash).toBe(''); expect(storage).not.toHaveBeenCalled();
  });
  it('SCN-005/016/018: transient service failure has German retry/progress and recovers overview', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(Error('offline')).mockResolvedValueOnce(new Response(JSON.stringify(snapshot)));
    render(<App secret={'a'.repeat(64)}/>);
    await screen.findByText('Die Daten konnten nicht gelesen werden. Quelle oder lokalen Dienst prüfen und wiederholen.');
    fireEvent.click(screen.getByRole('button', { name: 'Wiederholen' })); await screen.findByRole('button', { name: 'Original title' });
    expect(fetch).toHaveBeenCalledTimes(2); expect(screen.getByText('Nur Lesen', { exact: false })).toBeTruthy();
  });
  it('SCN-002/005: missing control preserves target provenance and explicit failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ...snapshot, state: 'missing', code: 'control_absent', retryable: true, data: null })));
    render(<App secret={'a'.repeat(64)}/>); await waitFor(() => expect(screen.getByText('/fixture')).toBeTruthy()); expect(screen.getAllByText(/Für dieses Repository fehlen/).length).toBeGreaterThan(0);
  });
  it('SCN-012/028: availability states have distinct German feedback and unknown values retain explicit source context', () => {
    for (const [state, code, heading] of [['empty', null, 'Keine Runs'], ['partial', 'inventory_partial', 'Teilweise verfügbar'], ['invalid', 'invalid_run', 'Ungültig'], ['missing', 'document_missing', 'Fehlt'], ['unsupported', 'document_unsupported', 'Vorschau nicht verfügbar'], ['blocked', 'resource_denied', 'Gesperrt'], ['error', 'read_failed', 'Lesefehler'], ['stale', 'source_changed', 'Veraltet']]) {
      const { unmount } = render(<ReadState state={state!} code={code}/>); expect(screen.getByText(heading!)).toBeTruthy(); unmount();
    }
    expect(label('unknown_core_value')).toBe('Nicht verfügbar · Original: unknown_core_value');
  });
  it('SCN-014: returning to visibility checks freshness without replacing displayed content', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(snapshot))).mockResolvedValueOnce(new Response(JSON.stringify({ ...snapshot, state: 'stale', code: 'source_changed', data: null })));
    render(<App secret={'a'.repeat(64)}/>); await screen.findByRole('button', { name: 'Original title' });
    await act(async () => {});
    const descriptor = Object.getOwnPropertyDescriptor(document, 'hidden');
    try {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true }); fireEvent(document, new Event('visibilitychange')); expect(fetch).toHaveBeenCalledTimes(1);
      Object.defineProperty(document, 'hidden', { configurable: true, value: false }); fireEvent(document, new Event('visibilitychange'));
      await screen.findByText('Die Quelldaten haben sich geändert. Angezeigte Inhalte gehören zum vorherigen Datenstand. Bewusst neu laden.'); expect(screen.getByRole('button', { name: 'Original title' })).toBeTruthy(); expect(fetch).toHaveBeenCalledTimes(2);
    } finally { if (descriptor) Object.defineProperty(document, 'hidden', descriptor); else Reflect.deleteProperty(document, 'hidden'); }
  });
});
