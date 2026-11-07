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

The companion's host-neutral concepts move into a new Core area, `packages/core/lib/companion/`. The Claude mod and the MCP runtime both consume it. Delivery follows the approved two increments (PRD decision P3).

**Increment 1: shared run view.**
- `run-view.js` (pure) projects a run view from captured facts. Captured facts are config, RUN_STATE contents and the artefact contents a gate needs.
- `run-view-capture.js` (async, injected file access) collects those facts. Node callers pass `fs`; the Claude mod passes `$.fs`.
- The MCP/CLI status card reads its status fields (status, current gate, path, allowed, forbidden, next step, missing approval, blocking reason) from the same pure projection. Both surfaces are therefore identical by construction.
- Store and run diagnostics (unsupported layout, unsupported run version, invalid or too large run state) are part of the view.
- `figure-state.js` derives the figure mood and reason from the run view. It replaces the companion's `state.mjs` rules.
- All companion texts move into the central interaction locale catalog.

**Increment 2: events and review facts.**
- `events.js` (pure) maps the final outcome of an AGDF MCP tool call to zero or one event of schema `companion-event/1`.
- The MCP dispatch runtime appends events to a bounded JSONL journal in the AGDF plugin data root, in `postprocessToolResult`, which serves both facade and generation.
- Review facts are computed there: preview, size, digest and source match.
- The companion polls the small journal every 2 seconds, re-reads the run view on new events and shows notices per decision P1.

## 2. Ownership And Source Of Truth

- **Run state:** RUN_STATE.md with its typed records and Run Operations stays the only source of truth. The run view is a derived projection; it is never persisted.
- **Gate rules:** `gate-policy-pure.js` and the pure readiness functions extracted from the gate-check evaluators (SDD-002) own all status-field rules. `gate-check.js` keeps doctor, quality outlook, presentation rendering and IO, and calls the pure owner for status fields.
- **Events:** the journal is a notification channel only, not a source of truth. Durable facts (approval recorded, run completed) are confirmed against the run view before the companion shows them as final. Transient outcomes (rejected, effect unknown) exist only as events.
- **Texts:** `plugins/agdf/meta/agdf-interaction-locales.json` (existing catalog and validator) owns figure-state names and companion texts.
- **Presentation:** the Claude mod (`plugins/agdf/host-templates/claude/companion/`) keeps drawing, refresh triggers, stored choices (`companion-state.json`) and sound; it holds no run semantics.
- **Accountable owner:** Arndt Gold.

## 3. Architecture Decisions

- SDD-001: Introduce a pure run-view projection `projectRunView(facts, options)` in `packages/core/lib/companion/run-view.js`, fed by `captureRunViewFacts(io)` with injected `{ exists, list, read }`; rationale: the Claude mod may import only pure modules and uses host file access while node callers use `fs`, so a fact capture plus pure projection is the only shape both can run; consequence: every rule used for status fields must be a pure function over captured text, and capture must read exactly the files those rules need.
- SDD-002: Split the status-field part of `evaluateGateCheck` (artefact presence, UR/PRD/SD readiness, SD/TP traceability, approval-summary and decision-content readiness) into pure functions over captured contents, while the existing exported evaluators keep their signatures, read through `control-read/fs.js` as today and delegate to them, and doctor, quality outlook and presentation rendering stay node-side; rationale: one rule owner for both surfaces removes the observed next-step divergence without changing CLI or MCP outputs; consequence: a central refactor whose byte stability must be proven by golden comparisons of status card output over a fixture set.
- SDD-003: The run view contains a project diagnosis: store status from `config.json` (`control_layout` must be `run-folders-v1`, else `control_layout_unsupported`) and a per-run reason (`run_version_unsupported`, `run_state_invalid`, `too_large`, `missing`) with counts; rationale: the same reason codes MCP already uses make companion and MCP agree on legacy stores; consequence: readable runs keep being listed next to the diagnosis.
- SDD-004: `deriveFigureState(view)` in `packages/core/lib/companion/figure-state.js` owns the mood set (`laeuft`, `baut`, `wartet`, `blockiert`, `fertig`, `bereit`) and its rules, and companion texts move from `companion/locales.json` into a `companion` section of `agdf-interaction-locales.json` validated by the existing catalog validator; rationale: rules and wording become host-neutral and reusable by Codex; consequence: the catalog grows, which affects the runtime payload and requires a compatibility re-record.
- SDD-005: Event model `companion-event/1` in `packages/core/lib/companion/events.js` with fields schema_version, id, at, root, run_id, gate, kind, outcome, reason, operation_id and review, kinds approval_requested (presentation.deliver accepted), approval_recorded, write_rejected (not_dispatched), effect_unknown, recovery_required, run_completed (closeout.record accepted), material_staged (seal accepted) and document_recorded (step.record or artefact.record accepted), produced by the pure function `deriveEvent(toolName, input, result)` from the final tool result; rationale: events come from real MCP outcomes and not from host hooks, so the agent cannot shape them; consequence: kinds outside the P1 toast list stay pane-only.
- SDD-006: The MCP dispatch runtime appends one line per event to `<plugin data root>/companion/events.jsonl` in `postprocessToolResult` after the result is final, for both facade and generation, using the data root the launcher already receives (`CLAUDE_PLUGIN_DATA` on Claude, the absolute data argument on Codex), bounded to 256 KiB with one rotation file `events.1.jsonl`, and write errors are swallowed without changing any tool result; rationale: no write under `.agdf/control`, no second source of truth, and the directory is removed on uninstall like the companion state; consequence: concurrent MCP servers may interleave lines or lose a few events at rotation, which the reader tolerates by skipping malformed lines.
- SDD-007: The companion reads the journal every 2 seconds with a bounded read in addition to the existing 30-second run poll and the read after `turn.complete`, events of the current project root newer than the last seen id trigger a run-view re-read and a notice per P1, and a missing or unreadable journal shows "events unavailable"; rationale: this meets AC-005 without file watching, which the mod API does not offer because `$.fs` has only exists, list, read and write; consequence: a small periodic read cost while the companion is on.
- SDD-008: Review facts: on seal the runtime records preview (at most 40 lines or 4 KiB with a truncation flag), bytes and digest from the material store with source_match "not_determinable" for staged material (P4), recordings with a run-local source path record source path, recorded digest and source_match "match", the run view compares declared sources from Run Operations with their current canonical digest to raise a drift warning (AC-008), and digests in the mod use a pure SHA-256 in `packages/core/lib/companion/sha256.js` over `canonicalRunText`; rationale: decision P4 forbids an MCP schema change, so only declared sources are compared; consequence: a second SHA-256 implementation bounded to the companion and covered by parity tests with node crypto.
- SDD-009: No new MCP operation and no schema change in this run, the host-neutral contract being the Core exports (`run-view`, `figure-state`, `events`) plus the versioned journal format, with the existing `gate-check` status card carrying the shared run view to MCP consumers and event exposure through `agdf_inspect` decided in the Codex run; rationale: the PRD makes Codex UI and schema changes non-goals and the `agdf_inspect` discovery budget stays untouched; consequence: Codex consumption of events needs that later run.
- SDD-010: The Claude companion consumes the core through the existing generated bridge (`scripts/sync-package-assets.js` rewrites `core.mjs` imports to `runtime/create-agdf/runtime/core/lib/`, extended to the new modules), `state.mjs`, `run-state.mjs` and the text parts of `localization.mjs` shrink to thin adapters, and the integrity test asserts a pure import closure and that no path under `.agdf/control` is written; rationale: this reuses the proven packaging path and keeps the observation-only guarantee testable; consequence: generated assets and the payload must be rebuilt.

## 4. Integration Points

- `packages/core/lib/control-evaluation/gate-check.js` (`evaluateGateCheck`, `buildStatusCard`) and readiness modules (`ur-readiness.js`, `prd-readiness.js`, `sd-readiness.js`, `traceability-readiness.js`, `decision-content-readiness.js`, `run-state.js`): SDD-002.
- `packages/core/lib/control-read/fs.js`: unchanged seam for node reads.
- `packages/cli/lib/mcp-dispatch-runtime.js` (`postprocessToolResult`) and the material store (`packages/core/lib/control-state/run-material.js`): SDD-005, SDD-006, SDD-008.
- `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` (data root resolution): SDD-006.
- `plugins/agdf/host-templates/claude/companion/*.mjs` and `scripts/sync-package-assets.js`: SDD-007, SDD-010.
- `plugins/agdf/meta/agdf-interaction-locales.json` and its validator `packages/core/lib/interaction-catalog-validation.js`: SDD-004.
- No change to MCP tool schemas, result schemas, error codes, gate rules or approval formulas.

## 5. Constraints And Compatibility

- Status card output for unchanged inputs must stay byte-identical in CLI and MCP; this is proven by golden comparison before and after SDD-002.
- Core modules consumed by the mod must have a pure import closure (no Node built-ins); this is enforced by the integrity test.
- The companion writes only `companion-state.json`; it never writes under `.agdf/control` and never gates hooks (AC-009).
- The journal writer must never fail or delay a tool result. Its write is synchronous append after the final result, with an upper size bound.
- The Copilot payload stays within `plugins/agdf/meta/copilot-payload-baseline.json` (current headroom 208,515 bytes). A reviewed budget re-record follows only if needed, and the compatibility record is re-recorded.
- Windows and POSIX paths are supported: the journal `root` uses the MCP target path, and the mod compares roots after normalizing separators and case on win32.

## 6. Test And Evidence Strategy

- **Reuse first.** Existing companion suites (`claude-companion-test.js`, `-adapter-test.js`, `-integrity-test.js`), gate-check and status-card tests, MCP server suites (`test:protocol`, `test:run-command-flow`, `test:generation`) and CLI MCP suites cover unchanged behavior. They must stay green without weakened assertions (AC-011).
- **New proof per risk:**
  - Golden status-card comparison over representative runs before and after SDD-002 (byte stability, AC-011).
  - Parity test: companion run view vs. status card fields for the same fixtures (AC-001).
  - Diagnosis tests with legacy v2, unsupported layout and mixed fixtures (AC-002, AC-003).
  - Host-neutral harness using only Core exports (AC-004).
  - MCP tool-path event tests through facade and plugin generation, per kind, with timing below 30 s (AC-005, AC-006).
  - Review-fact tests: truncation; a source file changed after recording (drift warning); a reproduced staged corruption shown through the preview without a mismatch claim; SHA-256 parity with node `crypto` (AC-007, AC-008).
  - Integrity and control-digest checks (AC-009).
  - Locale completeness for de/en (AC-010).
- **Placement:** targeted Run checks per increment before Code Review; required PR CI (`verify:ci` stages) before merge; no nightly is relied on.
- **Native evidence:** a live Claude desktop check of the companion with screenshots as UAT input. Codex is out of scope.
- **Gaps stated now:** concurrent journal writers are covered by a bounded interleaving test, not by a multi-process stress run.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Companion and status card read status fields from the same pure projection | `packages/core/lib/companion/run-view.js` with the pure readiness rules extracted from `gate-check.js` | SDD-001, SDD-002 | Central refactor; golden status-card comparison keeps CLI/MCP bytes stable |
| AC-002 | Run view carries store and per-run diagnosis with counts and reasons; companion renders them | `run-view.js` diagnosis over `config.json` and RUN_STATE parsing | SDD-003 | none — reuses existing reason codes |
| AC-003 | Readable runs listed next to the diagnosis | `run-view.js` project view | SDD-003 | none — additive view field |
| AC-004 | Core exports suffice to render view, events and figure state; harness proves it | `packages/core/lib/companion/` exports | SDD-001, SDD-004, SDD-009 | none — no host adapter in the harness |
| AC-005 | Journal written on final MCP outcome; mod polls it every 2 s | MCP dispatch runtime `postprocessToolResult`; companion adapter | SDD-006, SDD-007 | Concurrent writers may interleave; reader skips malformed lines |
| AC-006 | Pure mapping from tool outcome to event kinds | `packages/core/lib/companion/events.js` | SDD-005 | none — no change to tool results |
| AC-007 | Preview, bytes, digest and source match computed in the runtime and carried in events | material store and recording receipts | SDD-008 | Preview bounded by P2; journal size bound applies |
| AC-008 | Drift warning for declared run-local sources via run-view digest comparison; staged material shows "not_determinable" | Run Operations receipts plus pure SHA-256 | SDD-008 | Second SHA-256 implementation; parity test with node `crypto` |
| AC-009 | Companion stays observation-only; integrity test enforces pure closure and no control writes | companion adapter and integrity test | SDD-010 | none — existing guarantee made testable |
| AC-010 | Figure states and texts from the central catalog | `agdf-interaction-locales.json` `companion` section | SDD-004 | Catalog change requires payload check and compatibility re-record |
| AC-011 | Existing suites green; status card bytes stable; no schema or error-code change | existing tests and golden comparison | SDD-002, SDD-009 | Covered by golden comparison and unchanged schemas |

## 8. Risks And Open Questions

- SDD-002 touches the central gate-check path. Mitigation: the golden comparison is created before the refactor, and the pre-implementation Brownfield Analysis maps every evaluator read.
- Mod sandbox limits beyond `$.fs` and `$.clock` are not needed by this design; any further capability is not assumed.
- Rotation races between several MCP servers may drop events. This is accepted because the journal is a notification channel, and the run view stays authoritative.
- Payload growth from the new Core modules and catalog texts; measured before Code Review.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Split of evaluateGateCheck into capture and pure projection | before_sd | resolved | Pure readiness functions plus `captureRunViewFacts`/`projectRunView`; node evaluators delegate and keep signatures; golden status-card comparison proves byte stability (SDD-001, SDD-002) | Arndt Gold |
| Event channel, lifetime and SoT boundary | before_sd | resolved | JSONL journal in the plugin data root written by the MCP dispatch runtime, bounded 256 KiB with one rotation file, notification only; durable facts confirmed against the run view (SDD-005, SDD-006) | Arndt Gold |
| Host-readable MCP surface for run view and events | before_sd | resolved | No new MCP operation or schema change in this run; status card carries the shared run view; event exposure via MCP decided in the Codex run (SDD-009) | Arndt Gold |
| Digest computation inside the mod | before_sd | resolved | Pure SHA-256 over canonicalRunText in Core, parity-tested with node crypto (SDD-008) | Arndt Gold |
| Companion event delivery cadence | before_sd | resolved | Journal read every 2 s plus existing 30 s run poll and turn completion (SDD-007) | Arndt Gold |
| Fixture set and golden snapshot contents | later_tp | deferred | TP selects the representative run fixtures (open UR, ready UR, PRD, structured internal steps, completed quick_task and structured run, legacy v2, mixed) | Arndt Gold |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)

- Ziel: Ein neuer Core-Bereich `packages/core/lib/companion/` trägt Run-Ansicht, Figurzustände, Ereignisse und Review-Fakten. Claude-Begleiter und MCP-Statuskarte nutzen ihn gemeinsam.
- Umfang: Schritt 1 bringt eine reine Run-Ansicht aus eingelesenen Fakten (Lesezugriff injiziert: Node-fs oder `$.fs`). Dazu wird der Gate-Check-Bewerter in reine Regeln aufgeteilt, die Diagnose unlesbarer Bestände kommt hinzu, Figurzustände und Texte wandern in den zentralen Katalog. Schritt 2 bringt Ereignisse aus den echten MCP-Ergebnissen: Der MCP-Server schreibt sie in ein begrenztes Protokoll im Plugin-Datenverzeichnis, der Begleiter liest es alle 2 Sekunden. Review-Fakten umfassen Vorschau, Größe, Digest und Abgleich mit angegebenen Quelldateien.
- Entscheidungen: SDD-001 und SDD-002 Lese-Teil plus reine Auswertung, Statuskarte bytegleich (Golden-Vergleich). SDD-003 Diagnose mit den MCP-Grundcodes. SDD-004 Figurzustände und Texte im zentralen Katalog. SDD-005 bis SDD-007 Ereignismodell, Protokoll (256 KiB, eine Rotationsdatei, nur Benachrichtigung) und 2-Sekunden-Abfrage. SDD-008 Review-Fakten mit reinem SHA-256 für den Mod. SDD-009 keine neue MCP-Operation und keine Schemaänderung, die Codex-Anbindung kommt im eigenen Run. SDD-010 Anbindung des Begleiters über die vorhandene Bridge, Integritätstest für Reinheit und Schreibverbot.
- Risiken: Der Umbau des zentralen Gate-Check-Pfads wird über Golden-Vergleiche abgesichert. Bei mehreren MCP-Servern können Protokollzeilen verloren gehen, was als Benachrichtigungskanal hingenommen wird. Die Nutzlast wächst.
- Nächster Schritt: SD prüfen und nur mit `Approval: SD` freigeben; danach folgt der Aufgaben- und Testplan (TP).
