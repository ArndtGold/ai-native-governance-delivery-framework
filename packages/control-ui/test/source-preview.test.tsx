import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { SourcePreview } from '../src/SourcePreview';
import type { ReadTransport } from '../src/api';
import { fixtureMeta, runData } from './scoped-fixtures';

afterEach(cleanup);
function source(id: string, snapshot: string) {
  const resource = { resource_id:id, run_id:'run-a', type:'UR', path:'UR.md', registered_reference:'UR.md', status:'registered' };
  const data = { ...runData('run-a'), resources:[resource] };
  return { ...fixtureMeta, snapshot_id:snapshot, data };
}
function reply(result: ReturnType<typeof source>, content: string) {
  return { ...result, data:{ resource:result.data.resources[0], format:'markdown', content, content_digest:'a'.repeat(64), links:{} } };
}
it('shows source text only for the same current Run and ignores a late response from the previous capture', async () => {
  const a=source('source-a','snapshot-a'), b=source('source-b','snapshot-b');
  let resolveA!: (value: ReturnType<typeof reply>) => void;
  const read=vi.fn((path:string) => path.includes('source-a') ? new Promise(resolve => { resolveA=resolve; }) : Promise.resolve(reply(b,'# Zweite Fassung\n\nDas ist der aktuelle Entwurf.'))) as unknown as ReadTransport;
  const view=render(<SourcePreview result={a} gate="UR" read={read} current/>);
  await waitFor(()=>expect(resolveA).toBeTypeOf('function'));
  view.rerender(<SourcePreview result={b} gate="UR" read={read} current/>);
  expect(await screen.findByText('Das ist der aktuelle Entwurf.')).toBeTruthy();
  await act(async()=>resolveA(reply(a,'# Alte Fassung\n\nNicht mehr aktuell.')));
  expect(screen.queryByText('Nicht mehr aktuell.')).toBeNull();
  view.rerender(<SourcePreview result={b} gate="UR" read={read} current={false}/>);
  expect(screen.getByText(/Datenstand ist nicht aktuell/)).toBeTruthy();
  expect(screen.queryByText('Das ist der aktuelle Entwurf.')).toBeNull();
});
it('does not select an arbitrary source when multiple versions are registered', () => {
  const a=source('source-a','snapshot-a');
  a.data.resources.push({ ...a.data.resources[0], resource_id:'source-b', registered_reference:'other.md' });
  const read=vi.fn() as unknown as ReadTransport;
  render(<SourcePreview result={a} gate="UR" read={read} current/>);
  expect(screen.getByText(/Mehrere Quellen sind registriert/)).toBeTruthy(); expect(read).not.toHaveBeenCalled();
});

it('renders the source-bound structured summary provided by Core', async () => {
  const a=source('source-a','snapshot-a');
  const revision='11111111-1111-4111-8111-111111111111', digest='a'.repeat(64);
  a.data.revision_id=revision;
  const document_state={ schema_version:'1' as const, resource_id:'source-a',run_id:'run-a',revision_id:revision,type:'UR',registered_reference:'UR.md',source_state:'available' as const,content_digest:digest,state:'draft' as const,version_kind:'draft' as const,reason:null,recorded_approval:null,check:null,authorizes:false as const };
  a.data.document_states=[document_state];
  const content='Original document';
  const summary={state:'available' as const,gate:'UR',items:[{label:'Ziel',text:'Zieltext'},{label:'Umfang',text:'Nur dieses Vorhaben'},{label:'Abnahmesignal',text:'Sichtbar nach Übergang'}],markdown:'- Problem: Ausgangslage\n- Ziel: Zieltext',authorizes:false as const,run_id:'run-a',resource_id:'source-a',revision_id:revision,content_digest:digest};
  const read=vi.fn(async()=>({...reply(a,content),data:{...reply(a,content).data,document_state,cockpit_summary:summary}})) as unknown as ReadTransport;
  render(<SourcePreview compactSummary result={a} gate="UR" read={read} current/>);
  const region=await screen.findByLabelText('Zusammenfassung des Entwurfs');
  expect(within(region).getByText('Zieltext')).toBeTruthy();
  expect(within(region).getByText('Nur dieses Vorhaben')).toBeTruthy();
  expect(within(region).getByText('Sichtbar nach Übergang')).toBeTruthy();
  const more=within(region).getByText('Mehr anzeigen').closest('details')!; expect(more.open).toBe(false);
  fireEvent.click(within(region).getByText('Mehr anzeigen')); expect(within(more).getByText('Problem: Ausgangslage')).toBeTruthy();
});
it.each(['- Ziel: Eins\n- Ziel: Zwei\n- Umfang: U\n- Abnahme: A', '- Ziel: Eins\n- Umfang: U'])('does not fabricate structured fields without the Core projection', async lines => {
  const a=source('source-a','snapshot-a');
  const read=vi.fn(async()=>reply(a,`## AGDF Approval Summary (de; source=en)\n\n${lines}`)) as unknown as ReadTransport;
  render(<SourcePreview compactSummary result={a} gate="UR" read={read} current/>);
  const region=await screen.findByLabelText('Zusammenfassung des Entwurfs');
  expect(region.querySelector(':scope > ul')).toBeNull();
  expect(within(region).getByText('Zusammenfassung').closest('details')?.open).toBe(false);
});
it('rejects a structured summary bound to a different resource', async () => {
  const a=source('source-a','snapshot-a'), revision='11111111-1111-4111-8111-111111111111', digest='a'.repeat(64);
  a.data.revision_id=revision;
  const document_state={ schema_version:'1' as const, resource_id:'source-a',run_id:'run-a',revision_id:revision,type:'UR',registered_reference:'UR.md',source_state:'available' as const,content_digest:digest,state:'draft' as const,version_kind:'draft' as const,reason:null,recorded_approval:null,check:null,authorizes:false as const };
  a.data.document_states=[document_state];
  const cockpit_summary={state:'available' as const,gate:'UR',items:[{label:'Ziel',text:'Falsches Dokument'}],markdown:'- Ziel: Falsches Dokument',authorizes:false as const,run_id:'run-a',resource_id:'foreign',revision_id:revision,content_digest:digest};
  const read=vi.fn(async()=>({...reply(a,'Original'),data:{...reply(a,'Original').data,document_state,cockpit_summary}})) as unknown as ReadTransport;
  render(<SourcePreview compactSummary result={a} gate="UR" read={read} current/>);
  expect(await screen.findByText(/Vorschau ist nicht verfügbar/)).toBeTruthy();
  expect(screen.queryByText('Falsches Dokument')).toBeNull();
});
it.each([true, false])('shows only source-bound clarification points when present (%s)', async hasQuestions => {
  const a=source('source-a','snapshot-a'), revision='11111111-1111-4111-8111-111111111111', digest='a'.repeat(64);
  a.data.revision_id=revision;
  const document_state={ schema_version:'1' as const, resource_id:'source-a',run_id:'run-a',revision_id:revision,type:'UR',registered_reference:'UR.md',source_state:'available' as const,content_digest:digest,state:'draft' as const,version_kind:'draft' as const,reason:null,recorded_approval:null,check:null,authorizes:false as const };
  a.data.document_states=[document_state];
  const summary={state:'available' as const,gate:'UR',items:[{label:'Ziel',text:'Zieltext'}],markdown:hasQuestions ? '- Ziel: Zieltext\n- Offene Punkte: Wer darf freigeben?' : '- Ziel: Zieltext',authorizes:false as const,run_id:'run-a',resource_id:'source-a',revision_id:revision,content_digest:digest};
  const read=vi.fn(async()=>({...reply(a,'Original'),data:{...reply(a,'Original').data,document_state,cockpit_summary:summary}})) as unknown as ReadTransport;
  render(<SourcePreview compactSummary clarification result={a} gate="UR" read={read} current/>);
  const section=await screen.findByRole('region',{name:'Klärungspunkte'});
  expect(within(section).getByText(hasQuestions ? /Wer darf freigeben/ : /nicht verfügbar/)).toBeTruthy();
  expect(within(section).queryByText('Zieltext')).toBeNull();
});
it('can show a unique explicit questions section when no approved summary exists', async () => {
  const a=source('source-a','snapshot-a');
  const read=vi.fn(async()=>reply(a,'# UR\n\n## Offene Fragen\n\n- Wer darf freigeben?\n\n## Ziel\n\nEin anderes Ziel.')) as unknown as ReadTransport;
  render(<SourcePreview compactSummary clarification result={a} gate="UR" read={read} current/>);
  const section=await screen.findByRole('region',{name:'Klärungspunkte'});
  expect(within(section).getByText('Wer darf freigeben?')).toBeTruthy();
  expect(within(section).queryByText('Ein anderes Ziel.')).toBeNull();
});
