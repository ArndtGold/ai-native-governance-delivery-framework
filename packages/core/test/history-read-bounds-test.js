import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,symlinkSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {readHistoryBytes,collectRevisionHistory} from '../lib/control-state/run-revision-history.js';
const root=mkdtempSync(join(tmpdir(),'agdf-history-bounds-'));
try {
  const own='.agdf/control/runs/own/RUN_STATE.md', foreign='.agdf/control/runs/other/RUN_STATE.md';
  for(const path of [own,foreign]) {mkdirSync(join(root,path,'..'),{recursive:true});writeFileSync(join(root,path),'x'.repeat(131073));}
  assert.equal(readHistoryBytes(root,own).length,131073);
  assert.equal(collectRevisionHistory(root,'own','00000000-0000-4000-8000-000000000001',[own]).files[0].bytes.length,131073);
  assert.throws(()=>collectRevisionHistory(root,'own','00000000-0000-4000-8000-000000000001',[foreign]),/AGDF_REVISION_HISTORY_INVALID/);
  const link='.agdf/control/runs/own/link.md';symlinkSync(join(root,own),join(root,link));
  assert.throws(()=>readHistoryBytes(root,link),/AGDF_REVISION_HISTORY_INVALID/);
  writeFileSync(join(root,own),'x'.repeat(1048576));assert.equal(readHistoryBytes(root,own).length,1048576);
  writeFileSync(join(root,own),'x'.repeat(1048577));assert.throws(()=>readHistoryBytes(root,own),/AGDF_REVISION_HISTORY_INVALID/);
  console.log('Exact canonical control bound, selected-Run archive bound and symlink rejection passed.');
} finally {rmSync(root,{recursive:true,force:true});}
