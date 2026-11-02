import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';
import { validDraftCheck, validateData, type ReadTransport } from '../src/api';
import { readingReducer, initialState } from '../src/state';
import { runData, runScope } from './scoped-fixtures';
import type { DraftCheckData, Envelope, ReadingScope } from '../src/types';
const revision = '11111111-1111-4111-8111-111111111111';
const snapshot = '22222222-2222-4222-8222-222222222222';
const replacement = '33333333-3333-4333-8333-333333333333';
function source(id = 'run-a'): DraftCheckData {
  return { source: { run_id: id, revision_id: revision, gate: 'PRD', artifact_path: `.agdf/control/artefacts/${id}/PRD.md`, artifact_digest: 'sha256:' + 'a'.repeat(64), available: true, reason: null },
    display: { state: 'unchecked', reason: null, recovery: 'check' }, result: null };
}
function selected(id = 'run-a', checked = false): Envelope<ReadingScope> {
  const draft = source(id);
  if (checked) {
    draft.display = { state: 'passed', reason: null, recovery: 'authoring' };
    draft.result = { run_id: id, gate: 'PRD', revision_id: revision, expected_revision_id: revision,
      artifact_path: draft.source.artifact_path!, artifact_digest: draft.source.artifact_digest,
      ready: true, readiness_scope: 'authoring_checks', authorizes: false, semantic_review_required: true,
      registration_required: true, presentation_required: true, checks: [{ name: 'approval_summary', ready: true }], diagnostics: [], next_action: 'Review through the existing owner.' };
  }
  return runScope({ ...runData(id), revision_id: revision, draft_check: draft }, checked ? replacement : snapshot);
}
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
describe('Bound draft check', () => {
  it('SCN-001/014/016/017: explicit action only, duplicate prevention, atomic current result and stable focus', async () => {
    let resolve!: (v: Envelope<ReadingScope>) => void;
    const read = vi.fn(async (path: string) => path.startsWith('/api/draft-check/') ? new Promise<Envelope<ReadingScope>>(r => { resolve = r; }) : selected());
    render(<App transport={read as ReadTransport} initialRunId="run-a"/>);
    const button = await screen.findByRole('button', { name: 'Entwurf prüfen' });
    expect(read).toHaveBeenCalledTimes(1); button.focus();
    fireEvent.click(button); fireEvent.click(button);
    await screen.findByText('Prüfung läuft');
    expect(read.mock.calls.filter(([path]) => path.startsWith('/api/draft-check/'))).toHaveLength(1);
    await act(async () => resolve(selected('run-a', true)));
    await screen.findByText('Entwurfsprüfung bestanden');
    expect(document.activeElement).toBe(button);
    expect(screen.getByText(/Freigabe, semantische Prüfung und QA/)).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Entwurfsprüfung' }).querySelector('[data-approval]')).toBeNull();
  });
  it('SCN-013: response after overview navigation never installs the obsolete result', async () => {
    let resolve!: (v: Envelope<ReadingScope>) => void;
    const read = vi.fn(async (path: string) => path.startsWith('/api/draft-check/') ? new Promise<Envelope<ReadingScope>>(r => { resolve = r; })
      : selected());
    render(<App compact transport={read as ReadTransport} initialRunId="run-a"/>);
    fireEvent.click(await screen.findByRole('button', { name: 'Entwurf prüfen' }));
    await screen.findByText('Prüfung läuft');
    fireEvent.click(screen.getByRole('button', { name: 'Alle Vorhaben' }));
    await act(async () => resolve(selected('run-a', true)));
    expect(screen.queryByText('Entwurfsprüfung bestanden')).toBeNull();
  });
  it('SCN-012: busy offers deliberate retry, reload leaves the new observation unchecked', async () => {
    let checks = 0;
    const read = vi.fn(async (path: string) => path.startsWith('/api/draft-check/')
      ? ++checks === 1 ? { ...selected(), state: 'blocked', code: 'busy', data: null } : selected('run-a', true) : selected());
    render(<App transport={read as ReadTransport} initialRunId="run-a"/>);
    fireEvent.click(await screen.findByRole('button', { name: 'Entwurf prüfen' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Prüfung wiederholen' }));
    await screen.findByText('Entwurfsprüfung bestanden');
    fireEvent.click(screen.getByRole('button', { name: /Neu laden|Aktualisieren/ }));
    await screen.findByText('Noch nicht geprüft'); expect(checks).toBe(2);
  });
  it('SCN-011/019/020: rejects inconsistent, partial, authority-changing and empty synthetic success; old detail stays readable', () => {
    const passed = selected('run-a', true);
    expect(() => validateData(`/api/draft-check/run-a?snapshot=${snapshot}&gate=PRD&expected_revision=${revision}`, passed)).not.toThrow();
    const draft = (passed.data as { run: { draft_check: DraftCheckData } }).run.draft_check;
    for (const alter of [(v: DraftCheckData) => { v.result!.authorizes = true as false; }, (v: DraftCheckData) => { v.result!.checks = []; },
      (v: DraftCheckData) => { v.source.artifact_digest = 'sha256:' + 'b'.repeat(64); }, (v: DraftCheckData) => { v.result!.run_id = 'foreign'; },
      (v: DraftCheckData) => { delete (v as Partial<DraftCheckData>).result; }, (v: DraftCheckData) => { v.result!.ready = false; }]) {
      const malformed = structuredClone(draft); alter(malformed); expect(validDraftCheck(malformed, 'run-a', revision)).toBe(false);
    }
    expect(() => validateData('/api/runs/run-a?snapshot=' + snapshot, runScope(runData('run-a')))).not.toThrow();
  });
  it('SCN-009/014: an unresponsive transport leaves finite explained state and cannot later publish success', async () => {
    let resolve!: (v: Envelope<ReadingScope>) => void;
    const read = vi.fn(async (path: string) => path.startsWith('/api/draft-check/') ? new Promise<Envelope<ReadingScope>>(r => { resolve = r; }) : selected());
    render(<App transport={read as ReadTransport} initialRunId="run-a"/>);
    const button = await screen.findByRole('button', { name: 'Entwurf prüfen' }); vi.useFakeTimers();
    fireEvent.click(button); await act(async () => {});
    await act(async () => { vi.advanceTimersByTime(12_000); });
    expect(screen.queryByText('Prüfung läuft')).toBeNull();
    expect(screen.getByRole('button', { name: 'Stand neu laden' })).toBeTruthy();
    await act(async () => resolve(selected('run-a', true)));
    expect(screen.queryByText('Entwurfsprüfung bestanden')).toBeNull();
  });
  it('SCN-013/015: central commit rejects stale snapshot, foreign target and replaced source', () => {
    const scope = selected(), detail = { ...scope, data: (scope.data as { run: ReturnType<typeof runData> }).run };
    const current = readingReducer(readingReducer(initialState, { type: 'begin', generation: 1, route: { view: 'detail', runId: 'run-a' } }),
      { type: 'ready', generation: 1, route: { view: 'detail', runId: 'run-a' }, scope, detail, inventory: null, document: null });
    const checked = selected('run-a', true), result = { ...checked, data: (checked.data as { run: ReturnType<typeof runData> }).run };
    const action = { type: 'draft-check' as const, generation: 1, snapshot, scope: checked, detail: result };
    expect(readingReducer(current, action).detail).toBe(result);
    expect(readingReducer(current, { ...action, snapshot: 'foreign' })).toBe(current);
    expect(readingReducer({ ...current, stale: true }, action)).toBeDefined();
    expect(readingReducer(current, { ...action, scope: { ...checked, target: { ...checked.target, target_id: 'foreign' } } })).toBe(current);
  });
});
