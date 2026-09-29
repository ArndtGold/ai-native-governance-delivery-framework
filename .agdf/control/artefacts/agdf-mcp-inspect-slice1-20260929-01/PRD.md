# PRD: Lesende AGDF-Operationen über MCP statt Shell

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-09-29
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Make the read-only AGDF control operations reachable through the existing AGDF MCP server on every host that lists it, so that an agent no longer needs a shell to inspect a run. One read-only tool with an operation selection covers `doctor`, `gate-check` (status card and approval envelope), `delivery-map` and `contract`. A `presentation_required` dispatch result additionally carries the canonical review text of the current gate presentation, so the agent can show it from the structured tool result instead of from shell output. The CLI remains the single engine and the shell binding remains the declared fallback for hosts without MCP. No write operation moves to MCP in this slice: `run-create`, `run-update`, `run-step`, `run-approve` and the persisting `run-present` binding stay on the CLI.

The user decided on 2026-09-29: the slice is strictly read-only; the operation set is the core set above (`status` and `target-check` stay CLI); the step-count target of the UR is carried as a measurement obligation, not as a gating acceptance criterion.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: not_applicable (Brownfield Review 2026-09-29: same cards and approval text; only the agent's intermediate steps change)
- primary_user_intent: See the same trustworthy AGDF status and approval cards with fewer permission prompts, shell denials and intermediate agent steps.
- success_signal: On a host with the AGDF MCP server, a run's status, doctor result, delivery map and runtime contracts are inspected without any shell call, and the approval preview appears from the dispatch result; hosts without MCP behave exactly as today.
- primary_decision_or_action: None for the user beyond the existing gate decisions; the change is agent-facing.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| MCP host, read operation | The selected run's canonical evaluation result (doctor, gate-check, delivery-map or contract module) is returned through the MCP read tool. | Structured JSON result; canonical status Markdown; runtime contract text. | Existing evaluators in `create-agdf/lib/control-evaluation/` and `contract-command.js`; existing CLI validation rules. | Existing `interaction-presentation.js` and `run-presentation-render.js`; the MCP layer renders nothing itself. |
| MCP host, dispatch requires presentation | A bound intake or delivery continuation reaches a ready user gate. | Dispatch result with the canonical preview text; the `run-present` binding step. | `gate-check` approval presentation; `run-present` remains the only binding writer. | `run-presentation-render.js` via `gate-check`. |
| Host without MCP | The tool is not listed or fails. | Unchanged shell binding steps as today. | Binding schema 2 in the skills. | Unchanged. |

The MCP read tool presents evaluation results; it never selects a target or run, writes control state, prepares a binding or grants approval.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: The read tool is used only after positive Request Activation inside an active AGDF route, exactly where a skill or contract today names a read-only shell command. It is never used for discovery or as invocation proof.
- blockers_and_visible_next_actions: An unsupported or write-shaped `operation` value is rejected by the tool schema before any evaluation. A failed read boundary check, missing run or invalid input returns the same structured recovery the CLI returns. An unavailable tool leads to the declared binding fallback, not to a runtime search.
- recovery_paths: The agent falls back to binding schema 2 when the tool is unlisted or fails; a rejected operation is corrected by choosing a supported one; a failed evaluation is handled by its existing CLI-equivalent recovery.
- relevant_state_transitions: `shell read step -> MCP read operation` (same result); `presentation_required without text -> presentation_required with canonical preview text`; `tool unavailable -> binding fallback`. No gate, approval or run-state transition changes.

## 5. Acceptance Criteria

### AC-001 — Read operations are reachable through MCP with CLI parity

- criterion_id: AC-001
- working_mode: MCP host, read operation
- source_state: A repository with canonical control and at least one run; the AGDF MCP server is listed by the host.
- trigger/action: The agent calls the read tool with one of the operations `doctor`, `gate-check` (status card or approval envelope), `delivery-map` or `contract` and the same selection arguments the CLI accepts (run, presentation language, contract module).
- expected_effective_state: The canonical evaluation runs once through the existing evaluator; no state changes.
- visible_feedback: The structured result equals the corresponding CLI `--json` result byte for byte, including `status_card`, `status_presentation` and `approval_presentation` where the CLI provides them; the returned Markdown equals the CLI's canonical Markdown.
- blocker/failure_behavior: Invalid selection arguments are rejected with the same reason the CLI reports; a missing run or control returns the CLI's structured recovery.
- recovery/next_action: Correct the selection or fall back to the binding when the tool is unavailable.
- observable_success: For every supported operation and both registered locales, an automated parity check reports zero byte differences between MCP and CLI output for the same fixture.
- required_evidence: Parity assertions per operation and locale in the existing control-state, interaction-presentation and MCP server test suites.

### AC-002 — The read tool cannot write

- criterion_id: AC-002
- working_mode: MCP host, read operation
- source_state: Any repository state, including a symlinked or malformed `.agdf/control` tree.
- trigger/action: Any call to the read tool, including calls with unsupported or write-shaped operation names.
- expected_effective_state: No file under `.agdf/control`, the run store or the artefact directory is created, modified or deleted; the existing MCP read boundary rejects symlinked or non-file entries before evaluation.
- visible_feedback: An unsupported operation is rejected by the tool schema; a rejected read boundary returns the existing `control_read_boundary_invalid` failure.
- blocker/failure_behavior: Fail closed: a rejected call returns no partial evaluation.
- recovery/next_action: Use a supported operation or repair the control tree through its existing owner.
- observable_success: A safety test snapshots the control tree before and after every operation and every rejected call and finds it unchanged; the schema enumerates only the four supported operations.
- required_evidence: Snapshot-based safety assertions in `agdf-mcp-server/test/safety.test.js`; schema enumeration assertion in the dispatch function contract tests.

### AC-003 — A presentation-required dispatch carries the canonical preview

- criterion_id: AC-003
- working_mode: MCP host, dispatch requires presentation
- source_state: A bound gate-check dispatch (intake resume or delivery continuation) reaches a ready user gate whose durable artefact is present.
- trigger/action: The dispatcher returns `presentation_required`.
- expected_effective_state: The dispatch result populates its existing `presentation` field with the canonical preview text of the current gate presentation; no presentation record is written by the dispatcher.
- visible_feedback: The agent can show the preview text from the tool result; the text is digest-identical to `approval_presentation.preview_markdown` of the same gate-check evaluation and to the text `run-present` later returns for the same revision.
- blocker/failure_behavior: When no preview can be rendered (summary missing or invalid), the result carries the existing non-authorizing recovery instead of a partial preview and the continuation still names the recovery.
- recovery/next_action: The agent still executes the supplied `run-present` step to obtain the `presentation_id`; without a valid `presentation_id`, `run-approve` rejects the approval as today.
- observable_success: Tests show the embedded preview equals the `run-present` text and digest for the same revision, and that `run-approve` without a presentation id is rejected unchanged.
- required_evidence: Dispatch result assertions in the skill-dispatch tests; digest equality and approval-rejection assertions in the control-state tests.

### AC-004 — Skills and contracts route read operations MCP-first

- criterion_id: AC-004
- working_mode: All modes
- source_state: The ten skills and the interaction, gate-transition and quality contracts name read-only shell commands as process steps.
- trigger/action: The skills and contracts are updated for this slice.
- expected_effective_state: Every read-only process step names the MCP read operation as the primary route when the host lists the tool and keeps the binding as the declared fallback; write steps are unchanged.
- visible_feedback: No skill or contract names a read-only shell command as the primary route; the gate-check skill stays within its 6900-byte installed budget; the terminal-dispatch block fingerprint and the request-activation guard fingerprint remain valid.
- blocker/failure_behavior: A skill that exceeds its budget or breaks a fingerprint fails the instruction-footprint check and is not shipped.
- recovery/next_action: Shorten or restructure the affected skill text without changing the locked blocks.
- observable_success: Instruction-footprint, smoke-test, skill-eval and request-activation checks pass; a text search over skills and contracts finds no primary read-only shell step.
- required_evidence: `test:instruction-footprint`, `smoke-test`, `eval:skills`, `test:request-activation` results and a recorded search over `plugin/skills` and `plugin/meta/contracts`.

### AC-005 — Authority and localization boundaries are unchanged

- criterion_id: AC-005
- working_mode: All modes
- source_state: Any read tool result or dispatch result with embedded preview.
- trigger/action: The MCP layer returns a result.
- expected_effective_state: Every result carries `authorizes: false`; `presentation_language` selects the same locale pack as the CLI; exact protocol values such as `Approval: PRD`, run ids, paths and diagnostic codes are unchanged.
- visible_feedback: Localized cards in both registered locales are identical to the CLI cards; no result offers an approval control.
- blocker/failure_behavior: A missing or invalid presentation language fails before evaluation exactly as in the dispatcher today.
- recovery/next_action: Supply a well-formed language tag.
- observable_success: Non-authorizing envelope assertions and locale parity assertions pass for every operation.
- required_evidence: Envelope and locale assertions in the interaction-catalog, operational-localization and MCP server test suites.

### AC-006 — Hosts without MCP behave exactly as today

- criterion_id: AC-006
- working_mode: Host without MCP
- source_state: The read tool is not listed, or a call fails.
- trigger/action: A skill reaches a read-only process step.
- expected_effective_state: The agent uses binding schema 2 with the same commands as before this slice; no runtime search, environment repair or help retry occurs.
- visible_feedback: The rendered fallback steps and recovery texts are unchanged for Codex, Copilot and OpenCode profiles.
- blocker/failure_behavior: An absent binding reports `dispatcher_unavailable` and stops, as today.
- recovery/next_action: None new; the existing fallback is the recovery.
- observable_success: Skill evals and the request-activation corpus pass unchanged; the generated Copilot profile changes only by the measured additions of this slice.
- required_evidence: `eval:skills`, `test:request-activation`, `test:copilot-profile` and the payload-budget review with the measured growth recorded in `payload-budget-history.md`.

### AC-007 — The step and token effect is measured and reported

- criterion_id: AC-007
- working_mode: MCP host
- source_state: The small-path scenario of the 2026-09-25 baseline (45 steps, 3.20 USD, 4 rounds) is reproducible in a disposable repository.
- trigger/action: The scenario is rerun with the MCP server listed after this slice is implemented.
- expected_effective_state: The number of steps, rounds and cost is recorded together with the per-session token cost of the new tool schema.
- visible_feedback: A dated evidence record compares the new numbers with the baseline and names the shell steps that remain.
- blocker/failure_behavior: A missing or non-reproducible measurement is recorded as an open evidence gap; it does not block QA by itself because the UR's step target is a measurement obligation by user decision.
- recovery/next_action: Repeat the measurement in the same scenario when the environment allows.
- observable_success: The evidence record exists, is linked from the run and states the delta against 45 steps and the schema token cost.
- required_evidence: Native probe evidence under `scripts/native-probes/evidence/` and a run evidence row.

## 6. Non-Goals

- Move any write operation to MCP: `run-create`, `run-update`, `run-step`, `run-approve`, `run-revise` and the persisting `run-present` binding stay CLI-only.
- Change Request Activation, target authority or resolution, run selection, gate transitions, approval handling, the durable run-state schema or persisted data.
- Add `status` or `target-check` to the read tool.
- Change host installers, MCP lifecycle adapters, Codex per-call approvals, or publish `@agdf/mcp-server` to npm.
- Put repository work (edits, tests, git) behind MCP.
- Fix the failing `control-state-test.js` assertion of run `agdf-actionable-card-ux-20260928-01`; that stays with its owning run, but it must be green before this slice's CD+Tests.

## 7. Users And Roles

- Primary users: agents executing AGDF runs on Claude Code, Codex, Copilot and OpenCode, and the people who approve their gates.
- Product and PRD owner: Arndt Gold.
- Effective-state authorities: the existing evaluators in `create-agdf/lib/control-evaluation/`, the CLI validation rules, the MCP read boundary and the existing presentation renderers.
- Decision authority: unchanged; only `run-approve` with a valid `presentation_id` records an approval.

## 8. Constraints

- One engine: MCP operations call the same functions the CLI calls; CLI validation rules are shared, not copied.
- One read tool with an operation selection, not one tool per command; every schema byte costs context in every session on every host.
- The existing MCP read boundary applies to every operation.
- The gate-check skill stays within its 6900-byte installed budget; fingerprint-locked blocks stay unchanged.
- The dispatch result keeps `schema_version` 1; the preview populates the existing optional `presentation` field.
- All results remain `authorizes: false`.

## 9. Evidence Requirements

- Parity evidence per operation and locale between MCP and CLI output.
- Safety evidence that no MCP call writes under `.agdf/control` and that unsupported operations are rejected by schema.
- Digest evidence that the embedded preview equals the `run-present` text for the same revision, and that approval without a presentation id is still rejected.
- Footprint, smoke, skill-eval and request-activation evidence for the updated skills and contracts.
- Payload-budget review with the measured growth and its rationale.
- A dated small-path measurement with the MCP server listed, compared against the 2026-09-25 baseline.

## 10. Risks And Open Questions

- The order of preview display and `run-present` binding in `interaction.md` step 3 must be designed so that no approval question is asked before a `presentation_id` exists; SD decides.
- Extracting CLI validation into shared functions touches `application.js` and `parse-args.js`; SD must bound that refactoring to the read commands.
- Codex requires per-call MCP approval; the measured benefit may be smaller there. Copilot and OpenCode MCP use is unproven, so the fallback remains mandatory.
- The shared regression suite is red on `main`; the owning run must fix it before this slice's CD+Tests.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Slice cut | before_prd | resolved | Strictly read-only: read tool plus embedded preview text in the dispatch result; no MCP write path. Decided by the user on 2026-09-29. | Arndt Gold |
| Operation set of the read tool | before_prd | resolved | Core set `doctor`, `gate-check` (status card and approval envelope), `delivery-map`, `contract`. `status` and `target-check` stay CLI. Decided by the user on 2026-09-29. | Arndt Gold |
| Tool shape | before_prd | resolved | One read tool with an `operation` selection instead of one tool per command, to bound the per-session context cost. Recommended on 2026-09-29 and accepted with the operation set. | Arndt Gold |
| Step-count target | before_prd | resolved | The UR's target of fewer than 35 steps is a measurement obligation (AC-007), not a gating acceptance criterion. Decided by the user on 2026-09-29. | Arndt Gold |
| Preview-versus-binding sequence and contract wording | later_sd | open | Solution Design defines how the embedded preview and the `run-present` binding interact in `interaction.md` step 3 without asking an approval question before a `presentation_id` exists. | Arndt Gold |
| Shared validation extraction boundary | later_sd | open | Solution Design names the module where the read commands' validation rules are extracted so CLI and MCP share one rule set. | Arndt Gold |
| Token cost cap | later_sd | open | Solution Design defines how the schema's per-session token cost is measured and which payload-budget growth is accepted. | Arndt Gold |
| Evidence mapping and red-suite dependency | later_tp | open | Task/Test Plan maps AC-001 through AC-007 to executable scenarios and evidence and records the dependency on a green `control-state-test.js`. | Arndt Gold |

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`

## AGDF Approval Summary (de; source=en)
- Nutzerziel: Dieselben vertrauenswürdigen AGDF-Status- und Freigabekarten mit weniger Berechtigungsabfragen, Shell-Ablehnungen und Zwischenschritten sehen.
- Umfang: Ein lesendes MCP-Tool mit Operationsauswahl für doctor, gate-check (Statuskarte und Approval-Envelope), delivery-map und contract; der Dispatch liefert bei erforderlicher Präsentation den kanonischen Vorschautext; die CLI bleibt der einzige Motor und die Shell-Binding der deklarierte Fallback; kein Schreibpfad über MCP.
- Entscheidungen:
  - Slice cut (geklärt): Strikt lesend, Lesetool plus eingebetteter Vorschautext, kein MCP-Schreibpfad. Nutzerentscheidung vom 2026-09-29.
  - Operation set of the read tool (geklärt): Kernmenge doctor, gate-check, delivery-map, contract; status und target-check bleiben CLI. Nutzerentscheidung vom 2026-09-29.
  - Tool shape (geklärt): Ein Lesetool mit Operationsauswahl statt je ein Tool pro Kommando, um den Kontextpreis pro Session zu begrenzen.
  - Step-count target (geklärt): Das UR-Ziel von unter 35 Schritten ist eine Messverpflichtung (AC-007), kein sperrendes Abnahmekriterium. Nutzerentscheidung vom 2026-09-29.
  - Preview-versus-binding sequence and contract wording (offen, SD): Reihenfolge von Vorschau und run-present-Bindung in interaction.md Schritt 3, ohne Freigabefrage vor einer presentation_id.
  - Shared validation extraction boundary (offen, SD): Modul, in das die Validierungsregeln der Lesekommandos für CLI und MCP gemeinsam ausgelagert werden.
  - Token cost cap (offen, SD): Messung des Schema-Kontextpreises und akzeptiertes Wachstum des Payload-Budgets.
  - Evidence mapping and red-suite dependency (offen, TP): Abbildung von AC-001 bis AC-007 auf Szenarien und Nachweise samt Abhängigkeit von einer grünen control-state-test.js.
- Abnahmekriterien:
  - AC-001: Jede Leseoperation liefert über MCP byteweise dasselbe Ergebnis wie das entsprechende CLI-Kommando mit --json, inklusive Statuskarte und Präsentation, in beiden registrierten Sprachen.
  - AC-002: Kein Aufruf des Lesetools verändert eine Datei unter .agdf/control; nicht unterstützte oder schreibende Operationen werden vom Schema abgelehnt, die bestehende Lesegrenze gilt.
  - AC-003: Ein Dispatch-Ergebnis mit erforderlicher Präsentation enthält den kanonischen Vorschautext, digest-identisch mit run-present; ohne gültige presentation_id bleibt keine Freigabe bindbar.
  - AC-004: Skills und Verträge nennen für Leseoperationen die MCP-Operation als primären Weg mit deklariertem Fallback; Instruction-Footprint, Smoke-Test, Skill-Evals und das gate-check-Budget von 6900 Bytes bestehen.
  - AC-005: Jedes Ergebnis bleibt authorizes: false, folgt der gewählten Präsentationssprache und lässt exakte Protokollwerte wie Approval: PRD unverändert.
  - AC-006: Hosts ohne MCP verhalten sich exakt wie heute; Skill-Evals und Aktivierungskorpus bestehen unverändert, das Copilot-Profil wächst nur um die gemessenen Ergänzungen.
  - AC-007: Der Small-Path-Baseline wird mit MCP wiederholt und datiert mit Schritten, Runden, Kosten und Schema-Kontextpreis gegen die 45 Schritte vom 2026-09-25 dokumentiert.
