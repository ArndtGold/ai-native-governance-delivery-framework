// Reviewed production QA revise recording. Never an approval.
import {readFileSync,writeFileSync} from 'node:fs';
import {artefactFileDigest} from '../../../../packages/core/lib/control-state/run-seal.js';
import {resolveControlCommandTarget} from '../../../../packages/core/lib/control-state/approval-command-contract.js';
const root=process.cwd(),run='gate-internal-continuation-recovery-20261008-01',base=`.agdf/control/artefacts/${run}/`;
const expected_revision_id=readFileSync(`.agdf/control/runs/${run}/RUN_STATE.md`,'utf8').match(/^- revision_id: (.+)$/m)[1];
if(expected_revision_id!=='30619fa1-0189-4dff-bdb9-047849cb95c9')throw Error('Reviewed QA revision changed');
const destination={type:'QA_REPORT',path:base+'QA_REPORT.md',digest:artefactFileDigest(root,base+'QA_REPORT.md'),status:'revise'};
const source={type:'TP',path:base+'TP.md',digest:artefactFileDigest(root,base+'TP.md')};
const schema_version='1',target_id=resolveControlCommandTarget(root).target_id,relationship={from:'QA_REPORT',relationship:'tests',to:'TP'},reviewer='Codex';
const path=base+'QA_SOURCE_REVIEW-01.json';
writeFileSync(path,JSON.stringify({schema_version,target_id,run_id:run,destination,source,relationship,reviewer,reviewed:true},null,2)+'\n');
writeFileSync(base+'QA_RECORDING_INPUT-01.json',JSON.stringify({schema_version,target_id,run_id:run,expected_revision_id,destination,source,relationship,review:{reviewer,path,digest:artefactFileDigest(root,path)},update_draft:false},null,2)+'\n');
console.log('Exact QA revise source mapping prepared; approval not requested.');
