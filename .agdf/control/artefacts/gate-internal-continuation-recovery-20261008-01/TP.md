# TP: Reliable internal gate continuation and actionable recovery

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-08
Owner: Arndt Gold
Run: gate-internal-continuation-recovery-20261008-01
Language: en
Traceability contract: criteria-chain-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | After TP approval, complete and canonically record pre-implementation Brownfield Analysis; capture affected-path/source/runtime baseline and comparable failure traces before edits or regeneration | Existing brownfield-analysis and evidence owner | Approved TP; current approved UR/PRD/SD and valid exact run binding |
| T-002 | Implement shared contained source facts, precise readiness diagnoses and eligible UX prerequisite handoff before dependent authoring; retain existing exact parsing and canonical recording | Core readiness/evaluation and dispatcher owner | T-001 |
| T-003 | Implement the single Core consumer of normalized applicable findings and constrained QA-revise follow-up; preserve the quality contract and reject missing/contradictory/source-sensitive authority | Core evaluation and qa-gate owner | T-001 |
| T-004 | Update existing skill/interaction execution instructions for supported invocations, one condition-specific permitted correction, validation/recording and fresh resume; retain terminal safety | Existing analytical/authoring/QA skill contract owner | T-001; coordinate T-002/T-003 |
| T-005 | Make the existing canonical renderer reflect actual dispatch disposition, neutral read-only status and precise external/technical stop; update affected catalog/locale entries | Dispatcher and interaction owner | T-002/T-003/T-004 |
| T-006 | Extend existing integration and regression suites for full pre-PRD/QA chains, unchanged failure, interruption, input rejection, negative authority and read-only no-write controls; record comparable ledgers and all-locale rendered results | Existing Core/CLI test and evidence owners | T-002/T-003/T-004/T-005 |
| T-007 | Regenerate through current sync ownership; run affected contract/runtime/package checks, record candidate identity and prepare the entire native qualification sequence before any connection request | Existing build/runtime and evidence owners | T-006 passing for source candidate |
| T-008 | Qualify the exact candidate in a fresh actual supported Codex host session, record loaded identity and chained observations, or retain concrete external evidence gaps; reassess evidence if candidate changes | Existing native qualification/evidence owner | T-007; necessary supported installation/connection action separately authorized and completed |
| T-009 | Refresh CD+Tests evidence, perform required CR, Task Plan Review and Clean Implementation Review; obtain qa-gate decision, record it canonically and present only a ready next human decision | Existing review owners and qa-gate | T-006/T-007; T-008 result or explicit outstanding gap |

These are execution tasks for the approved design, not new product acceptance. T-001 is the existing mandatory internal step; TP approval does not bypass it. No task may widen scope or rewrite an approved source. Exact source/revision relationships and unresolved gaps remain visible. Tasks are not declared done by this plan.

## 2. Verification Traceability

Scenario IDs are stable within this plan. Repeated evidence references identify shared traces; they do not duplicate PRD acceptance. A scenario containing multiple assertions must record each observation. All evidence paths below are relative to this run's artefact directory unless a source test path is named.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | Absent contained UX input is identified as absent with exact source and expected decision field; ready input remains distinguishable | packages/cli/scripts/prd-definition-test.js; EVIDENCE_SOURCE-01.md source-fact results |
| AC-001 | SDD-002 | T-006 | SCN-002 | Approved upstream fixture continues through the existing UX owner, validated canonical recording and fresh PRD readiness with zero extra restart prompts | packages/cli/scripts/prd-definition-test.js; EVIDENCE_CHAINS-01.md pre-PRD trace |
| AC-001 | SDD-002 | T-006 | SCN-003 | Material missing intent or unrelated permission/integrity failure prevents dependent authoring and names the real missing choice/owner | packages/cli/scripts/prd-definition-test.js; EVIDENCE_CHAINS-01.md negative prerequisite trace |
| AC-002 | SDD-001 | T-002 | SCN-004 | Missing file, wrong Decision syntax, non-ready decision and valid exact field yield distinct facts; malformed text is never accepted as ready | packages/cli/scripts/prd-definition-test.js; EVIDENCE_SOURCE-01.md readiness matrix |
| AC-002 | SDD-004 | T-004 | SCN-005 | Own unapproved-input correction is attempted once, validated and canonically recorded before reevaluation; an unchanged failed condition stops | packages/cli/scripts/prd-definition-test.js; EVIDENCE_CHAINS-01.md correction trace |
| AC-002 | SDD-004 | T-006 | SCN-006 | Approved, foreign, symlinked or uncontained input is not corrected and protected source/control bytes remain unchanged | packages/cli/scripts/prd-definition-test.js; EVIDENCE_PROTECTION-01.md path and byte snapshots |
| AC-003 | SDD-003 | T-003 | SCN-007 | Valid current implementation_gap reaches existing approved-scope correction; affected tests/reviews refresh before a new QA decision | packages/cli/scripts/cli-gate-scenarios-test.js; EVIDENCE_CHAINS-01.md QA implementation trace |
| AC-003 | SDD-003 | T-003 | SCN-008 | Internal evidence_gap reaches its existing evidence owner; already applicable evidence is retained and QA remains revise until required proof exists | packages/cli/scripts/cli-gate-scenarios-test.js; EVIDENCE_CHAINS-01.md internal-evidence trace |
| AC-003 | SDD-003 | T-006 | SCN-009 | External evidence_gap first prepares candidate and sequence, then names actual external action; missing observation cannot become QA approval | packages/cli/scripts/cli-gate-scenarios-test.js; EVIDENCE_CHAINS-01.md external-evidence trace |
| AC-003 | SDD-003 | T-003 | SCN-010 | Upstream requirements/design/plan target and assessed emergent risk retain earliest-owner decision/revision boundary; no approved-source edit or dependent code | packages/cli/scripts/cli-gate-scenarios-test.js; EVIDENCE_PROTECTION-01.md source-gap matrix |
| AC-003 | SDD-003 | T-006 | SCN-011 | Missing row/report, unknown values, contradictory route or mixed unresolved source authority blocks corrective implementation; QA revise/block stays non-approvable | packages/cli/scripts/cli-gate-scenarios-test.js; EVIDENCE_SOURCE-01.md normalized-findings matrix |
| AC-004 | SDD-004 | T-004 | SCN-012 | Supported MCP presentation_language and CLI --language calls work; language alias and judgement-skill continue_delivery remain rejected without mutation | packages/cli/scripts/skill-dispatch-function-contract-test.js; packages/cli/scripts/skill-dispatch-binding-test.js; EVIDENCE_SOURCE-01.md invocation results |
| AC-004 | SDD-004 | T-006 | SCN-013 | Agent checks/corrects supported invocation before dependent work; once a terminal result is emitted no hidden further tool action follows | packages/cli/scripts/skill-dispatch-test.js; EVIDENCE_NATIVE-01.md actual call sequence |
| AC-004 | SDD-005 | T-005 | SCN-014 | Actual continuation names work underway; terminal/error/external output names its real actor; explicit status makes no execution promise | packages/core/test/interaction-presentation-test.js; EVIDENCE_LOCALES-01.md rendered-state matrix |
| AC-004 | SDD-005 | T-006 | SCN-015 | Every affected state renders with truthful actor/action in every registered locale and preserves exact approval transport | packages/cli/scripts/operational-localization-test.js; EVIDENCE_LOCALES-01.md rendered outputs and visual checks |
| AC-005 | SDD-006 | T-007 | SCN-016 | Candidate identity, supported connection action, all observation steps and evidence applicability are recorded before external handoff | QUALIFICATION_PLAN-01.md timestamp and identity; EVIDENCE_BUILD-01.md source/package identity |
| AC-005 | SDD-006 | T-008 | SCN-017 | Fresh actual host observes the loaded candidate before chained behavior is attributed to it; a stable successful candidate completes one prepared session | EVIDENCE_NATIVE-01.md host identity and ordered event trace |
| AC-005 | SDD-006 | T-008 | SCN-018 | Wrong/stale candidate or inaccessible surface leaves native proof missing; changed candidate gets affected fresh obligations with retained-proof rationale | EVIDENCE_NATIVE-01.md mismatch/gap record; EVIDENCE_BUILD-01.md applicability ledger |
| AC-006 | SDD-004 | T-006 | SCN-019 | Interruption/resumption rechecks current binding and source integrity; changed authority/revision cannot be inherited from a previous progress message | packages/cli/scripts/prd-definition-test.js; packages/cli/scripts/cli-gate-scenarios-test.js; EVIDENCE_CHAINS-01.md resume trace |
| AC-006 | SDD-007 | T-006 | SCN-020 | Comparable baseline/corrected pre-PRD and QA-revise traces count restarts, internal stops and repeated corrections separately from real decisions/external actions | EVIDENCE_BASELINE-01.md; EVIDENCE_CHAINS-01.md comparison ledger |
| AC-006 | SDD-007 | T-008 | SCN-021 | Actual supported-host permitted chains need zero extra continuation prompts while canonical updates and required decision stops remain observable | EVIDENCE_NATIVE-01.md actual prompt/action/recording ledger |
| AC-007 | SDD-003 | T-006 | SCN-022 | Unknown/conflicting normalized findings, source gaps and QA block cannot trigger generic implementation or premature QA/UAT approval | packages/cli/scripts/cli-gate-scenarios-test.js; EVIDENCE_PROTECTION-01.md blocked-action observations |
| AC-007 | SDD-004 | T-006 | SCN-023 | Stale/foreign approval, changed approved intent, ambiguous target/run and invalid seal/runtime retain their checks; no alternate run or reinstall occurs | packages/cli/scripts/skill-dispatch-test.js; packages/cli/scripts/cli-gate-scenarios-test.js; EVIDENCE_PROTECTION-01.md negative matrix |
| AC-007 | SDD-005 | T-005 | SCN-024 | Read-only status reports current state and allowed future action without executing a delivery skill or asking for an unnecessary restart | packages/core/test/interaction-presentation-test.js; EVIDENCE_LOCALES-01.md status renders |
| AC-007 | SDD-007 | T-006 | SCN-025 | Status/doctor/evaluation calls preserve canonical control path inventory and bytes; cannot use recovery as a write path | packages/cli/scripts/control-inspect-test.js; EVIDENCE_PROTECTION-01.md before/after control tree digests |
| AC-008 | SDD-001 | T-009 | SCN-026 | Source/readiness ownership is shared and exact; no divergent parser or public schema/phase/input addition | CLEAN_IMPLEMENTATION_REVIEW.md; EVIDENCE_SOURCE-01.md schema/conformance results |
| AC-008 | SDD-003 | T-009 | SCN-027 | One Core consumer of quality.md normalized findings supplies routing; dispatcher/skills do not maintain another complete policy table | CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md; EVIDENCE_SOURCE-01.md contract conformance |
| AC-008 | SDD-005 | T-009 | SCN-028 | Existing renderer/catalog/locale owner remains singular and every changed localized state is rendered and inspected | CLEAN_IMPLEMENTATION_REVIEW.md; EVIDENCE_LOCALES-01.md complete locale/state inventory |
| AC-008 | SDD-006 | T-008 | SCN-029 | Source, package, protocol and actual host evidence identify their candidate and supported claim separately; unobserved hosts remain unqualified | EVIDENCE_BUILD-01.md; EVIDENCE_NATIVE-01.md applicability and missing evidence |
| AC-008 | SDD-007 | T-009 | SCN-030 | All tasks, scenarios, canonical sources/relationships, reviews and remaining gaps are assessed; qa-gate alone decides and ready presentation requires pass | TASK_PLAN_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md; QA_REPORT.md |

## 3. Test Plan

### Execution And Evidence Discipline

Use Node >=22 through the supported executable. Commands below are repository-root commands; use the known Node 22 binary if the shell's node is older. Do not run them as part of drafting/approval. Capture command, time, exit status, relevant assertions and exact candidate identity, including uncommitted source/derived-file digests. A Git HEAD alone does not identify this working-tree candidate. No command may reset unrelated changes or stage/commit/push/publish work.

T-001 captures baseline before edits/regeneration: affected tracked/untracked paths, source hashes and installed runtime/resource identity. Reuse existing isolated fixtures to reproduce the absent UX, wrong exact field, QA-revise routing and false terminal work-promise cases. Label expected baseline failures explicitly. Baseline failures are evidence of the defect, not waived candidate checks. Record which failures belong to source behavior versus the calling agent. Keep baseline trace input states available for the corrected comparison.

Extend existing suites named below rather than add a parallel runner or acceptance registry. Use disposable test directories and canonical fixture/recording helpers. Synthetic fixture approvals must be labelled as test setup; they never approve this run or another real run. Cases must exercise actual evaluation/routing and, for full-chain checks, canonical recording and fresh evaluation; stubbing every stage would not prove continuation.

| Check ID | Command | Required observation and evidence |
|---|---|---|
| C-001 | node scripts/sync-package-assets.js | Existing source-to-generated propagation completes; inspect derived diff against captured baseline; EVIDENCE_BUILD-01.md |
| C-002 | node packages/cli/scripts/prd-definition-test.js | Source readiness, eligible UX preparation, full pre-PRD correction/recording/resume and protected inputs; EVIDENCE_SOURCE-01.md and EVIDENCE_CHAINS-01.md |
| C-003 | node packages/cli/scripts/sd-definition-test.js | Existing SD exact-source and ready-draft/approval protections remain intact; EVIDENCE_SOURCE-01.md |
| C-004 | node packages/cli/scripts/skill-dispatch-function-contract-test.js | Supported input fields/options and invalid input rejection; EVIDENCE_SOURCE-01.md |
| C-005 | node packages/cli/scripts/skill-dispatch-binding-test.js | Exact runtime, target and input binding remains supported; EVIDENCE_SOURCE-01.md |
| C-006 | node packages/cli/scripts/skill-dispatch-test.js | Nonterminal eligible handoffs and terminal boundaries, QA follow-up consumption and no hidden post-terminal routing; EVIDENCE_CHAINS-01.md |
| C-007 | node packages/cli/scripts/cli-gate-scenarios-test.js | Canonical QA-revise implementation/evidence/upstream/invalid chains, normalized gap conformance and approval suppression; EVIDENCE_CHAINS-01.md and EVIDENCE_PROTECTION-01.md |
| C-008 | node packages/core/test/interaction-presentation-test.js | Complete affected actor/disposition/state renders and exact approval text; EVIDENCE_LOCALES-01.md |
| C-009 | node packages/cli/scripts/operational-localization-test.js | Every registered locale renders each affected operational/recovery state; EVIDENCE_LOCALES-01.md |
| C-010 | node packages/cli/scripts/interaction-catalog-test.js | Single catalog/localization ownership and valid entries; EVIDENCE_LOCALES-01.md |
| C-011 | node packages/cli/scripts/control-inspect-test.js | Read-only calls retain full canonical path/byte snapshots and do not dispatch delivery; EVIDENCE_PROTECTION-01.md |
| C-012 | node packages/cli/scripts/late-source-revision-test.js | Existing upstream revision, stale approval and source-binding protections remain intact; EVIDENCE_PROTECTION-01.md |
| C-013 | node packages/core/test/control-state-test.js | Core permission, artefact, review and recording invariants remain intact; EVIDENCE_PROTECTION-01.md |
| C-014 | node packages/core/test/next-action-test.js | Derived next-action consistency uses existing evaluation without this slice changing the separate stale-action scope; EVIDENCE_SOURCE-01.md |
| C-015 | node packages/cli/scripts/instruction-footprint-test.js | Changed skill contracts/projections preserve activation, valid invocation and terminal instructions; EVIDENCE_SOURCE-01.md |
| C-016 | node plugins/agdf/scripts/check-runtime-integrity.mjs | Regenerated candidate runtime integrity passes; EVIDENCE_BUILD-01.md |
| C-017 | node packages/cli/scripts/package-contents-test.js | Candidate runtime/contracts are propagated into current package layout; EVIDENCE_BUILD-01.md |
| C-018 | git diff --check | No introduced whitespace defects; EVIDENCE_SOURCE-01.md |

Sequence: after baseline, extend affected tests/reproductions and implement T-002 through T-005; synchronize C-001 before suites depending on generated assets. Run C-002 through C-015, then C-016/C-017/C-018 on the final synchronized candidate. Relevant suites must pass without skipped/weakened assertions. If a new change follows, repeat affected checks and candidate identity assessment; do not repeat unaffected suites without cause. Required repository checks discovered during pre-implementation analysis remain mandatory. Run-level doctor/gate-check uses the supported exact runtime and selected run, recording current revision and output; source checks do not authorize a gate.

### Whole-Chain Comparison Ledger

Use one ledger in EVIDENCE_CHAINS-01.md with scenario, baseline/candidate identity, initial sources and approvals, input/failure condition, selected owner, actual dispatch outcome/host action, canonical write/revision, user prompt category and final boundary. Count avoidable extra continuation prompts, internal terminal stops and unchanged correction attempts separately from deliberate approval/clarification, necessary external action and genuine failure. For corrected eligible cases the extra continuation-prompt count must be zero. Record invocation mistakes separately; invalid public calls still terminate according to contract. Fixtures measure deterministic behavior; actual user/model timing is only reported from actual observations.

Resume cases deliberately interrupt after preparation and before reevaluation. Check both unchanged valid state and changed revision/authority. No old source digest, progress text or fixture approval may substitute for current canonical validation. For read-only cases, snapshot the canonical control directory's sorted path inventory and file-byte digests before/after in test-owned fixtures, including absence/presence; a status string alone is insufficient no-write evidence.

### Localization And Render Verification

Enumerate Object.keys of the current canonical locale registry, not a hardcoded subset. Render preparation/correction, ready approval, explicit status, external observation stop, technical/integrity stop and precise source recovery in each registered locale affected by this change. Save actual render output and a locale-by-state result table in EVIDENCE_LOCALES-01.md. Inspect actor/action semantics and representative displayed host rendering for clipping/readability. Unknown unsupported locale retains existing fallback behavior. No untranslated missing state or key-completeness-only result can be reported as a successful rendering check.

### Prepared Native Qualification Sequence

T-007 writes QUALIFICATION_PLAN-01.md before requesting any necessary installation/connection action. It contains source/derived-file/package/runtime/resource identities actually available, supported Codex host/version and configured model, disposable fixture paths, all prompts/actions below, expected observations, existing evidence applicability and a timestamp. Candidate hashes are execution facts and must be filled from the built candidate, not invented in this TP. The execution owner chooses the existing supported preparation/connection path from its contract; installation or host configuration changes require their own existing authorization. No package or host repair is implicit in this plan.

Use the actual supported Codex path for the reference qualification. The existing native codex-host-e2e script is a transport/contract probe and does not execute the full content/recording chain; its success alone cannot satisfy this sequence. Native script/model invocations are optional supporting transport evidence, not a replacement for actual multi-turn execution. Do not claim a second host without its own observation.

| Order | Actual-host action on prepared test-owned fixtures | Required recorded observation |
|---|---|---|
| N-001 | Observe the freshly connected supported host and actually loaded AGDF runtime/resource identity; compare with QUALIFICATION_PLAN-01.md | Host/version/model, candidate/runtime/resource identity, match or explicit gap before behavior claims |
| N-002 | On an isolated approved-upstream fixture missing UX, request continuation once; let the agent prepare/validate/record and reach the next genuine PRD decision | Actual MCP calls, named owner, resulting file/recording/revision and zero extra restart prompts; no synthetic approval treated as human approval |
| N-003 | On the prepared malformed-own-input fixture, continue once with the exact wrong readiness field case; separately observe a correction that makes no relevant progress | Precise expected/observed diagnosis, one permitted correction and validation; unchanged failure stops with actor/action rather than retrying |
| N-004 | On prepared QA-revise fixtures, request approved-scope implementation follow-up and internal-evidence follow-up once per case | Correct current permission/owner, actual work and refreshed evidence/review transitions; no QA approval from revise |
| N-005 | Observe prepared external-evidence and upstream-gap fixtures without performing forbidden recovery | Complete external plan precedes any actual connection request; upstream source boundary remains a decision; no blanket code/source authority |
| N-006 | Request explicit status and inspect technical/invalid-input stop cases | Actual terminal behavior matches actor wording; no post-terminal tool; read-only fixture control path/bytes stay unchanged |
| N-007 | Interrupt and resume the prepared permitted chain, then a changed-revision countercase | Fresh canonical binding, continued permitted work or precise changed-condition stop; no old approval or progress authority |
| N-008 | Consolidate all observations before leaving the prepared stable-candidate session | One actual event/prompt ledger, final candidate match, evidence applicability and explicit remaining gaps; no piecemeal requests for already known steps |

All test targets must be explicitly named and isolated from this production run and unrelated active runs. Setup derives from existing test helpers and is marked synthetic; the live agent must not fabricate user approval replies. Stop the fixture at its genuine pending approval rather than approving it. Code-correction fixture work is confined to its prepared disposable target and already declared synthetic scope. Where current host/tool access cannot observe a required event, record missing evidence and keep QA revise; never replace it with guessed behavior or a screenshot of another build.

If the candidate changes, update the plan and applicability ledger before another external request. Preserve unaffected source/protocol evidence with reasons and collect fresh affected native observations. A genuine host defect or real source correction may need another cycle. The target of one prepared session applies to one stable successful candidate, not to suppressing necessary repeat qualification.

## 4. Brownfield Scope

T-001 inspects current overlapping runs and source/working-tree baseline at Core readiness/gate-policy/gate-check, skill-dispatch/service and authoring phase helpers, delivery-continuation/service, canonical run writers and presentation bindings, interaction renderer/catalog/locales, analytical/authoring/QA contracts and existing test/fixture helpers. Verify reuse and differences from agdf-intake-continuation-repair, intermediate-card reduction, actionable-card wording and stale-next-action runs before editing shared paths. Preserve their bytes and approvals.

The normalized findings consumer belongs to the existing Core evaluation owner and follows quality.md; do not introduce a second route table in the dispatcher or a free-text classification fallback. Source diagnosis must retain containment/digest semantics and exact fields. Application-level relationship correction remains limited to its current checked case. Reassess scope/depth before dependent work if the compatible existing result/phase/input/schema boundaries are insufficient; TP cannot authorize public extensions beyond SD.

## 5. Out Of Scope

Gate removal/combination, automatic approvals, approval transfer, changed syntax or trust/permission boundaries; general card redesign or blanket suppression; persistent retry/orchestration state; new public result variant, phase, field or CLI flag; new host capability, installer/packaging repair, silent reinstall/restart, global inventory exclusion or unknown seal repair. No edits to approved UR/PRD/SD or other runs. No commit, push, PR, publication, deployment or release. Routine generated propagation remains inside existing ownership; external installation/connection actions remain separately authorized.

## 6. Risks And Blockers

- Block dependent implementation for invalid current binding, runtime/integrity failure, contradictory source authority, changed approved intent, uncontained/foreign source or a discovered design/contract extension. Use the existing earliest-owner route rather than silently expanding this plan.
- Revise for failing candidate checks, incomplete normalized finding/evidence records, missing traceability, false execution promises, incomplete localized rendered output, an unchanged correction loop or incomplete required actual-host qualification.
- Native access, version mismatch or required host action can remain an explicit external evidence gap after source tasks. This allows truthful progress recording but prevents a stronger QA pass/installed-host claim. A red source or package check is not a reason to request a reconnect prematurely.
- A prompt ledger is not a new policy store and deterministic fixture counts are not actual user timing. Native evidence must show real model/tool events, candidate identity and exact scope. Synthetic fixture approvals never authorize this run.
- Overlapping dirty work and generated/package baseline can change; capture/reassess it and preserve unrelated deltas. Pre-existing defects are attributed rather than quietly repaired or accepted as passing checks.
- T-009 records reviews with normalized finding rows; all applicable open/invalid findings prevent QA pass. qa-gate alone returns pass, revise or block. A revise report cannot request Approval: QA. Any necessary fixes refresh affected evidence/reviews before reassessment.

## 7. Next Step

Review this exact TP and decide with `Approval: TP`, request revision or decline. A valid TP approval permits the mandatory pre-implementation Brownfield Analysis, followed by approved-scope CD+Tests only when current analysis/control permits it. QA, UAT, installation and release approvals remain separate.

## AGDF Approval Summary (de; source=en)

- Aufgaben: Neun Aufgaben erfassen zuerst Baseline und Implementierungsvorbereitung, dann genaue Quelldiagnose/UX-Weiterleitung, normalisierte QA-Nacharbeit, begrenzte Korrektur, passende Darstellung, Ablaufprüfungen, Paketabgleich, echte Host-Prüfung und Reviews/QA. Alle acht PRD-Kriterien und sieben SD-Entscheidungen sind über 30 Szenarien zugeordnet.
- Tests: Vorhandene Core-/CLI-Suites werden um vollständige Vorbereitung-, Korrektur- und QA-Revise-Ketten erweitert. Fehlende Datei, falsches Feld, Implementierungs-/Nachweislücke und vorgelagerte Quellentscheidung werden getrennt geprüft. Ungültige Aufrufe, unveränderte Fehler, fremde/veraltete Freigaben, Integritätsfehler und Wiederaufnahme bleiben konkrete Gegenproben.
- Nutzen und Nachweise: Vergleichbare Vorher-/Nachher-Fälle zählen zusätzliche Weiterarbeits-Prompts getrennt von echten Freigaben und externen Aktionen. Erlaubte interne Ketten benötigen keinen zusätzlichen Neustartimpuls. Statuslesen erhält einen Nachweis unveränderter Kontrollpfade und Dateiinhalte; jeder geänderte Zustand wird in allen betroffenen registrierten Sprachen gerendert geprüft.
- Host-Prüfung: Vor einer nötigen Verbindung stehen tatsächliche Kandidatkennung, vorbereitete Testziele und die vollständige Folge bereit: geladene Fassung feststellen, UX-Vorbereitung/Korrektur, QA-Nacharbeit, externe/vorgelagerte Stopps, Statuslesen und Wiederaufnahme beobachten. Eine stabile erfolgreiche Fassung soll eine vorbereitete Sitzung benötigen. Quellen-/Paket-/Transporttests gelten jeweils nur für ihren eigenen Nachweis.
- Abgrenzung: Keine neuen Gates, automatischen Freigaben, öffentlichen Schnittstellen, Retry-Datenhaltung, Installer-Reparatur oder stillen Neustarts. Vorhandene verwandte Runs bleiben getrennt; keine Git- oder Release-Aktion. Installation/Verbindung braucht weiterhin die vorhandene eigene Berechtigung. Testfreigaben in isolierten Fixtures sind keine Nutzerfreigaben dieses Runs.
- Risiken und Qualität: Unklare Berechtigung oder geänderter Umfang stoppt abhängige Arbeit. Fehlende Host-Beobachtung, Kandidatenabweichung, fehlgeschlagene Tests, widersprüchliche Befunde oder falsche Fortsetzungsversprechen bleiben konkrete offene Punkte; kein QA-Pass aus bloß grünen Quellenchecks. Reviews liefern ihre Nachweise, qa-gate entscheidet allein.
- Nächster Schritt: `Approval: TP` erlaubt zuerst Brownfield Analysis und danach die aktuell erlaubte Umsetzung dieses Plans. Implementierung, Tests und Host-Beobachtung sind noch nicht erfolgt; QA/UAT und eine Veröffentlichung sind damit nicht freigegeben.
