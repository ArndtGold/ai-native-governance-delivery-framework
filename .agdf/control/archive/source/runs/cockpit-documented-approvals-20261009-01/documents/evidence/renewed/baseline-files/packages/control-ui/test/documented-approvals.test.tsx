import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DocumentedApprovals } from '../src/DocumentedApprovals';
import { WorkStep } from '../src/WorkStep';
import { runData } from './scoped-fixtures';
import type { Resource } from '../src/types';

afterEach(cleanup);
const gates = ['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT'];
const approvals = gates.map(gate => ({ gate, status: 'approved', evidence: `Original ${gate}` }));
const source: Resource = { resource_id: 'current-ur', type: 'UR', run_id: 'run', status: 'registered', path: null, registered_reference: 'UR.md' };

it.each([0, 4, 6])('SCN-001: counts %s recorded approvals, including later gates, without inventing pending approvals', count => {
  render(<DocumentedApprovals approvals={[...approvals.slice(0, count), { gate: 'OR', status: 'missing', evidence: '' }]} resources={[]} runId="run"/>);
  expect(screen.getByText(`Dokumentierte Freigaben · ${count}`)).toBeTruthy();
  expect(document.querySelectorAll('.documented-approval-row')).toHaveLength(count);
  expect(screen.queryByText('Keine Freigaben dokumentiert.') !== null).toBe(count === 0);
  expect(document.querySelectorAll('details[open]')).toHaveLength(0);
});

it('SCN-002: preserves raw long/misleading evidence as text and reports unavailable structured provenance', () => {
  const evidence = '<script>window.pwned=true</script> Owner: Alice; 2026-10-09; signed; UR.md sha256:1234 ' + 'Original '.repeat(70);
  render(<DocumentedApprovals approvals={[{ ...approvals[0], evidence }]} resources={[source]} runId="run" onOpen={vi.fn()}/>);
  expect(document.querySelector('.source-text')?.textContent).toBe(evidence);
  expect(screen.getByText('Keine bestätigte Identität verfügbar.')).toBeTruthy();
  expect(screen.getAllByText('Keine strukturierte Angabe verfügbar.')).toHaveLength(3);
  expect(screen.getByText('Nicht bestätigt.')).toBeTruthy();
  expect(document.querySelectorAll('.documented-approvals-note')).toHaveLength(1);
  expect(document.querySelectorAll('script')).toHaveLength(0);
  expect(screen.getByLabelText('Dokumentiert: Anforderungen').closest('details')?.open).toBe(false);
  expect(screen.queryByRole('button', { name: /^Freigegebene Fassung ansehen/ })).toBeNull();
});

it.each(['', '   '])('SCN-002: absent evidence does not remove a recorded approval (%j)', evidence => {
  render(<DocumentedApprovals approvals={[{ ...approvals[0], evidence }]} resources={[]} runId="run"/>);
  expect(screen.getByText('Dokumentierte Freigaben · 1')).toBeTruthy();
  expect(screen.getByText('Kein Originalnachweis verfügbar.')).toBeTruthy();
});

it('SCN-003/006: current actions pass each exact registered resource and existing return-focus origin', () => {
  const second = { ...source, resource_id: 'second', registered_reference: 'alternative/UR.md' }, open = vi.fn();
  render(<DocumentedApprovals approvals={[approvals[0]]} resources={[source, second]} runId="run" onOpen={open}/>);
  const actions = screen.getAllByRole('button', { name: /^Aktuelle Fassung ansehen: Anforderungen/ });
  expect(actions).toHaveLength(2); expect(document.querySelectorAll('.documented-approval-row')).toHaveLength(1);
  for (const [i, resource] of [source, second].entries()) {
    fireEvent.click(actions[i]); expect(open).toHaveBeenNthCalledWith(i + 1, resource, `approval:${resource.resource_id}`);
    expect(actions[i].getAttribute('data-focus-id')).toBe(`approval:${resource.resource_id}`);
    expect(screen.getByText(resource.registered_reference)).toBeTruthy();
  }
});

it.each(['missing', 'foreign', 'unregistered', 'blocked'])('SCN-005: %s resources cannot supply a working current-version action', kind => {
  const resources = kind === 'missing' ? [] : [{ ...source, ...(kind === 'foreign' ? { run_id: 'other' } : { status: kind }) }];
  render(<DocumentedApprovals approvals={[approvals[0]]} resources={resources} runId="run" onOpen={vi.fn()}/>);
  expect(screen.queryByRole('button')).toBeNull(); expect(screen.getByText('Aktuelle Fassung nicht verfügbar.')).toBeTruthy();
  expect(screen.getByText('Dokumentierte Freigaben · 1')).toBeTruthy();
});

it('SCN-005/010: disabled reading retains evidence but cannot invoke a callback or mutate supplied facts', () => {
  const open = vi.fn(), original = JSON.stringify({ approvals, source });
  render(<DocumentedApprovals approvals={approvals} resources={[source]} runId="run" onOpen={open} sourceDisabled/>);
  const action = screen.getByRole('button', { name: /^Aktuelle Fassung ansehen/ }) as HTMLButtonElement;
  expect(action.disabled).toBe(true); fireEvent.click(action); expect(open).not.toHaveBeenCalled();
  expect(JSON.stringify({ approvals, source })).toBe(original);
  expect(screen.getByText('Original UR')).toBeTruthy();
});

it('SCN-008: ordinary parent renders preserve open native disclosure and its identity', () => {
  const props = { approvals: [approvals[0]], resources: [source], runId: 'run', onOpen: vi.fn() };
  const view = render(<DocumentedApprovals {...props}/>);
  const details = screen.getByLabelText('Dokumentiert: Anforderungen').closest('details')!;
  details.open = true; view.rerender(<DocumentedApprovals {...props} approvals={[...props.approvals]}/>);
  expect(screen.getByLabelText('Dokumentiert: Anforderungen').closest('details')).toBe(details); expect(details.open).toBe(true);
});

it('SCN-010: current-control and neighboring draft action retain their independent slots', () => {
  const data = runData('run'); data.resources = [source]; data.evaluation!.approvals = [approvals[0]];
  const check = vi.fn(); render(<WorkStep data={data} onOpen={vi.fn()}><button onClick={check}>Entwurf prüfen</button></WorkStep>);
  expect(screen.getByText('Weiterarbeit offen')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Entwurf prüfen' }).closest('.work-step-approvals')).toBeNull();
  fireEvent.click(screen.getByLabelText('Dokumentiert: Anforderungen')); expect(check).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Entwurf prüfen' })); expect(check).toHaveBeenCalledTimes(1);
});
