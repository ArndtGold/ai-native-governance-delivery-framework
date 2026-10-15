import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const root='/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework';
const run='report-decision-field-hardening-20261014-01', prefix=`.agdf/control/artefacts/${run}/`;
const plugin='/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf';
const core=plugin+'/runtime/create-agdf/runtime/core/lib/';
const { readRunState }=await import(pathToFileURL(core+'control-evaluation/run-state.js'));
const { artefactFileDigest }=await import(pathToFileURL(core+'control-state/run-seal.js'));
const { evaluateCloseoutReadiness, closeoutConfirmation }=await import(pathToFileURL(core+'control-evaluation/closeout-readiness.js'));
const state=readRunState(root,{runId:run});
assert.equal(state.meta.revision_id,'2f7185af-51e3-4a62-bd4e-76a9eaa8a608');
const dispatch=JSON.parse(readFileSync(root+'/'+prefix+'evidence/live-dispatch-gate-check.result.json','utf8'));
const template=readFileSync(dispatch.continuation.template_path,'utf8');
assert.equal(dispatch.continuation.template_path,plugin+'/control/templates/artefacts/OR.md');
assert.ok(template.startsWith('# OR:'));
const protectedSources=JSON.parse(readFileSync(root+'/'+prefix+'evidence/protected-sources.json','utf8')).map(row=>{
 const current=createHash('sha256').update(readFileSync(root+'/'+row.path)).digest('hex');
 assert.equal(current,row.digest);return {...row,current};
});
const qaDigest=artefactFileDigest(root,state.artefacts.get('QA').path);
assert.equal(qaDigest,'sha256:bbeea4a4b89fb2a550865d6bf7319e4c9baf345e51038a20bf3199b1343c9d43');
const types=['UR','Brownfield Review','PRD','SD','TP','Brownfield Analysis','CD+Tests','TP Review','Clean Implementation Review','CR','QA','UAT'];
const rows=types.map(type=>`| ${type} | ${state.approvals.get(type)?.status??state.artefacts.get(type)?.status} | ${state.artefacts.get(type)?.path||state.approvals.get(type)?.evidence} |`).join('\n');
const parent=state.reconciliation_state.parent_reconciliation;
const programme=state.reconciliation_state.programme_aggregation;
assert.equal(parent.outcome,'not_applicable');assert.equal(programme.applicable,false);
const report=`# OR: Harden authored report decisions and qualify the installed plugin

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done

## Run

- run_id: ${run}
- related_ur: ${state.artefacts.get('UR').path}
- related_prd: ${state.artefacts.get('PRD').path}
- related_sd: ${state.artefacts.get('SD').path}
- related_tp: ${state.artefacts.get('TP').path}
- related_qa_report: ${state.artefacts.get('QA').path}
- mode_slice_decision: structured_slice
- current_gate: OR
- decision: pass

This report closes the exact approved report-field hardening scope. It is prepared against revision ${state.meta.revision_id}; formal completion occurs only when the canonical closeout writer accepts it.

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
${rows}
| Mode/Slice Decision | structured_slice | ${prefix}BROWNFIELD_REVIEW.md |

## Run Status Card

This is an audit projection; canonical writer receipts and Core evaluation retain control authority.

| Run status | Value |
|---|---|
| Status | pass; scoped implementation and acceptance fulfilled |
| Current gate | OR |
| Allowed now | Record the exact scoped closeout |
| Blocked by | none |
| Missing approval | none |
| Next step | No further required scope work after accepted closeout |
| Quality outlook | No additional mandatory quality follow-up in the accepted scope |

## Delivered

| Item | Evidence |
|---|---|
| Positive authored-result contexts; conservative exclusion of examples, quotes, code, lists, HTML and unrelated prose/sections | packages/core/lib/control-evaluation/report-decision.js; evidence/context-matrix.json |
| One shared observer for existing QA consumers and bound Quick/non-UX internal recording, preserving domain, eligibility, reason, source and revision guards | packages/core/lib/control-state/run-steps.js; CD_TESTS.md; CODE_REVIEW.md |
| Focused quality contract and actual registration/inspection/closeout regressions | plugins/agdf/meta/contracts/quality.md; evidence/scoped.diff; command-flow and final writer logs |
| Standard package build and supported local Codex install of 0.14.5+codex.local-1830ec6d596b | evidence/build.log; evidence/install.log; evidence/installed-identity.json |
| Actual final installed observer and Quick/full/slice CLI/STDIO qualification, refusal snapshots and exact receipt replay | evidence/installed-qualification.json; evidence/installed-stdio.jsonl; evidence/installed-quick-stdio.jsonl |
| Registered current implementation, reviews and technical QA pass; deliberate QA and UAT acceptance | CD_TESTS.md; TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md; QA_REPORT.md; canonical presentations and approvals |

Task Plan coverage: T-001 through T-005 are fully fulfilled. T-006 reviews, technical QA and deliberate QA/UAT decisions are now fulfilled; its remaining formal OR acceptance and final-state/replay check are executed through this exact closeout operation. The earlier TP Review correctly described future lifecycle work as partial at QA entry and is preserved unchanged. This OR records the later state, not a retroactive review rewrite. AC-001 through AC-005 are fulfilled according to the approved QA. No open normalized finding or accepted deviation remains.

Brownfield fit and solution integrity: existing Core observation and consumer owners are reused; no new policy, state owner, parser dependency, gate or public schema was added. Review-detected heading backtracking and nested-markup/container defects were corrected before final QA and final installation. Documentation impact is limited to the focused quality grammar and this Run's traceable evidence.

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Fresh native Codex/model, native Windows/Linux and independent human identity qualification | Outside approved direct installed-runtime acceptance; not observed | Separate qualification scope if requested |
| General Markdown parser, new authority/public schema, runtime updater or UI change | Outside approved bounded correction | No new owner in this scope |
| Commit, push, PR, public version/release or deployment | Not requested; local code repair and installed verification are the authorized scope | delivery-closeout only after explicit VCS/handoff intent |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Approved requirement/design/plan and exact source bindings | UR.md; PRD.md; SD.md; TP.md; canonical binding/approval receipts | Exact scope, AC-001 through AC-005 and SCN-001 through SCN-014 | direct cooperative-local |
| Canonical command flow | evidence/command-flow.log | 17/17 passed, zero failed/skipped; real writer/recovery checks | direct disposable fixtures |
| Final shared observer and consumer regressions | evidence/parser.log; context-matrix.json; final-quick.log; final-structured.log; final-slice.log; gates.log; control-state.log | 19 retained compatibility, 139 context and six internal cases; canonical template/default domain; actual final writer/guard behavior | direct source execution |
| Normal final package checks | evidence/build.log; footprint.log; payload-test.log; payload.json | Final build/assembly, instruction and exact payload checks pass | direct package execution |
| Final installed identity | evidence/installed-identity.json; final-source-identity.json | All 300 cache/marketplace files byte-equal; changed installed Core/quality contract equal frozen source | direct installed files |
| Actual final installed behavior | evidence/installed-qualification.json; installed-stdio.jsonl; installed-quick-stdio.jsonl | Quick and both structured modes; genuine mixed reports accepted, example-/quote-only/conflicting/unknown/missing reports refused without canonical mutation; protected-source/stale-revision refusal; valid seals and original-UUID replay | direct installed CLI/STDIO with explicitly synthetic fixture prerequisites |
| Current live installed recording/routing | evidence/live-stdio.jsonl | Actual installed registrar accepted current evidence and QA despite illustrative contrary results; bound current Run control | direct installed cooperative-local |
| Deliberate QA/UAT acceptance | Canonical presentations 35ffeda2-1f0e-4c9d-88da-540337363dee and 85b2b6fa-b894-4316-9cf5-813c0636258d; exact approval rows | Approved QA bytes and immutable UAT evidence document, current revisions | direct caller-forwarded deliberate replies |
| Protected source identities and final lifecycle proof | evidence/protected-sources.json; evidence/closeout-preflight.json; evidence/final-state.json | Immutable UR/PRD/SD/TP, prior completed Run QA and current QA; final accepted closeout and original operation replay | direct checks; final-state produced after writer acceptance |

Assembled source MCP flows passed before the final parser-only corrections; corrected final installed observations supply the final candidate behavior proof. Intermediate builds and v1/v2 files are historical observations, not final qualification. See evidence/QUALIFICATION_SUMMARY.md for exact distinctions.

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Fresh native model/host and native other-platform behavior not observed | warn | Retain bounded installed CLI/STDIO claims; qualify only under a separate request |
| Independent review/human identity proof unavailable | warn | Preserve cooperative-local evidence classification; no stronger assurance claim |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| Already loaded chat tool generations can remain older than the installed build | warn | Final qualification and current live operations used the configured final installed launcher; no app restart was inferred |
| Conservative bounded report grammar may refuse a malformed or prose-only report | warn | Existing unapproved-report owner corrects authored fields; approved sources require existing revision rules |
| Exact payload budget is 252 files / 2179471 bytes, zero headroom; scoped growth is 8160 bytes | warn | Existing generator/instruction/budget checks remain active; future growth must be measured explicitly |
| Source/package fixtures and one coding-agent review are not independent native production qualification | warn | Evidence strength and approved acceptance scope are explicit; no broadened success claim |

Retained fallbacks: none introduced. Existing canonical recovery paths retain their authority; no new shim or cleanup exit criterion is needed. Pre-existing compact-continuation changes and its completed Run remain preserved.

## Parent Reconciliation Handoff

Evaluated canonical reconciliation object: ${JSON.stringify(parent)}. No Parent inference, search or mutation.

## Programme Aggregation Readiness

Not applicable according to the canonical evaluator; no programme readiness or approval claim.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing Core and focused quality-contract ownership remain unchanged; scoped identities, tests and operational observations are preserved in this Run.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: Candidate identity, qualification and final lifecycle checks belong to this accepted delivery scope; no external memory update or new graph node is needed.
- memory_refs: ${prefix}evidence/QUALIFICATION_SUMMARY.md; ${prefix}evidence/final-state.json

## Next Permissible Step

- next_allowed_action: No further required work in this scope after accepted closeout; delivery-closeout becomes the handoff owner only if explicitly requested.
- required_approval: none
- forbidden_until_then: Automatic commit, push, PR, public release, deployment and claims of unobserved native qualification.

## Approval

OR records accepted delivery and grants no later approval. QA and UAT are already deliberately recorded. Completion, sealed revision and backlog synchronization remain the canonical closeout writer's effect.
`;
// All headings come from the bound plugin-owned template; no repository copy substitutes it.
for(const heading of template.match(/^## .+$/gm)) assert.ok(report.includes(heading),heading);
const candidate=prefix+'OR_CANDIDATE.md';writeFileSync(root+'/'+candidate,report);
const check=evaluateCloseoutReadiness(state,report,p=>readFileSync(root+'/'+p,'utf8'),{prepared:true});
writeFileSync(root+'/'+prefix+'evidence/closeout-preflight.json',JSON.stringify({revision_id:state.meta.revision_id,qa_digest:qaDigest,protected_sources:protectedSources,check},null,2)+'\n');
assert.equal(check.ready,true,JSON.stringify(check));
const orDigest=artefactFileDigest(root,candidate),operation=randomUUID();
const request={name:'agdf_closeout',input:{schema_version:'1',assurance:'cooperative_local',presentation_language:'de',working_directory:root,primary_target:root,target_source:'continued_target',target_id:'sha256:a5c1daee7886f81d27b2b7718718fa7a3822b27a4bc1d057f99af01be7688a19',run_id:run,expected_revision_id:state.meta.revision_id,operation_id:operation,command:{kind:'closeout.record',payload:{or:{path:candidate,digest:orDigest},confirmation:closeoutConfirmation(run,state.meta.revision_id,operation,orDigest)}}}};
writeFileSync(root+'/'+prefix+'evidence/live-closeout.json',JSON.stringify(request,null,2)+'\n');
console.log(JSON.stringify({ready:check.ready,findings:check.findings,operation_id:operation,or:request.input.command.payload.or}));
