import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { fixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer, evidencePath } from './server-fixture.mjs';
for (const compact of [false,true]) for (const width of [390,1440]) {
  test(`run model: current inventory, deliberate selection, history and retry ${compact?'compact':'desktop'} ${width}`,async({page})=>{
    const f=fixture(),before=treeBytes(f.root),service=await startControlServer({dir:f.root}),requests=[];
    page.on('request',request=>{const url=new URL(request.url());if(url.pathname.startsWith('/api/'))requests.push(url.pathname+url.search);});
    try{
      await page.setViewportSize({width,height:width===390?844:1000});
      await page.goto(compact?`${service.origin}/card.html#${service.secret}`:service.startupURL);
      const title=page.getByRole('button',{name:'Preserve one explicit intent.',exact:true});await expect(title).toBeVisible();
      await expect(page.getByRole('button',{name:'Legacy-Backlog'})).toHaveCount(0);
      const search=page.getByRole('searchbox');await search.fill('no-such-undertaking');
      await expect(page.getByText('Keine Vorhaben für diese Suche.',{exact:true})).toBeVisible();await search.fill('fixture-a');
      await expect(title).toBeVisible();await title.focus();await page.keyboard.press('Enter');
      await expect(page.getByRole('button',{name:'Alle Vorhaben',exact:true})).toBeVisible();
      await expect(page.getByText(/Aus dem Run abgeleiteter Arbeitsstand/)).toBeVisible();
      await page.getByRole('button',{name:'Alle Vorhaben',exact:true}).click();await expect(title).toBeVisible();
      await expect(page.getByRole('searchbox')).toHaveValue('fixture-a');
      await page.getByRole('button',{name:'Archiv 1',exact:true}).click();
      await expect(page.locator('.undertaking-list')).toContainText('Fixture Completed');
      await page.getByRole('button',{name:'Aktiv 1',exact:true}).click();await expect(title).toBeVisible();
      let fail=true;await page.route('**/api/snapshot',route=>fail?route.abort():route.continue());
      await page.getByRole('button',{name:'Neu laden',exact:true}).click();
      const retry=page.getByRole('button',{name:compact?'Aktualisierung fehlgeschlagen · Wiederholen':'Wiederholen',exact:true});await expect(retry).toBeVisible();
      await expect(title).toBeDisabled();fail=false;await retry.click();await expect(title).toBeEnabled();
      expect(requests.every(path=>!path.includes('backlog-titles')&&!path.includes('view=legacy'))).toBe(true);
      expect(treeBytes(f.root)).toEqual(before);
      await page.screenshot({path:evidencePath(`run-model-${compact?'compact':'desktop'}-${width}.png`),fullPage:true});
    }finally{await service.close();f.close();}
  });
}
for(const compact of [false,true])test(`run model: unsupported is visible and deliberate retry restores the current ${compact?'compact':'desktop'} view`,async({page})=>{
  const f=fixture(),path=join(f.root,'.agdf/control/config.json'),original=fs.readFileSync(path,'utf8'),before=treeBytes(f.root);
  fs.writeFileSync(path,JSON.stringify({...JSON.parse(original),control_layout:'master-backlog-v1'}));
  const unsupported=treeBytes(f.root),service=await startControlServer({dir:f.root});
  try{
    await page.goto(compact?`${service.origin}/card.html#${service.secret}`:service.startupURL);
    await expect(page.getByText(/nicht unterstütztes Format/)).toBeVisible();
    await expect(page.getByRole('button',{name:'Preserve one explicit intent.',exact:true})).toHaveCount(0);
    expect(treeBytes(f.root)).toEqual(unsupported);
    fs.writeFileSync(path,original);
    await page.getByRole('button',{name:compact?'Neu laden':'Wiederholen',exact:true}).click();
    await expect(page.getByRole('button',{name:'Preserve one explicit intent.',exact:true})).toBeVisible();expect(treeBytes(f.root)).toEqual(before);
  }finally{await service.close();f.close();}
});
