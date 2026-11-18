import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { focusSituation, RunDetail } from '../src/RunDetail';
import type { Detail } from '../src/types';
import { backlog, runData } from './scoped-fixtures';

afterEach(cleanup);
const base = (): Detail & { persisted: NonNullable<Detail['persisted']>; evaluation: NonNullable<Detail['evaluation']> } => {
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
it('does not claim the current draft is ready for a different approval', () => {
  const data = base(); data.evaluation.missing_approval = 'Approval: PRD';
  render(<RunDetail result={{ ...backlog(), data }} onOpen={vi.fn()}/>);
  expect(screen.queryByRole('heading', { name:'Freigabe erforderlich' })).toBeNull();
  expect(screen.queryByText(/Sieh dir die aktuelle Fassung an/)).toBeNull();
});
it('routes blocker, building and confirmed completion without inferring a document or success', () => {
  const data = base(), e = data.evaluation;
  expect(focusSituation({ ...data, evaluation:{ ...e, missing_approval:'none', blocking_reason:'failure' } }, true).kind).toBe('blocked');
  expect(focusSituation({ ...data, evaluation:{ ...e, missing_approval:'none', blocking_reason:'AGDF_UR_REQUIREMENTS_INCOMPLETE' } }, true).kind).toBe('clarification');
  const building = { ...data, persisted:{ ...data.persisted, current_gate:'CD+Tests' }, evaluation:{ ...e, current_gate:'CD+Tests', missing_approval:'none', control_assessment:{state:'open' as const, authorizes:false as const} } };
  expect(focusSituation(building, true).kind).toBe('building');
  const completed = { ...building, evaluation:{ ...building.evaluation, control_assessment:{state:'completed' as const, authorizes:false as const} } };
  expect(focusSituation(completed, true).kind).not.toBe('completed');
  expect(focusSituation({ ...completed, evaluation:{ ...completed.evaluation, completion:{ status:'completed', gate:'OR', fulfilled:true } } }, true).kind).toBe('completed');
});

it('prioritizes clarification and keeps the original next action without inventing questions', () => {
  const data = base();
  data.evaluation = { ...data.evaluation, missing_approval:'none', blocking_reason:'AGDF_UR_REQUIREMENTS_INCOMPLETE', next_action_de:'Zielgruppe gemeinsam klären.' };
  render(<RunDetail result={{ ...backlog(), data }} onOpen={vi.fn()}/>);
  expect(screen.getByRole('heading',{name:'Klärung erforderlich'})).toBeTruthy();
  expect(screen.getByText('Zielgruppe gemeinsam klären.')).toBeTruthy();
  expect(screen.getByText('Eine Vorschau ist hier nicht verfügbar.')).toBeTruthy();
});
it('uses the current implementation action and does not claim unconfirmed completion', () => {
  const data = base();
  data.persisted.current_gate = 'CD+Tests'; data.evaluation.current_gate = 'CD+Tests';
  data.evaluation.missing_approval = 'none'; data.evaluation.control_assessment = {state:'open',authorizes:false};
  const view = render(<RunDetail result={{...backlog(),data}} onOpen={vi.fn()}/>);
  expect(screen.getByRole('heading',{name:'In Umsetzung'})).toBeTruthy();
  expect(screen.getByText('Freigegebenen Umfang umsetzen.')).toBeTruthy();
  data.evaluation.control_assessment = {state:'completed',authorizes:false};
  view.rerender(<RunDetail result={{...backlog(),data:{...data}}} onOpen={vi.fn()}/>);
  expect(screen.queryByRole('heading',{name:'Vorhaben abgeschlossen'})).toBeNull();
  expect(screen.getByRole('heading',{name:'Aktuelle Voraussetzungen nicht bestätigt'})).toBeTruthy();
});
it('shows only registered completion sources for a confirmed completed Run', () => {
  const data = base();
  data.evaluation.control_assessment = {state:'completed',authorizes:false};
  data.evaluation.completion = {status:'completed',gate:'OR',fulfilled:true};
  data.resources.push({resource_id:'qa',run_id:'run-a',type:'QA',path:'QA.md',registered_reference:'QA.md',status:'registered'});
  data.resources.push({resource_id:'other',run_id:'other',type:'OR',path:'OR.md',registered_reference:'OR.md',status:'registered'});
  const open=vi.fn(); render(<RunDetail result={{...backlog(),data}} onOpen={open}/>);
  expect(screen.getByRole('heading',{name:'Vorhaben abgeschlossen'})).toBeTruthy();
  const sources=screen.getByRole('region',{name:'Abschlussquellen'});
  fireEvent.click(within(sources).getByRole('button',{name:'Qualitätsprüfung öffnen'}));
  expect(open).toHaveBeenCalledWith(data.resources[1]);
  expect(within(sources).queryByRole('button',{name:'Abschlussnachweise öffnen'})).toBeNull();
});
it('does not offer an unavailable completion source', () => {
  const data = base(); data.evaluation.control_assessment = {state:'completed',authorizes:false};
  data.evaluation.completion = {status:'completed',gate:'OR',fulfilled:true};
  data.resources.push({resource_id:'qa',run_id:'run-a',type:'QA',path:null,registered_reference:'outside.md',status:'blocked'});
  render(<RunDetail result={{...backlog(),data}} onOpen={vi.fn()}/>);
  const sources=screen.getByRole('region',{name:'Abschlussquellen'});
  expect(within(sources).getByText('Registrierte Abschlussquellen sind nicht verfügbar.')).toBeTruthy();
  expect(within(sources).queryByRole('button')).toBeNull();
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
