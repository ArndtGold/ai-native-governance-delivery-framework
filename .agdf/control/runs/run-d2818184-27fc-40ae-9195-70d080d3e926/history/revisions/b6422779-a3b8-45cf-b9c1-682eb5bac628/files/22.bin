# SD: Companion core in Core: host-neutral run view, MCP events and figure states

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-11-05
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

The companion's host-neutral concepts move into a new Core area, `packages/core/lib/companion/`. The Claude mod and the MCP runtime both consume it. Delivery follows the approved two increments (PRD decision P3). This version replaces the pure split of the gate-check evaluator: T-002 sizing showed it would rework about 25 central modules, and a native probe confirmed that the Claude companion can obtain a node-side run view through `$.process.run` (evidence `T-002-design-finding-01.md`, owner decision 2026-11-05).

**Increment 1: shared run view.**
- `run-view.js` projects a run view from the unchanged `evaluateGateCheck` report of each active run plus a store diagnosis. The node reader builds it for all runs of one project root.
- A new read-only local command `run-view` of the plugin runtime (`agdf-local.js run-view --dir ROOT --json --language TAG`) prints the versioned run view (`run-view/1`). It writes nothing.
- The MCP/CLI status card stays exactly as it is. Companion and status card show the same status, gate, path, missing approval, next step and blocking reason because both come from the same evaluator, including doctor blocks.
- Store and run diagnostics (unsupported layout, unsupported run version, invalid or too large run state) are part of the view.
- `figure-state.js` derives the figure mood and reason from the run view. It replaces the companion's `state.mjs` rules; the run view carries the derived figure state.
- All companion texts move into the central interaction locale catalog.
- The Claude companion calls the command with `$.process.run` and imports no Core module.

**Increment 2: events and review facts.**
- `events.js` (pure) maps the final outcome of an AGDF MCP tool call to zero or one event of schema `companion-event/1`.
- The MCP server appends events to a bounded JSONL journal in the AGDF plugin data root at the final result projection. That point serves success and failure paths in facade and generation, so rejected calls and thrown failures are seen too.
- Review facts are computed in the runtime: preview, size, digest and source match. Drift of declared sources is part of the run view.
- The companion polls the small journal every 2 seconds, refreshes the run view on new events and shows notices per decision P1.

## 2. Ownership And Source Of Truth

- **Run state:** RUN_STATE.md with its typed records and Run Operations stays the only source of truth. The run view is a derived projection; it is never persisted.
- **Gate rules:** `gate-check.js` with `gate-policy-pure.js`, the doctor and the readiness modules stays the single owner of all status-field rules. The run view consumes its report and never re-derives a rule.
- **Events:** the journal is a notification channel only, not a source of truth. Durable facts (approval recorded, run completed) are confirmed against the run view before the companion shows them as final. Transient outcomes (rejected, effect unknown) exist only as events.
- **Texts:** `plugins/agdf/meta/agdf-interaction-locales.json` (existing catalog and validator) owns figure-state names and companion texts.
- **Presentation:** the Claude mod (`plugins/agdf/host-templates/claude/companion/`) keeps drawing, refresh triggers, stored choices (`companion-state.json`) and sound; it obtains the run view through the read-only command and holds no run semantics.
- **Accountable owner:** Arndt Gold.

## 3. Architecture Decisions

- SDD-001: Introduce `projectRunView(reports, diagnosis)` in `packages/core/lib/companion/run-view.js`, which projects the run view from the unchanged `evaluateGateCheck` report of each active run plus the store diagnosis, and a node reader `readRunView(root, options)` that builds it for all runs of one project root and is exposed by the new read-only local command `run-view` with versioned JSON `run-view/1`; rationale: the T-002 sizing showed that a pure split reaches 82 modules, 34 of them importing Node, while a node-side view reuses the one existing evaluator; consequence: every consumer receives exactly the status card semantics, and the Claude companion needs a host process call to obtain them.
- SDD-002: Do not split `evaluateGateCheck` and keep doctor, readiness, traceability, decision-content and next-step rules with their single node owner, so CLI and MCP status card bytes stay unchanged by construction while the T-001 golden comparison remains the regression guard; rationale: one rule owner removes the observed next-step divergence without touching the central path, and parity then covers runs with doctor findings too; consequence: each companion refresh costs one node process, measured at 0.5 to 0.65 s on the owner's Windows machine.
- SDD-003: The run view contains a project diagnosis: store status from `config.json` (`control_layout` must be `run-folders-v1`, else `control_layout_unsupported`) and a per-run reason (`run_version_unsupported`, `run_state_invalid`, `too_large`, `missing`) with counts; rationale: the same reason codes MCP already uses make companion and MCP agree on legacy stores; consequence: readable runs keep being listed next to the diagnosis.
- SDD-004: `deriveFigureState(view)` in `packages/core/lib/companion/figure-state.js` owns the mood set (`laeuft`, `baut`, `wartet`, `blockiert`, `fertig`, `bereit`) and its rules, the run view carries the derived state, and companion texts move from `companion/locales.json` into a `companion` section of `agdf-interaction-locales.json` validated by the existing catalog validator; rationale: rules and wording become host-neutral and reusable by Codex; consequence: the catalog grows, which affects the runtime payload and requires a compatibility re-record.
- SDD-005: Event model `companion-event/1` in `packages/core/lib/companion/events.js` with fields schema_version, id, at, root, run_id, gate, kind, outcome, reason, operation_id and review, kinds approval_requested (presentation.deliver accepted), approval_recorded, write_rejected (not_dispatched), effect_unknown, recovery_required, run_completed (closeout.record accepted), material_staged (seal accepted) and document_recorded (step.record or artefact.record accepted), produced by the pure function `deriveEvent(toolName, input, result)` from the final tool result; rationale: events come from real MCP outcomes and not from host hooks, so the agent cannot shape them; consequence: kinds outside the P1 toast list stay pane-only.
- SDD-006: The MCP server appends one line per event to `companion/events.jsonl` below the plugin data root at the final result projection after the result is final, on success and failure paths and once in the executing process (the direct facade runtime or the generation), using the data root the launcher already receives (`CLAUDE_PLUGIN_DATA` on Claude, the absolute data argument on Codex) handed into the runtime context, bounded to 256 KiB with one rotation file `events.1.jsonl`, and write errors are swallowed without changing any tool result; rationale: no write under `.agdf/control`, no second source of truth, and the directory is removed on uninstall like the companion state; consequence: concurrent MCP servers may interleave lines or lose a few events at rotation, which the reader tolerates by skipping malformed lines.
- SDD-007: The companion reads the journal every 2 seconds with a bounded read and keeps the 30-second check and the check after `turn.complete`, and it calls the run-view command only when a run file fingerprint changed (RUN_STATE and documents entries of open runs plus `config.json`, from `$.fs.list` size and modification time), an event of the current project root newer than the last seen id arrived, or the language changed, while a missing or unreadable journal shows "events unavailable"; rationale: this meets AC-005 without file watching and keeps idle cost to directory listings; consequence: a change outside the fingerprint becomes visible with the next event or fingerprint change.
- SDD-008: Review facts: on seal the runtime records preview (at most 40 lines or 4 KiB with a truncation flag), bytes and digest from the material store with source_match "not_determinable" for staged material (P4), recordings with a run-local source path record source path, recorded digest and source_match "match", and the run view compares declared sources from Run Operations with their current canonical digest through the existing node digest owner to raise a drift warning (AC-008); rationale: decision P4 forbids an MCP schema change, so only declared sources are compared; consequence: no SHA-256 implementation in the mod.
- SDD-009: No new MCP operation and no schema change in this run, the host-neutral contract being the Core exports (`run-view`, `figure-state`, `events`), the versioned journal format and the read-only local command `run-view`, with event and run-view exposure through `agdf_inspect` decided in the Codex run; rationale: the PRD makes Codex UI and schema changes non-goals and the `agdf_inspect` discovery budget stays untouched; consequence: Codex consumption needs that later run.
- SDD-010: The Claude companion calls `node` with the plugin's `runtime/agdf-local.js run-view` through `$.process.run` with a 10-second timeout, parses `run-view/1`, keeps the last good view with a stale marker when a call fails and shows "run view unavailable" with the reason when none exists, imports no Core module (its `core.mjs` bridge and the run logic of `state.mjs` and `run-state.mjs` are removed), and the integrity test asserts that the companion spawns only this read-only command and writes nothing under `.agdf/control`; rationale: `node` on PATH is already required by the plugin's SessionStart hook and the native probe confirmed `$.process.run` in the Claude desktop app; consequence: a surface without `$.process` shows "run view unavailable" instead of a divergent view.

## 4. Integration Points

- `packages/core/lib/control-evaluation/gate-check.js` (`evaluateGateCheck`, unchanged) and `packages/core/lib/control-read/snapshot.js` (`captureControlScope` for the reader): SDD-001, SDD-002.
- Run discovery and parse findings (`run-state-resolver.js`, `run-state-parser.js`, `control-layout.js`): SDD-003.
- Local runtime command registry (`packages/cli/lib/cli/command-registry.js`, `parse-args.js`, runtime handlers) and the plugin runtime entry `runtime/agdf-local.js`: SDD-001, SDD-010.
- Final result projection in `packages/mcp-server/src/server.js` and `packages/mcp-server/src/generation-runtime.js` (success and `catch` paths), `packages/cli/lib/mcp-dispatch-runtime.js` and the material store (`packages/core/lib/control-state/run-material.js`): SDD-005, SDD-006, SDD-008.
- `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` (data root resolution and hand-over into the runtime context): SDD-006.
- `plugins/agdf/host-templates/claude/companion/*.mjs` and `scripts/sync-package-assets.js` (bridge removal): SDD-007, SDD-010.
- `plugins/agdf/meta/agdf-interaction-locales.json` and its validator `packages/core/lib/interaction-catalog-validation.js`: SDD-004.
- No change to MCP tool schemas, result schemas, error codes, gate rules or approval formulas.

## 5. Constraints And Compatibility

- Status card output for unchanged inputs stays byte-identical in CLI and MCP; the T-001 golden comparison guards it.
- The PRD constraint holds: the companion imports no Core module, so no Node built-in reaches it, and it uses host access only (`$.fs` for its own files and listings, `$.process.run` for the one read-only command).
- The companion writes only `companion-state.json`; it never writes under `.agdf/control` and never gates hooks (AC-009). The `run-view` command is read-only.
- The journal writer must never fail or delay a tool result. Its write is synchronous append after the final result, with an upper size bound.
- The Copilot payload stays within `plugins/agdf/meta/copilot-payload-baseline.json` (measured 2026-11-05: 442 of 453 files, 4,510,405 of 4,717,872 bytes). New Core code is bundled into few files. A reviewed budget re-record follows only if needed, and the compatibility record is re-recorded.
- Windows and POSIX paths are supported: the journal `root` uses the MCP target path, and the mod compares roots after normalizing separators and case on win32.

## 6. Test And Evidence Strategy

- **Reuse first.** Existing companion suites (`claude-companion-test.js`, `-adapter-test.js`, `-integrity-test.js`), gate-check and status-card tests, MCP server suites (`test:protocol`, `test:run-command-flow`, `test:generation`) and CLI MCP suites cover unchanged behavior. They must stay green without weakened assertions (AC-011).
- **New proof per risk:**
  - Golden status-card comparison over the T-001 fixture set stays green throughout (byte stability, AC-011).
  - Parity test: run-view command output vs. status card fields for every fixture, including the doctor-finding run (AC-001).
  - Diagnosis tests with legacy v2, unsupported layout and mixed fixtures (AC-002, AC-003).
  - Host-neutral harness using only Core exports (AC-004).
  - MCP tool-path event tests through facade and plugin generation, per kind, including the failure paths (`not_dispatched` rejection, thrown failure), with timing below 30 s (AC-005, AC-006).
  - Review-fact tests: truncation; a source file changed after recording (drift warning); a reproduced staged corruption shown through the preview without a mismatch claim (AC-007, AC-008).
  - Companion process-boundary tests with a fake `$.process`: success, non-zero exit, timeout, malformed output, missing node, refresh only on fingerprint change or event (AC-001, AC-005).
  - Integrity and control-digest checks (AC-009).
  - Locale completeness for de/en (AC-010).
- **Placement:** targeted Run checks per increment before Code Review; required PR CI (`verify:ci` stages) before merge; no nightly is relied on.
- **Native evidence:** a live Claude desktop check of the companion with screenshots and measured refresh time as UAT input. Codex is out of scope.
- **Gaps stated now:** concurrent journal writers are covered by a bounded interleaving test, not by a multi-process stress run; `$.process` availability was probed in the Claude desktop app only.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Companion shows the run view projected from the same evaluateGateCheck report that renders the status card, including doctor blocks | `packages/core/lib/companion/run-view.js` over the unchanged `gate-check.js` | SDD-001, SDD-002 | none for the status card; one node process per companion refresh |
| AC-002 | Run view carries store and per-run diagnosis with counts and reasons; companion renders them | `run-view.js` diagnosis over `config.json` and run parse findings | SDD-003 | none — reuses existing reason codes |
| AC-003 | Readable runs listed next to the diagnosis | `run-view.js` project view | SDD-003 | none — additive view field |
| AC-004 | Core exports suffice to render view, events and figure state; harness proves it | `packages/core/lib/companion/` exports | SDD-001, SDD-004, SDD-009 | none — no host adapter in the harness |
| AC-005 | Journal written on final MCP outcome; mod polls it every 2 s and refreshes the run view on new events | final result projection; companion adapter | SDD-006, SDD-007 | Concurrent writers may interleave; reader skips malformed lines |
| AC-006 | Pure mapping from tool outcome to event kinds, written at the final result projection so failure paths produce their kinds | `packages/core/lib/companion/events.js` and the final result projection | SDD-005, SDD-006 | none — no change to tool results |
| AC-007 | Preview, bytes, digest and source match computed in the runtime and carried in events | material store and recording receipts | SDD-008 | Preview bounded by P2; journal size bound applies |
| AC-008 | Drift warning for declared run-local sources via run-view digest comparison with the node digest owner; staged material shows "not_determinable" | Run Operations receipts plus `artefactFileDigest` | SDD-008 | none — no second digest implementation |
| AC-009 | Companion stays observation-only; integrity test enforces the single read-only command and no control writes | companion adapter and integrity test | SDD-010 | none — existing guarantee made testable |
| AC-010 | Figure states and texts from the central catalog | `agdf-interaction-locales.json` `companion` section | SDD-004 | Catalog change requires payload check and compatibility re-record |
| AC-011 | Existing suites green; status card bytes stable; no schema or error-code change | existing tests and golden comparison | SDD-002, SDD-009 | Covered by golden comparison and unchanged schemas |

## 8. Risks And Open Questions

- Each companion refresh starts one node process (0.5 to 0.65 s measured). Mitigation: refresh only on fingerprint change, event or language change; the companion keeps the last good view meanwhile.
- `$.process` is documented for the CLI engine; it was verified in the Claude desktop app. Other surfaces without it show "run view unavailable".
- `node` must be on PATH, as already required by the plugin's SessionStart hook.
- Rotation races between several MCP servers may drop events. This is accepted because the journal is a notification channel, and the run view stays authoritative.
- Payload growth from the new Core modules, the command and catalog texts; measured before Code Review.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Split of evaluateGateCheck into capture and pure projection | before_sd | resolved | No split: the Core run view is projected from the unchanged evaluateGateCheck report and delivered through the read-only run-view command (owner choice 2026-11-05 after T-002 sizing and the native probe, SDD-001, SDD-002) | Arndt Gold |
| Event channel, lifetime and SoT boundary | before_sd | resolved | JSONL journal in the plugin data root written by the MCP server, bounded 256 KiB with one rotation file, notification only; durable facts confirmed against the run view (SDD-005, SDD-006) | Arndt Gold |
| Host-readable MCP surface for run view and events | before_sd | resolved | No new MCP operation or schema change in this run; the local run-view command serves the companion; MCP exposure decided in the Codex run (SDD-009) | Arndt Gold |
| Digest computation inside the mod | before_sd | resolved | No digest in the mod; drift uses the node digest owner inside the run view (SDD-008) | Arndt Gold |
| Companion event delivery cadence | before_sd | resolved | Journal read every 2 s plus the 30 s check and turn completion; the run-view command runs only on fingerprint change, event or language change (SDD-007) | Arndt Gold |
| Doctor findings in the companion | before_sd | resolved | The doctor runs inside the unchanged evaluateGateCheck that feeds the run view, so the companion shows doctor blocks like the status card; supersedes the captured-fact decision (SDD-002) | Arndt Gold |
| Event write location | before_sd | resolved | Final result projection on success and failure paths, once in the executing process, instead of postprocessToolResult (owner choice 2026-11-05, SDD-006) | Arndt Gold |
| Companion access to the run view | before_sd | resolved | `$.process.run` of the plugin runtime's run-view command with a 10 s timeout; last good view marked stale on failure; "run view unavailable" without any view (owner choice 2026-11-05, native probe in the desktop app, SDD-010) | Arndt Gold |
| Fixture set and golden snapshot contents | later_tp | deferred | TP selects the representative run fixtures (open UR, ready UR, PRD, structured internal steps, completed quick_task and structured run, legacy v2, mixed) | Arndt Gold |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)

- Ziel: Ein neuer Core-Bereich `packages/core/lib/companion/` trägt Run-Ansicht, Figurzustände, Ereignisse und Review-Fakten. Claude-Begleiter und MCP-Statuskarte zeigen dasselbe. Diese Fassung ersetzt die reine Aufteilung des Gate-Check-Bewerters, weil sie rund 25 zentrale Module umgebaut hätte.
- Umfang: Schritt 1 bringt eine Run-Ansicht, die der Core auf der Node-Seite aus dem unveränderten evaluateGateCheck-Bericht ableitet, mit Diagnose unlesbarer Bestände und Figurzustand. Ein neuer lesender Befehl `run-view` der Plugin-Laufzeit gibt sie als versioniertes JSON aus. Der Begleiter ruft ihn über `$.process.run` auf und importiert kein Core-Modul mehr. Texte wandern in den zentralen Katalog. Schritt 2 bringt Ereignisse aus den echten MCP-Ergebnissen: Der MCP-Server schreibt sie an der finalen Ergebnisprojektion, auch für abgelehnte und fehlgeschlagene Aufrufe, in ein begrenztes Protokoll im Plugin-Datenverzeichnis, der Begleiter liest es alle 2 Sekunden. Review-Fakten umfassen Vorschau, Größe, Digest und Abgleich mit angegebenen Quelldateien.
- Entscheidungen: SDD-001 und SDD-002 Run-Ansicht Node-seitig aus dem unveränderten Bewerter, kein Umbau von gate-check.js, die Statuskarte bleibt bytegleich, der Begleiter zeigt auch Doctor-Blockaden wie die Statuskarte. SDD-003 Diagnose mit den MCP-Grundcodes. SDD-004 Figurzustände und Texte im zentralen Katalog. SDD-005 bis SDD-007 Ereignismodell, Protokoll (256 KiB, eine Rotationsdatei, nur Benachrichtigung) und 2-Sekunden-Abfrage, der Befehl läuft nur bei geänderten Run-Dateien, neuen Ereignissen oder Sprachwechsel. SDD-008 Abweichungswarnung mit dem vorhandenen Node-Digest, kein SHA-256 im Mod. SDD-009 keine neue MCP-Operation und keine Schemaänderung. SDD-010 Begleiter über `$.process.run` mit 10 Sekunden Zeitlimit, bei Fehlern bleibt die letzte Ansicht als veraltet markiert.
- Risiken: Jede Aktualisierung startet einen Node-Prozess (gemessen 0,5 bis 0,65 Sekunden). `$.process` ist nur in der Desktop-App geprüft, andere Oberflächen zeigen „Run-Ansicht nicht verfügbar“. Node muss im PATH liegen, wie schon für den SessionStart-Hook. Bei mehreren MCP-Servern können Protokollzeilen verloren gehen.
- Nächster Schritt: SD prüfen und nur mit `Approval: SD` freigeben; danach folgt die angepasste TP-Fassung.
