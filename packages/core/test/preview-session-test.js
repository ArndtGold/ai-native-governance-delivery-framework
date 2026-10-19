import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createPreviewPresentationFixture } from './preview-presentation-test.js';
import { createDecisionSessionService } from '../lib/control-inspect/decision-session.js';
import { createCoreServices } from '../lib/index.js';
import { digest } from '../lib/control-state/approval-command-contract.js';
import { COCKPIT_LIMITS } from '../lib/control-inspect/cockpit-contract.js';
import { parseControlInspectFunctionArguments } from '../lib/control-inspect/contract.js';
const { root, f, input, command, preview } = createPreviewPresentationFixture('preview-session');
let clock=Date.now(), expireDuringRead=false, clockReads=0;
const sessions = createDecisionSessionService({now:()=>{
  if (expireDuringRead && ++clockReads === 3) clock += COCKPIT_LIMITS.lifetime + 1;
  return clock;
}});
try {
  const entry=preview.descriptor.files.find(row=>row.path===preview.descriptor.entry), entryBytes=Buffer.from(readFileSync(join(root,entry.path),'utf8').replace('</body>','<p>'+'🙂'.repeat(22000)+'</p></body>'));
  writeFileSync(join(root,entry.path),entryBytes);entry.bytes=entryBytes.length;entry.digest=digest(entryBytes);
  writeFileSync(f.file('PRD.md'),preview.prd());assert.equal(f.record(true).value.outcome,'recorded');input.expected_revision_id=f.revision();
  const prepared = command('agdf_prepare', input), before = readFileSync(f.state, 'utf8');
  const opened = await sessions.open(input, prepared), view = opened._meta?.agdf_decision;
  assert.ok(view?.preview, JSON.stringify(opened));
  assert.deepEqual(view.preview.open_questions, preview.descriptor.open_questions); assert.equal(view.capability, 'not_qualified');
  const request = { operation: 'preview', session_id: view.read_session_id, snapshot_id: view.snapshot_id, run_id: f.runId, resource_id: view.preview.resource_id };
  const cancelled = new AbortController(); cancelled.abort();
  const cancelledRead = await sessions.read(request, cancelled.signal);
  assert.equal(cancelledRead.outcome, 'rejected', 'An aborted preview read must not disclose content');
  assert.equal(cancelledRead.reason, 'cancelled'); assert.equal(cancelledRead.data?.preview, undefined);
  const read = await sessions.read(request); assert.equal(read.state, 'available', JSON.stringify(read));
  assert.equal(read.authorizes, false); assert.equal(read.data.preview.content_digest, view.preview.content_digest);
  assert.ok(read.data.preview.content.includes('sandbox="allow-scripts"'));
  const inspectInput={operation:'presentation-preview',presentation_language:'en',working_directory:root,primary_target:root,target_source:'explicit_target',target_id:input.target_id,
    run_id:f.runId,gate:'PRD',expected_revision_id:f.revision(),presentation_id:view.binding.presentation_id};
  const core=createCoreServices(),inspect=args=>core.inspect(parseControlInspectFunctionArguments(args,{surface:'codex',expectedVersion:core.resources.pluginDefinition.version,interactionLocales:core.resources.interactionLocales}));let cursor,assembled='',offset=0,pages=0;
  do {const inspected=inspect({...inspectInput,...(cursor?{cursor}:{})});const page=inspected.report;assert.equal(page?.available,true,JSON.stringify(inspected));
    assert.equal(page.byte_start,offset);offset+=Buffer.byteLength(page.content);assert.equal(page.byte_end,offset);assert.equal(page.content.includes('\ufffd'),false);
    assembled+=page.content;cursor=page.next_cursor??undefined;pages++;
  }while(cursor);
  assert.ok(pages>2);assert.equal(assembled,read.data.preview.content);assert.equal(digest(assembled),view.preview.content_digest);
  assert.equal(inspect({...inspectInput,cursor:'0'.repeat(64)+':32768'}).report.available,false);
  for (const patch of [{ resource_id: view.resource_id }, { snapshot_id: randomUUID() }, { run_id: 'foreign' }, { session_id: view.session_id }, { path: 'index.html' }]) {
    assert.equal((await sessions.read({ ...request, ...patch })).outcome, 'rejected');
  }
  assert.equal(readFileSync(f.state, 'utf8'), before);
  const asset = join(root, preview.descriptor.files.find(row => row.path.endsWith('main.js')).path), original = readFileSync(asset);
  writeFileSync(asset, 'changed'); assert.equal((await sessions.read(request)).outcome, 'rejected');
  writeFileSync(asset, original); assert.equal((await sessions.read(request)).state, 'available');
  await sessions.read({ operation: 'close', session_id: view.read_session_id });
  assert.equal((await sessions.read(request)).reason, 'session_expired');
  const second=(await sessions.open(input,prepared))._meta.agdf_decision;
  expireDuringRead = true; clockReads = 0;
  const elapsed = await sessions.read({...request,session_id:second.read_session_id,snapshot_id:second.snapshot_id,resource_id:second.preview.resource_id});
  assert.equal(elapsed.reason, 'session_expired'); assert.equal(elapsed.data?.preview, undefined);
  expireDuringRead = false;
  const third=(await sessions.open(input,prepared))._meta.agdf_decision;
  clock+=COCKPIT_LIMITS.lifetime+1;
  assert.equal((await sessions.read({...request,session_id:third.read_session_id,snapshot_id:third.snapshot_id,resource_id:third.preview.resource_id})).reason,'session_expired');
  console.log('SCN-004/013/020/026: exact selectors, actual session/Inspect UTF-8 chunk assembly, source denial, retirement and expiry passed (synthetic session).');
} finally { await sessions.close(); rmSync(root, { recursive: true, force: true }); }
