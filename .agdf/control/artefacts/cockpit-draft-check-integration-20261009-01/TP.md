# TP: Deliver and verify bound Cockpit draft checks

Status: draft
Gate: TP
Gate approval: open
Owner: Arndt Gold
Date: 2026-10-09
Run: cockpit-draft-check-integration-20261009-01
Language: en
Traceability contract: criteria-chain-v1

## Objective And Sources

Implement and verify only the selected Cockpit draft-check integration designed in this Run's approved SD. Product acceptance remains exclusively in the approved PRD; this plan references its stable IDs rather than copying or redefining acceptance. The approved SD supplies the SDD decisions and the existing owners.

- PRD: .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/PRD.md; sha256:18f516c1665b0e19e4de48737ccdbc770d18cd8cd49b5d1bda533ce461a74418
- SD: .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/SD.md; sha256:24ff2e1b912b988fd1a8c3f72434bb67d74ef2588e11f24992feb3016dadc72c
- Analytical input: completed Brownfield Review and ready UX Intent Definition; subordinate to approved sources.

This TP is a proposed execution plan. No task, test, implementation, fresh native observation or quality outcome is represented as completed. After deliberate TP approval, canonical Brownfield Analysis must establish the implementation path before CD+Tests. No unrelated Run, protected approved source, global installation, Git, deployment or release action is included.

## Task List

| task_id | task | Owner | Dependencies | Planned output |
|---|---|---|---|---|
| T-001 | Perform approved-TP Brownfield Analysis; capture exact source/build/worktree and protected-byte baseline; confirm existing read/session/context owners and source containment before implementation | brownfield-analysis / Codex | Fresh Approval: TP and bound canonical continuation | BROWNFIELD_ANALYSIS.md; evidence/BASELINE.json, BASELINE.patch, PROTECTED_SOURCES.json, SCOPE_LEDGER.md |
| T-002 | Extract the one shared authoring projection inside artifact-readiness; keep standalone inspector behavior; add selected canonical draft source descriptor and guarded reader check/replacement/outcome projection; add actual-validator/source tests | Core read owner / Codex | T-001 pass and CD+Tests permitted | Existing artifact-readiness.js and cockpit.js changes; focused Core regressions; no alternate validator |
| T-003 | Add strict artifact_readiness selector to existing MCP contract/session/worker/pool and authenticated browser route; coordinate generation/resource/context/change-view replacement and extend integration guards | Cockpit interface and session owners / Codex | T-002 shared projection and binding defined | Existing schema/session/worker/pool/server adapters; session/stdio/browser-service tests |
| T-004 | Add typed optional draft-check result validation, narrow transport mapping, ephemeral selected-context controller and guarded central reading commit; render one reusable accessible DraftCheck in selected compact/expanded contexts | App reading/presentation owners / Codex | T-002 and T-003 contract stable | Existing api/types/state/App/transport integration; planned useDraftCheck.ts and DraftCheck.tsx; UI regression tests |
| T-005 | Build browser and MCP App with existing toolchain; propagate generated package/runtime assets through existing owners; verify runtime identity, old operation compatibility and applicable payload limits | Core-MCP-App build owner / Codex | T-002 through T-004 implemented | dist/dist-mcp manifests and normal generated assets; evidence/BUILD_IDENTITY.json and packaging logs |
| T-006 | Execute the scenario families and rendered/native observation sequence below; compare protected bytes and actual scoped diff; record results, limitations and recovery proof bound to the built source | Evidence owner / Codex with user observation where native controls require it | T-005 identity available; relevant focused tests may run during T-002 through T-004 | evidence/tests logs, browser images/report, NATIVE_OBSERVATION.md/json, VERIFICATION.md; no unsupported native claim |
| T-007 | Complete mandatory actual-diff Code Review and plan/solution evidence reviews through their existing owners; resolve findings, then run qa-gate only at its permitted stage and present its actual report for separate QA decision | code-review, task-plan-review, clean-implementation-review and qa-gate owners | CD+Tests fulfilled; required evidence and canonical routing permit each review | Existing CR/review/QA artefacts through canonical writers; no QA approval inferred from TP or test pass |

The tasks are ordered by technical dependency, not independent authority. T-001 cannot be predeclared pass. Failure or material drift returns to the responsible source/design/plan/evidence owner; do not implement around an unresolved prerequisite. Normal code/test iteration stays inside the approved task and records its actual scoped delta.

## Implementation Scope And Protection

Canonical candidate source paths are the existing Core artifact-readiness, cockpit reader/contract/session, read worker/pool and source-change owners; existing App api/types/state/App, MCP transport, selected RunDetail/CompactCockpit and relevant styles; existing authenticated control-ui server adapter. New useDraftCheck and DraftCheck files remain within the existing App owner. Tests extend the existing owned suites and may add focused cockpit-draft-check, App draft-check and browser draft-check files.

Do not refactor unrelated modules or alter generic gate/writer/approval semantics. Generated files may change only through the established build/sync process and must be distinguished from source edits. T-001 inventories pre-existing staged, unstaged and untracked candidate paths before changing them, retaining exact bytes/diff so that earlier work is preserved and this Run's incremental scope is reviewable. Never reset or overwrite prior work to create a clean baseline.

Protect the approved UR/PRD/SD of this Run; separately approved cockpit-documented-approvals-20261009-01 sources and its Run history; backlog-status-flow-clarity-20261009-01 sources/history and pending independent decisions. Test fixtures live in isolated temporary targets and do not mutate real project sources merely to force a stale/error example. Canonical selected-Run control transitions remain writer-owned and must be distinguished from the operation's strict no-write behavior.

## Execution And Evidence Commands

Use the existing supported Node toolchain and record node --version, lockfile/source identity and actual command/exit results. Commands below are planned, not executed by this TP. Planned new test files become runnable only after their scoped task creates them. Store complete output on failure and compact pass/exit evidence on success under this Run's evidence/tests; avoid blanket repeated tests once required checks pass.

| Working directory | Planned command | Purpose |
|---|---|---|
| Repository root | node packages/core/test/artifact-readiness-test.js | Shared authoring parity and existing public inspector guards |
| Repository root | node packages/core/test/cockpit-draft-check-test.js | Planned focused actual-validator, descriptor, selection, source-race and no-write scenarios |
| Repository root | node packages/core/test/cockpit-scoped-read-test.js | Existing contained read and resource selection regressions |
| Repository root | node packages/core/test/cockpit-session-test.js | Selected session/generation/expiry and new replacement behavior |
| Repository root | node packages/core/test/cockpit-changes-test.js | Existing dependency revalidation/change behavior with checked draft coverage |
| Repository root | node packages/core/test/cockpit-context-test.js | Context inspection/invalidation regressions |
| Repository root | node packages/core/test/cockpit-publication-test.js | Publication ownership/cleanup and no check-induced authority change |
| Repository root | node packages/core/test/control-scoped-capture-test.js | Shared captured filesystem and source-race/containment regression boundary |
| Repository root | node packages/cli/scripts/cockpit-scoped-mcp-test.js | Actual scoped MCP invocation, updated read schema and protected selectors |
| Repository root | node packages/mcp-server/test/contract.test.js | Existing tool wire contract and generic inspector compatibility |
| Repository root | node packages/mcp-server/test/safety.test.js | Existing MCP safety and write/access boundaries |
| Repository root | node packages/mcp-server/test/protocol.test.js | Actual supported stdio handshake/operation regression |
| packages/control-ui | npm run typecheck | Typed descriptor/report/envelope and UI integration |
| packages/control-ui | npm test | Authenticated browser service plus consumer/controller/state/keyboard regression suites |
| packages/control-ui | npm run build | Existing browser build and generated styles |
| packages/control-ui | npm run build:mcp | Existing bounded self-contained MCP App build and manifest |
| Repository root | npm run sync-package-assets | Established runtime/package propagation after trusted builds; review generated scope |
| Repository root | npm --prefix packages/cli run build:public-plugin | Existing local package assembly; no install, publish or release action |
| Repository root | node packages/cli/scripts/plugin-mcp-cockpit-variant-test.js | Existing runtime/App variant and built resource compatibility |
| Repository root | node packages/cli/scripts/payload-budget-test.js | Applicable current payload limits; do not weaken thresholds |
| packages/control-ui | npm run test:browser | Actual built browser scenarios including new draft-check coverage and existing reading journeys |

New Core tests use existing fixture/runtime helpers to create exact active supported draft states and call the real validators. The dedicated browser/UI scenarios may inject delay/transport failure to control ordering, but true authoring outcomes come from Core. Stdio tests cover the repository's supported protocol variants with the new exact selector, not just advertised capability. No network dependency upgrade is required. Any necessary dependency or environment failure is evidence of a limitation, not permission to install or change global setup automatically.

## Scenario Families

- SCN-001: For canonical unregistered UR/PRD/SD/TP fixtures in supported active states, select and inspect descriptor; assert zero authoring-check invocation until deliberate action, then compare scoped and standalone actual report. Include approved, missing and unsupported gate selection controls.
- SCN-002: Complete/incomplete source, unresolved PRD decision, SD decision/criterion mapping and TP mapping failures exercise the actual validator owner; verify real original checks/findings and passed/correction/unavailable result, without mock content policy.
- SCN-003: Exact MCP session/selected snapshot/Run/gate/revision request succeeds; pre-registration draft has no invented document registration. Initial selection, disclosure, resize and reload never invoke authoring checks.
- SCN-004: Extra target/path/tool fields, malformed or foreign session/snapshot/Run/gate/revision selectors, unsafe source components and out-of-control prerequisites are denied; inspect cannot adopt a different target/revision or call a broader tool/writer.
- SCN-005: Session generation and snapshot replacement reject an obsolete pending check; old document IDs are unusable, new IDs belong only to returned selected Run, and expired/closed session rejects its selectors.
- SCN-006: Edit draft bytes at the same Run revision and include same-size/atomic replacement, absence→creation, removal and symlink substitution. Mutate before check, during capture/replay and before publication; no fresh success may escape and existing source observation signals invalidation.
- SCN-007: After check replacement, worker/pool adopt returned scope, change waits are updated/retired, dependencies include canonical checked draft/absence, and existing freshness/change flow detects source edits. Published context cleanup/ownership remains enforced.
- SCN-008: Authenticated browser check route has exact non-duplicated query keys and valid selectors; missing credential, wrong origin/method and arbitrary/extra path/query input are denied. Report matches the same Core owner used by MCP.
- SCN-009: Busy, deadline, response/capture limits, worker failure and session expiry end pending state with bounded existing errors. Existing worker/session slots and context quarantine are not bypassed and no silent retry loop begins.
- SCN-010: Snapshot/control/document/approval byte baselines before and after successful and failed checks are identical; original public report flags and same authoring verdict remain unchanged. Test-induced changes are isolated fixture setup, not operation writes.
- SCN-011: Correctable content failure differs from unavailable blocked gate/source/integrity. Preserve nested readiness_details, diagnostics and actual next action; unknown/malformed/partial report shows a limitation, never invented success or correction.
- SCN-012: User sees and deliberately retries a transient valid-context failure; stale source offers reload then explicit recheck, expiry offers existing reopening and disabled old action. Recovery does not change control eligibility.
- SCN-013: Delay A response, select B, resolve A; also replace session/snapshot or reload/unmount/lost active card context. The old reply never installs or overwrites B/new scope and old success never appears current.
- SCN-014: During pending check, duplicate pointer/Enter activation does not duplicate requests; freshness/navigation/context cleanup coordinate with replacement; cancellation or error does not leave an indefinite loading indicator.
- SCN-015: Commit a checked scope with regenerated document IDs while focus/disclosures/scroll are set. Central reducer performs one guarded installation and existing logical source/focus restoration remains stable; stale signals invalidate current result.
- SCN-016: In compact selected view and expanded summary/details at narrow/wide widths, Tab/Enter deliberately starts the same action; untested/loading/disabled/result feedback is readable, action sits outside approval rows and no automatic call occurs.
- SCN-017: Display passed result alongside current control and documented approvals. Authoring-only explanation is visible, no approval/control/QA status changes, and no forbidden delivery control becomes enabled.
- SCN-018: Long actual findings, source binding disclosure, document/report and approval disclosure, scrolling down/back, resize and reload are readable without horizontal loss, focus trap, jumps or flicker. Accessible status announces short completion rather than every technical line.
- SCN-019: Generic standalone inspector and scoped result retain equivalent authoring report semantics, while only the scoped operation has selected App context. No additional validator or new persistent result/source authority is created.
- SCN-020: Old read operations and existing registered document/context selectors work; new client on old/no-capability server shows bounded unavailable and preserves reading without fallback to general inspect/file access. Authenticated browser adapter and built MCP resource use same projection.
- SCN-021: Built source/runtime/App manifests match observed UI; scoped delta and protected bytes pass; fresh native-host action/result/recovery observation is identity-bound and distinct from stdio/browser evidence. Local rollback is possible without control/data migration.
- SCN-022: T-001 records exact approved sources and unrelated protected history plus pre-existing dirty candidate paths. Later incremental source/generated delta is attributable to this Run without reset or unrelated changes.

## Verification Traceability

Each row links one approved criterion/SD decision to a concrete task and scenario. Multiple rows for a criterion cover its distinct approved design decisions; this is verification mapping, not a second acceptance source. Evidence references are planned output files and must contain actual results before fulfillment.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | All four supported pre-registration fixtures expose observed descriptor; explicit check uses same actual evaluator, no authoring call on selection | evidence/tests/core-draft-check.log and report-pair comparison |
| AC-001 | SDD-002 | T-003 | SCN-003 | Exact selected MCP request evaluates canonical draft without fabricated registration or arbitrary path | evidence/tests/scoped-mcp.log with selector/result tuple |
| AC-001 | SDD-006 | T-004 | SCN-016 | Tab/Enter action is equivalent in compact/expanded narrow/wide contexts, outside historical approval rows | evidence/tests/ui-draft-check.log and browser action-placement images |
| AC-002 | SDD-001 | T-002 | SCN-002 | Complete, incomplete, unresolved-decision and mapping fixtures return their actual Core findings | evidence/tests/core-authoring-cases.log and original reports |
| AC-002 | SDD-004 | T-004 | SCN-011 | Content correction and unavailable prerequisite states stay distinct; nested original findings/next step survive and malformed/unknown data cannot pass | evidence/tests/report-projection.log and rendered diagnostic cases |
| AC-003 | SDD-002 | T-003 | SCN-005 | Obsolete session generation/snapshot response cannot publish, new selectors belong to returned scope and expired selectors fail | evidence/tests/session-draft-check.log |
| AC-003 | SDD-003 | T-002 | SCN-006 | Same-revision changed draft and capture/publication races invalidate prior binding; no stale pass escapes | evidence/tests/draft-source-races.log with unchanged revision and byte identities |
| AC-003 | SDD-005 | T-004 | SCN-013 | Delayed A reply after B/reload/session/lifecycle change cannot alter live selection or show old current success | evidence/tests/client-draft-races.log and browser stale-state observation |
| AC-004 | SDD-002 | T-003 | SCN-009 | Busy/timeout/limits/worker/session failures return bounded error within established limits and preserve context quarantine | evidence/tests/draft-limits-errors.log |
| AC-004 | SDD-004 | T-004 | SCN-012 | Visible retry uses valid current context; stale/expiry chooses reload/reopen and explicit recheck; no eligibility mutation | evidence/tests/draft-recovery.log and rendered recovery sequence |
| AC-004 | SDD-005 | T-004 | SCN-014 | Duplicate activation is guarded, replacement coordinates other reads/context, canceled/failed call leaves finite explained state | evidence/tests/client-draft-lifecycle.log |
| AC-005 | SDD-001 | T-002 | SCN-010 | Success/failure check changes no durable source/control/approval bytes and preserves original flags/public inspector result | evidence/tests/draft-no-write.log and fixture byte comparison |
| AC-005 | SDD-002 | T-003 | SCN-004 | Foreign/extra/path/unsafe/out-of-scope requests fail closed with no broader tool or target adoption | evidence/tests/draft-access-guards.log |
| AC-005 | SDD-004 | T-003 | SCN-008 | Browser authentication, GET/origin and exact query guards are intact and no path/writer override is exposed | evidence/tests/browser-service-draft.log |
| AC-005 | SDD-006 | T-004 | SCN-017 | Visible success remains authoring-only beside untouched approval/control/QA context | evidence/tests/draft-authority-ui.log and authority-separation image |
| AC-006 | SDD-005 | T-004 | SCN-015 | Guarded central scope commit restores logical document/focus/disclosure/scroll state and does not create competing result state | evidence/tests/draft-scope-commit.log and browser position checks |
| AC-006 | SDD-006 | T-006 | SCN-018 | Built narrow/wide UI remains readable and stable through long results, keyboard, source/disclosure, scroll, resize and reload sequence | evidence/browser report/images and evidence/NATIVE_OBSERVATION.md |
| AC-007 | SDD-001 | T-002 | SCN-019 | Standalone/scoped parity holds with one captured evaluator and no persistent or duplicate validator owner | evidence/tests/draft-parity.log and actual-diff ownership review |
| AC-007 | SDD-002 | T-005 | SCN-020 | Old operations remain compatible, unavailable old capability is bounded, generated App/adapter uses exact Core schema | evidence/tests/mcp-compatibility.log and BUILD_IDENTITY.json |
| AC-007 | SDD-003 | T-003 | SCN-007 | Check scope installs across session/worker/pool, observers include draft dependencies and old waits/context obey existing lifecycle | evidence/tests/draft-observer-lifecycle.log |
| AC-007 | SDD-007 | T-006 | SCN-021 | Exact build/host operation and responsive recovery are freshly observed, protected bytes/scoped delta checked, proof levels separated | evidence/VERIFICATION.md, BUILD_IDENTITY.json, PROTECTED_AFTER.json, NATIVE_OBSERVATION.md/json |
| AC-007 | SDD-007 | T-001 | SCN-022 | Implementation baseline records exact approvals/other history and dirty candidate bytes for later scoped comparison | evidence/BASELINE.json, BASELINE.patch, PROTECTED_SOURCES.json, SCOPE_LEDGER.md |

## Prepared Native Observation

T-006 prepares an observation manifest before asking for any user observation. Identify exact target, Run, gate, current/expected revision, draft digest, App HTML/bundle/manifest digest, Core/MCP runtime source identity, host surface/session and timestamp. Use an isolated supported-draft fixture with actual Core checks where this Run's real lifecycle no longer has a supported draft; explicitly distinguish test target from delivery control target and never alter approved real sources.

Show the freshly built App through an available permitted native development/preview host and verify the actual loaded identity. Observe deliberate action, checking, actual passed/correction result, original findings/source binding, transient retry and stale/reload/recheck; include keyboard/focus, narrow/wide, scrolling and document/approval disclosures. For MCP App proof, record actual UI initialization/capability and interaction/close evidence; a stdio tool result or browser emulation alone is not native rendering evidence.

If native size/keyboard interaction needs the user's manual action, prepare the exact view/identity and bundle the remaining observation request. Attribute the user's actual reply and evidence to that build; earlier Alles stabil geprüft and screenshots from older builds do not qualify this new action. If the currently accessible host cannot load the new built runtime within authorized scope, record an evidence gap and its concrete recovery owner; do not mark native fulfillment, claim QA pass or install globally by implication. This TP does not itself execute the observation or require a new host population.

## Review, Quality And Completion

T-006 records command results and scenario fulfillment rather than merely counting passing assertions. T-007 uses the actual scoped source/generated diff for Code Review; task-plan-review verifies this plan/criterion coverage and the required UX Intent Fidelity evidence, and clean-implementation-review verifies one validator, read/source ownership, bounded recovery and no parallel state. Applicable gaps receive their existing normalized type/routing owner and remain open until resolved.

Only qa-gate decides final pass/revise/block at the permitted QA stage. Missing fresh visible/native proof, unresolved scope/source changes, regression failures or open review gaps cannot be downgraded to a clean result. A passing report still needs its own fresh deliberate QA approval. UAT/OR/closeout follow their canonical stage; no Git/publication action is automatic. This TP does not approve any of them.

## Dependencies, Risks And Recovery

- Existing Node/dependencies/build assets must be usable before relevant commands. Record actual build/asset identities and limitations, not only repository package version.
- Immutable captured views cannot acquire an unrecorded draft dependency later. T-002 records it at selection and tests source/absence races; T-003 updates replacement lists/observers together. A source-boundary change requires reassessment rather than an out-of-scope filesystem read.
- Exact session/client binding must survive asynchronous reads; T-003 and T-004 cover expiry, stale/delayed responses, context quarantine and pending duplicate handling. An old report cannot become a recovery shortcut.
- Existing UI state is already substantial. T-004 isolates ephemeral controller/presentation while keeping the central reading reducer authoritative; do not introduce a second global reading/result owner.
- Generated resource IDs can change on check. Test logical focus/source restoration instead of relying on a stable old UUID; preserve scrolling/disclosures and source guards.
- Protected prior work requires baseline plus scoped delta. Revert only changes attributable to this Run if recovery is needed; never use a blanket checkout/reset, rewrite approvals or weaken checks.
- A failed check/test routes to the current implementation or evidence owner. A material product/design/plan gap returns to its earliest approved source through supported revision; no scope expansion or approval transfer.

## Next Step

Semantically review and canonically record TP derived_from this exact approved SD, verify criteria-chain-v1/localized summary, prepare a fresh bound presentation and obtain deliberate Approval: TP. Then perform T-001 through the bound Brownfield Analysis continuation; only a passed required preparation permits CD+Tests. No implementation begins during TP preparation.

## AGDF Approval Summary (de; source=en)

- Ziel: Die freigegebene Entwurfsprüfung im Cockpit umsetzen und die sieben PRD-Kriterien sowie alle Designentscheidungen konkret nachweisen.
- T-001: Nach TP-Freigabe zuerst Brownfield-Implementierungsvorbereitung und genaue Quellen-/Arbeitsstand-Baseline; frühere Änderungen, freigegebene Quellen und andere Runs schützen.
- T-002: Einen gemeinsamen Core-Prüfkern, den begrenzten Entwurfs-Quellenbezug und die gebundene Prüfung mit echten Autorenprüfungen und Quellenrennen umsetzen.
- T-003: Strengen MCP-/Browser-Lesezugriff, Sitzungs-/Snapshot-Grenzen, Ressourcenwechsel, Beobachtung und bestehende Kontextbereinigung integrieren und prüfen.
- T-004: Typisierte App-Antwort, kontrollierte asynchrone Anfrage und zentrale Zustandsübernahme; eine gemeinsame tastaturbedienbare Anzeige mit stabilen Quellenklappen, Fokus und Scrollen.
- T-005: Browser-/MCP-App bauen, vorhandene Paket- und Runtime-Dateien regulär ableiten; genaue Build-Identität, alte Aufrufe und Payload-Grenzen prüfen. Keine Installation oder Veröffentlichung.
- T-006: Konkrete Szenarien ausführen: gleiche Revision mit geänderter Datei, verspätete Antworten nach Auswahlwechsel, fehlerhafte Quellen/Antworten, Zeit-/Größengrenzen, Wiederholen, unveränderte Dokument-/Freigabedaten und schmale/breite Bedienung. Frische native Beobachtung an den gelieferten Build binden; fehlende Nachweise offen halten.
- T-007: Tatsächlichen Diff, Planabdeckung und saubere Zuständigkeiten prüfen; Befunde beheben, dann QA durch den bestehenden QA-Verantwortlichen durchführen. TP und bestandene Tests ersetzen keine QA-Freigabe.
- Grenzen und Entscheidung: Alle PRD-Kriterien und zugehörigen SD-Entscheidungen sind mit Aufgaben, Szenarien, erwartetem Ergebnis und Nachweis verknüpft. Keine neue Prüfhoheit, Archiv-, globale Installations-, Git- oder Veröffentlichungsarbeit. Approval: TP erlaubt zuerst die notwendige Brownfield-Vorbereitung und danach nur bei erfüllten Voraussetzungen die geplante Umsetzung.
