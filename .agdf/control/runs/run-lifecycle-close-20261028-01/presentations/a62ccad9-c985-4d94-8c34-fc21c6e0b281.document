# TP: Close Active Runs as Superseded or Abandoned

Status: draft
Gate: TP
Gate approval: open
Based on: SD (`.agdf/control/artefacts/run-lifecycle-close-20261028-01/SD.md`, approved revision 13)
Date: 2026-10-28
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Core closure module `packages/core/lib/control-state/run-closure.js`: entry validation (reason, outcome, explicit successor kind, successor run existence and self-reference), per-run facts (title, gate, open approvals, last activity from the latest receipt `created_at` else `updated_at`, artefact count, warnings), closability (completed, ended, seal state, pending journal), immutable preview file with 8-hex id and digest, apply with exact phrase, repository-wide pending-journal refusal, sequential per-run closure and per-run results, rendering in German and English; plus a pure Git identity helper | Claude Code implementing agent | Brownfield Analysis |
| T-002 | Run-step integration: internal step `lifecycle_close` in `run-steps.js`, Run Operations kind `lifecycle_close.record` with shape validation (`run-operations.js`, `run-operation-proof.js`), journal kind with zero owned outputs (`run-step-transaction.js`), run edits (lifecycle, decision, Evidence row, next action), backlog move with final status `Superseded` or `Abandoned`, deterministic per-run operation id | Claude Code implementing agent | T-001 |
| T-003 | Ended-run guard: `AGDF_RUN_LIFECYCLE_ENDED` in `writeRunLocked` and `writeRunRecoveryLocked`, rejection `lifecycle_ended` with outcome, date and successor; early lifecycle checks in artefact recording, run-present, run-approve and `approval.record`, presentation decisions, relationship correction, run-update with changed content and the legacy run-step path; skill-dispatch continuation requires `active`; backlog-only `run-update` for unchanged ended runs | Claude Code implementing agent | T-002 |
| T-004 | Readers in Core: ended branch in `gate-policy.js`, summary kind `run_ended` in `run-work-summary.js` and `backlog-vocabulary.js`, ended handling in `interaction-presentation.js`; regression checks for the all-active resolver and the companion list | Claude Code implementing agent | T-002 |
| T-005 | MCP: kinds `closure.preview` and `closure.apply` in group `agdf_closeout` with a target-scoped envelope limited to these kinds (`run-command-contract.js`, `validateRunCommand`, `run-command-service.js`), schema within byte budgets, tool count unchanged | Claude Code implementing agent | T-001, T-002 |
| T-006 | CLI: command `run-close` with `--action preview|apply`, `--closure-file` or `--run`/`--outcome`/`--reason`/`--successor-run`/`--successor-ref`, `--preview-id`, `--confirmation`, `--json`; registry, parser, handler, help text and the surface-local validator set | Claude Code implementing agent | T-001, T-002 |
| T-007 | Cockpit and control-ui: assessment state `ended` and a closure projection from the receipt in `cockpit.js`; `api.ts`, `types.ts`, `WorkStep.tsx`, `DocumentView.tsx`, `RunDetail.tsx` render outcome, reason, successor, person and time | Claude Code implementing agent | T-002, T-004 |
| T-008 | Documentation and contract chain: `control-scaffold.md`, `gate-transition.md`, `interaction.md`, `packages/cli/README.md`, `packages/mcp-server/README.md`, `docs/handbook/de/04-mehrere-runs.md` and its English counterpart; refresh Copilot payload baseline, eval fingerprints and compatibility records | Claude Code implementing agent | T-005, T-006 |
| T-009 | Verification: run all targeted suites, register new test files in the CLI package scripts and `scripts/ci-test-domains.mjs`, run `npm run build:prepare` and the compatibility check, and observe preview and apply natively through MCP in Claude Code on a scratch repository with fixture runs | Claude Code implementing agent | T-001 to T-008 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-01 | T-001 | SCN-001 | A preview of three active runs, one completed run and one run with approved gates lists every PRD field and warning, marks the completed run not closable, and run files, receipts and backlog are byte-identical afterwards | Core test output (run-closure suite) |
| AC-002 | SDD-02 | T-001 | SCN-002 | The preview header names the run count, the finality notice and exactly `Close runs: ` plus the 8-hex preview id, in CLI and MCP output | Core and CLI test output |
| AC-003 | SDD-02 | T-001 | SCN-003 | Missing reason, `superseded` without successor, unknown successor run and self successor are each refused with their own reason, no preview file is stored and no other file is written | Core test output |
| AC-004 | SDD-02 | T-001 | SCN-004 | No phrase, a different phrase, another preview's phrase and an unknown preview id change nothing; the exact phrase closes | Core test output |
| AC-005 | SDD-03 | T-001 | SCN-005 | With run B changed after the preview, run A is closed and B is reported "changed since preview" and stays active | Core test output |
| AC-005 | SDD-04 | T-002 | SCN-006 | Repeating the same apply reports the closed runs as already closed by this preview; a crash after the first of two runs leaves one journal that operation recovery completes, and a repeated apply closes the second run | Core test output with transaction checkpoints |
| AC-006 | SDD-05 | T-002 | SCN-007 | The receipt `lifecycle_close.record` holds lifecycle, reason, successor kind and verification, confirmed_by, preview id and digest and the approval assurance object, and validates; a malformed receipt is rejected | Core test output |
| AC-006 | SDD-08 | T-001 | SCN-008 | Identity is read from repository config, a worktree `gitdir`, XDG config and `~/.gitconfig` in this order, handles CRLF and quoted values, ignores includes and yields `unknown` when absent | Core test output (identity suite) |
| AC-007 | SDD-03 | T-001 | SCN-009 | Completed, already ended and seal-invalid runs are never closed; the seal-invalid run names run recovery as next action | Core test output |
| AC-008 | SDD-06 | T-003 | SCN-010 | On an ended run, run step, artefact recording, approval, presentation, presentation decision, revise, changed update, recovery and continuation are rejected with `lifecycle_ended` through CLI and MCP and the run file stays byte-identical | Core, CLI and MCP test output (lifecycle guard suite) |
| AC-008 | SDD-06 | T-003 | SCN-011 | `run-update` on an unchanged ended run synchronizes only its backlog row and reports the run unchanged; with changed content it is rejected | Core test output |
| AC-008 | SDD-06 | T-003 | SCN-012 | Before the guard change the lifecycle guard test fails because the writer accepts a write to an ended run; after the change it passes | Recorded failing and passing test output in CD+Tests evidence |
| AC-008 | SDD-07 | T-004 | SCN-013 | `gate-check` on an ended run reports a closed status with no allowed delivery action and a next action naming the outcome; a `continue_delivery` dispatch is refused | Core and dispatch test output |
| AC-009 | SDD-01 | T-002 | SCN-014 | After closure the seal state is `valid`, artefact and receipt digests are unchanged and `doctor` reports no seal finding | Core test output |
| AC-010 | SDD-12 | T-004 | SCN-015 | `doctor --all-active` and `delivery-map --all-active` omit ended runs, and the companion open-run list omits them | Core test output and companion suite output |
| AC-011 | SDD-12 | T-007 | SCN-016 | The cockpit projection of an ended run has assessment `ended` with outcome, reason, successor, person and time, the archive row shows the final status, and the UI renders them with no next delivery action | Cockpit and control-ui test output |
| AC-012 | SDD-11 | T-002 | SCN-017 | A linked row moves to Completed / Superseded Pointers with the final status and outcome text; an unlinked run and an unusable backlog close and are reported `unlinked` or `skipped`; `doctor` reports no backlog status finding | Core test output |
| AC-013 | SDD-09 | T-005 | SCN-018 | The `agdf_closeout` schema accepts the two closure kinds with the target-scoped envelope, still requires `run_id` and `expected_revision_id` for `closeout.record`, stays within the byte budgets, the tool count stays seven and the safety tests pass | MCP server test output |
| AC-013 | SDD-09 | T-009 | SCN-019 | In Claude Code an agent prepares a preview through MCP on a scratch repository, the owner's verbatim phrase is forwarded and the fixture runs are closed with the same result as the CLI | Native observation note with screenshots in CD+Tests evidence |
| AC-003 | SDD-10 | T-006 | SCN-020 | `run-close` preview and apply work through the repository CLI and the surface-local validator with text and `--json` output; `--successor-run` and `--successor-ref` set the successor kind, and an unknown `--successor-run` is refused | CLI test output |
| AC-014 | SDD-13 | T-008 | SCN-021 | Contracts, READMEs and both handbook chapters describe outcomes, preview, phrase, per-run results, finality and the rejection of further steps; payload baseline, eval fingerprints and compatibility checks pass | Documentation diff and command output |
| AC-015 | SDD-03 | T-001 | SCN-022 | With a pending run-step journal in another run, the preview marks the whole list blocked and the apply closes nothing, naming that run; after recovery a new preview closes the runs | Core test output with a fixture journal |
| AC-001 | SDD-02 | T-001 | SCN-023 | The preview is stored once under `.agdf/control/closure-previews/` with an 8-hex id and its digest; a second preview gets a new id and never overwrites the first; a modified preview file fails the digest check on apply | Core test output |
| AC-004 | SDD-03 | T-001 | SCN-024 | With the exact phrase the entries are processed in preview order and the result lists them in that order | Core test output |
| AC-009 | SDD-05 | T-002 | SCN-025 | The closure receipt is appended to Run Operations without changing earlier receipts; editing it by hand makes the seal state invalid | Core test output |
| AC-010 | SDD-07 | T-004 | SCN-026 | `doctor` and `gate-check` for a single ended run report it as closed with no allowed delivery action instead of an open gate | Core test output |
| AC-011 | SDD-11 | T-002 | SCN-027 | After closure the cockpit archive section lists the run with final status `Superseded` or `Abandoned` and the outcome text from the backlog row | Cockpit test output |
| AC-015 | SDD-01 | T-002 | SCN-028 | A crash inside a closure commit leaves exactly one pending run-step journal for that run; until it is recovered, a new preview is blocked by AC-015 and other run writes are refused as today | Core test output with transaction checkpoints |

## 3. Test Plan

Reused proof: the closeout command, transaction, MCP protocol, safety, cockpit and companion suites run unchanged and must stay green; they cover lock order, replay, recovery, tool lists and reader behavior that this run does not change. New proof covers only the new operation, the guard and the changed readers. All checks run in this run before QA; the pull-request CI runs the full lanes afterwards, and no nightly result is relied on.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | `node packages/core/test/run-closure-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing preview assertions with byte comparisons | Fix before T-009 |
| AC-002 | SCN-002 | `node packages/core/test/run-closure-test.js` and `node packages/cli/scripts/run-close-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing header and phrase assertions | Fix before T-009 |
| AC-003 | SCN-003 | `node packages/core/test/run-closure-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing refusal assertions | Fix before T-009 |
| AC-004 | SCN-004 | `node packages/core/test/run-closure-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing phrase assertions | Fix before T-009 |
| AC-005 | SCN-005 | `node packages/core/test/run-closure-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing partial-result assertions | Fix before T-009 |
| AC-005 | SCN-006 | `node packages/core/test/run-closure-test.js` | Local Node 22 on Windows and CI | Transaction checkpoint fixture | Claude Code implementing agent | Passing replay and crash-recovery assertions | Fix before T-009 |
| AC-006 | SCN-007 | `node packages/core/test/run-closure-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing receipt assertions | Fix before T-009 |
| AC-006 | SCN-008 | `node packages/core/test/git-identity-test.js` | Local Node 22 on Windows and CI | Temporary HOME and XDG directories | Claude Code implementing agent | Passing identity assertions | Fix before T-009 |
| AC-007 | SCN-009 | `node packages/core/test/run-closure-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing not-closable assertions | Fix before T-009 |
| AC-008 | SCN-010 | `node packages/core/test/run-lifecycle-guard-test.js` and `node --test packages/mcp-server/test/run-command.test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing rejection assertions per path | Fix before T-009 |
| AC-008 | SCN-011 | `node packages/core/test/run-lifecycle-guard-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing backlog-only update assertions | Fix before T-009 |
| AC-008 | SCN-012 | `node packages/core/test/run-lifecycle-guard-test.js` against the pre-change writer, then after the change | Local Node 22 on Windows | Test written before the guard | Claude Code implementing agent | Failing output before, passing output after, recorded in CD+Tests | Record the gap in CD+Tests and explain why replay was impossible |
| AC-008 | SCN-013 | `node packages/core/test/run-lifecycle-guard-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing gate and dispatch assertions | Fix before T-009 |
| AC-009 | SCN-014 | `node packages/core/test/run-closure-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing seal and digest assertions | Fix before T-009 |
| AC-010 | SCN-015 | `node packages/core/test/run-lifecycle-guard-test.js` and `node packages/cli/scripts/claude-companion-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing selection assertions | Fix before T-009 |
| AC-011 | SCN-016 | `node packages/cli/scripts/cockpit-mcp-test.js` and `npm --prefix packages/control-ui test` | Local Node 22 on Windows and CI | Installed control-ui dependencies | Claude Code implementing agent | Passing projection and UI assertions | Install dependencies with `npm --prefix packages/control-ui ci`, then rerun |
| AC-012 | SCN-017 | `node packages/core/test/run-closure-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing backlog assertions | Fix before T-009 |
| AC-013 | SCN-018 | `node --test packages/mcp-server/test/run-command.test.js packages/mcp-server/test/protocol.test.js packages/mcp-server/test/safety.test.js` and `node packages/core/test/run-command-contract-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing schema, budget, tool-count and safety assertions | Shorten schema descriptions if the budget fails; never raise it |
| AC-013 | SCN-019 | Claude Code session with the branch build installed, MCP `agdf_closeout` on a scratch repository created with `create-agdf init` and fixture runs | Claude Code Desktop on Windows | Branch build installed for the session; scratch repository outside this repository | Claude Code implementing agent | Observation note and screenshots of preview, phrase and result | Record an evidence gap with the exact reason and keep the protocol test as substitute evidence |
| AC-003 | SCN-020 | `node packages/cli/scripts/run-close-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing CLI assertions for both validators | Fix before T-009 |
| AC-014 | SCN-021 | `npm run build:prepare` and `npm run compatibility:check` after `npm run compatibility:record` | Local Node 22 on Windows | Network not required | Claude Code implementing agent | Green command output and the documentation diff | Fix the reported drift before QA |
| AC-015 | SCN-022 | `node packages/core/test/run-closure-test.js` | Local Node 22 on Windows and CI | Fixture pending journal | Claude Code implementing agent | Passing blocking and recovery assertions | Fix before T-009 |
| AC-001 | SCN-023 | `node packages/core/test/run-closure-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing preview storage and digest assertions | Fix before T-009 |
| AC-004 | SCN-024 | `node packages/core/test/run-closure-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing order assertions | Fix before T-009 |
| AC-009 | SCN-025 | `node packages/core/test/run-closure-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing receipt and seal assertions | Fix before T-009 |
| AC-010 | SCN-026 | `node packages/core/test/run-lifecycle-guard-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing single-run evaluation assertions | Fix before T-009 |
| AC-011 | SCN-027 | `node packages/cli/scripts/cockpit-mcp-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing archive assertions | Fix before T-009 |
| AC-015 | SCN-028 | `node packages/core/test/run-closure-test.js` | Local Node 22 on Windows and CI | Transaction checkpoint fixture | Claude Code implementing agent | Passing crash and blocking assertions | Fix before T-009 |

Verification is sufficient when all scenarios pass on the final tree, the reused suites stay green, and the native observation is recorded or its gap is stated.

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Preview files in version control | SD: Preview files in version control | resolved | Previews stay versioned like recovery previews, which the repository already tracks in Git (23 files under `runs/*/recovery-previews/`); no ignore rule is added | Claude Code implementing agent, TP author |
| Exact test file names and suite placement | SD: Exact test file names and suite placement | resolved | New files `packages/core/test/run-closure-test.js`, `packages/core/test/run-lifecycle-guard-test.js`, `packages/core/test/git-identity-test.js` and `packages/cli/scripts/run-close-test.js`, registered in the CLI package test scripts and in `scripts/ci-test-domains.mjs`; existing MCP, cockpit, control-ui and companion suites are extended | Claude Code implementing agent, TP author |
| Native observation vehicle | TP | resolved | The native check uses a scratch repository with fixture runs outside this repository; no real run of this repository is closed during the run | Claude Code implementing agent, TP author |
| Full verification run | TP | resolved | Targeted suites, `build:prepare` and the compatibility check run here; the pull-request CI runs the full lanes | Claude Code implementing agent, TP author |

## 4. Brownfield Scope

Inspect before implementation: `run-steps.js` closeout branch and backlog path, `run-step-transaction.js` journal kinds and allow-lists, `run-operations.js` and `run-operation-proof.js`, `run-state-writer.js` write paths, `run-recovery.js` preview pattern, `gate-policy.js` completed branch, `run-work-summary.js`, `backlog-vocabulary.js`, `interaction-presentation.js`, `skill-dispatch/service.js` continuation checks, `run-command-contract.js` and `run-command-service.js`, CLI `command-registry.js`, `parse-args.js`, `validation-handlers.js`, `runtime/validator-application.js`, `control-inspect/cockpit.js`, the listed control-ui components, the companion's `assignment.mjs`, MCP server tests and the contract files of T-008. Search all lifecycle comparisons with `completed` for further readers.

## 5. Out Of Scope

- Closing any real run of this repository, including the 23 legacy runs.
- The shared run inventory, hub supplement 3 and the change of the backlog's role.
- A chat decision card for closures.
- Reopening ended runs.
- Changes to OR closeout and `completed` runs.

## 6. Risks And Blockers

- Revise: the `agdf_closeout` schema exceeds its byte budget and cannot be shortened without losing required payload fields.
- Revise: an entry point that changes runs is found without the lifecycle guard during Brownfield Analysis or review.
- Warn: the native MCP observation is unavailable; protocol tests remain the substitute evidence and the gap is stated.
- Warn: older AGDF runtimes in the same repository fail closed on the new receipt kind.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## AGDF Approval Summary (de; source=en)

Der Plan setzt das freigegebene Lösungsdesign in neun Aufgaben um und ordnet alle fünfzehn Kriterien und alle dreizehn Designentscheidungen 28 Szenarien zu, für jede Kombination aus dem SD mindestens eines.

- Umsetzung: Core-Modul für Vorschau und Anwenden samt Git-Identität (T-001), Einbindung in den Run-Step-Pfad mit Beleg, Journal und Backlog (T-002), Schutz beendeter Runs im Writer und an allen Einstiegspunkten (T-003), Leser im Core mit Gate-Policy, Zusammenfassung und Präsentation (T-004), MCP-Arten in `agdf_closeout` (T-005), CLI-Befehl `run-close` (T-006), Cockpit und Control-UI (T-007), Dokumentation und Vertragskette (T-008).
- Tests und Nachweise: neue Suiten für Abschluss, Schutz beendeter Runs, Git-Identität und CLI; Erweiterung der MCP-, Cockpit-, Control-UI- und Begleiter-Suiten; der Schutztest wird vor der Änderung einmal fehlschlagend festgehalten; die bestehenden Closeout-, Transaktions-, Protokoll- und Sicherheitstests bleiben grün; `build:prepare` und Kompatibilitätsprüfung laufen vor QA.
- Native Prüfung (T-009): Ein Agent in Claude Code bereitet über MCP eine Vorschau in einem Wegwerf-Repository mit Test-Runs vor, dein wörtlicher Satz wird weitergereicht, das Ergebnis entspricht der CLI; ist das nicht möglich, wird die Lücke benannt.
- Entscheidungen: Vorschaudateien werden wie die Recovery-Vorschauen versioniert; die neuen Testdateien und ihre Einordnung sind festgelegt; kein echter Run dieses Repositorys wird im Run geschlossen; die volle CI läuft im Pull Request.
- Risiken: Das Schema von `agdf_closeout` könnte das Byte-Budget überschreiten; ein übersehener Einstiegspunkt ohne Schutz; die native Prüfung könnte fehlen; ältere Laufzeiten lehnen die neue Belegart ab.
- Nächster Schritt: TP prüfen und nur mit `Approval: TP` freigeben; danach folgen die Brownfield Analysis und die Umsetzung.
