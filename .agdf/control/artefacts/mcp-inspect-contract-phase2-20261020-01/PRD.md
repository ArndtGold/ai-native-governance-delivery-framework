# PRD: Understandable MCP inspection and exact document reading

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-20
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Make the existing `agdf_inspect` contract understandable and sufficient for an agent to discover the supported read path and show the complete exact requested gate document through MCP. Improve parameter meaning, operation requirements, identifier provenance and valid examples. Keep `agdf_inspect` and the existing `agdf_*` names stable.

The approved UR is `.agdf/control/artefacts/mcp-inspect-contract-phase2-20261020-01/UR.md`, digest `sha256:fcadee95155c635a321d722ade76c2e2acafb5fd5a4c03e37491345b55808307`. Brownfield Review selected `structured_delivery` for external-contract compatibility decisions. The scope remains this one inspection/document outcome; it does not include the five command tools.

The current implementation has fourteen inspect parameters without individual descriptions and a 4,723-byte definition against the existing 5,000-byte limit. The product change must remain within that limit. Exact representation and propagation belong to SD, not a second documentation or validation authority.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: Directly defined low-impact agent-facing read semantics, supported by BROWNFIELD_REVIEW.md. Existing document presentation, approval and working modes stay intact; no separate UX analysis or preview is required.
- primary_user_intent: Ask to see the exact gate document in full without knowing technical binding identifiers or opening repository control files.
- success_signal: An actual agent obtains legitimate binding information through MCP and returns every ordered page of the exact immutable document, without manually supplied missing identifiers, shell detours or direct control-file reads.
- primary_decision_or_action: Read the uniquely identified existing document, or ask for selection when the request leaves more than one candidate. Reading and selecting a record do not approve a gate.

The user can judge the behavior through the retained task transcript and exact document-completeness evidence. No interactive preview was requested. A prepared record is described as prepared; its existence is not proof that a person previously viewed or approved it.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Tool discovery | Existing inspect operations and argument contract are available | Parameter meaning, applicability, provenance and valid examples | Canonical Core inspection contract | MCP discovery presented to the agent |
| Presentation identification | Existing records match an explicitly selected target and run, with any genuinely supplied gate/revision/presentation constraints | Unique exact record, explicit absence, or multiple candidates requiring selection | Core target/run and immutable presentation records | Existing inspection result, explained by the agent |
| Document reading | An exact existing snapshot and its original binding are selected | Ordered page, byte range, content identity, continuation or completion; current/historical/unknown applicability | Existing Core presentation reader | MCP document result and the agent's document delivery |
| Read blocked | Binding, availability, access or cursor checks prevent the requested read | Existing actionable failure or a successful absence/ambiguity status | Existing Core decision and Phase 1 error owners | Existing MCP result and truthful agent explanation |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: The user requests inspection or document reading. The caller uses a confirmed target/run context; working_directory is execution context, not target authority. This read path does not activate a delivery, install a runtime or create a presentation. Stop after the final page or after presenting a required clarification/blocker.
- blockers_and_visible_next_actions: Missing binding information is obtained from existing MCP inspection semantics. If the requested target/run is not confirmed, clarify it. If no matching presentation exists, report that no prepared document can be read and identify the existing separate preparation path without executing it. If several records match the actual request, show bounded distinguishing identity/context and request selection. Do not choose by newest timestamp, directory ordering or a fixture's hidden expected identifier.
- recovery_paths: Reuse a known exact presentation binding and every returned continuation cursor. An invalid, foreign or altered cursor requires a fresh read from the first page using the same validated record. A changed live run does not silently substitute another document: report the original snapshot's existing current/historical/unknown applicability, refresh binding information where appropriate, and ask for selection when intent is ambiguous. Invalid/unavailable records retain existing actionable failures. No write or retry of a write is part of this flow.
- relevant_state_transitions: Discovery -> identification after a legitimate MCP response supplies binding information; identification -> reading only with one exact justified match or an explicit user/context selection; reading -> next page on returned continuation; reading -> complete only when all ranges and the final completion signal agree. Missing/ambiguous/invalid states stay visible until their actual prerequisite is resolved. Recovery never invents permission, approves a gate or rewrites the frozen document.

An exact binding already supplied in the user's conversation remains usable; the agent must preserve its original revision and document identity. A discovery request without that context must work in the single-record T4 fixture without hidden identifier injection. Candidate discovery must be read-only and supported through existing inspection operations; no new MCP operation is required by this product scope. SD must define a compatible result projection and a bounded candidate continuation strategy if one is needed. Ambiguity must remain visible even if the candidate response is bounded.

Historical snapshots remain readable when the existing reader permits the exact original binding. Current run revision and original document revision must be explained distinctly. A historical read supplies neither a current approval nor evidence that the document is currently effective.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - requirement: Every published inspect parameter explains meaning, applicability and authoritative origin where bound; valid examples explain supported operation combinations.
  - working_mode: Tool discovery
  - source_state: Tool listed with an unknown-to-agent call contract
  - action: Inspect tool definition and supported contract information
  - expected_effective_state: The model can identify required values and where they come from
  - visible_feedback: Descriptions and examples available through MCP, consistent with runtime validation
  - blocker_failure: Missing/contradictory documentation is a failed criterion
  - recovery_next_action: Correct the existing canonical contract and its projection
  - observable_success: All current fourteen parameters, or every supported parameter if representation changes, are meaningfully described and examples validate
  - required_evidence: tools/list capture, description coverage and accepted/rejected example tests

- criterion_id: AC-002
  - requirement: A legitimate caller can identify the exact existing requested presentation without guessing or creating one.
  - working_mode: Presentation identification
  - source_state: Confirmed target/run; one, none or several matching existing records
  - action: Discover using existing inspect operations and genuinely supplied constraints
  - expected_effective_state: A unique exact record is readable; absence is explicit; multiple candidates require selection
  - visible_feedback: Exact binding and distinguishing context, or a concrete missing/ambiguous result
  - blocker_failure: No implicit latest-record choice, hidden UUID injection, preparation or cross-target substitution
  - recovery_next_action: Ask for missing context/selection, or explain the separate preparation prerequisite
  - observable_success: Single-record T4 is discoverable; zero/multiple/cross-target cases behave as specified
  - required_evidence: Production protocol scenarios and native trace inspection

- criterion_id: AC-003
  - requirement: Full document reading preserves the exact immutable snapshot and reads every ordered UTF-8 page.
  - working_mode: Document reading
  - source_state: One validated existing presentation
  - action: Read first page, then all returned cursors
  - expected_effective_state: Exact complete frozen document with unchanged identity
  - visible_feedback: Content, ordered ranges, content identity, applicability and accurate completion
  - blocker_failure: Missing, repeated, reordered, substituted or corrupted pages fail
  - recovery_next_action: Revalidate the same record and restart its first page when required
  - observable_success: Reconstructed bytes equal the frozen source and the final page completes without omissions
  - required_evidence: Byte/digest comparison, multi-page UTF-8 and negative cursor/identity tests

- criterion_id: AC-004
  - requirement: Read-only boundaries, historical applicability, approval safety and Phase 1 errors remain effective.
  - working_mode: Read blocked
  - source_state: Invalid/foreign/unavailable record, changed live revision, denied access or ordinary blocked status
  - action: Inspect/read or attempt recovery
  - expected_effective_state: Existing Core checks decide; valid historical reads remain labeled; no durable state mutation
  - visible_feedback: Truthful absence/status or actionable actual failure with the existing error classification
  - blocker_failure: No false successful read, silent historical-to-current promotion or new authority
  - recovery_next_action: Use the owner-provided correction; clarification if intent remains ambiguous
  - observable_success: Before/after control bytes unchanged; valid successes and successful blocked reads not falsely flagged; actual failures retain their existing error contract
  - required_evidence: Production boundary regressions, mutation checks and historical/current scenarios

- criterion_id: AC-005
  - requirement: An actual agent completes the exact complete document task using MCP alone.
  - working_mode: Document reading
  - source_state: Original T4 prompt/fixture with one prepared long document; no seeded technical answer
  - action: Discover binding and deliver all pages in an actual host session
  - expected_effective_state: The requested document is completely retrieved through the supported flow
  - visible_feedback: Retained trace and deterministic complete-document result
  - blocker_failure: Shell use, direct control-file reads, manual missing-parameter assistance or scripted-only proof do not satisfy this criterion
  - recovery_next_action: Fix the contract or record native evidence as missing; never waive it as a passing protocol test
  - observable_success: Actual trace proves legitimate discovery and all exact document bytes without forbidden detours
  - required_evidence: Isolated native task sessions with candidate/host/model identity, no-detour trace audit and exact completeness proof

- criterion_id: AC-006
  - requirement: Report improvement honestly and preserve historical measurement authority.
  - working_mode: Evaluation
  - source_state: Retained baseline and versioned original T4 task/verifier
  - action: Re-run existing measurements and add the stronger approved proof
  - expected_effective_state: Original metrics remain comparable only within evidenced conditions
  - visible_feedback: Success, invalid calls, calls, response/token measurements, provenance and qualification limits
  - blocker_failure: Different host/model/task or stronger verifier must not be silently labeled an identical comparison
  - recovery_next_action: Label the cohort/method difference; retain old data and original predicate
  - observable_success: Original baseline/task semantics untouched; additional strict proof reported separately
  - required_evidence: Comparison report, original and additional checks, environment/source identities

- criterion_id: AC-007
  - requirement: Preserve public names, supported valid callers, canonical owners and the existing definition/payload budgets.
  - working_mode: Tool discovery
  - source_state: Existing released-compatible tool contract and projections
  - action: Publish the improved inspect contract through existing owners
  - expected_effective_state: Existing operations and valid call meaning retained; additive discovery is explicitly compatible
  - visible_feedback: agdf_inspect and agdf_* identities stable; requirements and examples agree
  - blocker_failure: No new required envelope field, second validator, alias family, budget increase or unsupported compatibility promise
  - recovery_next_action: Rework representation through the existing owner; escalate any necessary breaking behavior before implementation
  - observable_success: Definition stays <=5000 bytes; real SDK/packaged discovery and existing valid/invalid scenarios pass
  - required_evidence: Definition measurement, schema/validator parity, package/generation and relevant SDK protocol checks

- criterion_id: AC-008
  - requirement: Qualification remains bounded to observed execution, with required evidence and costs planned before running.
  - working_mode: Evaluation
  - source_state: Native execution not yet performed
  - action: Bind candidate/environment, repetitions, isolation and exact execution cap in TP
  - expected_effective_state: Executable evidence plan without installation, spending or host support inferred from approval alone
  - visible_feedback: Explicit native success/failure/unavailable disposition and actual cost where supplied
  - blocker_failure: Missing native proof prevents clean acceptance; green CI alone cannot qualify a host/model
  - recovery_next_action: Obtain the necessary evidence/authorization through the existing plan before execution
  - observable_success: Every acceptance obligation has actual evidence or remains visibly unsatisfied; no hidden waiver
  - required_evidence: TP evidence/cost plan, retained native report and QA disposition

## 6. Non-Goals

No command-tool description/output-schema redesign, new intake or inspection operation, automatic selection of a target/run, approval authority, generic file access, UI redesign, response-size or warm-worker optimization, new CI thresholds, installation, release or publication. No renaming or removal of the existing `agdf_` prefix. Do not change the document, prepare a replacement in order to pass a read test, or rewrite the historical baseline.

## 7. Users And Roles

- Coding agent: discover supported arguments, preserve exact bindings, perform read-only calls and show complete content or truthful blockers.
- Human requester/reviewer: supplies actual ambiguous intent/selection where needed and retains all approval decisions.
- Core maintainers: own canonical parameter, selection, presentation, read-boundary and error semantics; MCP/CLI adapters project them.
- Evaluation/QA maintainers: distinguish protocol correctness from actual native-agent success and protect historical comparison data.
- PRD Owner: Arndt Gold. This draft proposes the specified product behavior for his deliberate PRD decision; it records no PRD approval.

## 8. Constraints

One Core contract and one immutable presentation reader remain authoritative. MCP does not become a file reader, presentation writer or second approval owner. Preserve tool names and existing supported operations, strict existing input validation, effective read authorization and Phase 1 failures. Working-directory paths and guessed identifiers are not authority. Existing representation budgets remain unchanged, including the 5,000-byte inspect definition limit. Any necessary compatibility-breaking discovery design must return to the appropriate source decision rather than silently changing this scope.

No paid native session is authorized by this draft. TP must bind the actual candidate/host/model, repetitions, isolation and a concrete cost ceiling before execution; execution needs the applicable deliberate authorization. Binary availability alone proves none of those facts. A new host runner or broader host-support claim requires separate scope.

## 9. Evidence Requirements

Retain production MCP discovery and argument examples, zero/one/multiple presentation cases, explicit original binding, UTF-8 multi-page reconstruction and invalid/foreign cursor cases. Compare run/control bytes before and after reads, and exercise both supported SDK protocol eras and actual packaged projection as applicable. Verify description coverage semantically as well as mechanically.

Reuse T4's original prompt, fixture and original scoring as historical metrics; do not silently redefine its verifier. Supplement it with a separately identified trace/content audit proving ordered exact bytes, no omitted ranges, no substitute presentation and no shell/control-file lookup. The existing mcp_only variant permits Read; that permission must not be misrepresented as proof that no control file was read. The additional audit must observe actual calls. If the existing harness cannot prove a requirement, retain that gap for SD/TP instead of counting it passed.

The native report must identify host/model versions, OS, candidate/package identity, task/verifier identities, repetitions, isolation, outcome, invalid-argument calls, call counts and response/token measurements with unknown values explicitly marked. The historical native baseline is Claude Code on Windows; a fresh macOS cohort is separate evidence and cannot establish a like-for-like historical improvement. Successful protocol/build/CI tests do not replace the required native task outcome or human approval.

## 10. Risks And Open Questions

- Contract representation: all useful descriptions and correct operation requirements must fit the existing budget; SD owns the representation and compatibility proof.
- Presentation lookup: expose only legitimate contained records and make zero/multiple candidates explicit. SD owns secure, bounded projection through existing inspect operations; no arbitrary path or new authority.
- Evaluation fidelity: T4's original predicate counts offsets and completion rather than full ordered byte identity; TP owns additional proof while retaining original metrics.
- Native execution: host/model credentials, cost authorization and execution availability are not yet demonstrated; TP owns the concrete execution plan. Missing mandatory evidence cannot become a clean QA pass.
- Context Graph: link final scope and qualification to the existing CG-MCP-DISPATCH-ADAPTER at closeout; no new architecture node or authority is needed.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Product boundary and public names | before_prd | resolved | Proposed bounded inspection/document scope derived from approved UR; preserve existing agdf_* names. Command tools, intake and performance remain separate. This PRD decision adopts the proposal; none is recorded yet. | Arndt Gold |
| Exact document and ambiguity | before_prd | resolved | Derive exact identity from genuine supplied context or unique legitimate existing match; zero gives absence, multiple gives selection. No latest-record guessing or replacement presentation. Historical reads keep original binding and applicability. | Arndt Gold |
| Acceptance and qualification | before_prd | resolved | Native MCP-only success and exact completeness are mandatory; original T4 metrics remain intact and additional no-detour/content proof is separate. No host-wide or release claim is included. | Arndt Gold |
| Canonical projection, discovery representation and budget | later_sd | open | Choose a compatible extension of existing inspect results and a single-source parameter/schema/example representation within existing budgets. | sd-definition / Core-MCP maintainers |
| Execution environment, repetitions, cost and retained evidence | later_tp | open | Bind actual available host/model, isolation, concrete paid-run ceiling and execution authorization before running; specify original and additional evidence separately. | tp-definition / Arndt Gold |

## 11. Next Step

Review the proposed behavior and approve this exact PRD only with:

`Approval: PRD`

Approval permits SD preparation. It does not authorize implementation, installation, paid evaluation or release. All required evidence remains mandatory through the later plan and QA.

## AGDF Approval Summary (de; source=en)

- Ziel: Ein Agent findet die richtigen MCP-Leseargumente und liefert das exakt angefragte Freigabedokument vollständig, ohne Shell-Ausweichweg oder manuell ergänzte technische Bindungswerte.
- Umfang: Nur `agdf_inspect`: verständliche Parameter und Beispiele, nachvollziehbare vorhandene Dokumentbindung und vollständiger Seitenabruf. Die `agdf_*`-Namen bleiben erhalten.
- AC-001: Alle veröffentlichten Parameter erklären Bedeutung, Anwendbarkeit und Herkunft; Beispiele stimmen mit der Laufzeitprüfung überein.
- AC-002: Vorhandene Vorlagen sind über bestehende Leseoperationen auffindbar: eindeutiger Treffer, klare Abwesenheit oder Auswahl bei mehreren Treffern. Keine geratenen IDs, Aktualitätsauswahl oder neue Präsentation für den Leseauftrag.
- AC-003: Alle geordneten UTF-8-Seiten ergeben exakt die eingefrorenen Dokumentbytes; Bindung, Inhalt und Vollständigkeit sind nachgewiesen.
- AC-004: Lesegrenzen, historische Einordnung, Freigabesicherheit und Phase-1-Fehlerverhalten bleiben wirksam; Lesen ändert keinen Kontrollzustand.
- AC-005: Ein echter Agent schafft den gesamten Abruf ausschließlich über MCP. Shell, direkte Kontrolldatei-Lektüre, manuelle Parameterhilfe oder reine Skripttests erfüllen diesen Nachweis nicht.
- AC-006: Erfolg, Fehlaufrufe, Aufrufzahl und Antwort-/Tokenmessungen werden ehrlich verglichen; historische Daten bleiben unverändert und stärkere Zusatzprüfungen separat ausgewiesen.
- AC-007: Werkzeugnamen, gültige Aufrufe und kanonische Eigentümer bleiben kompatibel. Die Werkzeugdefinition bleibt innerhalb von 5.000 Bytes; keine neue Pflicht im bestehenden Aufrufumschlag und keine gelockerten Budgets.
- AC-008: Umgebung, Wiederholungen, Isolation und konkreter Kostenrahmen werden vor Ausführung im TP gebunden. Fehlender nativer Nachweis bleibt offen; CI allein ersetzt ihn nicht.
- Entscheidungen: Der Vorschlag legt den einen Inspektionsumfang, exakte statt geratene Dokumentauswahl und verpflichtenden Agentennachweis fest. SD klärt die kompatible Darstellung; TP bindet Ausführung und gegebenenfalls Kostenfreigabe. Diese PRD enthält noch keine Freigabe.
- Grenzen und Risiken: Keine schreibenden Werkzeuge, neuen Operationen, neue Zielwahl, neue Freigaberechte, UI-, Performance- oder Veröffentlichungsarbeit. Enges Definitionsbudget und echte Auffindbarkeit sind Designpflichten; historische Windows- und neue macOS-Messungen sind getrennte Nachweiskohorten.
- Nächster Schritt: Nach `Approval: PRD` folgt SD. Implementierung und kostenpflichtige Messungen sind damit noch nicht erlaubt.
