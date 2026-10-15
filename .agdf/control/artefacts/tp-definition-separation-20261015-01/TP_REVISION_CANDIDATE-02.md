# TP: Dedicated Task Plan definition and actionable clarification

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-15
Owner: AGDF maintainer
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | After TP approval, perform required pre-implementation Brownfield Analysis; capture commit, worktree/source baselines, protected-source hashes, exact affected owners and package/dependency prerequisites. Record the permitted preparation result before code changes. | Coding agent using brownfield-analysis | TP approval |
| T-002 | Add the canonical tp-definition skill/contract, register its runtime modules and discovery, update conflicting role guidance, and extend the existing TP template with evidence obligations and declared planning decisions. | Coding agent, plugin definition/template owner | T-001 |
| T-003 | Implement pure bound TP assignment, typed Brownfield source lookup, safe direct/unbound behavior, canonical preparation/remediation ownership and existing gate-check fallback. Preserve PRD/SD source behavior. | Coding agent, Core dispatch/evaluation owner | T-001, T-002 |
| T-004 | Extend existing schema/normalization, CLI parsing/help/forwarding and generated bindings with mutually exclusive revision-bound tp_action/--tp-action. Reuse existing typed recording, source-revision and presentation/approval services. | Coding agent, Core/CLI contract owner | T-003 |
| T-005 | Extend the existing TP readiness aggregation with the declared planning-decision check; expose/reuse current SD parsing facts, validate exact later_tp coverage and preserve unmarked historical behavior. | Coding agent, Core traceability owner | T-002, T-003 |
| T-006 | Implement material-question blocking and concrete clarification handoff through existing normalized finding policy and gate/recovery owners. Share pure route validation with its existing consumer, preserve QA-stage boundaries, and require current source-valid closure before dependent resumption. | Coding agent, Core gate/normalized-gap owners | T-003, T-005 |
| T-007 | Add focused production-path regressions/eval cases and canonical test inventory entries; regenerate guards, host aliases/contracts/runtime and package assets through existing generators. | Coding agent, test/package generation owners | T-002 through T-006 |
| T-008 | Execute the planned checks, typed-recording/revision scenarios and bounded actual planning/question exercise against an isolated target with the prepared exact-version runtime. Retain commands, outputs, hashes, authored artefacts and semantic findings. Record CD+Tests only for actual results. | Coding agent | T-007 |
| T-009 | Perform task-plan-review, clean-implementation-review and mandatory code-review; resolve findings through existing owners, reconcile the existing Context Graph link, then run qa-gate. Carry explicit evidence limits into later human QA/UAT and existing OR; no automatic gate approval or VCS action. | Coding agent using the existing review/QA owners; human maintainer for gate decisions | T-008 |

## 2. Verification Traceability

Evidence paths below are planned run-local outputs under `.agdf/control/artefacts/tp-definition-separation-20261015-01/`. They are not existing test results. Scenario IDs are stable and identify separately assessed expected outcomes.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | Canonical registration/contracts expose one semantic TP author; gate-check retains control and task-plan-review retains post-implementation fulfilment. | verification/definition.log and AUTHORING_EXERCISE.md role review |
| AC-001 | SDD-002 | T-003 | SCN-002 | Production ordinary/direct eligible calls return the same bound tp_definition owner, exact approved PRD/SD sources and installed template. | verification/tp-definition.log and fixture continuation JSON |
| AC-002 | SDD-002 | T-003 | SCN-003 | Missing/foreign/stale/wrong-stage/approved/integrity/unsafe-source bindings never yield a generic authoring writer; ambient AGDF_RUN_ID cannot select scope. | verification/tp-definition.log, negative-case snapshots and protected-byte hashes |
| AC-002 | SDD-003 | T-004 | SCN-004 | Ready draft continuation, including direct skill without explicit revision, preserves bytes and presents current content; valid revision-bound tp_action yields eligible authoring. | verification/tp-definition.log and revision/presentation snapshots |
| AC-002 | SDD-008 | T-006 | SCN-005 | Authorized material-question continuation emits a precise question, consequence, needed answer and responsible owner without another start prompt; TP stays unready. | verification/tp-clarification.log and AUTHORING_EXERCISE.md actual question text |
| AC-003 | SDD-005 | T-005 | SCN-006 | Valid criterion/SD/task/scenario mapping passes; omitted/duplicate/foreign mappings and unusable expected results fail existing traceability checks. | verification/tp-readiness.log and fixture diagnostics |
| AC-004 | SDD-005 | T-008 | SCN-007 | Actual authored plan gives each applicable scenario a concrete route, environment, access, owner, evidence and unavailable action; missing permission never becomes authorization or a reported pass. | AUTHORING_EXERCISE.md, isolated authored TP and semantic review |
| AC-005 | SDD-005 | T-005 | SCN-008 | Declared planning format rejects unsupported/duplicate declarations, malformed rows, open decisions, missing owners/resolutions and missing/unknown/duplicate SD later_tp references; complete resolved coverage passes. | verification/tp-readiness.log and explicit case matrix |
| AC-005 | SDD-008 | T-006 | SCN-009 | TP-discovered intent/product/design/planning/evidence questions route through the canonical normalized policy to their existing responsible owners; source-content evidence justifies the chosen earliest gate. | verification/tp-clarification.log and handwritten routing fixture expectations |
| AC-006 | SDD-003 | T-004 | SCN-010 | CLI and MCP/function schema agree on valid tp_action and reject wrong skill, missing run/revision, conflicting authoring actions, status/continue misuse and unsupported action values. | verification/dispatch-contract.log and MCP continuation/contract outputs |
| AC-006 | SDD-004 | T-008 | SCN-011 | Actual initial typed recording and permitted replacement retain exact TP-derived_from-SD binding/history and other protected bytes; changed TP needs fresh presentation and old reply/presentation is rejected. | verification/recording.log and isolated receipts/hash manifest |
| AC-007 | SDD-001 | T-007 | SCN-012 | Canonical skill/module inventory and all generated host names resolve tp-definition once with the focused contract and unchanged request activation. | verification/activation.log, projection inventory and eval outputs |
| AC-007 | SDD-006 | T-007 | SCN-013 | Generated Codex/Claude, Copilot, OpenCode and package assets pass existing content/footprint/payload guards without relaxed limits or alternate registry. | verification/package.log and payload/footprint reports |
| AC-008 | SDD-007 | T-008 | SCN-014 | A real agent uses returned prepared-runtime continuation to author an isolated concrete TP and semantic review, including exact deferred SD decision disposition and unavailable access. | AUTHORING_EXERCISE.md, captured continuation and authored TP hashes |
| AC-008 | SDD-008 | T-006 | SCN-015 | Stale/unconfirmed answers, missing renewed source approval and stale dependent artefacts remain blocking; fresh valid source/impact evaluation permits resumption; unchanged blockers do not loop. | verification/tp-clarification.log and ordered state/hash observations |
| AC-002 | SDD-002 | T-003 | SCN-016 | Read-only status shows the current draft or pending clarification without editing, advancing control or invoking a correction owner. | verification/tp-definition.log and before/after fixture manifests |
| AC-005 | SDD-008 | T-006 | SCN-017 | Unchanged-source explanations use source-linked evidence; actual approved-source changes route through supported preview, separate confirmation and renewed approvals; unsupported automatic mutation is refused. | verification/tp-clarification.log, source-revision regression log and protected hashes |
| AC-005 | SDD-008 | T-006 | SCN-018 | Unknown/conflicting classification and missing handoff question/consequence/answer/owner remain blocking and ask focused clarification; no guessed TP route or ready presentation. | verification/tp-clarification.log and actual question examples |
| AC-005 | SDD-008 | T-006 | SCN-019 | A justified later execution detail records owner/reason/resolution point/current-decision validity; a material issue disguised as deferral blocks at its earliest affected owner. | verification/tp-clarification.log and semantic deferral comparison |
| AC-008 | SDD-007 | T-007 | SCN-020 | Existing PRD/SD source lookup, SD decision parsing, unmarked legacy plans and QA normalized-gap consumers retain their established behavior. | verification/regression.log and fixture byte/status comparisons |
| AC-006 | SDD-004 | T-008 | SCN-021 | Existing writer/recovery checks reject stale source, foreign destination, protected-byte changes and unsupported replacement while preserving receipt history and recoverable state. | verification/recording.log and existing transaction/revision test outputs |
| AC-008 | SDD-007 | T-009 | SCN-022 | Review reports assess every task and evidence limit; mandatory Code/Clean reviews and QA expose unresolved findings rather than reporting unproved completion. | TASK_PLAN_REVIEW.md, CLEAN_IMPLEMENTATION_REVIEW.md, CODE_REVIEW.md and QA_REPORT.md |
| AC-007 | SDD-006 | T-007 | SCN-023 | Prepared exact-version runtime contains coherent skill/contracts/template/argument support; missing/unsafe templates fail closed and no installed plugin is modified. | verification/runtime.log, prepared-runtime manifest and isolated continuation |

## 3. Test Plan

### Execution environment and prerequisites

Execution owner for all local checks is the coding agent after TP approval and recorded pre-implementation analysis. Use the repository's existing Node/npm invocation owners; local Node 22.22.3 is available at `/usr/local/Cellar/node@22/22.22.3/bin/node`. Root ajv and yaml resolve locally and a UI build directory exists; do not assume those facts prove a fresh coherent build. Test fixtures and ephemeral outputs belong in a dedicated OS temporary directory; retained evidence belongs in this run's artefact directory. Capture start/end source revision and protected-source hashes.

The MCP SDK currently does not resolve from packages/mcp-server (MODULE_NOT_FOUND for @modelcontextprotocol/sdk/server/index.js). The dependency route is fixed: after TP approval, use the existing lockfile and `npm ci --ignore-scripts` with packages/mcp-server as working directory if the required dependency is still unavailable. No global install or host registration is needed. Prefer an existing verified local package/cache when supported by the normal npm path. If network/sandbox access is unavailable, retain the exact failed prerequisite, complete independent local work and obtain only the required dependency access through the normal permission flow. Relevant MCP scenarios and final QA remain unverified/blocked until executed successfully; no skipped test counts as pass.

### Command routes

Commands are planned, not executed in this TP. New focused scripts listed below are deliverables of T-007 and must exercise production owners, with independently specified expected cases. Run from repository root unless a working directory is stated. Retain exit code, command, runtime/source identity and full output in the indicated log; a manifest links each scenario to its assertion/result.

| route | Commands and scope | Planned evidence |
|---|---|---|
| R-DEF | Add/run `node packages/cli/scripts/tp-definition-test.js`; run `npm --prefix packages/cli run test:skill-dispatch` and `npm --prefix packages/cli run test:copilot-profile`. Cover actual bound/direct/unbound/preparation/remediation paths and safe fallback. | verification/tp-definition.log and definition.log |
| R-CONTRACT | Run `node packages/cli/scripts/skill-dispatch-function-contract-test.js`; run MCP `test:contract` and `test:continuation` through `npm --prefix packages/mcp-server run <script>`. Update existing CLI/function/host tests for the new flag. | verification/dispatch-contract.log and mcp.log |
| R-READY | Add/run `node packages/core/test/tp-readiness-test.js`; run `node packages/core/test/artifact-readiness-test.js`, `npm --prefix packages/cli run test:cli-gates` and `npm --prefix packages/cli run test:sd-readiness`. Use real evaluator/presentation/approval consumers in negative cases, not only helper return values. | verification/tp-readiness.log |
| R-CLARIFY | Add/run `node packages/cli/scripts/tp-clarification-test.js`; cover normalized routes, required handoff details, blocked actual presentation/approval, answer/source validation, fresh resumption and unchanged-stop behavior. Handwritten cases cover all responsible gates and uncertainty. | verification/tp-clarification.log |
| R-RECORD | Run `npm --prefix packages/cli run test:run-step-transaction`, `npm --prefix packages/cli run test:run-command-flow` and `npm --prefix packages/cli run test:late-source-revision`; include TP initial/replacement/old-response scenarios in R-DEF/R-CLARIFY using actual existing writers and isolated fixture approvals only. | verification/recording.log and source-revision.log |
| R-REGRESS | Run `npm --prefix packages/cli run test:prd-definition`, `npm --prefix packages/cli run test:sd-definition`, `npm --prefix packages/cli run test:artifact-language`, `node packages/core/test/control-read-provider-test.js` and `node packages/core/test/qa-deviation-acceptance-test.js`; extend the existing QA follow-up/normalized finding cases within those owners while preserving QA-stage wrapper eligibility. | verification/regression.log |
| R-GENERATE | Run `npm run build:prepare` through the existing repository preparation pipeline. It owns prerequisite UI build, canonical generation and assembly; if dependencies are unavailable, use their normal locked preparation route and retain the gap. Never hand-edit generated assets or suppress a failed guard. | verification/generation.log |
| R-PACKAGE | After coherent preparation, run CLI `test:request-activation`, `test:agent-skills-conformance`, `test:skill-evals`, `eval:skills`, `test:package-contents`, `test:package-build`, `test:public-plugin`, `test:portable-plugin` through `npm --prefix packages/cli run <script>`; run `node packages/cli/scripts/payload-budget-test.js` and `node plugins/agdf/scripts/check-runtime-integrity.mjs`. Check generated runtime with its existing integrity entry point and exact-root environment binding. | verification/activation.log, package.log and runtime.log |
| R-AUTHOR | Using `packages/cli/generated/plugins/agdf/runtime/agdf-local.js` from the final prepared package, invoke actual `skill-dispatch --skill tp-definition --language de` against a dedicated isolated target with approved fixture PRD/SD. Follow its returned contract to author a real plan, then a concrete material-question example. Retain the returned JSON, source/plan hashes, question, answer provenance and semantic review. Exercise typed recording and decision boundaries through their actual owners. | AUTHORING_EXERCISE.md and verification/authoring/ |
| R-REVIEW | Existing task-plan-review, clean-implementation-review, code-review and qa-gate against the actual scoped diff/results; reconcile the existing Context Graph link before clean closeout. Run any additional mandatory checks required by those owners or newly changed shared paths; repeat only after relevant change/failure. | Four review/QA reports plus CD_TESTS.md |

Add focused new tests to the existing appropriate package/smoke inventory so future CI reaches them. Do not create another test authority or weaken limits/assertions. Actual generated package tests are required even when source tests pass. Broaden verification when a shared-owner change or failure demonstrates a need; do not substitute a synthetic import-only test for a production-path scenario.

### Evidence Obligations

Environment L = local Node/npm on macOS and isolated temp fixtures, no external account. Environment M = local real MCP server/transport after SDK resolution, no host registration. Environment P = existing generated/package pipeline and coherent prepared artefacts. Environment A = actual agent plus prepared-runtime isolated target, explicitly cooperative evidence. Environment Q = existing scoped reviews and QA. Owner CA = coding agent using the route's existing service/skill. For every unavailable prerequisite, retain exact failure and affected scenario, refresh via the existing owner, and keep that result unverified; never infer access or pass.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | R-DEF and R-AUTHOR | L, A | Approved TP; local repo/temp writes only | CA | Registry/role assertions and semantic role review | Keep role/author evidence open until actual checks run. |
| AC-001 | SCN-002 | R-DEF | L | Controlled approved fixture sources; prepared template | CA | Bound continuation with exact identities | Repair fixture/runtime through its owner; no foreign-run fallback. |
| AC-002 | SCN-003 | R-DEF | L | Isolated hostile/stale/approved fixtures; hash baseline | CA | Rejections and unchanged protected manifest | Missing negative-case evidence blocks closure. |
| AC-002 | SCN-004 | R-DEF and R-RECORD | L | Ready unapproved fixture and explicit fixture revision intent | CA | Preserved bytes, correct phase and fresh presentation | Keep revision scenario unverified, never edit live approved sources. |
| AC-002 | SCN-005 | R-CLARIFY and R-AUTHOR | L, A | Handwritten material question; actual continuation | CA | Required question text and blocked state | Ask only missing semantic fact; retain blocker. |
| AC-003 | SCN-006 | R-READY | L | Criterion/decision fixture identities | CA | Positive and negative evaluator outputs | Traceability result remains unverified. |
| AC-004 | SCN-007 | R-AUTHOR | A | Existing agent; isolated sources; deliberate unavailable-access example | CA | Actual obligations table and semantic assessment | Record missing access and prescribed action, no acquisition assumed. |
| AC-005 | SCN-008 | R-READY | L | Valid/malformed declared planning fixtures | CA | Complete case matrix and actual approval suppression | Keep relevant readiness unqualified. |
| AC-005 | SCN-009 | R-CLARIFY | L | Current quality contract and independently specified route cases | CA | Earliest-owner routing assertions | Missing/conflicting policy input stays blocking. |
| AC-006 | SCN-010 | R-CONTRACT | L, M | Locked MCP SDK; local pipes; no account/config access | CA | CLI/schema parity and transport outputs | Resolve SDK through locked install; keep MCP tests/QA blocked if unavailable. |
| AC-006 | SCN-011 | R-RECORD | L | Isolated writer fixture and protected-byte baseline | CA | Exact receipts, history and old-response rejection | Use existing transaction recovery; no manual reseal. |
| AC-007 | SCN-012 | R-GENERATE and R-PACKAGE | P | Existing build dependencies and canonical generators | CA | Host alias/contract inventory and activation checks | Resolve exact build prerequisite; no manual derived edits. |
| AC-007 | SCN-013 | R-PACKAGE | P | Coherent prepared assets and the exact scoped BUDGET-001 caps and all other unchanged guard baselines | CA | Package/footprint/payload results | Reduce scoped duplication or surface unresolved guard failure; only the explicit BUDGET-001 cap adjustment; no other increase. |
| AC-008 | SCN-014 | R-AUTHOR | A | Final prepared exact-version runtime; isolated target | CA | Actual source/plan/continuation and semantic review | Retain incomplete authoring proof; no generic reliability claim. |
| AC-008 | SCN-015 | R-CLARIFY | L | Ordered current/stale answers and source revisions | CA | Blocked/resolved sequence and no-loop observations | Keep affected answer/impact result blocking. |
| AC-002 | SCN-016 | R-DEF | L | Read-only fixture status and full baseline | CA | No-write manifests and pending status | Treat unexpected mutation as defect, stop dependent work. |
| AC-005 | SCN-017 | R-CLARIFY and R-RECORD | L | Controlled revision-eligible/ineligible approved fixtures | CA | Existing preview/confirmation boundary and hashes | Unsupported eligibility remains explicit blocker. |
| AC-005 | SCN-018 | R-CLARIFY and R-AUTHOR | L, A | Ambiguous/malformed question cases | CA | Concrete question and no ready decision | Keep classification unknown and ask focused question. |
| AC-005 | SCN-019 | R-CLARIFY | L | Legitimate and disguised deferral cases | CA | Gate-validity reasoning and blocked material case | No harmlessness assumption; route missing fact. |
| AC-008 | SCN-020 | R-REGRESS and R-READY | L | Existing PRD/SD/legacy/QA fixtures | CA | Existing policy/result compatibility observations | Fix shared regression before final QA. |
| AC-006 | SCN-021 | R-RECORD | L | Existing fault/recovery fixture facilities | CA | Protected-state/history and recovery results | Use exact supported recovery; retain failed obligation. |
| AC-008 | SCN-022 | R-REVIEW | Q | Actual scoped diff and all preceding evidence/limits | CA; human gate decisions | Task/Clean/Code/QA reports | Report revise/block and route missing obligation. |
| AC-007 | SCN-023 | R-GENERATE and R-PACKAGE | P | Final runtime/template manifests and isolated unsafe-template fixture | CA | Coherent package and fail-closed template cases | Explicit package repair; never repository-template fallback. |

### Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Execution routes, environments and retained outputs | SD: Concrete scenario execution routes | resolved | The routes and per-scenario obligations above fix concrete commands, fixture/environment requirements, responsible owner, evidence outputs and unavailable actions. Any subsequently discovered material fact triggers the approved blocking clarification behavior. | Coding agent, current gate-check TP author |
| MCP dependency availability | TP | resolved | SDK is presently unavailable; R-CONTRACT uses the existing locked local dependency installation after TP approval. Denied/unavailable access keeps affected scenarios and final QA unverified/blocked while independent checks continue. | Coding agent |
| Native-host qualification boundary | TP | resolved | This slice qualifies canonical/generated packages and local real protocol paths plus a cooperative authoring exercise. No global install or fresh native Codex/Claude/Copilot/OpenCode/Windows support claim is made; unobserved host lanes are explicit limits in QA/UAT/OR. | AGDF maintainer |
| Material clarification applicability in this plan | TP | resolved | No unanswered requirement or architecture decision prevents this plan. Dependency acquisition is an explicitly handled execution prerequisite; it is not represented as successful validation. | AGDF maintainer |

There are currently no material clarification findings. Future discovered findings use the approved SD's normalized policy and linked detail requirements in this same artefact/its supported revision; no separate question store. The planning declaration here is supplemental content under the currently installed TP template; the current installed runtime does not yet implement the new declared-format checks being delivered. Existing criteria-chain checks are still required now.

## 4. Brownfield Scope

Before implementation recheck plugin definition, definition/gate/review skill contracts, current TP template, Core dispatch/source inspection/readiness and normalized QA finding consumers, Core recording/presentation/revision owners, CLI parse/help/validation forwarding, MCP continuation/function schema, request-activation and host/package generators, instruction/payload guard owners and affected tests/eval inventory. Preserve the existing narrow source-of-truth boundaries described in SD. Identify exact diff paths in pre-implementation Brownfield Analysis and extend only required existing owners.

Record protected UR/PRD/SD and other-run hashes before code changes and verify after scoped work. Do not interpret unrelated active runs as part of this TP. Reconcile the existing Context Graph ownership/evidence link using final verified references at closeout; no automatic creation of a parallel knowledge node or personal-memory update.

## 5. Out Of Scope

No additional gate, approval formula, writer/state store or general redesign of every definition skill. No automatic approved-source edits, changed acceptance authority or edits to unrelated runs. Fixture approval replies are explicitly synthetic test data and cannot approve this Run. No host installation/registration, global configuration change, external messaging, publication, release, deploy, commit or PR action is included. Package preparation is local build/evidence work only.

## 6. Risks And Blockers

- Missing prerequisite/source integrity, unresolved material question, unknown route, unsafe template or unsupported revision blocks dependent work through the existing owner.
- MCP dependency access is currently unavailable locally; the plan resolves how to obtain/handle it, while actual test execution remains pending. Relevant missing protocol evidence cannot be waived into pass.
- Shared parser/source-lookup changes can regress SD/PRD/QA behavior; compatibility scenarios are required.
- New planning declarations, normalized questions and generated flags could disagree across readers; test actual writer, evaluator, presentation, approval, CLI and MCP consumers, and forbid loop-based repair.
- For BUDGET-001 only, permit the measured scoped caps: Copilot max_files 260 and max_bytes 2256982; sessionStartBase maxNormalizedBytes 1912. Retain every guard and all other caps. Any further excess blocks delivery.
- Structural checks cannot prove that all semantic questions were found. The concrete authoring/question exercise and reviews must state that limit, together with unobserved native-host/Windows lanes.
- No success is claimed by this plan. CD+Tests, mandatory reviews, final qa-gate, deliberate human QA/UAT and existing OR remain separate later obligations.

## 6a. Scoped revision BUDGET-001

This proposed revision changes only the execution guard allowance. The maintainer's answer is: "Ja, passe die Grenzen im Rahmen der begrenzten TP-Revision an und mach weiter."

Permit Copilot max_files 260/max_bytes 2256982 and sessionStartBase maxNormalizedBytes 1912, based on the exact retained measurement. Update each baseline rationale with this skill's scoped inventory. Keep the guards active, every integrity/completeness/activation check, every other limit and the existing acceptance/design scope. No additional payload headroom, installation, release, VCS or native-host qualification is authorized. A subsequent excess is a new material blocker.

Reassess the existing analytical evidence and retained implementation against the renewed TP; keep prior results historical rather than transferring fulfillment. Run the full preparation/package/conformance/activation/integrity routes and repeat the bounded authoring exercise against the final prepared package. Fresh applicable reviews and qa-gate precede human QA/UAT and OR. BUDGET-001 is answered in scope; its execution and renewed approval remain pending until the existing source-revision and deliberate TP approval procedures succeed.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

After the separately confirmed TP source revision and fresh TP approval, reassess the existing Brownfield Review/Analysis and retained implementation, record current preparation, then apply only the stated caps and execute all remaining scoped checks. Continue to the existing QA/UAT/OR boundaries; this approval does not grant those later decisions.

## AGDF Approval Summary (de; source=en)

- Ziel: tp-definition mit sicherer Erstellung/Revision und konkreter Rückgabe wesentlicher offener Fragen umsetzen; vorhandene Core-, Freigabe- und Reviewrollen beibehalten.
- Aufgaben: Zuerst vorbereitende Brownfield Analysis und Ausgangsnachweise. Danach Skill/Vertrag/Vorlage, gebundene Zuweisung, Revisionsargumente, Planungsprüfung und Klärungsrouting implementieren. Bestehende Host-/Paketprojektionen erzeugen, tatsächliche Pfade prüfen und konkrete Plan-/Fragentexte an einem isolierten Ziel erstellen. Abschließend Task-, Clean-, Code-Review und QA mit vorhandenen Zuständigkeiten.
- Abdeckung: 23 Szenarien ordnen alle acht PRD-Kriterien und zugehörigen SD-Entscheidungen Aufgaben, erwarteten Ergebnissen und Nachweisen zu. Sie prüfen auch falsche Bindungen, unveränderte fertige Entwürfe, geschützte Quellen, alte Antworten, Materialität, Gate-Zuordnung, echte Klärungsfragen, zulässige Verschiebung und gültige Fortsetzung.
- Nachweise: Jede Prüfung nennt konkreten Testweg, Umgebung, Voraussetzungen/Berechtigungen, Verantwortlichen, Ausgabe und Vorgehen bei fehlendem Zugang. Bestehende Produktionsdienste und Paketprüfungen werden verwendet; Strukturprüfungen werden durch eine konkrete fachliche Plan-/Fragenprüfung ergänzt.
- Voraussetzungen: Node und zentrale Hilfsbibliotheken sind lokal vorhanden. Das MCP-SDK fehlt derzeit. Nach TP-Freigabe erfolgt bei Bedarf die normale lockfilegebundene lokale Installation; bei fehlendem Zugang bleiben betroffene MCP-Prüfungen und abschließende QA gesperrt. Unabhängige Arbeit kann weiterlaufen. Keine globale Hostinstallation ist nötig.
- Grenzen und Risiken: Keine neuen Freigaben oder parallelen Wahrheiten, keine stillen Änderungen freigegebener Quellen, nur die ausdrücklich begrenzte Anpassung BUDGET-001 auf 260 Dateien/2.256.982 Bytes für Copilot und 1.912 normalisierte Bytes für Sessionstart und keine Veröffentlichung. Neue lokale Tests und Paketnachweise belegen keine unbeobachtete native Host-/Windows-Qualifikation und nicht das Finden jeder fachlichen Frage. Offene Nachweise bleiben ausdrücklich sichtbar.
- Entscheidungen: BUDGET-001 ist fachlich durch die ausdrückliche Antwort des Maintainers geklärt: ausschließlich die oben genannten gemessenen Grenzwerte anpassen; alle übrigen Grenzen bleiben erhalten. Die zum TP verschobene Ausführungsplanung ist mit Befehlen, Umgebungen, Zuständigkeiten und Nachweisdateien aufgelöst. Keine wesentliche fachliche Frage bleibt offen; fehlende technische Voraussetzungen haben einen konkreten Beschaffungs- und Sperrpfad.
- Nächster Schritt: Begrenzte Quellenrevision separat anwenden und den geänderten TP neu freigeben; danach analytische Vorbereitung und bestehende Umsetzung neu bewerten, ausschließlich die genannten Grenzwerte anpassen und sämtliche offenen Paket-, Review- und QA-Prüfungen ausführen.
