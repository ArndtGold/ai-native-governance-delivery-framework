# SD: Compatible MCP capability gate and shared command contract projections

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-25
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Extend the existing Core command contract and MCP adapter, preserving all current writers, effects, tool names, runtime selection and human authority. The approved PRD is .agdf/control/artefacts/mcp-contract-completeness-20261025-01/PRD.md at sha256:2a0c4a464e97c0df1a0e72544c9c98073f98273d7e24d7ad67e3e6b85d089dfa. PRD approval operation 3b038cdc-6cbe-4cf9-bc57-35106c4f27b6 advanced the Run to revision 5bd1c5f8-15b1-4690-9785-95014c546d82. The completed Brownfield Review is a subordinate ownership/routing input.

The solution has three existing ownership paths:

1. SDK-owned STDIO framing and era negotiation -> a narrow adapter capability gate -> unchanged SDK input/handler/result path -> existing runtime/Core execution. The new gate can only deny one validated modern UI-dependent call; it cannot dispatch or approve anything.
2. One Core command field/result model -> expanded runtime validation and detailed operation help -> deterministic compact discovery schemas. The SDK validates those same derived schemas; no parallel validator, registry or effect policy is introduced.
3. Existing canonical metadata and package/version sources -> existing generated/package owners -> focused consistency assertions and accurate MCP documentation.

Implementation and candidate qualification are still future work. The stored SDK seam findings and schema probes establish bounded design feasibility only; they do not prove a working transport correction, complete input/result compatibility or a native-agent outcome.

## 2. Ownership And Source Of Truth

| Concern | Authoritative existing owner | Change and boundary |
|---|---|---|
| Command kinds/effects and input semantics | packages/core/lib/control-state/run-command-contract.js and run-command-service.js | Add shared field/help and result-shape descriptors at the contract owner; retain family execution owners and current public fields |
| Structural result checking and failure guidance | run-command-contract.js and packages/core/lib/mcp-tool-errors.js | Derive result declarations/checks from one contract; retain classifier, effect-state and bounded guidance ownership |
| SDK capability adapter | packages/mcp-server/src/server.js and ui-capability.js | One shared UI requirement predicate, public connect/Transport decorator for modern tool denial, typed resource error at the existing callback |
| Projection and postprocessing | packages/cli/lib/mcp-dispatch-runtime.js | Publish derived definitions and check postprocessed/fallback envelopes through the existing producing runtime |
| Generation and worker lifecycle | packages/mcp-server/src/generation*.js, worker.js and worker-entry.js | Preserve manifest identity, producing-runtime descriptor, original operation and confirmed-shutdown/lock ownership |
| Capability and version information | plugins/agdf/meta/agdf-mcp-capability.json, package manifests and existing build/contract checks | Reconcile the current dispatch read-only claim and obsolete MCP version prose without creating another metadata store |
| Generated/runtime package | scripts/sync-package-assets.js, scripts/core-projection.mjs, scripts/assemble-npm.mjs | Regenerate existing derived paths; never hand-edit an installed plugin, SDK or generated copy |
| Evidence | Existing Core/MCP tests and evals/mcp-ergonomics | Keep protocol, package/safety, performance and native evidence separate and candidate-bound |

The expanded command contract remains the semantic source even when discovery uses local references. Existing detailed operation-contract output remains the place for full payload-field explanations, supported source formats and operation-specific examples. Neither help nor schema publication creates approval authority.

## 3. Architecture Decisions

- SDD-001: Intercept only valid modern UI-dependent tools/call denials through a public McpServer.connect Transport decorator and use the existing resource callback for typed resource errors; rationale: the installed high-level tool callback converts thrown protocol errors to tool failures, while the public connection seam leaves SDK dispatch and validation intact; consequence: a small adapter lifecycle surface must be verified, and malformed/unknown/invalid-input traffic must still reach the SDK unchanged.
- SDD-002: Keep expanded input descriptors and descriptions at run-command-contract.js, derive deterministic local-reference discovery and detailed operation help from that same model; rationale: field semantics need one owner and repeated structures otherwise exceed discovery limits; consequence: only public schema projection is factored, while Core input validation keeps its expanded representation and no new reference interpreter or network dereference is needed.
- SDD-003: Define one full structural command-result model at the existing Core contract owner and derive a compact essential public output envelope plus runtime checks from it; rationale: supported producer/fallback variants and negative results require accurate checking even when the SDK skips isError validation; consequence: discovery describes essential outcome/binding/receipt/correction structure while the same owner's full checks retain the stronger producer invariants and detailed contracts on demand.
- SDD-004: Validate after existing runtime postprocessing and before public serialization, preserving producing-generation classification, original operation identity and current bounded fallback; rationale: schema correctness after a write is a delivery property, not permission to replay or reinterpret business effects; consequence: invalid output after handoff remains uncertain and uses existing operation-status recovery, and generation manifests bind the derived definitions.
- SDD-005: Reconcile current metadata at its existing source and assert equality against the canonical dispatch/version owner through existing tests/build projection; rationale: executable behavior and current documentation must agree without another capability registry; consequence: replace obsolete current-version claims while preserving explicitly historical facts and payload-digest/host-qualification limits.
- SDD-006: Extend the current protocol, error, generation, package, provenance, shutdown and safety scenarios against exact assembled candidates; rationale: the change crosses SDK/producer boundaries and must preserve existing checks rather than testing only direct functions; consequence: actual STDIO and effect/lifecycle evidence is required and installed or native behavior is not inferred from these suites.
- SDD-007: Use direct help for all eleven top-level fields, concise per-operation payload meaning, nested detail through existing operation-contract, local schema factoring and essential output projection without changing budgets; rationale: measured fuller discovery exceeded the limits, while the bounded projection fits and retains supported help; consequence: implementation must measure ordinary and decision-enabled compositions and cannot increase limits to mask a failure.
- SDD-008: Reuse existing MCP ergonomics fixture/transcript/verifier infrastructure for one focused real command-contract task and keep its native claims separate; rationale: correct scripted schemas alone do not show that an agent can use the interface; consequence: TP must bind host/model/candidate/task/repetitions/cost authority before execution, and missing evidence stays an acceptance gap rather than triggering an automatic paid or installed-host fallback.

## 4. Integration Points

### 4.1 Modern tool capability gate

Use a small McpServer subclass within the existing adapter that overrides only its public connect method. The serveStdio factory passes its actual SDK-owned era to this adapter instance; the subclass remains instanceof McpServer so the SDK keeps its era/codec and discovery ownership. connect delegates to super.connect with one transparent Transport decorator. Do not reassign the readonly server reference, replace private SDK handlers/maps, fork the SDK or implement another tools/call dispatcher.

The decorator has one narrow inbound rule:

1. For legacy serving, notifications, other methods and non-denial cases, forward the original message and extra context unchanged.
2. For a prospective modern tools/call denial, use exported classifyInboundRequest with the parsed body and no protocol headers, solely to require an SDK-classified valid modern request. Its HTTP method argument is the classifier's transport-neutral input, not a new HTTP transport. Any rejection, unsupported/unrecognized/legacy classification or request-shape error is forwarded to the SDK to preserve its own error behavior.
3. Find only the existing registered/enabled tool. Unknown or disabled names pass through to the SDK. Determine UI need from the same existing mode/tool requirements used by current handler/resource gating, not from host names, previous requests or clientInfo.
4. When the required MIME capability is missing, check arguments with the exact synchronous fromJsonSchema Standard Schema instance registered for that tool. Invalid arguments pass through to the original SDK input handler so its existing error behavior remains. No Core operation, worker or postprocessor runs in this check.
5. Answer only a valid missing-capability request with the typed SDK MissingRequiredClientCapabilityError, original JSON-RPC id and data.requiredCapabilities.extensions['io.modelcontextprotocol/ui'].mimeTypes containing text/html;profile=mcp-app. Send through the decorated SDK channel's normal send method so request-id/drain accounting remains owned by the SDK.

The wrapper forwards start, send/options, close, onmessage extra context, onerror, onclose and applicable optional Transport properties/methods without another queue, timer, subscription handler or state store. The installed JSON-schema provider's Standard Schema check is synchronous; unsupported asynchronous replacement is not silently accepted at this gate. Message framing, cancellation, era mismatch, malformed metadata, unknown methods and resource lookup stay with the SDK. Error-send failures use the existing out-of-band adapter error reporting; they never execute the denied request.

resources/read already reaches a protocol-error callback. For an exact known protected UI resource under a valid modern request, throw the SDK's typed missing-capability error when needed. Retain the existing legacy InvalidParams/resource_denied path. A shared pure UI requirement/capability helper in ui-capability.js serves both routes. Keep capability-dependent discovery and the ordinary agdf_prepare text fallback unchanged, including the separate non-gated Codex cockpit behavior where the existing contract permits it.

API evidence is in evidence/SD_SDK_SEAM_FINDINGS-01.md. Real STDIO correctness and lifecycle behavior are TP obligations. If the supported seam cannot meet them, return the design gap to SD; do not substitute a private SDK patch or an unapproved dispatcher.

### 4.2 Input descriptions and compact schema projection

Extend the existing command envelope/payload descriptors with one field-help model. All eleven top-level discovery properties carry direct meaningful descriptions, including binding provenance, current versus original revision/operation identity and cooperative assurance. Each supported kind has concise payload meaning. Detailed nested field applicability, source/confirmation formats and examples are exposed through the existing operation-contract projection from the same descriptors.

Build the expanded canonical schema first; Core validateRunCommand and current strict own-data input interpretation continue to consume that expanded form. Derive discovery by factoring repeated, immutable subschemas into contained local $defs/$ref nodes, eliminating unreachable definitions and retaining direct top-level descriptions. Never accept caller-supplied schema, external references or cycles; use deterministic traversal/naming and the existing SDK validator for the projected schema. Do not add local-reference handling to the Core input interpreter merely because discovery is factored. Verify projected and expanded acceptance parity on the supported valid/invalid corpus.

Detailed operation-contract may show expanded schemas/help; the definition is a derived presentation, not a second semantic source. Preserve existing flags, field meaning, supported combinations and examples. Required sets and semantic checks do not weaken to obtain smaller definitions.

### 4.3 Structural result model and validation

At run-command-contract.js, define supported structural variants from observed producers, not from an example response. Cover the full run-command-service envelope, its minimal command-schema rejection, its result-budget fallback, executor/runtime failure envelopes, and the decision postprocessor's additional fields. Keep schema_version 1 and existing domain outcomes, public fields, receipt/effect semantics and extra extension fields compatible.

The full model describes known field types, required success fields, reason requirements for rejection, original operation/recovery fields for uncertain results and the distinct allowed minimal failures. Success variants require their existing full envelope and a nullable/object receipt as actually supported; nullable receipt alone is not proof of a write. Negative minimal results cannot be forced to contain invented receipts, bindings or effect facts. Family-specific receipt/effect eligibility stays with its existing family owner; this work adds structural checks, not a second domain evaluator. Known postprocessed presentation/app fields remain supported.

Derive the public outputSchema as an essential envelope projection of that same model: type object; required schema_version, outcome and authorizes false; typed outcome, reason, operation_id, binding, receipt and recovery; conditional success requirements for the supported identity/receipt envelope and negative reason requirements. The projection intentionally omits detailed nested/family fields rather than falsely narrowing them. Full structural checks remain stronger and are exposed/documented through the existing operation-contract owner. Both declarations derive from one model with explicit projection selection, not separately maintained JSON schemas.

Extend the existing finite schemaDiagnostics implementation only for the concrete result-model constructs it needs: composition with base constraints, supported scalar/null type unions, booleans, arrays and explicit open versus strict object fields. Preserve current strict input own-data/accessor rejection and diagnostics. No general caller-configurable schema engine or new validation dependency is introduced. Local $ref compaction remains an SDK-validated discovery projection; full Core structural checking consumes the expanded result model. SDK-owned protocol/input failures keep their own envelope and are not synthesized as AGDF results.

Integrate full checks into the existing mcp-tool-errors producing/consuming structural boundary while retaining its error classifier and bounded localized descriptor. Consume only stable structural invariants for the qualified contract; never derive new eligibility, effect facts or correction policy from another generation's result. The producing runtime remains responsible for classification/guidance and its checked descriptor. Successful SDK output validation remains enabled; independent Core checks cover isError results.

### 4.4 Delivery, fallback and generation invariants

The existing ordering remains execute once -> current runtime postprocess -> project/check domain result -> consume checked descriptor -> bounded public serialization -> SDK output check. Command output checking covers the actual postprocessed domain and both normal and fallback paths. A malformed result is mapped through the existing typed tool_result_invalid failure; after handoff it cannot claim non-execution or create a replacement operation. Reuse the existing bounded runtime failure and response-limit fallback and validate that fallback too; never recurse or replay to obtain a cleaner answer.

Keep original UUID/payload, current/ historical effect reporting, pending-operation recovery, worker cancellation/deadline/termination, lock-release ownership and unqualified App decision enforcement unchanged. Do not modify a receipt, Run, approval or source to satisfy a schema. Qualification continues to bind exact tool definitions and resources in generationManifest; new declarations participate in its current digest equality checks. Preserve old producer descriptors and route original operations/presentations to their existing generation; do not admit incompatible definitions or reinterpret an old result with new business policy. No installed-runtime replacement is part of this Run.

### 4.5 Metadata and package propagation

Correct the existing capability manifest's dispatch read_only field to match the canonical SKILL_DISPATCH_FUNCTION_DEFINITION behavior. Add the consistency assertion to the existing dispatch/command contract tests, comparing source values rather than asserting a new hard-coded policy elsewhere. Keep per-tool destructive/idempotent/open-world semantics unchanged.

Replace the MCP README's obsolete assertion that current assemblies retain 0.14.5 with source/version/digest guidance that agrees with current manifests. Preserve the historical 0.14.5 distinction and the existing repository-development wording required by current documentation contracts. Inspect installation-facing MCP references and adjust only contradictory current claims; do not convert development/package evidence into native support or publication claims.

Use existing generated-asset and npm assembly commands and compare source/generated/package definitions and supported runtime profiles. Keep SDK dependencies pinned and provenance closure complete. No generated or installed file becomes a new editable authority.

## 5. Constraints And Compatibility

- The five tool names, group membership, valid existing commands, public result fields, domain effects and cooperative approval boundary are unchanged. Unknown/disabled tools, malformed metadata and invalid arguments retain SDK-owned behavior.
- 2026-07-28 is selected from the actual SDK serving/request metadata. Required capabilities are per request; optional clientInfo is neither required for this gate nor trusted as authorization. Legacy behavior is tested independently.
- Existing read-only inspection, ordinary text fallback, UI discovery and separate App-only qualification remain intact. Only operations currently requiring UI receive the new modern capability error.
- Keep the existing model/tool-error descriptor contract, original-operation recovery, budgets and generation identity checks. If a contract identity must change during implementation beyond the advertised definitions, return that material design question to SD rather than inventing a compatibility version.
- No SDK internals, raw stdio parser, additional dispatcher, metadata registry, permission store, new writer, network API, persistent cache or dependency installation is introduced.
- Existing per-command definition limit 8192 bytes, combined command/decision-action limit 24576 bytes, input limit 65536 bytes, result limit 1048576 bytes and current fixed-fixture performance thresholds remain unchanged. Definition/HTML resources and model text are measured in their existing distinct budgets.

## 6. Test And Evidence Strategy

TP must map every criterion and associated SDD to concrete scenarios using current owners. Use actual STDIO for both protocol eras and include first modern call, discovery/probe fallback and request-local capability alternation on one connection. Assert the exact code/data and zero protected execution for modern denials. Cover missing versus malformed metadata, invalid arguments, unknown/disabled tools, supported MIME capability, wrong MIME declaration, exact resource lookup, legacy denial and non-UI text fallback.

Preserve SDK validation by testing that malformed input never reaches the executor, successful malformed output cannot escape, and independent Core checks also reject malformed negative/adapter results. Include all five command families and every supported normal/minimal/budget/executor/postprocessed variant. Check actual public-schema validity, expanded/compact input acceptance parity, bounded errors, no repeated effect and original-operation observation after uncertain delivery.

Run relevant existing Core command/error, MCP protocol/error/gating/decision, generation, package, provenance, safety, lock and shutdown suites. The new decorator requires callback forwarding, send error, close/drain, cancellation and no-double-response coverage; no weakened or skipped assertions may conceal a new seam failure. Verify canonical generation manifests and current source/generated/package projections. Recheck source reuse and the exact SDK seam in implementation-preparation Brownfield Analysis after TP approval.

Measure each discovered definition, ordinary aggregate and decision-action aggregate. Run the unchanged 20-sample fixed-fixture cold-tools-list and warm-dispatch p95 tests against the same exact assembled candidate, recording Node/OS/fixture/candidate. These are synthetic local budgets, not native agent timing.

For native evidence, reuse the current ergonomics fixtures, cleaned transcripts and deterministic verifier conventions. One focused existing command task must require interface discovery and authoritative binding retrieval without injected missing technical arguments or an AGDF CLI detour. Preserve all failed attempts and original baselines. TP binds available host/model/version, candidate digests, exact task/verifier, repetitions, stopping rules and current spend authority before execution. Unavailable evidence stays open; there is no automatic host install, credential handling, paid fallback or claim of broad host/full-protocol qualification.

Nonshipping evidence retained here: SD_SCHEMA_FEASIBILITY-01.json through -03.json exceeded one or both limits and remain failed design alternatives. SD_SCHEMA_FEASIBILITY-04.json measures the chosen top-level/payload/on-demand/projection approach at 22047 bytes for five command definitions and 23213 including the existing 1166-byte decision-action definition; each command is below 8192 and the aggregate is below 24576. SDK schema construction and empty-input rejection succeeded. This does not guarantee final implementation size, complete parity or runtime correctness; all final budgets remain acceptance obligations.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Modern connect decorator and typed resource callback share request-local UI requirement and SDK validation; deny before effects through original channel | server.js, ui-capability.js, public SDK Transport/classifier/error APIs | SDD-001 | Preserve malformed/input/unknown-tool precedence and legacy channel by passing all non-denial cases to SDK |
| AC-002 | Keep SDK registration/codec and existing effects, text/UI and producing-runtime paths; derive equivalent input/output projections | Existing server, Core command and runtime composition owners | SDD-001, SDD-002, SDD-003, SDD-004 | Actual dual-era positive/negative regressions and full legitimate result-variant coverage |
| AC-003 | One expanded Core help model supplies direct envelope help, per-operation payload meaning, local-reference discovery and detailed operation help | run-command-contract.js and existing operation-contract projection | SDD-002, SDD-007 | Top-level descriptions remain direct; full nested meaning remains supported on demand; no accepted-input broadening |
| AC-004 | Full expanded result model drives Core checks and bounded public schema projection, including postprocessing/fallback and negative results | run-command-contract.js, mcp-tool-errors.js, mcp-dispatch-runtime.js | SDD-003, SDD-004 | Preserve minimal negative variants and SDK errors; no fabricated success, receipt or replay after output failure |
| AC-005 | Reconcile manifest and MCP prose with canonical current behavior/version and assert via existing contracts/builds | Canonical manifest, dispatch definition, package manifests and existing documentation checks | SDD-005 | Keep historical/development and payload/native qualification distinctions |
| AC-006 | Retain all existing execution, approval/recovery, generation and confirmed-shutdown owners and verify actual effects | Core family owners, worker/generation code and existing safety tests | SDD-004, SDD-006 | New transport gate has no effect capability; incompatible generation definitions remain inadmissible |
| AC-007 | Deterministic factoring and projection plus unchanged definition/response/performance assertions for ordinary and decision compositions | RUN_COMMAND_LIMITS, existing response limits, generation manifest and performance test | SDD-002, SDD-003, SDD-006, SDD-007 | Probe sizes are feasibility only; final candidate must pass existing limits without threshold changes |
| AC-008 | Existing fixture/transcript/metric infrastructure with a focused native command-task/verifier extension where needed | evals/mcp-ergonomics and approved TP evidence configuration | SDD-008 | No CLI detour, injected missing arguments, lost failed attempts, unapproved spend or cross-environment improvement claim |

## 8. Risks And Open Questions

The chosen adapter adds one transport decorator, so its callback/lifecycle behavior needs explicit regression evidence. The inspected public API supports the seam; no private hook fallback is accepted. Core result checks must distinguish legitimate minimal failures from invalid success and preserve open nested family material; schema tightening based on a sample would be a defect. Compact and expanded input acceptance must remain equivalent.

Definition headroom is limited and actual generated/profile definitions may add metadata beyond the feasibility probe. Final compositions and unchanged timing limits remain hard gates. Descriptor and error policy stay producer-owned across generations; output validation must not create replay, policy or rollback assumptions. No technical debt is knowingly accepted here: if these conditions cannot be met, record the exact design/implementation/evidence gap and use its existing owner before requesting readiness.

Only task execution details remain deferred below. The host/model availability, task/verifier, repetitions, measurement isolation and authorized cost/stopping conditions are TP-owned and do not waive native acceptance or authorize spending now. User gate decisions, predecessor UAT, rollout and publication remain outside this design's authority.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| SDK capability interception seam | before_sd | resolved | Use only public McpServer.connect plus a transparent Transport decorator for modern tool denial and the existing typed resource callback; preserve SDK framing/handlers/validation/codec and legacy traffic; no private hook or second dispatcher | Codex sd-definition |
| Shared capability policy and input precedence | before_sd | resolved | Existing mode/tool requirement and MIME predicate are the sole policy; SDK classifier plus exact registered Standard Schema establish denial eligibility; unknown/disabled/invalid traffic passes unchanged | Codex sd-definition |
| Single input/help source and local factoring | before_sd | resolved | Expanded Core descriptors drive runtime validation and help; compact deterministic local-reference discovery is SDK-validated, with direct eleven-field help and per-operation payload meaning; nested detail stays in existing operation-contract | Codex sd-definition |
| Result model, schema projection and error-result checking | before_sd | resolved | One expanded structural result model at the current Core contract owner drives full checks and essential public schema; support normal/minimal/fallback/postprocessed variants and preserve SDK-owned errors, producing descriptors and effect uncertainty | Codex sd-definition |
| Budgets and retained alternatives | before_sd | resolved | Keep current limits; use the bounded -04 feasibility approach and retain failed -01 through -03 evidence; final candidate measurements determine acceptance without enlarging thresholds | Codex sd-definition |
| Metadata and documentation propagation | before_sd | resolved | Correct canonical existing metadata/prose and assert against current dispatch/version owners; regenerate existing derived paths, retain historical claims and avoid new registry/support claims | Codex sd-definition |
| Lifecycle, safety and generation compatibility | before_sd | resolved | Preserve current owners and manifest equality; add denial/decorator tests and result-variant/single-effect regressions; no replay, installed replacement or new authority | Codex sd-definition |
| Exact task/scenario inventory and runtime commands | later_tp | deferred | Bind all criterion/SDD mappings to existing suites plus focused new cases after implementation-path review; scope remains the approved criteria and decisions | Codex tp-definition |
| Native evaluation configuration | later_tp | deferred | Select available host/model/version, exact task/verifier/candidate, repetitions, stopping rules and existing cost authority before execution; unavailable evidence remains open and any additional authority is requested explicitly | Codex tp-definition |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

After approval, prepare the Task/Test Plan with complete criterion and design-decision traceability. Product implementation remains forbidden until TP approval and the required implementation-preparation Brownfield Analysis.

## AGDF Approval Summary (de; source=en)

- Ziel: Die freigegebenen MCP-Anforderungen werden über bestehende Core- und SDK-Eigentümer umgesetzt, ohne neue Befehle, Rechte oder Freigabeautorität.
- Lösung: Eine schmale Prüfung am öffentlichen SDK-Transportanschluss weist gültige moderne UI-Aufrufe bei fehlender benötigter Capability mit -32021 ab. Ressourcen verwenden ihren bestehenden Protokollfehlerpfad. Framing, Eingabeprüfung, Ausführung und Legacy-Verhalten bleiben beim SDK beziehungsweise den bisherigen Eigentümern.
- Verträge: Ein gemeinsames Core-Modell liefert vollständige strukturelle Ergebnisprüfung und eine kompakte öffentliche Ausgabehülle. Alle elf Eingabefelder und die Bedeutung jeder Payload stehen in Discovery; verschachtelte Detailhilfe bleibt über operation-contract erreichbar. Lokale Schema-Referenzen verkürzen nur die abgeleitete Discovery-Fassung; Core prüft weiter die expandierte Darstellung.
- Grenzen: Auch negative und nachbearbeitete Ergebnisse sowie Fallbacks werden berücksichtigt. Fehler nach Ausführung beweisen kein Rollback und lösen keine Wiederholung aus; ursprüngliche UUID, Belege, Produzentenbeschreibung, Generation und sichere Beendigung bleiben maßgeblich. Keine privaten SDK-Eingriffe, zweite Registry, Installation, Veröffentlichung, UI-Änderung oder vorgezogene Umsetzung.
- Entscheidungen: SDK-Anschluss, gemeinsame Capability-Regel, Vertragsmodell, Projektion, Metadatenabgleich und Schutzgrenzen sind entschieden. TP bindet noch konkrete Szenarien, Host/Modell, Kandidat, Wiederholungen und zulässige Ausführungsgrenzen. Zusätzliche Kosten oder Installationen sind nicht freigegeben.
- Machbarkeit: Frühere vollständiger eingebettete Entwürfe überschritten die Limits und bleiben als Gegenbeleg erhalten. Der gewählte nicht produktive Schema-Probeentwurf liegt bei 22047 Byte für die fünf Befehle und 23213 Byte einschließlich Decision-Aktion unter 24576 Byte; jedes Werkzeug bleibt unter 8192 Byte. Das ist ein Designnachweis, noch kein Implementierungs-, Kompatibilitäts- oder Agentennachweis.
- Nachweise und Risiken: Echte STDIO-Tests müssen Fehlercode, Capability-Daten, Eingabepriorität und ausbleibende Ausführung sowie beide Protokollversionen belegen. Hinzu kommen Ergebnisvarianten, Einmalausführung, Generation, Sicherheit, Paketprojektion, unveränderte Größen-/Leistungsbudgets und ein begrenzter echter Agententest. Der neue Transportanschluss und die Schema-Parität benötigen besondere Regressionstests; fehlende Nachweise bleiben offen.
- Nächster Schritt: Nach Approval: SD folgt der Task-/Testplan. Erst nach dessen Freigabe und der erforderlichen Brownfield-Vorbereitung darf implementiert werden.
