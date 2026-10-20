# Direct closeout repair

Status: verified

The user explicitly requested this repair without AGDF workflow. The empty repair Run created before that instruction was removed after confirming it contained only its pristine revision-1 RUN_STATE.md and had no UR, artefact, approval or backlog row. No further skill, dispatcher or human-gate workflow was used. Ordinary repository code, build and tests implement the repair.

## Root cause and correction

The normalized-finding validator imposed an active repair action and earliest-owner routing assessment on already resolved findings. It now preserves the known type/route, requires concrete resolution evidence and all fields, and permits a resolved finding to state that no corrective action remains or continue to its lifecycle owner. Open findings retain executable-action and emergent-risk owner-assessment checks; invalid types/routes, missing or placeholder evidence, unknown status and duplicate IDs remain invalid.

QA/UAT preparation and prepared OR use the same existing normalized-finding observer. Invalid or open review findings now prevent a pass presentation before human approval rather than first appearing at closeout. Backlog summary uses the existing bounded report-decision observer, agreeing with Status/Decision metadata and rejecting conflicts/examples. The existing quality contract documents these semantics; no amendment service, parallel receipt/policy authority or new privilege was introduced.

## Verification

Canonical build passes. The full command-flow suite passes 18/18 groups with zero failures/skips plus all four preview followups. Four real STDIO flows cover both protocol eras and both structured modes, carrying the resolved finding through exact QA/UAT decisions, closeout and original-operation replay on disposable synthetic targets. The semantic MCP contract, CLI gate scenarios, 11 backlog-summary checks, deviation acceptance and 143 module/boundary checks pass.

The unchanged timing test includes 20 cold and 20 warm samples: p95 767.832/761.664 ms against 1500/1000 ms. Raw output is retained in direct-closeout-performance.log. These are local measurements, not universal latency guarantees.

Build-contract fixtures were made complete with contained current review files; assertions and scenarios were retained. All 113 offline skill expected dispositions still pass. Only reviewed source-fingerprint bindings changed for the six skills referencing the clarified contract; no prompts, expected actions, recorded dispositions or thresholds changed, and this is not new model/host evidence. The supported payload recorder binds the exact measured 395-file/3,442,564-byte payload, +2,957 bytes with zero spare headroom. Compatibility fixture evidence was refreshed by its existing recorder: 56/56 pass. Historical native observations and immutable MCP-ergonomics baseline/matrix inputs were not rewritten.

The initial build attempts correctly stopped at exact payload growth, an incomplete legacy fixture, then stale offline source bindings. Those checks were addressed through their existing owners, without disabling gates or changing test/latency thresholds. The final canonical build passes all stages.

## Protected evidence and original failure

QA, Code Review, Task Plan Review and Clean Review remain byte-identical to their accepted versions; exact hashes are in DIRECT_CLOSEOUT_FIX.json (sha256:5e2b8dbe890e33f6f81021f56994d7f0c4ad9f846f6077eb132e1f138fde4b4c). The original closeout rejection and proposed report copies remain historical evidence. The earlier conclusion that the reports needed editing or a new post-UAT amendment mechanism was unnecessary: the repair is in state-aware validation, not in approved report bytes. No QA/UAT reply is transferred to changed reports or recorded again.

The original Phase 1 source/test tuple and its 28-scenario report describe the accepted pre-repair candidate. The direct repair has its own current source hashes, build and test evidence above. It supplies no native-host, installed-plugin, rollout, release or VCS qualification.
