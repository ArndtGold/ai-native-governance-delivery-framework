# SD: Reliable Codex MCP inspection and bound approval navigation

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-25
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Extend the existing Core inspection definition and read-service projection. Keep all input acceptance, the fourteen fields, eleven operations, canonical gate-check report and human presentation compatible. Add no transport-specific policy, writer, connection context, operation registry or tool.

The existing schema's required operation makes its root conditional rules eligible for equivalent placement under dependentSchemas.operation. This exposes root properties to the installed Codex type renderer while leaving full SDK validation active. Keep conditional requirements, selector applicability, examples and normalization in the same contract owner; share repeated selector conversion rather than maintaining another mapping.

For an explicitly bound gate-check, compose advisory navigation from the existing current Run snapshot, command descriptors and presentation catalog. Publish it only as optional envelope metadata. Keep ordinary read evaluation and its presentation outside the advisory failure guard and return the legacy report through one unchanged path. A failed optional observation must not turn a valid state read into an evaluator error.

This renewed design follows the verified SD source revision b1c5f54c-c386-4b49-8a11-ed0a925852a4. The implemented Core slice and its source-bound checks remain available for exact applicability assessment; their fulfillment was not automatically carried across revision. Correct only native qualification guard composition at its existing execution owner. The successful prototype observations and all failed preflights remain immutable historical evidence. This design authorizes no further implementation or model session until the renewed TP and required preparation.

## 2. Ownership And Source Of Truth

| Concern | Existing authoritative owner | This design's treatment |
|---|---|---|
| Published inputs, conditional acceptance, selector meaning and conversion | packages/core/lib/control-inspect/contract.js and selection.js | Equivalent projection and clearer descriptions; one field/selector model |
| State evaluation and human read presentation | packages/core/lib/control-evaluation/gate-check.js and gateCheckPresentation in control-inspect/service.js | Unchanged report and presentation; no navigation logic in the evaluator |
| Read-envelope composition | packages/core/lib/control-inspect/service.js | Sole navigation constructor; explicit context, bounded advisory guard and no writes |
| Target identity and command module meaning | resolveControlCommandTarget and RUN_COMMAND_DESCRIPTORS in existing control-state owners | Reuse exact target identity and the existing descriptor group/kind; no duplicated operation table |
| Presentation discovery, immutable bytes, revisions and cursors | packages/core/lib/control-state/run-presentation.js | Reuse readPresentationCatalog and read_arguments; no replacement presentation or cache |
| Approval effect, receipts, idempotency and recovery | Existing Core approval and transaction owners | Unchanged; an actual command still needs the deliberate reply and exact checked binding |
| MCP/schema transport and output enforcement | packages/cli/lib/mcp-dispatch-runtime.js and packages/mcp-server/src/server.js | Existing projection, full validator and error boundaries remain active |
| Generated distributions and budgets | Existing Core projection, package assembly and plugin/profile builders | Regenerate from canonical source; unchanged limits and baseline |
| Qualification and evidence | Existing CLI/MCP tests and evals/mcp-ergonomics/native task/audit | Preserve task/predicate/parser/audit; assess unchanged functional evidence and obtain fresh candidate-bound qualification |
| Native execution protection | scripts/native-probes/codex-host-e2e.mjs T7 execution owner and its test-only guard helper if needed | Sole combined-policy controller/guarded-worker boundary; qualification launcher supplies bound paths/ledger and never wraps an already protected worker in another sandbox |

PRD.md at digest sha256:bbfa5c7931f9b6617489d90c4ec4bc26a85c3bd5fd5b6b3239c5152a259249c0 is the product authority. BROWNFIELD_REVIEW.md at digest sha256:9f9c261dd8db0c9dca12cb119538eea8c9b3fb158dcfacb338914f2d2f8e5118 is subordinate existing-system evidence. The schema, native study and this design do not replace those sources.

## 3. Architecture Decisions

- SDD-001: Preserve the canonical field model and move the existing root allOf conditions under dependentSchemas.operation while operation remains required; rationale: the installed renderer can expose root properties and the SDK still evaluates the same constraints for every admissible input; consequence: prove acceptance equivalence and actual installed-host visibility rather than assuming JSON Schema validity establishes usable model types.
- SDD-002: Construct navigation only in the existing Core inspection service from explicit target/Run input, the current evaluator snapshot, canonical command descriptors and the validated presentation catalog; rationale: these owners already hold the necessary identities and meanings; consequence: no new input field, tool, semantic registry, connection state, guessed identifier or independent selection authority.
- SDD-003: Keep navigation optional and separate from report, presentation and host_action, with an advisory-only failure guard and one legacy result path; rationale: an unavailable extra observation must not corrupt a previously valid state read; consequence: recognized catalog unavailability yields no suggested calls, while an unexpected advisory-only failure omits navigation without hiding existing evaluation or command failures.
- SDD-004: Preserve exact conversation bindings and original document revisions, disclose current-gate catalog scope, and copy only validated catalog read_arguments after complete unique discovery; rationale: current workflow hints cannot select another human decision or establish wider uniqueness; consequence: explicit known-document reads remain available independently of hints, ambiguous records do not select a document, and stale/foreign approval bindings remain rejected by existing owners.
- SDD-005: Preserve all original study observations and distinguish them from final delivery qualification under the selected Run; rationale: prototype successes and failures are immutable evidence of their own candidates; consequence: copy allowed evidence bytes with verified manifests, retain negative outcomes and original provenance, and never replay completed cases to reconstruct or replace them.
- SDD-006: Reuse actual SDK/STDIO paths and the installed Codex renderer, followed by the unchanged normal T7 task, model/effort and original/strict audit under the corrected guard; rationale: schema structure, protocol checks, OS protection and genuine model outcomes prove different things; consequence: assess retained evidence against exact unchanged sources, bind the final integrated harness/guard fingerprints, and obtain the same two fresh native successes only under renewed TP authority.
- SDD-007: Use canonical projection/build owners and preserve all existing discovery, payload and timing ceilings; rationale: the prototype demonstrates a small compatible transfer and shared selector conversion avoids needless runtime payload growth; consequence: equivalent concise help and deduplication are permitted, but exceeding a limit, excluding required files or changing the Copilot baseline is not a passing implementation.
- SDD-008: Preserve existing approval, mutation, recovery and host-setting boundaries with a locally reversible source-only rollout; rationale: read guidance is not authority and this Run does not include installation, release or Git handoff; consequence: no changes to writers, credentials, global settings, protected historical Runs or approval formulas, and scope growth returns to the earliest affected owner.

- SDD-009: Apply exactly one combined macOS OS profile at the existing T7 cohort controller and inherit it in the whole worker process tree, with fail-closed protection verification before account/MCP/model use; rationale: this host rejects nested sandbox application, while a single profile with identical protected targets passes model-free controls; consequence: only guard composition/lifecycle/reporting and its targeted tests may change, no caller flag alone proves protection, and guard startup failure cannot be mislabeled as account failure.

## 4. Integration Points

### Schema and discovery

Keep properties, required fields, dependentRequired, selector-dependent schemas and definitions owned by contract.js. Reuse the exact conditional nodes rather than writing a second logical version. Because operation is required, moving its conditional evaluation does not make an input without operation admissible. The SDK keeps its normal full schema check before tool execution; Core normalization and error/result handling remain in place.

The discovered descriptions identify the normal start, the prohibited gate selector on gate-check, sequential navigation and document continuation. Rich help keeps authoritative provenance, exact conversation-binding precedence and cursor-type boundaries. Share the existing snake-case-to-Core selector conversion where it is duplicated; do not merge distinct revision meanings or weaken field validation to save bytes.

### Advisory read flow

1. Perform the existing input normalization, target resolution, read boundary and canonical gate-check evaluation. Their existing failures and presentations retain their behavior.
2. Consider navigation only when run_id, target_source and primary_target were explicitly supplied and the evaluator's selected Run matches that named Run. No implicit current context is introduced.
3. Use the evaluator's existing internal Run snapshot for its revision and the existing target identity owner for the target hash. If the snapshot/binding cannot support guidance, omit it or return the catalog owner's unavailable result; never fill missing values by recency or inference.
4. Call the existing catalog owner with that binding and the evaluated current gate as a disclosed workflow filter. It rechecks current revision, seal, record identities, byte snapshots, containment and completeness. Keep its requested_gate, binding, state, limits and continuation information intact. Uniqueness is only for that reported scope.
5. Derive an operation-contract read from the existing next-operation key and canonical descriptor group when supported. Its arguments carry the explicitly bound context and current revision. Emit no contract hint when the catalog cannot validate that binding or the descriptor does not identify the existing group.
6. Append a presentation-document read only when the catalog reports complete, unique discovery and a complete page. Copy its read_arguments unchanged, including the original record revision. Do not construct a new presentation or choose an entry from an ambiguous page.
7. Return navigation with exactly presentation_catalog and next_calls. Each next-call object contains the canonical tool name agdf_inspect and its arguments. At most the contract read and the selected document read are suggested, in that order. Execute them sequentially; any document next_cursor still comes from its actual result.

The service cannot see conversation history and must not pretend to resolve a user's previously supplied presentation identity. Existing exact conversation bindings retain precedence through the existing direct document-read interface and help contract. No new binding selector is added to gate-check. The agent remains responsible for preserving that known binding instead of substituting a current-workflow hint. Existing Core command checks still reject the wrong gate, revision or presentation even when a hint was observed.

### Failure and result boundaries

Construct optional navigation as a complete local value and attach it only after successful construction. Enclose only extra target/catalog/descriptor composition in its failure guard. Preserve the existing report/presentation result once, without reevaluating policy, swallowing an original evaluator exception or mutating the report. A recognized unavailable catalog may remain observable with an empty next_calls list. Unexpected advisory-only failure omits optional navigation, which the approved PRD explicitly permits.

For an intervening Run change, catalog validation returns unavailable or an actual later read/command rejects its stale binding through the existing owner. Navigation is an observation, never a capability valid independently of those checks. Keep authorizes false, terminal and host_action semantics unchanged.

The current bounded discovery and detailed Core output schemas already allow additive envelope metadata. Retain those validators and all existing branch invariants rather than replacing them with a permissive new schema. The navigation constructor has a fixed shape and reuses validated owner outputs; no independently submitted navigation payload or second production validator is introduced. Actual returned argument objects must be exercised against the public input schema through the SDK in regression tests and remain subject to that same SDK/Core validation on invocation.

### Propagation and isolation

Regenerate through existing Core projection, package assembly and plugin/profile owners. Build and validate in an isolated checkout when needed to preserve foreign root dist/generated/dependency files and existing Git staging. Any isolated candidate must receive only the reviewed source/test changes, preserve correct workspace resolution and prove that its loaded Core files and assembled payload match the intended source digests. A stale copied workspace package must fail provenance checks, not silently serve as the candidate.

No installed plugin or host setting is changed. Do not introduce a runtime compiler, host-specific schema fork, alternate API credential path or new tool allowlist. The task, prompt, original/strict predicates, trace parser and wrapper audit remain unchanged. Adapt only the existing T7 harness guard composition, inherited-worker verification, lifecycle and accurate guard failure reporting. Retain all effective protection targets and fail closed without an unguarded, weaker, provider or credential fallback.

### One combined native qualification guard

The existing T7 entry path owns a controller and a private guarded worker. The controller resolves the original ROOT, existing personal CODEX_HOME and isolated candidate as concrete execution inputs, validates their canonical paths and freezes the exact approved candidate/guard inputs. These execution paths do not select an AGDF target or grant delivery authority. No independent guard registry or transport policy is introduced.

1. Before the qualification window, the controller verifies source/assembly bindings and the zero-model prerequisites, prepares one canonical policy and the write-ahead ledger, and captures the agreed Root/control/foreign-file/staging/settings snapshots. Reserve only the two existing unused model slots before one actual cohort launch; a preflight reserves none. The controller retains output under the isolated candidate while the guarded worker is running.
2. Apply sandbox-exec exactly once to the complete T7 worker cohort. The one policy denies file-write* under the entire original ROOT and at the same three existing settings literals: config.toml, plugins/installed_plugins.json and plugins/known_marketplaces.json. Preserve normal candidate/fixture/temp writes and normal existing-account/session persistence outside those targets. Harness setup, its MCP processes and both Codex sessions inherit this same OS profile.
3. A private worker invocation or environment flag is never evidence of an active guard. The controller binds the canonical policy bytes/digest and protected paths; the worker must verify the expected binding and actual protected access behavior before account checks, MCP setup or any model invocation. Verify safe append-opening denial for existing protected Root/config files using O_WRONLY|O_APPEND without creation, truncation or data writes, and verify an owned temporary write/read/cleanup positive control. The complete profile must contain every protected literal even when its file is absent; retain absence and before/after hashes. If a necessary probe cannot establish protection, stop without a weaker fallback. Targeted tests must show that an unguarded direct worker/flag fails before model launch. This is cooperative execution evidence from the trusted local controller, not independent kernel or human attestation.
4. The guarded worker executes the existing two-repetition normal T7 flow. Codex is spawned directly within inherited protection; runFocusedTask must not start another sandbox-exec around it. Do not change the prompt, native tasks, native-run parser/audit, strict predicate, four-call/error accounting or repetition behavior. Keep gpt-6.1-sol with Reasoning low, existing ChatGPT account only, zero additional API-spend authority and no login, credential copy, global config change or plugin installation.
5. Distinguish OS profile application, worker protection verification and actually executed account-status failure in qualification output. The observed nested-profile failure occurred before Codex and must not imply invalid credentials. A guard failure or incomplete trace remains failed/unavailable evidence; it grants no retry/resume, substitute model, extra session or modified predicate.
6. The controller enforces the approved finite outer deadline for setup, both sessions and teardown and terminates only its owned process tree when necessary. Keep original per-session timeouts and the same total model allowance. The TP binds executable details and source fingerprints before any model launch. A guard/source change between repetitions invalidates a passing-cohort claim; never combine mixed candidates.
7. After worker exit, compare original Root/control/settings/staging and frozen candidate before importing results into ROOT. Preserve all original failed setup/preflight observations, raw native outputs and exact policy artifacts. Historical failure files are evidence; launch readiness is determined by the current bound successful prerequisites, never by deleting or ignoring history. Existing cleanup remains confined to newly owned transient fixtures; do not clean prior completed evidence or foreign work.

The recorded model-free combined-policy proof demonstrates existing-file denials, a permitted temporary write and successful ChatGPT login-status/version detection on CLI 0.163.0 without credentials retained. It does not implement this cohort integration, prove the private-worker checks, consume a model slot or satisfy either fresh T7 obligation. The new guard integration and its lifecycle need targeted tests and a fresh zero-model preflight before the same two planned real sessions.

## 5. Constraints And Compatibility

The approved PRD owns acceptance and every ceiling. Keep existing public names, fields, operation values, current command/result versions, conditional rejection rules and CLI report bytes apart from the existing evaluation timestamp treatment. Optional navigation is an additive MCP read-envelope extension; legacy consumers are not required to use it.

Use existing Core owners for target identity, command modules, catalog limits and document reads. In particular, retain false all_active behavior, valid successful blocked reads, current versus original revision distinctions, immutable records and existing cursor namespaces. Leave legacy/current protocol negotiation, error isError classification, uncertain-dispatch recovery and deliberate approval unchanged.

Do not automatically prepare a replacement, select by timestamp, manufacture a human response or auto-execute a returned call. Known exact document bindings can still be read when a broader catalog is ambiguous, subject to the existing document owner. A catalog result alone proves neither human viewing nor approval.

The isolated reference fits the existing limits at 4,992 definition bytes and 3,509,443 Copilot bytes; this leaves little room. Keep the transfer maintainable by sharing selector conversion and one legacy-result path, with equivalent concise help where appropriate. Failure containment may refine the prototype, but no final size/qualification claim is made at SD. If the actual normal build exceeds an approved ceiling, implementation is unready and must be corrected within this design or returned to its owner; never raise the limit or drop required coverage.

## 6. Test And Evidence Strategy

TP must bind concrete tasks, commands, scenarios, expected results, paths, source digests and finite execution budgets for every mapped decision and criterion. It must include:

- The existing 247,003-case SDK acceptance comparison, Core argument-conversion checks and retained invalid-argument replay, retaining all rejections and detailed result validation.
- A model-free observation of the actual installed Codex type projection, with no account credential copy or real model request. A loopback response stub is rendering evidence only; source-level shape checks alone do not prove native rendering.
- Actual modern/legacy STDIO calls validating returned read arguments, normal ordered navigation, ambiguous/missing/corrupt records, unavailable bindings, explicitly unbound requests, current-gate filter scope and exact known-document precedence.
- Historical-document reads versus current contract revision, rejected stale/foreign approval attempts, invalid cursors, existing multipage delivery and no control-tree mutation from inspection.
- Existing CLI parity/read-only/preview and MCP command/protocol suites. Add a regression where optional navigation construction fails while the original valid or blocked report and presentation remain unchanged. Existing evaluator failures must remain failures. Update only obsolete wording expectations where the bootstrap description intentionally changes; do not skip or weaken behavioral assertions.
- Canonical definition, command aggregate, output/input, normal Copilot profile and fixed-fixture timing checks. Preserve the existing methodology/ceiling relationship and distinguish fresh process/handshake costs from measured RPC time.
- Targeted model-free tests for the single combined policy and controller/worker boundary: canonical path/policy binding, all protected literals, existing-file append denial, allowed owned temp writes, refusal of unguarded/flag-only invocation, no nested launcher, preflight-before-model ordering, accurate startup/auth failure classification and owned-tree deadline/teardown behavior. No negative test may create or modify a real protected global setting.
- Fresh real gpt-6.1-sol/low sessions satisfying the unchanged normal T7 task, call/error acceptance and original/strict audit. Bind actual guard/harness and assembly fingerprints after implementation; the old pre-change harness hash is a baseline, not permission to ignore the reviewed guard change. Keep native-run.js/native-tasks.js unchanged. Source binding, observed model/effort, complete trace and protected snapshots remain prerequisites. A stopped, failed or incomplete session stays in the ledger.

Retain study material under this Run's evidence/prestudy area using an explicit source-file selection, verified original SHA-256 values and a new retention index. Include all successful and failed relevant native observations, events, rollouts, effective configurations, final responses and their original manifests, together with the study report, decision notes, source/patch and comparison evidence. Keep the earlier A/B evidence separately identified by its original cohort and candidate. Copy source bytes without editing or claiming that an original whole-study manifest is a complete manifest of a deliberately selected delivery bundle. Do not copy credentials, entire dependency trees or unrelated scratch files.

Fresh evidence belongs in a separate qualification area with a write-ahead session ledger and candidate/source bindings. The renewed TP binds exactly the same two unused fresh normal sessions, no additional attempts, per-session/outer deadlines, zero-model prerequisites and no-retry/resume rules. It must map retained source-bound results to exact unchanged code/environment before claiming applicability; source revision never automatically retains fulfillment. Repeat affected checks when source, execution method or unresolved evidence requires it; do not rerun completed old model cases or blindly repeat unaffected heavy suites. No new model execution is authorized by SD drafting or approval alone.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Equivalent root-property projection and clear single-owner guidance, verified in the installed renderer and native path | Core inspection contract.js and selection.js; existing Codex/native observation harness | SDD-001, SDD-006 | Conditional type projection is host-specific; keep full validation and record the exact observed host |
| AC-002 | Reuse the original condition nodes and selector conversion; preserve SDK/Core and detailed output enforcement | Core contract.js; existing MCP adapter/schema provider and error owners | SDD-001, SDD-006 | Equivalent-looking schemas can drift; matrix, conversion and replay checks remain required |
| AC-003 | Explicit-context navigation constructor, canonical descriptor/catalog composition, fixed read-only shape and sequential order | Core service.js; RUN_COMMAND_DESCRIPTORS; target identity and presentation catalog owners | SDD-002, SDD-003, SDD-004 | Advisory current-gate scope must not be confused with a supplied exact binding or wider uniqueness |
| AC-004 | Copy guarded read_arguments and preserve original document revision, current contract revision and exact-binding precedence | Core run-presentation.js and existing approval/transaction owners | SDD-004, SDD-006, SDD-008 | Historical or ambiguous records must remain safe and cannot authorize a current approval |
| AC-005 | Bind final assembled source, existing guarded T7 task, normal account and unchanged strict audit in TP | Existing native tasks, native trace parser and codex-host-e2e harness | SDD-006, SDD-008, SDD-009 | Prototype success is insufficient and model availability cannot be repaired by weaker execution |
| AC-006 | Canonical regeneration and normal budget/performance checks; maintainable deduplication within existing ceilings | Core/MCP limit constants; Copilot baseline and existing projection/build/profile owners | SDD-007 | Very small source/payload headroom may expose growth; no ceiling increase or coverage exclusion |
| AC-007 | Separate advisory guard and one legacy report/presentation path; unchanged writers, errors and protocol boundaries | Core service.js; gate-check presentation; CLI/MCP result/error and command owners | SDD-003, SDD-006, SDD-008 | Extra observation failure must not degrade an existing successful read or hide an original failure |
| AC-008 | Hash-preserving selected retention, separate fresh ledger and exact loaded-source/isolation checks | Selected Run evidence; original study manifests; canonical build/native guard | SDD-005, SDD-006, SDD-007, SDD-008, SDD-009 | Temporary evidence, stale workspace packages and reused assets require explicit provenance and qualification limits |

The mapping was semantically reviewed against the exact approved PRD and completed Brownfield Review. Each criterion appears once, every listed design decision is mapped, and no new acceptance authority or product scope is introduced. The renewed architecture includes SDD-009 and resolves the fresh Brownfield guard-design question; test scheduling and concrete evidence commands remain TP work.

## 8. Risks And Open Questions

- Optional navigation is intentionally advisory data built from existing owners in the currently extensible result envelope. Its fixed shape and argument validity require actual SDK regression coverage; this is not permission to disable any detailed output check.
- Single-in-flight execution remains an existing constraint. Sequential guidance and qualification must prevent a normal-scenario busy failure; a broader concurrency change would exceed this design.
- State can change after any read. Existing per-call/transaction validation remains decisive; this design does not promise an implicit multi-call lock or session capability.
- Budget headroom is narrow. Additional robustness must preserve meaning and existing coverage; unresolved growth blocks delivery rather than changing a limit.
- Single-policy planning proof is available, but integrated worker inheritance and refusal, shutdown and current candidate provenance remain unqualified until implementation/tests. TP must bind them before models; no design claim substitutes for those checks.
- Native evidence remains limited to the approved T7 workflow and exact observed tuple. No release or other-host qualification follows from it.

No material before-SD decision remains open. Concrete TP commands, source/retention inventories, dates and session budgets are the planning details below and cannot alter these architecture choices.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Native-visible schema and canonical normalization | before_sd | resolved | SDD-001: equivalent dependentSchemas.operation placement; one field/selector owner; unchanged inventory and validation. | Arndt Gold |
| Navigation composition and applicability | before_sd | resolved | SDD-002: use the explicitly named Run/context, current snapshot, existing target identity, descriptors and catalog; no implicit connection state. | Arndt Gold |
| Advisory failure and public result boundary | before_sd | resolved | SDD-003: optional navigation outside report, fixed constructor shape in the existing open envelope, advisory-only guard and unchanged legacy evaluation/presentation path. | Arndt Gold |
| Exact binding and catalog scope precedence | before_sd | resolved | SDD-004: existing exact conversation bindings prevail; current-gate scope remains disclosed and advisory; document reads keep original revisions and contract reads current revisions. | Arndt Gold |
| Evidence, validation and qualification ownership | before_sd | resolved | SDD-005/006: preserve originals, separate final evidence, verify actual loaded source, and retain the existing SDK paths and strict native predicates. | Arndt Gold |
| Distribution, ceilings and reversal | before_sd | resolved | SDD-007/008: canonical propagation, unchanged budgets/writers/settings and source-local reversal; no install, release or Git handoff. | Arndt Gold |
| Native cohort protection and failure ownership | before_sd | resolved | SDD-009: one canonical profile applied once to the complete worker cohort, inherited by all descendants; keep Root subtree and all three settings literals. Worker verifies binding and real negative/positive controls before account/MCP/models; an unguarded flag alone fails. Existing T7 harness owns composition and accurate guard startup reporting. | Arndt Gold |
| Detailed task/scenario mapping and retention inventory | later_tp | deferred | TP binds executable checks, expected outcomes, exact selected original files, manifests and evidence destinations for every criterion/decision. | tp-definition |
| Bounded real-agent execution plan | later_tp | deferred | TP binds the same two unused sessions, exact guard/harness/candidate fingerprints, required zero-model checks, owned-tree deadlines, account isolation and no retry/resume/replacement before model calls. It cannot change SDD-009 protection or the task/audit. | tp-definition |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

After valid approval, prepare the bound Task/Test Plan through tp-definition. Product implementation and fresh native agent execution remain blocked until the required TP approval and implementation-preparation Brownfield Analysis. Earlier replies cannot approve a changed design.

## AGDF Approval Summary (de; source=en)

- Ziel: Den bereits freigegebenen MCP-Ablauf mit sichtbarem Codex-Vertrag und exakten Lesehinweisen fertigstellen und die fehlerhafte Schutzverschachtelung im Qualifikationstest korrigieren. UR und PRD bleiben unverändert freigegeben; die alte SD/TP samt Nachweisen sind archiviert.
- Umfang: Die bestehenden Core-Owner für Vertrag und optionale Navigation bleiben erhalten. Zusätzlich darf nur die Schutzkomposition, Prüfung und Lebenszyklusbehandlung am bestehenden T7-Harness angepasst werden. Es entstehen keine neuen MCP-Werkzeuge, Eingaben, persistenten Produktzustände, UI-Flows oder Freigaberechte.
- Core-Entscheidungen: Die vorhandenen Schemabedingungen bleiben gleichwertig unter dependentSchemas.operation; ein gemeinsames Selektormodell bleibt maßgeblich. Geordnete navigation-Leseaufrufe entstehen nur aus ausdrücklich gebundenem Kontext und bestehenden Ownern. Bekannte exakte Dokumentbindungen haben Vorrang; historische Dokumente behalten die ursprüngliche Revision. Katalogfilter und Vollständigkeit bleiben sichtbar, Leseaufrufe laufen nacheinander. Nur zusätzliche Navigationsfehler werden abgefangen; Bericht, Präsentation und ursprüngliche Fehler bleiben erhalten.
- Schutzkorrektur: Genau eine macOS-Sandbox schützt den gesamten Test-Worker mit Harness, MCP und Codex-Kindprozessen. Sie sperrt den vollständigen Original-ROOT und dieselben drei globalen Einstellungsdateien. Der vorhandene Test-Owner erstellt und bindet das Profil einmal; Codex erbt es. Eine zweite verschachtelte Sandbox entfällt. Eine bloße Startoption beweist keinen Schutz: vor Konto-, MCP- und Modellnutzung müssen gebundene Profilangaben und echte negative/positive Kontrollen passen, andernfalls wird gestoppt.
- Fehler und Lebenszyklus: Schutzstart, Schutzprüfung und tatsächlich ausgeführte Kontoabfrage werden getrennt berichtet. Ein Sandbox-Startfehler darf nicht als fehlende Anmeldung gelten. Zeitüberschreitung und Abbruch beenden ausschließlich eigene Testprozesse. Vor dem Rückkopieren von Ergebnissen werden Originalbestand, Vormerkungen, globale Einstellungen und eingefrorener Kandidat verglichen. Keine früheren Ergebnisse oder fremden Dateien bereinigen.
- Stand des Nachweises: Die gemeinsame Sandbox besteht die modellfreie Planungsprüfung auf diesem Host: Schreiböffnungen an vorhandenen Root-/Konfigurationsdateien werden blockiert, eigener temporärer Schreibzugriff funktioniert, Codex 0.163.0 erkennt den bestehenden ChatGPT-Anmeldestatus und die geschützten Hashes bleiben gleich. Das ist noch keine integrierte Harness- oder neue T7-Abnahme. Die eigentliche Schutzintegration wurde noch nicht umgesetzt und keine neue Modellsitzung verbraucht.
- Unveränderte Grenzen: Modell gpt-6.1-sol, Reasoning low, dieselben zwei noch ungenutzten normalen T7-Sitzungen, Aufgabe, Prompt, ursprünglicher und strenger Prüfer, Trace-Parser und Audit bleiben unverändert. Keine Zusatz-/Ersatzsitzung, kein Resume, kein API-Fallback, keine kopierten Zugangsdaten, Anmeldung, globale Einstellung oder Plugin-Installation. Alle MCP-Limits und die Copilot-Grenze von 397 Dateien und 3.509.461 Byte bleiben verbindlich.
- Prüfung und Quellen: Alle acht PRD-Kriterien sind genau einmal auf die bestehenden Owner und nun neun Designentscheidungen abgebildet. TP bindet gezielte Guard-/Worker-Tests, frische modellfreie Vorprüfung, tatsächliche finale Guard-/Harness-/Paket-Hashes und die zwei echten T7-Abnahmen mit je höchstens vier MCP-Aufrufen und null Fehlern. Bestandene vorhandene Funktionsnachweise bleiben erhalten, werden anhand unveränderter Quellen und Umgebung neu bewertet und ersetzen keine frische native Abnahme.
- Risiken und nächster Schritt: Es gibt keine offene materielle SD-Entscheidung. Guard-Integration, nachgewiesene Vererbung, Abbruchverhalten und neue native Ergebnisse stehen aus. Nach Approval: SD folgt der erneuerte TP; erst dessen Freigabe und die vorgeschriebene Implementierungsvorbereitung erlauben die Umsetzung und danach die zwei geschützten Modellläufe. QA, UAT, Installation, Veröffentlichung und Git-Aktionen werden hier nicht freigegeben.
