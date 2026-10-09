// Supporting native finding only; preserves the current QA report, status and approval bindings.
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {upsertTableRow} from '../../../../packages/core/lib/control-state/run-state-edits.js';
const root=process.cwd(),run='gate-internal-continuation-recovery-20261008-01',expected='7064bb28-49b6-4008-9258-e728d4115ce7';
const base=`.agdf/control/artefacts/${run}/`,state=`.agdf/control/runs/${run}/RUN_STATE.md`;
const before=readFileSync(state,'utf8');if(!before.includes(`- revision_id: ${expected}\n`))throw Error('Changed production binding');
const approved={UR:'47b5049fcdc03dce6c2968e8f972a7122d1be195529d1d7242d09207941d55c1',PRD:'4c78b38f0588e0784a2d2fb849995301d2bced94799a6deb87613ebe6bd2cb0b',SD:'cbba6550d7daf05f3233cb31dd4d1a9d587f41637e41f442372003a09005f596',TP:'7de5565692e344eaf8df8b2d5a0ba87605dc7492a2d88a09750c7794e6b6d957'};
for(const [key,value] of Object.entries(approved))if(createHash('sha256').update(readFileSync(base+key+'.md')).digest('hex')!==value)throw Error('Approved source changed: '+key);
const content=upsertTableRow(before,'Artefacts',0,'Native summary recovery evidence',['Native summary recovery evidence',base+'EVIDENCE_NATIVE-03.md','done','Actual authoring error corrected; field diagnosis/recovery finding NF-002 remains open']);
writeFileSync(state,content);
const cli='/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-0ad3b168da8e/runtime/agdf-local.js';
const r=spawnSync(process.execPath,[cli,'run-update','--dir',root,'--run',run,'--revision',expected,'--json'],{encoding:'utf8'});
writeFileSync(base+'NATIVE_FINDING_RECORDING-01.json',r.stdout);if(r.status!==0)throw Error(r.stdout+r.stderr);
const d=spawnSync(process.execPath,[cli,'doctor','--dir',root,'--run',run,'--json'],{encoding:'utf8'});
writeFileSync(base+'POST_SUMMARY_DOCTOR-01.json',d.stdout);if(d.status!==0)throw Error(d.stdout+d.stderr);
console.log(JSON.stringify({recording:JSON.parse(r.stdout),doctor_exit:d.status,approved_sources:'unchanged',QA:'revise retained, not newly approved'}));
