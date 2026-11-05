# UR: Report pre-dispatch MCP command failures as not dispatched

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-11-05
Owner: Arndt Gold

## 1. Problem

When an AGDF MCP write tool (`agdf_record`, `agdf_revise`, `agdf_closeout`) is called with a staged material reference that the material store cannot grant, the failure happens while the server prepares the dispatch, before any command reaches Core. The tool result nevertheless says `outcome: effect_unknown`, `reason: dispatch_worker_failed`, `dispatch: unknown` and tells the agent to inspect `operation-status` because the effect is uncertain.

Observed on 2026-11-05 in a native Claude CLI 2.1.302 probe against AGDF 0.30.0 (evidence in the ignored `probe-results/cli-mcp-20261105/`): reusing an already consumed material reference with an old revision (`step.record`) and with the current revision (`source_revision.preview`) both returned `effect_unknown/dispatch_worker_failed`. A direct Core reproduction shows the material store throws `stale_revision` and `material_transfer_expired` from `grants()`, which `packages/cli/lib/mcp-dispatch-runtime.js` calls in `prepareDispatch`. `packages/mcp-server/src/server.js` evaluates `prepareDispatch` after it has set its failure phase to `execute`, so `executionFacts` classifies the plain error as an unknown effect.

The agent therefore receives a false "effect unknown" signal and recovery advice for an operation that provably did not run, and loses the actual reason it could correct.

## 2. Goal

A failure that happens while the MCP server prepares a command dispatch is reported as not dispatched, with its actual typed reason, so the agent can correct the input instead of investigating a non-existent effect.

## Affected Users

- Agents that drive AGDF through the MCP write tools in Claude, Codex, Copilot or other hosts.
- Repository owners who read the resulting tool errors and recovery advice.

## 3. Scope

- Treat every failure raised while the server evaluates `prepareDispatch` (input context and material grants) as a pre-dispatch failure: `dispatch: not_dispatched`, `outcome: rejected`, `isError: true`, recovery "No command was dispatched by this attempt."
- Carry the typed material store reason into the tool result when it is a classified code (`stale_revision`, `material_transfer_expired`, `material_binding_mismatch`), instead of `dispatch_worker_failed`.
- Add regression tests that reproduce the consumed-reference case through the real MCP tool path and assert the result envelope and that no control file changed.

## 4. Non-Goals

- No change to material store semantics: consumed or stale references stay unusable.
- No change to how Core classifies failures inside the command service, including `material_binding_invalid` for a wrongly staged `source_revision.preview` proposal (a separate finding).
- No change to material transport (base64 integrity), response sizes, the native E2E failure-case expectation or any other finding from the 2026-11-05 review.
- No change to successful dispatch, idempotent replay or failures raised after a command was dispatched.

## 5. Acceptance Signals

- Reusing a consumed material reference through `agdf_record` with the current revision returns `outcome: rejected`, `reason: material_transfer_expired`, `dispatch: not_dispatched`, `isError: true`.
- The same reference with an outdated `expected_revision_id` returns `outcome: rejected`, `reason: stale_revision`, `dispatch: not_dispatched`.
- An unexpected exception inside `prepareDispatch` is still reported as `not_dispatched` (reason `dispatch_worker_failed`), never as `effect_unknown`.
- A failure after dispatch still reports `effect_unknown` unchanged.
- The control folder is byte-identical before and after each rejected call.
- Existing MCP server, tool-error and material tests stay green.

## 6. Existing Source Of Truth

- `packages/mcp-server/src/server.js`: tool handler phases and failure projection.
- `packages/cli/lib/mcp-dispatch-runtime.js`: `prepareDispatch`, material grants and settlement.
- `packages/core/lib/mcp-tool-errors.js`: `executionFacts`, the code classification and recovery text.
- `packages/core/lib/control-state/run-material.js`: the material store and its `grants()` errors.
- Existing tests: `packages/mcp-server/test/tool-errors.test.js`, `packages/mcp-server/test/material-recovery.test.js`.

## 7. Risks And Unknowns

- `packages/cli/lib` is copied into the generated runtime plugin, so the Copilot payload baseline and the compatibility record may need re-recording.
- The worker executor receives `prepareDispatch` output across a thread boundary; moving its evaluation must not change what the worker receives on success.
- Brownfield Review must confirm whether other `prepareDispatch` inputs can legitimately fail after partial preparation.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

- **Problem:** Scheitert ein MCP-Schreibaufruf schon bei der Vorbereitung, weil die Materialreferenz verbraucht oder veraltet ist, meldet AGDF trotzdem „Wirkung unbekannt“ (`effect_unknown/dispatch_worker_failed`) und schickt den Agenten zur Statusprüfung. Tatsächlich wurde nichts ausgeführt, und der eigentliche Grund geht verloren. Ursache: `server.js` wertet `prepareDispatch` erst in der Phase „execute“ aus.
- **Ziel:** Fehler bei der Vorbereitung eines Dispatch werden als „nicht ausgeführt“ mit ihrem echten Grund gemeldet.
- **Betroffene:** Agenten, die AGDF über die MCP-Schreibwerkzeuge steuern, und die Projektverantwortlichen, die deren Fehlermeldungen lesen.
- **Umfang:** Fehler in `prepareDispatch` gelten als `not_dispatched` und `rejected`. Bekannte Gründe des Materialspeichers (`stale_revision`, `material_transfer_expired`, `material_binding_mismatch`) werden durchgereicht. Dazu kommen Regressionstests über den echten MCP-Werkzeugpfad.
- **Nicht im Umfang:** keine Änderung am Materialspeicher, an der Core-Fehlerklasse von `source_revision.preview`, an der Base64-Übertragung, an Antwortgrößen oder am nativen E2E-Fehlerfall.
- **Abnahme:** Verbrauchte Referenz ergibt `rejected/material_transfer_expired`, veraltete Revision ergibt `rejected/stale_revision`, beide mit `not_dispatched` und unverändertem Kontrollordner. Unerwartete Fehler in der Vorbereitung bleiben `not_dispatched`. Fehler nach dem Dispatch bleiben `effect_unknown`. Bestehende Tests bleiben grün.
- **Quellen:** `packages/mcp-server/src/server.js`, `packages/cli/lib/mcp-dispatch-runtime.js`, `packages/core/lib/mcp-tool-errors.js`, `packages/core/lib/control-state/run-material.js` und die vorhandenen MCP-Tests.
- **Risiken:** Die Änderung in `packages/cli/lib` kann eine Neuaufnahme der Copilot-Nutzlastgrenze und des Kompatibilitätsnachweises erfordern. Der Worker darf bei Erfolg nichts anderes erhalten als bisher. Die Brownfield Review prüft weitere Fehlerquellen in `prepareDispatch`.
- **Nächster Schritt:** UR prüfen und nur mit `Approval: UR` freigeben.
