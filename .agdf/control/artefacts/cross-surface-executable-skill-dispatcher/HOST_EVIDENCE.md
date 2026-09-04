# Loaded-host Evidence: Cross-surface Executable Skill Dispatcher

Revision: 4
Date: 2026-09-04
Status: partial

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

## Remaining Matrix

- Copilot: ordinary-language-preference isolation retest, repository-bound `gate-check`, repo-less
  `gate-check` and QA-ready `qa-gate` cases. Repo-less German `qa-gate` functionally passes but its
  visible table-header fidelity needs retest.
- Codex: all four loaded-host cases.
- Claude Code: all four loaded-host cases.
- OpenCode: all four loaded-host cases or an explicit `instruction_only` classification.
- Native Windows: command invocation plus independent package and installation-path evidence.

## Required Correction

Keep the executable dispatcher as the semantic source. Strengthen the shared host binding so a
terminal result requires exactly one operation: transmit `presentation.markdown` unchanged and
stop. The host must not ask for run or evidence selection before the primary target is resolved.
Retest locale with an explicit German user turn; do not infer a German-locale failure from a
slash-command-only fresh session. Do not duplicate these rules across the ten skill bodies.
