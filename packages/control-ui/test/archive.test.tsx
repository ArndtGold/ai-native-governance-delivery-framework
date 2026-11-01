import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { Overview } from '../src/Overview';
import { ArchiveDetail } from '../src/ArchiveDetail';
import { validateData } from '../src/api';
import type { ArchiveData, Envelope } from '../src/types';
import { backlog, pointer, fixtureMeta } from './scoped-fixtures';
afterEach(cleanup);
const resource = { resource_id: '00000000-0000-4000-8000-000000000001', original_path: '.agdf/control/artefacts/old-run/UR.md',
  path: '.agdf/control/archive/source/runs/old-run/documents/UR.md', digest: 'sha256:'+'a'.repeat(64), bytes: 9 };
const data: ArchiveData = { kind: 'archive', entry: { id: 'old-run', title: 'Historisches Vorhaben', entry_kind: 'run', recorded_lifecycle: 'completed', recorded_gate: 'OR', source_control_version: '2',
  recorded_approvals: [{ gate: 'UR', status: 'approved', evidence: 'Original reply retained' }], resources: [resource], authorizes: false }, document: null };
const envelope = (value = data): Envelope<ArchiveData> => ({ ...fixtureMeta, data: value });
it('archived work is shown in archive, opens read-only and never navigates to current Run actions', async () => {
  const row = { ...pointer('old-run', 'Historisches Vorhaben'), kind: 'archive' as const, identity: 'archive/old-run', section: 'archive', row_id: resource.resource_id };
  const onSelect = vi.fn(), load = vi.fn(async () => envelope());
  const result = backlog([row]); validateData('/api/snapshot', result);
  render(<Overview result={result} view={{ section: 'archive', filter: '' }} onSelect={onSelect} loadArchive={load}/>);
  fireEvent.click(screen.getByRole('button', { name: 'Historisches Vorhaben' }));
  await screen.findByRole('heading', { level: 2, name: 'Historisches Vorhaben' });
  expect(screen.getByText(/Keine aktuelle Freigabe/)).toBeTruthy();
  expect(screen.getByText('completed')).toBeTruthy(); expect(screen.getByText('OR')).toBeTruthy();
  expect(onSelect).not.toHaveBeenCalled(); expect(load).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Archiv schließen' }));
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Historisches Vorhaben' }));
  expect(screen.queryByRole('button', { name: /freigeben|approve|fortsetzen/i })).toBeNull();
});
it('documents are escaped and a stale/failed read cannot keep the previous document visible', async () => {
  let reads = 0;
  const load = vi.fn(async (_row: string, id: string | undefined) => {
    if (!id) return envelope();
    if (++reads > 1) return { ...envelope(), data: null, state: 'blocked' as const, code: 'source_changed' };
    return envelope({ ...data, document: { resource_id: id, available: true, path: resource.original_path, digest: resource.digest, bytes: 9, content: '<script>x</script>' } });
  });
  render(<ArchiveDetail rowId={resource.resource_id} load={load} onClose={vi.fn()}/>);
  const select = await screen.findByRole('combobox', { name: 'Archivdokument' });
  fireEvent.change(select, { target: { value: resource.resource_id } }); await screen.findByText('<script>x</script>');
  expect(document.querySelector('script')).toBeNull();
  fireEvent.change(select, { target: { value: resource.resource_id } }); await screen.findByRole('alert');
  expect(screen.queryByText('<script>x</script>')).toBeNull();
});
it('archive DTO requires explicit non-authority and document association', () => {
  expect(() => validateData('/api/archive/'+resource.resource_id, envelope())).not.toThrow();
  expect(() => validateData('/api/archive/'+resource.resource_id, envelope({ ...data, entry: { ...data.entry, authorizes: true } } as unknown as ArchiveData))).toThrow();
  expect(() => validateData('/api/archive/'+resource.resource_id, envelope({ ...data, document: { resource_id: resource.resource_id, available: true, path: 'foreign', digest: resource.digest, bytes: 9, content: 'foreign' } }))).toThrow();
});
