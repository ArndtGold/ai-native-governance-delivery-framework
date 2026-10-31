import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';
import { validateData, validateEnvelope, type ReadTransport } from '../src/api';
import type { Envelope, RunInventory, RunInventoryEntry } from '../src/types';
import { fixtureMeta, runData, runScope } from './scoped-fixtures';

const entry = (id: string, title: string, lifecycle = 'active'): RunInventoryEntry => ({
  run_id: id, title, title_source: 'objective', valid: true, selectable: true, lifecycle,
  attention: { code: lifecycle === 'active' ? 'in_progress' : 'none', label: lifecycle === 'active' ? 'in Arbeit' : 'Historie' },
  basis: 'Gespeicherter Stand der Revision 1, keine Live-Bewertung.', next_action: 'Quelle prüfen',
  path: `.agdf/control/runs/${id}/RUN_STATE.md`, revision_id: '00000000-0000-4000-8000-000000000001',
  last_activity: { at: null, source: 'none', precision: null }, findings: [],
});
const inventory = (): Envelope<RunInventory> => ({ ...fixtureMeta, data: {
  kind: 'runs', authorizes: false, state: 'complete', runs: [entry('run-a', 'Angebote vergleichen'), entry('run-b', 'Quellen zuordnen'), entry('done', 'Ergebnis erhalten', 'completed')],
  counts: { total: 3, lifecycle: { active: 2, completed: 1 }, attention: { in_progress: 2, none: 1 } },
  diagnostics: [], source_path: '.agdf/control/runs/', file_count: 3, byte_count: 100,
} });
afterEach(cleanup);
for (const compact of [false, true]) {
  it(`invalid directory identity remains diagnostic without hiding valid Runs (${compact ? 'compact' : 'desktop'})`, async () => {
    const result = inventory();
    const invalid = { ...entry('BAD NAME', 'Ungültiger Verzeichniseintrag'), valid: false, lifecycle: null, selectable: false,
      findings: [{ code: 'AGDF_RUN_PATH_INVALID' }] };
    result.data!.runs.push(invalid);
    result.data!.state = 'incomplete';
    result.data!.diagnostics = invalid.findings;
    result.data!.counts = { total: 4, lifecycle: { active: 2, completed: 1, invalid: 1 }, attention: { in_progress: 3, none: 1 } };
    expect(() => validateData('/api/snapshot', result)).not.toThrow();
    invalid.selectable = true;
    expect(() => validateData('/api/snapshot', result)).toThrow('dto_invalid');
    invalid.selectable = false; invalid.valid = true;
    expect(() => validateData('/api/snapshot', result)).toThrow('dto_invalid');
    invalid.valid = false;
    const read = vi.fn(async () => result) as unknown as ReadTransport;
    render(<App compact={compact} transport={read}/>);
    expect((await screen.findByRole('button', { name: 'Angebote vergleichen' }) as HTMLButtonElement).disabled).toBe(false);
    const diagnostic = screen.getByRole('button', { name: invalid.title });
    expect((diagnostic as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(diagnostic);
    expect(vi.mocked(read).mock.calls.some(([path]) => path.startsWith('/api/runs/'))).toBe(false);
    expect(screen.getByText(/Bestand eingeschränkt lesbar/)).toBeTruthy();
  });
  it(`Run membership/search/history and exact return remain coherent (${compact ? 'compact' : 'desktop'})`, async () => {
    const read = vi.fn(async (path: string) => path.startsWith('/api/runs/') ? runScope(runData('run-a', 'Angebote vergleichen')) : inventory()) as unknown as ReadTransport;
    render(<App compact={compact} transport={read}/>);
    const title = await screen.findByRole('button', { name: 'Angebote vergleichen' });
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'run-a' } });
    expect(screen.getByText('1 Treffer · Bereich: 2')).toBeTruthy();
    title.focus(); fireEvent.click(title);
    await screen.findByRole('button', { name: 'Alle Vorhaben' });
    fireEvent.click(screen.getByRole('button', { name: 'Alle Vorhaben' }));
    await screen.findByRole('button', { name: 'Angebote vergleichen' });
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Angebote vergleichen' })));
    expect(screen.queryByText(/nicht mehr im gelesenen Bestand/)).toBeNull();
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('run-a');
    fireEvent.click(screen.getByRole('button', { name: /^Historie / }));
    expect(screen.getByRole('button', { name: 'Ergebnis erhalten' })).toBeTruthy();
    expect(vi.mocked(read).mock.calls.some(([path]) => path.includes('backlog-titles'))).toBe(false);
  });
  it(`missing optional legacy source has its own view and safe return (${compact ? 'compact' : 'desktop'})`, async () => {
    const read = vi.fn(async (path: string) => path.includes('view=legacy')
      ? { ...fixtureMeta, state: 'missing', code: 'backlog_missing', data: null } : inventory()) as unknown as ReadTransport;
    render(<App compact={compact} transport={read}/>);
    await screen.findByRole('button', { name: 'Angebote vergleichen' });
    fireEvent.click(screen.getByRole('button', { name: 'Legacy-Backlog' }));
    await screen.findByText(/Das Masterbacklog fehlt/);
    expect(screen.queryByRole('button', { name: 'Angebote vergleichen' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: compact ? /^Runs$/ : /Run-Übersicht$/ }));
    const title = await screen.findByRole('button', { name: 'Angebote vergleichen' });
    expect((title as HTMLButtonElement).disabled).toBe(false);
  });
}
it('Cockpit v2 rejects old envelopes and unknown scope kinds without changing nested evidence versions', () => {
  expect(() => validateEnvelope({ ...inventory(), schema_version: '1' })).toThrow('dto_invalid');
  expect(() => validateData('/api/snapshot', { ...inventory(), data: { kind: 'invented' } } as Envelope<unknown>)).toThrow('dto_invalid');
});
