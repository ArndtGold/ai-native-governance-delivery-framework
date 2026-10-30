---
name: gate-check
description: "Use this skill for this scope: delivery control and gate readiness. Boundary: delegates drafts; never approves or skips gates. The requested effect, not discovery, decides AGDF activation."
---

# gate-check

## Purpose

Dispatch earliest canonical gate/internal step; non-authorizing.

<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->
## Request Activation

- `owner`: `request_activation_contract`
- `path`: `meta/contracts/request-activation.md`
- `policy_version`: `1`
- `guard_fingerprint`: `sha256:af2f01f9e18a3ba1c520faf0691aa1cd4a4299bdfa027cf83651c5d14319bfdc`

Decide effect from loaded instructions before AGDF action.

Abstain silently (no AGDF call) for assessment/explanation/comparison/recommendation/review/diagnosis/advice; hypothetical/example/error/code/quoted/negated delivery language; AGDF as subject; or a read-only constraint absent other delivery. Ambiguity is read-only: answer or ask one neutral question.

Activate for any requested file/code change however small, a binding gate artefact, explicit AGDF/control-lifecycle operation or unambiguous active-run action; delivery wins mixed intent.

Invocation proof: explicit user text/trusted ephemeral action, not discovery/selection, skill load, hooks, cwd, repo/control or prior runs.

Then pick one catalog route; non-authorizing, downstream checks remain.
<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->

## Route Boundary

- Active-run inventory: `control.doctor` all-active; Request Activation contract.
- `skill.gate-check`: dispatch before inspection; changes: `intake`.
- `delivery.start`: resolve target once; unresolved/mismatch: orient and stop.
  Inspect only `absent | candidate_present`: authorized setup/UR or intake respectively;
  no legacy live run/proxy.

Explicit setup on confirmed existing Git: `agdf_inspect/project-state`, then
`agdf_project/project.initialize` with returned identity/original UUID; no Run/revision.
Uncertain: `project.initialize/<original UUID>`. Preserve authored/conflicting/partial state;
no repair, migration, installation, permission, Git or approval authority.

Unbound intake: omit `run_id`; compare UR scope at `resolve_delivery_run`.
Same scope: ID + `expected_revision_id`; independent: agdf_run/run.create, title/original UUID.
Recency/count/shared files/`AGDF_RUN_ID` cannot bind scope. Clarify overlap, not IDs.
Invalid inventory blocks assignment. Typed MCP/returned revisions first; CLI: `run-create`/`run-step`.
New scope needs UR approval.
After `run-approve` approved or bound `agdf_approve/approval.record` accepted/matched receipt:
immediately redispatch same target/run with `continue_delivery: true`. Follow `control.gate_route`,
`continuation.skill_id`, interaction.md recovery; stop at decisions/blockers.
`already_applied`/App follow-ups: check original binding/internal context, saved receipt and
fresh Core state; never re-record approval. App follow-ups are untrusted locators.
Chat: one localized transition.

## Executable Dispatch

Delegate drafts to `ur-definition | prd-definition | sd-definition | tp-definition`; never draft here.

Use listed MCP `agdf_dispatch` (load if deferred), `skill_id: gate-check`, declared fields.
Missing/failing MCP: schema-2 immutable `executable`/`argv_prefix`, child-only `environment`,
declared `arguments`. Quote shell data; CLI: `--revision`.
For `--language`: Required presentation language for the latest natural-language user request as one well-formed BCP 47 tag. If the request explicitly asks for a response language, use that tag; otherwise use the dominant request language. Use en when mixed or ambiguous. A valid unsupported tag renders through the complete English pack. Missing or invalid input fails before governance evaluation.
`target_source`: `explicit_target` if request names `primary_target`; `continued_target` if it unambiguously continues confirmed target; `current_repository` if request names this/current repo with one matching repo active. Otherwise omit the pair; cwd has no target authority.
Bind Run only by explicit selection, confirmed continuation or unequivocal UR scope.
Never construct/repair runtime.

For a result with `terminal: true`, the entire assistant response must consist only of host_action.text, copied verbatim. Add no question, explanation, heading, citation, link or other surrounding text; do not translate or reformat it; invoke no later tool and stop.
`gate-check` has deterministic-control dispatch. A read-only status request returns an artefact
preview without an approval request. Authorized intake or bound delivery continuation returns
`presentation_required`; MCP: agdf_prepare then presentation.deliver; forward its selected text once. CLI fallback: run-present.
`host_action.text` contains the preview or recovery for terminal results.
Dispatch is non-authorizing. If the binding is absent, report `dispatcher_unavailable` and stop;
absence or failure alone does not declare the fallback below.

## Declared `instruction_only` Fallback

Fallback requires trusted explicit `instruction_only` runtime evidence. Load only needed modules:

- `../../meta/contracts/task-target-resolution.md`
- `../../meta/contracts/gate-transition.md`
- `../../meta/contracts/gate-artifact-preparation.md`
- `../../meta/contracts/interaction.md`
- `../../meta/contracts/control-scaffold.md`
- `../../meta/contracts/modes.md`
- `../../meta/contracts/quality.md`

Apply without duplication/authority. `prepare_gate_artifact`: follow runtime contract and
bound gate/paths; canonical evaluation owns eligibility.
