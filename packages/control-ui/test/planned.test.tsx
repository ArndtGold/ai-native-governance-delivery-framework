import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Overview } from '../src/Overview';
import { backlog, pointer } from './scoped-fixtures';
import type { PlannedDocument, Envelope } from '../src/types';
afterEach(cleanup);
it('shows a planned UR from its own source, preserves Core order, filters and opens no Run or approval', async () => {
  const a = { ...pointer('plan-a', 'Alpha'), section: 'planned', kind: 'planned' as const, identity: 'planned/plan-a',
    priority: 'high', source: { path: '.agdf/control/planned/plan-a/UR.md', digest: 'sha256:' + 'a'.repeat(64) },
    row_id: '00000000-0000-0000-0000-000000000001', coverage: 'draft', handoff_ready: false, actions: ['continue_planning'] };
  const b = { ...a, key: 'plan-b', original_key: 'plan-b', identity: 'planned/plan-b', title: 'Beta', row_id: '00000000-0000-0000-0000-000000000002' };
  const result = backlog([a, b]); result.data!.layout = 'run-folders-v1';
  const onSelect = vi.fn(), loadPlanned = vi.fn(async (_rowId: string, _signal: AbortSignal) => ({ ...result, data: { kind: 'planned',
    entry: { plan_id: 'plan-a', title: 'Alpha', priority: 'high', path: a.source.path, digest: a.source.digest,
      content: '# UR: Alpha\n\nOpen question <script>not executable</script>', readiness: { ready: false }, authorizes: false } } } as Envelope<PlannedDocument>));
  const view = render(<Overview result={result} view={{ section: 'planned', filter: '' }} onSelect={onSelect} loadPlanned={loadPlanned}/>);
  expect(screen.getAllByRole('heading', { level: 3 }).map(node => node.textContent)).toEqual(['Alpha', 'Beta']);
  fireEvent.click(screen.getByRole('button', { name: 'Alpha' }));
  expect(await screen.findByRole('article', { name: 'Geplante UR' })).toBeTruthy();
  expect(loadPlanned.mock.calls[0][0]).toBe(a.row_id); expect(onSelect).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: /approve|freigeben|starten/iu })).toBeNull();
  expect(view.container.querySelector('script')).toBeNull();
  view.rerender(<Overview result={result} view={{ section: 'planned', filter: 'Beta' }} onSelect={onSelect} current={false} loadPlanned={loadPlanned}/>);
  expect(screen.queryByRole('article', { name: 'Geplante UR' })).toBeNull();
  expect(screen.getAllByRole('heading', { level: 3 }).map(node => node.textContent)).toEqual(['Beta']);
  expect((screen.getByRole('button', { name: 'Beta' }) as HTMLButtonElement).disabled).toBe(true);
});
