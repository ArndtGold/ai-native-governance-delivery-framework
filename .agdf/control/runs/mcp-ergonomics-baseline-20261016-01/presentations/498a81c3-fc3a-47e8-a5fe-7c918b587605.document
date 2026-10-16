# TP: MCP ergonomics baseline evaluation

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-16
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Prepare a clean work branch `feat/mcp-ergonomics-baseline` from `main`; the owner first preserves the uncommitted work on `feat/claude-install-fix`; this run's own control files travel with the working tree | Arndt Gold | none |
| T-002 | Build the current checkout and capture the normalized pre-change `tools/list` of `agdf` (`--surface claude`) and `agdf-cockpit` (without and with declared UI capability) with the first evaluation script | Claude Code agent | T-001 |
| T-003 | Spike in an isolated Claude Code home: install the checkout, run one minimal Sonnet session per variant, verify the MCP-only flags (`--disable-slash-commands`, `disableAllHooks`) and inventory the stream-json fields used by SDD-008 | Claude Code agent | T-001 |
| T-004 | Extract `scripts/native-probes/lib/claude-session.mjs` (isolation, install, credential handling, stream parsing, redaction) and refactor `claude-host-e2e.mjs` to use it with unchanged output | Claude Code agent | T-003 |
| T-005 | Create `evals/mcp-ergonomics/` with `METRICS.md`, normalization (SDD-004) and call classification (SDD-005) | Claude Code agent | T-001 |
| T-006 | Implement deterministic fixture builders F1 to F5, `call-matrix.v1.json` and the protocol runner `evals/scripts/run-mcp-ergonomics-protocol.js` | Claude Code agent | T-002, T-005 |
| T-007 | Implement `tasks.v1.json`, success predicates, isolation manifests and the native runner `evals/scripts/run-mcp-ergonomics-native.js` with rounds, budget and variant verification | Claude Code agent | T-003, T-004, T-005, T-006 |
| T-008 | Implement the report, `findings-map.v1.json`, promote with redaction check and `evals/scripts/compare-mcp-ergonomics.js` | Claude Code agent | T-006, T-007 |
| T-009 | Add unit tests `test:mcp-ergonomics`, register root scripts `eval:mcp-ergonomics:protocol`, `eval:mcp-ergonomics:native` and `eval:mcp-ergonomics:compare` and add the unit tests to the repository lane of `scripts/verify-ci.mjs` with its test | Claude Code agent | T-005, T-006, T-007, T-008 |
| T-010 | Run the protocol layer twice and compare both runs | Claude Code agent | T-006, T-008 |
| T-011 | Run the native layer (two rounds, cap 25 USD) with isolation proof | Claude Code agent with owner consent | T-007, T-010 |
| T-012 | Promote baseline and report, run the compare command against the promoted baseline for both layers | Claude Code agent | T-010, T-011 |
| T-013 | Capture post-change `tools/list` and compare with T-002, run the diff-scope check, existing suites and `compatibility:record`/`check` from LF bytes | Claude Code agent | T-009, T-012 |

## 1a. Measurement Definitions

Fixtures (generated per run in temporary directories through `create-agdf init`, the canonical run
CLI and the existing builders in `packages/cli/scripts/fixtures/`; fixed run IDs):

- F1 `governed-empty`: initialized control, no run.
- F2 `run-at-prd`: run `demo-run-01` with approved UR and a registered PRD draft.
- F3 `run-ur-presented`: run `demo-run-01` at UR with a prepared presentation and its `presentation_id`.
- F4 `run-ur-long-document`: like F3 with a UR long enough to need at least three `presentation-document` cursor pages.
- F5 `run-at-uat-approved`: run `demo-run-01` with the full chain to approved UAT and an OR draft, built
  with the existing expanded source-revision fixture builder.

Call matrix v1 (each call executed five times; the first execution provides byte metrics, all five
provide latency):

- `agdf_dispatch`: valid status on F2; schema-invalid (unknown property); semantic failure with a
  relative `working_directory` (`invalid_input`); unresolved target without target pair (`target_unresolved`).
- `agdf_inspect`: valid `doctor` and `gate-check` `status-card` on F2; valid `presentation-document` with
  every cursor on F4; schema-invalid (unknown `operation`); semantic failure with an unknown run.
- `agdf_prepare`: valid `presentation.prepare` on F2; schema-invalid (missing `operation_id`); semantic
  failure with a stale `expected_revision_id` (`stale_revision`).
- `agdf_record`: valid `step.record` evidence on F2; schema-invalid; semantic failure with a wrong
  `target_id` (`target_binding_mismatch`).
- `agdf_approve`: valid `approval.record` on F3; schema-invalid; semantic failure with an unknown
  `presentation_id`.
- `agdf_revise`: valid `source_revision.preview` of a reviewed UR proposal on F2; schema-invalid;
  semantic failure with a proposal digest mismatch.
- `agdf_closeout`: valid `closeout.record` on F5; schema-invalid; semantic failure on F2 (not at OR).
- Cockpit: `agdf_cockpit` render and `agdf_cockpit_read` snapshot (valid), `agdf_cockpit_read` with an
  unknown operation (semantic failure), each without and with declared MCP App UI capability.

Native task set v1 (German prompts, `presentation_language` de; fixture per task; allowed mutation
paths in brackets):

- T1 status on F2: "Wo steht Run demo-run-01 in diesem Repository? Nur den Status, nichts ändern."
  Success: at least one successful AGDF read bound to `demo-run-01` and no fixture change [none].
- T2 intake on F1: "Ich möchte in diesem Repository eine CLI-Option --version ergänzen. Starte dafür
  den AGDF-Ablauf." Success: exactly one new run exists at gate UR and no file outside
  `.agdf/control/` changed [`.agdf/control/**`].
- T3 approval on F3: "Mir wurde die UR von Run demo-run-01 vorgelegt (Präsentation {presentation_id}).
  Meine Antwort: Approval: UR" Success: exactly one UR approval bound to that presentation and no other
  gate approved [`.agdf/control/**`].
- T4 document on F4: "Zeig mir die vorgelegte UR von Run demo-run-01 vollständig." Success: every
  cursor page was fetched and no fixture change [none].
- T5 input error on F2: "Prüfe den Status von Run Demo-Run-01." Success: the session ends with a
  successful AGDF read bound to `demo-run-01`; invalid calls before it are counted [none].
- T6 stale revision on F2 with a recorded later revision: "Erfasse für Run demo-run-01 die Evidenz
  'Smoke-Test bestanden' mit Revision {stale_revision_id}." Success: the stale write is rejected and
  either exactly one evidence record bound to the current revision exists or none exists and no
  duplicate was written [`.agdf/control/**`].

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-002 | T-006 | SCN-001 | Protocol output lists valid, schema-invalid and semantic-failure calls for all seven tools and cockpit tools as measured or not exposed with reason | Protocol run output from T-010; call-matrix.v1.json |
| AC-001 | SDD-003 | T-006 | SCN-002 | Every call targets a freshly generated fixture root; no call targets the repository checkout | Protocol run log with fixture roots; unit test of fixture builders |
| AC-002 | SDD-004 | T-005 | SCN-003 | Every call row has all AC-002 fields; every tool row has definition bytes and documented-parameter share | Protocol run output; unit test of normalization |
| AC-003 | SDD-004 | T-010 | SCN-004 | Two protocol runs are identical in every non-timing metric; latency shows median and p95 | Compare output of T-010 |
| AC-003 | SDD-012 | T-008 | SCN-005 | Compare reports unchanged for identical runs and changed for a seeded byte difference | Unit test output; compare output |
| AC-004 | SDD-005 | T-005 | SCN-006 | Seeded responses are classified as ok, sdk_validation, agdf_failure, protocol_error and flagged failure_without_isError | Unit test output; METRICS.md |
| AC-004 | SDD-013 | T-009 | SCN-007 | Unit test pins the SDK input-validation text and runs in the repository lane | CI-lane run log; unit test output |
| AC-005 | SDD-001 | T-007 | SCN-008 | tasks.v1.json holds T1 to T6 with fixture, prompt, success predicate and allowed paths | Schema unit test output; file review |
| AC-005 | SDD-010 | T-007 | SCN-009 | Each success predicate passes on a positive and fails on a negative synthetic fixture state | Unit test output |
| AC-006 | SDD-006 | T-004 | SCN-010 | Parser extracts every tool pair with name, is_error and bytes plus init and result data from a recorded stream | Unit test output with synthetic stream fixture |
| AC-006 | SDD-008 | T-011 | SCN-011 | Every native session record has all AC-006 fields or unavailable with reason | Native observations from T-011 |
| AC-007 | SDD-007 | T-003 | SCN-012 | MCP-only sessions show the AGDF MCP server connected and no AGDF skill or hook output; otherwise the cells are not_measured with reason | Spike evidence from T-003; native observations from T-011 |
| AC-008 | SDD-009 | T-011 | SCN-013 | Every cell has two sessions or the run is marked incomplete; the report shows both values and their range | Native observations; report |
| AC-009 | SDD-011 | T-011 | SCN-014 | Before and after manifests match, fixture mutation check has zero violations, no credential copy remains | Manifest comparison and mutation-check output |
| AC-010 | SDD-006 | T-004 | SCN-015 | Redaction removes raw, forward-slash and JSON-escaped local paths | Unit test output |
| AC-010 | SDD-012 | T-008 | SCN-016 | Promote fails on a seeded absolute path and passes on the clean baseline | Unit test output; promote log from T-012 |
| AC-010 | SDD-013 | T-009 | SCN-017 | Redaction unit tests run in the repository lane | CI-lane run log |
| AC-011 | SDD-012 | T-012 | SCN-018 | baseline.json contains every AC-011 provenance field | Promoted baseline.json |
| AC-012 | SDD-001 | T-009 | SCN-019 | Root scripts for both layers and compare exist and run from a clean checkout after build | Command run log |
| AC-012 | SDD-012 | T-012 | SCN-020 | baseline.json and REPORT.md are committed-ready under evals/mcp-ergonomics/baselines | Repository files; git status |
| AC-013 | SDD-001 | T-008 | SCN-021 | findings-map.v1.json maps all twelve findings to a metric or a reason | Unit test output; file review |
| AC-013 | SDD-012 | T-012 | SCN-022 | REPORT.md renders the twelve mapped findings | Promoted REPORT.md |
| AC-014 | SDD-014 | T-013 | SCN-023 | Post-change tools/list equals the T-002 capture byte for byte, diff scope is within the allowed paths and existing suites pass | tools/list comparison; diff-scope output; test logs; compatibility check |
| AC-015 | SDD-009 | T-007 | SCN-024 | Scheduler runs round 1 for all cells before round 2, stops at 25 USD and passes the remaining budget per session | Scheduler unit test; native run output with order and cost |

## 3. Test Plan

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | npm run eval:mcp-ergonomics:protocol | Windows 11, Node 22, current build | Current package build | Claude Code agent | Protocol output with all matrix rows | Report build failure and stop T-010 |
| AC-001 | SCN-002 | npm run test:mcp-ergonomics and protocol run log | Windows 11, Node 22 | none | Claude Code agent | Fixture roots under the temporary directory only | Fix fixture builder before measuring |
| AC-002 | SCN-003 | npm run test:mcp-ergonomics; protocol run | Windows 11, Node 22 | Current package build | Claude Code agent | All fields present per call and tool | Treat missing field as a defect in T-005 |
| AC-003 | SCN-004 | Two protocol runs, then npm run eval:mcp-ergonomics:compare | Windows 11, Node 22 | Current package build | Claude Code agent | Compare result unchanged for non-timing metrics | Add the found nondeterminism to the normalization rule and repeat |
| AC-003 | SCN-005 | npm run test:mcp-ergonomics | Any OS, Node 22 | none | Claude Code agent | Unchanged and changed cases detected | Fix compare logic |
| AC-004 | SCN-006 | npm run test:mcp-ergonomics | Any OS, Node 22 | none | Claude Code agent | All classes and the flag asserted | Fix classifier |
| AC-004 | SCN-007 | node scripts/verify-ci.mjs --lane repository --stage mcp-ergonomics | Windows 11, Node 22 | none | Claude Code agent | Lane stage passes | Fix lane registration |
| AC-005 | SCN-008 | npm run test:mcp-ergonomics | Any OS, Node 22 | none | Claude Code agent | Task-set schema test passes | Complete the task file |
| AC-005 | SCN-009 | npm run test:mcp-ergonomics | Any OS, Node 22 | none | Claude Code agent | Positive and negative predicate cases pass | Fix the predicate |
| AC-006 | SCN-010 | npm run test:mcp-ergonomics | Any OS, Node 22 | none | Claude Code agent | Parser assertions pass | Fix the shared parser |
| AC-006 | SCN-011 | npm run eval:mcp-ergonomics:native | Windows 11, Claude Code 2.1.268 | Owner consent for credential use and up to 25 USD | Arndt Gold | Session records complete or unavailable with reason | Record unavailable fields with reason; no product change |
| AC-007 | SCN-012 | Spike script from T-003, then native run | Windows 11, Claude Code 2.1.268 | Owner consent for credential use | Arndt Gold | Init and transcript evidence per variant | Mark MCP-only cells not_measured and re-evaluate Brownfield Review if a product change would be needed |
| AC-008 | SCN-013 | npm run eval:mcp-ergonomics:native | Windows 11, Claude Code 2.1.268 | Owner consent for up to 25 USD | Arndt Gold | Two sessions per cell or incomplete flag | Report incomplete run; do not raise the cap without owner decision |
| AC-009 | SCN-014 | Native runner isolation step | Windows 11 | Read access to the real Claude configuration subset | Claude Code agent | Equal manifests, zero violations, no credential copy | Stop and report the changed path |
| AC-010 | SCN-015 | npm run test:mcp-ergonomics | Any OS, Node 22 | none | Claude Code agent | Redaction assertions pass | Fix redaction |
| AC-010 | SCN-016 | npm run test:mcp-ergonomics; promote in T-012 | Windows 11, Node 22 | none | Claude Code agent | Seeded failure and clean pass | Keep the baseline unpromoted until fixed |
| AC-010 | SCN-017 | node scripts/verify-ci.mjs --lane repository --stage mcp-ergonomics | Windows 11, Node 22 | none | Claude Code agent | Lane stage passes | Fix lane registration |
| AC-011 | SCN-018 | Inspect promoted baseline.json | Windows 11 | none | Claude Code agent | All provenance fields present | Fix the baseline writer |
| AC-012 | SCN-019 | Run the three root scripts from a clean checkout after build | Windows 11, Node 22 | Current package build | Claude Code agent | Each script exits successfully | Fix script registration |
| AC-012 | SCN-020 | git status after promote | Windows 11 | none | Arndt Gold | Baseline and report present as new files | Re-run promote |
| AC-013 | SCN-021 | npm run test:mcp-ergonomics | Any OS, Node 22 | none | Claude Code agent | Twelve findings mapped | Complete the findings map |
| AC-013 | SCN-022 | Inspect promoted REPORT.md | Windows 11 | none | Arndt Gold | Twelve findings rendered | Fix the report renderer |
| AC-014 | SCN-023 | Protocol tools/list capture, git diff scope check, npm --prefix packages/mcp-server test, npm run test:verification, npm run compatibility:check | Windows 11, Node 22 | Current package build; LF working copy | Claude Code agent | Byte-identical tools/list, allowed diff scope, passing suites | Stop and revert the offending change |
| AC-015 | SCN-024 | npm run test:mcp-ergonomics; native run output | Windows 11 | Owner consent for up to 25 USD | Claude Code agent | Order, stop and budget assertions pass; cost per model reported | Fix the scheduler before any native run |

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Call matrix, fixture states, prompts and success predicates | SD: Exact call matrix, fixture states, prompts and success predicates | resolved | Fixtures F1 to F5, call matrix v1 and task set v1 as defined in section 1a. | Arndt Gold |
| Prompt language | TP | resolved | German prompts with presentation_language de, matching the owner's actual usage. | Arndt Gold |
| Latency sampling | TP | resolved | Each protocol matrix call runs five times; the first provides byte metrics, all five provide median and p95. | Arndt Gold |
| Model identifiers | TP | resolved | `claude-opus-5-5` and `claude-sonnet-5-5`. | Arndt Gold |
| Branch preparation | TP | resolved | The owner prepares the clean branch in T-001 before any implementation; the agent performs no VCS action without an explicit request. | Arndt Gold |

## 4. Brownfield Scope

Before CD+Tests, the implementation-preparation Brownfield Analysis inspects:
`packages/mcp-server/test/helpers.js`, `packages/mcp-server/test/owned-runtime.js`,
`packages/cli/scripts/fixtures/` (prd-definition, sd-definition, late-source-revision,
expanded-source-revision builders), `scripts/native-probes/claude-host-e2e.mjs`,
`evals/lib/skill-evals/workspace.js`, `evals/scripts/`, root `package.json`, `scripts/verify-ci.mjs`
with `scripts/verification-test.mjs`, and `docs/compatibility/evidence/`.

## 5. Out Of Scope

- Any change to MCP interfaces, Core contracts, server adapter, plugin payload or published packages.
- Native measurement on Codex, Copilot or OpenCode.
- CI thresholds or regression budgets; the protocol and native layers stay manual.
- Committing, pushing or opening a pull request; the owner does that.

## 6. Risks And Blockers

- Block: T-003 shows the MCP-only flags cannot suppress AGDF skills or hooks without a product change;
  then MCP-only cells are `not_measured` and the Brownfield Review is re-evaluated before continuing.
- Block: post-change `tools/list` differs from the T-002 capture.
- Revise: protocol non-timing metrics differ between two runs after normalization.
- Warn: the native run stops at 25 USD in round 2 and the baseline is marked incomplete.
- Warn: Claude Code does not report a metric; it is recorded as `unavailable` with reason.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## AGDF Approval Summary (de; source=en)

- Ziel: Den freigegebenen Entwurf in 13 Aufgaben umsetzen und mit 24 Prüfszenarien gegen alle 15 Abnahmekriterien und alle 14 Designentscheidungen nachweisen; am Ende stehen ein committeter Ausgangswert und ein Bericht.
- Umfang: T-001 sauberer Branch ab `main` durch dich; T-002 Erfassung der `tools/list`-Ausgabe vor jeder Änderung; T-003 Vorabtest der Claude-Code-Schalter für „nur MCP“ und der Stream-Felder; T-004 gemeinsames Claude-Sitzungsmodul aus der bestehenden Probe; T-005 bis T-009 Messkomponente mit Normalisierung, Klassifikation, Fixtures F1 bis F5, Aufrufmatrix v1, Aufgabensatz v1, Bericht, Promote mit Bereinigungsprüfung, Vergleich, Unit-Tests und CI-Lane; T-010 zwei Protokollläufe; T-011 native Messung mit Kostendeckel 25 USD; T-012 Promote und Vergleich; T-013 Abschlussprüfung auf unveränderte Schnittstellen, Diff-Umfang, bestehende Tests und Kompatibilitätsnachweise.
- Umfang (Messdetails): Jeder Matrix-Aufruf läuft fünfmal, der erste liefert die Bytes, alle fünf die Latenz. Die sieben `agdf`-Tools bekommen je einen gültigen, einen schemaungültigen und einen fachlich scheiternden Aufruf, das Cockpit wird ohne und mit UI-Fähigkeit gemessen. Die sechs Aufgaben laufen mit deutschen Prompts auf eigenen Fixtures und haben deterministische Erfolgsprüfungen, zum Beispiel genau ein neuer Run am UR-Gate für T2 oder genau eine Freigabe zur genannten Präsentation für T3.
- Entscheidungen: Aufrufmatrix, Fixtures, Prompts und Erfolgsprüfungen sind in Abschnitt 1a festgelegt; deutsche Prompts; fünf Wiederholungen je Aufruf für die Latenz; Modelle `claude-opus-5-5` und `claude-sonnet-5-5`; den Branch bereitest du vor, der Agent führt ohne ausdrückliche Bitte keine Git-Aktionen aus. Die native Messung nutzt deine Claude-Zugangsdaten in einem isolierten Verzeichnis und bis zu 25 USD.
- Risiken: Blockierend sind ein Vorabtest, der zeigt, dass „nur MCP“ ohne Produktänderung nicht möglich ist, und eine veränderte `tools/list`-Ausgabe nach der Umsetzung. Zur Überarbeitung führen abweichende Protokollwerte zwischen zwei Läufen. Warnungen sind ein Abbruch am Kostendeckel in Runde 2 und von Claude Code nicht gelieferte Kennzahlen.
- Nächster Schritt: Diesen Aufgaben- und Testplan prüfen und nur mit `Approval: TP` freigeben.
