# Loaded-host Evidence: Cross-surface Executable Skill Dispatcher

Revision: 13
Date: 2026-09-05
Status: partial


## Repository Semantic-contract Follow-up CSED-HOST-12

- source: user review of the target-source function arguments on 2026-09-05.
- observed gap: the binding grammar named the three enum values, but their distinct evidence and
  authority meanings were not stated precisely at the model function boundary.
- repository correction: `skill-dispatch/contract.js` now owns one `agdf_dispatch` function
  definition with purpose, authority, terminal behavior and closed input schema. CLI/binding grammar
  and all ten skill descriptions use projections from that owner.
- repository evidence: semantic contract test, 40 adapter cases, source and installed Runtime
  Integrity, four generated skill surfaces, unchanged instruction limits, 91-file/696479-byte
  Copilot payload, 437-file package and 83/83 deterministic replays.
- evidence boundary: no installed profile changed and no fresh Codex, Claude Code, Copilot or
  OpenCode model invocation observed these descriptions.
- required_next_step: include semantic target-source selection in the separately authorized fresh
  host matrix under CSED-QA-01.


## Repository Failure-classification Follow-up CSED-HOST-11

- source: repository analysis requested after CSED-HOST-10 on 2026-09-05.
- observed repository defect: direct target-check treated an invalid supplied target source as if no
  reliable target had been supplied. The dispatcher also collapsed target evaluation, target
  presentation, gate evaluation and gate presentation failures into one English recovery.
- repository correction: target-check now emits `target_source_invalid` with a canonical typed
  `input_error`; its German orientation exposes the allowed values. Dispatcher runtime stages emit
  separate stable diagnostic codes and use reviewed German/English recovery entries. Output overflow
  uses the same locale path. Raw downstream exception messages are suppressed.
- repository evidence: exact German target-check and skill-dispatch replays, injected failure tests,
  40 adapter cases, 437-file package validation, Runtime Integrity, 83/83 reviewed deterministic
  replays and source smoke pass.
- evidence boundary: no installed profile was changed and no fresh Codex, Claude Code, Copilot or
  OpenCode session was observed. This is repository and generated-runtime evidence only.
- required_next_step: include invalid target source and each reachable terminal failure class in the
  separately authorized refreshed-host matrix under CSED-QA-01.


## Codex Target-source Contract Case CSED-HOST-10

- source: current Codex task and user-requested `agdf:gate-check` retry on 2026-09-05.
- loaded contract: AGDF 0.14.5 exposed `--target-source <source>` in the schema-2 dispatcher
  binding while the validator accepted only `explicit_target`, `continued_target` and
  `current_repository`.
- observed model action: Codex supplied `--target-source user` for an explicitly named repository.
- observed runtime result: `invalid_input`, terminal and non-authorizing. The diagnostic identified
  `target_source`, but `host_action.text` contained only the general English sentence
  `Correct the named dispatch input field and retry once.`
- root cause: the host-facing grammar omitted the canonical enum and the invalid-input recovery
  discarded allowed-value metadata before presentation. The word `user` was not a supported
  semantic authority class and must not become an alias.
- repository correction: the target resolver now exports the canonical values; contract,
  CLI/binding grammar and diagnostics derive from them; the existing locale owner renders
  actionable English/German recovery without echoing the raw invalid value.
- correction evidence: exact source replay exits 2 with the three machine-readable allowed values
  and the German terminal recovery. Forty adapter cases and the serial repository regression pass.
- evidence boundary: this records the old loaded invocation and the corrected repository replay.
  It does not prove a refreshed installation or fresh-task model behavior.
- required_next_step: include this case in the separately authorized coherent installation and
  fresh Codex retest under CSED-QA-01.


## Codex Fresh-task Case CSED-HOST-09

- source: user transcript and read-only inspection of task `Run AGDF QA gate`,
  `01a07112-556e-7383-88dd-81ab23a8ebfe`; rollout dated 2026-09-05 12:17:02.
- loaded runtime at that time: `0.14.5+codex.local-3f17b01eff82`, runtime digest
  `12176590c987ba400bced93d6debf0af5094e0ba3c426a039dc63946db459986`, provenance matched.
- actual supplied SessionStart binding: schema 2, executable Node 22.22.3,
  argv prefix ending in `--surface claude` inside Codex. This is producer evidence, not a
  model-invented surface argument.
- first QA/gate invocations supplied working-directory but no target evidence; terminal
  `target_unresolved` therefore followed the target contract. The skill invocation alone
  did not select a repository.
- after user explicitly named the AGDF repository, both target fields were supplied correctly.
  The command exited 2 with `evaluator_error` and `next_step_unlocalized`.
- root cause: several active runs require `runSelectionRecovery("gate-check")`; that exact
  English recovery was absent from the locale registry. This is independent of wrong host identity.
- host identity cause: Codex documents native PLUGIN_ROOT and compatibility CLAUDE_PLUGIN_ROOT
  together. Source generation chose the compatibility alias first. Official source:
  [Codex hooks](https://learn.chatgpt.com/docs/hooks).
- fidelity: tool Markdown and the stored assistant final both contain `| Feld | Wert |`; only
  the user-supplied rendered/copied transcript merges the header. The exact downstream rendering
  or copying cause was not inspected. The assistant also added prose after terminal output.
  Neither behavior is fixed or verified by adding locale values; retain it under CSED-QA-01.
- timing: recorded shell calls took 687 ms, 664 ms and 906 ms. Full turns took substantially
  longer. These are distinct measurements; do not attribute full-turn duration to the dispatcher.
- installation boundary: current on-disk `0.14.5` resolves to a different runtime digest
  `c5065a1f27cad7399b0a4bf8f6c580b54a012e6b174c11705cdcfa9b629ea423` and legacy agent-native skill text.
  The failure task's loaded local-development profile and current installed root are distinct
  snapshots. No claim of current installed/source coherence is made.
- correction evidence: generated SessionStart native-env cases now identify Codex correctly;
  German ambiguous-run replay returns control_result without diagnostics; explicit selection of
  this run returns QA / revise. Files: `/private/tmp/agdf-codex-followup-replay.json` and
  `/private/tmp/agdf-codex-followup-selected.json`. These are repository replays, not installed-host proof.
- required_next_step: coherent installation and a fresh Codex retest, retaining unresolved
  visible-output, latency and other host/OS evidence cells.

## Evidence Boundary

This record separates user-attested Copilot UI behavior from a direct local replay of the installed
runtime. It does not infer Codex, Claude Code, OpenCode or native-Windows conformance.

## Copilot Fresh-session Case CSED-HOST-01

| Field | Evidence |
|---|---|
| Surface | GitHub Copilot |
| Session | fresh repo-less session |
| Invocation | `/agdf-qa-gate` |
| Model | GPT-5.6 Sol, as reported by the user |
| Installed runtime | `/Users/arndtgold/.copilot/installed-plugins/agdf/agdf/runtime/agdf-local.js` |
| Runtime version | `0.14.5`, verified by direct local `--version --json` invocation |
| First operational action | direct `skill-dispatch --json`; no preceding contract, file or entrypoint search |
| Tool-start latency | about 10 seconds, user-attested from the Copilot transcript |
| First-visible latency | about 13 seconds, user-attested from the Copilot transcript |
| Dispatcher outcome | `target_unresolved`; terminal and non-authorizing |
| Post-terminal repository activity | none visible |
| Requested language | `en` |
| Host response | English reconstructed prose followed by four target/evidence choices |
| Classification | partial |

## Installed-runtime Replay

The exact command visible in the Copilot transcript was replayed against the installed profile with
the same working directory. The result reported:

- `outcome: target_unresolved`
- `terminal: true`
- `authorizes: false`
- `machine_validation: owned_version_matched`
- `expected_version: 0.14.5`
- `reason_code: no_reliable_target`
- `presentation_language: en`
- `presentation.markdown` with one next action: `Name one primary target.`
- dispatcher `timing.total_ms: 6.013`
- outer wrapper duration: `1578.764 ms`
- no diagnostics

This replay proves the installed dispatcher result, not the Copilot UI timing or model behavior.

## Copilot Fresh-session Retest CSED-HOST-02

The user installed the corrected profile, opened a new repo-less Copilot session, first wrote
`Bitte antworte auf Deutsch.` and then invoked `/agdf-qa-gate`.

| Field | Evidence |
|---|---|
| Surface and model | GitHub Copilot with GPT-5.6 Sol, user-attested |
| Runtime version | installed `0.14.5`, verified locally |
| Runtime identity | `owned_version_matched`; provenance `matched` |
| Tool-start latency | about 9 seconds, user-attested |
| First-visible latency | about 11 seconds, user-attested |
| Requested and rendered language | `de` |
| Dispatcher outcome | `target_unresolved`; terminal and non-authorizing |
| Terminal transfer | no surrounding explanation, but the visible header is rendered as `FeldWert` with an empty second header instead of separate `Feld` and `Wert` cells |
| Recovery | exactly one action: `Ein primäres Ziel benennen.` |
| Post-terminal activity | none visible |
| QA invocation classification | functional pass; visible presentation fidelity partial |

The local replay of the installed command returned the same German renderer object plus
`host_action.mode: transmit_presentation_verbatim_and_stop`, `allow_surrounding_text: false`,
`may_request_run_or_evidence: false`, 5.167 ms dispatcher time and 354.685 ms wrapper time.

Before the slash-command invocation, Copilot responded to the language preference itself with an
unsolicited AGDF readiness announcement and asked for task, repository and approval information.
Those claims were not produced by `skill-dispatch`; they are a separate SessionStart/model-binding
over-activation. A language preference alone is ordinary conversation and must not activate or
announce AGDF. The shared binding now states this boundary explicitly; a fresh loaded-host retest of
that additional correction is still required.

## Copilot Non-activation Retest CSED-HOST-03

The next fresh session loaded an installed `agdf-session-check.js` whose digest was byte-identical
to the then-current generated file and contained the first non-activation sentence. The retest still
failed:

- `Antworte auf Deutsch` triggered an AGDF readiness announcement plus task, repository, workflow
  and approval-oriented questions.
- `/agdf-qa-gate` emitted explanatory prose before invoking the dispatcher.
- The dispatcher again returned the correct German terminal packet, but the visible table header
  merged `Feld` and `Wert`.

Direct inspection exposed a contradictory SessionStart context: it began with `AGDF active.` while
later saying that binding presence did not activate AGDF. The correction now removes that active
claim, emits the neutral state `AGDF runtime available. No AGDF task or workflow is active`, forbids
target requests until matching intent and adds machine-readable binding fields:

- `activation_trigger: invoked_skill_or_matching_delivery_intent`
- `pre_dispatch_output: none`
- `terminal_output: referenced_text_verbatim_only`

Focused SessionStart, OpenCode, Runtime Integrity and release preparation tests pass. This newest
correction is not yet installed-host evidence.

## Copilot Silent-context Retest CSED-HOST-04

The next fresh session again used a byte-matched installation, now including the neutral runtime
state and machine-readable activation/output fields. Results:

- ordinary German language preference no longer triggered task, repository, run, evidence or
  approval questions;
- Copilot still mentioned AGDF runtime availability and advertised AGDF skills without being asked;
- `/agdf-qa-gate` invoked the dispatcher without any pre-dispatch prose;
- the terminal result remained prompt, German and one-action;
- the visible header still merged `Feld` and `Wert`.

This is a partial improvement. The next repository correction removes the visible runtime-status
headline entirely, adds `ordinary_conversation: ignore_agdf_context` and
`runtime_mention: only_when_user_requests_agdf`, and places the exact terminal Markdown directly in
`host_action.text`. The binding now requires byte-for-byte output of that field. Repository tests
pass; installed-host behavior is pending.

## Conformance Assessment

| Criterion | Result | Reason |
|---|---|---|
| Dispatcher is the first operational action | pass | Copilot invoked the installed runtime directly without discovery. |
| First visible AGDF result within 15 seconds | pass with user-attested evidence | The transcript shows about 10 seconds to invocation and about 13 seconds to the visible response. |
| Correct terminal target outcome | pass | Repo-less QA stopped at `target_unresolved` without a QA decision. |
| No post-terminal repository evaluation | pass | No repository or run inspection followed the terminal outcome. |
| Presentation transmitted unchanged | revise | Copilot replaced the canonical table with newly written prose. |
| One-action recovery | revise | Copilot expanded one primary-target action into four choices. |
| Target and run boundaries | revise | A run identifier, PR, issue or project session was offered as if each could resolve the primary target. |
| German conversation locale | not verifiable in this case | The fresh session contains only `/agdf-qa-gate`, so it provides no German user-language signal. English is therefore not evidence of a locale defect; a separate German-turn case is required. |
| Corrected German repo-less QA case | partial | CSED-HOST-02 is prompt, German, terminal and limited to one action, but the visible table header merges `Feld` and `Wert`; the local dispatcher output keeps them separate. |
| Ordinary-language-preference isolation | revise | Before the skill invocation, Copilot unnecessarily announced AGDF and requested task, repository and approval information. The repository binding correction is not yet host-verified. |
| CSED-HOST-03 non-activation retest | revise | The first prose-only binding fix was loaded but contradicted by `AGDF active.`; Copilot also emitted pre-dispatch prose and again merged the visible table header. |
| CSED-HOST-04 silent-context retest | partial | Target/approval questions and pre-dispatch prose are gone, but unsolicited AGDF mention and merged table header remain. |

## OpenCode Desktop Pre-execution CSED-HOST-05

The user restarted OpenCode after installing AGDF 0.14.5 and supplied a screenshot of a German
ordinary-conversation turn followed by the native global QA skill.

| Field | Evidence |
|---|---|
| Ordinary conversation isolation | pass; `Antworte auf Deutsch` received a normal German acknowledgement without AGDF activation or runtime mention |
| Skill surface | `agdf-global-qa-gate` loaded through OpenCode's native skill UI |
| Visible skill body | OpenCode displays the loaded skill instructions in host chrome; this is not the dispatcher result or AGDF chat presentation |
| Repository activation guard | visible and correctly states that global installation alone is not repository activation |
| Dispatcher command | requested with `--surface opencode`, `--skill qa-gate`, `--language de` and a quoted working directory containing spaces |
| Repository state | working directory is inside Git root `/Volumes/Media Drive/Arndt Gold/Workspace/ai-agents`; no `.agdf/control/config.json` exists at the working directory or Git root |
| Permission state | `permission.bash: ask` correctly prompts if execution is attempted, but the Repository Activation Guard should have stopped before requesting this command in an inactive repository |
| Executable | OpenCode Desktop exposes its `OpenCode Helper` through `process.execPath`, followed by the installed `agdf-local.js` script |
| Dispatcher outcome | not available; execution is waiting for user permission |
| Classification | revise; safe permission boundary held, but inactive-repository early return was not obeyed |

The permission prompt is an OpenCode security boundary, not AGDF gate approval. This evidence does
not justify changing global `bash` permission. Because durable repository activation is absent, the
correct action for this case is to deny execution. The model should have returned the documented
`opencode-repo` recovery without requesting a shell command. Desktop-helper executable conformance
must be tested separately in an explicitly activated repository.

The repository correction removes the dispatcher binding from inactive OpenCode guidance and adds
an explicit no-shell-request instruction. Active guidance still contains the exact executable
binding. Focused hardening, asset synchronization, release preparation and Runtime Integrity pass;
this correction is not yet loaded-host evidence.

## OpenCode Local Installation CSED-HOST-06

The next local installation printed `Setting up AGDF 0.14.5 for OpenCode...` and then remained
silent for several minutes. Process and npm-log inspection established the exact wait:

- `install-local-plugin.js opencode` was waiting for `npm install <local-create-agdf-tarball>`;
- npm had already retired the installed package and entered `silly audit bulk request`;
- the npm process held an established HTTPS connection while installer output was hidden by
  `--silent` and `stdio: pipe`;
- no further npm log progress or AGDF prompt existed.

The primary OpenCode package-install invocation now uses `--ignore-scripts --no-audit --no-fund`,
matching the already hardened SDK-alignment install. The smoke fixture requires all three flags.
The complete smoke test passes. The observed process later ended; read-only `opencode-status`
reports version 0.14.5, matching host/SDK 1.18.3 and a complete global native surface. A clean rerun
with the corrected installer remains the completion evidence.

## OpenCode Inactive-skill Retest CSED-HOST-07

After the inactive plugin-guidance correction was installed, the user invoked the global QA skill
again in the same repository without durable AGDF control. OpenCode still requested permission for:

`node <config>/node_modules/create-agdf/generated/plugins/agdf/runtime/agdf-local.js skill-dispatch ...`

This differs from the plugin-supplied config-local binding and proves that the model reconstructed a
runtime path from the globally installed package after reading the skill's generic Executable
Dispatch section. Removing the binding from inactive system guidance alone was therefore
insufficient.

The global-skill generator now makes executable dispatch conditional on both an explicit active
repository declaration and an exact binding supplied by the OpenCode plugin system context. It
forbids file inspection, installed-package search, runtime-path inference and shell permission when
either signal is absent. Release preparation, OpenCode hardening, the end-to-end smoke test and
Runtime Integrity pass. A fresh installed-host retest remains required.

## Remaining Matrix

### OpenCode Desktop QA Invocation CSED-HOST-08

- Source: user report, confirmed by read-only inspection of OpenCode's local session/tool records
  and the installed plugin source on 2026-09-05. No hidden reasoning or unrelated conversation was
  copied into this evidence.
- Session: `ses_065c386d3ffezDDe5der6gzWhX`; workspace was the separate `iself.eu` repository, not this
  framework. It remains evidence only and is not a mutation target of this correction.
- Installed runtime: `0.14.5`; successful wrapper reported `owned_version_matched` and matched
  config-local package provenance. This is not a full loaded-host conformance claim.
- Binding executable: OpenCode application's Electron Helper; wrapper:
  `/Users/arndtgold/.config/opencode/agdf/bin/agdf-local.js`.
- First call: helper plus wrapper, `skill-dispatch --json --surface opencode --skill qa-gate
  --language de --cwd ...`; failed with `FATAL ... Unable to find helper app`.
- Second call: agent added `ELECTRON_RUN_AS_NODE=1`; CLI then rejected `Unknown argument: --cwd`.
- Third call: agent inspected `skill-dispatch --help` before constructing another invocation.
- Final call: same environment override with `--working-directory`; neither `--target-source` nor
  `--primary-target` was supplied. Dispatcher returned `target_unresolved`, `terminal: true`,
  `authorizes: false`, empty primary/governance target and no control snapshot.
- Result: no QA evaluation or QA pass took place. The final unresolved outcome is correct for the
  actual inputs. Electron startup and argument reconstruction violate first-action conformance.
- Cross-host evidence: source inspection confirms both OpenCode and generated session bindings use
  `process.execPath`; no equivalent crash in Codex, Claude Code or Copilot was observed here.
- Routing: CSED-BA-08 is an open `design_gap` to SD2 in the existing dispatcher run. Do not patch
  installed caches, broaden permissions, treat cwd as target, or introduce a second hook.

### Read-only Runtime Check CSED-RUNTIME-01, 2026-09-05

Evidence class: real local process on macOS, not a fresh OpenCode session or user acceptance.
The installed executable was used read-only; no host installation, restart or config edit occurred.

- Executable: `/Applications/OpenCode.app/Contents/Frameworks/OpenCode Helper.app/Contents/MacOS/OpenCode Helper`.
- Observed runtime metadata: Node `24.15.0`, Electron `42.3.3`.
- Exact child override: `ELECTRON_RUN_AS_NODE=1`. The parent environment remained unchanged.
- The shared fixed capability probe passed with the exact expected stdout and exit 0, in
  400.403 ms in one observation. Probe limits remain 1000 ms and 4096 bytes per output stream.
- macOS emitted `task_name_for_pid: (os/kern) failure (5)` on stderr while the fixed probe
  succeeded. Bounded stderr alone is not failure; a signal, nonzero exit, spawn error, timeout,
  overflow or unexpected stdout still fails. The fatal unmodified launch was not repeated.
- The same executable then ran the generated `agdf-local.js` wrapper and its validator child with
  `skill-dispatch --json --surface opencode --skill qa-gate --language de --working-directory
  /private/tmp`, without target fields. Exit 2, `target_unresolved`, `terminal: true`, runtime
  `owned_version_matched`, and no control evaluation were observed.
- Reported timings: `wrapper_ms=453.093`, `total_ms=3.300`, `control_ms=0`. The wrapper value
  includes resolution and child execution. This was not QA and is not a Node/Electron speed
  comparison or a measurement of model-visible latency.
- This proves the corrected child launch and wrapper chain on the observed executable. It does
  not prove that OpenCode has loaded the new package or that any model obeys the new binding.

### Remaining Cases

- Copilot: ordinary-language-preference isolation retest, repository-bound `gate-check`, repo-less
  `gate-check` and QA-ready `qa-gate` cases. Repo-less German `qa-gate` functionally passes but its
  visible table-header fidelity needs retest.
- Codex: all four loaded-host cases.
- Claude Code: all four loaded-host cases.
- OpenCode: CSED-HOST-05 proves ordinary-chat isolation and the permission boundary, and exposed an
  inactive-repository guard violation now corrected in the repository. Retest the inactive early
  return first; test execution only after explicit `opencode-repo` activation in the intended repo.
  CSED-HOST-06 explains the apparent installer hang and its repository correction; clean rerun evidence
  is pending. CSED-HOST-07 proves that inactive global-skill dispatch also required a skill-generation
  correction; its fresh retest is pending.
- Native Windows: command invocation plus independent package and installation-path evidence.

## Required Correction

SD2 and TP2 are approved. The shared transport correction and 40 adapter-to-dispatch repository
cases are implemented; CSED-RUNTIME-01 proves the real Electron process chain only. Complete
separately authorized installation/restart and fresh host evidence. Preserve the
inactive early return, `bash: ask`, exact binding, terminal `host_action.text` and unresolved-target
boundary. The earlier inactive-profile retest and remaining matrix are still required.
