# UR: Companion core in Core: host-neutral run view, MCP events and figure states

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-11-05
Owner: Arndt Gold

## 1. Problem

The AGDF companion ("Begleiter") exists only as a Claude Code mod under `plugins/agdf/host-templates/claude/companion/`. Its central concepts are implemented there and nowhere else:
- how a run is shown (state/mood, reason, gate path, next step, run list, missing approval);
- which moments are worth telling the human (notices);
- which figure states exist and what they mean.

This causes three concrete problems, observed on 2026-11-05:

- **No reuse for other hosts.** Codex has no mod mechanism like Claude. A Codex surface (for example the existing Cockpit MCP App in `packages/control-ui`) cannot reuse the companion's logic. It would have to re-implement it.
- **Divergence from MCP.** The companion projects run state on its own, while the MCP status card does the same through another path, so the two disagree. For the same run the companion shows "…request exact approval Approval: UR" as next step, the status card "formulate and persist the UR". The companion also hides runs it cannot read: in projects with only legacy v2 runs it says "No open runs in this project", while MCP reports `control_layout_unsupported`.
- **Blind to what the agent does.** The companion only polls run files every 30 seconds. It cannot react to the AGDF MCP calls the agent makes (record, prepare, approve, revise, closeout), and it has no facts to review them. In a native Claude CLI probe on 2026-11-05 a model silently corrupted base64 material in one of three transfers. The corrupted UR was recorded, and no human-facing surface showed it.

## 2. Goal

The host-neutral concepts of the companion live in Core and serve every host:
- one run view;
- one event model derived from the AGDF MCP operations;
- one set of figure states with texts.

The Claude companion and the MCP status card both use them, and a Codex surface can build on them later without its own logic.

## Affected Users

- Project owners who follow AGDF runs through the companion (Claude today, Codex next) and need a truthful, consistent picture of run state and of what the agent does.
- Agents and hosts that read AGDF status through MCP and must see the same next step as the companion.
- Maintainers of AGDF host adapters, who should add a host surface without duplicating run semantics.

## 3. Scope

1. **Shared run view in Core.** One projection returns everything the companion and the status card show for a run and for a project:
   - state/mood and reason;
   - gate path and missing approval;
   - localized next step and run list;
   - an explicit diagnosis for unreadable or unsupported runs and control stores (count and reason).

   The MCP status card and the Claude companion both use it. Next-step text and missing approval then agree.
2. **Event model from AGDF MCP operations.** Core defines a small set of human-relevant events, derived from the outcomes of the AGDF MCP write and dispatch operations. The AGDF MCP server observes them on the server side, so the agent cannot shape them. Events include at least:
   - approval requested and approval recorded;
   - write rejected, effect unknown and recovery required;
   - run completed.

   The events are available to host surfaces without host hooks.
3. **Review facts for recorded material.** For `agdf_record` material and recordings, events carry the facts a human needs to check what was recorded: a readable preview of the staged content, size and digest, and consistency with a referenced source file. These are facts only, no blocking and no own format rules.
4. **Figure states and texts.** The companion's figure states, their meaning and their user-facing texts live in Core and in the existing interaction locale catalog. Hosts only decide how to draw them.
5. **Claude companion uses the core.** The Claude companion renders from the shared run view, events and figure states, with no own run semantics. Its host-specific parts stay in the mod: drawing, refresh triggers, stored UI choices, sound.

## 4. Non-Goals

- No Codex user interface in this run: no Cockpit or Decision View changes and no Codex pet. That follows in a separate run after a native capability check of Codex on macOS.
- No approval through the companion: neither a click-to-approve button nor delegated or rule-based approval.
- No gating or blocking of MCP calls by the companion, and no companion writes under `.agdf/control`.
- No change to MCP write semantics, gate rules, approval formulas, result schemas or error codes.
- No migration of legacy v2 control stores; they are only diagnosed.

## 5. Acceptance Signals

- For the same run, the Claude companion and the MCP status card show the same state, gate path, missing approval and next step.
- In a project with only legacy or unreadable runs, the companion names their count and reason instead of "No open runs". In a mixed project it lists readable runs and still shows the hint.
- A host-neutral consumer that is not the Claude mod (for example a test harness) can render the same run view, events and figure state from Core outputs alone.
- After an AGDF MCP write, the corresponding event is available without waiting for a file poll. Events for approval requested, rejected, effect unknown and run completed are produced from real MCP outcomes.
- For a recorded UR, the event shows a readable preview and the digest of what was actually recorded. A corrupted transfer like the one observed on 2026-11-05 becomes visible to the human.
- Existing companion behavior otherwise stays unchanged, as do its tests and the MCP tool results.

## 6. Existing Source Of Truth

- Claude companion modules: `plugins/agdf/host-templates/claude/companion/`. Run reading and projection: `run-state.mjs`, `core.mjs`. View: `view.mjs`, `state.mjs`, `gate-bar.mjs`. Notices: `notice.mjs`. Figure: `figure.mjs`. Texts: `locales.json`, `localization.mjs`. Host adapter: `register.mjs`.
- Core run projection and gate policy: `packages/core/lib/control-state/run-state-document.js`, `packages/core/lib/control-evaluation/gate-policy-pure.js`, `run-state-policy.js`.
- MCP status card: the `gate-check` status-card variant in `packages/core/lib/control-inspect/` and its presentation.
- MCP server and tool-result projection: `packages/mcp-server/src/server.js`, `generation-runtime.js`, `packages/cli/lib/mcp-dispatch-runtime.js`, `packages/core/lib/mcp-tool-errors.js`.
- Interaction locale catalog: `plugins/agdf/meta/agdf-interaction-locales.json`.
- Codex surfaces for later reuse: `packages/control-ui/src/mcp/` (Cockpit, Decision View).
- Prior companion runs and decisions are archived under `.agdf/control/archive/`.

## 7. Risks And Unknowns

- **Event delivery and lifetime.** Whether events are kept in the MCP server process only or durably, how a host surface reads them (Claude mod via files, Codex via MCP App), and how long they live. To be decided in SD without creating a second source of truth next to Run state.
- **Privacy and size of review facts.** Material previews can be long or sensitive. Bounds and redaction belong to PRD/SD.
- **Cross-host behavior.** MCP App capabilities on Codex are not verified natively on this machine. This run must not assume them.
- **Payload and compatibility chain.** Moving modules into Core changes the runtime payload and the compatibility record, and may touch the Copilot payload budget.
- **Structured depth.** Brownfield Review must decide the structured depth; the event model touches the MCP runtime and host contracts.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

After approval, Brownfield Review sizes and routes the work before PRD.

## AGDF Approval Summary (de; source=en)

- Problem: Die zentralen Konzepte des Begleiters stecken nur im Claude-Mod: wie ein Run dargestellt wird, welche Momente gemeldet werden und welche Figurzustände es gibt. Codex kann sie nicht nutzen. Der Begleiter rechnet den Run-Zustand anders aus als die MCP-Statuskarte, daher unterschiedliche „nächste Schritte“ und verschwiegene Alt-Runs. Auf die MCP-Aufrufe des Agenten reagiert er nicht, deshalb blieb etwa ein verfälschter UR am 05.11. unbemerkt.
- Ziel: Die hostneutralen Konzepte des Begleiters liegen in Core: eine Run-Ansicht, ein Ereignismodell aus den AGDF-MCP-Operationen sowie Figurzustände mit Texten. Claude-Begleiter und MCP-Statuskarte nutzen sie, eine Codex-Oberfläche kann später ohne eigene Logik darauf aufbauen.
- Betroffene: Projektverantwortliche, die Runs über den Begleiter verfolgen; Agenten und Hosts, die den Status über MCP lesen; Pfleger der Host-Adapter.
- Umfang: gemeinsame Run-Ansicht in Core, inklusive Diagnose unlesbarer oder nicht unterstützter Runs. Ereignismodell, das der AGDF-MCP-Server selbst beobachtet: Freigabe angefragt bzw. erfasst, abgelehnt, Wirkung unbekannt, Wiederherstellung nötig, Run abgeschlossen. Review-Fakten zu erfasstem Material: Vorschau, Größe, Digest, Abgleich mit der Quelle. Figurzustände und Texte im zentralen Sprachkatalog. Der Claude-Begleiter wird auf diesen Kern umgestellt.
- Nicht im Umfang: keine Codex-Oberfläche (eigener Run nach einer Prüfung auf macOS), keine Freigabe über den Begleiter, kein Anhalten von MCP-Aufrufen, kein Schreiben durch den Begleiter, keine Änderung an MCP-Schreibsemantik, Gates oder Fehlercodes, keine Migration alter Bestände.
- Abnahme: Begleiter und Statuskarte zeigen für denselben Run dasselbe. Alt- und unlesbare Runs werden mit Anzahl und Grund genannt. Ein hostneutraler Verbraucher kann alles allein aus Core-Ausgaben darstellen. Ereignisse kommen ohne Warten auf die Dateiabfrage aus echten MCP-Ergebnissen. Ein verfälschter UR wird über Vorschau und Digest sichtbar. Das übrige Verhalten und die Tests bleiben unverändert.
- Quellen: Begleiter-Module unter `plugins/agdf/host-templates/claude/companion/`, Core-Projektion und Gate-Regeln, Statuskarte in `control-inspect`, MCP-Server und Fehlerprojektion, Sprachkatalog `agdf-interaction-locales.json`, Codex-Oberflächen in `packages/control-ui/src/mcp/`.
- Risiken: Zustellung und Lebensdauer der Ereignisse ohne zweite Wahrheitsquelle (Entscheidung im SD). Datenschutz und Größe der Materialvorschau. Codex-Fähigkeiten sind hier nicht nativ geprüft. Folgekette über Nutzlast und Kompatibilitätsnachweis. Die strukturierte Tiefe entscheidet die Brownfield Review.
- Nächster Schritt: UR prüfen und nur mit `Approval: UR` freigeben. Danach folgen Brownfield Review und Routing vor dem PRD.
