import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {createExpandedSourceRevisionFixture} from '../../cli/scripts/fixtures/expanded-source-revision.js';
import {sealRunState, runSealState} from '../lib/control-state/run-seal.js';
import {readSourceRevisions} from '../lib/control-state/run-source-revisions.js';
import {readHistoryBytes, readValidatedRevisionArchive, validateRevisionHistory} from '../lib/control-state/run-revision-history.js';

const root=mkdtempSync(join(tmpdir(),'agdf-large-run-')), seeds=mkdtempSync(join(tmpdir(),'agdf-large-seeds-'));
try {
  const cli=resolve(import.meta.dirname,'../../cli/bin/create-agdf.js');
  execFileSync('git',['init','-q',root]);
  execFileSync(process.execPath,[cli,'init','--dir',root,'--language','en']);
  const {f,service,restore,prepare}=createExpandedSourceRevisionFixture(root,cli,seeds);
  restore('QA');
  // Disposable fixture only: model the retained history of a long-lived valid Run.
  writeFileSync(f.state,sealRunState(root,readFileSync(f.state,'utf8')+'\n## Retained execution notes\n'+'history '.repeat(26000)+'\n'));
  const before=readFileSync(f.state);
  assert.ok(before.length>131072 && before.length<1048576);
  assert.equal(runSealState(root,before.toString()).status,'valid');
  const {input,preview}=prepare('UR');
  assert.equal(preview.outcome,'accepted',JSON.stringify(preview));
  assert.deepEqual(readFileSync(f.state),before,'Preview preserves exact live history');
  const apply={...input,command:{kind:'source_revision.apply',payload:{...input.command.payload,
    preview_digest:preview.family_result.preview_digest,confirmation:preview.family_result.confirmation_selector}}};
  const result=service('agdf_revise',apply);
  assert.equal(result.outcome,'accepted',JSON.stringify(result));
  const receipt=readSourceRevisions(readFileSync(f.state,'utf8')).receipts.at(-1);
  assert.equal(validateRevisionHistory(root,receipt),true);
  const archive=readValidatedRevisionArchive(root,receipt);
  const path=`.agdf/control/runs/${f.runId}/RUN_STATE.md`;
  assert.deepEqual(archive.archived.get(path),before,'Large state is archived byte for byte');
  assert.equal(service('agdf_revise',apply).outcome,'already_applied');
  const snapshot=archive.manifest.files.find(row=>row.path===path).snapshot;
  writeFileSync(join(root,snapshot),Buffer.concat([before.subarray(0,-1),Buffer.from('x')]));
  assert.equal(validateRevisionHistory(root,receipt),false,'Large archive still verifies exact bytes');
  const ordinary=f.prefix+'oversized-report.md';
  writeFileSync(join(root,ordinary),'x'.repeat(131073));
  assert.throws(()=>readHistoryBytes(root,ordinary),/AGDF_REVISION_HISTORY_INVALID/);
  const misleading=f.prefix+'RUN_STATE.md';
  writeFileSync(join(root,misleading),'x'.repeat(131073));
  assert.throws(()=>readHistoryBytes(root,misleading),/AGDF_REVISION_HISTORY_INVALID/);
  writeFileSync(f.state,'x'.repeat(1048577));
  assert.throws(()=>readHistoryBytes(root,path),/AGDF_REVISION_HISTORY_INVALID/,'Canonical state remains bounded');
  console.log('Large canonical Run preview/apply/archive/replay, tamper detection and unchanged document bounds passed (disposable fixture).');
} finally {rmSync(root,{recursive:true,force:true});rmSync(seeds,{recursive:true,force:true});}
