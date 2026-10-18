# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: journeys.spec.mjs >> document orientation separates approved Run facts from draft originals in both Pages themes
- Location: test/browser/journeys.spec.mjs:35:1

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  locator('.page-title h1')
Expected: focused
Received: inactive
Timeout:  5000ms

Call log:
  - Expect "toBeFocused" locator('.page-title h1') with timeout 5000ms
  - waiting for locator('.page-title h1')
    14 × locator resolved to <h1 tabindex="-1">Enable the existing local AGDF cockpit as an embe…</h1>
       - unexpected value "inactive"

```

```yaml
- 'heading "Enable the existing local AGDF cockpit as an embedded MCP app in Codex: select a run, inspect registered artefacts and explicit Context Graph references, and use a checked selection for a contextual question while preserving canonical control authority." [level=1]'
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import * as fs from 'node:fs';
  3   | import { join, resolve } from 'node:path';
  4   | import { createHash } from 'node:crypto';
  5   | import { startControlServer, evidencePath } from './server-fixture.mjs';
  6   | import { approvalFixture, fixture as canonicalFixture } from '../../../core/test/control-cockpit-fixtures.js';
  7   | import { sealRunState } from '../../../core/lib/control-state/run-seal.js';
  8   | import { READ_LIMITS } from '../../../core/lib/control-read/snapshot.js';
  9   | 
  10  | // Stored pointers are explicit fixture inputs; Run creation does not populate the backlog.
  11  | function fixture(f=canonicalFixture()){
  12  |  fs.writeFileSync(join(f.root,'.agdf/control/MASTER_BACKLOG.md'),'# Master Backlog\n\n## Active Backlog\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n| 1 | fixture-a | Fixture document | In progress | [UR](artefacts/fixture-a/UR.md) | UR | Stored next step |\n\n## Planned / Parking Lot\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n\n## Completed / Superseded Pointers\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n| fixture-completed | Completed fixture | Completed | none | Stored outcome |\n');
  13  |  return f;
  14  | }
  15  | function repositoryFixture(){
  16  |  const f=canonicalFixture(),source=resolve(import.meta.dirname,'../../../..');
  17  |  fs.rmSync(join(f.root,'.agdf/control'),{recursive:true});fs.cpSync(join(source,'.agdf/control'),join(f.root,'.agdf/control'),{recursive:true});
  18  |  // Preserve actual registered source bytes; supply explicit valid stored pointers only in this disposable copy.
  19  |  fs.writeFileSync(join(f.root,'.agdf/control/MASTER_BACKLOG.md'),'# Master Backlog\n\n## Active Backlog\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n| 1 | agdf-cockpit-mcp-app-20261005-01 | Embedded AGDF Cockpit for Codex | In progress | none | TP | Stored next step |\n| 2 | agdf-control-cockpit-20261005-01 | Local read-only AGDF control cockpit | In progress | none | TP | Stored next step |\n\n## Planned / Parking Lot\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n\n## Completed / Superseded Pointers\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n');
  20  |  return f;
  21  | }
  22  | function unconfirmedRepositoryFixture(){
  23  |  const f=repositoryFixture();
  24  |  // Deliberate normalization-equivalent raw-byte change in the disposable copy.
  25  |  // Retain the recorded approval while making its exact opened version unconfirmed.
  26  |  const path=join(f.root,'.agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/UR.md');
  27  |  fs.writeFileSync(path,'\ufeff'+fs.readFileSync(path,'utf8').replace(/^\ufeff/,'').replaceAll('\r\n','\n').replaceAll('\n','\r\n'));
  28  |  return f;
  29  | }
  30  | function hashes(root) {
  31  |   const data = {};
  32  |   const visit = dir => { for (const name of fs.readdirSync(dir)) { const path = join(dir, name), stats = fs.lstatSync(path); data[path.slice(root.length)] = stats.isDirectory() ? 'directory' : createHash('sha256').update(fs.readFileSync(path)).digest('hex'); if (stats.isDirectory()) visit(path); } };
  33  |   visit(join(root, '.agdf/control')); return data;
  34  | }
  35  | test('document orientation separates approved Run facts from draft originals in both Pages themes', async ({page}) => {
  36  |   const f=unconfirmedRepositoryFixture(),root=f.root,before=hashes(root),service=await startControlServer({dir:root});
  37  |   try {
  38  |     await openSession(page,service);
  39  |     await page.locator('.run-link[data-focus-id="agdf-cockpit-mcp-app-20261005-01"]').click();
  40  |     await expect(page.locator('.run-documents')).toBeVisible();
  41  |     await expect(page.locator('.run-documents details')).toHaveCount(0);
  42  |     const source=page.getByRole('button',{name:/^Aktuelle Fassung ansehen: Anforderungen$/});
  43  |     await source.focus();await page.keyboard.press('Enter');
> 44  |     await expect(page.locator('.page-title h1')).toBeFocused();
      |                                                  ^ Error: expect(locator).toBeFocused() failed
  45  |     await expect(page.locator('.page-title h1')).toHaveCSS('outline-style','none');
  46  |     await expect(page.locator('.page-title h1')).toHaveCSS('text-decoration-line','underline');
  47  |     await expect(page.locator('.document-summary')).toContainText('Das vorhandene React-Cockpit soll als eingebettete MCP-App in Codex nutzbar werden.');
  48  |     await expect(page.locator('.document-control')).toContainText('Als freigegeben gespeichert');
  49  |     // Copied repository controls retain their original target binding; a saved
  50  |     // approval cannot confirm permission in the disposable target.
  51  |     await expect(page.locator('.document-control')).toContainText('Aktuelle Voraussetzungen nicht bestätigt');
  52  |     await expect(page.locator('.document-original')).not.toHaveAttribute('open');
  53  |     await expect(page.locator('.document-provenance')).not.toHaveAttribute('open');
  54  |     await expect(page.locator('.document')).not.toBeVisible();
  55  |     for(const theme of ['light','dark']) {
  56  |       await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
  57  |       for(const width of [320,560,800,1280]) {
  58  |         await page.setViewportSize({width,height:900});
  59  |         expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  60  |         await expect(page.locator('.document-summary')).toHaveCSS('font-family','Inter, system-ui, sans-serif');
  61  |         const geometry=await page.locator('.document-reading').evaluate(e=>{
  62  |           const box=e.getBoundingClientRect(),main=e.closest('main').getBoundingClientRect(),s=getComputedStyle(e);
  63  |           const edges=['.page-title','.document-context','.document-provenance','.document-original','.context-toggle'].map(selector=>e.querySelector(selector).getBoundingClientRect().left);
  64  |           return {left:box.left-main.left,right:main.right-box.right,width:box.width,paddingLeft:s.paddingLeft,paddingRight:s.paddingRight,edges};
  65  |         });
  66  |         expect(Math.abs(geometry.left-geometry.right)).toBeLessThanOrEqual(1);
  67  |         expect(geometry.paddingLeft).toBe(geometry.paddingRight);
  68  |         expect(Math.max(...geometry.edges)-Math.min(...geometry.edges)).toBeLessThanOrEqual(1);
  69  |         expect(geometry.width).toBeLessThanOrEqual(850);
  70  |         await expect(page.locator('.document-reading')).toHaveCSS('background-color',theme==='light'?'rgb(252, 252, 252)':'rgb(15, 23, 42)');
  71  |         await expect(page.locator('.document-reading .context-panel')).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  72  |         await expect(page.locator('.document-reading .context-panel')).toHaveCSS('box-shadow','none');
  73  |         await expect(page.locator('.context-toggle')).toHaveCSS('min-height','44px');
  74  |         await page.screenshot({path:evidencePath(`agdf-cockpit-document-orientation-${theme}-${width}.png`),fullPage:true});
  75  |       }
  76  |     }
  77  |     await page.locator('.document-provenance > summary').click();
  78  |     await expect(page.locator('.document-provenance')).toContainText('.agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/UR.md');
  79  |     await page.locator('.document-original > summary').focus();await page.keyboard.press('Space');
  80  |     await expect(page.locator('article.document')).toBeVisible();
  81  |     await expect(page.locator('article.document')).toContainText('Status: draft');
  82  |     await expect(page.locator('article.document')).toContainText('Gate approval: open');
  83  |     await expect(page.locator('article.document')).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  84  |     await expect(page.locator('article.document')).toHaveCSS('box-shadow','none');
  85  |     await page.getByRole('button',{name:'Dokument schließen',exact:true}).click();
  86  |     await expect(page.getByRole('button',{name:/^Aktuelle Fassung ansehen: Anforderungen$/})).toBeFocused();
  87  |     // Capture the same bound document through the embedded-card browser entry,
  88  |     // whose expanded reader shares the MCP panel layout without the browser rail.
  89  |     await page.setViewportSize({width:845,height:1100});
  90  |     await openSession(page,service,'/card.html');
  91  |     await page.locator('.run-link[data-focus-id=\"agdf-cockpit-mcp-app-20261005-01\"]').click();
  92  |     await page.getByRole('button',{name:'Run ansehen',exact:true}).click();
  93  |     await expect(page.locator('.run-documents')).toBeVisible();
  94  |     await page.getByRole('button',{name:/^Aktuelle Fassung ansehen: Anforderungen$/}).click();
  95  |     await expect(page.locator('.document-reading')).toBeVisible();
  96  |     await expect(page.locator('.document-original')).not.toHaveAttribute('open');
  97  |     for(const theme of ['light','dark']){
  98  |       await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
  99  |       await expect(page.locator('.context-toggle')).toHaveCSS('color',theme==='light'?'rgb(15, 118, 110)':'rgb(94, 234, 212)');
  100 |       await page.screenshot({path:evidencePath(`agdf-cockpit-reading-panel-${theme}-845.png`),fullPage:true});
  101 |     }
  102 |   }finally{await service.close();expect(hashes(root)).toEqual(before);f.close();}
  103 | });
  104 | async function openSession(page, service, pathname = '/') {
  105 |   await page.addInitScript(({ secret, origin, pathname }) => { if (location.origin === origin) history.replaceState(null, '', pathname + '#' + secret); }, { secret: service.secret, origin: service.origin, pathname });
  106 |   await page.goto(service.origin + pathname);
  107 |   await expect(page.getByRole('heading', { name: pathname === '/card.html' ? 'AGDF Cockpit' : 'Gespeicherte Vorhaben',level:1 })).toBeVisible({ timeout: 12_000 });
  108 |   if (pathname === '/card.html') await expect(page.locator('.undertaking-list .run-link').first()).toBeEnabled({ timeout: 12_000 });
  109 |   expect(new URL(page.url()).hash).toBe('');
  110 | }
  111 | test('SCN-044: Pages fonts survive host body overrides across card, list, Run and document', async ({ page }) => {
  112 |   const f = fixture(), before = hashes(f.root), service = await startControlServer({ dir: f.root });
  113 |   const observations = [], remote = [];
  114 |   page.on('request', r => { if (!r.url().startsWith(service.origin)) remote.push(r.url()); });
  115 |   try {
  116 |     await openSession(page, service, '/card.html');
  117 |     // Reproduce the actual MCP host rule without overriding the application's container.
  118 |     // Keep the production self-only stylesheet CSP intact.
  119 |     await page.route(service.origin + '/__host-test.css', route => route.fulfill({
  120 |       contentType:'text/css', body:'html,body{font-family:Arial,sans-serif!important}button,input,textarea,select{font-family:inherit}'
  121 |     }));
  122 |     await page.addStyleTag({url:service.origin + '/__host-test.css'});
  123 |     await expect(page.locator('body')).toHaveCSS('font-family','Arial, sans-serif');
  124 |     const inspect = async (view, selector) => {
  125 |       await expect(page.locator(selector)).toBeVisible();
  126 |       await page.evaluate(() => document.fonts.ready);
  127 |       const fonts = await page.locator(selector).evaluate(e => {
  128 |         const s = getComputedStyle(e);
  129 |         return {family:s.fontFamily,size:s.fontSize,leading:s.lineHeight,loaded:Array.from(document.fonts).filter(f=>f.status==='loaded').map(f=>f.family)};
  130 |       });
  131 |       expect(fonts.family.split(',')[0].replaceAll('"','')).toBe('Inter');
  132 |       expect(fonts.loaded).toContain('Inter');
  133 |       expect(fonts.loaded).toContain('JetBrains Mono');
  134 |       for (const theme of ['light','dark']) {
  135 |         await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
  136 |         for (const width of [320,560,800,1280]) {
  137 |           await page.setViewportSize({width,height:900});
  138 |           const geometry = await page.evaluate(() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
  139 |             overflow:Array.from(document.querySelectorAll('body *')).filter(e=>e.getBoundingClientRect().right>innerWidth || e.scrollWidth>e.clientWidth && getComputedStyle(e).overflowX==='visible').slice(0,12).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.slice(0,90),right:e.getBoundingClientRect().right,client:e.clientWidth,scroll:e.scrollWidth}))}));
  140 |           observations.push({view,theme,...fonts,...geometry});
  141 |           await page.screenshot({path:evidencePath(`agdf-cockpit-pages-${view}-${theme}-${width}.png`)});
  142 |           expect(geometry.scrollWidth,JSON.stringify(geometry.overflow)).toBeLessThanOrEqual(width);
  143 |         }
  144 |       }
```