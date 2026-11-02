# UR: Embedded AGDF Cockpit for Codex

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-05
Owner: Arndt Gold
Run: agdf-cockpit-mcp-app-20261005-01
Language: en

## 1. Problem

The existing React cockpit opens in a local browser and exposes run state and registered documents. The user wants to work with that information inside Codex, where the conversation can explain evidence and support the next decision. A large dashboard inside a narrow chat card is difficult to read. Manually copying documents into the chat loses the selected run, source identity and freshness. The maintained Context Graph also needs to become useful when examining a run rather than remain a separate file the user must locate.

## 2. Goal

Deliver an embedded MCP app using the existing AGDF cockpit and MCP server. The first complete journey is: open the cockpit in Codex, select a run, examine a registered artefact and its explicitly related Context Graph entries, and use that checked selection to ask Codex a question. The user should spend less time locating and transferring evidence and should see which sources the conversation is using.

## Affected Users

The user working on AGDF delivery in Codex, including review and human gate decisions. This slice serves the current local project workflow; support for other hosts must not be claimed without corresponding evidence.

## 3. Scope

- Reuse the current React cockpit and canonical read services. Extend the existing MCP integration with the presentation and read capabilities required for the journey, preserving existing dispatch and inspection behavior.
- Fit the Codex presentation surfaces that are actually available. Keep any inline entry compact; use a host-supported panel or expanded presentation for run, document and context exploration. Detect capabilities rather than assume all ChatGPT presentation features exist in Codex.
- Show the selected run's objective, evaluated status, current revision, next allowed action and evidence sources. Selection itself does not select a delivery run for a subsequent agent action or authorize work.
- Present registered artefacts and explicitly referenced Context Graph entries with identifiable source locations and missing or unavailable references. The existing maintained graph remains canonical; the app must not invent relationships or replace it with a separate knowledge store.
- Provide a deliberate action to make the checked selection available to the Codex conversation and ask a contextual question. Include the project/run identity, revision and source provenance needed to validate the selection again. Define handling for changed, stale, unavailable and oversized context during downstream preparation.
- Keep selection and view state temporary. Preserve the existing bounded read boundary and distinguish project content from instructions. Continue through the existing deliberate, bound gate workflow when an actual approval or delivery action is requested.
- Document local setup and the supported capability boundary. Verify the first journey in the actual Codex host, alongside protocol and automated evidence. If the host lacks a required capability, expose that limitation and the existing browser fallback rather than claim embedded completion.

## 4. Non-Goals

- No new approval writer, approval by selection/click, automatic run continuation or changed gate semantics.
- No replacement dispatcher, execution control system, universal enforcement guarantee or parallel source of control state.
- No automated verdict comparing all requirements with delivered code, comprehensive graph editor or inferred knowledge graph in this first slice. Those remain possible later increments.
- No remote service, multi-user authentication, public plugin distribution, publication, release, Git commit or push in this scope. Local integration needed for verification must remain explicit and bounded.
- No transfer of approvals from the completed browser-cockpit run or related architecture and MCP runs.

## 5. Acceptance Signals

1. The user completes the open/select/inspect/contextual-question journey using the embedded application in a real Codex session; the observed presentation surface and capabilities are recorded.
2. Run state and artefact content agree with the canonical read owners. Selecting another run switches the visible and model-facing context coherently, without retaining undisclosed sources from the prior selection.
3. The user can inspect explicitly related Context Graph entries and their sources. Missing links, absent entries and unavailable documents are visible; no inferred association is presented as a maintained fact.
4. The contextual question reaches the conversation with a bounded, source-identifiable selection. A concurrent revision or source change, an unavailable source or unsupported context capability produces an explicit refresh, rejection or limitation according to the eventual design, never a silent claim of current evidence.
5. UI reads and context transfer do not write canonical control state or approve a gate. Existing approval and delivery validation remain effective, including fresh target/run/revision checks for a later requested action.
6. The supported compact and expanded surfaces remain usable with readable documents, clear focus and accessible controls. Exact host sizing is established by observation rather than an invented fixed chat width.
7. Existing MCP dispatch/inspection and the browser cockpit retain their validated behavior. Documentation separates implementation/protocol evidence from actual installed and live-host evidence.

## 6. Existing Source Of Truth

- The user's requests in this conversation: focus on the AGDF cockpit, reuse the maintained Context Graph, respect the smaller chat surface and proceed with an embedded MCP app.
- `packages/control-ui/` and `packages/core/lib/control-inspect/cockpit.js` for the existing cockpit and read projection; `packages/mcp-server/` and the Core composition under `packages/core/lib/index.js` for the existing MCP adapter and service ownership.
- Canonical run state and registered artefacts under `.agdf/control/`, including `.agdf/control/CONTEXT_GRAPH.md`; normative rules under `plugins/agdf/meta/contracts/` remain authoritative for activation, binding and human decisions.
- `docs/architecture/01-systemarchitektur.md`, `03-agentenkontrolle-zielbild.md`, `04-mcp-schnittstellen.md` and `05-paketstruktur.md`. Proposed architecture is planning input, not implementation or gate authority.
- The completed `agdf-control-cockpit-20261005-01` run supplies reusable implementation and evidence only. Related concept and MCP inspection runs have different scopes.
- Official OpenAI MCP app and UI guidance: https://developers.openai.com/plugins/build/chatgpt-ui and https://developers.openai.com/plugins/concepts/ui-guidelines; official Codex documentation and live checks establish actual host support.

## 7. Risks And Unknowns

Brownfield Review must establish which React and read-service pieces can be reused directly, how graph references are represented and which existing packaging boundaries apply. PRD must make the contextual-question interaction and failure outcomes precise. SD must select the MCP resource/bridge contract, bounded context representation, source revalidation and local integration path. The current Codex host may expose fewer capabilities than the shared protocol or ChatGPT documentation. Initial host feasibility should be checked before committing to detailed UI design. Existing workspace changes and independently governed work require scope isolation. These are design and verification questions; they do not change the requested first journey.

## 8. Next Step

Review this UR and approve only with `Approval: UR`. Approval permits the existing Brownfield Review and Mode/Slice Decision for this run; implementation requires the subsequent applicable prerequisites.

## AGDF Approval Summary (de; source=en)

Das vorhandene React-Cockpit soll als eingebettete MCP-App in Codex nutzbar werden. Heute muss der Anwender zwischen Browser, Dokumenten und Chat wechseln und Kontext manuell übertragen. Ziel der ersten Lieferung ist ein vollständiger Weg: Cockpit öffnen, Run auswählen, registriertes Artefakt und ausdrücklich zugeordnete Context-Graph-Einträge ansehen und mit diesem geprüften Kontext eine Frage an Codex stellen.

Betroffen ist der Anwender im lokalen AGDF-Projektworkflow mit Codex. Wir verwenden das vorhandene Cockpit, die kanonischen Lesedienste und den bestehenden MCP-Server. Eine kompakte Einstiegskarte und die tatsächlich verfügbaren größeren Host-Flächen sollen lesbare Dokumente und klare Bedienung ermöglichen. Run, Revision, Quellen und fehlende Verweise bleiben sichtbar. Auswahl und Ansicht sind temporär; der gepflegte Context Graph bleibt die maßgebliche Quelle.

Abnahmefähig ist der Umfang, wenn dieser Weg in einer echten Codex-Sitzung funktioniert, angezeigte Daten mit den kanonischen Quellen übereinstimmen, ein Run-Wechsel keinen verdeckten alten Kontext hinterlässt und die Frage mit begrenztem, nachvollziehbarem Kontext im Chat ankommt. Geänderte oder fehlende Quellen und nicht unterstützte Host-Fähigkeiten müssen ausdrücklich behandelt werden. Bestehende MCP-Funktionen und das Browser-Cockpit bleiben nutzbar.

Nicht enthalten sind neue Freigabeschreiber, Freigaben durch Klick oder Auswahl, automatische Fortsetzung, ein Graph-Editor, ein umfassender automatischer Soll-Ist-Prüfer, öffentliche Verteilung, Release oder Git-Aktionen. Jede spätere Aktion bleibt an die bestehende Ziel-, Run-, Revisions- und Freigabeprüfung gebunden. Frühere Freigaben gelten nicht für diesen Umfang.

Quellen sind die vorhandenen UI-, Core- und MCP-Pakete, `.agdf/control/`, die Runtime-Verträge und die Architektur-Dokumentation. Das Architektur-Zielbild ist Planungseingabe. Wiederverwendung, Graph-Verweise, Packaging, Kontextübertragung und tatsächliche Codex-Fähigkeiten werden im Brownfield Review und der anschließenden Produkt- und Lösungsplanung geklärt; Host-Machbarkeit wird früh geprüft. Nächster Schritt nach `Approval: UR` ist Brownfield Review mit Mode/Slice Decision, anschließend die erforderliche Planung vor Umsetzung.
