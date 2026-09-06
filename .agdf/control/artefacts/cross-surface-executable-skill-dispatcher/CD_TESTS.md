# CD+Tests: Cross-surface Executable Skill Dispatcher

Revision: 13
Status: done
Decision: revise
Date: 2026-09-05
Run: `cross-surface-executable-skill-dispatcher`
Based on: approved SD2, TP2 and Brownfield Analysis Revision 5 (`pass`).
Baseline: `4d38db394d05bf2afb5280dc3af92dfee042a2bb`. Earlier CD revisions are historical Git evidence.


## Semantic Dispatch Function Owner, 2026-09-05

Bounded scope: approved TP-05/11/13/15/16 and the current QA revision path.

- `create-agdf/lib/skill-dispatch/contract.js` now owns the `agdf_dispatch` semantic function
  definition. It states purpose, non-authorizing behavior, terminal transfer, continuation use and
  a closed JSON input schema.
- The input schema describes every model-supplied value. `target_source` has three separately
  described choices derived from `TASK_TARGET_SOURCES`; `target_source` and `primary_target` are a
  required pair, while `working_directory` is execution context without target authority.
- CLI and binding grammar are rendered by this owner. The command registry re-exports the argument
  grammar for compatibility instead of reconstructing it.
- All ten executable skill sections carry the same compact semantic projection. Runtime Integrity
  loads the canonical owner and rejects a missing, duplicated or byte-different projection in
  source and installed layouts.
- The dedicated function-contract test verifies definition shape, parameter meanings, paired
  fields, surface list, CLI projection and all ten skill projections. The dispatcher suite passes
  this test plus 40 adapter cases.
- Final affected checks pass: CLI modularization, instruction footprint, Agent Skills conformance,
  public-plugin inventory, package build, 437-file package contents, source and installed Runtime
  Integrity, and 83/83 deterministic skill replays.
- No footprint ceiling changed. The Copilot profile remains at 91 files and 696479/696486 bytes;
  normalized SessionStart remains 1810/1811/1812 of 1900 bytes for Codex/Claude/Copilot.
- All ten replay fingerprints changed because all ten canonical skills changed. Review confirmed
  that cases, stored observations, required and forbidden actions, and 100 percent thresholds are
  unchanged; only the fingerprints were refreshed.
- Evidence boundary: generated and fixture behavior is proven. No profile was installed and no
  fresh host task demonstrated model selection of the corrected values.


## Typed Target And Dispatcher Failure Correction, 2026-09-05

Bounded scope: approved TP-01/02/03/06/08/14/15/16 and Brownfield Analysis Revision 5.

- `normalizeTaskTargetSource` is now the shared target-source validator used by direct target
  resolution and dispatcher input normalization. The context-only form remains valid.
- An invalid `target-check --target-source` no longer becomes `no_reliable_target`. It returns
  `target_source_invalid` plus `input_error.field=target_source` and the three code-owned
  `allowed_values`. The German task-target orientation shows the actual cause and allowed values
  without echoing the rejected value.
- Dispatcher failures are classified as target evaluation, target presentation, control
  evaluation, control presentation or internal failure. Each code selects one reviewed German or
  English recovery from the existing locale registry. Raw downstream exception text is not copied
  into terminal output or diagnostics.
- The output-size failure retains `dispatch_output_too_large` and now receives its localized action
  from the CLI handler. A missing or invalid locale registry uses the existing bounded
  registry-repair fallback and remains terminal and non-authorizing.
- Focused target, dispatcher, binding, interaction, CLI and local-validator tests pass. The binding
  suite retains 40/40 generated or source-composed adapter cases. The exact invalid target-check
  replay exits 2 with `target_source_invalid`; the equivalent skill-dispatch replay exits 2 with
  `invalid_input` and the same canonical allowed values.
- Current broader evidence passes: 437-file package contents, byte-identical package builds,
  Runtime Integrity layout and negative suites, Agent Skills conformance, control state, parent
  reconciliation, Verified Change, source smoke and routing.
- Changing the shared target contract invalidated the deterministic replay fingerprints. Review
  confirmed that the change is additive for existing target-boundary cases and does not alter their
  expected or observed actions. Only the ten manifest fingerprints were refreshed; observations,
  thresholds, cases and provenance remain unchanged. The replay suite passes 83/83 and is not live
  host evidence.
- The first package-content attempt was blocked by sandbox access to the existing npm cache. The
  same test passed after approved cache access. No assertion or npm ownership was changed.
- `git diff --check` and syntax checks pass. No installed profile, host setting, permission, hook,
  approval, commit, push or release state was changed. `CSED-QA-01` remains open.
- Final focused doctor reports pass with zero findings. Focused gate-check reports QA,
  `qa_revise_required`, no missing approval and `record evidence` as the next allowed action.


## Target-source Contract Recovery Correction, 2026-09-05

Bounded scope: approved TP-01/02/03/06/11/14/15/16 and Brownfield Analysis Revision 5.

- `task-target-resolution.js` now exports the three canonical target-source values once.
  Dispatcher validation and CLI/binding grammar consume that owner instead of separate literals.
- The binding grammar now exposes
  `<explicit_target|continued_target|current_repository>` rather than the ambiguous `<source>`.
- Invalid dispatcher input retains its field and allowed values. Recovery is rendered by the
  existing interaction locale owner. The invalid user-supplied alias `user` is not accepted or
  echoed into visible output.
- The exact failing call now exits 2 with `invalid_input` and the German terminal host action:
  `Ungültiger Wert für target_source. Erlaubt: explicit_target, continued_target,
  current_repository. Korrigieren und einmal erneut versuchen.` Diagnostics carry the same three
  machine-readable `allowed_values`.
- Focused dispatcher, binding, locale, target and CLI tests pass. The binding suite covers all four
  profile fixtures and reports 40/40 adapter cases.
- The complete smoke sequence was exercised. Its first aggregate attempt stopped only when the
  sandbox denied the existing npm cache. After approved cache access, the package-content and local
  installation tests passed. A concurrent generated-tree test attempt produced macOS File Provider
  conflict copies; the ignored tree was preserved under `/private/tmp`, regenerated, and all
  remaining test stages passed serially without weakening assertions.
- Final evidence includes package contents with 437 files, lifecycle, Copilot retention, control
  state, parent reconciliation, interaction, verified-change, Runtime Integrity positive/negative,
  83/83 skill replays, proportionality, Delivery Path Search, OpenCode hardening, source smoke and
  routing. Source and generated Runtime Integrity both pass for ten skills and 16 control files.
- `git diff --check` passes. Current generated submission state contains one canonical `agdf`
  candidate. No installed profile, host setting, permission, hook, gate approval or release state
  was changed.
- `CSED-CODEX-11` is resolved at repository scope. `CSED-QA-01` remains open because this source
  correction has not been installed and observed in a fresh host task.


## Codex Follow-up Correction, 2026-09-05

Bounded scope: approved TP-04/06/14/15/16, Brownfield Analysis Revision 5.

- Added reviewed English/German locale entries for the exact `runSelectionRecovery` text,
  including the doctor/delivery-map all-active variant. Renderer validation remains strict.
- Generated SessionStart keeps explicit AGDF_SURFACE first, then Copilot's specific marker,
  then native PLUGIN_ROOT ahead of the Claude compatibility alias. No hook manifest changed.
- Tests now exercise native-shaped environments without forcing AGDF_SURFACE, and ambiguous
  German control with German dispatcher output across the four existing surface fixtures.
- Focused interaction presentation, runtime-check consent and all 40 binding/dispatcher cases
  pass. Unknown untranslated recovery still fails closed.
- Source-generated replay of the user's explicit-target invocation returns `control_result`,
  no diagnostics, and the German run-selection recovery. Explicit selection of this run returns
  QA / qa_revise_required. Neither replay grants approval or chooses an ambiguous run.
- Aggregate verification: full smoke pass in the isolated source snapshot (exit 0), including
  83/83 deterministic skill cases, package/build checks, Runtime Integrity negatives and routing.
  All 1088 tracked non-control source files were byte-compared with the live checkout and match. The shared checkout stopped
  first on unmapped generated Copilot duplicates (`plugin 2.json`, `runtime 2/`), then on another
  payload inventory mismatch after canonical regeneration. Compared duplicate files were byte
  identical to their canonical counterparts. Their origin is not established and no source
  assertion was weakened. The regenerated package initially passed, then duplicates reappeared.
- Isolated snapshot: `/private/tmp/agdf-codex-followup-verification-q_rw941t`, local clone plus exact
  current tracked working files, excluding the volatile generated tree. Logs:
  `/private/tmp/agdf-codex-followup-smoke.log`,
  `/private/tmp/agdf-codex-followup-smoke-resumed.log`,
  `/private/tmp/agdf-codex-followup-isolated-smoke.log`.
- Source Runtime Integrity and final git diff --check pass. All-active doctor retains the previous 0 block / 1 revise /
  55 warnings; its sole revise belongs to cross-surface-plugin-opt-out, which was not modified.
- Installed-cache mutation and corrected fresh-host retest were not run.
- `CSED-CODEX-09` and `CSED-CODEX-10` are resolved at repository scope. `CSED-QA-01` remains open.

## Implemented Correction

- One 112-line transport owner, `create-agdf/lib/skill-dispatch/binding.js`, replaces both binding
  literals. Binding schema is 2. Dispatcher input, output and direct CLI remain protocol 1.
- The exact executable is verified by a fixed local probe with 1000 ms timeout, 4096-byte output
  limits, no shell and no repository/control/network callback. Success is reused only by the same
  module/session and exact executable metadata. File replacement invalidates it.
- Node receives an empty override map. Electron receives only child-local
  `ELECTRON_RUN_AS_NODE=1`, preserved by `local-validator.js` into the validator child.
  Parent env is not changed. Inherited NODE_OPTIONS or NODE_PATH disables the capability probe
  before spawn, because either can introduce module-loading behavior. No inherited values are
  published in the binding.
- Successful fixed stdout and exit 0 prove capability even if Electron emits bounded OS diagnostics
  on stderr. Signal, nonzero exit, malformed output, overflow and timeout still fail closed.
- `command-registry.js` supplies the argument grammar. No --cwd alias, second flag list, target
  heuristic, new hook, native tool, runtime search, approval mechanism or permission widening exists.
- SessionStart for Codex/Claude/Copilot and the existing active-only OpenCode transform consume this
  owner. Missing or failed capability emits one non-authorizing unavailable context, no binding.
- All ten canonical skills require schema 2, child environment and exact argument transport.
  They retain judgement, target precedence and terminal host_action transfer. Global profiles
  remain generated. The activation kernel, eager bootstrap and instruction budgets are unchanged.
- Composed-profile, footprint, integrity, consent, lifecycle and OpenCode fixture consumers were
  refreshed. Source OpenCode fixtures explicitly identify a source validator. That test dependency
  is not a runtime search path used by installed hosts.
- The grammar-driven argv serializer is test-only. Actual models/hosts still own semantic argument
  values, shell quoting and literal terminal transfer. Tests are not technical enforcement of models.

## Verification

| Check | Result and boundary |
|---|---|
| `skill-dispatch-test.js` | pass, ten skills, target-first terminality, zero forbidden callbacks, protocol 1, exact terminal text and bounded judgement continuation |
| `skill-dispatch-binding-test.js` | pass, schema skew, environment allowlist, probe failure/cache invalidation, real Node, metacharacter argv, POSIX shell and 40 adapter cases |
| 40 adapter cases | two reference skills x four surfaces x context-only / missing-control / UR / synthetic QA input / ambiguous run. Three generated SessionStart profiles and source-composed OpenCode. Each process retains the 2000 ms timeout |
| Synthetic QA input | transports the named run and QA snapshot into a judgement continuation. Fixture approvals/artifacts are not delivery evidence and do not create a QA pass |
| POSIX/Windows boundary | real POSIX shell and structured argv round trips pass for spaces, Unicode, quotes, apostrophes, dollar signs, backticks and metacharacters. Windows drive/backslash values and PowerShell quoting are string fixtures only |
| `runtime-check-consent-test.js` | pass separately, consent off/on and silent base context retain their boundary |
| `opencode-hardening-test.js`, `local-validator-test.js`, `lifecycle-test.js` | pass, active/inactive context, exact profile paths and runtime/version/provenance behavior |
| `instruction-footprint-test.js` | pass, unchanged budgets and kernel, two regenerations byte/digest-stable |
| package build and contents | pass, byte-identical complete builds, 408 package files, 46 public candidate files, runtime-free public profile |
| Release preparation | pass, 33 surfaces at 0.14.5, eight exact history snapshots, 13-file transactional release/rollback fixtures |
| Runtime Integrity | pass, ten skills and 16 control files, source mode |
| Skill Creator quick validation | pass for all ten canonical skills |
| Full aggregate regression | pass, final complete smoke command exited 0, including all 40 binding cases, 83/83 offline replays, negative integrity, lifecycle, package and routing suites |
| `git diff --check` | pass before final evidence update |
| Final focused control validation | doctor pass with 0 findings, QA revise with no approval requested; localized status presentation uses existing operational values |

Aggregate command:
`npm_config_cache=/private/tmp/agdf-csed-tp2-npm-cache npm --prefix create-agdf run smoke-test`.
This isolates npm cache ownership. Fixture installations do not change the user's installed hosts.

## Compatibility And Rollback

A disposable archive of the baseline under `/private/tmp/agdf-tp2-rollback.OQZi59` was regenerated
with its own prior consumers. v1 producer/v1 consumer and v2 producer/v2 consumer passed.
Both mixed combinations rejected. The restored v1 wrapper still returned target_unresolved with
dispatcher protocol 1. No worktree reset, installed-profile mutation or control-state rollback occurred.
The initial archive omitted LICENSE/NOTICE; adding those exact baseline dependencies fixed fixture setup.

## Instruction And Payload Measurements

| Measure | Baseline | Correction |
|---|---:|---:|
| Ten canonical skill bodies, bytes | 70804 | 73050 |
| Canonical activation kernel, bytes | 1092 | 1092 |
| Copilot payload files | 85 | 86 |
| Copilot payload bytes | 671019 | 679898 |
| Copilot byte ceiling | 696486 | 696486 |

The skill bodies grow by 2246 bytes to state the new transport boundary. This is not an instruction
saving. Current normalized SessionStart is 1765/1766/1767 bytes for Codex/Claude/Copilot (budget 1900).
OpenCode active dynamic context is 610 bytes (budget 1000), inactive is 0, global eager instructions
are 1577, and composed global context is 2188 (budget 5000). Exact current measurement is generated
by the footprint suite. The sole file-ceiling adjustment, 85 to 86, accounts for the shared module.

## Red Tests And Corrections During This Revision

- Initial focused red test failed because binding.js did not yet exist.
- Exact-key and static-entry assertions still expected v1. They now verify v2 without weakening
  authority, terminal tokens, source-to-generated parity or budget checks.
- Source-only OpenCode fixtures previously advertised a nonexistent installed-layout validator.
  The new preflight correctly rejected it. Fixtures now supply their explicit source entrypoint.
  This also fixed the lifecycle failure found by the second aggregate run.
- The first Copilot regeneration exceeded the 85-file ceiling by precisely the new shared module.
  Reviewed file ceiling is 86; the byte ceiling and instruction budgets were not raised.
- The real Electron probe exposed harmless OS stderr. Capability now uses exact stdout plus process
  outcome, retaining output bounds. Arbitrary bootstrap module configuration is rejected before spawn.
- Temporary E2E fixtures needed real Git roots and canonical macOS paths. An ambiguous-run snapshot
  uses the existing unknown sentinel, not an empty-string assumption. Product resolution was unchanged.
- One standalone E2E run timed out at 2000 ms while aggregate tests were also running. The timeout
  stayed unchanged. The later standalone and aggregate binding suites both passed all 40 cases.
- A convenience parser for the footprint console output initially included its trailing success line.
  Only that ad hoc parser failed; the underlying footprint test had passed.
- The negative installed-layout fixture still expected a binding after removing agdf-local.js.
  It now asserts unavailable, no binding and the unchanged passive activation kernel. Malformed or
  mismatched wrapper contents remain subject to the existing dispatch-time version/provenance owner.
- All 83 offline observations initially failed EVAL_OBSERVATION_STALE. Source review proved that
  each of the ten skill files is byte-identical to baseline outside its Executable Dispatch section,
  and no case-specific relevant source, case rule, threshold or stored observation changed. The
  83 required/forbidden action sets were reviewed against that unchanged judgement/control scope
  and the new target/transport integration tests. Only the ten source_fingerprints in evals/manifest.json
  were refreshed as a reviewed compatibility baseline. This is deterministic golden replay, not
  a recording of new model execution, live-host evidence or proof of instruction adherence.
- Final run-state presentation initially rejected custom next-step/quality prose as unlocalized.
  Its two renderer-bound scalar fields now use existing canonical operational values. The exact
  lifecycle-authorization requirement remains explicit in the run state, QA and OR. No locale,
  presentation or gate owner was changed to accept arbitrary prose.

## Missing Evidence And Delivery Boundary

CSED-RUNTIME-01 proves the actual Electron launch and generated wrapper chain on macOS.
It does not prove a fresh installed OpenCode model session. Native Windows and Linux process
execution, corrected installation/restart, all four loaded-host reference matrices, first-visible
latency and weaker-model adherence remain open. QA must remain revise. No install, restart, release,
commit, push or external-model evaluation was performed.
