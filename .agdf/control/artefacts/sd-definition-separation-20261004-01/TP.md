# TP: Dedicated Solution Design authoring

Status: draft
Gate: TP
Gate approval: open
Based on: approved PRD and SD
Date: 2026-10-04
Owner: Arndt Gold
Run: sd-definition-separation-20261004-01
Traceability contract: criteria-chain-v1

## 1. Task List

All tasks remain planned until their specific results and evidence are recorded. Codex performs
the implementation/reviews within existing owners; this plan delegates no subagent work. Arndt
Gold retains deliberate gate decisions. Brownfield preparation after TP approval remains the
existing required internal step; it is listed here for execution completeness without moving it
to a new Task 0 or changing the framework's review/gate placement.

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | After TP approval, complete implementation-preparation Brownfield Analysis: confirm reusable authoring/decision/recording seams, exact sources, baseline candidate and affected canonical/derived paths; preserve independent dirty CI changes and record risks before CD+Tests. | Codex, existing brownfield-analysis owner | Approval: TP; approved PRD/SD |
| T-002 | Register sd-definition and focused contracts; adapt gate-check/router/shared preparation instructions so semantic SD creation has one owner, recording remains shared, and the new SD template declares decision state. Keep activation, human approval and existing budgets intact. | Codex, canonical plugin/semantic-contract owner | T-001 |
| T-003 | Implement pure SD authoring eligibility and checked exact-source handoff in Core dispatch; handle unbound assignment, direct invocation, explicit editing intent, ready-draft presentation and refusal without generic fallthrough. Update missing-SD content assignment while retaining gate-check readiness ownership. | Codex, Core dispatch owner | T-001, T-002 |
| T-004 | Implement declared SD decision readiness, compatibility classification, existing integrity/traceability precedence and localized detailed blockers; connect it to canonical presentation/approval evaluation and focused clarification. | Codex, Core readiness and interaction owners | T-001, T-002 |
| T-005 | Extend the sole shared dispatch schema/normalization and CLI parser/help/transport with mutually exclusive sd_action revise / --sd-action revise; bind replacements to current resume assignment and preserve existing writer/history guards. | Codex, shared contract and CLI adapter owners | T-001, T-003 |
| T-006 | Add meaningful source and assembled CLI/MCP regressions for authoring, clarification, source conflicts, draft revisions, invalid bindings, recording and fresh approval; exercise existing traceability/transaction owners rather than clone their implementation. Register focused SD tests in the existing package/smoke harness. | Codex, CLI/Core/MCP test owners | T-002, T-003, T-004, T-005 |
| T-007 | Update canonical documentation and contract registries; regenerate supported host/package/runtime projections with existing builders. Verify consistent registered names/contracts, rendered locale cards, package integrity and unchanged instruction/payload/performance ceilings. | Codex, documentation/projection/package owners | T-002, T-003, T-004, T-005, T-006 |
| T-008 | Run focused checks and the applicable shared repository verification plan against the actual assembled candidate; retain candidate identity, command outcomes, boundary/derivation evidence and limitations in run-local records. Classify independent baseline failures without incorporating unrelated CI edits or making unsupported native-host claims. | Codex, verification/evidence owners | T-006, T-007 |
| T-009 | Complete mandatory actual-diff Code Review plus proportionate architecture/clean-implementation and Task Plan fulfillment reviews. Resolve defects, verify authority/source separation and all criteria/scenarios, then hand complete evidence to the existing QA owner; record existing CR only with actual review evidence. | Codex, existing review and QA evidence owners | T-008; recorded CD+Tests before CR |

### Task boundaries and expected outputs

T-001 produces BROWNFIELD_ANALYSIS.md and a run-local baseline/scope inventory before any executable
change. Include the then-current branch/HEAD and protected independent dirty paths; branch names
are observations, not scope authority. Recheck the approved PRD/SD digests and selected revision.
Block implementation if reuse/owner/scope facts conflict with this approved design.

T-002 covers plugins/agdf/meta/agdf-plugin.definition.json, the new skills/sd-definition/SKILL.md
and meta/contracts/sd-definition.md, existing gate-check/router/manifest/recording references,
and the canonical SD template. Remove only competing SD semantic procedure; do not duplicate
the recording contract or rewrite TP/implementation responsibility.

T-003 covers proposed packages/core/lib/skill-dispatch/sd-definition.js and the service's evaluated
authoring/source seams. Extend the existing direct-author inventory/fallback handling for the new
identity. Its source reader uses existing contained-file/digest helpers and required ready inputs.
The pure phase accepts only its specific content-repair blockers after unrelated integrity and
prerequisite checks pass. A declined sd_action or direct author never turns into another stage.

T-004 covers proposed packages/core/lib/control-evaluation/sd-readiness.js, existing gate-check,
status fields/interaction rendering, the interaction field contract and locale registry. Validate
marked/table states exactly as approved in SD, including owner/resolution/deferral completeness.
Decision state stays in SD.md. Existing run-present/run-approve consume the same evaluated status;
no second writer/check store is added. Legacy marker/table absence keeps prior behavior, while
new authoring outputs retain the declaration and expose its semantic limitations.

T-005 covers packages/core/lib/skill-dispatch/contract.js and existing CLI parsing/handler/command
registry transport. Schema and runtime checks agree on value, required revision-bound resume,
action exclusivity and incompatible continuation. MCP derives the same schema/normalization.
Existing artifact recording functions should be reused, not rewritten to give the author new
authority. Any newly discovered necessary writer change requires SD/TP review before expansion.

T-006 introduces a candidate-bound SD authoring fixture/suite, preferably
packages/cli/scripts/sd-definition-test.js and an isolated fixture under scripts/fixtures, plus a
focused Core readiness suite and affected MCP contract/continuation/protocol cases. Add package
test entries and smoke inclusion so full verification executes the new behavior. Extend existing
tests where the new SD route intentionally replaces the old generic route; retain their adjacent
UR/PRD/TP, source-integrity, transaction/history and approval assertions. No skipped/weakened tests.

T-007 uses existing sync-package-assets/build/public-plugin/Core projection processes. Derived
files are identified from generator output and checked against canonical changes, never manually
invented. Update current canonical authoring/router/CLI/MCP documentation where responsibility
or input is described; do not edit host installation caches or historical native evidence to
pretend the candidate was observed. Maintain the existing discovered budgets, not extra headroom.

T-008 produces VALIDATION.md, BEHAVIOR_EVIDENCE.md and DERIVATION_REVIEW.md beneath this run's
artifact directory. Record exact candidate identity/changed-path inventory and command/result
references, explicit synthetic reply classification and observed/unverified native behavior.
Scope-aware snapshot validation must distinguish pre-existing independent changes from this
candidate; no SD result may inherit another run's green logs. Full verification failures remain
reported and prevent an unqualified QA pass until resolved by their proper owner.

T-009 produces CODE_REVIEW.md, ARCHITECTURE_REVIEW.md and TASK_PLAN_REVIEW.md. Review actual final
diff/generated propagation, public compatibility, decision-marker retention, source authority,
allowed recovery, budget evidence and semantic derivation. These are evidence dimensions for
existing QA, not new gates or approval decisions. After fixes, rerun affected checks; rerun full
verification only when changed scope or unresolved concerns justify it. Do not stage/commit/push.

## 2. Verification Traceability

Criterion and decision IDs refer to the approved PRD/SD; rows do not copy their acceptance prose.
Each scenario has a specific expected observation and durable evidence destination. The proposed
test files are execution outputs, not existing or passing evidence at TP preparation time.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | Canonical catalog/focused contracts name sd-definition as sole semantic author; gate-check/shared recording contain no competing SD drafting procedure. | T-002 canonical diff; CODE_REVIEW.md ownership comparison |
| AC-001 | SDD-002 | T-003 | SCN-002 | Eligible missing-SD continuation names sd-definition/sd_definition with selected target/run/revision; gate readiness still names gate-check. | sd-definition-test.js source/package route cases; BEHAVIOR_EVIDENCE.md |
| AC-002 | SDD-002 | T-006 | SCN-003 | Checked approved PRD and applicable ready analytical inputs arrive as exact contained paths/digests; missing, symlinked, foreign or invalid required inputs refuse authoring. | SD fixture/source-input cases; MCP continuation cases; VALIDATION.md |
| AC-002 | SDD-005 | T-008 | SCN-004 | An actual reasoned draft derives architecture/choices from its retained approved sources without new users, product promises or competing acceptance. | DERIVATION_REVIEW.md with retained source/draft identities |
| AC-003 | SDD-004 | T-004 | SCN-005 | Marked SD with a before_sd open question is blocked by AGDF_SD_DECISIONS_OPEN; run-present/run-approve cannot approve it. | Focused sd-readiness Core suite; SD packaged presentation/approval cases |
| AC-003 | SDD-004 | T-004 | SCN-006 | Missing/duplicate/unknown marker, malformed table/columns/rows, duplicate decisions, invalid timing/status, unnamed owner and empty required resolution fail the declared contract; legacy absence preserves previous checks. | Focused readiness matrix with exact outcomes in VALIDATION.md |
| AC-003 | SDD-002 | T-006 | SCN-007 | Permitted clarification retains a useful unapproved draft, asks one material bundled question and keeps answered context; recorded resolution returns to fresh ready evaluation. | BEHAVIOR_EVIDENCE.md source/question/answer/draft example; source and packaged continuation cases |
| AC-003 | SDD-004 | T-006 | SCN-008 | later_tp deferral has concrete reason/owner and concerns execution detail; reviewed examples do not defer binding architecture or product conflict. | Readiness deferral cases and DERIVATION_REVIEW.md semantic inspection |
| AC-003 | SDD-002 | T-006 | SCN-009 | Unrelated integrity/source/prerequisite failure never enters clarification despite an open decision; only designated content-repair blockers route appropriately. | sd-definition-test.js wrong-stage/integrity/traceability cases |
| AC-004 | SDD-003 | T-005 | SCN-010 | Current revision-bound gate-check resume with sd_action revise yields the SD author; ordinary continuation of a ready registered draft prepares its current presentation without mutation. | Shared function-schema test and assembled CLI/MCP SD revision cases |
| AC-004 | SDD-003 | T-005 | SCN-011 | Unknown action, missing revision/run/resume, mixed ur/prd/sd actions or continue_delivery fail identically at schema/runtime boundaries. | skill-dispatch-function-contract-test.js and MCP contract/protocol cases |
| AC-004 | SDD-005 | T-006 | SCN-012 | Valid explicit replacement preserves old proof/history and approved sources; malformed/wrong/foreign/approved replacement attempts cannot overwrite protected bytes. | SD fixture typed writer cases; existing transaction/protection suite; VALIDATION.md |
| AC-004 | SDD-003 | T-006 | SCN-013 | Stale resume returns fresh assignment evidence without adopting another run; ineligible explicit revision/direct author has no generic later-stage fallthrough. | sd-definition-test.js assignment/direct refusal cases and MCP continuation cases |
| AC-004 | SDD-005 | T-006 | SCN-014 | A changed draft requires a newly prepared presentation; a prior presentation/reply cannot approve its new revision. | SD packaged run-present/run-approve replacement case |
| AC-005 | SDD-006 | T-006 | SCN-015 | Material product conflict identifies earliest affected UR/PRD revision owner, preserves approved bytes and leaves SD approval unavailable; linked-artifact recovery does not invent a transition. | BEHAVIOR_EVIDENCE.md conflict and recovery example; packaged protected-source cases |
| AC-005 | SDD-004 | T-004 | SCN-016 | A declared unresolved product conflict is recorded as a current design blocker and cannot be hidden as a later_tp execution deferral in reviewed derivation. | Readiness open-conflict case and DERIVATION_REVIEW.md |
| AC-006 | SDD-005 | T-006 | SCN-017 | Initial and explicit replacement SD-derived_from-PRD recording use the existing registry/writer and exact approved source; incorrect review/source proofs are refused. | SD packaged recording cases; writer binding/history outputs in VALIDATION.md |
| AC-006 | SDD-005 | T-006 | SCN-018 | Valid exactly-once mappings pass; missing/duplicate criterion rows and unknown/unmapped decision IDs block existing SD traceability; no second acceptance store appears. | Existing traceability suite plus SD recording/presentation negative cases; CODE_REVIEW.md |
| AC-007 | SDD-004 | T-004 | SCN-019 | Decision/traceability/integrity combinations preserve existing integrity precedence, expose concrete gaps and suppress approval through the same canonical evaluation. | Focused Core/packaged readiness precedence cases |
| AC-007 | SDD-005 | T-006 | SCN-020 | Recorded ready SD gets a fresh bound presentation; exact valid deliberate-response fixture opens unchanged TP, while stale/wrong replies refuse transition. | sd-definition-test.js lifecycle case and MCP continuation case; synthetic status explicitly marked |
| AC-008 | SDD-001 | T-007 | SCN-021 | Canonical and assembled consumers deliver the focused semantic and shared recording contracts with one consistent skill identity. | Source/package contract comparison; package/runtime integrity outputs |
| AC-008 | SDD-003 | T-006 | SCN-022 | Actual assembled CLI --sd-action and MCP sd_action use the shared normalization/schema and return matching revision semantics. | Assembled CLI and MCP protocol tests; VALIDATION.md |
| AC-008 | SDD-007 | T-007 | SCN-023 | Registered host aliases normalize to sd-definition; unknown aliases fail; generated supported host surfaces match the canonical catalog. | Existing skill-name/projection suites extended for SD; generated diff inventory |
| AC-008 | SDD-007 | T-007 | SCN-024 | Every registered locale renders actual SD decision-blocker/status/recovery cards without missing keys or untranslated control sentences. | interaction-presentation and operational-localization cases; locale matrix in VALIDATION.md |
| AC-008 | SDD-007 | T-008 | SCN-025 | Actual candidate fits unchanged instruction/payload/runtime/performance limits and package integrity; no ceilings/assertions are relaxed. | instruction-footprint/payload tests, runtime integrity, MCP performance and shared verifier logs |
| AC-009 | SDD-004 | T-006 | SCN-026 | Previously valid unmarked SDs retain prior readiness; approved designs remain byte-identical; new authoring/revision examples retain declaration/table. | Legacy/source-protection cases and DERIVATION_REVIEW.md retention check |
| AC-009 | SDD-007 | T-008 | SCN-027 | UR/PRD authoring, downstream TP/later routes, gates and approval formula retain their scope; independent CI dirty paths are not modified/included as SD changes. | Existing PRD/intake/control regression suites; baseline/final scope inventory; TASK_PLAN_REVIEW.md |
| AC-010 | SDD-008 | T-008 | SCN-028 | Validation records identify actual candidate, tested consumer, retained behavior/derivation sources and observed limits; synthetic replies and native observations are clearly distinguished. | VALIDATION.md, BEHAVIOR_EVIDENCE.md, DERIVATION_REVIEW.md |
| AC-010 | SDD-008 | T-009 | SCN-029 | Final diff/architecture/plan reviews assess actual authority separation and every scenario, resolve findings or route them to existing owners, and do not invent QA/host approval evidence. | CODE_REVIEW.md, ARCHITECTURE_REVIEW.md, TASK_PLAN_REVIEW.md |

## 3. Test Plan

### Preparation and focused verification

After approved-TP Brownfield Analysis, use isolated fixtures with explicit synthetic authorization
labels for automated control transitions; never inject fixture approvals into a live run. Test
source and actual assembled consumers, because source conformance alone does not establish packaged
behavior. Candidate package preparation precedes MCP's file-based dependency snapshot according
to the existing shared verifier order.

Add test:sd-definition and test:sd-readiness under the existing package test ownership and include
them in the smoke path; choose direct test entry points without a parallel harness. Run the new
suites and the affected existing tests: test:prd-definition, test:intake-continuation,
test:skill-dispatch, test:run-revision, test:prd-readiness, test:control-state,
test:run-step-transaction, test:run-lock, test:interaction-presentation,
test:operational-localization and test:artifact-language as applicable to changed behavior.
Use current existing traceability scenarios and writer fixtures for negative mapping/relationship
checks; do not mirror internal helpers instead of exercising effective recording/presentation.

For MCP use the existing contract, continuation, protocol/skill-names, safety, provenance, package
and performance tests against the candidate-owned prepared runtime. Test direct/unbound entry,
actual action transport, focus-contract delivery, unknown identities and all refusal boundaries.
Use complete invocation logs, not a schema-only assertion as proof of behavior.

### Integration verification

Run existing generators/build, then source/generated/package checks including instruction
footprint, payload budget, agent-skills conformance, host-name projections, registered-locale
rendered cards and runtime integrity. Existing release:prepare is local package preparation here,
not permission to publish or install. No live cache repair or host configuration edit is needed.

Run npm run verify:ci for the repository lane using the existing shared staged plan and its
dependency/preparation ordering. It includes maintenance, host compatibility, assembled packages,
transactions, consumer archives, CLI/wrapper smoke and documentation surfaces. Retain the log and
actual platform/Node version. Do not claim other operating-system/version jobs or remote GitHub
CI were observed from a local run. If preparation or verification fails, diagnose the exact stage
and preserve limits; no missing assertions, retries without a cause, or old green-log substitution.

Any existing independent CI/compatibility baseline corrections remain owned by their separate
work. A scoped candidate snapshot must state whether those corrections are committed in its
baseline or absent; it cannot silently include them as SD implementation. Record baseline versus
introduced failures and require the relevant owner to resolve an outstanding full-check failure
before an unqualified QA pass. Do not alter CI scripts/compatibility evidence to mask SD failures.

### Semantic and review evidence

Retain a concrete approved-input-to-SD example, including actual authoring assignment, questions,
confirmed answers, recording outcomes and changed/retained source identities. Inspect reasoning,
source ownership, alternative/trade-off treatment and decision-marker retention. Exercise one
material product conflict without rewriting approved sources. Clearly label examples/fixtures;
their structural/protocol assertions do not prove every possible semantic defect is absent.

T-009 reviews the final actual diff and generated output. Architecture/clean-implementation review
checks one owner per responsibility and source of truth, no duplicate writer/readiness authority,
recovery constraints and public/legacy compatibility. Task Plan review accounts for every task,
criterion/decision/scenario and evidence gap before existing QA. Keep mandatory CR, QA, UAT and
OR in their existing sequence. Source/package/generated checks cannot be presented as a fresh
native-host/model session; that remains explicitly unverified unless actually observed in an
authorized environment. No automatic plugin installation is included.

## 4. Brownfield Scope

Reuse the approved Brownfield Review's structured_delivery/external_contract_depth conclusion.
The required post-TP implementation analysis rechecks current candidates and execution seams:

- Existing UR/PRD authoring, source readers, pure phases and revision-bound inventory in Core.
- Canonical plugin catalog, focused contract loading, activation guard, central host names and
  generated projections; the additional skill's real instruction/payload cost.
- Existing PRD decision readiness, SD/TP criteria traceability, interaction field/localization
  owners and presentation/approval re-evaluation, with explicit legacy behavior.
- Existing shared artifact writer, receipts/history, seal/source protection, locks and recovery.
- Shared CLI/MCP schema/parser transport and assembled consumer preparation ordering.
- Existing focused/full test owners and the mandatory review/QA evidence path.

Approved product acceptance remains solely in PRD.md. Approved SD.md fixes architecture and
legacy/public compatibility. Changes beyond these decisions return to their proper revision
owner before expanding implementation. Do not infer scope from the branch name or independent
uncommitted CI files. No new context graph, acceptance register or evidence authority is needed.

## 5. Out Of Scope

No restructuring of UR/PRD/TP authoring, implementation, UAT, audit/release ownership, Task 0,
review placement or UX mock/prototype flows. No new gates, approval wording, writers, parallel
design/control/acceptance stores or automatic run migration/approval transfer. No general
localized-summary renderer bug fix; use supported compliant summaries for this scope.

No changes to the independent CI verification/commit scripts, compatibility evidence or its
observations. No automatic plugin installation, host cache/configuration changes, version bump,
commit, push, PR, publication or release. Existing isolated test fixtures may construct their
own candidate packages; those are test preparation, not live-host activation.

## 6. Risks And Blockers

| Risk or condition | Required response | Evidence owner |
|---|---|---|
| Approved target/revision/source mismatch, wrong scope or conflicting owner | Stop authoring/execution and use fresh canonical assignment or supported revision/recovery. | Core control/dispatch; selected run owner |
| New author omits decision declaration, hides a material choice or invents an answer | Correct authoring contract/output and readiness evidence; no ready/QA claim from a template alone. | Semantic author and derivation reviewer |
| Legacy compatibility accidentally blocks/rewrites prior designs | Fix scoped evaluator/routing and retain approved bytes; no migration workaround. | Core readiness and regression owner |
| Declared decision/traceability correction bypasses integrity or product authority | Block affected path until canonical source protection and existing recovery are restored. | Core control and code/architecture reviewer |
| Required skill/content exceeds existing instruction/payload/performance limit | Refine scoped content/implementation or return to PRD/SD owner; never loosen ceilings or unrelated guards. | Catalog/projection and verification owners |
| Candidate package/CLI/MCP schema/projection differs from canonical source | Correct shared owner/derived propagation and retest actual consumer; source-only green is insufficient. | Contract/projection/package owner |
| Full verification has an independent baseline failure or introduced regression | Record attribution and exact failing stage; resolve via its proper owner before unqualified QA pass. | Existing CI baseline owner or scoped implementation owner |
| Review finding, scenario gap, unsupported product conflict recovery or missing semantic evidence | Resolve or explicitly revise/block through existing review/QA; do not create a second approval authority. | Existing review and QA owners |
| No fresh native-host/model observation | State unverified behavior and limit support claims; do not install automatically or relabel deterministic tests. | Evidence and QA owners |

All binding design choices are resolved by approved SD. Its later_tp execution/evidence detail
is resolved here through named tasks, scenarios, evidence paths and verification boundaries.
No material product or architecture question is deferred to implementation. This plan is not
a claim that any proposed test has passed or any code has been implemented.

## 7. Next Step

Record TP-derived_from the exact approved SD using the existing reviewed typed recording input,
return to fresh gate-check and prepare the supplied approval presentation. Request a new deliberate
Approval: TP. Only then perform the required implementation-preparation Brownfield Analysis,
followed by approved CD+Tests and existing review/QA steps. No QA/UAT or VCS approval is inferred.

## AGDF Approval Summary (de; source=en)

- Ziel: Die freigegebene Trennung der Design-Erstellung vollständig umsetzen und nachweisen.
- T-001: Nach TP-Freigabe die bestehende Brownfield-Vorbereitung durchführen; Quellen, Umfang,
  Wiederverwendung und unabhängige Änderungen prüfen.
- T-002: sd-definition samt Vertrag und Vorlage einführen; fachliche SD-Erstellung bei gate-check
  entfernen, gemeinsame Registrierung und Freigabezuständigkeit erhalten.
- T-003: Ausgewertete SD-Route mit exakten Quellen und sicherer Zuordnung umsetzen; normale
  Fortsetzung fertiger Entwürfe und tatsächliche Überarbeitung unterscheiden.
- T-004: Offene oder fehlerhafte deklarierte Designentscheidungen technisch sperren; bestehende
  Integritäts- und Kriterienprüfungen sowie Altbestandsverhalten erhalten.
- T-005: Den gemeinsamen CLI-/MCP-Vertrag um ausdrückliche, revisionsgebundene SD-Revision erweitern.
- T-006: Entwurf, Klärung, Revision, Konflikte, ungültige Bindungen und frische Freigaben testen;
  neue Prüfungen in die bestehende vollständige Verifikation aufnehmen.
- T-007: Dokumentation und erzeugte Host-/Paketoberflächen konsistent aktualisieren; sämtliche
  bestehenden Größen-, Integritäts- und Leistungsgrenzen beibehalten.
- T-008: Den tatsächlichen Kandidaten vollständig prüfen und Verhaltens-/Ableitungsnachweise mit
  genauer Herkunft und Grenzen erfassen; unabhängige CI-Fehler getrennt zuordnen.
- T-009: Abschließend tatsächlichen Diff, Architektur und Planerfüllung prüfen, Befunde beheben
  und die Nachweise an die bestehende QA übergeben.
- Abdeckung: Alle zehn PRD-Kriterien und acht SD-Entscheidungen sind 29 konkreten Szenarien mit
  erwarteten Ergebnissen und Nachweisquellen zugeordnet. Noch keine Tests als bestanden behauptet.
- Risiken: Quellen-/Revisionskonflikte, verschwiegene Entscheidungen, Altbestandsregressionen,
  Budgetüberschreitungen, Paketdrift und fehlende Nachweise verhindern einen uneingeschränkten QA-Pass.
- Grenzen: Keine neuen Gates, Writer, Migrationen oder automatischen Installations-, Git- und
  Veröffentlichungsaktionen; unabhängige CI-Arbeit bleibt separat. Frische Host-/Modellbeobachtung
  bleibt ausdrücklich ungeprüft, sofern sie nicht tatsächlich erfolgt.
- Nächster Schritt: Approval: TP erlaubt zuerst Brownfield-Vorbereitung und danach die geplante
  Umsetzung mit Tests. QA, UAT und Abschluss behalten ihre bestehenden Entscheidungen.
