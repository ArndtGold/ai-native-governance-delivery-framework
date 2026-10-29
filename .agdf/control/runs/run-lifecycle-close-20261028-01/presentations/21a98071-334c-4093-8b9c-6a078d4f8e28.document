# SD: Close Active Runs as Superseded or Abandoned

Status: draft
Gate: SD
Gate approval: open
Based on: PRD (`.agdf/control/artefacts/run-lifecycle-close-20261028-01/PRD.md`, approved revision 11)
Date: 2026-10-28
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

A new Core module `packages/core/lib/control-state/run-closure.js` owns two operations:

1. **Preview** validates the requested entries, reads each listed run, derives the facts the PRD
   requires, decides per run whether it is closable and stores an immutable preview file. It writes no
   run, receipt or backlog row and returns the rendered preview text with the phrase
   `Close runs: <preview id>`.
2. **Apply** checks the exact phrase and the stored preview, refuses everything while any run of the
   repository has a pending run-step journal, reads the confirming Git identity once and then closes
   the closable entries one after another. Each closure is an ordinary run-step commit of the
   existing machinery: run lock and backlog lock, the v3 journal, a Run Operations receipt of the new
   kind `lifecycle_close.record`, the sealed writer and the existing closeout backlog move. A run that
   changed after the preview is skipped and reported; the others are closed.

Ended runs are protected centrally: the sealed run writer refuses any write to a run whose lifecycle
is `superseded` or `abandoned`, the gate policy evaluates such runs as closed with no allowed
delivery action, and the entry points that today rely only on gate status return a readable
`lifecycle_ended` reason before taking locks. Readers learn the two new states where they currently
only know `completed`.

The operation is exposed as the CLI command `run-close` and as two new kinds of the existing MCP
group `agdf_closeout`. Contracts, CLI help, MCP README and the handbook describe it.

## 2. Ownership And Source Of Truth

- The sealed `RUN_STATE.md` of each run stays the only authority for lifecycle and receipts; the new
  receipt lives in its existing `## Run Operations` section and is covered by `content_seal`
  (`packages/core/lib/control-state/run-seal-compute.js:114-125`).
- `run-closure.js` (new, Core) owns validation, preview, apply orchestration and result rendering.
- Existing owners are reused unchanged in role: `run-steps.js` (step commit and backlog move),
  `run-step-transaction.js` (journal and recovery), `run-state-writer.js` (lock, seal, atomic write),
  `run-operations.js` and `run-operation-proof.js` (receipt kinds and validation),
  `run-backlog.js`/`backlog-summary.js` (backlog projection), `gate-policy.js` (evaluation),
  `run-command-contract.js`/`run-command-service.js` (MCP command family), CLI
  `command-registry.js`/`parse-args.js`/`validation-handlers.js` (command surface).
- The preview file is a non-authorizing working file; it never replaces a receipt.
- `MASTER_BACKLOG.md` stays a derived pointer; a backlog problem never blocks a closure.

## 3. Architecture Decisions

- SDD-01: Implement closure in a new Core module `run-closure.js` that commits each run through the existing run-step path (new internal step `lifecycle_close`, journal v3, `commitRunStepLocked`) instead of a separate writer; rationale: lock order, journal, recovery, seal and backlog synchronization already exist and are tested for `closeout.record` (`run-steps.js:355-475`, `run-step-transaction.js:303-336`); consequence: closure inherits the one-pending-journal-per-repository rule, which the PRD now states in AC-015.
- SDD-02: Store each preview as a JSON file named after its `preview_id` in `.agdf/control/closure-previews/`, with `preview_id` as 8 random lowercase hex characters created exclusively, written through `atomicWrite` and never changed afterwards; its `preview_digest` is the SHA-256 of the canonical JSON without the digest field, and the confirmation phrase is exactly `Close runs: ` followed by the `preview_id`; rationale: a short phrase is easy to type and repository-level storage fits a multi-run decision, while digest binding follows `run-recovery.js:17-36`; consequence: previews have no expiry and stay valid while the listed runs are unchanged.
- SDD-03: Apply runs sequentially per entry in preview order: it rejects the whole apply with `closure_recovery_pending` when `pendingRunStepIds` is non-empty, then for each closable entry re-reads the run under its locks and closes it only if `revision_id` equals the preview's, the lifecycle is `active` and the seal is valid; otherwise it reports `changed_since_preview`, `not_active` or `seal_invalid`; rationale: runs are separate sealed files and the repository allows one pending journal, so per-run commits are the only consistent unit; consequence: an interrupted apply leaves at most one journal, recovered by the existing operation recovery, and repeating the apply finishes the rest.
- SDD-04: Derive each run's operation id deterministically as a UUID-formatted SHA-256 of `agdf-run-close/1`, `preview_id` and `run_id`; rationale: the existing idempotent replay check (`run-steps.js:203-213`) then recognizes a repeated apply per run and per-run operation status keeps working (`run-operation-status.js:16`); consequence: one preview can close each run at most once, and a new decision for the same run needs a new preview.
- SDD-05: Record the closure as Run Operations kind `lifecycle_close.record` whose effect record holds `lifecycle`, `reason`, `successor` (`{kind: run, value, verified: true}` or `{kind: reference, value, verified: false}` or `null`), `confirmed_by` (`{name, email, statement: cooperative}` or `{statement: unknown}`) and `preview` (`{id, digest}`), with the same assurance object as approvals; the run edits set `lifecycle` and `decision` to the outcome, keep `current_gate`, append an Evidence row and set the next allowed action to "none, run ended"; rationale: Run Operations are sealed, validated and already carry closeout receipts (`run-operations.js:7-80`); consequence: `RUN_OPERATION_KINDS`, its shape validator and the journal kind allow-list (`run-step-transaction.js:67-75,278-284`) gain the new kind with zero owned outputs.
- SDD-06: Guard ended runs centrally in `writeRunLocked` and `writeRunRecoveryLocked`: a current lifecycle of `superseded` or `abandoned` throws `AGDF_RUN_LIFECYCLE_ENDED`, mapped to the rejection `lifecycle_ended` with outcome, date and successor from the receipt; entry points that today rely only on gate status (artefact recording, run-present, run-approve and `approval.record`, presentation decisions, relationship correction, run-update with changed content, legacy run-step) check the lifecycle first for the same readable reason, and skill-dispatch continuation requires `lifecycle === active` instead of `!== completed` (`skill-dispatch/service.js:751-756`); rationale: the writer is the single choke point every mutation passes (`run-state-writer.js:304-370`), and early checks give the user a clear message; consequence: `completed` runs keep today's behavior, and `run-update` on an unchanged ended run only reaches `synchronizeRunBacklog`, which writes the backlog and not the run.
- SDD-07: Add an ended branch to `gate-policy.js` beside the `completed` branch (`gate-policy.js:400-434`) that returns a closed status, no allowed delivery operation, every delivery action forbidden and a next action naming the outcome and "start a new run"; rationale: artefact recording, presentation, approval and continuation already stop on a closed gate status, so one branch closes all indirect paths; consequence: `gate-check`, `doctor` for a single run and the status card show ended runs as closed.
- SDD-08: Read the confirming identity with a new pure Core helper that parses `user.name` and `user.email` from the repository Git config (following a `.git` file's `gitdir` and `commondir`), then `$XDG_CONFIG_HOME/git/config` or `~/.config/git/config`, then `~/.gitconfig`, first value per key wins, without include directives and without child processes; rationale: the MCP path forbids child processes (`packages/mcp-server/test/safety.test.js:35-44`) and both paths must record the same identity; consequence: identities set only through `include` or `includeIf` are not found and are recorded as unknown, which the documentation states.
- SDD-09: Expose the operation through MCP as two new kinds `closure.preview` and `closure.apply` of the existing group `agdf_closeout`, with a target-scoped envelope (`target_id`, `operation_id`, no `run_id` or `expected_revision_id`) allowed only for these kinds; preview payload `{entries: [{run_id, outcome, reason, successor_run?, successor_reference?}]}` with at most 64 entries, apply payload `{preview_id, confirmation}`; rationale: closure belongs to the closeout family and the tool count, error catalog names and README tool lists stay unchanged (`packages/mcp-server/test/protocol.test.js:119-131`); consequence: `validateRunCommand` gains a kind-specific envelope variant, and the schema must stay within the 8192-byte tool and 24576-byte aggregate budgets (`run-command-contract.js:15,198`).
- SDD-10: Add the CLI command `run-close` with `--action preview|apply`; preview takes either `--closure-file` naming a JSON file with an `entries` array or one entry through `--run`, `--outcome superseded|abandoned`, `--reason` and `--successor-run` or `--successor-ref`; apply takes `--preview-id` and `--confirmation`; it supports `--json`, prints the same Core-rendered text as MCP and is added to the surface-local validator set (`packages/cli/lib/runtime/validator-application.js:7`); rationale: an explicit successor kind avoids guessing whether a value is a run id, and the installed plugin runtime must offer the command like `run-approve`; consequence: the auto-routed `agdf-closeout --command-file` route exists as well.
- SDD-11: Move the backlog row through the existing closeout backlog path with final status `Superseded` or `Abandoned`, a historical record linking the run's `RUN_STATE.md` and an outcome text that names the successor and the reason for `superseded` or the reason for `abandoned`; rationale: the status vocabulary already knows both values (`control-evaluation/shared.js:65-66`) and the move is tested for closeout (`run-steps.js:150-152`); consequence: unlinked or skipped backlog updates are reported per run with the existing reasons.
- SDD-12: Teach readers the ended states: `run-work-summary.js` returns a new summary kind `run_ended` (added to `SUMMARY_KINDS` in `backlog-vocabulary.js`), `cockpit.js` maps ended runs to a new assessment state `ended` with a closure projection read from the receipt, control-ui (`api.ts`, `types.ts`, `WorkStep.tsx`, `DocumentView.tsx`, `RunDetail.tsx`) renders outcome, reason, successor, person and time with the existing labels "Ersetzt" and "Beendet" (`feedback.tsx:25`), and `interaction-presentation.js` treats ended runs like completed ones; rationale: these readers currently show ended runs as open or unconfirmed; consequence: the companion and the all-active resolver need no change and get regression tests only.
- SDD-13: Update contract and user text: `control-scaffold.md` (lifecycle values and closure), the gate transition table in `gate-transition.md` (ended runs allow no delivery action), `interaction.md` (the exact closure phrase is forwarded verbatim like an approval formula), `packages/cli/README.md`, `packages/mcp-server/README.md` and the handbook chapter `docs/handbook/de/04-mehrere-runs.md` with its derived English counterpart, then refresh the Copilot payload baseline, eval fingerprints and compatibility records; rationale: the PRD requires documentation and the contract chain must stay consistent; consequence: native Claude CLI evidence tied to contract text becomes stale and is renewed where the release checks require it.

## 4. Integration Points

- Core: new `run-closure.js` and Git identity helper; changes in `run-steps.js`, `run-step-transaction.js`, `run-operations.js`, `run-operation-proof.js`, `run-state-writer.js`, `gate-policy.js`, `run-work-summary.js`, `backlog-vocabulary.js`, `run-recording.js`, `run-artefact-recording.js`, `run-presentation.js`, `approval-command.js`, `run-relationship-correction.js`, `interaction-presentation.js`, `skill-dispatch/service.js`, `control-inspect/cockpit.js`.
- MCP: `run-command-contract.js` and `run-command-service.js` for the two kinds; the MCP server and worker forward the group unchanged (`packages/mcp-server/src/server.js:96-138`).
- CLI: `command-registry.js`, `parse-args.js`, `validation-handlers.js`, `runtime/validator-application.js`.
- UI: `packages/control-ui/src/` components listed in SDD-12.
- Files: `.agdf/control/closure-previews/` (new), `RUN_STATE.md` of closed runs, `MASTER_BACKLOG.md`.
- Documentation and generated payloads per SDD-13.

## 5. Constraints And Compatibility

- No child process and no new file-writing module on the MCP path; previews are written through `atomicWrite`.
- `completed` runs, OR closeout and existing receipts keep their behavior and bytes.
- Older AGDF runtimes do not know `lifecycle_close.record`; a run closed by a newer runtime is read by an older runtime as a run with an unknown operation kind and fails closed. All hosts of a repository should use the same or a newer AGDF version, as for earlier receipt additions.
- The MCP tool count stays seven; tool schemas stay within their byte budgets.
- Windows, macOS and Linux paths; Git config parsing handles CRLF and quoted values.

## 6. Test And Evidence Strategy

Existing coverage to reuse: the closeout command tests (`packages/core/test/run-closeout-command-test.js`) for commit, replay and crash points; transaction checkpoint fixtures (`packages/core/test/fixtures/transaction-checkpoints.js`); structured run fixtures (`packages/cli/scripts/fixtures/late-source-revision.js`); MCP protocol, run-command and safety tests; cockpit fixtures; companion suites.

New proof by risk:

- Closure core (AC-001 to AC-007, AC-009, AC-015): a new Core test file for preview content and immutability, validation refusals, exact phrase, changed run skipped while others close, not-closable cases, receipt shape with and without Git identity, seal validity and byte-identical artefacts, pending journal blocking the whole apply, idempotent repeat and a crash between two runs recovered by operation recovery.
- Ended-run guard (AC-008): one test per writer path, plus the backlog-only `run-update`, through CLI and MCP; a negative check that the guard fails on the unfixed code before the change (writer accepts an ended run today).
- Readers (AC-010, AC-011): doctor and delivery-map all-active selection, gate policy ended branch, cockpit projection and UI rendering, companion list.
- Backlog (AC-012): linked, unlinked and skipped cases.
- MCP (AC-013): schema and envelope tests, byte budgets, tool count unchanged, safety tests green; one native observation of preview and apply in Claude Code.
- Documentation (AC-014): text present; payload baseline, eval fingerprints and compatibility checks green.

Placement: all automated checks run in this run before QA through the existing `node --test` suites and the CI test domains (`scripts/ci-test-domains.mjs`); the native observation happens before QA; no nightly result is relied on.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Preview derives title, gate, open approvals, last activity, artefact count, warnings and closability per run and writes only the preview file | `run-closure.js` reading each sealed `RUN_STATE.md` | SDD-01, SDD-02 | none — read-only on runs |
| AC-002 | Preview text header with run count, finality notice and `Close runs: <preview_id>` | `run-closure.js` renderer | SDD-02 | Phrase is fixed English, independent of presentation language |
| AC-003 | Validation refuses missing reason, missing successor for `superseded`, unknown or self successor run before writing | `run-closure.js` validation | SDD-02, SDD-10 | Explicit successor kind avoids misreading free references |
| AC-004 | Apply compares the exact phrase and stored digest before any lock | `run-closure.js` apply | SDD-02, SDD-03 | none — nothing written on mismatch |
| AC-005 | Per-entry revision check under the run lock; changed runs reported, others closed | `run-closure.js` with `run-steps.js` commit | SDD-03, SDD-04 | Sequential commits; partial results are explicit |
| AC-006 | Run Operations receipt `lifecycle_close.record` with outcome, reason, successor, identity, preview digest and approval-equivalent assurance | `run-operations.js`, Git identity helper | SDD-05, SDD-08 | Older runtimes fail closed on the unknown kind |
| AC-007 | Closability check refuses completed, ended and seal-invalid runs with reason and recovery hint | `run-closure.js`, `run-seal.js` | SDD-03 | none |
| AC-008 | Writer guard plus early lifecycle checks and continuation check; backlog-only `run-update` allowed | `run-state-writer.js`, entry points, `skill-dispatch/service.js` | SDD-06, SDD-07 | `completed` behavior unchanged |
| AC-009 | Closure goes through the sealed writer; no artefact or receipt bytes change | `run-state-writer.js`, `run-seal-compute.js` | SDD-01, SDD-05 | none |
| AC-010 | All-active resolver already filters `active`; gate policy closed status for single-run doctor | `run-state-resolver.js`, `gate-policy.js`, companion `assignment.mjs` | SDD-07, SDD-12 | Regression tests only |
| AC-011 | Cockpit assessment `ended` with closure projection; control-ui renders outcome, reason, successor, person, time; archive from backlog | `cockpit.js`, `packages/control-ui/src/`, `cockpit-backlog.js` | SDD-11, SDD-12 | UI enum extended; older UI builds are rebuilt with the package |
| AC-012 | Existing closeout backlog move with final status and outcome; skip reasons reported | `run-steps.js` backlog path, `backlog-summary.js` | SDD-11 | none |
| AC-013 | `agdf_closeout` kinds `closure.preview` and `closure.apply` with target-scoped envelope; same Core renderer as CLI | `run-command-contract.js`, `run-command-service.js` | SDD-09 | Schema byte budgets; tool count unchanged |
| AC-014 | Contract, README and handbook updates with payload, fingerprint and compatibility refresh | Contracts under `plugins/agdf/meta/contracts/`, READMEs, handbook | SDD-13 | Native evidence tied to contract text needs renewal |
| AC-015 | Apply refuses the whole list while any run has a pending journal; preview shows it | `run-closure.js` with `run-step-pending.js` | SDD-01, SDD-03 | none — keeps the one-pending-write rule |

## 8. Risks And Open Questions

- The target-scoped envelope is new for the run command family; TP must test that per-run kinds keep requiring `run_id` and `expected_revision_id`.
- The schema growth of `agdf_closeout` may hit the byte budget; if it does, the payload descriptions are shortened, not the budget raised.
- Git identity parsing without includes can miss identities; the result states "unknown" visibly.
- Readers outside the listed set may still treat non-active runs as completed; Brownfield Analysis after TP approval searches for further lifecycle comparisons.
- Whether preview files are kept out of version control is decided in TP.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Batch transaction form | before_sd | resolved | Sequential per-run commits through the existing run-step journal (SDD-03, SDD-04) | Arndt Gold, SD Owner |
| MCP tool placement | before_sd | resolved | Two new kinds of `agdf_closeout` with a target-scoped envelope; tool count unchanged (SDD-09) | Arndt Gold, SD Owner |
| Receipt form | before_sd | resolved | Run Operations kind `lifecycle_close.record` (SDD-05) | Arndt Gold, SD Owner |
| Ended-run protection | before_sd | resolved | Central writer guard plus gate policy branch and early entry checks (SDD-06, SDD-07) | Arndt Gold, SD Owner |
| Successor input | before_sd | resolved | Explicit `successor_run` or `successor_reference` (SDD-09, SDD-10) | Arndt Gold, SD Owner |
| Git identity source | before_sd | resolved | Pure config-file parser without includes for CLI and MCP (SDD-08) | Arndt Gold, SD Owner |
| Preview storage and phrase | before_sd | resolved | `.agdf/control/closure-previews/<8-hex>.json`, immutable, `Close runs: <preview_id>` (SDD-02) | Arndt Gold, SD Owner |
| Preview files in version control | later_tp | deferred | Decide whether `closure-previews/` is ignored, consistent with how recovery previews are handled; behavior and receipts are unaffected | TP author through gate-check |
| Exact test file names and suite placement | later_tp | deferred | Execution detail of the test plan | TP author through gate-check |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)

- Lösung: Ein neues Core-Modul `run-closure.js` bietet Vorschau und Anwenden. Die Vorschau prüft die Einträge, sammelt je Run die geforderten Angaben, entscheidet die Schließbarkeit und speichert eine unveränderliche Vorschaudatei; sie schreibt keinen Run. Das Anwenden prüft den genauen Satz und die gespeicherte Vorschau, lehnt alles ab, solange irgendein Run ein offenes Schreib-Journal hat, liest die Git-Identität einmal und schließt die Runs nacheinander über die bestehende Run-Step-Maschinerie mit Sperren, Journal, Beleg, Seal und Backlog-Verschiebung. Geänderte Runs werden übersprungen und gemeldet.
- Verantwortung: `RUN_STATE.md` bleibt einzige Quelle für Lifecycle und Belege; der Beleg steht im bestehenden Abschnitt Run Operations unter dem Seal. Bestehende Owner (Run-Step-Pfad, Transaktion, Writer, Belegprüfung, Backlog, Gate-Policy, MCP-Befehlsfamilie, CLI) bleiben in ihrer Rolle; die Vorschaudatei berechtigt zu nichts.
- Entscheidungen: SDD-01 Abschluss über den bestehenden Run-Step-Pfad statt eigenem Writer. SDD-02 Vorschau unter `.agdf/control/closure-previews/<8 Hex>.json`, unveränderlich, Satz `Close runs: <Vorschau-ID>`. SDD-03 nacheinander je Run mit Revisionsprüfung; offenes Journal blockiert alles. SDD-04 deterministische Vorgangs-ID je Run für Wiederholbarkeit. SDD-05 Beleg als Run-Operations-Art `lifecycle_close.record`. SDD-06 zentrale Sperre im Writer plus frühe Prüfungen und Fortsetzungsprüfung auf `active`. SDD-07 eigener Zweig in der Gate-Policy für beendete Runs. SDD-08 Git-Identität aus den Config-Dateien ohne Kindprozess. SDD-09 zwei neue Arten in `agdf_closeout` mit zielgebundener Hülle, Werkzeugzahl bleibt sieben. SDD-10 CLI `run-close` mit Vorschau und Anwenden, ausdrücklicher Nachfolger-Art, auch im installierten Plugin. SDD-11 Backlog-Verschiebung über den bestehenden Closeout-Pfad. SDD-12 Leser kennen `run_ended` und den Cockpit-Zustand `ended`. SDD-13 Verträge, READMEs, Handbuch und Payload-Kette.
- Schnittstellen: Core (neues Modul, Identitätshelfer, Run-Step, Transaktion, Belege, Writer, Gate-Policy, Zusammenfassung, Einstiegspunkte, Skill-Dispatch, Cockpit), MCP-Befehlsvertrag und -dienst, CLI-Register, Parser, Handler und Validator-Liste, Control-UI, die neue Vorschauablage, `RUN_STATE.md`, `MASTER_BACKLOG.md`, Dokumentation und erzeugte Payloads.
- Verträglichkeit: kein Kindprozess und kein neues schreibendes Modul im MCP-Pfad; abgeschlossene Runs, OR-Abschluss und bestehende Belege bleiben unverändert; ältere Laufzeiten lehnen die neue Belegart ab, daher dieselbe oder neuere AGDF-Version für alle Hosts; Werkzeugzahl und Byte-Budgets bleiben eingehalten; Windows, macOS und Linux.
- Tests: Wiederverwendung der Closeout-, Transaktions-, MCP-, Sicherheits-, Cockpit- und Begleiter-Tests. Neu: Core-Tests für Vorschau, Prüfungen, Satz, übersprungene Runs, Belege, Seal, offenes Journal, Wiederholung und Absturz zwischen zwei Runs; je Schreibweg ein Ablehnungstest einschließlich reinem Backlog-Abgleich; Leser-, Backlog-, Schema- und Budgettests; eine native Beobachtung in Claude Code; Payload-, Fingerprint- und Kompatibilitätsprüfungen. Alles vor QA in den bestehenden Suiten.
- Kriterien: AC-001 bis AC-015 sind je einmal einer Designantwort, ihrer Quelle und den SDD zugeordnet.
- Risiken und offene Punkte: die neue zielgebundene Hülle darf die Pflichtfelder der übrigen Arten nicht aufweichen; das Schema von `agdf_closeout` kann das Byte-Budget erreichen; Identitäten nur über include werden als unbekannt erfasst; weitere Leser mit Vergleich auf `completed` sucht die Brownfield Analysis; ob Vorschaudateien versioniert werden, entscheidet der TP.
- Nächster Schritt: SD prüfen und nur mit `Approval: SD` freigeben; danach folgt der Aufgaben- und Testplan.
