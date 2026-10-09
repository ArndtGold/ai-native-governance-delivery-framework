from pathlib import Path
import json,datetime,hashlib,re
base=Path('.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01')
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
c=json.loads((base/'CANDIDATE-01.json').read_text()); f=json.loads((base/'native-fixtures.json').read_text()); renders=json.loads((base/'locale-renders.json').read_text()); comparison=json.loads((base/'baseline-comparison.json').read_text()); qa=json.loads((base/'qa-chains-final.json').read_text()); protocol=json.loads((base/'prepared-fixture-protocol.json').read_text())
def write(name,text): (base/name).write_text(text.rstrip()+'\n')
header=f'- assessed_at: {now}\n- candidate: {c["candidate"]["codex_install_version"]}\n- runtime_digest: {c["candidate"]["runtime_digest"]}\n- evidence_boundary: source/package/protocol; no new native model session observed\n'
write('EVIDENCE_BASELINE-01.md', '# Baseline comparison\n\n'+header+'''
BASELINE-01.json was captured before source edits, including HEAD, dirty-path inventory and affected-file SHA-256 values. The original PRD suite passed before edits because it asserted the missing-UX terminal behavior (baseline-prd.log). compare-baseline.mjs reconstructs the other original source paths from that captured HEAD and checks their bytes against every recorded baseline hash before execution. Its source comparisons were executed after edits; they are not historical host timing observations or a full baseline model chain.

| Condition | Original source result | Candidate source result | Evidence |
|---|---|---|---|
| Required UX absent | terminal | UX owner continuation | baseline-comparison.json missing |
| Wrong Decision field | terminal | exact-field correction through UX owner | baseline-comparison.json malformed |
| Explicit UX blocked | terminal | terminal | baseline-comparison.json blocked |
| Valid normalized QA implementation obligation | terminal | approved-scope implementation continuation | baseline-comparison.json qa |
| Explicit status with internal next action | promises ongoing work | names next permitted action | baseline-comparison.json status |

The comparison uses injected synthetic control/target dependencies and the actual baseline/candidate service and renderer code. It does not prove native execution, approval provenance or wall-clock improvement. The packaged candidate chains separately exercise canonical writers and actual evaluation.

Invocation mistakes are separate: the first comparison harness omitted expectedVersion and was rejected before evaluation. The corrected harness supplies the declared version. Native fixture preparation initially used QA instead of QA_REPORT as the recording destination type; the writer rejected it without manufacturing a receipt. Corrected setup uses the declared existing type. These are harness mistakes, not product baseline findings.
''')
checks=[('C001','scripts/sync-package-assets.js'),('C002','packages/cli/scripts/prd-definition-test.js'),('C003','packages/cli/scripts/sd-definition-test.js'),('C004','packages/cli/scripts/skill-dispatch-function-contract-test.js'),('C005','packages/cli/scripts/skill-dispatch-binding-test.js'),('C006','packages/cli/scripts/skill-dispatch-test.js'),('C007','packages/cli/scripts/cli-gate-scenarios-test.js'),('C008','packages/core/test/interaction-presentation-test.js'),('C009','packages/cli/scripts/operational-localization-test.js'),('C010','packages/cli/scripts/interaction-catalog-test.js'),('C011','packages/cli/scripts/control-inspect-test.js'),('C012','packages/cli/scripts/late-source-revision-test.js'),('C013','packages/core/test/control-state-test.js'),('C014','packages/core/test/next-action-test.js'),('C015','packages/cli/scripts/instruction-footprint-test.js'),('C016','plugins/agdf/scripts/check-runtime-integrity.mjs'),('C017','packages/cli/scripts/package-contents-test.js'),('C018','git diff --check'),('C019','packages/core/test/control-read-provider-test.js')]
write('EVIDENCE_SOURCE-01.md', '# Source and package checks\n\n'+header+'\nUse the Node executable in CANDIDATE-01.json. CHECKS-01.json records exit status and observation time; check-Cxxx.log files retain command output. C007 initially ran all existing cases, then reran the affected QA case after the last parser changes. Unaffected input/binding/catalog/next-action checks retain applicability: their inputs and owners did not change. C015 was rerun after shortening the selected skill reference to preserve its existing budget; later source-only Core/locale changes add no eager instruction surface. C012 uses the assembled CLI and exercises 51 synthetic source-revision cases.\n\n| Check | Command (node prefix except C018) | Evidence |\n|---|---|---|\n'+ '\n'.join(f'| {i} | {cmd} | check-{i}.log |' for i,cmd in checks)+'''

C019 verifies QA reports stay in the immutable captured control-read view while the normative quality contract is read through the existing trusted runtime-resource owner; unrelated data reads stay denied. No capture data-root widening is introduced.

Source facts are shared between PRD gate readiness and authoring dispatch. Ready bytes require canonical analytical registration; a ready registered PRD cannot skip this requirement. SD diagnoses preserve the already approved PRD boundary. Normalized review meanings/routes remain in quality.md; Core reads its declared table, while dispatch only selects an existing continuation from the evaluated private result. No public input/schema/phase/result variant or approval value changes. Tests retain strict presentation_language/--language and judgement-skill input rules.
''')
rows=[]
for q in qa:
 r=q['continued'];rows.append(f'| {q["scenario"]} | {r["outcome"]} | {str(r["terminal"]).lower()} | {(r.get("continuation") or {}).get("skill_id","stop")} | {r["control"]["missing_approval"]} |')
write('EVIDENCE_CHAINS-01.md','# Continuation chain ledger\n\n'+header+'''
The PRD packaged fixture begins with fresh synthetic UR approval and Brownfield routing. Required UX absence and malformed exact fields hand off to the analytical owner; the test writes the ready analysis, canonically records it with run-update, observes a new revision and redispatches to PRD authoring. An otherwise ready registered PRD without analytical registration also routes to preparation instead of presenting approval. Registered PRD replacement and interrupted canonical recording recover through the existing writer before fresh presentation. prd-chain.json records calls, revisions, outcomes and read-only hashes.

QA implementation routing executes the isolated declared filter assertion: the original restore function fails, the corrected function passes. The fixture refreshes CD+Tests/review evidence and records a new canonical revision before reevaluation. Internal/external evidence obligations use the evidence owner; resolving a row without changing the revise decision cannot become QA approval. qa-chains-final.json contains actual evaluation/dispatch and complete control inventories. Synthetic setup approvals are not production approval.

| QA condition | Outcome | Terminal | Owner | Missing approval |
|---|---|---|---|---|
'''+ '\n'.join(rows)+'''

For the equivalent source comparisons, avoidable internal terminal stops fall from one to zero for missing UX, wrong exact field and the valid QA implementation case. Scripted permitted candidate chains emit no extra restart request between internal preparation, recording and fresh routing. Deliberate gate decisions, real material clarification, external action and genuine invalid input remain separate stops. This counts deterministic routing behavior only; actual human/model prompt counts and timing remain unobserved.

Repeated unchanged malformed input returns the same read-only diagnosis. The active-agent one-correction limit is stated in its existing instruction/contract, not enforced by a new persistent retry engine. Its actual stop behavior must be observed in N-003; source assertions alone cannot prove that the model follows it.
''')
write('EVIDENCE_PROTECTION-01.md','# Protected boundaries\n\n'+header+'''
C002 snapshots canonical control entry names/types and file bytes, including symlink targets; C007 includes sorted complete path inventories plus byte digests. C011 verifies shared read-only control inspection. The nine prepared fixture routes also compare complete control path inventories and bytes before/after every candidate call (prepared-fixture-protocol.json). All equal.

Negative controls cover explicit UX blocked, symlinked UX/output, unavailable or changed approved source, wrong/foreign/stale reviewed-recording input, stale presentation/revision, unsupported fields and judgement options, unknown/missing/malformed normalized findings, incompatible routes, mixed source authority, explicit QA block and unsafe/missing QA review references. Source requirements/design/plan/assessed emergent-risk findings stop dependent code; evidence-only routes explicitly forbid implementation. No new approval, run selection from cwd, unknown seal repair, reinstall or post-terminal interception is introduced.

Approved UR/PRD/SD/TP bytes remain protected by their existing receipts; the production run's canonical doctor is assessed after recording. Unrelated cockpit/UI/source deltas from BASELINE-01.json were not reset or edited by this change. Shared MASTER_BACKLOG updates affect this run through the existing canonical writer.
''')
write('EVIDENCE_LOCALES-01.md','# Rendered locale evidence\n\n'+header+'\nLocales are enumerated from Object.keys of the canonical registry: '+', '.join(sorted(set(x['locale'] for x in renders)))+'. Actual affected diagnostic/status/disposition output follows. C009/C010 also verify operational localization and exact catalog ownership; the supported unknown-locale fallback remains English. These are real renderer outputs, not a claim of native host visual inspection. Host clipping/readability and actual actor behavior remain N-006 obligations.\n\n| Locale | State | Result |\n|---|---|---|\n'+'\n'.join(f'| {x["locale"]} | {x["state"]} | rendered; assertions passed |' for x in renders)+'\n\n'+ '\n\n'.join(f'## {x["locale"]}: {x["state"]}\n\n{x["text"]}' for x in renders))
budget=json.loads(Path('plugins/agdf/meta/copilot-payload-baseline.json').read_text())
write('EVIDENCE_BUILD-01.md','# Candidate and build evidence\n\n'+header+f'''
CANDIDATE-01.json records exact changed-source hashes, source fingerprint, generated resources/runtime, assembled package and prepared marketplace identity. The candidate is {c['candidate']['codex_install_version']}; canonical package version remains 0.14.5. The currently loaded binding points to 0.14.5+codex.local-f71d0e16599d and has a different runtime manifest. No new host candidate session is claimed.

The existing sync/build owners generated runtime and resources; assemble-npm built the reviewable package; runtime integrity and package-content checks passed. The reviewed Copilot baseline is exactly {budget['max_files']} files / {budget['max_bytes']} bytes, without speculative headroom. It accounts for the two shared Core read owners, dispatcher/readiness/renderer changes, bilingual diagnostics and existing-owner instructions. Existing cockpit source growth is not silently attributed to this run. The original budget helper's CLI resolves its repository root one directory too high; its existing reviewedBudget and validateCopilotPayload functions were used with the verified explicit root, without changing that unrelated helper or disabling integrity/source checks.

The selected Gate Check skill initially exceeded its existing instruction budget by 81 bytes. Its new reference was shortened within the existing paragraph; the limit was not raised and C015 passed. Generated files were propagated through existing owners, not edited independently.

Prepared marketplace: {c['candidate']['marketplace']}
Prepared plugin: {c['candidate']['plugin_root']}
Runtime digest: {c['candidate']['runtime_digest']}
Source digest: {c['candidate']['source_digest']}

Source/protocol evidence remains applicable to this stable runtime. A test-only addition strengthening symlink/path-inventory coverage changes the source-test fingerprint, not the packaged runtime. A code/resource change requires a new candidate identity and affected checks/observations before any external request.
''')
expect={
'missing-ux':'One continuation through UX preparation, validation and canonical recording to the genuine PRD decision; no extra restart prompt.',
'malformed-ux':'Exact expected/observed field diagnosis; one own-input correction, canonical recording and fresh route.',
'unchanged-ux':'One failed correction/validation with no relevant progress; stop rather than redispatch unchanged failure.',
'resume-ux':'Interrupt before reevaluation, then recheck exact current revision/source binding. A deliberately changed-revision replay must stop or request fresh binding.',
'qa-implementation':'Correct only the approved filter restore behavior; execute filter.test.mjs, refresh evidence/reviews, rerun QA only when obligations are fulfilled.',
'qa-internal-evidence':'Collect the prepared local filter.test.mjs output through the existing evidence owner; retain applicable proof.',
'qa-external-evidence':'Use this complete plan before any necessary external action; inaccessible observation remains an evidence gap, never QA approval.',
'qa-upstream':'Stop dependent code and retain the existing SD revision decision boundary; do not edit approved sources.',
'qa-invalid':'Stop on unknown normalized gap; do not silently classify, implement or request QA approval.'}
plan='# Prepared native qualification sequence\n\n'+header+f'''
Prepared before any installation/connection request. Candidate source/package/runtime/resource facts: CANDIDATE-01.json. Nine isolated targets and their synthetic setup receipts/calls: native-fixtures.json. All nine local candidate routes have been validated without control writes; this is protocol evidence, not native model execution. Bundle: {f['bundle']}.

Host: supported Codex surface. Configured model gpt-6.1-sol, reasoning high; actual desktop version, actually selected model and newly loaded candidate must be recorded from the fresh supported host, not inferred from this configuration or an old screenshot. Node: {c['host']['node_executable']} ({c['host']['node']}).

The supported prepared plugin marketplace above uses the existing snapshot/provenance owner. Installing/updating that concrete local candidate and reconnecting the supported plugin connection is a separate human-authorized action under approved TP section 5. No installation, registration, connection retirement or restart was performed. Preserve the separate existing cockpit connection; it is not the gate-flow plugin candidate. Do not use a generic unpinned reinstall or claim that version 0.14.5 alone identifies this candidate.

## Ordered observation session

1. N-001: Record fresh host/version/model and trusted dispatcher binding, then compare the actually loaded root, source/runtime/resources with candidate {c['candidate']['codex_install_version']} and runtime {c['candidate']['runtime_digest']}. Mismatch stops candidate behavior claims. On-disk manifests alone are insufficient; capture actual tool/runtime evidence. The review preflight currently observes a separate Application Support MCP runtime (REVIEW_PREFLIGHT-01.json), while the declared skill/CLI binding is the older local cache. The prepared plugin mcp.json launches its own snapshot-owned MCP server/data root. Verify both after the authorized update; do not mistake the old registered MCP connection for the new plugin runtime.
2. N-002: Execute the missing-UX target below once through content, validation, recording and fresh routing. Stop at its genuine PRD decision; never synthesize a live approval.
3. N-003: Execute malformed-own-input and unchanged-correction targets below. Observe expected/observed field, one correction and its actual validation. Stop unchanged failure; never call another tool after terminal output.
4. N-004: Execute approved-scope QA implementation and local-evidence targets below. Record actual source/evidence/review transitions and current permission. Revise is never ready QA approval.
5. N-005: Observe external-evidence, upstream-source and unknown-gap targets below. External proof remains open when inaccessible; upstream/invalid conditions must not trigger code or source edits.
6. N-006: On each prepared target request explicit status, and inspect a strict invalid-input/integrity stop. Capture terminal actor/action text and rendered readability; compare complete canonical control paths/bytes before/after read-only calls. Do not perform post-terminal tools in the same agent response.
7. N-007: Use resume-UX below for interruption before reevaluation, valid resume and changed-revision countercase. Fresh binding/authority is required; an old progress message or fixture setup approval is not permission.
8. N-008: Consolidate one actual event/prompt/recording ledger with candidate match, retained evidence applicability and all gaps before leaving the stable candidate session. Count internal restart prompts separately from approvals, material clarification, external action and genuine failures. No actual timing or prompt claim without observed events.

## Exact prepared targets and prompts

All approvals in fixture setup are explicitly synthetic and isolated. The live agent receives only the prepared synthetic scope; it must not send a fabricated user approval or authorize this production Run. Source correction is confined to the disposable target. Each native terminal response ends its agent turn; continue the test sequence only through a separate deliberate test instruction. Preparation logs are not native observations.
'''
for x in f['cases']:
 plan+=f'\n### {x["name"]}\n\n- Explicit primary target: `{x["target"]}`\n- Run: `{x["run_id"]}`\n- Prepared revision: `{x["revision_id"]}`\n- Request: Continue this explicitly named synthetic test run once within its approved fixture scope. {expect[x["name"]]}\n- Dispatch: `agdf_dispatch`, `skill_id: gate-check`, `presentation_language: de`, `working_directory` and `primary_target` equal the exact target above, `target_source: explicit_target`, exact `run_id`, `continue_delivery: true`. No `continue_delivery` on judgement skills.\n'
plan+='''
## Evidence applicability and stop conditions

C001-C019 and baseline/source/locale/protocol artifacts prove their named source or package behavior. The nine fixture setups use unchanged canonical writers and remained valid when their test-owned plugin bundle was refreshed to the final candidate before any native behavior observation. Actual native model execution, visible host rendering and prompt timing are missing. Preserve applicable source proof; recollect only affected evidence if code/resources change. A real host failure or candidate change may require another prepared cycle. No test should hide a genuine failure to force a one-session result.

On inaccessible host, wrong candidate, altered binding/approval/source, unknown integrity, unclear material choice or unchanged correction failure: stop dependent work, retain the exact evidence gap and keep QA revise. Installation is not a cure for a failing source check. No release, VCS action, source approval transfer or silent host change is authorized by this plan.
'''
write('QUALIFICATION_PLAN-01.md',plan)
write('EVIDENCE_NATIVE-01.md','# Native qualification status\n\n'+header+'''
- status: not_observed
- decision_impact: revise
- missing_evidence: actual N-001 through N-008 observations, loaded candidate match, actual agent correction/stop behavior, native rendered readability, canonical execution events and actual prompt ledger
- prepared_evidence: QUALIFICATION_PLAN-01.md; CANDIDATE-01.json; native-fixtures.json; prepared-fixture-protocol.json
- required_next_step: after separate installation/connection authorization, execute the complete prepared sequence in one stable supported candidate session and record actual observations

The declared skill/CLI binding is the older local candidate. REVIEW_PREFLIGHT-01.json additionally observes the separate live MCP dispatcher root in Application Support, runtime f1fdd4da6c486c134ba37baf401b1db3c06a4480fd3f27af53a3c7bd52207262. Its own provenance matches its installed package; it is not the prepared candidate. Both actual bindings must match the intended candidate before native claims. Preparation and deterministic packaged/runtime probes are not a new Codex native session. Configured model is not independently observed active model identity. No actual prompt-reduction, timing, host/version, visual clipping or native success is claimed. The historical baseline source comparison was reconstructed after edits from verified pre-edit captured bytes; it is not historical multi-turn timing evidence.
''')
write('CD_TESTS.md','# Implementation and source validation\n\n- status: done\n- scope: approved TP source implementation, deterministic chains and local candidate preparation\n- actual_host_status: missing; quality readiness not claimed\n\n'+header+'''
Core source facts separate missing, malformed, blocked, unsafe and unrecorded analytical input. Required UX preparation reuses the current owner before dependent PRD authoring/presentation. Core consumes the sole normalized quality route table for bounded implementation/evidence/source follow-up. The one renderer communicates next permitted work for terminal/status output; existing shared instructions bound correction and prepare full external observation. Existing generators propagate the candidate.

C001-C019 pass. Evidence: EVIDENCE_SOURCE-01.md, EVIDENCE_CHAINS-01.md, EVIDENCE_PROTECTION-01.md, EVIDENCE_LOCALES-01.md, EVIDENCE_BUILD-01.md, CHECKS-01.json. Native delivery proof remains EVIDENCE_NATIVE-01.md not_observed and must remain a QA revise obligation. Baseline timing limitations are explicit in EVIDENCE_BASELINE-01.md. This internal recording does not mark every TP task fully done, approve QA or authorize installation/release.

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
- memory_reason: run-specific source/check/candidate evidence
''')
print('Evidence and complete qualification plan written.')
