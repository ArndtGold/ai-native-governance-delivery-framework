# UR: Reliable MCP runtime and coherent Codex host setup

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-14
Owner: Arndt Gold

## 1. Problem

Actual installed AGDF verification exposed intermittent MCP startup failures reported as AGDF_MCP_PLUGIN_RUNTIME_FAILED and AGDF_MCP_EXECUTABLE_CLAIM_INVALID. Packaged command tests also produced dispatch_timeout with effect_unknown. Unchanged retries and the qualified local CLI succeeded, but this does not establish the underlying cause or repair it. These failures interrupt agent delivery and require extra diagnosis or exact original-operation recovery.

Existing observations are preserved in the completed run-uat-content-readiness-20261014-01 qualification and its preliminary startup/command logs. The launcher currently collapses some exceptions into broad codes; the worker has a bounded 10,000 ms default and terminates on timeout. Those are inspected code facts, not a demonstrated explanation of the observed failures.

The user subsequently supplied a Codex MCP settings screenshot and requested a sharper product solution. Read-only configuration and process inspection confirmed a regular plugin-owned agdf launcher alongside agdf-cockpit-local and agdf-cockpit-draft-check from separate dist/local builds, plus agdf-decision-probe from a temporary runtime. Multiple clients/processes exist, including two regular plugin instances using the same data directory. This proves mixed registration/runtime topology, not a process leak, claim conflict or timeout cause. Development probes currently appear next to the product without a clear normal-use boundary.

The current Codex configuration is split between plugin mcp.json, project .codex/config.toml and user ~/.codex/config.toml. The observed regular plugin tool catalog includes control and Cockpit read tools; Cockpit opening is exposed by the additional Cockpit servers in this chat. A host's configured/enabled server, a started process, discovered tools and an actually rendered MCP App are different states. The screenshot's Apps category, MCP server registrations and MCP-App browser data are also different concerns. The product lacks an evidenced common lifecycle across the observed entries: who owns each effective registration, how updates reconcile it and when diagnostic entries are removed. This requirement sharpens that specific AGDF integration gap; it does not redesign Codex settings.

## 2. Goal

Make AGDF MCP startup and command execution reliably complete within measured bounds by permanently correcting demonstrated causes. Provide one coherent Codex product setup with explicit registration ownership across plugin, project and user configuration, preserved capabilities and a checked installation/update/removal lifecycle. Distinguish effective configuration, process startup, tool discovery and actual App rendering. Preserve exact provenance, contained ownership, bounded cancellation/timeouts, host permissions, Run/revision binding, durable transactions and original-UUID recovery. Verify the exact final installed candidate and its effective host configuration rather than only source or synthetic behavior.

Present a coherent normal-use AGDF setup whose visible names and lifecycle distinguish supported product capabilities from temporary diagnostics. Prefer one AGDF product entry; any technically necessary separate Cockpit entry must have a clear AGDF Cockpit role and rationale. Temporary test registrations require deliberate activation, explicit test naming, known ownership and a verified end-of-use cleanup path.

## Affected Users

Coding agents using the installed AGDF MCP tools are the direct consumers. The human user experiences stalled work, repeated recovery and uncertainty about whether an operation completed; maintainers need precise, bounded diagnostics and regression evidence.

## 3. Scope

1. Trace each observed failure from the configured plugin launcher through package publication, ownership/claim acquisition, facade/worker startup, request execution and canonical operation recording. Separate startup, integrity rejection, lock contention, expensive work and response-loss hypotheses with evidence; shared timing or a successful retry alone is not causation.
2. Build isolated, reproducible scenarios for confirmed causes, including relevant concurrency, cold/warm startup, injected interruption and slow paths. Preserve failed and successful cases, source/package/installed identity, measured phase timings and actual original-operation status.
3. Fix confirmed causes in their existing owners with one coherent lifecycle and execution policy. If a suspected cause is disproved, retain the counterevidence. Resolve any confirmed required failure remaining within scope before passing QA.
4. Improve actionable startup/execution diagnostics where necessary so failures identify the failed phase and safe recovery without exposing sensitive paths, payloads or secrets. Keep diagnostic data separate from decision authority.
5. Retain bounded execution and cancellation. Any deadline change requires measured rationale and an explicit design; merely increasing timeouts, masking errors, polling until success, weakening provenance or automatically issuing another mutating UUID is not a durable fix.
6. Verify mutation outcomes through the existing canonical original UUID/receipt and replay rules. A timeout never proves non-execution; no second write, approval or lifecycle transition may be fabricated.
7. Build and install through supported existing processes, compare the exact final source/package/installed candidate, and exercise the actual configured installed CLI/STDIO paths repeatedly under the agreed normal and stress conditions. Keep native model/UI/other-platform observations separate and unclaimed unless actually performed.
8. Complete the bound implementation evidence, mandatory reviews, sole QA assessment, new human QA/UAT decisions and allowed OR; retain historical approved sources and unrelated work unchanged.
9. Reconcile the observed local topology as part of this Run: inventory exact registrations, sources, effective paths, clients and timeout layers; compare regular plugin alone, concurrent regular clients and coexistence with the identified diagnostic builds. Do not label ordinary multi-client processes as leaks or attribute a shared-resource race without reproduction.
10. Define and implement the smallest supported product registration/naming policy through existing configuration and lifecycle owners. Product capabilities should normally use AGDF; a separate AGDF Cockpit entry is permitted only when technically justified. Technical server IDs and tool namespaces are compatibility identifiers: renaming them requires a contained migration and collision check, not a cosmetic global replacement. Distinguish display names from IDs where the host supports that distinction.
11. Give temporary diagnostic registrations an explicit test identity, bounded intended use, owned source/target and completion/abort cleanup. Diagnose whether existing owners omitted cleanup. Correct that owner so future tests cannot leave ordinary product installations populated by probes. Clean up the specifically verified AGDF diagnostic registrations through that supported path while preserving unrelated MCPs, foreign configuration and any deliberately retained product capability. Temporary-path existence is not sufficient ownership proof for deletion.
12. Define one scoped ownership contract for the existing Codex integration. AGDF supplies its supported product declaration and owns its executable package/verification; existing AGDF lifecycle adapters mutate only their proven owned entries within an expressly authorized scope. Codex remains the authority for effective configuration/precedence, enablement, trust, tool permissions, discovery, App support/rendering, session lifecycle and host-managed App data. Plugin-provided registration must not be duplicated in project/user configuration merely for discoverability. Preserve an optional project-bound Cockpit through the existing owner if consolidation is not technically justified.
13. Reuse existing installation, update, activation, deactivation, migration and removal owners to reconcile AGDF product and diagnostic entries coherently. Decide how applicable plugin/project/user layers, name collisions, stale paths/generations, disabled states, shared references and partial failures are handled. Require idempotent repetition and a bounded recovery/rollback path; never silently adopt foreign entries, widen project scope to user scope, override managed policy or discard a deliberately retained capability. This Run does not introduce a parallel setup wizard or replace the separately owned guided activation journey.
14. Provide a bounded evidence projection of the effective AGDF host setup from authoritative declarations and actual observations, not a second mutable registry. It must identify technical server ID/display name, configuration origin and scope, product/test role, lifecycle owner, actual runtime identity, bound target where applicable, distinct host-start/tool/worker limits, effective permissions when observable and reload/discovery limits. Redact secrets and distinguish declared values from host-effective values or unavailable evidence. UI resources and browser storage are not server registration sources.
15. Distinguish at least configured/enabled, started, tools discovered and App rendered, with explicit unavailable/unsupported/stale or failed-phase results rather than inferring a later state from an earlier one. Test product setup, update and teardown along with supported MCP-App capability handling and the existing text/document fallback. App rendering/interaction claims require fresh direct host evidence; advertisement or returned HTML is insufficient. Report session refresh requirements without restarting the host automatically. Do not automatically clear shared host MCP-App data as a cleanup substitute.

### Host ownership boundary required by this UR

| Concern | Required authority | AGDF obligation |
|---|---|---|
| Product server declaration and executable identity | Installed AGDF plugin/package | One supported version-bound product source; no manual test-build substitution |
| Owned project/user registration writes | Existing AGDF host/lifecycle adapter within authorized scope | Prove ownership, preserve foreign content, reconcile applicable layers and make repeat/removal safe |
| Effective configuration, trust and tool permissions | Codex and any applicable managed policy | Observe and respect effective state; do not emulate, weaken or override host decisions |
| Startup and tool execution | Codex connection lifecycle plus AGDF runtime executor for its internal bound | Separate limits, phase outcomes, cancellation, committed effects and recovery |
| Tool discovery and session freshness | Actual Codex client/session | Report direct discovery or its absence; configuration alone is not discovery |
| MCP-App resources and ephemeral AGDF view state | Existing AGDF App/server owners | Provide scoped resources and preserve Core authority; no new server per App by convention |
| MCP-App rendering, interaction and shared browser data | Codex host | Qualify direct rendering/interaction separately; do not infer it or delete shared host storage |
| Temporary diagnostic setup | Verified existing test/setup owner | Deliberate activation, explicit test identity, bounded use and safe completion/abort cleanup |

## 4. Non-Goals

- No new MCP server, second runtime/claim store, Run writer or approval authority.
- No gate/approval bypass, false non-execution inference, automatic mutating retry with a new UUID, weaker integrity/containment checks or unlimited execution.
- No host configuration expansion, automatic app restart, network service activation, native-host support claim or other-platform rollout by implication.
- Scoped removal/migration of verified AGDF-owned diagnostic registrations is included; blanket MCP removal, deletion of foreign temporary files or termination of unverified/shared client processes is excluded. Naming changes alone cannot qualify the runtime reliability fix.
- No commit, push, PR, deployment or public release; supported scoped local installation is authorized for verification.
- No reopening or extension of the completed Run/UAT content fix, historical document rewrite, unrelated active Run repair or incorporation of unrelated UI documentation changes.
- No new cross-host configuration format, writable host-state mirror, second lifecycle implementation, broad installer journey, native host settings redesign or unrelated connected-App/account change.
- No automatic host-wide MCP-App browser/cache purge; removing a server registration, stopping a verified owned session and clearing App data are separate effects with separate ownership.

## 5. Acceptance Signals

- AC-001: Each observed startup failure family and dispatch_timeout has a traceable causal assessment supported by a reproducible failure or a concrete counterexample. Remaining unknowns are explicit; no unproven race/performance hypothesis is presented as the root cause.
- AC-002: Each confirmed required defect has a regression that fails on the protected original baseline and passes after the durable production change. Relevant concurrent startup/publication/claim and execution interruption scenarios preserve valid ownership and recoverability.
- AC-003: Cold/warm and repeated installed requests satisfy the measured bounds defined during design and planning. Timings distinguish meaningful phases and transport/response from committed effects; no reliability claim rests on one successful retry.
- AC-004: Tampered, foreign, stale or mismatched runtimes and invalid claims remain refused. Cancellation, deadlines and concurrency limits stay bounded; transactions and response-loss recovery retain original operation identity without duplicate effects.
- AC-005: Failed startup and execution expose enough safe phase/reason information to identify the existing owner and next permissible recovery. Sensitive inputs remain undisclosed.
- AC-006: A supported final local install is byte/source-identity verified and the actual configured installed runtime passes the required positive, negative, stress and original-UUID status/replay cases. Test fixtures and native/UI/platform limits are disclosed separately.
- AC-007: Required affected tests, normal build and existing payload/instruction guards pass without arbitrary spare budget or disabled assertions. Reviews, new QA/UAT replies and OR bind this exact new scope and candidate.
- AC-008: The regular supported installation has a clearly evidenced product entry policy: AGDF, with AGDF Cockpit only if separately required and justified. Active supported capabilities and their technical namespace compatibility remain intact. Probe/draft-check identifiers are not normal product entries; no duplicate registration is introduced by migration or repeated setup.
- AC-009: Owned diagnostic registrations have explicit test names, ownership, activation and cleanup. Successful completion, abort and repeated cleanup leave no unintended persistent probe registration; foreign MCP settings and shared/product processes remain unchanged. The identified local test remnants are handled through this exact verified boundary.
- AC-010: Installed verification separates single regular runtime, concurrent regular clients, diagnostic coexistence and host-start/tool/internal-worker deadlines. It records the final effective configuration and actual runtime identity; native host UI/discovery behavior is claimed only when freshly observed. Removed test builds never substitute for final product qualification.
- AC-011: A bounded host-setup projection resolves each in-scope AGDF entry to its configuration origin, scope, product/test role, lifecycle owner and runtime identity; configured, started, discovered and rendered states remain separate. Declared/effective/unknown limits and permission values are distinguished, sensitive data is omitted, and no persistent parallel registry is created.
- AC-012: Existing supported setup/update/disable/reactivate/migration/removal paths cover applicable plugin/project/user layers, repeat calls, ID collisions, stale owned paths, shared references and partial failures. Regression evidence confirms no duplicate product registration, silent scope broadening, foreign configuration loss, policy override or loss of an intentionally retained product capability.
- AC-013: MCP-App capability, unsupported-host behavior and the existing text/document fallback have explicit evidence. A successful server connection, tools/list or resource response cannot be reported as App rendering or working interaction. Any claimed native App result requires fresh rendering/interaction evidence; absent native evidence remains explicit without fabricated qualification.
- AC-014: Cleanup distinguishes owned registration removal, verified process/session shutdown and host-owned shared App data. Completion/abort/repetition preserve unrelated MCPs and App storage. Updated configuration with an older running session is identified as a freshness/reload boundary; the product reports the next supported action without automatic restart.

## 6. Existing Source Of Truth

- packages/cli/lib/mcp-lifecycle/plugin-runtime.js and package.js own the observed plugin launcher, package lifecycle and executable claims; their existing tests and ownership/publication rules remain authoritative.
- packages/mcp-server/src/worker.js, worker-entry.js, facade and current command transport own execution and failure classification; existing MCP safety/command/whole-flow and protocol tests remain their proof owners.
- packages/core/lib/control-state/ owns canonical operations, transactions, durable receipts and recovery. MCP transport never supplies a second gate or truth authority.
- Existing supported Codex installer/build/generated runtime and installation marker own candidate distribution; .agdf/control/CONTEXT_GRAPH.md and SOT_REGISTRY.md retain repository ownership conventions.
- run-uat-content-readiness-20261014-01/QUALIFICATION_SUMMARY.md and evidence/live-tp-review-dispatch-preliminary.log, live-code-dispatch-preliminary.log and mcp-flow.log are protected observed evidence, not root-cause proof or approval for this new Run.
- Existing guided MCP activation, cross-host runtime integrity and review remediation Runs retain their installation/host/release scopes. This Run addresses the newly observed startup/execution failure mechanism and transfers no prior approvals.
- .codex/config.toml contains the two observed Cockpit test registrations; /Users/arndtgold/.codex/config.toml contains the observed decision-probe registration. These and their exact installed/test entrypoints are read-only discovery evidence until the scoped lifecycle implementation is approved. The regular plugin mcp.json and existing host-specific configuration owners remain authoritative for product registration; do not invent a second registry.
- packages/cli/lib/mcp-dispatch-runtime.js and packages/mcp-server/src/server.js, ui-capability.js and cockpit-resource.js contain existing server/App capability, resource and view boundaries. The current actual tool catalog is a session observation, not a durable configuration authority.
- Codex owns its config.toml layers, plugin configuration, native approvals and MCP client state. Official reference: https://learn.chatgpt.com/docs/extend/mcp#configure-with-configtoml. Host behavior must be checked against the installed host and applicable policy; a generic default is not proof of an effective setting.

## 7. Risks And Unknowns

- The two startup codes can represent different causes. Which underlying exception, lock, publication state or claim condition caused each remains to be established.
- A ten-second worker default is a code fact. Whether legitimate work, repeated expensive inspection, scheduling, lock contention or response delivery exhausted it is unresolved.
- Killing a worker after a deadline can overlap an already committed operation. Preserve current uncertain-effect/receipt recovery rather than interpreting termination as rollback.
- Warm success does not qualify cold startup, concurrency or a different installed generation. Repeatable final candidate evidence and bounded workload assumptions must be designed.
- Startup diagnostics and performance optimization can accidentally weaken integrity or leak private data; retain least disclosure, exact provenance and negative checks.
- Shared lifecycle owners overlap earlier architecture work. Brownfield Review must confirm boundaries before design; unrelated source and approved artefacts remain protected.
- Direct installed CLI/STDIO qualification is the requested minimum. Fresh native UI, other hosts/OS and universal failure-free operation are not promised by local results.
- Multiple observed processes can be normal per-client ownership. Confirm process/session and registration ownership before cleanup; shutdown behavior and host reload requirements need an explicit design rather than automatic restart.
- A single product entry is the intended default, not permission to collapse independently required runtime boundaries. Brownfield Review and design must determine whether existing Cockpit capability can reuse the regular endpoint and which names Codex actually exposes.
- The two Cockpit test registrations currently configure 20-second startup and 15-second host tool limits, distinct from the internal worker's 10-second default. Preserve these layers in the causal comparison; configuration values alone do not explain a failure.
- Managed policy, configuration precedence and per-client freshness may change the effective host state. Report unavailable resolution instead of treating raw files or generic defaults as the effective state.
- Product consolidation could remove the currently separate Cockpit opener if performed as cosmetic cleanup. Preserve required capabilities, evidence their actual owner and avoid silently replacing live product behavior with a test build.
- MCP App capability declaration is not UI initialization, rendering or working interaction. A fresh UI observation may need a deliberate host action; missing observation must remain visible and must not be bypassed by a synthetic client.
- Clearing the host's MCP-App data affects more than AGDF and cannot substitute for scoped registration/session cleanup. Shared references and ongoing clients require precise ownership and exit criteria.

## 8. Next Step

Review this exact requirement and approve with Approval: UR. Then perform the bound Brownfield Review, choose the smallest justified delivery mode and determine the causal investigation, design and qualification plan before production changes.

## AGDF Approval Summary (de; source=en)

- Problem: Startfehler und Antwortzeitlimits treffen auf eine verteilte Host-Konfiguration: Plugin-AGDF, projektbezogene Cockpit-Prüfbauten und benutzerweiter temporärer Decision-Probe. Gemeinsame Zuständigkeit für Einrichtung, Update und Entfernung fehlt als geprüfter Ablauf. Mehrere Prozesse sind belegt, ihre Rolle als Fehlerursache ist offen.
- Ziel: Ursachen dauerhaft beheben und einen kohärenten Codex-Produktbetrieb schaffen: AGDF als regulärer Einstieg, separates AGDF Cockpit nur bei technischer Notwendigkeit, Tests ausdrücklich temporär. Konfiguriert, gestartet, Werkzeuge verfügbar und App tatsächlich dargestellt werden unterschieden. Herkunft, Hostrechte, Transaktionen und ursprüngliche UUID bleiben geschützt.
- Betroffene: Das Plugin unterstützt Coding-Agenten; der Nutzer soll keine unnötigen Unterbrechungen und Wiederholungen erleben. Maintainer brauchen konkrete sichere Fehlerdiagnosen.
- Umfang: Ursachen und Einzel-/Mehrclient-/Diagnosebetrieb prüfen. Bestehende Owner führen Produktnamen, Plugin-/Projekt-/Benutzereinträge sowie Einrichtung, Update, Deaktivierung, Migration und Entfernung zusammen. Herkunft, Scope, Laufzeitstand, Berechtigungen, Timeout-Schichten und Sitzungsfrische nachvollziehbar anzeigen. Verifizierte Tests gezielt bereinigen und künftigen Cleanup absichern. Finalen installierten Kandidaten und wirksame Konfiguration prüfen; App-Nachweise gesondert erfassen.
- Nicht-Ziele: Keine zweite Registry oder Lifecycle-Implementierung, neue Freigabeautorität, schwächere Schutzprüfung, unbegrenzte Zeit, automatische Neustarts, breitere Hostrechte oder Git-/Veröffentlichungsaktion. Keine pauschale MCP-/Temp-Datei-Löschung, ungeprüfte Prozessbeendigung, fremde App-Kontoänderung oder Löschung gemeinsamer MCP-App-Daten.
- Akzeptanz: Ursachenbelege, Vorher-/Nachher-Regressionen und gemessene Grenzen. Wiederholbare Einrichtung, Update und Entfernung über bestehende Owner erhalten fremde Konfiguration, technische IDs und erforderliche Fähigkeiten. Keine Doppelregistrierung oder stille Scope-Erweiterung. Zustandsnachweise trennen Konfiguration, Start, Discovery und App-Darstellung; Tests haben sicheren Cleanup auch nach Abbruch. Exakter installierter Kandidat, Schutzprüfungen sowie Reviews und neue QA/UAT bleiben gebunden.
- Quellen: Bestehende Lifecycle-/Claim-, Host-Konfigurations-, Worker-/Transport-, App-Ressourcen- und Core-Operationsbesitzer; konkrete Konfiguration, Fehlerlogs und tatsächlicher Toolkatalog. Codex bleibt Autorität für wirksame Einstellungen, Rechte, Sitzungen und App-Darstellung. Keine zweite Registry oder übertragenen Freigaben.
- Risiken: Ursachen offen; mehrere Clients beweisen kein Leck. Effektive Hostwerte können von Rohdateien abweichen; alte Sitzungen können alten Code nutzen. Cleanup verlangt Besitzprüfung, Zusammenführung muss den Cockpit-Öffner erhalten. Serveraktivierung beweist keine App-Darstellung. Native Modell-/UI-/andere Plattformprüfung bleibt ausdrücklich begrenzt.
- Nächster Schritt: Approval: UR erlaubt Brownfield Review und die Auswahl des passenden Delivery-Pfads. Die neue Produktionskorrektur ist noch nicht implementiert.
