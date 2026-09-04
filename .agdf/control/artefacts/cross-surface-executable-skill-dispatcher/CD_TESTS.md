# CD+Tests: Cross-surface Executable Skill Dispatcher

Revision: 8
Status: done
Decision: revise
Date: 2026-09-04
Run: `cross-surface-executable-skill-dispatcher`
Based on: approved TP Revision 1 and Brownfield Analysis Revision 1 (`pass`)

## Delivered

- One schema-versioned `skill-dispatch --json` contract and orchestration service derive all ten
  skills from the canonical plugin definition.
- Target resolution is first and terminal. Deterministic `gate-check` returns only an existing
  canonical presentation; judgement skills receive a bounded immutable continuation packet.
- Invalid input, unresolved target, missing deterministic presentation, evaluator failure and
  oversized output fail closed. Every result is non-authorizing.
- Every result includes a bounded machine-readable `host_action`. Terminal presentation results
  carry their exact Markdown in `host_action.text`, require byte-for-byte transfer and stop, forbid surrounding prose and forbid run/evidence questions;
  non-terminal results bind continuation to the resolved target.
- Codex, Claude Code and Copilot SessionStart output and OpenCode system guidance expose exact local
  dispatcher bindings. Consent remains required only for automatic repository inspection.
- All ten skills are dispatcher-first and use the localized renderer presentation before recovery.
- Runtime generation, package inventory, integrity policy, documentation and Context Graph ownership
  were updated from existing owners without a daemon, second workflow engine or approval store.

## Focused Evidence

| Evidence | Result |
|---|---|
| `test:skill-dispatch` | pass; ten-entry registry, invalid-input matrix, terminal target, deterministic control, judgement continuation, output bound, presentation failure and timing |
| terminal `host_action` correction | pass; target, control, evaluator and oversized outcomes carry the expected transfer/stop action; continuation remains target-bound |
| direct repo-less generated runtime | `target_unresolved`, `terminal: true`, zero control time, 5.363 ms internal and 310.202 ms wrapper |
| direct repository generated runtime | `control_result`, `terminal: true`, `authorizes: false`, German QA-revise presentation, no missing approval, doctor pass and 146.665 ms internal |
| `test:runtime-integrity-layout` and `test:runtime-integrity-negative` | pass; generated/installed layout, binding, metadata and mutation failures |
| `test:interaction-presentation` | pass; locale parity and target/status/approval renderer contracts |
| `test:runtime-check-consent` and `test:opencode-hardening` | pass; safe binding without automatic repository inspection and exact OpenCode projection |
| `test:agent-skills-conformance` | pass across source and four generated surfaces |
| `test:skill-evals`; `eval:skills` | pass; 83/83 deterministic replay cases over ten skills, explicitly not live-host evidence |
| `release:prepare`, package build and contents | pass; 395 release-package files and 45-file public-plugin candidate |
| full `smoke-test` | pass through all release, lifecycle, control, package, interaction, integrity, eval, Delivery Path Search and routing suites |
| `git diff --check` | pass |

The full smoke test used `npm_config_cache=/tmp/agdf-csed-npm-cache` because the user's default npm cache
contains root-owned entries. No cache ownership was changed.

## Corrections Found During Review

1. The initial backlog row used the unsupported compact artefact label `Brownfield Analysis`. The
   link was removed from the compact backlog projection; the durable run state retains the artefact.
2. Deterministic dispatch initially allowed `control_result` with `presentation: null`. It now emits
   typed `evaluator_error` with renderer diagnostics.
3. Terminal skill wording now prioritizes localized presentation and only falls back to recovery
   when presentation is absent.
4. Missing German mappings for the three CD+Tests actions were added to the canonical locale owner.
5. Fresh Copilot evidence showed correct dispatch but model-owned rewriting after the terminal
   result. One central `host_action` plus the shared binding now forbids prose reconstruction,
   extra choices and run/evidence questions. This rule was not duplicated across skill bodies.
6. The corrected Copilot QA invocation became prompt, German, terminal and limited to one action,
   but its visible table header merged `Feld` and `Wert`. A preceding language-only turn also
   triggered unsolicited AGDF onboarding. The shared binding now states that its presence alone does
   not activate or announce AGDF and excludes ordinary conversation or language preference alone.
7. A byte-matched installed-host retest showed that the prose-only non-activation sentence lost to
   the earlier `AGDF active.` context. SessionStart now exposes neutral runtime availability, defers
   target requests until matching intent and carries machine-readable activation, pre-dispatch and
   terminal-output constraints in the binding object.
8. CSED-HOST-04 removed target/approval questions and pre-dispatch prose but still echoed runtime
   availability and merged the header. SessionStart now has no visible availability headline,
   ordinary chat must ignore AGDF context, runtime mention requires an AGDF request and exact
   terminal Markdown is co-located in `host_action.text`.
9. CSED-HOST-05 showed that OpenCode exposed the executable dispatcher in a repository without
   durable AGDF control. The existing OpenCode activation owner now withholds the binding while
   inactive and explicitly forbids an AGDF shell-permission request; active repositories retain the
   exact binding and `bash: ask` boundary. Focused hardening, asset synchronization, release
   preparation and Runtime Integrity pass after the correction.
10. CSED-HOST-06 showed the local OpenCode package update waiting in npm's network audit while all
    output was piped. The primary tarball install now uses `--ignore-scripts --no-audit --no-fund`,
    matching the SDK-alignment path. The smoke fixture requires these flags and the complete smoke
    test passes.
11. CSED-HOST-07 proved that an inactive global skill reconstructed a package runtime even after the
    plugin stopped publishing its binding. Generated global skills now require both the explicit
    active declaration and exact plugin-supplied binding, and forbid file search, path inference and
    shell permission otherwise. Release, OpenCode, smoke and integrity checks pass.

## Missing Evidence

- The German repo-less Copilot `qa-gate` flow is prompt and terminal. The newest silent-context and
  `host_action.text` correction has not yet been installed/retested; visible fidelity remains open.
- The OpenCode inactive-repository correction passes repository tests but needs a fresh loaded-host
  retest after the stronger global-skill correction. Actual execution remains to be tested only in
  an explicitly activated repo.
- The audit-free OpenCode installer passes the full smoke test; a clean user-host rerun is pending.
- Remaining loaded-host timing and behavior for Copilot, Codex, Claude Code and OpenCode remain open.
- Native Windows dispatcher invocation, install path and first-visible latency remain open.
- The TP-09 evidence matrix needs separate lifecycle authorization.

## Decision

`revise`: TP-01 through TP-08 and the repository-side Copilot and OpenCode corrections are
implemented with green deterministic, generated, package and regression evidence. QA readiness
remains open because the corrected bindings and the rest of TP-09 are not yet verified in loaded
hosts or native Windows.
