import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { WorkStep } from '../src/WorkStep';
import type { Detail } from '../src/types';
import { validateData } from '../src/api';
const source={resource_id:'opaque-cd',run_id:'run',type:'CD+Tests',path:null,registered_reference:'evidence.md',status:'registered'};
const runSource={...source,resource_id:'opaque-state',type:'Run State'};
const data:Detail={run_id:'run',revision_id:'revision',lifecycle:'active',resources:[source,runSource],persisted:{current_gate:'CD+Tests',decision:'in_progress',next_allowed_action:'Implement and test',artefacts:[]},evaluation:{status:'open',control_assessment:{state:'open',authorizes:false},current_gate:'CD+Tests',blocking_reason:'none',missing_approval:'none',next_allowed_action:'Implement and test',next_action_de:'Umsetzung und Prüfung abschließen.',doctor_status:'warn',quality_outlook:'',git_evidence:'unavailable',diagnostics:[],approvals:[{gate:'TP',status:'approved',evidence:'Bound TP approval'}],missing_evidence:[{missing_evidence:'Native Anzeige prüfen',impact:'Aktueller Build noch nicht im Host bestätigt.',required_next_step:'Neue Karte öffnen und prüfen.'}]}};
afterEach(cleanup);
it('accepts current scoped Run DTOs but rejects malformed or authorizing assessment fields',()=>{
 const envelope={schema_version:'1' as const,target:{target_id:'target',display_path:'/fixture'},snapshot_id:'snapshot',observed_as_of:'now',source_digest:'digest',state:'available' as const,code:null,retryable:false,data:{kind:'run' as const,run:data}};
 expect(()=>validateData('/api/runs/run',envelope)).not.toThrow();
 expect(()=>validateData('/api/runs/run',{...envelope,data:{kind:'run',run:{...data,evaluation:{...data.evaluation!,control_assessment:undefined}}}})).not.toThrow();
 for(const assessment of [{state:'invented',authorizes:false},{state:'open',authorizes:true},null])
   expect(()=>validateData('/api/runs/run',{...envelope,data:{kind:'run',run:{...data,evaluation:{...data.evaluation!,control_assessment:assessment}}}})).toThrow('dto_invalid');
});
it('leads with saved state, Core assessment and the actual registered step source; all originals start closed',()=>{
 const open=vi.fn();render(<WorkStep data={data} compact onOpen={open}/>);
 expect(screen.getByText('Zuletzt als „In Arbeit“ gespeichert.')).toBeTruthy();
 expect(screen.getByText('Weiterarbeit offen')).toBeTruthy();expect(screen.getByText('Umsetzung und Prüfung abschließen.')).toBeTruthy();
 expect(Array.from(document.querySelectorAll('details')).every(d=>!d.open)).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Umsetzungs- und Prüfnachweise öffnen'}));expect(open).toHaveBeenCalledWith(source, 'step:opaque-cd');
 expect(document.querySelectorAll('button.primary')).toHaveLength(1);
 expect(screen.getByText('Nachweise und offene Punkte · 1')).toBeTruthy();expect(screen.getByText('Gespeicherte Freigaben · 1')).toBeTruthy();
 expect(screen.getByText('Umsetzungs- und Prüfplan · freigegeben')).toBeTruthy();
 // Exact original evidence remains recoverable, independently of its readable summary.
 expect(screen.getByText(/Aktueller Build noch nicht im Host bestätigt/)).toBeTruthy();
 expect(screen.getAllByText(/Neue Karte öffnen und prüfen/)).toHaveLength(2);
});
it('presents a Core blocker and missing approval without treating saved approvals as permission',()=>{
 const open=vi.fn();render(<WorkStep data={{...data,evaluation:{...data.evaluation!,control_assessment:{state:'blocked',authorizes:false},status:'blocked',blocking_reason:'source_changed',missing_approval:'Approval: QA'}}} onOpen={open}/>);
 expect(screen.getByText('Vor der Weiterarbeit klären')).toBeTruthy();expect(screen.getByText('source_changed')).toBeTruthy();expect(screen.getByText('Approval: QA')).toBeTruthy();
 expect(screen.queryByText('Weiterarbeit offen')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Stand des Vorhabens öffnen'}));expect(open).toHaveBeenCalledWith(runSource, 'step:opaque-state');
});
it.each(['stale','missing assessment','persisted mismatch'])('does not confirm current work from %s',kind=>{
 const changed={...data,evaluation:{...data.evaluation!,control_assessment:kind==='missing assessment'?undefined:data.evaluation!.control_assessment},persisted:kind==='persisted mismatch'?{...data.persisted!,current_gate:'QA'}:data.persisted};
 render(<WorkStep data={changed} current={kind!=='stale'} onOpen={vi.fn()}/>);
 expect(screen.getByText('Aktuelle Voraussetzungen nicht bestätigt')).toBeTruthy();expect(screen.queryByText('Weiterarbeit offen')).toBeNull();
 expect(screen.getByRole('button',{name:'Stand des Vorhabens öffnen'}).className).toContain('primary');
});
it('unknown evidence stays exact; foreign and blocked registrations are never usable sources',()=>{
 render(<WorkStep data={{...data,resources:[{...source,run_id:'foreign'},{...runSource,status:'blocked'}],evaluation:{...data.evaluation!,missing_evidence:[{future_field:'Original unknown evidence'},'Original string evidence']}}} onOpen={vi.fn()}/>);
 expect(screen.getAllByText('Original string evidence')).toHaveLength(2);expect(screen.getByText(/Original unknown evidence/)).toBeTruthy();
 expect(screen.getByText('Keine registrierte Nachweisquelle für diesen Schritt verfügbar.')).toBeTruthy();expect(screen.queryByRole('button')).toBeNull();
});
it('an expired reading view preserves originals but disables all source navigation',()=>{
 render(<WorkStep data={data} current={false} sourceDisabled onOpen={vi.fn()}/>);
 expect(Array.from(document.querySelectorAll('button')).every(b=>b.disabled)).toBe(true);
 expect(screen.getByText('Zuletzt als „In Arbeit“ gespeichert.')).toBeTruthy();
});
it('a missing evaluation preserves the explicit read-navigation action',()=>{
 render(<WorkStep data={{...data,evaluation:undefined}}><button>Run ansehen</button></WorkStep>);
 expect(screen.getByRole('button',{name:'Run ansehen'})).toBeTruthy();expect(screen.queryByRole('region')).toBeNull();
});
it('completed and zero-evidence observations never grant new permission',()=>{
 render(<WorkStep data={{...data,evaluation:{...data.evaluation!,control_assessment:{state:'completed',authorizes:false},missing_evidence:[]}}}/>);
 expect(screen.getByText('Vorhaben abgeschlossen')).toBeTruthy();expect(screen.getByText('Keine offenen Nachweise ausgewiesen.')).toBeTruthy();
 expect(screen.queryByText('Weiterarbeit offen')).toBeNull();
});
