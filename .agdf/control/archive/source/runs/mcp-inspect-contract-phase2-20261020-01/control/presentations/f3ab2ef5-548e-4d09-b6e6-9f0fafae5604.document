# UR: Self-describing MCP inspection and complete document retrieval

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-20
Owner: Arndt Gold

## 1. Problem

The current canonical `agdf_inspect` input schema exposes fourteen parameters without individual descriptions. Its operation-dependent requirements exist in validation rules, but the tool description does not explain the meaning, provenance and relationship of target, run, revision, presentation and cursor values. The MCP ergonomics baseline reports that no native agent session completed task T4, reading the presented document in full, because agents could not determine the required arguments. This historical observation covers its recorded Claude Code/Windows environment; it is not a new measurement of the Phase 1 candidate.

Phase 1 makes actual failures recognizable and actionable. Agents still need a comprehensible initial call contract to avoid preventable invalid calls, guessed identifiers, shell detours and incomplete document delivery.

## 2. Goal

An agent can discover and correctly use `agdf_inspect` from its model-visible MCP contract. In particular, it can obtain the existing authoritative bindings and retrieve the complete presented document, including every ordered continuation page, entirely through MCP without a shell workaround or manually supplied technical arguments.

## Affected Users

- Coding agents invoking AGDF inspection tools and showing documents to users.
- People reviewing a presented gate document who need the complete, correctly bound text.
- Maintainers diagnosing invalid calls and verifying the practical effect of MCP contract changes.

## 3. Scope

- This first Phase 2 slice covers the existing `agdf_inspect` tool, its parameter descriptions, operation-specific call requirements and valid usage examples. Every exposed parameter must explain its meaning and applicability; bound identifiers must explain their existing authoritative source, required relationship and reuse rules.
- Prioritize `presentation-document`: make the supported sequence for obtaining its current target/run/revision/presentation binding, requesting the first page and following returned cursors understandable through the model-visible MCP interface. Discoverability must not depend on unpublished repository files or human knowledge of UUIDs.
- Keep descriptions, examples, schema requirements and runtime validation consistent through the existing Core contract owners. Preserve supported operations and their valid callers; any necessary compatibility choice belongs in PRD/SD, with evidence rather than a parallel documentation-only contract.
- Reuse the existing MCP ergonomics harness and T4 document-reading task. Verify protocol correctness and a real agent's complete MCP-only document retrieval. Record task success, invalid-argument attempts, tool-call count and response/token measurements with their actual provenance and limitations.
- Preserve the Phase 1 error contract and read-only semantics. Existing Core target/revision checks, frozen presentation identity, access boundaries, cursor validity and explicit human approval remain authoritative.

## 4. Non-Goals

- The five command tools' descriptions or missing output schemas; these are a subsequent slice.
- New delivery intake, new inspection operations, automatic target/run inference or guessed binding values.
- New approval authority, approval bypass, changes to the presented document or changes to durable governance state during an inspection.
- General response compaction, warm-worker optimization, new CI thresholds, broader host qualification, installation, release or publication.
- A UI redesign or interactive preview. The requested outcome is a usable MCP call contract and a complete document-reading flow.

## 5. Acceptance Signals

- INSPECT-01: Every published `agdf_inspect` parameter has a meaningful model-visible description covering purpose and applicability. Target, run, revision, presentation and cursor fields also explain their authoritative source and required relationships.
- INSPECT-02: Operation-specific requirements and examples agree with the canonical runtime validator. Valid existing calls continue to work; malformed or unsupported combinations fail through the proper existing boundary with actionable feedback.
- INSPECT-03: A protocol scenario retrieves all ordered pages of the frozen presented document with matching binding and content identity, without omission, duplication or a canonical control write. Stale, foreign and invalid cursor/binding requests remain rejected.
- INSPECT-04: A real agent completes the document-reading task through MCP without a shell detour or manually supplied missing technical arguments. Its trace and deterministic document-completeness check support the reported outcome. Scripted protocol success alone is not native-agent evidence.
- INSPECT-05: Reuse the historical baseline without overwriting it. Report success, invalid calls, total calls and response/token measurements; comparisons identify the exact candidate, host/model, environment and task version. Non-comparable cohorts are explicitly labeled.
- INSPECT-06: Existing inspection operations, successful blocked-state reads, Phase 1 tool errors, approval safety and relevant generated/package contracts retain their behavior. Definition/payload growth is measured through existing owners without weakening limits to make a check pass.

## 6. Existing Source Of Truth

- `packages/core/lib/control-inspect/contract.js`: canonical inspection definition and argument contract.
- `packages/core/lib/control-inspect/`: selection, binding and document-read behavior; Core remains the semantic owner.
- `packages/cli/lib/mcp-dispatch-runtime.js` and `packages/mcp-server/src/`: transport projection, SDK boundary and tool discovery.
- `packages/core/lib/mcp-tool-errors.js`: accepted Phase 1 failure classification and recovery projection.
- `evals/mcp-ergonomics/`, especially `tasks.v1.json`, `findings-map.v1.json`, the retained baseline and comparison procedure: F04 and task T4 evidence.
- `.agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/OR_SOURCE-01.md` and `.agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/OR.md`: historical scope and qualification boundaries.
- [MCP tools specification](https://modelcontextprotocol.io/specification/2026-07-28/server/tools): protocol-level discovery and schema contract. [Anthropic's tool-design guidance](https://www.anthropic.com/engineering/writing-tools-for-agents): advisory support for understandable descriptions, realistic agent evaluations and measurement of invalid calls, runtime and tokens. The proposed AGDF slice is a repository-specific application, not an additional protocol requirement.

## 7. Risks And Unknowns

Brownfield Review and SD must confirm which existing MCP results expose every document-binding value, how the supported hosts expose conditional schema requirements, and where examples can be owned once and projected without drift. Descriptions must improve discoverability without duplicating rules or exceeding existing definition budgets. A missing discovery link must not be hidden by injecting expected identifiers into the evaluated agent.

PRD/TP must bind the actual native host/model, repetition policy, execution availability and any paid-evaluation cost cap before execution. The retained native baseline is Claude Code on Windows; a run on a different environment cannot establish an identical-environment improvement. These are validation/design choices within the clear need, not unrequested permission to install software or spend an unspecified amount. Any unavailable required native evidence remains an explicit unresolved acceptance obligation.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

After approval, follow Brownfield Review, Mode/Slice determination and PRD/SD/TP preparation before implementation. No preview is required. The subsequent command-tool slice remains outside this UR.

## AGDF Approval Summary (de; source=en)

- Problem: Die vierzehn Parameter von `agdf_inspect` haben aktuell keine individuellen Beschreibungen. In der historischen Baseline konnte keine Agentensitzung das vorgelegte Dokument vollständig lesen. Phase 1 verbessert Fehlerantworten; dieser Slice soll vermeidbare Fehlaufrufe verhindern.
- Ziel und Betroffene: Coding-Agenten können den MCP-Lesevertrag verstehen und Nutzern das vollständige, richtig gebundene Freigabedokument zeigen. Maintainer erhalten nachvollziehbare Nachweise über Fehlversuche und erfolgreiche Nutzung.
- Umfang: Parameterbedeutung, Anwendbarkeit, Herkunft und Zusammenhang der Bindungswerte; passende Pflichtfelder und gültige Beispiele; vollständiger Abruf über `presentation-document` mit allen Folgeseiten. Bestehende Core-Verträge und Messwerkzeuge bleiben die Eigentümer.
- Abnahme: Alle veröffentlichten Parameter sind sinnvoll beschrieben. Schema, Beispiele und Laufzeitprüfung stimmen überein. Protokolltests belegen vollständigen, geordneten und unveränderten Dokumentabruf; ungültige Bindungen bleiben abgewiesen. Ein echter Agent schafft denselben Abruf ausschließlich über MCP ohne Shell-Ausweichweg oder manuell ergänzte technische Parameter. Erfolg, Fehlaufrufe, Aufrufzahl und Antwort-/Tokenmessungen werden mit Herkunft ausgewiesen.
- Grenzen: Keine Änderungen an den fünf schreibenden Werkzeugen oder deren Ausgabeschemas, kein neuer Intake, keine automatische Zielwahl, keine neuen Freigaberechte, keine allgemeine Performanceoptimierung, keine Veröffentlichung und keine UI-Vorschau. Bestehende Fehler-, Bindungs-, Lese- und Approval-Grenzen bleiben erhalten.
- Quellen und Risiken: Core besitzt die Semantik, MCP überträgt sie; die bestehende Baseline bleibt unverändert. Brownfield Review und Design prüfen die vorhandene Bindungsauffindbarkeit, Hostdarstellung bedingter Schemata und Definitionsbudgets. Host/Modell, Wiederholungen und gegebenenfalls Kostenrahmen werden vor der nativen Messung gebunden. Andere Umgebungen oder Skripttests ersetzen keinen gleichartigen Agentennachweis.
- Nächster Schritt: Nach `Approval: UR` folgen Brownfield Review und die weiteren fachlichen und technischen Vorbereitungen; Produktcode wird erst nach den dafür erforderlichen Freigaben geändert.
