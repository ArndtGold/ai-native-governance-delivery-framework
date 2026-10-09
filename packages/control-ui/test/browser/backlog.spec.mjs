import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { fixture, treeBytes } from '../../../core/test/control-cockpit-fixtures.js';
import { startControlServer, evidencePath } from './server-fixture.mjs';

function storedBacklog(planned = true) {
  return '# Master Backlog\n\n## Active Backlog\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n| 1 | fixture-a | Unterlagen schneller zuordnen | In progress | | UR | Quellen prüfen und den nächsten Arbeitsschritt anhand der bestätigten Voraussetzungen vorbereiten. |\n\n## Planned / Parking Lot\n' + (planned ? '| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n| 2 | planned-a | Beratung vorbereiten | Needs UR | | | Umfang klären. |\n' : 'Nicht auswertbare Tabelle.\n') + '\n## Completed / Superseded Pointers\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n| fixture-completed | Frühere Umsetzung | Completed | none | Ergebnis dokumentiert. |\n| superseded-a | Abgelöstes Vorhaben | Superseded | none | Durch ein neues Vorhaben ersetzt. |\n';
}
async function overview(page, service) {
  await page.goto(service.startupURL);
  await expect(page.getByRole('button', { name: 'Aktiv 1', exact: true })).toBeVisible();
}
test('backlog areas filter stored entries locally, keep search on return, and match Pages in light/dark at four widths', async ({ page }) => {
  const f = fixture(); fs.writeFileSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md'), storedBacklog());
  const before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  const requests = []; page.on('request', r => { const url = new URL(r.url()); if (url.pathname.startsWith('/api/')) requests.push(url.pathname + url.search); });
  try {
    await overview(page, service);
    await expect(page.getByRole('button', { name: 'Aktiv 1' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Geplant 1' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Archiv 2' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Frühere Umsetzung' })).toHaveCount(0);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
      for (const width of [320, 560, 800, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(page.locator('.backlog-overview')).toHaveCSS('font-family', 'Inter, system-ui, sans-serif');
        await expect(page.locator('.backlog-overview')).toHaveCSS('background-color', theme === 'light' ? 'rgb(252, 252, 252)' : 'rgb(15, 23, 42)');
        // Wait for the Pages color transition before inspecting or saving the theme.
        await expect(page.getByRole('button', { name: 'Geplant 1' })).toHaveCSS('background-color', theme === 'light' ? 'rgb(246, 246, 246)' : 'rgb(15, 23, 42)');
        const contrasts = await page.locator('.backlog-switch button').evaluateAll(elements => {
          const luminance = color => color.match(/[\d.]+/g).slice(0,3).map(Number).map(v => { const x=v/255; return x<=.04045 ? x/12.92 : ((x+.055)/1.055)**2.4; }).reduce((sum,v,i) => sum+v*[.2126,.7152,.0722][i],0);
          return elements.map(e => { const s=getComputedStyle(e),fg=luminance(s.color),bg=luminance(s.backgroundColor); return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05); });
        });
        expect(contrasts.every(ratio => ratio >= 4.5)).toBe(true);
        const controls = await page.locator('.backlog-switch button').evaluateAll(elements => elements.map(e => { const b = e.getBoundingClientRect(); return { height: b.height, width: b.width, top: b.top, background: getComputedStyle(e).backgroundColor }; }));
        expect(controls.every(c => c.height >= 44 && c.width >= 44)).toBe(true);
        expect(new Set(controls.map(c => c.top)).size).toBe(1);
        expect(controls[0].background).not.toBe(controls[1].background);
        await page.screenshot({ path: evidencePath(`agdf-backlog-${theme}-${width}-17.png`), fullPage: true });
      }
    }
    await page.getByRole('button', { name: 'Geplant 1' }).focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Beratung vorbereiten' })).toBeVisible();
    await page.getByRole('searchbox').fill('kein Treffer');
    await expect(page.getByText('Keine gespeicherten Vorhaben für diese Suche.')).toBeVisible();
    await page.getByRole('button', { name: 'Archiv 2' }).click();
    await expect(page.getByRole('searchbox')).toHaveValue('');
    await expect(page.getByText('Ergebnis laut Backlog: Durch ein neues Vorhaben ersetzt.')).toBeVisible();
    await expect(page.locator('.row-source[open]')).toHaveCount(0);
    expect(requests.filter(p => !p.startsWith('/api/freshness') && !p.startsWith('/api/changes') && !p.startsWith('/api/backlog-titles'))).toEqual(['/api/snapshot']);
    expect(requests.filter(p => p.startsWith('/api/backlog-titles')).every(path => new URL('http://local'+path).searchParams.get('rows').split(',').length <= 12)).toBe(true);
    await page.getByRole('searchbox').fill('fixture-completed');
    await page.getByRole('button', { name: 'Frühere Umsetzung' }).click();
    await expect(page.locator('.page-title h1')).not.toHaveText('Gespeicherte Vorhaben');
    await page.getByRole('button', { name: 'Alle Vorhaben', exact: true }).first().click();
    await expect(page.getByRole('button', { name: 'Archiv 2' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('searchbox')).toHaveValue('fixture-completed');
    await expect(page.getByRole('button', { name: 'Frühere Umsetzung' })).toBeFocused();
    await expect(page.getByRole('button', { name: 'Aktuellen Stand prüfen' })).toHaveCount(0);
  } finally { await service.close(); expect(treeBytes(f.root)).toEqual(before); f.close(); }
});
test('a malformed planned section does not turn its count into zero or obscure readable active entries', async ({ page }) => {
  const f = fixture(); fs.writeFileSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md'), storedBacklog(false));
  const before = treeBytes(f.root), service = await startControlServer({ dir: f.root });
  try {
    await overview(page, service);
    await expect(page.locator('.notice')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Unterlagen schneller zuordnen' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Geplant Nicht verfügbar' })).toBeVisible();
    await page.getByRole('button', { name: 'Geplant Nicht verfügbar' }).click();
    await expect(page.getByText(/Dieser Bereich ist nicht auswertbar/)).toBeVisible();
    await expect(page.getByText('In diesem Bereich sind keine Vorhaben gespeichert.')).toHaveCount(0);
    await expect(page.locator('.notice')).not.toHaveAttribute('open');
  } finally { await service.close(); expect(treeBytes(f.root)).toEqual(before); f.close(); }
});
test('SCN-008/009/011/012/013: compact active three-preview, full search, long wrapped rows and exact expanded return',async({page})=>{
 const f=fixture(),path=join(f.root,'.agdf/control/MASTER_BACKLOG.md');
 const title='Unterlagen schneller finden und vollständig vergleichen mit nachvollziehbarer Quellenherkunft '+ 'Langtitel'.repeat(10);
 const step='Nächsten Schritt vollständig prüfen '+ 'Einzelheit '.repeat(30)+'ENTSCHEIDENDER SCHLUSS';
 const rows=Array.from({length:8},(_,i)=>`| 1 | ${i===0?'fixture-a':'long-key-'+i+'x'.repeat(90)} | [framework-maintenance] ${title} ${i} | ${i===7?'Completed':'In progress'} | | UR | ${step} |`);
 fs.writeFileSync(path,storedBacklog().replace(/\| 1 \| fixture-a[^\n]+/,rows.join('\n')));
 const before=treeBytes(f.root),service=await startControlServer({dir:f.root});
 const requests=[];page.on('request',r=>{const u=new URL(r.url());if(u.pathname.startsWith('/api/'))requests.push(u.pathname+u.search);});
 try{
  await page.addInitScript(({secret,origin})=>{if(location.origin===origin)history.replaceState(null,'','/card.html#'+secret);},{secret:service.secret,origin:service.origin});
  await page.goto(service.origin+'/card.html');
  await expect(page.locator('.undertaking-list > li')).toHaveCount(3);
  await expect(page.getByText('8 Einträge im Bereich · 8 Treffer · 3 angezeigt')).toBeVisible();
  expect(await page.locator('.undertaking-list h3').first().textContent()).toBe(title+' 7');
  await expect(page.getByText('Gespeicherter Stand laut Backlog: Completed',{exact:true})).toBeVisible();
  await expect(page.getByRole('combobox')).toHaveCount(0);await expect(page.getByRole('button',{name:'Beratung vorbereiten'})).toHaveCount(0);
  await expect(page.locator('.compact-controls .row-step')).toHaveCount(0);
  await expect(page.locator('.compact-controls .undertaking-list')).toHaveCSS('overflow-y','visible');
  await expect(page.locator('.compact-controls .undertaking-list')).toHaveCSS('max-height','none');
  for(const theme of ['light','dark'])for(const width of [320,560,800,1280]){
   await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);await page.setViewportSize({width,height:1000});
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   const geometry=await page.locator('.undertaking-list .run-link, .undertaking-list summary').evaluateAll(elements=>elements.map(e=>({height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width,scroll:e.scrollWidth,client:e.clientWidth,whiteSpace:getComputedStyle(e).whiteSpace,clamp:getComputedStyle(e).webkitLineClamp})));
   expect(geometry.every(g=>g.height>=44&&g.scroll<=g.client+1)).toBe(true);
   expect(geometry.filter((_,i)=>i%2===0).every(g=>g.whiteSpace==='normal'&&g.clamp==='none')).toBe(true);
   await page.locator('.undertaking-list .run-link').first().focus();await expect(page.locator('.undertaking-list .run-link').first()).toBeFocused();
   await page.screenshot({path:evidencePath(`cockpit-core-ui-compact-${theme}-${width}.png`),fullPage:true});
  }
  await page.locator('.undertaking-list > li').first().locator('summary').click();
  await expect(page.locator('.undertaking-list > li').first().locator('dd').filter({hasText:'ENTSCHEIDENDER SCHLUSS'})).toBeVisible();
  await expect(page.locator('.undertaking-list > li').first().getByText('[framework-maintenance] '+title+' 7',{exact:true})).toBeVisible();
  await page.getByRole('searchbox').fill('fixture-a');await expect(page.locator('.undertaking-list > li')).toHaveCount(1);
  expect(requests.filter(p=>p.startsWith('/api/runs/'))).toHaveLength(0);
  await page.getByRole('button',{name:'Alle Vorhaben öffnen'}).click();
  await expect(page.getByRole('searchbox')).toHaveValue('fixture-a');await expect(page.locator('.undertaking-list > li')).toHaveCount(1);
  await page.getByRole('searchbox').fill('');await expect(page.locator('.undertaking-list > li')).toHaveCount(8);
  // Same viewport, different panel widths: layout follows its container rather
  // than assuming that a wide browser means a wide embedded reading surface.
  await page.setViewportSize({width:1600,height:600});
  await expect.poll(()=>page.locator('.undertaking-list > li').evaluateAll(rows=>{
   const a=rows[0].getBoundingClientRect(),b=rows[1].getBoundingClientRect();
   return Math.abs(a.top-b.top)<1 && b.left>a.left;
  })).toBe(true);
  await expect(page.locator('#backlog-list')).toHaveCSS('overflow-y','auto');
  const shortHeight=await page.locator('#backlog-list').evaluate(e=>e.clientHeight);
  for(const height of [360,600,1000]) {
   await page.setViewportSize({width:1600,height});
   await expect.poll(()=>page.locator('#backlog-list').evaluate(e=>{
    const list=e.getBoundingClientRect(),panel=e.closest('.backlog-overview').getBoundingClientRect();
    const footer=e.closest('main').querySelector('footer').getBoundingClientRect();
    return e.clientHeight>=120 && list.bottom<=panel.bottom && footer.top>=panel.bottom;
   })).toBe(true);
  }
  await expect.poll(()=>page.locator('#backlog-list').evaluate(e=>e.clientHeight)).toBeGreaterThan(shortHeight+200);
  const controlsTop=await page.getByRole('searchbox').evaluate(e=>e.getBoundingClientRect().top);
  const pageTop=await page.evaluate(()=>window.scrollY);
  await page.locator('#backlog-list').focus();await page.keyboard.press('End');
  await expect.poll(()=>page.locator('#backlog-list').evaluate(e=>e.scrollTop)).toBeGreaterThan(0);
  expect(await page.getByRole('searchbox').evaluate(e=>e.getBoundingClientRect().top)).toBe(controlsTop);
  expect(await page.evaluate(()=>window.scrollY)).toBe(pageTop);
  await page.locator('.undertaking-list > li').last().getByText('Gespeicherte Angaben und Quellen',{exact:true}).click();
  await expect(page.locator('.undertaking-list > li').last().locator('dd').filter({hasText:'ENTSCHEIDENDER SCHLUSS'})).toBeVisible();
  await page.locator('.undertaking-list > li').last().getByText('Gespeicherte Angaben und Quellen',{exact:true}).click();
  await page.locator('#backlog-list').evaluate(e=>e.scrollTop=0);
  await page.screenshot({path:evidencePath('cockpit-responsive-expanded-wide.png'),fullPage:false});
  await page.locator('.mcp-entry').evaluate(e=>e.style.width='560px');
  await expect.poll(()=>page.locator('.undertaking-list > li').evaluateAll(rows=>{
   const a=rows[0].getBoundingClientRect(),b=rows[1].getBoundingClientRect();
   return Math.abs(a.left-b.left)<1 && b.top>a.top;
  })).toBe(true);
  await expect(page.locator('#backlog-list')).toHaveCSS('overflow-y','auto');
  expect(await page.locator('.mcp-entry').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
  await page.screenshot({path:evidencePath('cockpit-responsive-expanded-narrow.png'),fullPage:false});
  await page.locator('.mcp-entry').evaluate(e=>e.style.removeProperty('width'));
  await page.getByRole('searchbox').fill('fixture-a');
  await page.locator('.run-link[data-focus-id="fixture-a"]').focus();await page.keyboard.press('Enter');
  await expect(page.locator('.page-title h1')).toHaveText('Fixture document');
  await page.getByRole('button',{name:'Alle Vorhaben',exact:true}).first().click();
  await expect(page.getByRole('searchbox')).toHaveValue('fixture-a');await expect(page.locator('.run-link[data-focus-id="fixture-a"]')).toBeFocused();
 }finally{await service.close();expect(treeBytes(f.root)).toEqual(before);f.close();}
});
