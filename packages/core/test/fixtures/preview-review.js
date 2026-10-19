import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { digest } from '../../lib/control-state/approval-command-contract.js';
import { artefactFileDigest } from '../../lib/control-state/run-seal.js';
import { syntheticPrd } from '../../../cli/scripts/fixtures/prd-definition.js';

export function previewFixture(root, runId = 'preview-test', urContent = '# UR\nPreview requirement: before_prd_interactive\n\n## Goal\nInspect interaction.\n') {
  const base = `.agdf/control/artefacts/${runId}/`, version = 'review-v1';
  const content = new Map([
    ['index.html', Buffer.from('<!doctype html><html><head><link rel="stylesheet" href="style.css"></head><body><h1>Illustrative approval screen</h1><button id="case">Missing proof</button><p id="result">Complete evidence</p><img src="pixel.png" alt="Example"><script src="main.js"></script></body></html>')],
    ['style.css', Buffer.from('body { color: #123; background: #fff; }')],
    ['main.js', Buffer.from('document.getElementById("case").onclick=()=>{document.getElementById("result").textContent="Important proof missing; unconfirmed policy";}')],
    ['pixel.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jC1sAAAAASUVORK5CYII=', 'base64')],
  ]);
  mkdirSync(join(root, base), { recursive: true }); writeFileSync(join(root, base + 'UR.md'), urContent);
  const types = { html: 'text/html', css: 'text/css', js: 'text/javascript', png: 'image/png' };
  const files = [...content].map(([name, data]) => {
    const path = base + `previews/${version}/${name}`;
    mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), data);
    return { path, digest: digest(data), bytes: data.length, media_type: types[name.split('.').at(-1)] };
  }).sort((a, b) => a.path < b.path ? -1 : 1);
  const descriptor = { schema_version: '1', version, source_ur_digest: artefactFileDigest(root, base + 'UR.md'),
    entry: base + `previews/${version}/index.html`, files, review_task: 'Inspect the complete and important missing-proof cases, then return without deciding.',
    scenarios: ['complete', 'important proof missing'], criterion_ids: ['AC-001'], open_questions: ['Should the example product allow an exception?'] };
  const prd = (row = descriptor) => syntheticPrd().replace('## AGDF Approval Summary', `## Preview Review\n\n\x60\x60\x60json\n${JSON.stringify(row, null, 2)}\n\x60\x60\x60\n\n## AGDF Approval Summary`);
  return { base, descriptor, prd, urContent, bytes: () => descriptor.files.map(f => ({ ...f, data: readFileSync(join(root, f.path)) })) };
}
