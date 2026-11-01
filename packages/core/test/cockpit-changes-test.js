import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { createCockpitSessionService } from '../lib/control-inspect/cockpit-session.js';
import { fixture, treeBytes } from './control-cockpit-fixtures.js';

const deadline = async promise => {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(Error('change notification missing')), 3000); })]); }
  finally { clearTimeout(timer); }
};
const replace = (path, text) => { fs.writeFileSync(path + '.replacement', text); fs.renameSync(path + '.replacement', path); };
test('atomic Run replacement makes every independent view stale and explicit refresh reissues only its selectors', async () => {
  const f=fixture(),service=createCockpitSessionService(f.root);
  try{
    const open=async run_id=>{const session_id=(await service.render())._meta.agdf_cockpit.session_id;const snapshot=await service.read({operation:'snapshot',session_id,...(run_id?{run_id}:{})});return {session_id,snapshot_id:snapshot.snapshot_id};};
    const a=await open(),b=await open(),run=await open('fixture-a');
    replace(f.runPath,fs.readFileSync(f.runPath,'utf8')+'\nRead-only change observation\n');
    const before=treeBytes(f.root);
    for(const view of [a,b,run])assert.equal((await service.read({operation:'freshness',...view})).code,'source_changed');
    const refreshed=await service.read({operation:'snapshot',session_id:a.session_id});assert.notEqual(refreshed.snapshot_id,a.snapshot_id);
    assert.equal((await service.read({operation:'freshness',session_id:a.session_id,snapshot_id:refreshed.snapshot_id})).data.unchanged,true);
    assert.equal((await service.read({operation:'changes',session_id:b.session_id,snapshot_id:a.snapshot_id})).code,'resource_denied');
    assert.deepEqual(treeBytes(f.root),before);
    const abort=new AbortController(),pending=service.read({operation:'changes',session_id:a.session_id,snapshot_id:refreshed.snapshot_id},abort.signal);abort.abort();assert.equal((await pending).code,'cancelled');
  }finally{await service.close();f.close();}
});
test('Run source replacement wakes only dependent views, and pending waits close with their session', async () => {
  const f = fixture(), service = createCockpitSessionService(f.root);
  try {
    const session_id = (await service.render({ run_id: 'fixture-a' }))._meta.agdf_cockpit.session_id;
    const snapshot = await service.read({ operation: 'snapshot', session_id, run_id: 'fixture-a' });
    const pending = service.read({ operation: 'changes', session_id, snapshot_id: snapshot.snapshot_id });
    replace(join(f.root, f.documentPath), '# Changed undertaking\n');
    assert.equal((await deadline(pending)).data.changed, true);
    const next = await service.read({ operation: 'snapshot', session_id, run_id: 'fixture-a' });
    const closing = service.read({ operation: 'changes', session_id, snapshot_id: next.snapshot_id });
    await service.read({ operation: 'close', session_id });
    assert.equal((await closing).code, 'cancelled');
  } finally { await service.close(); f.close(); }
});
