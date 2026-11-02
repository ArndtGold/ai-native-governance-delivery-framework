# SD: Self-describing inspection with safe presentation discovery

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-20
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Extend the existing Core inspection contract and immutable-presentation owner. The MCP server remains a validated transport adapter. No tool, operation, generic file API, presentation writer or new approval authority is introduced.

The approved PRD is `.agdf/control/artefacts/mcp-inspect-contract-phase2-20261020-01/PRD.md`, digest `sha256:4145fc0cbacc1476bd6902ec22b1dff793fe6a90358f44d2dfa706bd3265ac88`. Its eight criteria remain the sole acceptance source. UR, Brownfield Review and this conversation's naming decision supply context, not replacement acceptance.

The read flow is:

1. With a confirmed target/run, use existing `agdf_inspect` `gate-check` to obtain the current run revision. Preserve an exact presentation binding genuinely available in conversation instead of rediscovering or replacing it.
2. Read `operation-contract` with module `agdf_prepare/presentation.prepare`, the current revision and confirmed target/run. Its existing binding/contract result gains read-only `inspect_contract` help and a bounded `presentation_catalog` of already prepared records. No preparation is executed.
3. Zero eligible records yields explicit absence; one validated record in a complete catalog may be used; several matching records require selection. A partial/unavailable catalog cannot establish uniqueness or absence. An existing optional gate qualifier narrows the catalog only when justified by the request. Never sort/select by newest timestamp.
4. Copy the exact document-read arguments from the selected record and call existing `presentation-document`. Follow every document cursor and retain content identity, ordered ranges and applicability until complete.

The catalog is metadata about existing prepared records. It never asserts human visibility, adoption or approval. The outer operation-contract binding uses the current run revision; each document-read binding retains its original presentation revision. These values are labeled distinctly.

## 2. Ownership And Source Of Truth

| Concern | Existing authoritative owner | Change boundary |
|---|---|---|
| Inspect name, parameters, operation applicability and validation | packages/core/lib/control-inspect/contract.js; selection.js | One declarative parameter/operation definition derives descriptions, schema guards, normalization checks and on-demand examples. No adapter-local policy. |
| Inspection orchestration | packages/core/lib/control-inspect/service.js | Add help/catalog to the existing preparation operation-contract response; gate policy and ordinary gate-check results remain unchanged. |
| Prepared-record validation, containment, immutable document and cursors | packages/core/lib/control-state/run-presentation.js; run-presentation-envelope.js | Extend this existing domain owner with bounded catalog reading and reuse the existing envelope/document validators. No second filesystem reader. |
| Exact run/target and current-state binding | Existing run-state, seal and command-target owners | Reuse current validation and reject stale or invalid discovery bindings. |
| Error interpretation | packages/core/lib/mcp-tool-errors.js and existing inspection recovery | Preserve Phase 1 cause/effect/recovery ownership. Expected absence/ambiguity is a successful read status, not a fabricated execution error. |
| Public SDK delivery | packages/cli/lib/mcp-dispatch-runtime.js; packages/mcp-server/src/server.js | Consume the Core definition and results; retain SDK input validation and successful-output validation. |
| Generated payload and inventory | scripts/sync-package-assets.js; existing Copilot projection/inventory/payload owners | Deterministic projection and narrowly scoped JSON compaction; no cap increase or second build path. |
| Measurements and native task | evals/mcp-ergonomics/; existing Claude session adapter | Retain original T4 and baseline; add separately identified strict trace/content evidence in the same evaluation component. |

## 3. Architecture Decisions

- SDD-001: Keep one Core-owned declarative parameter/operation model and existing public names; rationale: fourteen undocumented parameters and duplicated guards must not become parallel documentation/validation policies; consequence: derive the published schema, concise descriptions, detailed usage and valid examples from the same owner while preserving supported legacy input semantics.
- SDD-002: Keep a model-visible inspect definition at or below 5000 bytes using concise meaningful per-field descriptions, exact schema factoring and on-demand detail; rationale: the current definition measures 4723 bytes, leaving only 277; consequence: no output-schema deletion, weakened input checks, raised limit or hidden mandatory field is a budget escape.
- SDD-003: Extend the existing preparation operation-contract result with read-only help and prepared-record discovery; rationale: this already supplies the exact current target/run/revision binding and permits an optional gate qualifier; consequence: ordinary gate-check/CLI parity remains intact and the five command tools do not change.
- SDD-004: Read and page catalogs through the existing presentation owner with exact current binding and no automatic recency selection; rationale: identifiers must come from legitimate contained records, not inferred filenames or fixture secrets; consequence: explicit none/unique/ambiguous/incomplete/unavailable states, bounded work, stateless bound continuation and no directory writes.
- SDD-005: Retain readPresentationDocument and its original record-bound UTF-8 cursor as the only document reader; rationale: frozen bytes, historical applicability and identity already have an owner; consequence: discovering or reading never creates a replacement presentation and document cursors cannot be reused as catalog cursors.
- SDD-006: Reuse existing Phase 1 projection and distinguish requested operation failures from successful catalog status; rationale: missing/multiple records are information, while invalid read arguments/access/identity must keep actionable errors; consequence: a catalog warning cannot silently replace or invalidate a successfully read operation contract, and no catalog state grants permission.
- SDD-007: Propagate through existing Core/CLI/MCP generation and the real SDK in both protocol eras; rationale: source JSON alone does not prove discovered schemas or installed-package behavior; consequence: retain public tool names, existing output schemas and valid call meanings, with only the explicitly designed additive discovery/cursor behavior.
- SDD-008: Offset payload growth with value-preserving compaction of the existing generated Copilot skills locale JSON projection; rationale: the current exact profile limit has no spare files/bytes; consequence: source locale text remains unchanged, inventory declares JSON compaction rather than copy, semantic equality is checked, file count does not grow and final exact payload stays at or below 395 files/3442564 bytes.
- SDD-009: Preserve original task/verifier/baseline semantics and supplement them with strict trace and ordered-byte evidence; rationale: original T4 counts distinct offsets/completion but does not prove the entire approved claim; consequence: original metrics and the additional stricter qualification are reported separately, without a second acceptance register.
- SDD-010: Require actual isolated native execution with explicit candidate/environment/repetitions/cost binding in TP; rationale: binary availability and scripted protocol success are not agent evidence; consequence: no paid execution, installation, general host claim or mandatory-evidence waiver follows from this design.

## Parameter and schema model

The canonical model must cover all existing fields and operations. Preserve each field's existing type, enum, format, bounds and unknown-property rejection. Descriptions explain purpose/applicability; bound fields identify the existing source and original/current distinction. The discovery description gives the gate-check -> operation-contract -> document route and the exact module name. `inspect_contract` supplies the detailed operation/required-field matrix and valid example arguments using typed illustrative values, clearly not executable authorization. Examples are validated against the same derived schema/normalizer.

Repeated identical schema fragments may use local `$defs`/`$ref` and shared construction constants; factoring must preserve accepted values and SDK rejection behavior. A compact discovery envelope already exists for output; retain its current validation semantics rather than remove it to gain room. The rich internal output contract and Core result validation remain authoritative.

The only new accepted selector combination is an optional existing `cursor` on `operation-contract` for module `agdf_prepare/presentation.prepare`, to continue that catalog. That operation already requires explicit target/run/current revision. Other modules still reject catalog cursors, and document/preview cursors retain their existing meaning. No new operation, argument name or required envelope field is added. A compatibility fixture identifies this intentional additive combination separately from unchanged legacy negative cases.

## Discovery projection and continuation

For `operation-contract` module `agdf_prepare/presentation.prepare`, return the existing report unchanged in meaning and add:

- `inspect_contract`: schema/usage version, field meanings/applicability/provenance, operation requirements and validated examples derived from the Core model.
- `presentation_catalog`: `schema_version: "1"`, `authorizes: false`, current target/run/revision binding, optional requested gate, state, page completeness, bounded counts, candidates, continuation and safe status/reason fields.

Each candidate contains only a validated presentation ID, gate, original revision, document identity/language/byte count, prepared-record status and current/historical/unknown applicability. Include exact `read_arguments` for the first `presentation-document` call, preserving the caller's confirmed target provenance and language. Do not expose arbitrary filesystem paths, raw envelope text, approval secrets or a claim that a human saw a record. Distinguishing metadata is sufficient for selection; document content remains owned by the actual reader.

The catalog validates the selected current run's seal/revision and the contained presentations directory. Reuse checkedRunDirectory, directory/file identity checks, bounded no-follow reads and validateRunPresentationEnvelope/validateRunPresentationRecord in the presentation owner. Only correctly named UUID record files are candidates; snapshots and unrelated file extensions are not enumerated as documents. Validate record schema, digest and matching run/gate/original revision before exposing a read binding; validate the associated document snapshot through the same existing owner. A corrupt/foreign/symlinked or changing candidate cannot become a guessed valid record. Ambiguous validation leaves catalog availability/uniqueness unconfirmed with a concrete reason.

Use deterministic UUID ordering solely for pagination, never as selection authority. Bound a page to 16 candidates, a complete catalog scan to 256 candidate record files and combined record bytes to 1 MiB; per-record and document limits remain the existing limits. A scan/directory/byte limit yields explicit unavailability or incompleteness, never false none/unique. Direct exact reads retain their existing supported bounds. Those operational limits must be visible in the returned help and tested at the boundary.

A catalog cursor uses the existing bounded cursor syntax but a distinct domain-separated digest. Bind it to target identity, run, current revision, module, requested gate and the complete validated candidate-set identity, plus an offset. Recompute the snapshot on each page; changed membership, candidate digest, filter or run binding invalidates the cursor and asks for a new first catalog page. No process-global cache, durable index, hidden session handle or new state file is introduced. Compare directory/run identity before and after collection; a changed observation cannot establish a unique record.

`unique` requires a complete valid scan with exactly one match, even if only one row happens to appear on a partial page. `none` requires a complete valid zero-match scan. More than one match is ambiguous regardless of timestamp. Explicitly selected historical records remain available under their original validated binding with historical applicability; no current decision is inferred from that read.

## 4. Integration Points

Core contract/selection normalization passes the catalog continuation only to the preparation operation-contract read. The existing inspection service attaches metadata to that response after successful current binding validation; it does not alter evaluateGateCheck, gate transitions, approval presentation generation or command execution. Original operation-contract schema, owner/effects and command payload remain accessible.

MCP and the worker consume the Core model and results. SDK validation still runs before a handler and validates successful output. The expanded report fits the existing open report object; no new required output-envelope member is introduced. Phase 1 projection consumes genuine domain failures as before. Catalog absence/ambiguity remains a non-authorizing successful observation; damaged/unavailable catalog state is explicitly reported and cannot support a completed document task.

Examples and detailed help are derived data inside the existing operation-contract path. No new runtime-contract module/file, help tool, schema registry or manual mirror is created. Existing host-generated assets and assembled npm/plugin payloads are built through their usual owners.

## 5. Constraints And Compatibility

The following remain protected: agdf_* names; existing operation enum; all previously valid calls and their meaning; stable original document identity; strict existing types/bounds/target checks; current/historical labeling; read-only control state; ordinary blocked-read behavior; Phase 1 errors; explicit human approvals; both SDK protocol eras. Unknown fields/unsupported combinations remain rejected. The new catalog cursor combination is explicitly additive and cannot alter the document-cursor branch.

No data migration or persistent schema change occurs. Rollback is a local source/generated-projection revert; prepared records and their bytes remain usable through existing explicit read bindings. No deployment, runtime replacement or installed-host switch is part of this run.

Budget treatment is binding, not a later permission to raise limits. The exact discovered definition must stay <=5000 bytes with output validation retained. The existing profile cap is 395 files and 3442564 bytes. A read-only calculation found the source locale JSON at 172459 bytes and equivalent compact JSON plus newline at 155379 bytes: 17080 bytes of potential savings in one existing projection. Apply compaction only in the existing generated Copilot skills locale asset; do not change canonical translations, parsed values, other profiles or arbitrary source formatting. Update the existing inventory's rule/evidence for that transformation and test parsed equality. Final generation must measure actual totals; any exact re-recorded baseline must be no larger than the old cap and must contain no speculative spare headroom.

If factoring/compaction cannot satisfy the measured budgets without semantic loss, stop at SD revision rather than delete validation, weaken checks, silently change acceptance or start unrelated packaging work. Measurements here establish the baseline/opportunity, not an already implemented result.

## 6. Test And Evidence Strategy

TP must map the following to executable scenarios and actual retained evidence:

- Discovery/validation: every parameter's semantic description and source, operation matrix, valid examples, unchanged valid/invalid legacy cases, and the single added catalog cursor combination. Measure the full tool definition as actually listed by the pinned SDK; exercise local refs/factored fragments through both protocol eras, not merely standalone Ajv.
- Catalog: zero, one, multiple, several gates, explicit filters, historical records, duplicate-looking records, corrupt/foreign/symlinked records, missing snapshots, changed directory/run, paging across at least two pages and each resource limit. Prove no automatic recency selection and no false uniqueness/absence on a partial observation.
- Cursor isolation: changed target/run/revision/module/gate/snapshot invalidates a catalog cursor; catalog/document/preview cursors cannot be interchanged. Existing explicit historical document reads remain valid where the reader already permits them.
- Complete reading: multi-page UTF-8 with a split boundary, exact ordered byte reconstruction, stable digest, no omitted/repeated/reordered page and correct final completion. Preserve no-control-write snapshots and Phase 1 success/failure behavior.
- Propagation: source, generated Core/CLI/MCP definitions and actual npm archives; unchanged names and ordinary CLI gate-check parity; SDK input/output checks; canonical boundaries/build/evals/compatibility; exact payload inventory and parsed locale equality after the one selected projection is compacted.
- Native: unchanged original T4 prompt/fixture, genuine model-visible discovery with no expected IDs injected, isolated existing Claude harness variants and actual trace/content proof. Audit any shell command and direct control-file Read/Glob/Grep/helper access, not just successful MCP calls. The existing mcp_only allowlist includes Read, so its label alone proves nothing. Cross-reference recorded calls with the exact fixture snapshot and selected original presentation. Unknown/truncated trace evidence stays not-verifiable.
- Evaluation: retain original task set, original verifier results and historical baseline unchanged; separately report stricter no-detour/order/digest checks and any new protocol scenarios. Record candidate/source/SDK/package identity, OS/host/model versions, repetitions, task/verifier identity, calls, invalid calls, response/token metrics and costs/unknowns. Different cohorts do not become a same-environment improvement claim.

No native session is executed during SD authoring. TP names the actual supported environment, availability proof, repetitions and a concrete cost ceiling/authorization boundary; lack of required actual native proof remains an acceptance gap, never a scripted substitute.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Derive concise discovery descriptions and complete on-demand operation/parameter usage and examples from one model. | Core control-inspect/contract.js and selection.js | SDD-001, SDD-002 | Factored schemas and concise text require actual SDK and semantic description checks. |
| AC-002 | Existing preparation operation-contract exposes contained prepared-record metadata with explicit none/unique/ambiguous/incomplete states. | Core control-inspect/service.js and run-presentation.js | SDD-003, SDD-004 | No recency selection, snapshot substitution or hidden expected-ID injection; catalog limits are explicit. |
| AC-003 | Reuse the original immutable document reader and verify ordered exact bytes and completion. | Core run-presentation.js readPresentationDocument | SDD-005 | Preserve original revision, UTF-8 boundaries and record-bound cursor; reject mixed identities. |
| AC-004 | Preserve Core containment/current-state checks, historical reads and Phase 1 error projection. | Core presentation/selection/seal and mcp-tool-errors owners | SDD-004, SDD-005, SDD-006 | Metadata availability is non-authorizing; invalid reads cannot become successes or false current approvals. |
| AC-005 | Actual existing native task plus independently checked trace/content evidence. | Existing ergonomics runner/native-tasks and exact presentation snapshot | SDD-009, SDD-010 | Protocol scripts or hidden control-file lookups cannot satisfy native completion. |
| AC-006 | Retain original T4/baseline and report additional strict evidence and cohort differences separately. | evals/mcp-ergonomics versioned task, metrics and compare owners | SDD-009 | Do not silently strengthen historical scoring or label unlike environments comparable. |
| AC-007 | Preserve public contracts and real SDK output validation; reuse generation and one value-preserving payload transformation within old caps. | Core contract, SDK adapter, existing generation/inventory/payload owners | SDD-001, SDD-002, SDD-007, SDD-008 | Explicit additive catalog cursor only; exact size, equality and package checks must prove compatibility. |
| AC-008 | Bind actual execution and budget in TP; retain missing native evidence as unfulfilled. | TP and existing native harness/QA owners | SDD-010 | No approval-derived spending, installation or generic host qualification. |

## 8. Risks And Open Questions

Material design choices are resolved above; implementation feasibility is not claimed as tested. TP must bind actual scenario commands, environment/repetitions/cost authorization and evidence paths. The 5000-byte schema target and budget-neutral propagation are hard checks; inability to achieve them returns to this design owner. No broad fallback, second contract store, process cache or accepted permanent debt is introduced.

Catalog reads are bounded observations under existing filesystem/run protections, not a new security sandbox. Parent/file replacement, corrupt records and incomplete scans must fail safely and visibly. Native evidence may remain unavailable on this host; that blocks clean qualification rather than lowering the requirement. The exact same historical environment is not assumed to exist locally.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Canonical contract and names | before_sd | resolved | One Core model derives usage/schema/normalization; preserve agdf_* names and every legacy valid call. | Core inspection maintainer |
| Discovery size and validation | before_sd | resolved | Concise meaningful descriptions, exact schema factoring and on-demand detail; <=5000 bytes with SDK input/output checks retained. | Core/MCP maintainers |
| Binding discovery route | before_sd | resolved | Add help/catalog only to existing preparation operation-contract; ordinary gate-check and command tools stay unchanged. | Core inspection maintainer |
| Catalog state, bounds and continuation | before_sd | resolved | Presentation owner validates records; 16-row pages, 256-record/1-MiB scan bounds, domain-separated snapshot cursor; partial/invalid observations cannot select uniquely. | Core presentation maintainer |
| Document identity and historical reads | before_sd | resolved | Original immutable reader/binding/cursor retained, with explicit current/historical/unknown applicability. | Core presentation maintainer |
| Failure semantics | before_sd | resolved | Existing Phase 1 owner interprets real errors; absence/ambiguity is successful non-authorizing status; unavailable metadata remains visible. | Core error-contract maintainer |
| Compatibility and propagation | before_sd | resolved | Existing generation, actual package and both SDK eras; only explicitly specified optional catalog cursor added. | CLI/MCP maintainers |
| Payload cap | before_sd | resolved | Compact one existing generated Copilot locale projection without value changes; declare inventory transformation and keep final exact totals within old caps. | Existing build/payload owner |
| Evaluation identity | before_sd | resolved | Original task/verifier/baseline retained; strict trace and ordered-byte checks separately identified in the same eval component. | MCP ergonomics maintainer |
| Native execution plan | later_tp | open | Bind actual host/model availability, repetitions, isolation, concrete cost ceiling and applicable execution authorization before any session. This defers execution parameters, not the mandatory native acceptance. | tp-definition / Arndt Gold |

## 9. Next Step

Approve this exact solution design only with:

`Approval: SD`

Approval permits Task/Test Plan drafting. It does not authorize implementation, paid native execution, installation or release. After TP approval, required implementation-preparation Brownfield Analysis still precedes code changes.

## AGDF Approval Summary (de; source=en)

- Ziel: Verständliche MCP-Leseaufrufe und der vollständige Abruf genau der vorhandenen Dokumentfassung; Namen und Freigabegrenzen bleiben erhalten.
- Lösung: Core bleibt alleiniger Eigentümer. Ein gemeinsames Parametermodell liefert Schema, Prüfung, knappe Beschreibungen und ausführliche Beispiele auf Abruf. Die Werkzeugdefinition bleibt höchstens 5.000 Bytes groß; SDK-Ein-/Ausgabeprüfung wird nicht entfernt.
- Bindungsweg: `gate-check` liefert die aktuelle Run-Revision. Die bestehende Operation `operation-contract` mit `agdf_prepare/presentation.prepare` liefert zusätzlich Hilfe und vorhandene Präsentationsbindungen, ohne eine Präsentation zu erzeugen.
- Auswahl: Vollständig bestätigter Einzel-Treffer, klare Abwesenheit oder Auswahl bei mehreren Treffern. Keine Auswahl nach Aktualität. Der Katalog ist seitenweise und revisionsgebunden; 16 Einträge pro Seite, höchstens 256 Kandidaten und 1 MiB geprüfte Record-Daten pro Scan. Grenzen, Schäden und unvollständige Beobachtungen werden ausdrücklich gemeldet.
- Lesen: Der bestehende Dokumentleser behält eingefrorene Bytes, ursprüngliche Revision, historische Einordnung und UTF-8-sichere Folgeseiten. Katalog- und Dokumentcursor sind getrennt gebunden. Lesen schreibt keinen Kontrollzustand.
- Kompatibilität und Budgets: Bestehende Werkzeuge, Operationen und gültige Aufrufe bleiben erhalten. Nur ein optionaler Katalogcursor in der genannten Vertragsabfrage kommt hinzu. Eine vorhandene generierte Copilot-Locale-Datei wird wertgleich kompakt projiziert; keine Übersetzungsänderung, neue Datei oder Erhöhung der bisherigen Payload-Grenzen. Die berechnete mögliche Einsparung beträgt 17.080 Bytes; das fertige Paket muss später tatsächlich gemessen werden.
- Nachweis: Originale Baseline und T4-Wertung bleiben unverändert. Zusätzliche Prüfungen belegen richtige Reihenfolge, exakte Dokumentbytes und keine Shell-/Kontrolldatei-Ausweichwege. Ein echter isolierter Agentenlauf bleibt zwingend; Skript- und CI-Erfolg ersetzen ihn nicht.
- Risiken und spätere Planung: Die tatsächliche SDK-Darstellung, das Definitionsbudget und das fertige Paket sind noch nicht implementiert oder getestet. TP bindet Umgebung, Wiederholungen, Isolation und konkreten Kostenrahmen vor Ausführung. Fehlender nativer Nachweis bleibt eine offene Abnahmeverpflichtung.
- Entscheidungen und nächster Schritt: Technische Eigentümer, Bindungsweg, Mehrdeutigkeit, Grenzen, Kompatibilität und Messmethode sind festgelegt. Nach `Approval: SD` folgt der Task-/Testplan; Implementierung, kostenpflichtige Läufe, Installation und Veröffentlichung sind noch nicht erlaubt.
