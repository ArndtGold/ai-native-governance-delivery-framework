# TP: Implement and qualify compact execution continuation

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-14
Owner: Arndt Gold
Run: compact-execution-continuation-20261014-01
Traceability contract: criteria-chain-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Revalidate the existing policy/evidence owners and implement canonical compact operation selection, including reviewed Quick Task and executed/completed routing. Scope: packages/core/lib/control-evaluation/gate-policy.js and directly necessary gate-check.js projection only. | Codex | Approved TP; implementation-preparation Brownfield Analysis |
| T-002 | Add the bound compact implementation and compact closeout handoffs to packages/core/lib/skill-dispatch/service.js. Reuse current contained source/record readers and runtime contracts; preserve structured implementation, Verified Change preparation and application continuation. | Codex | T-001 |
| T-003 | Extend existing policy/dispatcher/compact and MCP tests with positive, refusal, in-progress and completion scenarios. Use existing test owners; add a narrowly registered regression file only if existing fixture ownership makes it necessary. | Codex | T-001, T-002 |
| T-004 | Update affected focused contracts/documentation and derive host/runtime assets through existing generators. Preserve all guard fingerprints, instruction budgets, schema envelopes, gate semantics and current locale ownership; render all affected registered locales/states. | Codex | T-001, T-002 |
| T-005 | Prepare the local candidate through normal tooling; run the supported Codex installer; verify exact installed build/digests and actual installed CLI/STDIO outcomes on disposable targets. Prepare the native observation/reconnect sequence before any necessary external action. | Codex | T-003, T-004; source/package candidate checks pass |
| T-006 | Record CD+Tests and mandatory Code Review, TP Review, Clean Implementation Review and QA evidence through existing owners. Retain installed-vs-native limitations and stop at QA/UAT decisions; perform existing OR closeout when permitted. | Codex using existing review/QA owners | T-001 through T-005 |

## 2. Verification Traceability

PRD.md remains the sole acceptance register. Every table row below names the approved criterion/design decision, one task, one specific scenario and its observable evidence. Evidence paths are relative to this Run's artefact directory.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-001 | SCN-001 | Fresh permitted unfinished Quick Task policy returns implement_compact_scope with implementation effect and existing gate-check owner. | evidence/source-policy.json; existing policy/dispatch regression assertions |
| AC-001 | SDD-001 | T-002 | SCN-002 | Bound continue_delivery yields nonterminal compact_implementation with matching target/Run/current revision, current UR source and required runtime contracts. | evidence/source-dispatch.json; packages/cli/scripts/skill-dispatch-test.js |
| AC-001 | SDD-001 | T-005 | SCN-003 | The newly installed CLI and installed MCP STDIO return executable Quick Task handoffs; a disposable real-flow fixture performs its change/check/review/OR-lite without a redundant continuation prompt. | evidence/installed-qualification.json; evidence/installed-stdio.jsonl |
| AC-002 | SDD-002 | T-003 | SCN-004 | Missing/draft Verified Change retains preparation; no implementation packet appears before eligibility. | evidence/verified-change-matrix.json; existing verified-change and dispatcher tests |
| AC-002 | SDD-002 | T-002 | SCN-005 | Fresh eligible Verified Change yields compact implementation bounded to its canonical record, allowed paths and deterministic commands. | evidence/source-dispatch.json; verified-change-test.js and dispatch assertions |
| AC-002 | SDD-002 | T-003 | SCN-006 | Dirty candidate, stale HEAD, introduced unlisted path, unsupported impact or missing propagation/validation obligation keeps existing refusal/escalation. | evidence/verified-change-matrix.json; packages/cli/scripts/verified-change-test.js |
| AC-002 | SDD-002 | T-005 | SCN-007 | Actual installed CLI Git-aware eligible invocation succeeds; actual installed MCP without Git observations rejects active Verified Change with concrete baseline-unavailable diagnostics. | evidence/installed-qualification.json; evidence/installed-stdio.jsonl |
| AC-003 | SDD-003 | T-003 | SCN-008 | A read-only compact status request remains terminal and causes no execution or control mutation. | evidence/refusal-matrix.json; before/after fixture bytes |
| AC-003 | SDD-003 | T-003 | SCN-009 | Missing/stale/foreign approval or changed approved source produces its existing blocker and no executable compact packet. | evidence/refusal-matrix.json; actual canonical fixture approval/source checks |
| AC-003 | SDD-003 | T-003 | SCN-010 | Ambiguous/foreign target or Run and invalid input preserve existing resolution/refusal; exact returned binding is never substituted. | evidence/refusal-matrix.json; dispatch and binding regressions |
| AC-003 | SDD-003 | T-003 | SCN-011 | Invalid seal, unrelated doctor blocker or incompatible runtime prevents compact execution while retaining concrete recovery. | evidence/refusal-matrix.json; canonical integrity and installed-runtime identity cases |
| AC-003 | SDD-003 | T-005 | SCN-012 | Installed status and refusal invocations show the same protected boundaries; observe unchanged disposable control bytes for read-only cases. | evidence/installed-qualification.json; installed CLI/STDIO request/result log |
| AC-004 | SDD-004 | T-001 | SCN-013 | Current fulfilled Quick Task Code Review selects compact closeout through release-or, not another implementation packet; stale/nonpassing review does not prove fulfillment. | evidence/reentry-completion.json; policy/dispatcher and writer fixture tests |
| AC-004 | SDD-004 | T-003 | SCN-014 | Recorded executed Verified Change enters existing OR/mini-closeout; completed valid Runs remain terminal with no further work. | evidence/reentry-completion.json; verified-change and closeout regressions |
| AC-004 | SDD-004 | T-003 | SCN-015 | Interrupted partial work revalidates current facts; changed evidence or revision is not reused as completion/permission. | evidence/reentry-completion.json; exact revision and applicable-evidence assertions |
| AC-004 | SDD-004 | T-005 | SCN-016 | Disposable installed complete flows retain valid seals/receipts and exact finished state; repeated invocation does not replay completed work or run Git publication commands. | evidence/installed-qualification.json; selected fixture completion and invocation observations |
| AC-005 | SDD-005 | T-003 | SCN-017 | Existing structured approved-TP implementation and Verified Change record preparation retain their previously supported continuation phases and boundaries. | evidence/regressions.json; existing skill-dispatch and MCP continuation tests |
| AC-005 | SDD-005 | T-004 | SCN-018 | Each affected registered locale/card/state communicates executing versus terminal outcomes correctly and remains complete. | evidence/locale-renderings.json; operational-localization and interaction-presentation results |
| AC-005 | SDD-005 | T-004 | SCN-019 | Generated contracts/host projections pass integrity, activation and instruction-footprint checks without new gates, skills, schema envelopes or public flags. | evidence/package-checks.json; generator and runtime-integrity outputs |
| AC-006 | SDD-006 | T-005 | SCN-020 | Normal local Codex installation succeeds and reports the content-derived new build; computed source/runtime digests and marketplace/cache agree. | evidence/install-report.json; evidence/installed-identity.json |
| AC-006 | SDD-006 | T-005 | SCN-021 | Actual installed launcher exchanges use that exact new runtime generation and preserve protocol/permission boundaries. | evidence/installed-stdio.jsonl; observed launcher/server/generation identity |
| AC-006 | SDD-006 | T-005 | SCN-022 | An older running generation is identified separately; before any needed native reconnect one exact candidate, supported action and full bounded observation sequence are ready. | evidence/NATIVE_VALIDATION.md; evidence/installed-identity.json |
| AC-006 | SDD-006 | T-006 | SCN-023 | Final QA distinguishes source/package/installed/native results, states every unavailable observation concretely and never presents an older build as the fix. | QA_REPORT.md; evidence/QUALIFICATION_SUMMARY.md |

## 3. Test Plan

### Implementation and evidence order

1. After TP approval, perform implementation-preparation Brownfield Analysis against the approved PRD/SD/TP and fresh current files. Confirm the current evidence/closeout owners and that no intervening change invalidates the design. Record that internal step before CD+Tests.
2. Retain evidence/installed-baseline.json and installed-baseline-repro.mjs unchanged as the old-build unit-seam baseline. Extend existing source tests for the designed operation, packet, refusal and progress cases. New fixture code is written only after implementation becomes permitted.
3. Implement T-001/T-002 without unrelated refactoring. Use canonical evaluated operation data, contained readers and current revision/source facts. Do not execute argv/validation commands inside the dispatcher itself.
4. Run the affected test families and current source integrity checks. Correct failures within approved scope and preserve assertions. Run normal generation/assembly before package consumers; do not treat stale generated assets as the candidate.
5. Qualify packaged behavior, then update the local Codex plugin through install:codex. Observe exact new build/digests and the actual launched installed runtime, not merely the candidate directory.
6. Execute retained disposable installed CLI/STDIO qualification. Capture exact requests/results and fixture state changes. Any synthetic scenario approvals belong only to clearly disposable test fixtures and never authorize this or another live Run.
7. Record CD+Tests, mandatory CR, plan/structural reviews and QA through their existing owners. Obtain the actual remaining QA/UAT decisions before claiming governed completion.

### Affected automated suites

Run the following existing suites as appropriate to these changed owners, retaining concise pass/fail records and full failures:

- `npm --prefix packages/cli run test:skill-dispatch`
- `npm --prefix packages/cli run test:verified-change`
- `npm --prefix packages/cli run test:control-state`
- `npm --prefix packages/cli run test:cli-gates`
- `npm --prefix packages/cli run test:run-command-flow`
- `npm --prefix packages/cli run test:interaction-presentation`
- `npm --prefix packages/cli run test:operational-localization`
- `npm --prefix packages/cli run test:instruction-footprint`
- `npm --prefix packages/cli run test:request-activation`
- `npm --prefix packages/cli run test:runtime-integrity-layout`
- `npm --prefix packages/cli run test:runtime-integrity-negative`
- The relevant existing MCP contract/continuation/safety/provenance/flow suites under packages/mcp-server, consuming the normally prepared owned-package fixtures.

The exact changed assertions live primarily in skill-dispatch-test.js and verified-change-test.js, with actual canonical/installed flows using existing run-command/closeout and MCP fixture ownership. A new narrowly registered test file may collect the compact matrix if necessary; it must not become another policy or fixture source of truth. Re-run a suite only after a relevant change/failure or unresolved concern.

### Generation, package and installation

Use the repository's existing generation/preparation/assembly tooling and build-contract/runtime integrity checks. Shared tests that consume dist/npm must see freshly assembled output. If normal build checks require compatible source snapshots, follow their existing owner rather than weakening freshness or overwriting evidence indiscriminately. Keep installation scope local Codex only.

Run the supported `npm run install:codex` after candidate checks; retain its report. Honor sandbox review for external installation paths using the user's already requested local-plugin update as the concrete scope. Do not directly edit installed cache or marketplace files. Record installed root, content-derived version, source/runtime digests, MCP launcher and generation identity. Code-only passing checks are not an installed success.

### Disposable installed qualification

Use a retained script at evidence/installed-qualification.mjs and freshly created disposable targets under the allowed temporary directory. It must invoke the supported installed CLI entrypoint and the installed MCP launcher through actual STDIO, collect exact request/result records in installed-stdio.jsonl, and clearly mark synthetic fixture decisions/observations. It must not mutate other live Runs or substitute mocked eligibility for protocol proof.

- Quick Task: create a bounded real disposable change, obtain only synthetic test-fixture prerequisites, observe the executable handoff, perform its deterministic check, record an actual CR result and existing OR-lite closeout, then inspect/reinvoke the completed state.
- Verified Change: create a disposable Git baseline and current eligible record through the existing supported revision path; use installed CLI Git-aware evaluation for eligible/executed/mini-closeout states. Retain exact changed-path, validation and applicable propagation evidence.
- Installed MCP: observe Quick Task continuation/status/refusal and current Verified Change Git-unavailable refusal. No Git observation or authority field is added to the MCP server, and no eligible stub response counts as this positive protocol proof.
- Refusals: actual installed invocations cover stale revision/source, missing approval, ineligible record, read-only status and completed state where the existing supported surface can exercise them. Remaining policy/input unit cases retain their explicitly lower evidence class.

Native Codex/model evidence is a separate lane. Prepare evidence/NATIVE_VALIDATION.md with exact candidate identity, supported reconnect/reopen action, positive/refusal/finish observations and teardown before requesting any necessary host action. Avoid a global automatic restart. If this lane cannot be observed, keep the concrete limitation in QA/QUALIFICATION_SUMMARY and do not claim it.

### Reviews and completion

Use existing Code Review for the actual diff; TP Review checks every planned task/scenario/evidence obligation; Clean Implementation Review checks ownership, reuse and absence of parallel authority; QA alone decides pass/revise/block. Preserve all current evidence and explicit limitations. The user's original request authorizes the scoped fix and local installation; exact QA/UAT approvals remain separate governed decisions. No commit/push/PR/release is included.

## 4. Brownfield Scope

Before implementation, inspect the current approved sources and these owners only as needed:

- Core gate-policy.js, gate-check.js and isInternalStepSatisfied/evidence-applicability helpers: effective compact operations and completed/remaining obligations.
- Core verified-change.js and contained-file/read helpers: current declared record/baseline/scope facts.
- Core skill-dispatch/service.js, contract.js and delivery-continuation/service.js: nonterminal packets, exact binding and existing structured/preparation flow.
- Core run-steps.js, run-recording.js and closeout/readiness: current supported Quick Task and Verified Change recording/closeout. Keep their authority; if an approved requirement cannot be satisfied without widening them, record the concrete design_gap before changing the design.
- CLI Git observer and validation-handlers.js versus MCP createCoreServices runtime: actual observation capabilities.
- Existing focused runtime contracts, interaction renderer/locale registry, shared generators, supported local Codex installer and the existing source/MCP/canonical fixture tests.

Source and generated copies are separate roles. Canonical edits belong to packages/core, the existing tests and plugins/agdf focused contracts/documentation; generated runtime/host copies are produced only through their current tooling. Approved UR/PRD/SD bytes remain protected.

## 5. Out Of Scope

New gates, approval formulas, skills, public CLI flags/command groups, MCP Git subprocess capability, independent human-identity proof, persistent retry/execution store, durable exactly-once implementation, foreign live Run repair, global automatic host restarts, duplicate Delivery Map optimization, release/version publication and all Git publication/deployment actions remain excluded.

## 6. Risks And Blockers

- `block`: Stale/fabricated/foreign bindings, changed approved source, invalid seal or unsupported runtime authority enters compact implementation; required proof remains missing but is accepted as eligible.
- `revise`: A nonterminal compact handoff is missing its current bound sources/contracts; reviewed/executed/completed work is routed back into implementation; the compact report/record cannot be canonically published through the specified existing owner.
- `revise`: Required source/package/installed CLI/STDIO scenarios fail or refer to an old build. Unchanged failures stop with their actual cause; no tests are skipped or weakened to manufacture readiness.
- `warn` or an explicitly owned evidence obligation as QA determines: Native/model observation is unavailable although supported installed invocation is proved. It remains visible and cannot be called native qualification.
- `block`: A required design or product change exceeds the approved PRD/SD; use the existing earliest-source revision route rather than widening this TP silently.

Every blocker uses its current canonical owner. Worktree changes from this Run's own artefacts and unrelated existing work remain isolated; no cleanup or rollback touches foreign material.

## 7. Next Step

Present this Task/Test Plan for a new deliberate `Approval: TP`. Approval permits implementation-preparation Brownfield Analysis, then CD+Tests only when that recorded analysis supports the approved path. QA/UAT/OR and local installation evidence are fulfilled through their existing boundaries.

## AGDF Approval Summary (de; source=en)

- Ziel: Den freigegebenen kompakten Ausführungsweg implementieren und die korrigierte lokale Codex-Installation mit konkreten positiven und negativen Fällen prüfen.
- Umfang: Core-Operation und Dispatcher-Fortsetzung ergänzen; aktuelle Nachweise für Wiederaufnahme und Abschluss beachten; bestehende Tests und Verträge synchronisieren; den normalen lokalen Installer nutzen und die tatsächlich gestartete neue Runtime nachweisen.
- Aufgaben: T-001 Core-Routing und verbleibende Verpflichtungen; T-002 gebundene Ausführungs-/Abschlussübergaben; T-003 positive und geschützte Ablehnungsfälle; T-004 Verträge, Generatoren und betroffene Sprachen; T-005 neue Installation und echte CLI-/STDIO-Prüfung; T-006 Reviews und QA-Nachweise.
- Prüfungen: Quick Task und geeigneter Verified Change starten nur ihre erlaubte Arbeit. Fehlender Nachweis bleibt Vorbereitung, ungültige Baseline und Scope-Verletzung bleiben blockiert. Statusfragen, alte/fremde Bindungen, fehlende Freigaben und beschädigte Kontrolle starten keine Umsetzung.
- Wiederaufnahme: Ein aktuell erfülltes Quick-Task-Review führt zum bestehenden Abschluss statt erneuter Umsetzung. Ausgeführte Verified Changes behalten Mini-Closeout, fertige Runs bleiben terminal. Unterbrochene oder geänderte Nachweise werden neu geprüft; keine Behauptung einer dauerhaft genau einmaligen Umsetzung.
- Installierter Nachweis: Neuer Build, Digests, Marketplace/Cache und gestartete Runtime werden getrennt identifiziert. Quick Task wird über installierte CLI und tatsächliches MCP-STDIO geprüft. Geeignete Verified Changes werden über CLI mit echten Git-Beobachtungen geprüft; MCP muss fehlende Git-Evidenz konkret ablehnen.
- Grenzen: Native Codex-/Modellbeobachtung ist eine eigene Nachweisspur. Vor nötiger Wiederverbindung stehen Kandidat und vollständige Beobachtungsfolge bereit; nicht beobachtetes Verhalten bleibt ausdrücklich offen. Keine direkten Cache-Edits, automatischen globalen Neustarts, fremden Runs oder Git-/Release-Aktionen.
- Zuordnung: Alle sechs PRD-Kriterien und SD-Entscheidungen sind auf Aufgaben, 23 konkrete Szenarien, erwartete Ergebnisse und Nachweisdateien abgebildet. Bestehende strukturierte und vorbereitende Abläufe sowie alle betroffenen registrierten Darstellungen bleiben geprüft.
- Risiken: Veraltete Generationen zählen nicht als korrigierte Installation. Fehlende sichere Writer-/Quelldaten oder eine notwendige Erweiterung des genehmigten Designs stoppen den betroffenen Schritt und gehen an den bestehenden Eigentümer.
- Nächster Schritt: TP-Freigabe erlaubt zunächst die Umsetzungsvorbereitung und danach die begrenzte Implementierung mit Prüfungen; QA und UAT bleiben eigenständige Entscheidungen.
