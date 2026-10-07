import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { fixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer } from '../../server/service.mjs';

test('SCN-084/085/092/093/094/095/100: real visible UR titles, reversed order, scope replacement and unchanged sources in light/dark', async ({page}) => {
  const f=fixture();
  const rows=Array.from({length:40},(_,i)=>{
    const key=i===39?'fixture-a':'stored-'+i;
    const dir=join(f.root,'.agdf/control/artefacts',key); fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(join(dir,'UR.md'),`# UR: Verständliches Vorhaben ${i}\n\nPassive Quelle ${i}.\n`);
    return `| 1 | ${key} | Technischer Backlog ${i} | In progress | [UR](artefacts/${key}/UR.md) | stored | Gespeicherter nächster Schritt ${i}. |`;
  });
  fs.writeFileSync(join(f.root,'.agdf/control/MASTER_BACKLOG.md'),'# Master Backlog\n## Active Backlog\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n'+rows.join('\n')+'\n## Planned / Parking Lot\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n## Completed / Superseded Pointers\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n');
  const before=treeBytes(f.root), service=await startControlServer({dir:f.root});
  const batches=[], bodies=[]; let active=0,maxActive=0;
  page.on('request',r=>{ if(new URL(r.url()).pathname==='/api/backlog-titles'){active++;maxActive=Math.max(active,maxActive);batches.push(new URL(r.url()).searchParams.get('rows').split(','));} });
  page.on('requestfinished',r=>{if(new URL(r.url()).pathname==='/api/backlog-titles')active--;});
  page.on('response',async r=>{if(new URL(r.url()).pathname==='/api/backlog-titles')bodies.push(await r.json());});
  try {
    await page.setViewportSize({width:800,height:750}); await page.goto(service.startupURL);
    await expect(page.getByRole('button',{name:'Verständliches Vorhaben 39',exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Aktiv 40'})).toBeVisible();
    expect(await page.locator('.undertaking-list li h3').first().textContent()).toBe('Verständliches Vorhaben 39');
    expect(batches.flat().length).toBeLessThan(12); expect(maxActive).toBe(1);
    expect(bodies.every(b=>b.data.file_count<=batches[bodies.indexOf(b)].length+1)).toBe(true);
    await expect(page.getByRole('button',{name:'Technischer Backlog 0',exact:true})).toBeAttached();
    await expect(page.locator('.row-source[open]')).toHaveCount(0);
    await expect(page.locator('.undertaking-list li').first().getByText('Gespeicherter Stand laut Backlog: In progress', {exact:true})).toBeVisible();
    await expect(page.locator('.undertaking-list li').first().getByText('Beobachtete UR-Überschrift', {exact:true})).not.toBeVisible();
    await page.locator('.undertaking-list li').first().getByText('Gespeicherte Angaben und Quellen', {exact:true}).click();
    await expect(page.locator('.undertaking-list li').first().getByText('Beobachtete UR-Überschrift', {exact:true})).toBeVisible();
    await page.locator('.undertaking-list li').first().getByText('Gespeicherte Angaben und Quellen', {exact:true}).click();
    for(const theme of ['light','dark']) {
      await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
      await expect(page.locator('.backlog-overview')).toHaveCSS('background-color',theme==='light'?'rgb(255, 255, 255)':'rgb(15, 23, 42)');
      await expect(page.getByRole('button',{name:'Geplant 0'})).toHaveCSS('background-color',theme==='light'?'rgb(255, 255, 255)':'rgb(15, 23, 42)');
      await expect(page.getByRole('button',{name:'Verständliches Vorhaben 39',exact:true})).toHaveCSS('color',theme==='light'?'rgb(15, 118, 110)':'rgb(153, 246, 228)');
      await page.screenshot({path:`/private/tmp/agdf-backlog-ur-titles-${theme}-22.png`,fullPage:false});
    }
    await page.getByRole('searchbox').fill('Verständliches Vorhaben 39');
    await expect(page.locator('.undertaking-list li')).toHaveCount(1);
    await page.getByRole('button',{name:'Verständliches Vorhaben 39',exact:true}).focus();
    await page.waitForTimeout(200);
    await expect(page.getByRole('button',{name:'Verständliches Vorhaben 39',exact:true})).toBeFocused();
    await page.getByRole('button',{name:'Verständliches Vorhaben 39',exact:true}).click();
    await expect(page.locator('.page-title h1')).toHaveText('Verständliches Vorhaben 39');
    await page.getByRole('button',{name:'Alle Vorhaben',exact:true}).first().click();
    await expect(page.getByRole('searchbox')).toHaveValue('Verständliches Vorhaben 39');
    await expect(page.getByRole('button',{name:'Verständliches Vorhaben 39',exact:true})).toBeFocused();
    await page.getByRole('searchbox').fill('');
    await expect(page.getByRole('button',{name:'Verständliches Vorhaben 39',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Technischer Backlog 0',exact:true}).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button',{name:'Verständliches Vorhaben 0',exact:true})).toBeVisible();
    expect(maxActive).toBe(1); expect(batches.every(ids=>ids.length>=1&&ids.length<=12)).toBe(true);
  } finally { await service.close(); expect(treeBytes(f.root)).toEqual(before);f.close(); }
});
