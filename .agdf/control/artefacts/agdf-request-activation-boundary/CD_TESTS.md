# CD+Tests: AGDF Request Activation Boundary

Status: done with evidence gaps
Date: 2026-09-05
Run: `agdf-request-activation-boundary`
Based on: approved TP Revision 3

## Delivered Outcome

AGDF now decides applicability through one compact semantic Request Activation Kernel before any
target, repository, control or dispatcher work. Ordinary assessment, explanation, comparison,
recommendation, review, diagnosis and advice abstain silently. Actual delivery, binding gate
artefacts, named AGDF or control-lifecycle operations and unambiguous active-run actions continue to
their existing owners. Mixed intent gives delivery precedence. Ambiguity remains read-only.

The change does not add a second hook or classifier. It reduces eager instruction instead:

- one 1,092-byte canonical kernel;
- compact discovery metadata for ten skills;
- one kernel plus one version-bound binding for SessionStart surfaces;
- an OpenCode micro-bootstrap, compact active facts, zero inactive output and kernel-only compaction;
- a 4,669-byte canonical `gate-check` selected-skill bootstrap whose normal dispatcher path is
  terminal and whose detailed fallback requires explicit `instruction_only` runtime evidence.

Dispatcher v1, hook inventories, OpenCode permission policy, status, lifecycle, interaction and
control-evaluation semantics remain unchanged. Final review found and CD+Tests corrected one
canonical-init retry defect: only strictly validated `runs/<run_id>/RUN_STATE.md` state is now
retained, included in drift snapshots and preserved byte-for-byte across exact-match retry/repair.

## Task Implementation

| Task | Result | Main evidence |
|---|---|---|
| `RAB-TP-17` | implemented | `request-activation.md`, definition-owned `instructionFootprint`, one kernel fingerprint and unchanged operation catalog |
| `RAB-TP-18` | implemented | deterministic projector, ten compact skill projections, compact `gate-check`, explicit focused-contract fallback |
| `RAB-TP-19` | implemented | SessionStart generator, shell compatibility helper, OpenCode plugin/installer and package generator use the two-stage model without new hooks |
| `RAB-TP-20` | partially implemented | shared footprint helper, Runtime Integrity integration, negative fixtures, composed-profile loader, closed schema and independent profile/evaluator identities pass deterministically; four required external model-backed executions are unavailable |
| `RAB-TP-21` | implemented | README, German and English quickstarts/workflows, existing Context Graph node and this audit describe the two-stage model and evidence boundaries |
| `RAB-TP-15` | not implemented | no exact Revision 3 install/readback/restart observations for the four hosts |
| `RAB-TP-16` | implemented | Revision 3 TP, clean, code and QA reviews use this final diff and evidence |

## Deterministic Evidence

| Evidence | Result |
|---|---|
| Request Activation projection write/check | pass; final check `changed=0` |
| Activation corpus, projection, callback order and host schema | pass; 33 German and English cases |
| Footprint contract | pass; all eleven normalized budgets and raw-byte reporting |
| Runtime consent, OpenCode hardening, lifecycle and dispatcher | pass |
| Task target, interaction and missing-control | pass |
| Canonical-init regression suite | pass; valid-run retry, repair, link-window drift, invalid ID/content, extra/empty/mismatched state, Ownership-only bypass, Symlink and Hardlink cases included |
| Public `init -> run-create -> init` reproduction | pass; final init exits 0 with `outcome: unchanged` and `changes: []` |
| Source Runtime Integrity, layout and adversarial negative fixtures | pass |
| Agent Skills conformance | pass across source and four generated surfaces |
| Skill evals | pass; 83/83 deterministic cases across ten skills |
| Proportionality and Delivery Path Search suites | pass |
| OpenCode collision, micro-bootstrap and fail-closed skill guards | pass |
| Full `create-agdf` aggregate smoke and routing render | pass |
| Worktree whitespace check | pass |
| Dispatcher v1 diff against HEAD | empty |
| Protected hook inventory files diff against HEAD | empty |

The skill-eval corpus initially reported 83 stale source identities after the intentional router and
skill rewrite. Current fingerprints were calculated from the unchanged cases and new behavior
owners. Only `EVAL_OBSERVATION_STALE` was present. Updating those ten identities restored 83/83
without changing expected results.

Two old smoke assertions also required removed natural-language system prose. They were replaced by
structural checks for the collision-safe `agdf-global-*` names, one activation micro-bootstrap,
eleven exact kernel projections and ten fail-closed repository/dispatch guards. This aligns the test
with the approved instruction-reduction design instead of preserving redundant wording.

## Build And Package Evidence

| Evidence | Result |
|---|---|
| Repeated package sync | pass; stable and no canonical source edit |
| Package build | pass; generated profiles byte-identical across complete builds |
| Package contents | pass; 405 inventoried files and complete release-built plugin |
| Public plugin candidate | pass; 46 files; digest `f0f08a9af5dbc6e3ec8f05332447705da2ba8be945bd6ba14be3b314e3c21c54` |
| Copilot profile | pass; inventory, drift, exclusions and growth fail closed |
| Release bootstrap | pass; published CLI bootstrap plus release-built local marketplace |
| Generated tree | stable digest `b1261620b26c4b6a40d39ef3d5a64df775181db7fc4f8df1e4883f53691eee6c` |

Overlapping package-test processes had left nine stale or colliding generated candidate directories.
They were inspected and moved intact to
`/private/tmp/agdf-public-candidate-collision-backup-20260905T0005`. One remaining duplicate was
checksum-verified against that backup before removal from the generated root. Only the canonical
candidate remains, the collision did not recur in the isolated full smoke run, and no canonical
source or unrelated user data was deleted.

## Composed-Profile Evidence

The deterministic composed-profile suite passes for Codex, Claude Code, Copilot and OpenCode source
profiles. It composes the real eager bootstrap or SessionStart output, all discovery descriptions,
the selected skill and, for OpenCode, the active dynamic context. Test metadata and expected output
are not model-visible. Reports keep `profile_surface`, `evaluator_surface`,
`evidence_plane: source_composed` and `loaded_profile: false` separate.

The four external model-backed commands did not produce observations. Sandboxed Codex evaluation
could not write its local state database. An unsandboxed retry was rejected because it would send
the complete project instruction profile to an external service without separate authorization.
The boundary was not bypassed and no report was persisted. This is missing supporting behavioral
evidence, not a deterministic test failure and not loaded-host evidence.

## Missing Host Evidence

`HOST_OBSERVATION_MATRIX.json` remains `unavailable` for Codex, Claude Code, GitHub Copilot and
OpenCode. No exact Revision 3 profile was installed, read back and observed in a fresh session.
Direct versus automatic selection is therefore unproven on loaded hosts. OpenCode has no real
same-version/digest evidence that system transform is reapplied and the current binding remains
available after compaction.

## Decision

Request-activation implementation, deterministic integrity, generated profiles and package
evidence: `pass` within their stated evidence planes.

Task-plan completeness and overall QA readiness: `revise`. `RAB-CR-01` is resolved and independently
re-reviewed as `pass`. The four-host evidence in `RAB-TP-15` and the four external source-composed
behavioral runs remain required evidence obligations. No QA pass, UAT, release, commit, push or PR
claim is made.
