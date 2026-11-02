// Records only the current analytical result in the explicitly isolated fixture.
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {upsertTableRow} from '../../../../packages/core/lib/control-state/run-state-edits.js';
const root='/private/tmp/agdf-gate-qualification-414UKY/missing-ux';
const run='native-missing-ux', revision='d8319095-a754-4942-8bea-996bc3e9cebf';
const prefix=`.agdf/control/artefacts/${run}/`, state=`${root}/.agdf/control/runs/${run}/RUN_STATE.md`;
const before=readFileSync(state,'utf8');
if(!before.includes(`- revision_id: ${revision}\n`)) throw Error('Changed fixture revision');
const analysis=readFileSync(root+'/'+prefix+'UX_INTENT_DEFINITION.md','utf8');
if(!/^- decision: blocked$/m.test(analysis)) throw Error('Exact analytical result absent');
const content=upsertTableRow(before,'Artefacts',0,'UX Intent Definition',['UX Intent Definition',prefix+'UX_INTENT_DEFINITION.md','done','Analytical decision blocked; positive fixture lacks material source facts']);
writeFileSync(state,content);
const result=spawnSync(process.execPath,['/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-0ad3b168da8e/runtime/agdf-local.js','run-update','--dir',root,'--run',run,'--revision',revision,'--json'],{encoding:'utf8'});
writeFileSync('.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01/NATIVE_UX_RECORDING-01.json',result.stdout);
if(result.status!==0) throw Error(result.stdout+result.stderr);
console.log(result.stdout);
