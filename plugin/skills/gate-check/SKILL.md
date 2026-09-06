---
name: gate-check
description: "Use this skill for this scope: new build/change intent, Structured Delivery, or a later-gate artefact request; unclear approval or next-step questions only inside already positive delivery or explicit AGDF context. Boundary: does not create later artefacts or skip Mode/Slice Decision after Brownfield Review. Automatic discovery alone does not activate AGDF."
---

# gate-check

## Purpose

After positive Request Activation, return the earliest blocking AGDF gate or internal step for the
selected target and run through the existing non-authorizing owners. This compact bootstrap owns no
second target, control, gate, interaction, setup, approval, quality, or closeout policy.

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

Continue only with the operation already selected from the canonical catalog:

- `skill.gate-check` is a direct-skill route. Invoke dispatcher v1 as the first operational call;
  do not first resolve a target or inspect repository, control, run, gate, or presentation state.
- `delivery.start` is a delivery-intake route, not a direct-skill route. Resolve its target once
  for draft/setup authority. An unresolved target returns the canonical target orientation and
  stops. For a resolved target, inspect only `absent | candidate_present`, not control validity or a
  gate. On `absent`, follow the existing draft, explicit setup/link authority, and durable-UR path;
  do not request `Approval: UR` before its persisted revision is ready. On `candidate_present`,
  invoke dispatcher v1 with the same explicit target so it repeats target resolution and owns
  authoritative control evaluation. A mismatch or non-actionable candidate stops. Never infer the
  target from cwd, create a legacy live run, or proxy another operation as `delivery.start`. This
  pre-dispatch branch authorizes only draft/setup, never a gate transition or implementation.

No other catalog operation is handled by this skill.

## Executable Dispatch

Use only binding schema 2: `executable`, child-only `environment` and immutable `argv_prefix`.
Extend the prefix using its code-derived `arguments`, quoting shell values as data:
`--skill gate-check`, current `--language`, and absolute `--working-directory`.
`target_source`: `explicit_target` if request names `primary_target`; `continued_target` if it unambiguously continues confirmed target; `current_repository` if request names this/current repo with one matching repo active. Otherwise omit the pair; cwd has no target authority.
Add `--run` only for an explicit run. For `skill.gate-check` this is the first operational call. For `delivery.start` it
follows only `candidate_present` or completed authorized setup. Do not discover, install, or construct
another runtime or repair a failed environment. Old/invalid binding stops as `dispatcher_unavailable`.

`gate-check` has deterministic-control dispatch. On `terminal: true`, execute the returned
`host_action`: transmit `host_action.text` verbatim and stop. It contains the presentation, or the
recovery only when no presentation is available; allow no surrounding or post-terminal gate prose.
Dispatch is non-authorizing. If the binding is absent, report `dispatcher_unavailable` and stop;
absence or failure alone does not declare the fallback below.

## Declared `instruction_only` Fallback

Only trusted runtime evidence explicitly declaring this invocation `instruction_only` enables the
fallback. Load only the needed packaged focused runtime-contract modules:

- `../../meta/contracts/task-target-resolution.md`
- `../../meta/contracts/gate-transition.md`
- `../../meta/contracts/interaction.md`
- `../../meta/contracts/control-scaffold.md`
- `../../meta/contracts/modes.md`
- `../../meta/contracts/quality.md`

Apply those canonical modules directly. Do not recreate their tables, presentations, setup flow,
or approval rules in this skill. The fallback remains non-authorizing and fail-closed.
