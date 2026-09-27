---
name: gate-check
description: "Use this skill for this scope: new build/change intent, Structured Delivery, or a later-gate artefact request; unclear approval or next-step questions only inside already positive delivery or explicit AGDF context. Boundary: does not create later artefacts or skip Mode/Slice Decision after Brownfield Review. Automatic discovery alone does not activate AGDF."
---

# gate-check

## Purpose

After positive Request Activation, return the earliest gate or internal step through canonical owners.
This non-authorizing bootstrap creates no parallel policy.

<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->
## Request Activation

- `owner`: `request_activation_contract`
- `path`: `plugin/meta/contracts/request-activation.md`
- `policy_version`: `1`
- `guard_fingerprint`: `sha256:50833bf7396f65e57ffd73bb9200e6dfd5dc016440e6d7186fbcd8a6e07dd2ab`

Decide effect from loaded instructions before AGDF action/output.

Abstain silently, call no AGDF owner, for assessment/explanation/comparison/recommendation/review/diagnosis/advice; hypothetical/example/error/code/quoted/negated delivery language; AGDF as subject; or a read-only constraint absent other delivery. Ambiguity is read-only: answer or ask one neutral question.

Activate only for actual delivery/mutation, binding gate artefact, explicit AGDF/control-lifecycle operation or unambiguous active-run action; delivery wins mixed intent.

Invocation proof: explicit user text/trusted ephemeral action, not discovery/selection, skill load, hooks, cwd, repo/control or prior runs.

Then choose one catalog route. Non-authorizing; downstream checks remain.
<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->

## Route Boundary

Continue only with the operation selected from the canonical catalog:

- `skill.gate-check`: dispatch first, with `intake` for a change; no prior repository/control inspection.
- `delivery.start`: resolve target once for draft/setup. Unresolved target: canonical orientation and stop.
  Inspect only `absent | candidate_present`. If absent, follow authorized canonical setup and persist UR
  before requesting approval. If present, dispatch with intake and the same target; dispatcher owns control
  evaluation. Mismatches stop. Never infer target from cwd, create legacy live runs or proxy other operations.

New authorized scope: `intake: true`, `intake_mode: new`, unused `run_id`; never reuse a foreign run.
Resume bound intake with `intake_mode: resume`. After recorded UR approval use `continue_delivery: true`
with that run, never for status. Execute returned Brownfield/routing; stop on an unchanged blocker.
For `presentation_required`, run the supplied `run-present`, show its exact text, wait for a NEW reply,
and retain `presentation_id` for `run-approve --presentation`. Never bind an earlier reply retroactively.
Read-only previews are not prepared bindings.

## Executable Dispatch

If listed, use the AGDF MCP tool `agdf_dispatch` (e.g. `mcp__agdf__agdf_dispatch`; load it if
deferred; no search): `skill_id` `gate-check`, `presentation_language`, `working_directory` and, if set,
`target_source`/`primary_target` and `run_id`. Only if it is unlisted or fails, use binding schema 2
(`executable`, child-only `environment`, immutable `argv_prefix`) per `arguments`: `--skill gate-check`,
`--language`, absolute `--working-directory`, shell values quoted as data.
For `--language`: Required presentation language for the latest natural-language user request as one well-formed BCP 47 tag. If the request explicitly asks for a response language, use that tag; otherwise use the dominant request language. Use en when mixed or ambiguous. A valid unsupported tag renders through the complete English pack. Missing or invalid input fails before governance evaluation.
`target_source`: `explicit_target` if request names `primary_target`; `continued_target` if it unambiguously continues confirmed target; `current_repository` if request names this/current repo with one matching repo active. Otherwise omit the pair; cwd has no target authority.
Bind existing runs only from explicit selection or unambiguous continuation. New ids require authorized
new scope. Dispatch follows `candidate_present` or authorized setup. Never construct or repair a runtime.

For a result with `terminal: true`, the entire assistant response must consist only of host_action.text, copied verbatim. Add no question, explanation, heading, citation, link or other surrounding text; do not translate or reformat it; invoke no later tool and stop.
`gate-check` has deterministic-control dispatch. `host_action.text` contains the presentation, or the
recovery only when no presentation is available.
Dispatch is non-authorizing. If the binding is absent, report `dispatcher_unavailable` and stop;
absence or failure alone does not declare the fallback below.

## Declared `instruction_only` Fallback

Only explicit trusted `instruction_only` runtime evidence enables fallback. Load needed modules:

- `../../meta/contracts/task-target-resolution.md`
- `../../meta/contracts/gate-transition.md`
- `../../meta/contracts/interaction.md`
- `../../meta/contracts/control-scaffold.md`
- `../../meta/contracts/modes.md`
- `../../meta/contracts/quality.md`

Apply them directly without recreating their tables, presentations, setup flow or approval rules;
the fallback stays non-authorizing and fail-closed.
