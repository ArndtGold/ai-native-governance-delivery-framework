# Code Review: Cross-surface Executable Skill Dispatcher

Revision: 8
Decision: pass
Date: 2026-09-04
Reviewed scope: dispatch contract/service, CLI and wrapper integration, generated host bindings,
canonical skills, locale registry, Runtime Integrity, package profile and tests.

## Findings

No open correctness, security, compatibility or maintainability finding remains in the reviewed
repository scope.

The review found and resolved these issues before the final decision:

1. The new backlog entry used an unsupported compact artefact label, which made focused doctor
   return `AGDF_BACKLOG_ARTEFACT_LABEL_UNKNOWN`. The unsupported projection was removed and focused
   gate-check now reports doctor `pass`.
2. `control_result` accepted a missing renderer presentation. The service now fails closed to
   `evaluator_error` with presentation diagnostics, matching the approved SD failure matrix.
3. Terminal skill wording allowed recovery to compete with the localized renderer. All ten skills
   now return the presentation verbatim when present and use recovery only when it is absent.
4. The canonical locale registry lacked three CD+Tests operational values used by gate policy.
   Complete English and German entries now preserve locale parity and fail-closed validation.
5. A fresh Copilot run obeyed dispatcher-first execution but reconstructed the terminal result.
   The service now emits one bounded `host_action`; shared SessionStart and OpenCode bindings require
   exact terminal transfer, stop and no added choices or run/evidence questions.
6. The German QA retest passed, while its preceding language-only turn exposed binding-driven AGDF
   over-activation. The central binding now excludes activation or announcement from its presence,
   ordinary conversation or a language preference alone. Focused projection and integrity tests pass.
7. A further byte-matched retest proved the prose-only exclusion insufficient because SessionStart
   still began with `AGDF active.`. The root claim is now neutral, target requests are intent-gated,
   and the binding object exposes exact activation, pre-dispatch and terminal-output policies.
8. CSED-HOST-04 proved those fields removed pre-dispatch prose and target questions, but not runtime
   mention or table rewriting. The remaining availability headline is removed, ordinary chat and
   runtime mention are separately machine-bound, and exact terminal Markdown is embedded in
   `host_action.text`; focused dispatcher, projection, integrity and release tests pass.
9. CSED-HOST-05 exposed the OpenCode dispatcher before durable repository activation. Inactive
   guidance now omits the executable binding and forbids an AGDF shell-permission request; active
   guidance still receives the exact binding. The focused OpenCode test covers both branches and
   release preparation plus Runtime Integrity pass.
10. The local package installation used `--silent` but still allowed npm audit traffic, leaving the
    user without progress while npm waited on the registry. It now disables audit, funding and
    package scripts. The end-to-end smoke fixture rejects a regression in these flags.
11. The inactive plugin guidance no longer exposed a binding, but the static global skill still
    allowed the model to reconstruct an installed-package runtime path. The generator now makes the
    dispatch section explicitly conditional on both active context signals and rejects search,
    inference or shell recovery. All ten generated global skills are asserted.

## Evidence

- `skill-dispatch-test.js` covers all ten registry entries, invalid classes, terminality, immutable
  continuation, timing, output bounds and missing presentation.
- Runtime Integrity rejects invalid dispatch metadata, damaged skill bindings and missing generated
  runtime components.
- OpenCode and SessionStart tests prove exact binding projection while preserving consent boundaries.
- `host_action` tests cover terminal presentation, recovery, continuation and oversized output.
- Full smoke, release preparation, package contents, interaction presentation and 83/83 skill evals
  pass after the corrections.
- `git diff --check` passes and the unrelated untracked image is not part of the reviewed change.

## Missing Evidence And Risks

- Prompt terminal behavior is loaded-host proven, but visible header fidelity is not. The newest
  Copilot and OpenCode activation corrections, remaining loaded-host behavior and native Windows
  invocation are unverified.
- `instruction_only` is an honest capability classification, not an executable fallback guarantee.
- required_next_step: collect separately authorized TP-09 host evidence, refresh review evidence and
  only then run `qa-gate`.
