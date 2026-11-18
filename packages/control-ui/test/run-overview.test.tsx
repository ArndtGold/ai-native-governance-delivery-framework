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
function chooseArea(name:RegExp){fireEvent.click(screen.getByRole('combobox',{name:'Bestandsbereich'}));fireEvent.click(screen.getByRole('option',{name}));}
it('filters runs by lifecycle and resets it on section change',async()=>{
  const result=inventory();result.data!.runs[1].attention={code:'blocked',label:'Freigabe erforderlich'};
  render(<App transport={vi.fn(async()=>result) as unknown as ReadTransport}/>);
  await screen.findByRole('button',{name:'run-a'});
  const filter=screen.getByRole('combobox',{name:'Lifecycle'});
  fireEvent.keyDown(filter,{key:'ArrowDown'});expect(filter.getAttribute('aria-expanded')).toBe('true');
  fireEvent.keyDown(filter,{key:'ArrowDown'});fireEvent.keyDown(filter,{key:'ArrowDown'});fireEvent.keyDown(filter,{key:'Enter'});
  expect(screen.queryByRole('button',{name:'run-a'})).toBeNull();
  expect(screen.getByRole('button',{name:'done'})).toBeTruthy();
  expect(document.querySelectorAll('.undertaking-list > li')).toHaveLength(1);
  fireEvent.click(filter);expect(screen.getByRole('option',{name:'Abgeschlossen'}).getAttribute('aria-selected')).toBe('true');
  fireEvent.keyDown(filter,{key:'Escape'});expect(screen.queryByRole('listbox')).toBeNull();
  chooseArea(/^Geplant/);
  expect(screen.queryByRole('combobox',{name:'Lifecycle'})).toBeNull();
  expect(screen.getByText('Dieser Bereich ist in diesem Datenstand nicht verfügbar.')).toBeTruthy();
  chooseArea(/^Runs/);
  expect(screen.getByRole('combobox',{name:'Lifecycle'}).textContent).toContain('Alle');
});
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
    expect((await screen.findByRole('button', { name: 'run-a' }) as HTMLButtonElement).disabled).toBe(false);
    const diagnostic = screen.getByRole('button', { name: invalid.run_id });
    expect((diagnostic as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(diagnostic);
    expect(vi.mocked(read).mock.calls.some(([path]) => path.startsWith('/api/runs/'))).toBe(false);
    expect(screen.getByText(/Bestand eingeschränkt lesbar/)).toBeTruthy();
  });
  it(`Run membership/search/history and exact return remain coherent (${compact ? 'compact' : 'desktop'})`, async () => {
    const read = vi.fn(async (path: string) => path.startsWith('/api/runs/') ? runScope(runData('run-a', 'Angebote vergleichen')) : inventory()) as unknown as ReadTransport;
    render(<App compact={compact} transport={read}/>);
    const title = await screen.findByRole('button', { name: 'run-a' });
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'run-a' } });
    expect(document.querySelectorAll('.undertaking-list > li')).toHaveLength(1);
    title.focus(); fireEvent.click(title);
    await screen.findByRole('button', { name: 'Alle Vorhaben' });
    fireEvent.click(screen.getByRole('button', { name: 'Alle Vorhaben' }));
    await screen.findByRole('button', { name: 'run-a' });
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'run-a' })));
    expect(screen.queryByText(/nicht mehr im gelesenen Bestand/)).toBeNull();
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('run-a');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('combobox',{name:'Lifecycle'}));
    fireEvent.click(screen.getByRole('option',{name:'Abgeschlossen'}));
    expect(screen.getByRole('button', { name: 'done' })).toBeTruthy();
    expect(vi.mocked(read).mock.calls.some(([path]) => path.includes('backlog-titles'))).toBe(false);
  });
  it(`current inventory offers no retired legacy selector (${compact ? 'compact' : 'desktop'})`, async () => {
    const read = vi.fn(async () => inventory()) as unknown as ReadTransport;
    render(<App compact={compact} transport={read}/>);
    await screen.findByRole('button', { name: 'run-a' });
    expect(screen.queryByRole('button', { name: 'Legacy-Backlog' })).toBeNull();
    expect(vi.mocked(read).mock.calls.every(([path]) => !path.includes('legacy'))).toBe(true);
  });
}
it('Cockpit v2 rejects old envelopes and unknown scope kinds without changing nested evidence versions', () => {
  expect(() => validateEnvelope({ ...inventory(), schema_version: '1' })).toThrow('dto_invalid');
  expect(() => validateData('/api/snapshot', { ...inventory(), data: { kind: 'invented' } } as Envelope<unknown>)).toThrow('dto_invalid');
});
