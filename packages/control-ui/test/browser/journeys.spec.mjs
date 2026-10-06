import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { startControlServer } from '../../server/service.mjs';
import { fixture } from '../../../core/test/control-cockpit-fixtures.js';
import { sealRunState } from '../../../core/lib/control-state/run-seal.js';

function hashes(root) {
  const data = {};
  const visit = dir => { for (const name of fs.readdirSync(dir)) { const path = join(dir, name), stats = fs.lstatSync(path); data[path.slice(root.length)] = stats.isDirectory() ? 'directory' : createHash('sha256').update(fs.readFileSync(path)).digest('hex'); if (stats.isDirectory()) visit(path); } };
  visit(join(root, '.agdf/control')); return data;
}
async function openSession(page, service, pathname = '/') {
  await page.addInitScript(({ secret, origin, pathname }) => { if (location.origin === origin) history.replaceState(null, '', pathname + '#' + secret); }, { secret: service.secret, origin: service.origin, pathname });
  await page.goto(service.origin + pathname);
  await expect(page.getByRole('heading', { name: pathname === '/card.html' ? 'AGDF Cockpit' : 'Runs im Repository' })).toBeVisible({ timeout: 12_000 });
  if (pathname === '/card.html') await expect(page.getByRole('combobox', {name:'Run auswählen',exact:true})).toBeEnabled({ timeout: 12_000 });
  expect(new URL(page.url()).hash).toBe('');
}
test('SCN-044: Pages fonts survive host body overrides across card, list, Run and document', async ({ page }) => {
  const f = fixture(), before = hashes(f.root), service = await startControlServer({ dir: f.root });
  const observations = [], remote = [];
  page.on('request', r => { if (!r.url().startsWith(service.origin)) remote.push(r.url()); });
  try {
    await openSession(page, service, '/card.html');
    // Reproduce the actual MCP host rule without overriding the application's container.
    // Keep the production self-only stylesheet CSP intact.
    await page.route(service.origin + '/__host-test.css', route => route.fulfill({
      contentType:'text/css', body:'html,body{font-family:Arial,sans-serif!important}button,input,textarea,select{font-family:inherit}'
    }));
    await page.addStyleTag({url:service.origin + '/__host-test.css'});
    await expect(page.locator('body')).toHaveCSS('font-family','Arial, sans-serif');
    const inspect = async (view, selector) => {
      await expect(page.locator(selector)).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const fonts = await page.locator(selector).evaluate(e => {
        const s = getComputedStyle(e);
        return {family:s.fontFamily,size:s.fontSize,leading:s.lineHeight,loaded:Array.from(document.fonts).filter(f=>f.status==='loaded').map(f=>f.family)};
      });
      expect(fonts.family.split(',')[0].replaceAll('"','')).toBe('Inter');
      expect(fonts.loaded).toContain('Inter');
      expect(fonts.loaded).toContain('JetBrains Mono');
      for (const theme of ['light','dark']) {
        await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
        for (const width of [320,560,800,1280]) {
          await page.setViewportSize({width,height:900});
          const geometry = await page.evaluate(() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
            overflow:Array.from(document.querySelectorAll('body *')).filter(e=>e.getBoundingClientRect().right>innerWidth || e.scrollWidth>e.clientWidth && getComputedStyle(e).overflowX==='visible').slice(0,12).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.slice(0,90),right:e.getBoundingClientRect().right,client:e.clientWidth,scroll:e.scrollWidth}))}));
          observations.push({view,theme,...fonts,...geometry});
          await page.screenshot({path:`/private/tmp/agdf-cockpit-pages-${view}-${theme}-${width}.png`});
          expect(geometry.scrollWidth,JSON.stringify(geometry.overflow)).toBeLessThanOrEqual(width);
        }
      }
    };
    await page.getByRole('combobox',{name:'Run auswählen',exact:true}).selectOption('fixture-a');
    await expect(page.locator('.compact-run')).toBeVisible();
    await inspect('card','.compact-run-summary h2');
    await page.getByRole('button',{name:'Run ansehen',exact:true}).click();
    await inspect('run','.page-title h1');
    // Follow the registered evidence source from the same work unit, then return to it.
    await page.getByRole('button',{name:'Stand des Vorhabens öffnen',exact:true}).click();
    await expect(page.getByRole('button',{name:'Dokument schließen',exact:true})).toBeVisible();
    await expect(page.locator('.document')).toContainText('fixture-a');
    await page.getByRole('button',{name:'Dokument schließen',exact:true}).click();
    await expect(page.getByRole('button',{name:'Stand des Vorhabens öffnen',exact:true})).toBeFocused();
    await page.getByRole('button',{name:'Anforderungen öffnen',exact:true}).click();
    await inspect('document','.document p');
    await expect(page.locator('.document')).toHaveCSS('font-size','16px');
    await page.getByRole('button',{name:'Dokument schließen',exact:true}).click();
    await page.getByRole('button',{name:'Alle Vorhaben',exact:true}).click();
    await inspect('list','.run-link[data-focus-id="fixture-a"]');
    expect(remote).toEqual([]);
    fs.writeFileSync('/private/tmp/agdf-cockpit-pages-alignment-observations.json',JSON.stringify(observations,null,2));
  } finally { await service.close(); expect(hashes(f.root)).toEqual(before); f.close(); }
});
test('SCN-002/005/007/008/010: explicit graph inspection stays passive and readable at container boundaries', async ({ page }) => {
  const f = fixture();
  fs.writeFileSync(f.runPath, sealRunState(f.root, fs.readFileSync(f.runPath,'utf8')+'\n## Context Graph Impact\n\n- context_graph_refs: `CG-A`; CG-MISSING\n'));
  fs.writeFileSync(join(f.root,'.agdf/control/CONTEXT_GRAPH.md'),'## Nodes\n### CG-A\nOriginal 日本語.\n\n<script>window.graphPwned=true</script>\n\n![external](https://evil.invalid/img)\n\n[ref](https://evil.invalid)\n\n### CG-UNSELECTED\nNot selected\n');
  const before=hashes(f.root),service=await startControlServer({dir:f.root}),remote=[];
  page.on('request',request=>{if(!request.url().startsWith(service.origin))remote.push(request.url());});
  try {
    await openSession(page,service);await page.locator('.run-link[data-focus-id="fixture-a"]').click();
    await page.getByRole('button',{name:'Details',exact:true}).click();
    await page.locator('.resources button').filter({hasText:/\/UR\.md/}).click();
    await page.getByRole('button',{name:'Verknüpfter Kontext ansehen'}).click();
    const context=page.getByRole('region',{name:'Verknüpfter Kontext'});
    await expect(context.locator('strong').filter({hasText:/^CG-A$/})).toBeVisible();
    await expect(context.getByText('Knoten fehlt.',{exact:false})).toBeVisible();
    await context.getByText('Quelle lesen',{exact:true}).click();await expect(context.locator('article')).toContainText('Original 日本語');
    expect(await context.locator('img,script,iframe,a').count()).toBe(0);expect(await page.evaluate(()=>window.graphPwned)).toBeUndefined();
    await expect(context.getByText('Not selected',{exact:true})).toHaveCount(0);
    await expect(context.getByRole('button',{name:'Kontext übergeben'})).toHaveCount(0);
    await expect(context.getByText('Die Kontextübergabe steht in der eingebetteten MCP-App zur Verfügung.')).toBeVisible();
    for(const width of [320,720,1280]) {
      await page.setViewportSize({width,height:900});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await page.screenshot({path:`/private/tmp/agdf-cockpit-context-${width}.png`,fullPage:true});
    }
    expect(remote).toEqual([]);expect(await page.evaluate(()=>[localStorage.length,sessionStorage.length])).toEqual([0,0]);
  } finally {await service.close();expect(hashes(f.root)).toEqual(before);f.close();}
});
test('SCN-003/007/028/031: real repository, pointer + keyboard, focus, source fidelity and unchanged bytes', async ({ page }) => {
  const root = resolve(import.meta.dirname, '../../../..'), before = hashes(root), service = await startControlServer({ dir: root });
  const remote = [], errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('request', request => { if (!request.url().startsWith(service.origin)) remote.push(request.url()); expect(request.url()).not.toContain(service.secret); });
  try {
    await openSession(page, service); await page.screenshot({ path: '/private/tmp/agdf-cockpit-overview.png', fullPage: true });
    await page.getByRole('searchbox').fill('agdf-control-cockpit-20261005-01'); await page.getByRole('button', { name: 'Local read-only AGDF control cockpit', exact: true }).click();
    await expect(page.locator('.page-title h1')).toBeFocused(); await expect(page.getByRole('heading', { name: 'So geht dein Vorhaben weiter' })).toBeVisible();
    await expect(page.getByRole('button',{name:'Zusammenfassung',exact:true})).toHaveAttribute('aria-pressed','true');
    await page.getByRole('button',{name:'Details',exact:true}).click();
    await page.screenshot({ path: '/private/tmp/agdf-cockpit-detail.png', fullPage: true });
    const document = page.locator('.resources button').filter({ hasText: /\/UR\.md/ }); await document.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.page-title h1')).toBeFocused(); await expect(page.locator('article.document')).toContainText('Local read-only AGDF control cockpit');
    await expect(page.getByRole('group', {name:'Ansicht'})).toHaveCount(0);
    const expectedSource = fs.readFileSync(join(root, '.agdf/control/artefacts/agdf-control-cockpit-20261005-01/UR.md'), 'utf8'); expect(expectedSource).toContain('Local read-only AGDF control cockpit');
    await page.screenshot({ path: '/private/tmp/agdf-cockpit-document.png', fullPage: true });
    await page.getByRole('navigation', {name:'Vorhaben-Pfad'}).getByRole('button', {name:'Local read-only AGDF control cockpit',exact:true}).click(); await expect(document).toBeFocused();
    await expect(page.getByRole('button', {name:'Details',exact:true})).toHaveAttribute('aria-pressed','true');
    await page.getByRole('button', { name: 'Alle Vorhaben', exact: true }).click(); await expect(page.getByRole('button', { name: 'Local read-only AGDF control cockpit', exact: true })).toBeFocused();
    // Complete the entire journey with each input method, including the return controls.
    for (const keyboard of [false, true]) {
      const activate = async button => { if (keyboard) { await button.focus(); await page.keyboard.press('Enter'); } else await button.click(); };
      await activate(page.getByRole('button', { name: 'Local read-only AGDF control cockpit', exact: true }));
      await expect(page.locator('.page-title h1')).toBeFocused();
      await activate(page.getByRole('button',{name:'Details',exact:true}));
      await activate(document); await expect(page.locator('.page-title h1')).toBeFocused();
      await activate(page.getByRole('button',{name:'Dokument schließen',exact:true})); await expect(document).toBeFocused();
      await activate(page.getByRole('button', { name: 'Alle Vorhaben', exact: true }));
      await expect(page.getByRole('button', { name: 'Local read-only AGDF control cockpit', exact: true })).toBeFocused();
    }
    await page.setViewportSize({ width: 390, height: 844 }); await page.screenshot({ path: '/private/tmp/agdf-cockpit-mobile.png' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]); expect(remote).toEqual([]); expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  } finally { await service.close(); expect(hashes(root)).toEqual(before); }
});
test('SCN-005/010/012/028: visible invalid run, persisted discrepancy, missing and unsupported documents', async ({ page }) => {
  const f = fixture();
  fs.mkdirSync(join(f.root, '.agdf/control/runs/broken')); fs.writeFileSync(join(f.root, '.agdf/control/runs/broken/RUN_STATE.md'), 'invalid');
  fs.unlinkSync(join(f.root, f.documentPath));
  const service = await startControlServer({ dir: f.root });
  try {
    await openSession(page, service); await expect(page.getByText('Teilweise verfügbar', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'broken', exact: true }).click(); await expect(page.getByText('Dieser Run ist ungültig. Die Quelldaten außerhalb des Cockpits prüfen.')).toBeVisible();
    await page.getByRole('button', { name: 'Alle Vorhaben', exact: true }).click();
    await page.locator('.run-link[data-focus-id="fixture-a"]').click();
    await expect(page.getByText('Die gespeicherte Angabe weicht von der Core-Auswertung ab. Beide Quellen sind getrennt dargestellt; die Core-Auswertung bestimmt den Kontrollstatus.')).toBeVisible();
    await page.getByRole('button',{name:'Details',exact:true}).click();
    await page.getByText('Kontrollstatus und Quellen', {exact:true}).click(); await expect(page.getByText('QA', { exact: true })).toBeVisible(); await expect(page.getByText('UAT', { exact: true })).toBeVisible();
    await page.locator('.resources button').filter({ hasText: /\/UR\.md/ }).click(); await expect(page.getByText('Das registrierte Dokument fehlt. Quelle prüfen und erneut laden.')).toBeVisible();
    await page.screenshot({ path: '/private/tmp/agdf-cockpit-missing.png' });
    fs.writeFileSync(join(f.root, f.documentPath), Buffer.from([255]));
    await page.getByRole('button', { name: /^(Neu laden|Daten aktualisieren)$/ }).click(); await expect(page.getByText('Dieses Dokument kann nicht als UTF-8-Markdown, JSON oder Text angezeigt werden.')).toBeVisible();
    await page.screenshot({ path: '/private/tmp/agdf-cockpit-unsupported.png' });
  } finally { await service.close(); f.close(); }
});
test('SCN-009/014/018/024: hostile document, stale reload, retry and removed selection', async ({ page }) => {
  const f = fixture(); fs.writeFileSync(join(f.root, f.documentPath), '# Hostile document\n\nOriginal 日本語.\n\n<script>window.pwned=true</script>\n\n![remote](https://evil.invalid/img)\n\n[foreign](https://evil.invalid)\n');
  const service = await startControlServer({ dir: f.root }), remote = []; page.on('request', r => { if (!r.url().startsWith(service.origin)) remote.push(r.url()); });
  try {
    await openSession(page, service); await page.locator('.run-link[data-focus-id="fixture-a"]').click(); await page.getByRole('button',{name:'Details',exact:true}).click();
    await page.locator('.resources button').filter({ hasText: /\/UR\.md/ }).click();
    await expect(page.locator('article.document')).toContainText('Original 日本語'); expect(await page.evaluate(() => window.pwned)).toBeUndefined(); expect(await page.locator('article.document img,article.document iframe,article.document script,article.document a').count()).toBe(0);
    fs.writeFileSync(join(f.root, f.documentPath), '# Updated document\nNew content');
    await expect(page.getByText('Die Quelldaten haben sich geändert. Angezeigte Inhalte gehören zum vorherigen Datenstand. Bewusst neu laden.')).toBeVisible({ timeout: 12_000 }); await expect(page.locator('article.document')).toContainText('Hostile document');
    await page.getByRole('button', { name: /^(Neu laden|Daten aktualisieren)$/ }).click(); await expect(page.locator('article.document')).toContainText('Updated document'); await expect(page.getByText('Die Quelldaten haben sich geändert. Angezeigte Inhalte gehören zum vorherigen Datenstand. Bewusst neu laden.')).toHaveCount(0);
    let fail = true; await page.route('**/api/snapshot', route => { if (fail) { fail = false; return route.abort(); } return route.continue(); });
    await page.getByRole('button', { name: /^(Neu laden|Daten aktualisieren)$/ }).click(); await expect(page.getByRole('button', { name: 'Wiederholen' })).toBeVisible(); await page.getByRole('button', { name: 'Wiederholen' }).click(); await expect(page.locator('article.document')).toContainText('Updated document');
    fs.rmSync(join(f.root, '.agdf/control/runs/fixture-a'), { recursive: true }); await page.getByRole('button', { name: /^(Neu laden|Daten aktualisieren)$/ }).click(); await expect(page.getByRole('heading', { name: 'Run-Übersicht' })).toBeVisible(); await expect(page.getByText(/Der ausgewählte Run ist nicht mehr vorhanden/)).toBeVisible(); expect(remote).toEqual([]);
  } finally { await service.close(); f.close(); }
});

test('sticky card and document headers, sliding view selector and narrow summary retain source identity', async ({ page }) => {
  const f=fixture();
  fs.writeFileSync(join(f.root,f.documentPath),'# Long original source\n\n'+Array.from({length:80},(_,i)=>`Original source paragraph ${i}. Exact content.\n\n`).join(''));
  const before=hashes(f.root),service=await startControlServer({dir:f.root}),remote=[];
  page.on('request',r=>{if(!r.url().startsWith(service.origin))remote.push(r.url());});
  const pinned=async()=>{
    const header=page.locator('.cockpit-brand-header');
    await expect.poll(async()=>Math.abs((await header.boundingBox()).y)).toBeLessThanOrEqual(1);
    expect(await header.evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+20,r.y+20));})).toBe(true);
    expect(await header.evaluate(e=>getComputedStyle(e).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
    await expect(header.getByRole('button',{name:'Neu laden',exact:true})).toBeVisible();
  };
  try {
    await page.setViewportSize({width:800,height:400});await openSession(page,service,'/card.html');
    await page.getByRole('combobox',{name:'Run auswählen',exact:true}).selectOption('fixture-a');
    await expect(page.locator('.work-step')).toBeVisible();
    await page.locator('.work-step-evidence summary').click();
    await page.evaluate(()=>window.scrollTo(0,160));await pinned();
    await page.screenshot({path:'/private/tmp/agdf-cockpit-sticky-card.png'});
    await page.getByRole('button',{name:'Run ansehen',exact:true}).click();
    const slider=page.getByRole('group',{name:'Ansicht',exact:true});await expect(slider).toBeVisible();
    await expect(slider).toHaveAttribute('data-mode','summary');
    await page.getByRole('button',{name:'Details',exact:true}).click();
    await expect(slider).toHaveAttribute('data-mode','details');
    await expect.poll(()=>slider.evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e,'::before').transform).m41)).toBeGreaterThan(0);
    await page.getByRole('button',{name:'Zusammenfassung',exact:true}).focus();
    await page.getByRole('button',{name:'Zusammenfassung',exact:true}).press('Space');
    await expect(slider).toHaveAttribute('data-mode','summary');
    await expect.poll(()=>slider.evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e,'::before').transform).m41)).toBe(0);
    await page.screenshot({path:'/private/tmp/agdf-cockpit-sliding-summary.png'});
    await page.getByRole('button',{name:'Details',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Dokumente',exact:true})).toBeVisible();
    await page.setViewportSize({width:560,height:400});await expect(slider).toBeHidden();
    await expect(page.getByRole('heading',{name:'Dokumente',exact:true})).toHaveCount(0);
    await page.setViewportSize({width:800,height:400});await expect(slider).toBeVisible();
    await expect(page.getByRole('button',{name:'Zusammenfassung',exact:true})).toHaveAttribute('aria-pressed','true');
    await page.emulateMedia({reducedMotion:'reduce'});
    expect(await slider.evaluate(e=>parseFloat(getComputedStyle(e,'::before').transitionDuration))).toBeLessThanOrEqual(.001);
    await page.getByRole('button',{name:'Anforderungen öffnen',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Long original source',exact:true})).toBeVisible();
    await expect(page.getByRole('group',{name:'Ansicht',exact:true})).toHaveCount(0);
    await page.evaluate(()=>window.scrollTo(0,300));await pinned();
    await page.screenshot({path:'/private/tmp/agdf-cockpit-sticky-document.png'});
    await page.getByRole('button',{name:'Dokument schließen',exact:true}).click();
    const source=page.getByRole('button',{name:'Anforderungen öffnen',exact:true});await expect(source).toBeFocused();
    const h=await page.locator('.cockpit-brand-header').boundingBox(),r=await source.boundingBox();expect(r.y).toBeGreaterThanOrEqual(h.y+h.height-1);
    expect(remote).toEqual([]);
  } finally {await service.close();expect(hashes(f.root)).toEqual(before);f.close();}
});

test('summary leads with the work step and stale reads never claim a missing Run or current control',async({page})=>{
  const f=fixture(),service=await startControlServer({dir:f.root});
  try {
    await page.setViewportSize({width:800,height:900});
    await openSession(page,service,'/card.html');
    await page.getByRole('combobox',{name:'Run auswählen',exact:true}).selectOption('fixture-a');
    await page.getByRole('button',{name:'Run ansehen',exact:true}).click();
    await page.getByRole('button',{name:'Zusammenfassung',exact:true}).click();
    await expect(page.locator('.run-goal')).not.toHaveAttribute('open');
    await expect(page.locator('.work-step-evidence')).not.toHaveAttribute('open');
    await expect(page.getByRole('button',{name:'Stand des Vorhabens öffnen',exact:true})).toBeVisible();
    const order=await page.evaluate(()=>{const work=document.querySelector('.work-step'),goal=document.querySelector('.run-goal');return !!(work.compareDocumentPosition(goal)&Node.DOCUMENT_POSITION_FOLLOWING);});
    expect(order).toBe(true);
    await page.screenshot({path:'/private/tmp/agdf-cockpit-summary-current.png'});
    fs.writeFileSync(f.runPath,sealRunState(f.root,fs.readFileSync(f.runPath,'utf8')+'\n\nUpdated fixture observation.\n'));
    const afterChange=hashes(f.root);
    await expect(page.getByRole('heading',{name:'Zuletzt beobachteter Arbeitsschritt'})).toBeVisible({timeout:12_000});
    await expect(page.locator('.reading-feedback .notice')).toHaveCount(1);
    await expect(page.getByText(/Angefragter Run:/)).toHaveCount(0);
    await expect(page.getByText('Die Kontrollauswertung weist diesen Schritt als offen aus.',{exact:true})).toHaveCount(0);
    await expect(page.locator('footer')).toContainText('Veraltet');
    await page.screenshot({path:'/private/tmp/agdf-cockpit-summary-stale.png'});
    await page.getByRole('button',{name:'Daten aktualisieren',exact:true}).click();
    await expect(page.getByRole('heading',{name:'So geht dein Vorhaben weiter'})).toBeVisible();
    await expect(page.locator('.reading-feedback .notice')).toHaveCount(0);
    await expect(page.locator('footer')).toContainText('Verfügbar');
    expect(hashes(f.root)).toEqual(afterChange);
  } finally {await service.close();f.close();}
});

test('Pages surface recipes survive neutral host colors in light and dark across all views',async({page,context})=>{
  const f=fixture(),before=hashes(f.root),service=await startControlServer({dir:f.root});
  const root=resolve(import.meta.dirname,'../../../..'),reference=await context.newPage();
  const recipe=fs.readFileSync(join(root,'pages/src/styles/design-tokens.css'),'utf8')+'\n'+fs.readFileSync(join(root,'pages/src/styles/surfaces.css'),'utf8');
  await reference.route(service.origin+'/__pages-reference',r=>r.fulfill({contentType:'text/html',body:`<!doctype html><html><style>${recipe}</style><article class="surface">Source surface</article><article class="surface controlled-card">Controlled source surface</article><a class="text-link">Source link</a></html>`}));
  await reference.goto(service.origin+'/__pages-reference');
  const styles=locator=>locator.evaluate(e=>{const s=getComputedStyle(e);return{bg:s.backgroundColor,border:s.borderTopColor,radius:s.borderRadius,shadow:s.boxShadow,color:s.color,weight:s.fontWeight};});
  const contrast=(foreground,background,canvas)=>{
    const rgba=color=>{const v=color.match(/[\d.]+/g).map(Number);return color.startsWith('color(')?[...v.slice(0,3).map(n=>n*255),v[3]??1]:[...v.slice(0,3),v[3]??1];};
    const blend=(a,b)=>a.slice(0,3).map((v,i)=>v*a[3]+b[i]*(1-a[3]));
    const bg=blend(rgba(background),rgba(canvas)),fg=blend(rgba(foreground),bg);
    const luminance=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const a=luminance(fg),b=luminance(bg);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  };
  const observations=[];
  try{
    await page.setViewportSize({width:800,height:900});await openSession(page,service,'/card.html');
    await page.route(service.origin+'/__neutral-host.css',r=>r.fulfill({contentType:'text/css',body:':root{--color-background-primary:white;--color-background-secondary:#f5f5f5;--color-text-primary:#1a1c1f;--color-text-secondary:#999;--color-border-secondary:rgba(26,28,31,.08)}html,body{font-family:Arial,sans-serif!important}'}));
    await page.addStyleTag({url:service.origin+'/__neutral-host.css'});
    await page.getByRole('combobox',{name:'Run auswählen',exact:true}).selectOption('fixture-a');await expect(page.locator('.work-step')).toBeVisible();
    const inspect=async(view,selector,controlled=false)=>{
      for(const theme of ['light','dark']){
        await page.mouse.move(0,0);await reference.mouse.move(0,0);
        await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);await reference.evaluate(t=>document.documentElement.dataset.theme=t,theme);
        const actual=await styles(page.locator(selector)),expected=await styles(reference.locator(controlled?'.controlled-card':'.surface').first());
        for(const key of ['bg','border','radius','shadow'])expect(actual[key],`${view}/${theme}/${key}`).toBe(expected[key]);
        const canvas=await page.locator('.mcp-entry').evaluate(e=>getComputedStyle(e).backgroundColor);
        expect(canvas).toBe(theme==='dark'?'rgb(2, 6, 23)':'rgb(248, 250, 252)');expect(contrast(actual.color,actual.bg,canvas)).toBeGreaterThanOrEqual(4.5);
        if(controlled)expect(actual.border).not.toBe((await styles(reference.locator('.surface').first())).border);
        if(view==='run'){
          const link=await styles(page.locator('.work-step .text-link').first()),referenceLink=await styles(reference.locator('.text-link'));
          expect(link.weight).toBe('600');expect(link.color).toBe(referenceLink.color);expect(contrast(link.color,actual.bg,canvas)).toBeGreaterThanOrEqual(4.5);
          await page.locator('.work-step .text-link').first().hover();await reference.locator('.text-link').hover();
          const hover=await styles(page.locator('.work-step .text-link').first());expect(hover.color).toBe((await styles(reference.locator('.text-link'))).color);expect(hover.bg).toBe('rgba(0, 0, 0, 0)');
          expect(contrast(hover.color,actual.bg,canvas)).toBeGreaterThanOrEqual(4.5);await page.mouse.move(0,0);
        }
        observations.push({view,theme,...actual,canvas});await page.screenshot({path:`/private/tmp/agdf-cockpit-brand-${view}-${theme}.png`});
      }
    };
    await inspect('card','.compact-cockpit');await inspect('card-step','.work-step',true);
    await page.getByRole('button',{name:'Run ansehen',exact:true}).click();
    await expect(page.getByRole('button',{name:'Zusammenfassung',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.getByRole('heading',{name:'Dokumente',exact:true})).toHaveCount(0);
    await inspect('run','.work-step',true);await page.getByRole('button',{name:'Anforderungen öffnen',exact:true}).click();
    await expect(page.locator('article.document')).toBeVisible();await inspect('document','article.document');
    await page.getByRole('button',{name:'Dokument schließen',exact:true}).click();await expect(page.getByRole('button',{name:'Zusammenfassung',exact:true})).toHaveAttribute('aria-pressed','true');
    await page.getByRole('button',{name:'Alle Vorhaben',exact:true}).click();await inspect('list','main > div[aria-busy] > .panel');
    fs.writeFileSync('/private/tmp/agdf-cockpit-brand-observations.json',JSON.stringify(observations,null,2));
  }finally{await reference.close();await service.close();expect(hashes(f.root)).toEqual(before);f.close();}
});
