import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { WorkStep } from '../src/WorkStep';
import type { Detail } from '../src/types';
const source={resource_id:'opaque-cd',run_id:'run',type:'CD+Tests',path:null,registered_reference:'evidence.md',status:'registered'};
const data:Detail={run_id:'run',revision_id:'revision',lifecycle:'active',resources:[source],evaluation:{status:'open',current_gate:'CD+Tests',blocking_reason:'none',missing_approval:'none',next_allowed_action:'Implement and test',next_action_de:'Umsetzung und Prüfung abschließen.',doctor_status:'pass',quality_outlook:'',git_evidence:'unavailable',diagnostics:[],approvals:[{gate:'TP',status:'approved',evidence:'Bound TP approval'}],missing_evidence:[{missing_evidence:'Native Anzeige prüfen',impact:'Aktueller Build noch nicht im Host bestätigt.',required_next_step:'Neue Karte öffnen und prüfen.'}]}};
afterEach(cleanup);
it('joins the current action, recorded prerequisites and original evidence in one unit and opens only the registered opaque source',()=>{
 const open=vi.fn();render(<WorkStep data={data} onOpen={open}/>);
 const unit=screen.getByRole('region',{name:'So geht dein Vorhaben weiter'}), q=within(unit);
 expect(q.getByText('Umsetzung und Prüfung abschließen.')).toBeTruthy();expect(q.getByText('Die Kontrollauswertung weist diesen Schritt als offen aus.')).toBeTruthy();
 expect(q.getByText('Native Anzeige prüfen')).toBeTruthy();expect(q.getByText('Aktueller Build noch nicht im Host bestätigt.')).toBeTruthy();expect(q.getByText(/Neue Karte öffnen und prüfen/)).toBeTruthy();
 fireEvent.click(q.getByRole('button',{name:'Umsetzungs- und Prüfnachweise öffnen'}));expect(open).toHaveBeenCalledWith(source);
 expect(q.queryByText('Vor der Weiterarbeit zu klären:')).toBeNull();
});
it('recorded approvals never turn a Core blocker or missing approval into an open beginning',()=>{
 render(<WorkStep data={{...data,evaluation:{...data.evaluation!,blocking_reason:'source_changed',missing_approval:'Approval: QA'}}}/>);
 expect(screen.getByText('Vor der Weiterarbeit zu klären:')).toBeTruthy();expect(screen.getByText('source_changed')).toBeTruthy();expect(screen.getByText('Approval: QA')).toBeTruthy();
 expect(screen.queryByText('Die Kontrollauswertung weist diesen Schritt als offen aus.')).toBeNull();expect(screen.getByText(/Gespeicherte Freigaben · TP/)).toBeTruthy();
});
it.each([{current:false,status:'open',doctor:'pass'},{current:true,status:'blocked',doctor:'pass'},{current:true,status:'open',doctor:'error'}])('keeps incomplete or unavailable control qualification explicit: %j',({current,status,doctor})=>{
 render(<WorkStep data={{...data,evaluation:{...data.evaluation!,status,doctor_status:doctor}}} current={current}/>);
 expect(screen.queryByText('Die Kontrollauswertung weist diesen Schritt als offen aus.')).toBeNull();
 expect(screen.getByText(current ? /Beginn nicht bestätigt/ : /Kontrollstand nicht vollständig bestätigt/)).toBeTruthy();
});
it('unknown evidence remains visible and does not invent a document or an output classification',()=>{
 render(<WorkStep data={{...data,resources:[],evaluation:{...data.evaluation!,missing_evidence:[{future_field:'Original unknown evidence'},'Original string evidence']}}} onOpen={vi.fn()}/>);
 expect(screen.getByText('Original string evidence')).toBeTruthy();expect(screen.getByText(/Original unknown evidence/)).toBeTruthy();expect(screen.getByText('Keine registrierte Nachweisquelle für diesen Schritt verfügbar.')).toBeTruthy();
 expect(screen.queryByRole('button')).toBeNull();
});
it('a missing evaluation keeps the explicit read-navigation action available',()=>{
 render(<WorkStep data={{...data,evaluation:undefined}}><button>Run ansehen</button></WorkStep>);
 expect(screen.getByRole('button',{name:'Run ansehen'})).toBeTruthy();expect(screen.queryByRole('region')).toBeNull();
});
