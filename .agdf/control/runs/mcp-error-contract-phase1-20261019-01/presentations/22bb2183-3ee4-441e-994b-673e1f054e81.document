# SD: MCP error signalling with preserved domain results and recovery authority

Status: draft
Gate: SD
Gate approval: open
Based on: approved PRD; Brownfield Review; ready UX Intent Definition
Date: 2026-10-19
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Add a pure, operation-aware error projection to the existing Core/runtime composition, then let the MCP adapter emit the error signal and explanatory text. Keep existing domain results, operation identities, receipts and successful decision presentations intact. Normalize known execution failures at their existing runtime/worker owner before transport, and retain failure details in the current Cockpit/decision consumers instead of collapsing every isError result to a generic UI error.

The exact approved product source is PRD.md, sha256:ac7572d244beb271bcab874e2638e53f885d8e6ed4ebabe7079f19529d143684. Brownfield Review and UX Intent Definition are subordinate inputs. This is a proposed implementation design; no production code, working UI or native recovery is claimed.

### Intended flow

1. The existing SDK validates request structure and tool schemas. Unknown tools, malformed protocol requests and SDK-owned validation retain their supported SDK behavior.
2. The existing runtime parses and executes a valid tool invocation. Core continues to determine its domain outcome and effects.
3. A pure projection in the producing runtime derives a bounded success/failure descriptor from the existing result and confirmed operation context. It does not evaluate a gate, inspect a new filesystem path, retry or write state.
4. The existing MCP server validates the internal descriptor, removes it from domain serialization and sends the original public result plus isError and one additional localized explanation for actual failures. Successful result text and exact decision presentations stay unchanged.
5. Typed UI consumers validate known error data and preserve its reason/effect/recovery path. Unknown or malformed error data remains a generic safe failure, never a successful submission.

## 2. Ownership And Source Of Truth

| Responsibility | Authoritative owner and proposed placement | Boundary |
|---|---|---|
| Effective governance, command outcome and receipts | Existing packages/core/lib/control-state/run-command-service.js and underlying command/recovery services | Unchanged eligibility, approvals, UUID/payload identity and recovery transactions. |
| Dispatch/inspect/report meaning | Existing packages/core/lib/skill-dispatch/ and control-inspect/ owners | Existing outcomes and report fields remain truth. No text/substring inference of policy. |
| Pure MCP failure interpretation and guidance projection | New packages/core/lib/mcp-tool-errors.js, composed by existing packages/cli/lib/mcp-dispatch-runtime.js | One deterministic projection of existing facts, without SDK/process/filesystem imports, new state or a second governance evaluator. |
| Execution cause and known dispatch phase | Existing CLI runtime plus packages/mcp-server/src/worker-entry.js, worker.js and generation-entry.js | Only typed/allowlisted facts cross worker boundaries. Timeout/exit does not prove rollback. |
| Wire error flag and content delivery | Existing packages/mcp-server/src/server.js | Consumes a checked descriptor; does not decide business success from report prose. |
| Generation compatibility and old-operation routing | Existing generation.js and generation-protocol.js | Selected producing generation owns result projection. Existing routing, capacity, retirement and protected unknown-operation rules stay unchanged. |
| Cockpit and decision error consumption | Existing packages/control-ui/src/mcp/transport.ts, DecisionEntry.tsx, DecisionCard.tsx and feedback.tsx | Use validated domain errors and curated guidance; no automatic action or new approval channel. |
| Human language | Existing plugins/agdf/meta/agdf-interaction-locales.json and locale resolution | Add bounded EN/DE messages through this owner, without a second translation catalogue. |
| Build and evidence | Existing scripts/core-projection.mjs, runtime provenance/assembly; existing MCP/UI/eval suites | No hand editing of generated or installed copies. No installation or publication in this run. |

The new pure module owns only the MCP interpretation/description of an already produced result. Existing semantic owners remain authoritative for the result, authority and effects. Its classifier uses an explicit family/operation map and stable result fields; it cannot invoke those owners again or choose a different target/run.

## 3. Architecture Decisions

- SDD-001: Use one pure Core failure projector composed at the existing runtime seam, with explicit tool-family and read-operation selectors; rationale: reuse existing domain outcomes without SDK dependencies, duplicated per-tool policies or a second evaluator; consequence: supported result families and near-neighbor successful reports need explicit contract tests when their existing owners change.
- SDD-002: Preserve public structuredContent and the existing first content block, add isError true and a bounded second explanatory text block only for actual failures; rationale: existing consumers and the baseline read domain outcomes from structured data or the first JSON block, while models also need direct corrective text; consequence: error content becomes a multi-block response and its total size must be checked, while successful presentation_delivery text remains exact.
- SDD-003: Normalize typed parse/runtime/worker failures with confirmed execution-phase facts at their existing owner and pass only a small allowlisted fact record; rationale: the current worker catch loses causes and parent catches can imply unknown effects even before dispatch; consequence: worker, parent-owned and generation catch paths must share the same normalizer and preserve genuinely unknown execution rather than infer rollback.
- SDD-004: Derive correction classes from existing reason/effect/receipt evidence and use original-operation observation before any uncertain-write replay; rationale: a tool error is not non-execution and guidance cannot confer eligibility; consequence: unknown causes have a bounded stop/diagnostic action, and transient retry advice is allowed only with confirmed prerequisites and known effect limits.
- SDD-005: Produce the checked result descriptor inside the exact serving generation and declare its internal version in the existing generation manifest; rationale: a facade must not reinterpret an old generation's effects using a new runtime's rules; consequence: incompatible generation candidates are rejected through existing manifest compatibility and require the normal future installation path, with no live-runtime patch or new migration mechanism.
- SDD-006: Preserve validated negative envelopes in existing Cockpit/decision transport consumers before their generic isError fallback; rationale: those consumers currently discard the reason that their existing UI uses to explain stale state, denial or uncertainty; consequence: accepted/success payloads cannot be accepted under an error flag, and all current session/binding checks remain mandatory before displaying or using recovery information.
- SDD-007: Keep localized guidance in the existing EN/DE registry and validate bounded domain/error shapes independently of the SDK's skipped output validation on error; rationale: useful text must not leak raw exceptions or weaken existing public result invariants; consequence: unknown/untrusted details receive safe fallback, existing unsupported-language resolution remains unchanged, and no new global error store or registry of runtime events is introduced.
- SDD-008: Preserve baseline/metrics and run unchanged protocol comparison plus separately identified supplementary correction/consumer cases; rationale: intended error-channel improvements must be distinguishable from changes to evaluation predicates or coverage; consequence: native claims require actual native observation and pending scenarios stay gaps rather than being counted as passed.

### Projection and wire contract

The internal result descriptor is version 1 with exactly these fields: schema_version, failed, code, category, effect_state, action, message, authorizes. schema_version is string 1; failed is boolean; authorizes is false. Success uses null for code/category/effect_state/action/message. For failures, code is a stable owner-provided allowlisted code or unclassified_tool_failure; category is input, binding, permission, runtime, uncertain or unknown; effect_state is not_dispatched, owner_reported or unknown. owner_reported means only that the existing domain result/receipt carries authoritative detail, not a new effect claim.

action is a descriptive enum: correct_input, confirm_target, refresh_binding, obtain_authority, inspect_operation, retry_after_prerequisite, repair_runtime or stop. It is not executable permission. message is complete localized cause/effect-limit/next-action text, at most 1200 characters. The descriptor including safe code/field arguments is at most 4096 UTF-8 bytes; unknown details are excluded rather than truncated into misleading instructions. No stack trace, arbitrary exception message, secret or speculative identifier is interpolated.

Carry the descriptor in the private raw-result metadata slot _meta['agdf/tool-result']; it is produced by trusted runtime composition, not accepted from tool input. It travels inside the existing bounded worker/generation result rather than creating another message protocol. The MCP server validates the descriptor, consumes/removes that private slot, preserves other existing metadata, and does not add it to public structuredContent. For an error, stable causes remain in existing reason/code/diagnostics fields and the added text repeats the safe explanation. The descriptor need not be exposed to the model or become another public domain schema.

Preserve the existing first content block: serialized original domain result, or the exact existing presentation_delivery text when applicable. Append exactly one error explanation block after it. Do not append a correction block to a successful decision presentation or replace it with generic error text. Successful results omit isError as today; actual failures use isError true. Serialize the public domain result after existing size handling, so the error flag corresponds to the result actually sent, including resource-limit fallback. Validate the existing domain envelope and failure-specific fields before emission even though SDK 2.0.0 skips outputSchema validation for isError results. Malformed internal output yields a bounded existing-runtime failure, with no recursion/re-execution.

The helper validates descriptor shape and bounds; existing domain-shape validators remain owners of domain validation. For families with only loose/no advertised output schema, retain their existing invariant checks and add focused error-path shape assertions rather than accepting arbitrary objects because they are errors. This does not redesign the public schemas or tool inventory.

### Operation-aware selection

| Existing result family | Failure selector | Success cases preserved |
|---|---|---|
| Dispatch | invalid_input, target_unresolved, evaluator_error | control_result, skill_continuation and intake_continuation, including a successfully reported governance block or required approval. |
| Inspect | Top-level invalid_input/target_unresolved/evaluator_error; failed exact reads of presentation-document/presentation-preview and stale/unavailable operation-contract/runtime-generation binding | Valid doctor/gate-check/delivery-map reports, including blocked state; artifact-readiness with ready false; operation-status reporting missing/pending/unknown original operation; native-qualification reporting unqualified. |
| Inspect read boundary details | Operation-specific available false is an error only when the named read could not deliver its required object/binding; a qualification result with available true and qualified false is a valid observation | Preserve I-SEM-UNKNOWN-RUN as a successful diagnostic report where that is the existing reader's meaning. No blanket report.status or available/ready substring heuristic. |
| Commands and existing decision actions | rejected, recovery_required, effect_unknown, plus malformed/unsupported result shape | accepted, already_applied and their current receipts/historical_effect meaning. A nested technical result must not reinterpret a committed outer command receipt. |
| Cockpit/session reads | Failure of the requested read/open/context action according to its top-level operation-specific envelope and code; session/capability/access/limit failure | Available/empty/partial views and a successful freshness/change observation; nested blocked assessment/resource rows are data. Top-level stale/change reporting that successfully fulfils a freshness query stays a successful observation. |

All current supported operations must be enumerated against their owning source during implementation-preparation analysis. A newly encountered unknown reason inside a known failed envelope remains a failure with safe fallback; an unsupported result shape is not silently reclassified as success. A successful report remains unchanged merely because it contains another entity's failure code.

### Cause preservation and effect-aware correction

Split parse, execute and serialize/postprocess stages in the existing worker and parent-owned path. A typed input error before execute is known not dispatched and carries a safe code, field and bounded allowed-value facts. Runtime provenance/version failures before execution likewise preserve non-dispatch. An unexpected exception during/after execute, cancellation/timeout after handoff, unconfirmed termination or generation connection loss remains unknown unless the existing owner supplies stronger receipt/phase evidence. Worker construction/synchronous setup failures before handing over the request can record non-dispatch. Never infer non-dispatch from the absence of a result phase or from process exit alone.

Extend DispatchExecutionError's existing payload and worker message handling only with the bounded recognized fact shape. Validate it before use. Keep current deadlines, active-slot accounting, termination confirmation and cancellation semantics. Use the same CLI/runtime normalizer in worker-entry, generation-entry and the parent catch paths; no unbounded forwarding of error.message or assumed validity based on a property named code. Update generation failure normalization allowlists only for the approved typed causes.

The existing runtime.failure builders use the same projected recovery wording, keeping recovery.action and terminal host_action.text consistent with the added tool-error explanation. Existing localized input/target recovery from domain owners is reused after shape/bounds checks; it is not replaced by a conflicting generic instruction. Where an inspect exact-read failure lacks a next action, the projector derives only the supported read/binding correction from its owner-provided reason and actual arguments.

For known non-dispatch: explain the actual correction or transient prerequisite; a retry instruction is conditional and not automatic. For stale bindings: read current state and obtain a fresh presentation/approval if the existing action requires one. For an uncertain command: preserve original operation_id, target/run, payload and receipt status and identify operation-status as the first observation; a subsequent replay is exclusively the existing recovery owner's decision. For a denied capability/permission: name the supported capable/authorized context or stop. For an unknown cause: stop and inspect supported diagnostics/current operation status as appropriate, without speculative runtime repair, alternative identities or a new UUID.

## 4. Integration Points

### Runtime, generation and packaging

The existing runtime exposes one result-projection seam that composes the pure helper for every regular, Cockpit and decision tool. Execute it once at the result-producing boundary: direct runtime for direct calls; generation-entry after its existing tool postprocessing for generation calls. Parent-generated transport failures use the same normalizer with their own known facts. Mark internal projection as complete through the validated descriptor to prevent duplicate explanation blocks.

Add tool_error_contract: 'agdf-tool-result/1' to the existing generationManifest and its digest comparison. The facade transports that generation's checked descriptor and never recalculates its business classification. Descriptor/version/shape/budget failure follows existing bounded transport-error handling and original-operation uncertainty rules. Existing old-session/operation routing, capacity, retention, teardown and runtime-publication identity checks remain intact. An incompatible old candidate fails qualification; no in-place installed cache repair or cross-version projection fallback is introduced.

Core's existing projection copies lib and hashes the runtime/core tree; include the pure helper through that existing build, with no private Cockpit import into default/Copilot runtime. Add any required export/projection assertions through existing scripts and tests; no generated source or installed cache is edited. Existing package-provenance/SDK digest checks are regenerated by their normal owner if source inputs change. No SDK dependency upgrade or release version bump is part of the design.

### UI consumption

At CockpitBridge and DecisionEntry, distinguish an actual transport/protocol exception, missing/malformed structured data, and a known domain rejection accompanying isError. For known negative results, validate envelope/session/target/snapshot or decision binding and reject successful/accepted payloads under isError; then deliver the validated negative state to the existing UI handling. Preserve the current known-code allowlist and fixed localized feedback, expanding only where this contract adds a specific supported correction. Never render raw arbitrary error.message as trusted markup or offer a generic submit/retry that could duplicate a decision.

DecisionCard receives its existing rejected/effect_unknown outcome and reason instead of a generic result_unconfirmed; its existing decision-state/receipt handling remains authoritative. Cockpit receives its existing validated failure envelope and known feedback code instead of always read_failed. Update only the existing feedback/recovery presentation needed to keep the specific cause and supported next action visible; preserve navigation, context ownership and disabled/uncertain action state. A successful blocked-state view continues through the success path unchanged. Browser tests must verify these effects; source inspection alone does not prove them.

### Files within the design boundary

Primary sources: packages/core/lib/mcp-tool-errors.js (new pure module); existing dispatch/inspect/command owner modules only where necessary to preserve typed cause/facts; packages/cli/lib/mcp-dispatch-runtime.js; packages/mcp-server/src/{server,worker-entry,worker,generation-entry,generation,generation-protocol}.js; the existing UI transport/decision/feedback owners above; plugins/agdf/meta/agdf-interaction-locales.json. Extend existing MCP README/architecture error explanation and existing interaction contract only where they describe the affected behavior; do not create a parallel policy document or registry.

Tests and build/evaluation registration use their existing suite/package/script owners, including any required package-boundary/provenance/host-compatibility snapshot updates. Specific executable tasks and test paths belong in TP, within these responsibilities. Existing baseline files stay immutable. No new daemon, network service, queue, state schema, host registration or migration is required.

## 5. Constraints And Compatibility

Public domain structuredContent, tool names, schemas, current command bindings, receipt formats and successful first content remain compatible. Intentional externally observable changes are the error flag and one explanatory text block on actual failures, more accurate existing failure cause/recovery fields, and UI preservation of those failures. Typed allowlisted causes may become more specific; tests and docs must disclose that refinement rather than promise identical old generic failure text.

Keep SDK server/client 2.0.0 and supported 2025-11-25/2026-07-28 request behavior. SDK-generated schema validation remains SDK-owned and already uses isError in the inspected version. Do not catch unknown-tool or malformed JSON-RPC outside the SDK and convert them to domain operations. Verify error domain invariants independently from SDK output validation. Do not alter exact successful decision text, approval formulas, or any allowed action based on the new flag.

Use existing locale resolution: valid supported tags use the existing pack, valid unsupported tags use the complete English fallback, invalid language inputs retain their validation rejection. Cockpit retains its existing display language/context; do not add a new language selector. Metadata carries no new authority or user information. Existing tool input, result, Cockpit, generation-message and response bounds apply to the whole result, including guidance. Overflow yields the current bounded resource-limit/unknown-effect response appropriate to the execution facts, not an increased cap.

Rollback is the existing coherent package/build version, not a mutation of installed generations. No persistent migration exists. Qualification rejects incompatible live replacement candidates; existing draining generations retain their state, route and unknown-operation protection. If a need for new authority, irreversible data change, new intake behavior, SDK migration or release rollout appears, stop and route the earliest changed source rather than expanding this design silently.

## 6. Test And Evidence Strategy

TP will turn these dimensions into a bounded executable matrix, preserving all current suites and their canonical CI ownership:

- Pure projector: every failure family and expected successful neighbor; specific cause/action/effect class; known/unknown causes; EN/DE/unsupported-language behavior; bounds and untrusted detail handling. These tests verify behavior, not a mirror of the mapping implementation.
- Real SDK/stdio: all seven regular tool families plus Cockpit/decision paths, both supported protocol eras, SDK validation and malformed/unknown-tool protocol behavior. Assert isError, public domain shape, first-block compatibility, additional correction text and success/presentation bytes.
- Execution/recovery: typed pre-dispatch parsing failure, runtime qualification, known non-dispatch busy/cancel, timeout/termination/connection loss with uncertain effects, receipt/status observation, original UUID/payload conflict, stale approvals, and no duplicate or unauthorized write. Test both worker and parent-owned paths and an actual generation handoff.
- Generation compatibility: descriptor version validation, exact producing-generation routing, rejection of incompatible candidates, bounded oversized/malformed results, unchanged old-session/operation protection and orderly teardown.
- UI: actual browser tests of validated negative envelopes and their cause/next action, successful blocked-state reports, stale decisions, uncertain submission and malformed-error fallback. Preserve session invalidation and action disabling; no native rendering claim follows from browser fixtures.
- Packaging: normal Core/runtime assembly, import boundaries including default/Copilot exclusions, package/provenance/SDK digest tests and exact packed-runtime protocol smoke. Reuse current verification planner rather than introducing a parallel CI inventory.
- Evaluation: run unchanged protocol harness/matrix and compare against the retained baseline; identify intentional isError/text-byte changes and semantic stability. Keep additional recovery/consumer scenarios separate if absent from matrix v1. Existing T6 requires an actual rejected stale write attempt; merely asking or writing nothing is not passing that test.

Native measurements require actual observed sessions with exact host/model/runtime and bounded cost if a native improvement is claimed. TP may plan them when available, but cannot replace them with protocol fixtures or mark them passed when unexecuted. QA must explicitly limit any protocol/browser-only acceptance claims. No native benchmark, latency improvement or multi-host certification is promised by this design.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Producing runtime projects existing outcomes; server emits checked error flag and correction block while retaining domain shape. | Existing Core results; pure MCP projector; server.js delivery; accountable Arndt Gold | SDD-001, SDD-002, SDD-005 | Error path now exposes isError; retain success bytes and validate both protocol eras and generating-runtime descriptor. |
| AC-002 | Project cause/action through the existing locale owner; append visible bounded text and align terminal recovery text. | Core/runtime recovery facts; mcp-dispatch-runtime.js; existing interaction locale registry | SDD-001, SDD-002, SDD-007 | Multi-block error content and locale fallback need explicit tests; first domain block remains compatible. |
| AC-003 | Typed parse/execute-stage facts survive worker/parent/generation boundaries and feed the same normalizer. | Existing runtime failure constructors, worker-entry.js, worker.js, generation-entry.js | SDD-003, SDD-004 | New specificity must not invent non-execution or forward arbitrary exception details. |
| AC-004 | Preserve original-operation recovery facts and validated UI rejection flow; no retry execution or authority in the projection. | Core command/status/receipt services; existing DecisionCard and transport consumers | SDD-004, SDD-006 | Known/unknown effect distinction and old approvals need state/receipt regression proof. |
| AC-005 | Explicit operation selectors retain successful blocked reports, idempotent success and exact decision content. | Existing dispatch/inspect/Cockpit readers and command receipts; existing UI state | SDD-001, SDD-002, SDD-006 | Avoid nested-state false errors and accepted payloads under error flags; test positive/negative neighbors. |
| AC-006 | Retain SDK-owned request behavior and domain shapes; version the internal descriptor in existing generation compatibility. | Pinned SDK, existing MCP schemas, generation manifest and package provenance | SDD-002, SDD-005 | SDK skips output checks on errors; separate domain validation and exact-package tests are mandatory. |
| AC-007 | Pure non-authorizing projection, bounded typed facts and existing locale/safety owners; no persistent error data. | Core authority and existing build/locale/access/resource owners | SDD-001, SDD-007 | No new policy store or unsafe detail exposure; preserve all current bounds and default-runtime imports. |
| AC-008 | Preserve baseline and unchanged harness, add labeled supplemental scenarios and bound claims to actual evidence. | evals/mcp-ergonomics and existing TP/QA ownership | SDD-008 | Do not manufacture improvement through changed predicates, overwritten baseline, missing scenarios or unobserved native claims. |

## 8. Risks And Open Questions

No material before_sd decision remains unresolved. The primary implementation risks are misclassifying valid reports, failing to annotate one execution seam, leaking a raw cause, a stale generation's result losing its descriptor, UI code flattening a negative envelope, and exceeding existing result bounds with additional text. The design addresses them with explicit operation selectors, one producing-runtime projection, checked typed facts/descriptors, consumer tests and complete-response budget enforcement. They remain test obligations, not accepted debt exceptions.

A precise inventory of supported operation/result variants and executable test evidence belongs to TP and post-TP analysis. If that inventory reveals a contradiction in approved classification or a required change to domain/approval meaning, stop for the existing PRD/UR revision route. No fallback authorizes suppressing an error, dropping a guard or replaying an uncertain mutation.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Classification and domain authority | before_sd | resolved | SDD-001 and SDD-004: pure projection consumes existing semantic/effect facts; no new evaluator or retry writer. | Arndt Gold |
| Wire representation and error validation | before_sd | resolved | SDD-002 and SDD-007: keep public structured result and first content, append one bounded explanation, add true error flag and explicit error-path domain validation. | Arndt Gold |
| Cause and execution-phase preservation | before_sd | resolved | SDD-003: normalize typed known causes and actual pre-dispatch facts; preserve unknown effects through existing worker/runtime catch owners. | Arndt Gold |
| Generation compatibility | before_sd | resolved | SDD-005: versioned private descriptor belongs to its producing generation, checked in the existing manifest/qualification flow, with incompatible replacement rejected. | Arndt Gold |
| UI, localization and safe detail handling | before_sd | resolved | SDD-006 and SDD-007: validate negative domain data before generic fallback, retain session guards and existing feedback/locale owners, show no raw arbitrary trace. | Arndt Gold |
| Evidence boundaries | before_sd | resolved | SDD-008: unchanged historical comparison plus labeled supplemental tests; native claims require actual native observation. | Arndt Gold |
| Exact execution matrix and command order | later_tp | deferred | TP must enumerate implementation tasks, supported operation/result cases, suite commands, scenario evidence and baseline differences within this fixed design. | Codex, accountable Arndt Gold |
| Native observation availability and cost | later_tp | deferred | TP must identify an actual available host/model and authorized bounded budget before any paid run; absent evidence forbids native improvement claims and stays explicit. | Codex, accountable Arndt Gold |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

Approval adopts the proposed design and permits Task/Test Plan drafting. Implementation remains gated by TP approval and required implementation-preparation Brownfield Analysis. No installation, VCS or publication is authorized.

## AGDF Approval Summary (de; source=en)

- Ziel: Den freigegebenen MCP-Fehlervertrag technisch umsetzen, ohne fachliche Ergebnisse, Freigaben oder sichere Wiederaufnahme zu verändern.
- Lösung: Eine reine Core-Projektion leitet Fehlerkennzeichnung und Korrekturhinweise aus vorhandenen Ergebnissen und bestätigten Ausführungsfakten ab. Der MCP-Adapter erhält bestehende strukturierte Daten und den ersten Inhaltsblock; bei echten Fehlern ergänzt er isError true und einen begrenzten Erklärungstext. Erfolgreiche Statusberichte und exakte Freigabetexte bleiben erhalten.
- Verantwortung: Core entscheidet weiterhin über Governance, Wirkung und Belege. Die bestehenden Runtime-/Worker-Eigentümer bewahren Fehlerursache und Ausführungsgrenze; MCP liefert das Ergebnis. UI-Verbraucher behalten geprüfte Fehlerdetails statt pauschaler Meldungen. Sprache bleibt im bestehenden EN/DE-Verzeichnis.
- Entscheidungen: Acht Designentscheidungen regeln reine Projektion, kompatible Übertragung, typisierte Ursachen, sichere Korrektur, generationengebundene Klassifikation, UI-Verarbeitung, begrenzte/lokalisierte Daten und unveränderte Messgrundlage. Das private Ergebnisformat wird im bestehenden Generationenmanifest versioniert; inkompatible Laufzeitkandidaten werden abgewiesen. Bei unklarer Schreibwirkung bleibt die Prüfung der ursprünglichen Operation vor jeder Wiederholung zwingend.
- Integration: Betroffen sind bestehende Core-/CLI-/MCP-Grenzen, Worker und Laufzeitgenerationen, Cockpit-/Entscheidungs-Transport und gezielte Fehlerrückmeldung. Das neue reine Hilfsmodul nutzt vorhandenen Build und Provenienz. Keine neue Fehlerdatenbank, SDK-Aktualisierung, Host-Einrichtung oder Migration.
- Abnahme: Alle acht PRD-Kriterien sind genau einmal auf Design, Eigentümer, Entscheidungen und Kompatibilitätsrisiken abgebildet. TP konkretisiert Protokoll-, Ursachen-, Wiederaufnahme-, UI-, Paket- und Vergleichstests. Erfolgreiche Nachbarfälle und Fehlerdaten werden auch dann geprüft, wenn das SDK seine Ausgabeprüfung bei isError überspringt.
- Risiken: Falsche Klassifikation, verlorene Ursachen, alte Generationen, pauschale UI-Fehler und Antwortgrenzen brauchen gezielte Regressionstests. Das ist ein Entwurf; weder Implementierung noch native Verbesserung sind nachgewiesen. Unbekannte Ursachen führen zu sicherem Stopp oder passender Diagnose, nicht zu erfundener Reparatur oder blinder Wiederholung.
- Offen: Nur ausführbare Aufgaben-/Testszenarien sowie konkrete Host-/Kostenbedingungen verbleiben bei TP mit benanntem Eigentümer. Materielle Designfragen sind im Vorschlag entschieden; native Aussagen erfordern tatsächliche Beobachtung.
- Nächster Schritt: Nach Approval: SD folgt der Task-/Testplan. Implementierung erst nach TP-Freigabe und erforderlicher Brownfield-Vorbereitung.
