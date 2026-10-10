import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { RunDocuments } from '../src/RunDocuments';
import { documentPresentation } from '../src/document-state';
import { documentFixture } from './scoped-fixtures';
import type { DocumentState, Detail } from '../src/types';
afterEach(cleanup);
it('SCN-001/015: multiple distinct references of one gate keep separate, disambiguated actions', () => {
  const data = documentFixture(), open = vi.fn();
  const extra = {...data.resources[0], resource_id:'UR-second', registered_reference:'.agdf/control/artefacts/fixture-a/'+'long-name-'.repeat(30)+'UR.md'};
  data.resources.push(extra);
  data.document_states!.push({...data.document_states![0],resource_id:extra.resource_id,registered_reference:extra.registered_reference});
  render(<RunDocuments data={data} onOpen={open}/>);
  expect(screen.getByText('Dokumente · 5')).toBeTruthy();
  const actions = screen.getAllByRole('button'); expect(actions).toHaveLength(5);
  fireEvent.click(actions[4]); expect(open).toHaveBeenCalledWith(extra,'document:UR-second');
  expect(actions[0].getAttribute('aria-label')).not.toBe(actions[4].getAttribute('aria-label'));
  expect(document.querySelectorAll('.run-document-row')).toHaveLength(5);
});
it('SCN-001/015: actual distinct registrations including drafts; no approval-only or filesystem-invented rows', () => {
  const data = documentFixture();
  data.evaluation!.approvals = [{gate:'UAT',status:'approved',evidence:'No registered UAT source'}];
  data.resources.push({...data.resources[0]}, {...data.resources[0],resource_id:'foreign',run_id:'foreign'}, {...data.resources[0],resource_id:'analysis',type:'Brownfield Analysis'});
  render(<RunDocuments data={data} onOpen={vi.fn()}/>);
  expect(screen.getByText('Dokumente · 4')).toBeTruthy(); expect(document.querySelectorAll('.run-document-row')).toHaveLength(4);
  expect(document.querySelectorAll('.run-document-row details')).toHaveLength(0);
  expect(screen.queryByText('Freigabe ansehen')).toBeNull(); expect(screen.queryByText('Abnahme')).toBeNull();
  expect(screen.getAllByText('Entwurf ansehen')).toHaveLength(4);
});
it('SCN-001/015: zero entries and blocked/missing rows are explicit, not working actions', () => {
  const data = documentFixture(); data.resources = []; const rendered = render(<RunDocuments data={data} onOpen={vi.fn()}/>);
  expect(screen.getByText('Dokumente · 0')).toBeTruthy(); expect(screen.getByText('Keine Dokumente registriert.')).toBeTruthy(); rendered.unmount();
  const blocked = documentFixture(); blocked.resources[0].status = 'blocked'; blocked.document_states![0].source_state = 'blocked';
  blocked.document_states![1].source_state = 'missing';
  render(<RunDocuments data={blocked} onOpen={vi.fn()}/>);
  expect(screen.getAllByText('Dokument nicht verfügbar.')).toHaveLength(2); expect(screen.getAllByRole('button')).toHaveLength(2);
});
it('SCN-003/016: contextual action passes exact current resource and document origin; refreshed logical row keeps its DOM', () => {
  const data = documentFixture(), open = vi.fn(), s = data.document_states![0];
  s.state = 'approved'; s.version_kind = 'approved'; s.recorded_approval = {status:'approved',evidence:'Original'};
  const rendered = render(<RunDocuments data={data} onOpen={open}/>);
  const action = screen.getByRole('button',{name:'Freigegebene Anforderungen ansehen: Anforderungen'});
  fireEvent.click(action); expect(open).toHaveBeenCalledWith(data.resources[0],'document:UR');
  const old = action.closest('li'); data.resources[0].resource_id = 'new-id'; s.resource_id = 'new-id';
  rendered.rerender(<RunDocuments data={data} onOpen={open}/>);
  expect(screen.getByRole('button',{name:'Freigegebene Anforderungen ansehen: Anforderungen'}).closest('li')).toBe(old);
  expect(action.getAttribute('data-focus-id')).toBe('document:new-id');
});
it.each(['approved','draft','draft_checked','revision_required','check_unavailable','approval_unconfirmed','unavailable'] as const)('SCN-015: %s has readable text/icon and truthful version action', state => {
  const data=documentFixture(), s=data.document_states![0]; s.state=state;
  s.version_kind=state==='approved'?'approved':state==='approval_unconfirmed'||state==='unavailable'?'current':'draft';
  render(<RunDocuments data={data} onOpen={vi.fn()}/>);
  const p=documentPresentation(s,'UR'); const row=document.querySelector('li')!;
  expect(within(row).getByText(p.text)).toBeTruthy(); expect(within(row).getByRole('button').textContent).toBe(p.action);
});
it('SCN-010/013: old server has uncertainty/current action; stale controls preserve observed limits and cannot navigate', () => {
  const data = documentFixture(); delete data.document_states;
  data.evaluation!.approvals = [{gate:'UR',status:'approved',evidence:'Original'}]; const open=vi.fn();
  const view=render(<RunDocuments data={data} onOpen={open}/>);
  expect(screen.getByText('Freigabe dieser Fassung nicht bestätigt')).toBeTruthy(); expect(screen.getAllByText('Aktuelle Fassung ansehen')).toHaveLength(4);
  view.rerender(<RunDocuments data={data} onOpen={open} current={false} sourceDisabled/>);
  expect(screen.getByText('Zuletzt beobachtet: Freigabe dieser Fassung nicht bestätigt')).toBeTruthy();
  fireEvent.click(screen.getAllByRole('button')[0]); expect(open).not.toHaveBeenCalled();
});
