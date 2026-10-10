import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COCKPIT_BACKLOG_SECTIONS as sections, projectCockpitList, backlogRowKey, hasConsistentBacklogCounts } from '../lib/control-inspect/cockpit-list.js';
const row = (key, section = sections[0], more = {}) => ({section,key,title:'[framework-maintenance] Work '+key,stored_status:'In progress',selectable:true,...more});
const inventory = (entries,diagnostics=[]) => ({entries,diagnostics,content_digest:'digest',source_path:'.agdf/control/MASTER_BACKLOG.md',counts:Object.fromEntries(sections.map(s=>[s,entries.filter(r=>r.section===s).length]))});
test('SCN-001/003: shared selected-area reverse order, Completed preserved, raw input and selectors immutable',()=>{
 const entries=[row('first'),row('plan',sections[1]),row('last',sections[0],{stored_status:'Completed',row_id:'opaque'})];
 const data=inventory(entries),before=JSON.stringify(data);entries.forEach(Object.freeze);Object.freeze(entries);Object.freeze(data);
 const list=projectCockpitList(data);
 assert.deepEqual(list.rows.map(r=>r.entry.key),['last','first']);assert.equal(list.sectionCount,2);assert.equal(list.coverage,'complete');
 assert.equal(list.rows[0].entry,entries[2]);assert.equal(list.rows[0].index,2);assert.equal(list.rows[0].entry.row_id,'opaque');assert.equal(list.rows[0].entry.stored_status,'Completed');assert.equal(JSON.stringify(data),before);
 for(const s of sections)assert.deepEqual(projectCockpitList(data,{section:s}).rows.map(r=>r.entry),entries.filter(r=>r.section===s).reverse());
});
test('SCN-005/006/011: stored title provenance, deterministic per-field search independent of heading, known prefix display only',()=>{
 const data=inventory([row('Alpha',sections[0],{title:'[external_delivery] BERATUNG',stored_status:'Completed',title_observation:{title:'Secret Heading'}})]);
 for(const query of [' beratung ','ALPHA',' completed ','[external_delivery]'])assert.equal(projectCockpitList(data,{query}).matchCount,1);
 for(const query of ['Secret','BERATUNG Alpha'])assert.equal(projectCockpitList(data,{query}).matchCount,0);
 const r=projectCockpitList(data).rows[0];assert.equal(r.displayTitle,'BERATUNG');assert.equal(r.provenance.originalTitle,'[external_delivery] BERATUNG');assert.equal(r.provenance.digest,'digest');
 data.entries[0].title='[unknown] Keep';assert.equal(projectCockpitList(data).rows[0].displayTitle,'[unknown] Keep');
});
test('SCN-007: source-bound original-position identity ignores metadata replacement, separates duplicates and source changes',()=>{
 const data=inventory([row('same'),row('same')]);const first=projectCockpitList(data).rows;
 const next=projectCockpitList({...data,entries:data.entries.map(r=>({...r,row_id:'replaced',title_observation:{title:'observed'}}))}).rows;
 assert.equal(first[0].identity,next[0].identity);assert.notEqual(first[0].identity,first[1].identity);
 assert.notEqual(first[0].identity,projectCockpitList({...data,content_digest:'new'}).rows[0].identity);
 assert.equal(first[0].identity,backlogRowKey(data.entries[1],1,'digest'));
});
test('SCN-002/015/016: missing/layout unavailable has null counts; unrelated diagnostics leave confirmed areas complete',()=>{
 const data=inventory([row('a')],[{code:'backlog_layout_unsupported',section:sections[1]}]);
 assert.equal(projectCockpitList(data).coverage,'complete');const missing=projectCockpitList(data,{section:sections[1]});assert.equal(missing.coverage,'unavailable');assert.equal(missing.sectionCount,null);assert.equal(missing.matchCount,null);
 delete data.counts[sections[2]];assert.equal(projectCockpitList(data,{section:sections[2]}).coverage,'unavailable');
 assert.equal(projectCockpitList(null).sectionCount,null);
});
test('SCN-015: cross-section duplicate disabled in selected area remains partial despite diagnostic on other occurrence',()=>{
 const data=inventory([row('dup',sections[0],{selectable:false}),row('dup',sections[1],{selectable:false})],[{code:'backlog_key_duplicate',section:sections[1],key:'dup'}]);
 assert.equal(projectCockpitList(data).coverage,'partial');assert.equal(projectCockpitList(data).rows[0].selectable,false);
 assert.equal(projectCockpitList(data,{query:'absent'}).coverage,'partial');assert.equal(projectCockpitList(data,{query:'absent'}).matchCount,0);
 assert.equal(projectCockpitList(inventory([row('a')],[{code:'unknown_issue'}])).coverage,'partial');
});
test('SCN-016: contradictory count, unknown section, missing populated area and invalid count reject data',()=>{
 for(const mutate of [d=>d.counts[sections[0]]++,d=>d.entries[0].section='Unknown',d=>delete d.counts[sections[0]],d=>d.counts[sections[1]]=-1]){
  const data=inventory([row('a')]);mutate(data);assert.equal(hasConsistentBacklogCounts(data),false);assert.throws(()=>projectCockpitList(data),/dto_invalid/);
 }
});
test('SCN-008/015: full-area search precedes view limit; complete empty/no-match have distinct query state',()=>{
 const data=inventory(Array.from({length:10},(_,i)=>row('item'+i)));const all=projectCockpitList(data);
 assert.equal(all.matchCount,10);assert.deepEqual(all.rows.slice(0,5).map(r=>r.entry.key),['item9','item8','item7','item6','item5']);
 assert.equal(projectCockpitList(data,{query:'item0'}).rows[0].entry.key,'item0');assert.equal(projectCockpitList(data,{query:'none'}).coverage,'complete');
 const empty=projectCockpitList(inventory([]));assert.equal(empty.sectionCount,0);assert.equal(empty.query,'');assert.equal(empty.coverage,'complete');
});
