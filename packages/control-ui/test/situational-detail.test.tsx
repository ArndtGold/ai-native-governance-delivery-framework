import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { focusSituation, RunDetail } from '../src/RunDetail';
import { backlog, runData } from './scoped-fixtures';

afterEach(cleanup);
const base = () => {
  const data = runData('run-a');
  return { ...data, resources: [{ resource_id:'ur-source', run_id:'run-a', type:'UR', path:'UR.md', registered_reference:'UR.md', status:'registered' }],
    persisted: { ...data.persisted!, current_gate:'UR' }, evaluation: { ...data.evaluation!, current_gate:'UR', blocking_reason:'none', missing_approval:'Approval: UR', control_assessment:{ state:'blocked' as const, authorizes:false as const } } };
};
it('puts the actual current source first for a pending approval and opens that exact source', () => {
  const data = base(), onOpen = vi.fn();
  render(<RunDetail result={{ ...backlog(), data }} onOpen={onOpen} draftCheck={<section aria-label="Entwurfsprüfung">Prüfstand</section>}/>);
  const focus = screen.getByRole('region', { name:'So geht dein Vorhaben weiter' });
  expect(within(focus).getByText('Nutzeranforderungen · UR')).toBeTruthy();
  expect(within(focus).getByRole('heading', { name:'Freigabe erforderlich' })).toBeTruthy();
  expect(screen.getByText('Eine Vorschau ist hier nicht verfügbar.')).toBeTruthy();
  expect(screen.queryByText('Weitere Informationen')).toBeNull();
  fireEvent.click(within(focus).getByRole('button', { name:'Aktuelle Fassung ansehen: Anforderungen' }));
  expect(onOpen).toHaveBeenCalledWith(data.resources[0], 'document:ur-source');
  expect(screen.getByRole('region', { name:'So geht dein Vorhaben weiter' })).toBeTruthy();
});
it('keeps absent and mismatched sources honest and never focuses an unconfirmed observation', () => {
  const data = base();
  expect(focusSituation(data, false).kind).toBe('unconfirmed');
  expect(focusSituation({ ...data, persisted:{ ...data.persisted, current_gate:'SD' } }, true).kind).toBe('unconfirmed');
  render(<RunDetail result={{ ...backlog(), data:{ ...data, resources:[] } }} onOpen={vi.fn()}/>);
  expect(screen.getByText('Für diesen Schritt ist kein Dokument registriert.')).toBeTruthy();
  expect(within(screen.getByRole('region', { name:'So geht dein Vorhaben weiter' })).queryByRole('button')).toBeNull();
});
it('routes blocker, building and confirmed completion without inferring a document or success', () => {
  const data = base(), e = data.evaluation;
  expect(focusSituation({ ...data, evaluation:{ ...e, missing_approval:'none', blocking_reason:'failure' } }, true).kind).toBe('blocked');
  expect(focusSituation({ ...data, evaluation:{ ...e, missing_approval:'none', blocking_reason:'AGDF_UR_REQUIREMENTS_INCOMPLETE' } }, true).kind).toBe('authoring');
  const building = { ...data, persisted:{ ...data.persisted, current_gate:'CD+Tests' }, evaluation:{ ...e, current_gate:'CD+Tests', missing_approval:'none', control_assessment:{state:'open' as const, authorizes:false as const} } };
  expect(focusSituation(building, true).kind).toBe('building');
  const completed = { ...building, evaluation:{ ...building.evaluation, control_assessment:{state:'completed' as const, authorizes:false as const} } };
  expect(focusSituation(completed, true).kind).not.toBe('completed');
  expect(focusSituation({ ...completed, evaluation:{ ...completed.evaluation, completion:{ status:'completed', gate:'OR', fulfilled:true } } }, true).kind).toBe('completed');
});

it('folds supporting sources while keeping actual missing evidence visible', () => {
  const data = base();
  data.evaluation.missing_evidence = [{ missing_evidence: 'Prüfbericht fehlt', required_next_step: 'Bericht ergänzen' }];
  render(<RunDetail result={{ ...backlog(), data }} onOpen={vi.fn()} technicalContext={<p>Verknüpfter Kontext</p>}/>);
  expect(screen.queryByText('Weitere Informationen')).toBeNull();
  expect(within(screen.getByRole('region', { name:'Offene Nachweise' })).getByText('Prüfbericht fehlt')).toBeTruthy();
  expect(within(screen.getByRole('region', { name:'Offene Nachweise' })).getByText('Bericht ergänzen')).toBeTruthy();
  cleanup();
  render(<RunDetail result={{ ...backlog(), data }} onOpen={vi.fn()} technicalView technicalContext={<p>Verknüpfter Kontext</p>}/>);
  expect(screen.getByText('Verknüpfter Kontext')).toBeTruthy();
  expect(screen.getByRole('heading', {name:'Nachweise'})).toBeTruthy();
});

it.each([['UR','Nutzeranforderungen · UR'], ['PRD','Produktanforderungen · PRD'], ['SD','Systemdesign · SD'], ['TP','Arbeits- und Testplan · TP']])('shows the named current %s work step', (gate, expected) => {
  const data = base();
  data.persisted.current_gate = gate; data.evaluation.current_gate = gate; data.evaluation.missing_approval = `Approval: ${gate}`;
  render(<RunDetail result={{ ...backlog(), data }} onOpen={vi.fn()}/>);
  expect(screen.getByText(expected)).toBeTruthy();
});
it('does not present a stale gate as current or enable its document action', () => {
  const data = base();
  render(<RunDetail result={{ ...backlog(), data }} onOpen={vi.fn()} current={false}/>);
  expect(screen.getByText('Zuletzt beobachteter Schritt: Nutzeranforderungen · UR')).toBeTruthy();
  expect(screen.queryByRole('button', {name:'Aktuelle Fassung ansehen: Anforderungen'})).toBeNull();
  expect(screen.getByRole('heading', {name:'Aktuelle Voraussetzungen nicht bestätigt'})).toBeTruthy();
});
