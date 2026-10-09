import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { startControlServer, evidencePath } from './server-fixture.mjs';
import { fixture as canonicalFixture } from '../../../core/test/control-cockpit-fixtures.js';
import { sealRunState } from '../../../core/lib/control-state/run-seal.js';
import { READ_LIMITS } from '../../../core/lib/control-read/snapshot.js';

// Stored pointers are explicit fixture inputs; Run creation does not populate the backlog.
function fixture(){
 const f=canonicalFixture();
 fs.writeFileSync(join(f.root,'.agdf/control/MASTER_BACKLOG.md'),'# Master Backlog\n\n## Active Backlog\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n| 1 | fixture-a | Fixture document | In progress | [UR](artefacts/fixture-a/UR.md) | UR | Stored next step |\n\n## Planned / Parking Lot\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n\n## Completed / Superseded Pointers\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n| fixture-completed | Completed fixture | Completed | none | Stored outcome |\n');
 return f;
}
function repositoryFixture(){
 const f=canonicalFixture(),source=resolve(import.meta.dirname,'../../../..');
 fs.rmSync(join(f.root,'.agdf/control'),{recursive:true});fs.cpSync(join(source,'.agdf/control'),join(f.root,'.agdf/control'),{recursive:true});
 // Preserve actual registered source bytes; supply explicit valid stored pointers only in this disposable copy.
 fs.writeFileSync(join(f.root,'.agdf/control/MASTER_BACKLOG.md'),'# Master Backlog\n\n## Active Backlog\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n| 1 | agdf-cockpit-mcp-app-20261005-01 | Embedded AGDF Cockpit for Codex | In progress | none | TP | Stored next step |\n| 2 | agdf-control-cockpit-20261005-01 | Local read-only AGDF control cockpit | In progress | none | TP | Stored next step |\n\n## Planned / Parking Lot\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n\n## Completed / Superseded Pointers\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n');
 return f;
}
function hashes(root) {
  const data = {};
  const visit = dir => { for (const name of fs.readdirSync(dir)) { const path = join(dir, name), stats = fs.lstatSync(path); data[path.slice(root.length)] = stats.isDirectory() ? 'directory' : createHash('sha256').update(fs.readFileSync(path)).digest('hex'); if (stats.isDirectory()) visit(path); } };
  visit(join(root, '.agdf/control')); return data;
}
test('document orientation separates approved Run facts from draft originals in both Pages themes', async ({page}) => {
  const f=repositoryFixture(),root=f.root,before=hashes(root),service=await startControlServer({dir:root});
  try {
    await openSession(page,service);
    await page.locator('.run-link[data-focus-id="agdf-cockpit-mcp-app-20261005-01"]').click();
    await page.locator('.work-step-approvals > summary').click();
    const approval=page.locator('.work-step-approvals li').filter({hasText:'Anforderungen · freigegeben'}).first();
    const gap=await approval.evaluate(el=>({labelBottom:el.querySelector('strong').getBoundingClientRect().bottom,buttonTop:el.querySelector('button').getBoundingClientRect().top}));
    expect(gap.buttonTop).toBeGreaterThan(gap.labelBottom);
    const source=page.getByRole('button',{name:'Anforderungen ansehen',exact:true});
    await source.focus();await page.keyboard.press('Enter');
    await expect(page.locator('.page-title h1')).toBeFocused();
    await expect(page.locator('.page-title h1')).toHaveCSS('outline-style','none');
    await expect(page.locator('.page-title h1')).toHaveCSS('text-decoration-line','underline');
    await expect(page.locator('.document-summary')).toContainText('Das vorhandene React-Cockpit soll als eingebettete MCP-App in Codex nutzbar werden.');
    await expect(page.locator('.document-control')).toContainText('Freigegeben');
    // Copied repository controls retain their original target binding; a saved
    // approval cannot confirm permission in the disposable target.
    await expect(page.locator('.document-control')).toContainText('Aktuelle Voraussetzungen nicht bestätigt');
    await expect(page.locator('.document-original')).not.toHaveAttribute('open');
    await expect(page.locator('.document-provenance')).not.toHaveAttribute('open');
    await expect(page.locator('.document')).not.toBeVisible();
    for(const theme of ['light','dark']) {
      await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
      for(const width of [320,560,800,1280]) {
        await page.setViewportSize({width,height:900});
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
        await expect(page.locator('.document-summary')).toHaveCSS('font-family','Inter, system-ui, sans-serif');
        const geometry=await page.locator('.document-reading').evaluate(e=>{
          const box=e.getBoundingClientRect(),main=e.closest('main').getBoundingClientRect(),s=getComputedStyle(e);
          const edges=['.page-title','.document-context','.document-provenance','.document-original','.context-toggle'].map(selector=>e.querySelector(selector).getBoundingClientRect().left);
          return {left:box.left-main.left,right:main.right-box.right,width:box.width,paddingLeft:s.paddingLeft,paddingRight:s.paddingRight,edges};
        });
        expect(Math.abs(geometry.left-geometry.right)).toBeLessThanOrEqual(1);
        expect(geometry.paddingLeft).toBe(geometry.paddingRight);
        expect(Math.max(...geometry.edges)-Math.min(...geometry.edges)).toBeLessThanOrEqual(1);
        expect(geometry.width).toBeLessThanOrEqual(850);
        await expect(page.locator('.document-reading')).toHaveCSS('background-color',theme==='light'?'rgb(252, 252, 252)':'rgb(15, 23, 42)');
        await expect(page.locator('.document-reading .context-panel')).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
        await expect(page.locator('.document-reading .context-panel')).toHaveCSS('box-shadow','none');
        await expect(page.locator('.context-toggle')).toHaveCSS('min-height','44px');
        await page.screenshot({path:evidencePath(`agdf-cockpit-document-orientation-${theme}-${width}.png`),fullPage:true});
      }
    }
    await page.locator('.document-provenance > summary').click();
    await expect(page.locator('.document-provenance')).toContainText('.agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/UR.md');
    await page.locator('.document-original > summary').focus();await page.keyboard.press('Space');
    await expect(page.locator('article.document')).toBeVisible();
    await expect(page.locator('article.document')).toContainText('Status: draft');
    await expect(page.locator('article.document')).toContainText('Gate approval: open');
    await expect(page.locator('article.document')).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
    await expect(page.locator('article.document')).toHaveCSS('box-shadow','none');
    await page.getByRole('button',{name:'Dokument schließen',exact:true}).click();
    await expect(page.getByRole('button',{name:'Anforderungen ansehen',exact:true})).toBeFocused();
    // Capture the same bound document through the embedded-card browser entry,
    // whose expanded reader shares the MCP panel layout without the browser rail.
    await page.setViewportSize({width:845,height:1100});
    await openSession(page,service,'/card.html');
    await page.locator('.run-link[data-focus-id=\"agdf-cockpit-mcp-app-20261005-01\"]').click();
    await page.getByRole('button',{name:'Run ansehen',exact:true}).click();
    await page.locator('.work-step-approvals > summary').click();
    await page.getByRole('button',{name:'Anforderungen ansehen',exact:true}).click();
    await expect(page.locator('.document-reading')).toBeVisible();
    await expect(page.locator('.document-original')).not.toHaveAttribute('open');
    for(const theme of ['light','dark']){
      await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
      await expect(page.locator('.context-toggle')).toHaveCSS('color',theme==='light'?'rgb(15, 118, 110)':'rgb(94, 234, 212)');
      await page.screenshot({path:evidencePath(`agdf-cockpit-reading-panel-${theme}-845.png`),fullPage:true});
    }
  }finally{await service.close();expect(hashes(root)).toEqual(before);f.close();}
});
async function openSession(page, service, pathname = '/') {
  await page.addInitScript(({ secret, origin, pathname }) => { if (location.origin === origin) history.replaceState(null, '', pathname + '#' + secret); }, { secret: service.secret, origin: service.origin, pathname });
  await page.goto(service.origin + pathname);
  await expect(page.getByRole('heading', { name: pathname === '/card.html' ? 'AGDF Cockpit' : 'Gespeicherte Vorhaben',level:1 })).toBeVisible({ timeout: 12_000 });
  if (pathname === '/card.html') await expect(page.locator('.undertaking-list .run-link').first()).toBeEnabled({ timeout: 12_000 });
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
          await page.screenshot({path:evidencePath(`agdf-cockpit-pages-${view}-${theme}-${width}.png`)});
          expect(geometry.scrollWidth,JSON.stringify(geometry.overflow)).toBeLessThanOrEqual(width);
        }
      }
    };
    await page.locator('.run-link[data-focus-id=\"fixture-a\"]').click();
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
    if(!await page.locator('.work-step-evidence').evaluate(e=>e.open)) await page.locator('.work-step-evidence > summary').click();await page.getByRole('button',{name:'Anforderungen öffnen',exact:true}).click();
    await page.getByText('Originaldokument lesen',{exact:true}).click();
    await inspect('document','.document p');
    await expect(page.locator('.document')).toHaveCSS('font-size','16px');
    await page.getByRole('button',{name:'Dokument schließen',exact:true}).click();
    await page.getByRole('button',{name:'Alle Vorhaben',exact:true}).click();
    await inspect('list','.run-link[data-focus-id="fixture-a"]');
    expect(remote).toEqual([]);
    fs.writeFileSync(evidencePath('agdf-cockpit-pages-alignment-observations.json'),JSON.stringify(observations,null,2));
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
      await page.screenshot({path:evidencePath(`agdf-cockpit-context-${width}.png`),fullPage:true});
    }
    expect(remote).toEqual([]);expect(await page.evaluate(()=>[localStorage.length,sessionStorage.length])).toEqual([0,0]);
  } finally {await service.close();expect(hashes(f.root)).toEqual(before);f.close();}
});
test('SCN-003/007/028/031: copied repository sources, explicit stored pointers, keyboard focus, source fidelity and unchanged bytes', async ({ page }) => {
  const f=repositoryFixture(),root=f.root,before=hashes(root),service=await startControlServer({dir:root});
  const remote = [], errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('request', request => { if (!request.url().startsWith(service.origin)) remote.push(request.url()); expect(request.url()).not.toContain(service.secret); });
  try {
    await openSession(page, service); await page.screenshot({ path: evidencePath('agdf-cockpit-overview.png'), fullPage: true });
    await page.getByRole('searchbox').fill('agdf-control-cockpit-20261005-01'); await page.getByRole('button', { name: 'Local read-only AGDF control cockpit', exact: true }).click();
    await expect(page.locator('.page-title h1')).toBeFocused(); await expect(page.getByRole('region', { name: 'Zuletzt beobachteter Arbeitsschritt' })).toBeVisible();
    await expect(page.locator('.work-step-prerequisites')).toContainText('Aktuelle Voraussetzungen nicht bestätigt');
    await expect(page.getByRole('button',{name:'Zusammenfassung',exact:true})).toHaveAttribute('aria-pressed','true');
    await page.getByRole('button',{name:'Details',exact:true}).click();
    await expect(page.getByRole('button',{name:'Details',exact:true})).toHaveAttribute('aria-pressed','true');
    // Chromium's full-page capture temporarily sets a one-pixel viewport and
    // legitimately triggers the narrow summary rule. Preserve this journey's
    // actual wide reading surface while recording its visible appearance.
    await page.screenshot({ path: evidencePath('agdf-cockpit-detail.png'), fullPage: false });
    await expect(page.getByRole('button',{name:'Details',exact:true})).toHaveAttribute('aria-pressed','true');
    const document = page.locator('.resources button').filter({ hasText: /\/UR\.md/ }); await document.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.page-title h1')).toBeFocused(); await page.getByText('Originaldokument lesen',{exact:true}).click(); await expect(page.locator('article.document')).toContainText('Local read-only AGDF control cockpit');
    await expect(page.getByRole('group', {name:'Ansicht'})).toHaveCount(0);
    const expectedSource = fs.readFileSync(join(root, '.agdf/control/artefacts/agdf-control-cockpit-20261005-01/UR.md'), 'utf8'); expect(expectedSource).toContain('Local read-only AGDF control cockpit');
    await page.screenshot({ path: evidencePath('agdf-cockpit-document.png'), fullPage: true });
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
      await activate(page.getByRole('button',{name:'Dokument schließen',exact:true}));
      // Returning reads the Run again; check focus after that bounded operation settles.
      await expect(page.getByRole('button',{name:'Neu laden',exact:true})).toBeEnabled({timeout: READ_LIMITS.timeout});
      await expect(document).toBeFocused();
      await activate(page.getByRole('button', { name: 'Alle Vorhaben', exact: true }));
      await expect(page.getByRole('button', { name: 'Local read-only AGDF control cockpit', exact: true })).toBeFocused();
    }
    await page.setViewportSize({ width: 390, height: 844 }); await page.screenshot({ path: evidencePath('agdf-cockpit-mobile.png') });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]); expect(remote).toEqual([]); expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  } finally { await service.close(); expect(hashes(root)).toEqual(before); f.close(); }
});
test('SCN-005/010/012/028: visible invalid run, persisted discrepancy, missing and unsupported documents', async ({ page }) => {
  const f = fixture();
  fs.mkdirSync(join(f.root, '.agdf/control/runs/broken')); fs.writeFileSync(join(f.root, '.agdf/control/runs/broken/RUN_STATE.md'), 'invalid');
  const backlog=join(f.root,'.agdf/control/MASTER_BACKLOG.md');fs.writeFileSync(backlog,fs.readFileSync(backlog,'utf8').replace('## Planned / Parking Lot','| 2 | broken | Broken stored pointer | In progress | none | none | Check source |\n\n## Planned / Parking Lot'));
  fs.unlinkSync(join(f.root, f.documentPath));
  const service = await startControlServer({ dir: f.root });
  try {
    await openSession(page, service); await expect(page.getByText('Gespeicherter Stand laut Backlog: In progress', { exact: true }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Broken stored pointer', exact: true }).click(); await expect(page.getByText('Dieser Run ist ungültig. Die Quelldaten außerhalb des Cockpits prüfen.')).toBeVisible();
    await page.getByRole('button', { name: 'Alle Vorhaben', exact: true }).click();
    await page.locator('.run-link[data-focus-id="fixture-a"]').click();
    await expect(page.getByText('Die gespeicherte Angabe weicht von der Core-Auswertung ab. Beide Quellen sind getrennt dargestellt; die Core-Auswertung bestimmt den Kontrollstatus.')).toBeVisible();
    await page.getByRole('button',{name:'Details',exact:true}).click();
    await page.getByText('Kontrollstatus und Quellen', {exact:true}).click(); await expect(page.getByText('QA', { exact: true })).toBeVisible(); await expect(page.getByText('UAT', { exact: true })).toBeVisible();
    await page.locator('.resources button').filter({ hasText: /\/UR\.md/ }).click(); await expect(page.getByText('Das registrierte Dokument fehlt. Quelle prüfen und erneut laden.')).toBeVisible();
    await page.screenshot({ path: evidencePath('agdf-cockpit-missing.png') });
    fs.writeFileSync(join(f.root, f.documentPath), Buffer.from([255]));
    await page.getByRole('button', { name: /^(Neu laden|Daten aktualisieren)$/ }).click(); await expect(page.getByText('Dieses Dokument kann nicht als UTF-8-Markdown, JSON oder Text angezeigt werden.')).toBeVisible();
    await page.screenshot({ path: evidencePath('agdf-cockpit-unsupported.png') });
  } finally { await service.close(); f.close(); }
});
test('SCN-009/014/018/024: hostile document, stale reload, retry and removed selection', async ({ page }) => {
  const f = fixture(); fs.writeFileSync(join(f.root, f.documentPath), '# Hostile document\n\nOriginal 日本語.\n\n<script>window.pwned=true</script>\n\n![remote](https://evil.invalid/img)\n\n[foreign](https://evil.invalid)\n');
  const service = await startControlServer({ dir: f.root }), remote = []; page.on('request', r => { if (!r.url().startsWith(service.origin)) remote.push(r.url()); });
  try {
    await openSession(page, service); await page.locator('.run-link[data-focus-id="fixture-a"]').click(); await page.getByRole('button',{name:'Details',exact:true}).click();
    await page.locator('.resources button').filter({ hasText: /\/UR\.md/ }).click();
    await page.getByText('Originaldokument lesen',{exact:true}).click();
    await expect(page.locator('article.document')).toContainText('Original 日本語'); expect(await page.evaluate(() => window.pwned)).toBeUndefined(); expect(await page.locator('article.document img,article.document iframe,article.document script,article.document a').count()).toBe(0);
    fs.writeFileSync(join(f.root, f.documentPath), '# Updated document\nNew content');
    await expect(page.getByRole('button', { name: 'Quelle geändert · Neu laden' })).toBeVisible({ timeout: 12_000 }); await expect(page.locator('.refresh-update-dot')).toBeVisible(); await expect(page.locator('article.document')).toContainText('Hostile document');
    await page.getByRole('button', { name: 'Quelle geändert · Neu laden' }).click(); await expect(page.locator('article.document')).toContainText('Updated document'); await expect(page.locator('.refresh-update-dot')).toHaveCount(0); await expect(page.getByText('Die Quelldaten haben sich geändert. Angezeigte Inhalte gehören zum vorherigen Datenstand. Bewusst neu laden.')).toHaveCount(0);
    let fail = true; await page.route('**/api/snapshot*', route => { if (fail) { fail = false; return route.abort(); } return route.continue(); });
    await page.getByRole('button', { name: /^(Neu laden|Daten aktualisieren)$/ }).click(); await expect(page.getByRole('button', { name: 'Wiederholen', exact: true })).toBeVisible(); await page.getByRole('button', { name: 'Wiederholen', exact: true }).click();
    // The previous source remains visible during retry. Wait for the new read to
    // settle before removing its Run, rather than mutating an in-flight capture.
    await expect(page.getByRole('button', { name: 'Neu laden', exact: true })).toBeEnabled({ timeout: READ_LIMITS.timeout });
    await expect(page.getByRole('button', { name: 'Wiederholen', exact: true })).toHaveCount(0);
    await expect(page.locator('article.document')).toContainText('Updated document');
    fs.rmSync(join(f.root, '.agdf/control/runs/fixture-a'), { recursive: true }); await page.getByRole('button', { name: /^(Neu laden|Daten aktualisieren)$/ }).click(); await expect(page.getByRole('heading', { name: 'Gespeicherte Vorhaben',level:1 })).toBeVisible(); await expect(page.getByText(/Der ausgewählte Run ist nicht mehr vorhanden/)).toBeVisible(); expect(remote).toEqual([]);
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
    await page.locator('.run-link[data-focus-id=\"fixture-a\"]').click();
    await expect(page.locator('.work-step')).toBeVisible();
    await page.locator('.work-step-approvals > summary').click();
    await page.evaluate(()=>window.scrollTo(0,160));await pinned();
    await page.screenshot({path:evidencePath('agdf-cockpit-sticky-card.png')});
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
    await page.screenshot({path:evidencePath('agdf-cockpit-sliding-summary.png')});
    await page.getByRole('button',{name:'Details',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Dokumente',exact:true})).toBeVisible();
    await page.setViewportSize({width:560,height:400});await expect(slider).toBeHidden();
    await expect(page.getByRole('heading',{name:'Dokumente',exact:true})).toHaveCount(0);
    await page.setViewportSize({width:800,height:400});await expect(slider).toBeVisible();
    await expect(page.getByRole('button',{name:'Zusammenfassung',exact:true})).toHaveAttribute('aria-pressed','true');
    await page.emulateMedia({reducedMotion:'reduce'});
    expect(await slider.evaluate(e=>parseFloat(getComputedStyle(e,'::before').transitionDuration))).toBeLessThanOrEqual(.001);
    if(!await page.locator('.work-step-evidence').evaluate(e=>e.open)) await page.locator('.work-step-evidence > summary').click();await page.getByRole('button',{name:'Anforderungen öffnen',exact:true}).click();
    await page.getByText('Originaldokument lesen',{exact:true}).click();
    await expect(page.getByRole('heading',{name:'Long original source',exact:true})).toBeVisible();
    await expect(page.getByRole('group',{name:'Ansicht',exact:true})).toHaveCount(0);
    await page.evaluate(()=>window.scrollTo(0,300));await pinned();
    await page.screenshot({path:evidencePath('agdf-cockpit-sticky-document.png')});
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
    await page.locator('.run-link[data-focus-id=\"fixture-a\"]').click();
    await page.getByRole('button',{name:'Run ansehen',exact:true}).click();
    await page.getByRole('button',{name:'Zusammenfassung',exact:true}).click();
    await expect(page.locator('.run-goal')).not.toHaveAttribute('open');
    await expect(page.locator('.work-step-evidence[open]')).toHaveCount(0);
    await expect(page.locator('.work-step-approvals')).not.toHaveAttribute('open');
    await expect(page.locator('.work-step-prerequisites')).toContainText('Vor der Weiterarbeit klären');
    await expect(page.locator('.work-step-evidence')).toContainText('Nachweis');
    await expect(page.getByRole('button',{name:'Stand des Vorhabens öffnen',exact:true})).toBeVisible();
    const order=await page.evaluate(()=>{const work=document.querySelector('.work-step'),goal=document.querySelector('.run-goal');return !!(work.compareDocumentPosition(goal)&Node.DOCUMENT_POSITION_FOLLOWING);});
    expect(order).toBe(true);
    await page.screenshot({path:evidencePath('agdf-cockpit-summary-current.png')});
    const refreshed = page.waitForResponse(response => new URL(response.url()).pathname === '/api/snapshot' && new URL(response.url()).searchParams.get('run_id') === 'fixture-a');
    fs.writeFileSync(f.runPath,sealRunState(f.root,fs.readFileSync(f.runPath,'utf8')+'\n\nUpdated fixture observation.\n'));
    const afterChange=hashes(f.root);
    await refreshed;
    await expect(page.getByRole('region',{name:'So geht dein Vorhaben weiter'})).toBeVisible();
    await expect(page.getByText(/Angefragter Run:/)).toHaveCount(0);
    await expect(page.locator('.reading-feedback .notice')).toHaveCount(0);
    await expect(page.locator('footer')).toContainText('Verfügbar');
    await expect(page.locator('.work-step-evidence[open]')).toHaveCount(0);
    await expect(page.locator('.work-step-approvals')).not.toHaveAttribute('open');
    expect(hashes(f.root)).toEqual(afterChange);
  } finally {await service.close();f.close();}
});

test('neutral light reading planes and Pages dark surfaces survive host colors across all views',async({page,context})=>{
  const f=fixture(),before=hashes(f.root),service=await startControlServer({dir:f.root});
  const root=resolve(import.meta.dirname,'../../../..'),reference=await context.newPage();
  const recipe=fs.readFileSync(join(root,'pages/src/styles/design-tokens.css'),'utf8')+'\n'+fs.readFileSync(join(root,'pages/src/styles/surfaces.css'),'utf8');
  await reference.route(service.origin+'/__pages-reference',r=>r.fulfill({contentType:'text/html',body:`<!doctype html><html><style>${recipe}</style><article class="surface">Source surface</article><article class="surface controlled-card">Controlled source surface</article><a class="text-link">Source link</a></html>`}));
  await reference.goto(service.origin+'/__pages-reference');
  const styles=locator=>locator.evaluate(e=>{const s=getComputedStyle(e);return{bg:s.backgroundColor,border:s.borderTopColor,radius:s.borderRadius,shadow:s.boxShadow,color:s.color,weight:s.fontWeight,accent:s.borderInlineStartColor,accentWidth:s.borderInlineStartWidth};});
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
    await page.locator('.run-link[data-focus-id=\"fixture-a\"]').click();await expect(page.locator('.work-step')).toBeVisible();
    const inspect=async(view,selector,controlled=false)=>{
      for(const theme of ['light','dark']){
        await page.mouse.move(0,0);await reference.mouse.move(0,0);
        await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);await reference.evaluate(t=>document.documentElement.dataset.theme=t,theme);
        const actual=await styles(page.locator(selector)),expected=await styles(reference.locator(controlled?'.controlled-card':'.surface').first());
        for(const key of theme==='dark'?['bg','border','radius','shadow']:['radius'])expect(actual[key],`${view}/${theme}/${key}`).toBe(expected[key]);
        const canvas=await page.locator('.mcp-entry').evaluate(e=>getComputedStyle(e).backgroundColor);
        expect(canvas).toBe(theme==='dark'?'rgb(2, 6, 23)':'rgb(252, 252, 252)');expect(contrast(actual.color,actual.bg,canvas)).toBeGreaterThanOrEqual(4.5);
        const separation=contrast(actual.bg,canvas,canvas);
        // Light reading planes use spacing and subtle gray grouping, without raised cards.
        if(theme==='dark')expect(separation,`${view}/${theme}/surface separation`).toBeGreaterThanOrEqual(1.12);
        expect(actual.bg).toBe(theme==='dark'?'rgb(15, 23, 42)':controlled?'rgb(246, 246, 246)':'rgb(252, 252, 252)');
        expect(actual.border).toBe(theme==='dark'?'rgb(71, 85, 105)':controlled?'rgb(246, 246, 246)':'rgb(232, 232, 232)');
        if(theme==='light'){
          expect(actual.shadow).toBe('none');expect(actual.color).toBe('rgb(60, 62, 64)');
          if(view==='list'){
            await expect(page.locator('.backlog-switch button[aria-pressed="true"]')).toHaveCSS('background-color','rgb(239, 240, 240)');
            await expect(page.locator('.backlog-switch button[aria-pressed="true"]')).toHaveCSS('box-shadow','none');
          }
        }
        if(controlled){
          expect(actual.accentWidth).toBe(theme==='dark'?'3px':'1px');
          expect(actual.accent).toBe(theme==='dark'?'rgb(45, 212, 191)':'rgb(246, 246, 246)');
          if(theme==='dark'){expect(actual.accentWidth).toBe(expected.accentWidth);expect(actual.accent).toBe(expected.accent);}
        }
        if(view==='document'){
          const referenceLink=await styles(reference.locator('.text-link'));
          await expect.poll(async()=>(await styles(page.locator('.context-toggle'))).color).toBe(referenceLink.color);
          const access=await styles(page.locator('.context-toggle'));
          expect(access.bg).toBe('rgba(0, 0, 0, 0)');expect(access.shadow).toBe('none');
          expect(contrast(access.color,actual.bg,canvas)).toBeGreaterThanOrEqual(4.5);
        }
        if(view==='run'){
          if(!await page.locator('.work-step-evidence').evaluate(e=>e.open)) await page.locator('.work-step-evidence > summary').click();
          await expect.poll(async()=>(await styles(page.locator('.work-step-sources .text-link').first())).color).toBe((await styles(reference.locator('.text-link'))).color);
          const link=await styles(page.locator('.work-step-sources .text-link').first()),referenceLink=await styles(reference.locator('.text-link'));
          expect(link.weight).toBe('600');expect(link.color).toBe(referenceLink.color);expect(contrast(link.color,actual.bg,canvas)).toBeGreaterThanOrEqual(4.5);
          await page.locator('.work-step-sources .text-link').first().hover();await reference.locator('.text-link').hover();
          await expect.poll(async()=>(await styles(page.locator('.work-step-sources .text-link').first())).color).toBe((await styles(reference.locator('.text-link'))).color);
          const hover=await styles(page.locator('.work-step-sources .text-link').first());expect(hover.color).toBe((await styles(reference.locator('.text-link'))).color);expect(hover.bg).toBe('rgba(0, 0, 0, 0)');
          expect(contrast(hover.color,actual.bg,canvas)).toBeGreaterThanOrEqual(4.5);await page.mouse.move(0,0);
        }
        observations.push({view,theme,...actual,canvas,surfaceContrast:separation,textContrast:contrast(actual.color,actual.bg,canvas)});await page.screenshot({path:evidencePath(`agdf-cockpit-brand-${view}-${theme}.png`)});
      }
    };
    await inspect('card','.compact-cockpit');await inspect('card-step','.work-step',true);
    await page.getByRole('button',{name:'Run ansehen',exact:true}).click();
    await expect(page.getByRole('button',{name:'Zusammenfassung',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.getByRole('heading',{name:'Dokumente',exact:true})).toHaveCount(0);
    await inspect('run','.work-step',true);if(!await page.locator('.work-step-evidence').evaluate(e=>e.open)) await page.locator('.work-step-evidence > summary').click();await page.getByRole('button',{name:'Anforderungen öffnen',exact:true}).click();
    await page.getByText('Originaldokument lesen',{exact:true}).click();
    await expect(page.locator('article.document')).toBeVisible();await inspect('document','.document-reading');
    await page.getByRole('button',{name:'Dokument schließen',exact:true}).click();await expect(page.getByRole('button',{name:'Zusammenfassung',exact:true})).toHaveAttribute('aria-pressed','true');
    await page.getByRole('button',{name:'Alle Vorhaben',exact:true}).click();
    // Measure only the settled list; a loading pass replaces its panel and detached nodes report empty styles.
    await expect(page.locator('main > div[aria-busy="false"] > .panel')).toBeVisible();await inspect('list','main > div[aria-busy="false"] > .panel');
    fs.writeFileSync(evidencePath('agdf-cockpit-brand-observations.json'),JSON.stringify(observations,null,2));
  }finally{await reference.close();await service.close();expect(hashes(f.root)).toEqual(before);f.close();}
});

test('Pages action and type hierarchy retains the Cockpit neutral light palette',async({page,context})=>{
  const f=fixture(),before=hashes(f.root),service=await startControlServer({dir:f.root});
  const root=resolve(import.meta.dirname,'../../../..'),reference=await context.newPage();
  const assets=join(root,'pages/dist/_astro');
  const css=fs.readdirSync(assets).filter(n=>/^index\..*\.css$/.test(n)).map(n=>fs.readFileSync(join(assets,n),'utf8')).join('\n');
  expect(css.length).toBeGreaterThan(1000);
  const observations=[];
  const styles=l=>l.evaluate(e=>{const s=getComputedStyle(e);return{font:s.fontFamily,size:s.fontSize,line:s.lineHeight,weight:s.fontWeight,bg:s.backgroundColor,color:s.color,border:s.borderTopColor,radius:s.borderRadius,padding:s.padding};});
  try{
    await reference.route(service.origin+'/__pages-components',r=>r.fulfill({contentType:'text/html',body:`<!doctype html><html class="dark"><style>${css}</style><button class="btn-primary text-sm">Primary</button><button class="btn-ghost">Secondary</button><article class="surface p-6"><h4 class="text-xl font-bold">Work step</h4><p class="text-sm">Description</p></article></html>`}));
    await reference.route('**/*.woff2',r=>{const file=fs.readdirSync(assets).find(n=>r.request().url().endsWith(n));return file?r.fulfill({contentType:'font/woff2',body:fs.readFileSync(join(assets,file))}):r.abort();});
    await reference.goto(service.origin+'/__pages-components');
    await page.setViewportSize({width:800,height:900});await openSession(page,service,'/card.html');
    await page.locator('.run-link[data-focus-id=\"fixture-a\"]').click();
    await expect(page.locator('.work-step')).toBeVisible();
    const compare=async(view,actual,expected,keys)=>{
      for(const theme of ['light','dark']){
        await page.mouse.move(0,0);await reference.mouse.move(0,0);
        await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
        await reference.evaluate(t=>{document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.dataset.theme=t;},theme);
        const primary=view==='card';
        await expect(expected).toHaveCSS('color',primary?'rgb(255, 255, 255)':theme==='dark'?'rgb(241, 245, 249)':'rgb(15, 23, 42)');
        await expect(expected).toHaveCSS('background-color',primary?'rgb(15, 118, 110)':'rgba(0, 0, 0, 0)');
        const b=await styles(expected);
        const matchedKeys=theme==='light'&&!primary?keys.filter(k=>!['color','border'].includes(k)):keys;
        await expect.poll(async()=>{const v=await styles(actual);return Object.fromEntries(matchedKeys.map(k=>[k,v[k]]));}).toEqual(Object.fromEntries(matchedKeys.map(k=>[k,b[k]])));
        const a=await styles(actual);
        for(const key of matchedKeys)expect(a[key],`${view}/${theme}/${key}`).toBe(b[key]);
        if(theme==='light'&&!primary){expect(a.color).toBe('rgb(60, 62, 64)');expect(a.border).toBe('rgb(232, 232, 232)');}
        await actual.hover();await expected.hover();
        await expect(expected).toHaveCSS('color',primary?'rgb(255, 255, 255)':theme==='dark'?'rgb(153, 246, 228)':'rgb(15, 118, 110)');
        await expect(expected).toHaveCSS('background-color',primary?'rgb(17, 94, 89)':'rgba(0, 0, 0, 0)');
        const hoverReference=await styles(expected);
        await expect.poll(async()=>{const v=await styles(actual);return {bg:v.bg,color:v.color,border:v.border};}).toEqual({bg:hoverReference.bg,color:hoverReference.color,border:hoverReference.border});
        const ah=await styles(actual),bh=await styles(expected);
        for(const key of ['bg','color','border'])expect(ah[key],`${view}/${theme}/hover/${key}`).toBe(bh[key]);
        await page.mouse.move(0,0);await reference.mouse.move(0,0);
        // Shared recipes animate color only; normalize the capture after hover checks.
        await page.emulateMedia({reducedMotion:'reduce'});await reference.emulateMedia({reducedMotion:'reduce'});
        observations.push({view,theme,actual:a,reference:b,hover:ah});
        await page.screenshot({path:evidencePath(`agdf-cockpit-components-${view}-${theme}.png`)});
      }
    };
    const keys=['font','size','line','weight','bg','color','border','radius','padding'];
    // Disable transitions before assertions; color transitions are separately retained in CSS.
    await page.emulateMedia({reducedMotion:'reduce'});await reference.emulateMedia({reducedMotion:'reduce'});
    await compare('card',page.getByRole('button',{name:'Stand des Vorhabens öffnen',exact:true}),reference.getByRole('button',{name:'Primary',exact:true}),keys);
    await page.getByRole('button',{name:'Run ansehen',exact:true}).click();
    await expect(page.getByRole('button',{name:'Zusammenfassung',exact:true})).toHaveAttribute('aria-pressed','true');
    await compare('run',page.getByRole('button',{name:'Verknüpfter Kontext ansehen',exact:true}),reference.getByRole('button',{name:'Secondary',exact:true}),keys);
    await page.getByRole('button',{name:'Zusammenfassung',exact:true}).hover();
    await expect(page.getByRole('button',{name:'Zusammenfassung',exact:true})).toHaveCSS('border-top-color','rgba(0, 0, 0, 0)');
    await expect(page.locator('.work-step')).toHaveCSS('padding','24px');
    await expect(page.locator('.work-step h2')).toHaveCSS('line-height','28px');
    expect((await styles(page.locator('.work-step h2'))).line).toBe((await styles(reference.locator('h4'))).line);
    expect((await page.locator('.cockpit-brand-header').boundingBox()).height).toBe(72);
    await page.getByRole('button',{name:'Details',exact:true}).click();
    await expect(page.locator('.resources strong').first()).toHaveCSS('font-weight','600');
    await expect(page.locator('.resources small').first()).toHaveCSS('font-weight','400');
    await expect(page.locator('.resources button > span:not([aria-hidden])').first()).toHaveCSS('font-weight','400');
    await expect(page.locator('.resources button > span:not([aria-hidden])').first()).toHaveCSS('line-height','20px');
    await page.getByRole('button',{name:'Verknüpfter Kontext ansehen',exact:true}).hover();
    await expect(page.getByRole('button',{name:'Verknüpfter Kontext ansehen',exact:true})).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
    fs.writeFileSync(evidencePath('agdf-cockpit-components-observations.json'),JSON.stringify(observations,null,2));
  }finally{await reference.close();await service.close();expect(hashes(f.root)).toEqual(before);f.close();}
});


test('work action leads, qualifications stay honest and evidence access survives responsive keyboard navigation',async({page})=>{
  const f=fixture(),before=hashes(f.root),service=await startControlServer({dir:f.root});
  const observations=[];
  try{
    // Compare the rendered work unit with the existing production read DTO, not new UI rules.
    const headers={'x-agdf-session':service.secret};
    const snapshot=await(await page.request.get(service.origin+'/api/snapshot',{headers})).json();
    const detail=await(await page.request.get(service.origin+'/api/runs/fixture-a?snapshot='+snapshot.snapshot_id,{headers})).json();
    const e=detail.data.run.evaluation;
    await page.setViewportSize({width:800,height:900});await openSession(page,service,'/card.html');
    await page.locator('.run-link[data-focus-id=\"fixture-a\"]').click();
    await page.getByRole('button',{name:'Run ansehen',exact:true}).click();
    await expect(page.locator('.work-step-action')).toHaveText(e.next_action_de??e.next_allowed_action);
    await expect(page.locator('.work-step-approvals')).not.toHaveAttribute('open');
    await expect(page.locator('.work-step-prerequisites')).toContainText('Vor der Weiterarbeit klären');
    await page.getByText('Nachweise und offene Punkte · '+e.missing_evidence.length,{exact:true}).click();
    await page.getByText('Kontrollauswertung · Originalangaben',{exact:true}).click();
    await expect(page.locator('.work-step-facts')).toContainText(e.missing_approval);
    await page.getByText('Nachweise und offene Punkte · '+e.missing_evidence.length,{exact:true}).click();
    const count=e.missing_evidence.length;
    if(count){
      await expect(page.locator('.work-step-evidence[open]')).toHaveCount(0);
      const toggle=page.locator('.work-step-evidence > summary');
      await expect(toggle).toHaveText(`Nachweise und offene Punkte · ${count}`);
      await toggle.focus();await page.keyboard.press('Space');await expect(page.locator('.work-step-evidence')).toHaveAttribute('open','');
      await expect(page.locator('.work-step-evidence ul > li')).toHaveCount(count);
      await page.keyboard.press('Space');await expect(page.locator('.work-step-evidence[open]')).toHaveCount(0);
    }else await expect(page.locator('.work-step-evidence > summary')).toHaveText('Nachweise und offene Punkte · 0');
    for(const theme of ['light','dark']){
      await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
      for(const width of [320,560,800,1280]){
        await page.setViewportSize({width,height:900});
        const geometry=await page.locator('.work-step').evaluate(el=>({width:el.clientWidth,height:el.getBoundingClientRect().height,columns:getComputedStyle(el.querySelector('.work-step-support')).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth>innerWidth}));
        expect(geometry.overflow).toBe(false);expect(geometry.columns).toBe(1);
        observations.push({theme,viewport:width,...geometry});
        await page.screenshot({path:evidencePath(`agdf-cockpit-work-hierarchy-${theme}-${width}.png`)});
      }
    }
    const source=page.getByRole('button',{name:'Stand des Vorhabens öffnen',exact:true});
    await expect(source).toBeVisible();await source.focus();await page.keyboard.press('Enter');
    await expect(page.getByRole('button',{name:'Dokument schließen',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Dokument schließen',exact:true}).click();await expect(source).toBeFocused();
    await expect(page.getByRole('button',{name:'Zusammenfassung',exact:true})).toHaveAttribute('aria-pressed','true');
    fs.writeFileSync(evidencePath('agdf-cockpit-work-hierarchy-observations.json'),JSON.stringify(observations,null,2));
  }finally{await service.close();expect(hashes(f.root)).toEqual(before);f.close();}
});
