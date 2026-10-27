# UR: Complete existing MCP tool contracts and close conformance gaps

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-25
Owner: Arndt Gold

## 1. Problem

The source review at commit c327c50deae6e5b4fd8071c9e03b1ef2803df6ae found that the existing MCP interface is not consistently self-describing or aligned with its published metadata. All five command tools lack an outputSchema and individual descriptions for their eleven top-level input properties. The capability manifest calls agdf_dispatch read-only although its actual contract permits a bounded continuation write and advertises readOnlyHint false. The MCP README still describes current assemblies as version 0.14.5 although the inspected package is 0.20.1.

A synthetic STDIO exchange through the actual server adapter reproduced another gap: a UI-dependent request without the required UI capability returns a resource_denied tool failure or an InvalidParams resource error under protocol 2026-07-28. The current MCP specification requires MissingRequiredClientCapabilityError, code -32021 with data.requiredCapabilities, when processing a request needs a capability the client has not declared. The version-specific SDK boundary needs examination before selecting the correction; changing a thrown exception alone must not be assumed to produce the required wire response.

The user accepted one cohesive follow-up scope covering capability errors, complete contracts for the five existing command tools, consistent metadata and focused verification. The earlier error-contract Run is completed. The separate inspection-contract Run remains at UAT and explicitly excludes command-tool descriptions and output schemas; its approvals and outstanding decision cannot be borrowed by this Run.

## 2. Goal

An agent or MCP client can discover, understand and correctly consume the existing AGDF command tools from their published contracts, while receiving protocol-appropriate capability errors and consistent capability and version information. The correction preserves the existing Core authority, command effects, binding checks and supported legacy clients.

## Affected Users

- Coding agents invoking agdf_prepare, agdf_record, agdf_approve, agdf_revise and agdf_closeout, and clients validating their results.
- People reviewing the agent's proposed operations and deliberate gate decisions.
- Maintainers diagnosing interoperability failures and keeping discovered contracts, runtime behavior and shipped documentation consistent.

## 3. Scope

1. Correct the missing-required-UI-capability response at the existing server boundaries for protocol 2026-07-28. Verify the error code, required capability data and absence of execution through actual STDIO exchanges. Preserve and separately verify the supported 2025-11-25 behavior and successful UI-capable calls.
2. Complete the model-visible contracts of the five existing command tools with meaningful parameter descriptions and compact output schemas derived from their existing Core-owned result semantics. Explain the purpose, authoritative source and reuse rules of target, Run, revision and operation identifiers, and the role of cooperative assurance. Keep detailed operation help consistent with discovery without maintaining a parallel contract.
3. Validate successful and failed command results through the appropriate existing owners, including error results that the installed SDK does not validate against outputSchema. Preserve existing domain outcomes, receipts, uncertainty and recovery semantics; schema publication must not silently redefine them.
4. Reconcile the dispatch read-only metadata and obsolete version statements with the actual supported behavior and distribution. Add focused checks for mechanically verifiable inconsistencies through existing contract/build owners.
5. Verify the affected protocol routes, generated/package contracts, safety boundaries and existing definition and performance budgets. Measure definition growth and actual call behavior without raising limits to make a test pass.
6. Reuse the existing MCP ergonomics infrastructure for a focused native-agent scenario demonstrating use of the completed command contracts without manually supplied missing technical arguments or an AGDF CLI workaround. Bind host, model, candidate, repetitions and any paid-evaluation budget before execution; distinguish scripted protocol evidence from native-agent evidence.

## 4. Non-Goals

- Splitting or renaming tools, reorganizing command groups or changing the effects allowed by any command.
- New approval authority, authenticated human-origin proof, automatic approvals, relaxed target/revision/source checks or changed replay and recovery rules.
- Remote HTTP transport, OAuth, a new operating-system sandbox or general security architecture changes.
- General response compaction, worker/performance redesign, new CI thresholds or broad cross-host qualification.
- Changes to the existing inspection-contract Run, recording its outstanding UAT response, or repeating completed error-contract work.
- A UI redesign, preview or mockup; plugin installation, release, publication, commit, push or PR actions.
- Claiming complete MCP conformance from the focused scenarios in this Run.

## 5. Acceptance Signals

- MCP-COMPLETE-01: Actual STDIO requests requiring an undeclared UI capability under 2026-07-28 receive code -32021 and valid data.requiredCapabilities. Denied requests execute no protected operation. Legacy denial and supported UI-capable requests retain their specified behavior.
- MCP-COMPLETE-02: Each of the five discovered command tools exposes meaningful descriptions for all top-level input fields and its supported command payloads, including binding provenance and original-operation reuse after uncertainty. Descriptions, examples, detailed operation help and runtime requirements agree.
- MCP-COMPLETE-03: All five tools publish valid compact output schemas covering their supported result variants. Actual successful results conform; malformed producer results cannot be reported as success. Failed results remain checked despite the SDK's error-result validation exception, and preserve actionable guidance and known effect limits.
- MCP-COMPLETE-04: Capability metadata agrees with the actual dispatch contract. Current version statements are accurate, historical claims remain clearly historical, and focused checks detect renewed disagreement without creating a second source of truth.
- MCP-COMPLETE-05: Existing valid callers, target/Run/revision/source binding, immutable presentation identity, deliberate approval, original-operation idempotency and recovery remain compatible. Invalid and stale requests stay rejected. Relevant package, generated-asset, safety, shutdown and lock tests pass.
- MCP-COMPLETE-06: Existing definition and response limits and the fixed-fixture performance budgets remain satisfied. Reports identify the candidate, environment, sizes, timing method and limitations; no threshold is weakened to conceal a regression.
- MCP-COMPLETE-07: A bound native agent completes the focused command-contract task through MCP. Record task outcome, invalid arguments, tool-call count and response/token measurements with their provenance. An unavailable or failed required agent scenario remains an explicit acceptance gap rather than being replaced by scripted success.

## 6. Existing Source Of Truth

- packages/core/lib/control-state/run-command-contract.js: command groups, input descriptors, operation help and existing budgets.
- Existing Core command/result owners and packages/core/lib/mcp-tool-errors.js: domain effects, receipts, result invariants, error classification and correction guidance.
- packages/cli/lib/mcp-dispatch-runtime.js and packages/mcp-server/src/server.js, ui-capability.js: runtime composition, discovered tool projection, protocol boundary and per-request UI capability checks.
- plugins/agdf/meta/agdf-mcp-capability.json, canonical package manifests, packages/mcp-server/README.md and existing generated/build owners: capability and distribution information.
- packages/mcp-server/test/ and evals/mcp-ergonomics/: protocol, package, safety and agent evaluation infrastructure; retain the historical baseline unchanged.
- .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/ and .agdf/control/artefacts/mcp-inspect-contract-phase2-20261020-01/UR.md: completed error-contract behavior and the separately governed inspection scope.
- [MCP 2026-07-28 request metadata](https://modelcontextprotocol.io/specification/2026-07-28/basic#_meta): normative missing-required-capability behavior, checked 2026-10-25.
- [MCP tools and output schemas](https://modelcontextprotocol.io/specification/2026-07-28/server/tools#output-schema): outputSchema is optional in MCP; providing it is this Run's product requirement, and declared schemas constrain results.
- [Official TypeScript SDK error behavior](https://ts.sdk.modelcontextprotocol.io/v2/servers/errors): handler exception conversion and skipped output-schema validation on isError results must be checked against the installed SDK before design decisions.
- [Anthropic tool-design guidance](https://www.anthropic.com/research/writing-tools-for-agents): advisory support for clear parameter meaning, efficient context and realistic agent evaluation; not an additional MCP protocol obligation.

## 7. Risks And Unknowns

Brownfield Review must identify the exact existing result owners for each command family and the supported SDK route for a modern protocol-level capability error. The SDK's distinction between handler errors and protocol errors can invalidate a superficial correction. Capability absence and malformed request metadata must remain distinct.

Schema publication can expose existing result variation or reject supported callers if it is derived from an incomplete sample. Core-owned validation and compatibility evidence must precede schema tightening. Parameter help and schemas must fit existing definition budgets; progressive detail may remain in the existing operation-contract reader. No second runtime result authority or metadata registry is authorized.

The native-agent scenario needs an exact candidate and available host/model. PRD and TP must define its task, success verifier, repetitions and permitted cost before execution. Current local scripted tests and the historical Windows/Claude baseline cannot establish native improvement for a different candidate or environment. Any unavailable evidence remains visible.

The open UAT of the independent inspection-contract Run is not approved by the user's instruction to start this new Run. This scope consumes its existing interface but does not change its approved intent or close its acceptance obligations.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

After approval, perform Brownfield Review and Mode/Slice determination, then the required PRD, SD and TP preparation before product implementation. No preview is required. The separate inspection Run retains its outstanding human decision.

## AGDF Approval Summary (de; source=en)

- Problem: Bei fehlender benötigter UI-Capability liefert der moderne MCP-Pfad die falsche Fehlerklasse. Den fünf Schreibwerkzeugen fehlen Ausgabeschemas und Feldbeschreibungen. Read-only-Metadaten und Versionsaussagen widersprechen dem aktuellen Verhalten.
- Ziel und Betroffene: Coding-Agenten und Clients können die bestehenden Werkzeuge aus ihrem veröffentlichten Vertrag verstehen und Ergebnisse zuverlässig verarbeiten. Menschen behalten die bewusste Gate-Entscheidung; Maintainer erhalten nachvollziehbare Fehler und konsistente Angaben.
- Umfang: Capability-Fehler für 2026-07-28 korrigieren und Legacy-Verhalten separat sichern; Ein- und Ausgabeverträge der fünf bestehenden Schreibwerkzeuge vervollständigen; auch Fehlerantworten validieren; Metadaten und Dokumentation abgleichen; Protokoll-, Paket-, Sicherheits- und Leistungsnachweise sowie einen gezielten echten Agententest erbringen. Bestehende Core-Eigentümer bleiben maßgeblich.
- Abnahme: Der moderne Capability-Fehler enthält -32021 und requiredCapabilities und führt keine geschützte Operation aus. Alle fünf Werkzeuge besitzen verständliche Feld- und Payload-Beschreibungen sowie gültige Ausgabeschemas. Ergebnisse, Beispiele und Validierung stimmen überein; ungültige Ergebnisse bleiben Fehler. Metadatenwidersprüche werden erkannt. Ziel-, Revisions-, Quellen-, Freigabe- und Wiederholungsgrenzen bleiben wirksam. Bestehende Größen- und Leistungsbudgets werden eingehalten. Der gebundene Agententest weist Aufgabe, Fehlversuche, Aufrufzahl und Antwort-/Tokenmessungen mit Herkunft aus.
- Grenzen: Keine neue Werkzeugaufteilung oder Rechteausweitung, kein Remote-Transport, keine allgemeine Performance- oder Sicherheitsarchitektur, keine UI-Vorschau und keine Veröffentlichung oder VCS-Aktion. Die offene UAT des Inspect-Runs und abgeschlossene frühere Runs werden nicht verändert. Dieser Run behauptet keine vollständige MCP-Konformität.
- Quellen und Risiken: Die offizielle MCP-Spezifikation und das installierte SDK bestimmen den Protokollpfad; Core besitzt Fachverträge und Fehlersemantik. Ausgabeschemas sind eine vereinbarte Verbesserung, keine allgemeine MCP-Pflicht. Brownfield Review und Design klären die SDK-Fehlergrenze, vollständige Ergebnisvarianten und kompatible Schemas ohne parallele Wahrheit. Host, Modell, Wiederholungen und gegebenenfalls Kostenrahmen werden vor der nativen Messung festgelegt; fehlende Nachweise bleiben offen.
- Nächster Schritt: Nach Approval: UR folgen Brownfield Review, Mode/Slice und die erforderlichen Produkt-, Design- und Planfreigaben vor der Umsetzung.
