import {test,expect} from '@playwright/test';
import * as fs from 'node:fs';
import {join,resolve} from 'node:path';
import {approvalFixture,treeBytes} from '../../../core/test/control-cockpit-fixtures.js';
import {artifactReadinessFixture,readyPrd} from '../../../core/test/fixtures/artifact-readiness.js';
import {upsertTableRow} from '../../../core/lib/control-state/run-state-edits.js';
import {sealRunState} from '../../../core/lib/control-state/run-seal.js';
import {startControlServer} from './server-fixture.mjs';
const evidence=resolve(process.env.AGDF_COCKPIT_BROWSER_EVIDENCE ?? '../../.agdf/control/artefacts/cockpit-documented-approvals-20261009-01/evidence/renewed/browser');
fs.mkdirSync(evidence,{recursive:true});
function pointer(f,run){fs.writeFileSync(join(f.root,'.agdf/control/MASTER_BACKLOG.md'),`# Master Backlog\n\n## Active Backlog\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n| 1 | ${run} | Browser document fixture | In progress | [UR](artefacts/${run}/UR.md) | UR | Read |\n\n## Planned / Parking Lot\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n\n## Completed / Superseded Pointers\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n`);}
async function open(page,service,route,run){
  await page.addInitScript(({secret,origin})=>{if(location.origin===origin)history.replaceState(null,'',location.pathname+'#'+secret);},{secret:service.secret,origin:service.origin});
  await page.goto(service.origin+route);await page.locator(`.run-link[data-focus-id="${run}"]`).click();
  if(route==='/card.html')await page.getByRole('button',{name:'Run ansehen',exact:true}).click();
  await expect(page.locator('.run-documents')).toBeVisible();
}
test('SCN-001/004/015/016: visible zero/four actual registrations and unconfirmed raw version retain passive original evidence',async({page})=>{
  for(const count of [0,4]){
    const f=await approvalFixture();expect(f.approve().outcome).toBe('approved');pointer(f,'fixture-a');
    let state=fs.readFileSync(f.runPath,'utf8');
    if(count===0)state=upsertTableRow(state,'Artefacts',0,'UR',['UR','','missing','No current registered document']);
    else {
      fs.writeFileSync(join(f.root,f.documentPath),'\ufeff'+fs.readFileSync(join(f.root,f.documentPath),'utf8').replaceAll('\n','\r\n'));
      for(const type of ['PRD','SD','TP']){const path=`.agdf/control/artefacts/fixture-a/${type}.md`;fs.writeFileSync(join(f.root,path),`# ${type}: Actual registered current draft\n`);state=upsertTableRow(state,'Artefacts',0,type,[type,path,'draft','Disposable current source']);}
    }
    fs.writeFileSync(f.runPath,sealRunState(f.root,state));const before=treeBytes(f.root),service=await startControlServer({dir:f.root});
    try{
      await open(page,service,'/','fixture-a');await expect(page.locator('.run-documents h3')).toHaveText(`Dokumente · ${count}`);await expect(page.locator('.run-document-row')).toHaveCount(count);
      if(count===0)await expect(page.getByText('Keine Dokumente registriert.',{exact:true})).toBeVisible();
      else{
        await expect(page.locator('.run-documents')).toContainText('Freigabe dieser Fassung nicht bestätigt');
        await expect(page.locator('.run-documents button').filter({hasText:'Freigegebene Anforderungen ansehen'})).toHaveCount(0);
        const source=page.getByRole('button',{name:'Aktuelle Fassung ansehen: Anforderungen',exact:true});await source.click();
        await expect(page.locator('.document-state-context')).toContainText('Approval: UR');await expect(page.locator('.document-state-context')).toContainText('Die genaue freigegebene Fassung ist nicht bestätigt.');
        await page.getByRole('button',{name:'Dokument schließen',exact:true}).click();await expect(source).toBeFocused();
      }
      await page.screenshot({path:join(evidence,`actual-count-${count}.png`),fullPage:true});expect(treeBytes(f.root)).toEqual(before);
    }finally{await service.close();f.close();}
  }
});
test('SCN-001/003/015/016/017: actual approved version and six registered resources; same DOM measured resizing, themes, keyboard and raw-source reading',async({page})=>{
  const f=await approvalFixture();expect(f.approve().outcome).toBe('approved');pointer(f,'fixture-a');
  let state=fs.readFileSync(f.runPath,'utf8');
  for(const type of ['PRD','SD','TP','QA','UAT']){
    const path=`.agdf/control/artefacts/fixture-a/${type}.md`;
    if(!['QA','UAT'].includes(type))fs.writeFileSync(join(f.root,path),`# ${type}: Registered draft\n`);
    state=upsertTableRow(state,'Artefacts',0,type,[type,type==='UAT'?'../outside.md':path,'draft','Disposable registered resource']);
  }
  fs.writeFileSync(f.runPath,sealRunState(f.root,state));
  const before=treeBytes(f.root),service=await startControlServer({dir:f.root}),observations=[];
  try{
    for(const route of ['/','/card.html']){
      await open(page,service,route,'fixture-a');
      await expect(page.locator('.run-documents h3')).toHaveText('Dokumente · 6');await expect(page.locator('.run-document-row')).toHaveCount(6);
      await expect(page.locator('.run-documents details')).toHaveCount(0);await expect(page.locator('.run-documents button')).toHaveCount(4);
      const action=page.getByRole('button',{name:'Freigegebene Anforderungen ansehen: Anforderungen',exact:true});await expect(action).toBeVisible();
      await action.focus();await action.evaluate(e=>{window.documentAction=e;window.documentRow=e.closest('li');});
      for(const theme of ['light','dark'])for(const target of [960,320,960]){
        await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
        let viewport=target+120;
        for(let attempt=0;attempt<12;attempt++){
          await page.setViewportSize({width:viewport,height:900});const width=await page.locator('.run-documents-list').evaluate(e=>e.clientWidth);
          if(Math.abs(width-target)<=1)break;viewport+=target-width;
        }
        const geometry=await page.locator('.run-documents-list').evaluate(e=>({width:e.clientWidth,sameNode:window.documentAction===e.querySelector('button'),sameRow:window.documentRow===e.querySelector('li'),focused:document.activeElement===window.documentAction,
          columns:getComputedStyle(e.querySelector('li')).gridTemplateColumns,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,actionHeight:window.documentAction.getBoundingClientRect().height}));
        expect(Math.abs(geometry.width-target)).toBeLessThanOrEqual(1);expect(geometry.sameNode).toBe(true);expect(geometry.sameRow).toBe(true);expect(geometry.focused).toBe(true);expect(geometry.actionHeight).toBeGreaterThanOrEqual(44);expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport);
        await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await page.evaluate(()=>window.scrollTo(0,0));await expect(action).toBeFocused();
        observations.push({route,theme,target,...geometry});await page.screenshot({path:join(evidence,`documents-${route==='/'?'browser':'card'}-${theme}-${target}.png`),fullPage:true});
      }
      await page.keyboard.press('Enter');await expect(page.locator('.page-title h1')).toBeFocused();
      await expect(page.locator('.document-state-context')).toContainText('Diese gelesene Fassung ist der dokumentierten Freigabe zugeordnet.');
      await expect(page.locator('.document-state-context')).toContainText('Approval: UR');
      await expect(page.locator('.document-state-context')).toContainText('Freigabezeitpunkt, freigebende Person und Grundlage');
      await page.locator('.document-original > summary').focus();await page.keyboard.press('Enter');await expect(page.locator('article.document')).toContainText('UR: Approval fixture');
      await page.getByRole('button',{name:'Dokument schließen',exact:true}).focus();await page.keyboard.press('Enter');await expect(action).toBeFocused();
      await page.getByRole('button',{name:'Neu laden',exact:true}).click();await expect(action).toBeEnabled();
      expect(treeBytes(f.root)).toEqual(before);
    }
    fs.writeFileSync(join(evidence,'responsive-observations.json'),JSON.stringify(observations,null,2));
  }finally{await service.close();f.close();}
});
test('SCN-005/007/010/013/018: deliberate actual draft check survives document/return; busy retry, corrections, source change and reload',async({page})=>{
  const f=artifactReadinessFixture();f.root=fs.realpathSync(f.root);fs.writeFileSync(f.path,readyPrd);pointer(f,f.runId);
  f.reseal(s=>upsertTableRow(s,'Artefacts',0,'PRD',['PRD',`${f.prefix}PRD.md`,'draft','Actual registered draft']));
  const service=await startControlServer({dir:f.root});let before=treeBytes(f.root),requests=0;
  page.on('request',r=>{if(r.url().includes('/api/draft-check/'))requests++;});
  try{
    for(const route of ['/card.html','/']){
      await open(page,service,route,f.runId);const check=page.getByRole('button',{name:'Entwurf prüfen',exact:true});
      expect(requests).toBe(route==='/card.html'?0:3);
      let busy=true;await page.route('**/api/draft-check/**',async route=>{if(!busy)return route.continue();busy=false;
        // Fault injection before draft execution; a read-only freshness response supplies the actual envelope binding.
        const snapshot=new URL(route.request().url()).searchParams.get('snapshot');
        const response=await route.fetch({url:service.origin+'/api/freshness?snapshot='+snapshot});const e=await response.json();await route.fulfill({response,json:{...e,state:'error',code:'busy',retryable:true,data:null}});
      });
      await check.focus();await page.keyboard.press('Enter');await expect(page.locator('.draft-check')).toContainText('Der Lesedienst ist beschäftigt');
      const retry=page.getByRole('button',{name:'Prüfung wiederholen',exact:true});await retry.focus();await page.keyboard.press('Enter');
      await expect(page.locator('.draft-check')).toContainText('Entwurfsprüfung bestanden');
      await expect(page.locator('.run-document-state').filter({hasText:'Entwurf geprüft'})).toBeVisible();
      const source=page.getByRole('button',{name:'Entwurf ansehen: Produktanforderungen',exact:true});await source.focus();await page.keyboard.press('Enter');
      await expect(page.locator('.document-state-context')).toContainText('Entwurf geprüft');await page.getByRole('button',{name:'Dokument schließen',exact:true}).click();await expect(source).toBeFocused();
      await expect(page.locator('.draft-check')).toContainText('Entwurfsprüfung bestanden');expect(treeBytes(f.root)).toEqual(before);
      fs.writeFileSync(f.path,readyPrd.replace('before_prd | resolved','before_prd | open'));f.reseal(s=>s);before=treeBytes(f.root);
      await page.getByRole('button',{name:'Neu laden',exact:true}).click();await expect(page.locator('.draft-check')).toContainText('Noch nicht geprüft');await check.click();
      await expect(page.locator('.run-document-state').filter({hasText:'Überarbeitung nötig'})).toBeVisible();await source.click();
      await expect(page.locator('.document-state-context')).toContainText('Überarbeitung nötig');await expect(page.getByRole('list',{name:'Aktuelle Korrekturen'})).toContainText('Scope');
      await page.screenshot({path:join(evidence,`corrections-${route==='/'?'browser':'card'}.png`),fullPage:true});
      await page.getByRole('button',{name:'Dokument schließen',exact:true}).click();await expect(source).toBeFocused();expect(treeBytes(f.root)).toEqual(before);
      await page.unroute('**/api/draft-check/**');fs.writeFileSync(f.path,readyPrd);f.reseal(s=>s);before=treeBytes(f.root);
    }
  }finally{await service.close();fs.rmSync(f.root,{recursive:true,force:true});}
});
test('SCN-001/010/015/017: built consumer renders multiple long references and old-server absence truthfully',async({page})=>{
  const f=await approvalFixture();expect(f.approve().outcome).toBe('approved');pointer(f,'fixture-a');
  const before=treeBytes(f.root),service=await startControlServer({dir:f.root});
  let variant='multiple';
  try {
    await page.route(/\/api\/(?:runs\/|snapshot)/,async route=>{
      const response=await route.fetch(),e=await response.json();
      if(e.data?.kind==='run'&&e.data.run){
        if(variant==='old') delete e.data.run.document_states;
        else {
          // Consumer-only additive DTO fixture. Positive approval evidence is tested separately
          // against real Core reads; this extra reference is deliberately unconfirmed.
          const r=e.data.run.resources.find(r=>r.type==='UR'),s=e.data.run.document_states.find(s=>s.type==='UR');
          const ref='.agdf/control/artefacts/fixture-a/'+'long-reference/'.repeat(35)+'UR.md';
          e.data.run.resources.push({...r,resource_id:'extra-consumer-reference',registered_reference:ref,path:ref});
          e.data.run.document_states.push({...s,resource_id:'extra-consumer-reference',registered_reference:ref,state:'approval_unconfirmed',version_kind:'current',reason:'consumer_fixture_unconfirmed'});
        }
      }
      await route.fulfill({response,json:e});
    });
    await open(page,service,'/','fixture-a');await expect(page.locator('.run-documents h3')).toHaveText('Dokumente · 2');
    await expect(page.locator('.run-document-row')).toHaveCount(2);await expect(page.locator('.run-document-reference')).toHaveCount(2);
    const names=await page.locator('.run-documents button').evaluateAll(rows=>rows.map(r=>r.getAttribute('aria-label')));expect(new Set(names).size).toBe(2);
    await page.setViewportSize({width:420,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(page.locator('.run-document-state').filter({hasText:'Freigabe dieser Fassung nicht bestätigt'})).toBeVisible();
    await page.screenshot({path:join(evidence,'multiple-consumer-references.png'),fullPage:true});
    variant='old';await page.getByRole('button',{name:'Neu laden',exact:true}).click();
    await expect(page.locator('.run-documents h3')).toHaveText('Dokumente · 1');
    await expect(page.getByRole('button',{name:'Aktuelle Fassung ansehen: Anforderungen',exact:true})).toBeVisible();
    await expect(page.locator('.run-document-state').filter({hasText:'Freigabe dieser Fassung nicht bestätigt'})).toBeVisible();
    await page.screenshot({path:join(evidence,'old-server-consumer-absence.png'),fullPage:true});
    expect(treeBytes(f.root)).toEqual(before);
  } finally {await service.close();f.close();}
});
