import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderPreview, PREVIEW_CSP } from '../lib/control-state/preview-render.js';
import { previewFixture } from './fixtures/preview-review.js';
import { projectCoreDependencies } from '../../../scripts/core-projection.mjs';
import { pathToFileURL } from 'node:url';
import { inspectPreviewReview, PREVIEW_LIMITS } from '../lib/control-state/preview-review.js';
import { digest } from '../lib/control-state/approval-command-contract.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-preview-render-'));
try {
  const f = previewFixture(root), bytes = f.bytes();
  const render = html => renderPreview(f.descriptor, bytes.map(file => file.path === f.descriptor.entry ? { ...file, data: Buffer.from(html) } : file));
  const valid = renderPreview(f.descriptor, bytes);
  assert.ok(valid.includes(PREVIEW_CSP)); assert.ok(valid.includes('data:image/png;base64,')); assert.ok(valid.includes('Important proof missing'));
  assert.ok(!valid.includes('src="main.js"')); assert.ok(!valid.includes('href="style.css"'));
  for (const html of ['<iframe src="https://example.com"></iframe>', '<base href="file:///">', '<script src="https://example.com/a.js"></script>',
    '<script type="module">import "./main.js"</script>', '<img src="missing.png">', '<img srcset="pixel.png 1x">', '<form><button>Approve</button></form>',
    '<a href="https://example.com">Go</a>', '<meta http-equiv="refresh" content="0;url=https://example.com">', '<button onclick="parent.approve()">Go</button>',
    '<style>body{background:url(https://example.com/a.png)}</style>', '<style>@import "missing.css";</style>', '<style>a{background:u\\72l(example.png)}</style>']) {
    assert.throws(() => render(html), /preview_/);
  }
  const injected = bytes.map(file => file.path.endsWith('main.js') ? { ...file, data: Buffer.from('</script><img src=x onerror=alert(1)>') } : file);
  assert.throws(() => renderPreview(f.descriptor, injected), /preview_script_unsupported/);
  const cycle = bytes.map(file => file.path.endsWith('style.css') ? { ...file, data: Buffer.from('@import "style.css";') } : file);
  assert.throws(() => renderPreview(f.descriptor, cycle), /preview_resource_cycle/);
  const badUtf8 = bytes.map(file => file.path === f.descriptor.entry ? { ...file, data: Buffer.from([0xff]) } : file);
  assert.throws(() => renderPreview(f.descriptor, badUtf8), /preview_encoding_invalid/);
  const imageCss = render('<style>p{background-image:url("pixel.png")}</style><p>Offline image</p>');
  assert.ok(imageCss.includes('data:image/png;base64,'));
  const standalone=join(root,'standalone'), dependencies=projectCoreDependencies(standalone);
  copyFileSync(new URL('../lib/control-state/preview-render.js',import.meta.url),join(standalone,'renderer.mjs'));
  const isolated=await import(pathToFileURL(join(standalone,'renderer.mjs')).href);
  assert.equal(isolated.renderPreview(f.descriptor,bytes),valid); assert.equal(dependencies.parse5,'7.3.0');assert.equal(dependencies.postcss,'8.5.29');
  const nestedFiles = bytes.map(file => file.path.endsWith('style.css')
    ? { ...file, data: Buffer.from('@import "styles/image.css";') } : file);
  nestedFiles.push({ path: f.descriptor.entry.replace('index.html', 'styles/image.css'), media_type: 'text/css',
    data: Buffer.from('p{background:url("../pixel.png")}') });
  assert.ok(renderPreview(f.descriptor, nestedFiles).includes('data:image/png;base64,'), 'Imported CSS resolves its images exactly once relative to the imported file');
  assert.ok(render('<style>p{color:red}</style><p style="color:blue">distinct inline styles</p>').includes('color:blue'));
  const expanded = [{ path: f.descriptor.entry, media_type: 'text/html', data: Buffer.from('<link rel="stylesheet" href="a0.css">') }];
  const basePath = f.descriptor.entry.replace('index.html', '');
  for (let i = 0; i < 13; ++i) expanded.push({ path: basePath + `a${i}.css`, media_type: 'text/css',
    data: Buffer.from(i === 12 ? 'p{--sample:' + 'x'.repeat(600) + '}' : `@import "a${i + 1}.css";\n`.repeat(2)) });
  assert.ok(expanded.reduce((total, file) => total + file.data.length, 0) < 2048);
  assert.throws(() => renderPreview(f.descriptor, expanded), /preview_render_limit/, 'A tiny acyclic import graph must fail before exponential materialization');
  console.log('CR-001/002: bounded acyclic CSS expansion, imported relative images and distinct inline styles passed.');
  const boundary=structuredClone(f.descriptor), base=boundary.entry.slice(0,-10), image=Buffer.alloc(65536);
  let markup='<img src="z.png">'.repeat(23);
  const bind = () => {
    const data=Buffer.from(markup);boundary.files=[{path:boundary.entry,digest:digest(data),bytes:data.length,media_type:'text/html'},
      {path:base+'z.png',digest:digest(image),bytes:image.length,media_type:'image/png'}];
    return [{...boundary.files[0],data},{...boundary.files[1],data:image}];
  };
  markup+='x'.repeat(PREVIEW_LIMITS.rendered-Buffer.byteLength(renderPreview(boundary,bind())));
  const inspect=()=>{const files=bind();return inspectPreviewReview(root,{runId:'preview-test',urContent:f.urContent,prdContent:f.prd(boundary),readBytes:path=>files.find(row=>row.path===path)?.data});};
  assert.equal(inspect().rendered_bytes,PREVIEW_LIMITS.rendered);markup+='x';assert.throws(inspect,/preview_render_limit/);
  console.log('SCN-019/023: isolated shipped parser closure and exact 2 MiB safe-output boundary passed.');
  console.log('SCN-003/008/023: static resources, binary embedding, CSP, unsupported syntax, cycles and encoding checks passed.');
} finally { rmSync(root, { recursive: true, force: true }); }
