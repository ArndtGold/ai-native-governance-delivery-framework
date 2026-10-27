# UR: Reliable Codex MCP inspection and bound approval navigation

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-25
Owner: Arndt Gold

## 1. Problem

After the completed MCP contract-completeness Run and merged PR #32, fresh real Codex agents still needed 13 and 15 MCP calls and produced seven and nine SDK input-validation errors in the existing T7 presented-UR approval task. Both recorded the intended synthetic approval, but only one satisfied the unchanged strict trace audit. A source-correct JSON Schema therefore does not by itself establish a usable model-visible interface.

An isolated evaluation on main 5046858826f3bca7922c14ef402b095feca8b6fb found that the installed Codex CLI 0.163.0 exposes only two fields and two operations when translating the root schema combinators; the remaining intersections become unknown types. Making all fourteen fields and eleven operations visible alone did not complete the task in either comparison run. Agents also guessed operation-incompatible selectors and missing bindings. Simultaneous follow-up reads caused an actual dispatch_busy result in the first guided prototype.

The final isolated prototype combines full model-visible discovery, precise selector guidance and bound sequential read navigation from the existing Core owners. Four real gpt-6.1-sol sessions with Reasoning low completed the same approval workflow, including two predeclared wording variants, with four MCP calls each and no SDK or other error results. The user now requests implementing this evaluated approach through AGDF. These observations are preparation evidence, not approval or qualification of the later implementation candidate.

## 2. Goal

A Codex agent can understand the existing MCP inspection contract, obtain exact authoritative read arguments and record the user's deliberate response to the already presented UR without guessing identifiers, avoidable invalid calls, concurrent-read failures or a shell workaround. Existing Core validation and human approval authority remain intact.

## Affected Users

- People responding to an already presented gate document who expect their exact decision to be recorded against that version.
- Coding agents using the installed MCP tools and maintainers diagnosing failed tool calls.
- Maintainers preserving consistent CLI, Core, generated-package and host contracts within the current budgets.

## 3. Scope

1. Carry the evaluated approach into the canonical Core-owned inspection contract so the bound Codex host can see all supported fields and operations. Keep schema conditions, descriptions, examples and runtime validation consistent through existing owners.
2. Provide concrete, explicitly bound next read calls through the existing inspection path. Their target, Run, operation module, revision and selected presentation arguments come from existing validated Core state and presentation owners. Explain their sequential execution under the current runtime. Keep navigation separate from the canonical CLI report.
3. Preserve explicit target provenance, immutable presentation identity, current-versus-original revision semantics and safe handling of unavailable or ambiguous records. A read result must never authorize or automatically execute an approval.
4. Integrate focused regression checks through the existing CLI/MCP and MCP ergonomics infrastructure. Retain the evaluation's successful and failed observations unchanged, and distinguish them from fresh implementation-candidate evidence.
5. Validate the final candidate with real protected Codex sessions using gpt-6.1-sol and Reasoning low. PRD/TP must bind the exact host, tasks, repetitions, budgets and stop rules before execution. Use the existing ChatGPT account without an API-key fallback, credential copying, plugin installation or changes to protected global settings.

This is a follow-up to the completed contract-completeness Run. The older inspection-contract Run covers its existing T4 complete-document retrieval obligation and remains separately governed at UAT; its approvals, historical evidence and outstanding decision are not reused or changed here. This slice targets the newly evaluated Codex projection and T7 approval-navigation outcome.

## 4. Non-Goals

- New tools, inspection operations, command groups or write effects; tool splitting or renaming.
- New approval authority, automatic approvals, implicit current target/Run selection, selection by recency or reconstruction of a human reply.
- Relaxed SDK/Core validation, private SDK patches, changed replay/recovery rules or bypassed binding checks.
- General runtime concurrency redesign, response compaction, performance architecture or broad host qualification.
- Changes to completed or separately pending Runs, their approvals or retained native evidence.
- A UI preview or redesign, installation, release, publication, commit, push, PR or merge actions.

## 5. Acceptance Signals

- CGI-01: In the bound installed Codex host, all fourteen published inspection fields and eleven operations are visible with meaningful applicability and binding guidance. The root-schema projection no longer hides these fields behind unknown intersections. A model-free rendering check and actual native calls support this claim.
- CGI-02: Valid callers remain accepted and invalid combinations remain rejected. The existing 247,003-case schema comparison, focused Core argument-translation checks and retained invalid-call replay show no acceptance relaxation. Detailed output validation remains in place.
- CGI-03: Navigation contains exact read arguments only for the explicitly bound context. Complete unique discovery or an exact existing selection is required for a document choice. Missing, corrupt, foreign, stale and ambiguous cases fail closed without creating a replacement presentation. Historical document reads preserve their original revision; current contract reads use the current revision.
- CGI-04: In the bound normal T7 scenario, real Codex agents record exactly the intended single UR approval, with zero SDK input errors, zero other error results and no shell or forbidden trace detour. The evaluated reference is four MCP calls; the approved TP must define the final repetition policy and call-count acceptance before execution. Errors and incomplete sessions remain reported rather than replaced by easier tasks or loosened auditors.
- CGI-05: Existing limits remain unchanged: inspection definition at most 5,000 bytes; each command definition at most 8,192 bytes; existing command/decision aggregate at most 24,576 bytes; input/output limits 65,536/1,048,576 bytes; existing fixed-fixture cold/warm p95 limits 1,500/1,000 ms. Copilot remains within 397 files and 3,509,461 bytes. The isolated reference measured 4,992 definition bytes and 3,509,443 Copilot bytes; these are observations, not raised ceilings.
- CGI-06: Canonical CLI report and presentation behavior, read-only inspection, supported protocol paths, command effects, receipts, immutable presentations and deliberate approval checks remain compatible. Existing relevant CLI/MCP/generated-package checks pass.
- CGI-07: Final evidence identifies the exact candidate/source digests, CLI/model/reasoning configuration, task/prompt versions, calls, failures, tokens, timing method, isolation checks and limitations. Pre-implementation prototype success does not replace the required final-candidate validation or claim qualification of other hosts and workflows.

## 6. Existing Source Of Truth

- packages/core/lib/control-inspect/contract.js and service.js: inspection definition, applicability, argument conversion and read-service projection.
- Existing Core run-command descriptors, gate-check evaluation and run-presentation catalog/document owners: operation meaning, exact bindings, validation and selection authority.
- packages/cli/lib/mcp-dispatch-runtime.js, packages/mcp-server/src/ and existing generated/package owners: transport and distribution projections, not parallel semantic owners.
- Existing CLI inspection-parity tests, MCP protocol/command suites and evals/mcp-ergonomics/: regression and native-task infrastructure.
- plugins/agdf/meta/copilot-payload-baseline.json and existing Core/MCP budget owners: unchanged size and execution limits.
- /private/tmp/agdf-inspect-evaluation/REPORT.md, summary.json, final-candidate.patch, artifact-manifest.json and evidence/: isolated evaluation and immutable original observations. Before relying on them as durable delivery evidence, retain and verify their hashes under the later approved plan without changing the originals.
- .agdf/control/artefacts/mcp-contract-completeness-20261025-01/ and .agdf/control/artefacts/mcp-inspect-contract-phase2-20261020-01/UR.md: completed preceding slice and separately governed document-retrieval scope.
- [OpenAI Function Calling](https://developers.openai.com/api/docs/guides/function-calling) and [Anthropic tool-design guidance](https://www.anthropic.com/research/writing-tools-for-agents): advisory support for clear tool contracts, supplying known arguments in code and evaluating actual agent task outcomes.
- [MCP tools specification](https://modelcontextprotocol.io/specification/2026-07-28/server/tools): protocol-level validation and stateful-tool guidance. Project-specific Run and presentation rules remain Core-owned.

## 7. Risks And Unknowns

The measured success covers one UR approval workflow on a specific Codex CLI/model tuple. Two wording variants do not establish general task or host coverage. The first guided prototype failed strict qualification despite recording the intended approval; it remains a retained negative observation. The schema-only prototype also failed and cannot be promoted on lower call counts caused by early termination.

Definition and Copilot payload headroom are small. Brownfield Review, PRD and SD must confirm that transferring the evaluated patch and adding meaningful regressions preserve the current limits, one semantic owner and CLI report parity. The final plan must bind a finite fresh native-session budget and stop/retry rules; no new native sessions are authorized by this UR draft alone. The temporary evaluation artefacts need durable, hash-preserving retention before being used for delivery review. No material requirement clarification remains open; these are bounded preparation and verification decisions.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

After approval, follow the canonical Brownfield Review and Mode/Slice routing, then prepare PRD, SD and TP as required before product implementation. No new preview is required. Present fresh bound gate material and obtain each required deliberate approval; earlier replies cannot approve this new scope or a changed source.

## AGDF Approval Summary (de; source=en)

- Problem: Im frischen Codex-Vergleich brauchte der Freigabeablauf 13 beziehungsweise 15 MCP-Aufrufe und erzeugte sieben beziehungsweise neun SDK-Eingabefehler. Der Host zeigte einen Teil des korrekten Schemas nicht verständlich an; zusätzliche Argumente und Bindungen wurden erraten. Gleichzeitige Folgeabfragen verursachten außerdem dispatch_busy.
- Ziel und Betroffene: Nutzer können ihre bewusste Antwort zur vorgelegten UR zuverlässig erfassen lassen. Coding-Agenten erhalten ein verständliches Werkzeug und genaue, autoritative Leseangaben; Maintainer erhalten reproduzierbare Nachweise.
- Umfang: Den geprüften Ansatz in die kanonischen Core-Owner übernehmen: alle Felder und Operationen sichtbar, klare Anwendbarkeit und gebundene Folgeabfragen in der richtigen Reihenfolge. Navigation ergänzt den Lese-Envelope; der CLI-Bericht bleibt identisch. Bestehende Validatoren, Dokumente und Freigabegrenzen bleiben maßgeblich.
- Abnahme: Keine gelockerten Eingaberegeln; sichere Ablehnung falscher, veralteter, fremder oder mehrdeutiger Bindungen; keine automatisch erzeugten Ersatzpräsentationen. Neue echte Codex-Läufe mit gpt-6.1-sol und Reasoning low müssen den Ablauf am Implementierungskandidaten ohne SDK- oder sonstige Fehler und ohne Umwege nachweisen. Vier Aufrufe sind die geprüfte Referenz; Wiederholungen, Budget und konkrete Abnahme werden vor Ausführung im TP gebunden.
- Grenzen: Keine neuen Werkzeuge oder Schreibrechte, keine automatischen Freigaben, keine SDK-Privatpatches und keine allgemeine Parallelitäts- oder Host-Neuarchitektur. Alle MCP-Limits und die Copilot-Grenze von 397 Dateien und 3.509.461 Byte bleiben unverändert. Keine Installation, Veröffentlichung oder Git-Übergabe in diesem Auftrag.
- Quellen und Risiken: Core besitzt Semantik und Bindungen; MCP und Paketprofile projizieren sie. Die vier erfolgreichen Prototyp-Läufe sind Vorstudie, keine Abnahme der späteren Umsetzung. Auch die Fehlversuche bleiben erhalten. Die Nachweise werden später unverändert und mit geprüften Hashes dauerhaft übernommen. Kleine Größenreserven und die begrenzte Workflow-Abdeckung werden ausdrücklich berücksichtigt. Andere Runs und deren offene UAT bleiben unverändert.
- Nächster Schritt: Nach Approval: UR folgen Brownfield Review und die erforderlichen PRD-, SD- und TP-Freigaben. Produktcode wird erst im dafür freigegebenen Umfang geändert.
