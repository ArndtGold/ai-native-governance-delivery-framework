import { test, expect } from '@playwright/test';
import { build } from 'vite';
import { createServer } from 'node:http';
import { readFileSync, mkdtempSync, rmSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPreviewPresentationFixture } from '../../../core/test/preview-presentation-test.js';
import { createDecisionSessionService } from '../../../core/lib/control-inspect/decision-session.js';
import { digest } from '../../../core/lib/control-state/approval-command-contract.js';
import registry from '../../../../plugins/agdf/meta/agdf-interaction-locales.json' with {type:'json'};
import { evidencePath } from './server-fixture.mjs';
let server, origin, temporary, view, fixture, sessions, requests = [];
test.beforeAll(async () => {
  temporary = mkdtempSync(join(tmpdir(), 'agdf-preview-browser-'));
  await build({ configFile: false, logLevel: 'error', define: {'process.env.NODE_ENV': JSON.stringify('production')}, build: { outDir: temporary, emptyOutDir: false,
    lib: { entry: new URL('./preview-host.tsx', import.meta.url).pathname, formats: ['es'], fileName: () => 'host.js' }, target: 'es2022', minify: false } });
  fixture = createPreviewPresentationFixture('preview-browser');
  const f = fixture.preview, files = f.bytes();
  const malicious = `
    for (const [name,run] of Object.entries({parent:()=>parent.document.body,storage:()=>localStorage.setItem('escape','yes'),eval:()=>eval('1+1'),host:()=>parent.window.openai.callTool({name:'approve'})})) {
      try {run();document.body.dataset[name]='escaped'} catch {document.body.dataset[name]='blocked'}
    }
    fetch('/leak').catch(()=>{}); const worker=()=>new Worker('/worker');try{worker()}catch{}
    const nav=document.createElement('button');nav.textContent='Navigation probe';nav.onclick=()=>location.href='${'http://127.0.0.1'}:1/leak';document.body.append(nav);
    parent.postMessage({type:'approve',action:'approve'},'*');
  `;
  files.find(file => file.path.endsWith('main.js')).data = Buffer.concat([files.find(file => file.path.endsWith('main.js')).data, Buffer.from(malicious)]);

  const host = readFileSync(join(temporary, 'host.js')), css = readFileSync(join(temporary, readdirSync(temporary).find(name=>name.endsWith('.css'))));
  server = createServer(async (req,res) => { requests.push(req.url);
    if(req.url==='/preview'){const result=await sessions.read({operation:'preview',session_id:view.read_session_id,snapshot_id:view.snapshot_id,run_id:view.binding.run_id,resource_id:view.preview.resource_id});res.writeHead(result.state==='available'?200:409,{'content-type':'text/html'});res.end(result.data?.preview?.content??'');return;}
    res.setHeader('content-type', req.url === '/host.js' ? 'text/javascript' : req.url === '/host.css' ? 'text/css' : 'text/html');
    res.end(req.url === '/host.js' ? host : req.url === '/host.css' ? css : '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/host.css"></head><body><div id="root"></div><script>window.previewView=' + JSON.stringify(view).replaceAll('<','\\u003c') + '</script><script type="module" src="/host.js"></script></body></html>');
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve)); origin = 'http://127.0.0.1:' + server.address().port;
  const asset=files.find(file=>file.path.endsWith('main.js'));asset.data=Buffer.from(asset.data.toString().replaceAll('http://127.0.0.1:1/leak',origin+'/leak'));
  writeFileSync(join(fixture.root,asset.path),asset.data);
  const row=f.descriptor.files.find(row=>row.path===asset.path);row.bytes=asset.data.length;row.digest=digest(asset.data);
  writeFileSync(fixture.f.file('PRD.md'),f.prd());expect(fixture.f.record(true).value.outcome).toBe('recorded');
  const input={...fixture.input,expected_revision_id:fixture.f.revision(),presentation_language:'de'};
  const prepared=fixture.command('agdf_prepare',input);sessions=createDecisionSessionService({appOnlyMediationQualified:true});
  view=(await sessions.open(input,prepared))._meta?.agdf_decision;expect(view?.preview).toBeTruthy();
});
test.afterAll(async () => { if(server?.listening) await new Promise(resolve=>server.close(resolve));await sessions?.close();if(fixture)rmSync(fixture.root,{recursive:true,force:true}); rmSync(temporary,{recursive:true,force:true}); });
for (const width of [736,360,320]) test(`Bound preview, missing proof and isolation at ${width}px (synthetic browser)`, async ({page}) => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));requests=[]; await page.setViewportSize({width,height:900}); await page.goto(origin); await expect.poll(()=>errors).toEqual([]);
  const open = page.getByRole('button',{name:/Vorschau.*review-v1/}); await expect(open).toBeVisible({timeout:5000});
  for (const question of fixture.preview.descriptor.open_questions) await expect(page.getByText(question,{exact:true})).toBeVisible();
  await expect(page.getByText(view.preview.task,{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:registry.locales.de.decisionCard.approve,exact:true})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:evidencePath(`agdf-preview-decision-${width}.png`),fullPage:true}); await open.click();
  const outer = page.frameLocator('iframe'), child = outer.frameLocator('iframe');
  await expect(child.locator('#case')).toBeVisible();
  await expect(page.getByText(registry.locales.de.decisionCard.previewLoading, {exact:true})).toHaveCount(0);
  await expect(page.getByText(registry.locales.de.decisionCard.previewUnsupported,{exact:true})).toHaveCount(0);expect(errors).toEqual([]);await child.locator('#case').click(); await expect(child.locator('#result')).toHaveText('Important proof missing; unconfirmed policy');
  await expect(child.locator('body')).toHaveAttribute('data-parent','blocked'); await expect(child.locator('body')).toHaveAttribute('data-storage','blocked');
  await expect(child.locator('body')).toHaveAttribute('data-eval','blocked'); await expect(child.locator('body')).toHaveAttribute('data-host','blocked');
  expect(await child.locator('img').evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
  expect(await page.evaluate(()=>window.decisions)).toBe(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await child.locator('body').evaluate(el=>el.scrollWidth<=el.ownerDocument.documentElement.clientWidth)).toBe(true);
  await page.screenshot({path:evidencePath(`agdf-preview-${width}.png`),fullPage:true});
  await child.getByRole('button',{name:'Navigation probe'}).click();
  await expect(page.getByText(registry.locales.de.decisionCard.previewUnsupported,{exact:false})).toBeVisible();
  expect(requests.some(url=>/leak|worker/.test(url))).toBe(false);
  await page.getByRole('button',{name:registry.locales.de.decisionCard.back,exact:true}).click(); await expect(open).toBeFocused();
  expect(await page.evaluate(()=>window.decisions)).toBe(0);
});
