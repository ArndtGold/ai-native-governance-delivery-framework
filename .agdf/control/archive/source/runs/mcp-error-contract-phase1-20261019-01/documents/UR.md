# UR: Recognizable MCP failures and actionable correction guidance

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-19
Owner: Arndt Gold

## 1. Problem

The MCP ergonomics baseline records nine AGDF failure results without `isError`. Correctable input failures can lead to generic runtime-repair advice, command rejections lack concrete recovery guidance, and the worker boundary can hide distinct causes behind `dispatch_worker_failed`. Agents cannot reliably distinguish failure from success or determine a safe next action. This is Phase 1 of the follow-up discussed with the user; the baseline run explicitly excluded interface repairs.

## 2. Goal

Make actual AGDF MCP tool failures unambiguously recognizable and actionable. The agent and user must be able to understand what failed, what is known about its effects, and how to correct the request or obtain the missing prerequisite without bypassing governance. Check the approach against authoritative external sources before product and implementation decisions.

## Affected Users

Coding agents calling AGDF MCP tools, the human reviewing their responses and decisions, and maintainers diagnosing failed calls benefit from consistent failure reporting and safe recovery instructions.

## 3. Scope

- Phase 1 covers the error contract at the existing AGDF MCP boundaries: dispatch, inspect, prepare, record, approve, revise and closeout, plus Cockpit tool failures and the existing worker failure mapping. Use the baseline findings F01, F02, F03 and F05 as initial evidence, while checking their actual coverage during Brownfield Review.
- Distinguish tool execution failures, including correctable semantic input and business-rule failures, from malformed protocol requests and from successful reads that report an expected blocked or pending governance state. Preserve the SDK-owned request-validation boundary and verify the installed SDK's actual behavior before choosing mappings.
- Return actual tool execution failures with `isError: true` and useful model-visible text. Preserve machine-readable causes and existing domain results; select the exact compatible result structure in SD rather than inventing a second authority for domain decisions.
- Provide specific, bounded correction guidance: explain the cause and relevant argument or prerequisite; identify the next supported operation or required human action; state whether correction and retry are possible and what must change first. Guidance must not invent a target, run, revision, approval or authorization.
- Distinguish a rejected call known not to have executed from an operation whose effects are unknown. An uncertain write requires the existing receipt/state recovery path before any retry; an input error must not falsely claim runtime corruption or unknown effects.
- Compare the proposal with the official MCP specification, official TypeScript SDK guidance and Anthropic's tool-design guidance below. Separate normative requirements, SDK behavior and advisory recommendations from AGDF-specific design choices.
- Demonstrate the contract with focused protocol and regression scenarios for successful calls, actual failures, expected blocked reads, correction after invalid input, stale revisions, denied access, runtime failures and uncertain writes. Reuse the existing baseline and compare tooling; preserve the historical baseline and disclose non-comparable metrics or gaps. A claim about native agent recovery requires an actual native observation.

## 4. Non-Goals

No new delivery-intake capability, general input-schema redesign, permission/annotation redesign, warm-worker or response-budget optimization, broad host-support qualification, or Phase 4 CI regression thresholds. No new approval authority, automatic approval, weakening of checks, installation, publication or release. A UI preview is not requested.

## 5. Acceptance Signals

- ERR-01: Actual tool failures are flagged as errors; successful results and successful status reads are not misclassified merely because a gate is blocked.
- ERR-02: The caller receives a stable cause and concrete correction or a truthful explanation of why it cannot retry yet; model-visible text remains useful without relying on hidden structured fields.
- ERR-03: Missing or invalid input leads to a targeted correction; genuine runtime faults receive appropriate runtime guidance. Worker failures preserve the known cause and execution boundary.
- ERR-04: Recovery for stale state, denied access and uncertain writes respects current target/revision/receipt checks, existing operation identity and deliberate human approvals; no blind write retry is proposed.
- ERR-05: The source comparison identifies which requirements follow from MCP, which depend on the installed SDK, and which are AGDF-specific choices. Exact schemas and the bounded scenario matrix are settled later in PRD/SD/TP.
- ERR-06: Existing evaluation evidence is reused to show changed error recognition and unchanged success/authority behavior; historical measurements are retained and native claims remain explicitly evidence-bounded.

## 6. Existing Source Of Truth

Repository owners to respect:

- `packages/core/`: canonical governance decisions, command outcomes, revisions, receipts and recovery preconditions.
- `packages/mcp-server/src/server.js`, `worker.js` and the existing generation transport: MCP result delivery and execution boundaries.
- `packages/cli/lib/mcp-dispatch-runtime.js`: existing runtime failure construction and guidance.
- `plugins/agdf/meta/contracts/` and capability declarations: canonical plugin contracts; update through their owners if needed rather than creating parallel policies.
- `.agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/QA_REPORT.md`, `OR_SOURCE-01.md`, and `evals/mcp-ergonomics/`: baseline findings, qualification limits, metrics and comparison procedure. The baseline's native evidence covers Claude Code on Windows, not Codex.

External source comparison, checked on 2026-10-19:

| Source and authority | Relevant finding | Consequence for Phase 1 |
|---|---|---|
| [MCP specification 2026-07-28, Error Handling](https://modelcontextprotocol.io/specification/2026-07-28/server/tools#error-handling), protocol specification | Distinguishes protocol errors from tool execution errors. Business logic and correctable tool-input errors use tool results with `isError: true` and actionable feedback. Clients should expose execution errors for model self-correction. | Classify by failed operation and preserve the error channel; do not mark every blocked status report as an execution failure. |
| [Official MCP TypeScript SDK v2, Errors](https://ts.sdk.modelcontextprotocol.io/v2/servers/errors), implementation guidance | Describes model-visible tool errors, recovery text, handler exceptions and SDK-owned validation behavior. | Verify the pinned SDK's behavior and test the actual wire result; do not assume JSON-RPC errors and tool failures reach the model identically. |
| [Anthropic, Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents), advisory tool-design guidance, published 2025-09-11 | Recommends specific, actionable input-error feedback instead of opaque codes or tracebacks, and evaluation of tool changes. | Explain what to change or do next and measure recovery. Stable error codes, execution-effect distinctions and approval-safe retry rules are AGDF-specific derivations, not verbatim protocol requirements. |

## 7. Risks And Unknowns

Brownfield Review must identify the existing semantic owners and callers that consume failure results, including Cockpit and worker/generation boundaries, before choosing one compatible mapping. An expected blocked read must remain distinguishable from a rejected requested operation. The pinned SDK may validate inputs before the tool handler; Phase 1 must document and test that boundary without converting genuine malformed requests indiscriminately into tool results. Changes to text or structured results may affect consumers and existing evaluations. No conclusion about native Codex recovery is available from the Windows Claude baseline. Exact error field names, localization behavior, fallback for unknown causes and the necessary native validation are PRD/SD decisions within this need. These are bounded design questions, not unresolved user requirements.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

After approval, perform Brownfield Review and Mode/Slice determination, then derive the PRD using the source comparison and baseline. Product code changes follow the existing SD/TP and approval sequence.

## AGDF Approval Summary (de; source=en)

- Problem: Die Baseline zeigt neun fachliche Fehler ohne `isError`, ungezielte Reparaturhinweise und verlorene Ursachen an der Worker-Grenze. Agenten können Fehler und sichere Korrekturschritte dadurch nicht zuverlässig erkennen.
- Ziel: Phase 1 macht tatsächliche MCP-Fehler eindeutig erkennbar und liefert konkrete Korrekturhinweise. Betroffen sind Coding-Agenten, die verantwortlichen Nutzer und Maintainer.
- Umfang: Fehlervertrag für die sieben AGDF-Tools, Cockpit-Toolfehler und Worker-Abbildung. Trennung von Protokollfehlern, Ausführungsfehlern und erfolgreich gelesenen blockierten Zuständen. Echte Toolfehler erhalten `isError: true`, sichtbare Ursachen und zulässige nächste Schritte. Bei unklarer Schreibwirkung werden zuerst Zustand und Belege geprüft. Abgleich mit MCP-Spezifikation 2026-07-28, offizieller TypeScript-SDK-Dokumentation und Anthropics Tool-Leitfaden ist erfolgt und im UR verlinkt; deren Vorgaben, Empfehlungen und AGDF-eigene Ableitungen bleiben getrennt.
- Abnahme: ERR-01 eindeutige Fehlerkennzeichnung ohne falsche Statusfehler; ERR-02 konkrete Korrektur; ERR-03 richtige Ursache und Ausführungsgrenze; ERR-04 sichere Wiederaufnahme ohne Freigabeumgehung; ERR-05 nachvollziehbarer Quellenabgleich; ERR-06 Vergleich mit erhaltener Baseline und begrenzten Host-Aussagen.
- Abgrenzung: Keine neuen Intake-Funktionen, allgemeine Schemaüberarbeitung, Performance-Optimierung, CI-Grenzwerte, Installation oder Veröffentlichung. Keine zusätzlichen Freigaberechte; keine UI-Vorschau beauftragt.
- Quellen und Eigentümer: Core bleibt für Governance und Wirkung zuständig, MCP für Ergebnisübertragung, CLI-Runtime für bestehende Fehlererzeugung. Vorhandene Verträge und Messwerkzeuge werden weiterverwendet.
- Risiken und Klärung: SDK-Vorvalidierung, bestehende Ergebnisnutzer und reguläre Blockadezustände müssen geprüft werden. Feldnamen, Lokalisierung und nötige native Nachweise werden in PRD/SD geklärt. Die native Baseline gilt nur für Claude Code unter Windows.
- Nächster Schritt: Nach Approval: UR folgen Brownfield Review und PRD; Implementierung erst nach den weiteren erforderlichen Freigaben.
