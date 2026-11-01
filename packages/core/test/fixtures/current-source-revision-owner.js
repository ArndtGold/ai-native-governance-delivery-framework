// Current command boundary for source-revision integration tests. Private archive
// inspection stays read-only; every mutation carries the production resolution.
import { sourceRevisionConfirmation } from '../../lib/control-state/run-source-revisions.js';
import { createRunCommandService } from '../../lib/control-state/run-command-service.js';
import { resolveControlCommandTarget, canonicalJson, digest } from '../../lib/control-state/approval-command-contract.js';
import { artefactFileDigest } from '../../lib/control-state/run-seal.js';
import { readPendingSourceRevisionJournal } from '../../lib/control-state/run-step-transaction.js';
import { parseRunState } from '../../lib/control-state/run-state-parser.js';
import { inspectSourceRevision as inspectHistory } from '../../lib/control-state/run-revision.js';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
export { inspectSourceRevision } from '../../lib/control-state/run-revision.js';
function execute(root, input, action, options = {}) {
  const target = resolveControlCommandTarget(root), service = createRunCommandService({ checkpoint: options.afterWrite });
  const proposal = { path: input.evidence, digest: artefactFileDigest(target.root, input.evidence) };
  const envelope = { schema_version:'1',assurance:'cooperative_local',presentation_language:'en',working_directory:target.root,primary_target:target.root,
    target_source:'explicit_target',target_id:target.target_id,run_id:input.runId,expected_revision_id:input.revisionId,operation_id:input.operationId };
  const payload = { source_gate:input.sourceGate,proposal };
  if (action==='apply') {
    payload.preview_digest=input.previewDigest; payload.confirmation=sourceRevisionConfirmation(input);
  }
  if(action==='recover') {
    if(!existsSync(join(target.root,'.agdf/control/runs',input.runId,'control/RUN_STEP_PENDING.json'))){const observed=inspectHistory(root,input);return {...observed,outcome:observed.outcome==='historical'?'recovered':observed.outcome,status:'already_completed'};}
    let pending;try{pending=readPendingSourceRevisionJournal(target.root,input.runId);}catch(error){return {outcome:'recovery_required',reason:error.message};}
    payload.pending_digest=digest(canonicalJson(pending));envelope.expected_revision_id=parseRunState(readFileSync(join(target.root,'.agdf/control/runs',input.runId,'RUN_STATE.md'),'utf8')).meta.revision_id;payload.recovery_revision_id=envelope.expected_revision_id;
  }
  const result=service('agdf_revise',{...envelope,command:{kind:'source_revision.'+action,payload}});
  const family=result.family_result??{};
  return {...family,outcome:result.outcome==='accepted'?(action==='apply'?'reopened':action==='recover'?'recovered':'preview'):result.outcome==='already_applied'?'replayed':result.outcome==='effect_unknown'&&family.outcome==='recovery_required'?'recovery_required':result.outcome,reason:result.reason??family.reason};
}
export const previewSourceRevision=(root,input,options)=>execute(root,input,'preview',options);
export const applySourceRevision=(root,input,options)=>execute(root,input,'apply',options);
export const recoverSourceRevision=(root,input,options)=>execute(root,input,'recover',options);
