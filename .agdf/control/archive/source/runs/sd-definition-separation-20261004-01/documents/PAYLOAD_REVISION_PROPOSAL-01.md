# Controlled payload baseline revision proposal

Run: sd-definition-separation-20261004-01
Source revision: 4ea4f5d0-dbc3-4b73-9926-4bf98cf85f35
Date: 2026-10-05
Status: prepared change request; unapproved; not a replacement gate artifact
Author: Codex
Decision owner: Arndt Gold

## Requested outcome

Permit the reviewed, necessary Copilot distribution cost of the dedicated Solution Design
author without changing instruction/context, runtime-integrity or performance limits.
Retain the existing growth assertion and set its canonical observed-package baseline to
the exact final reviewed candidate with no unused headroom.

The user's “leg los” after the recommendation selects preparation of this revision.
It is not a new gate approval and does not supersede the existing UR/PRD/SD/TP approvals.

## Measured candidate and duplication review

Canonical baseline: plugins/agdf/meta/copilot-payload-baseline.json.
Reference inventory: packaged prior CLI consumer, 193 files / 1,581,171 bytes.
Current generated candidate: 198 files / 1,608,420 bytes.
Difference: 5 files / 27,249 bytes, approximately 1.72% of prior bytes.
See PAYLOAD_REVIEW-01.json for exact paths, per-file changes, inventories and digests.

| New distribution file | Bytes | Purpose |
|---|---:|---|
| skills/agdf-sd-definition/SKILL.md | 3,720 | Named host skill and activation/dispatch boundary |
| skills/contracts/sd-definition.md | 4,617 | Focused contract read by the host skill |
| runtime/create-agdf/generated/plugins/agdf/meta/contracts/sd-definition.md | 4,617 | Same source contract read by the version-bound runtime |
| runtime/create-agdf/runtime/core/lib/control-evaluation/sd-readiness.js | 2,561 | Pure declared-decision readiness evaluation |
| runtime/create-agdf/runtime/core/lib/skill-dispatch/sd-definition.js | 2,819 | Pure source/state-bound author assignment |

These five files account for 18,334 bytes; changes in existing files account for 8,915
additional bytes. The two contract projections follow the existing PRD distribution pattern:
one canonical source, two consumers. Removing one needs a distribution/runtime redesign,
not simply duplicate prose deletion. Semantic SD authoring was removed from the shared
procedural contract, shrinking each of its shipped copies by 223 bytes. Discovery and recovery
wording were already shortened to fit their unchanged independent ceilings.

No unnecessary additional file was identified in this scoped review. File consolidation
solely to keep the old count would obscure the separate assignment and readiness owners.
This conclusion does not establish live model quality or final QA readiness.

## Proposed requirement change

The earliest affected authority is UR, not only SD: UR Scope and Acceptance Signal 7 retain
existing payload limits, and PRD AC-008 repeats that constraint. A supported revision must
address that original requirement first and regenerate downstream decisions/evidence from
freshly approved sources. Old approvals must remain attributable to their original bytes.

Proposed UR replacement for the budget constraint:

> Keep existing instruction/context, runtime-integrity and performance limits. Permit only
> reviewed, evidenced Copilot distribution growth necessary for the dedicated SD author.
> Record the exact final observed package as the canonical growth baseline, without spare
> headroom, preserving the validator and all other guards.

This replaces only the requirement for an unchanged observed-package byte/file baseline;
design ownership, source protection, readiness, approvals and all other non-goals remain.

## Downstream propagation required after valid source revision

| Artifact | Affected provisions | Required propagation |
|---|---|---|
| UR | Scope, Acceptance Signal 7, payload risk | Distinguish reviewed distribution growth from retained independent limits |
| PRD | AC-008, constraints, catalog cost risk and related decision text | Require exact reviewed inventory, unchanged guards and no unused headroom |
| SD | SDD-001, SDD-007, Constraints And Compatibility, AC-008 mapping, SDQ-005 | Use existing generator and baseline owner; keep all other limits and assertions |
| TP | T-002, T-007/T-008, SCN-025, budget/evidence and failure-response text | Measure final candidate, verify the exact approved baseline and run full checks |

This table is a change-impact list, not a parallel criteria register or newly approved plan.

## Proposed baseline change, not applied

For the currently reviewed candidate only:

```json
{
  "schema_version": 1,
  "profile_id": "copilot-runtime-plugin",
  "max_files": 198,
  "max_bytes": 1608420,
  "rationale": "Exact reviewed dedicated SD authoring, decision-readiness and shared routing payload; see approved revision of sd-definition-separation-20261004-01; no spare headroom."
}
```

The rationale may claim an approved revision only after it actually exists. If candidate bytes
change during review, measure and review them again before applying a corresponding baseline;
these observations are not advance authorization for any larger package.

The production validator was invoked with budget enforcement enabled. It checks file/source
digests, mapping, excluded surfaces and the expected skill set before rejecting the measured
growth. This is useful diagnostic evidence, not a passed build. No assertion was bypassed.

## Canonical revision blocker

The current run is sealed, doctor passes, and its approved TP has reached CD+Tests.
The installed canonical run-revise operation rejected the bound attempt with:

> prd_revision_boundary_invalid: PRD revision is available only at SD before later artefacts
> are linked or approved.

Evidence: PAYLOAD_REVISION_ATTEMPT-01.json. The existing operation handles only PRD-to-SD
reopening, not a changed UR constraint after TP. Generic integrity recovery is inapplicable
to this valid sealed state; corrupting a seal or manually resetting approvals is not a revision
path. A second same-scope run cannot be used to evade the original requirement.

Therefore this proposal cannot currently be promoted into revised canonical gate artifacts
or a fresh approval presentation through the installed supported operations. A supported late
source revision mechanism is required before applying the proposed constraint and baseline.
Extending that governance mechanism is a separate scope and has not been implemented here.

## Validation and remaining work

Approved UR/PRD/SD/TP hashes and the six independent CI path hashes still match
IMPLEMENTATION_BASELINE.json. The baseline and validator remain unchanged. No CD+Tests,
CR, QA, UAT, installation, commit, push or release completion is claimed.

After a valid source revision and renewed downstream authorization: regenerate the final
candidate, verify its exact reviewed inventory, run full build/instruction/package/MCP and
applicable shared checks, complete code/architecture/task-plan reviews, then use the sole QA
decision route. Fresh native-host/model observations remain separately evidenced.
