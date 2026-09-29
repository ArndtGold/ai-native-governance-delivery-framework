# Architecture Impact example records

These are bounded evaluation examples, not live host observations or approvals.

## Relevant boundary and structural problem

- architecture_relevance: `relevant`
- architecture_impact: `high`
- architecture_reason: Moving a policy decision from the canonical runtime to a host adapter would create a second authority.
- architecture_evidence: `plugin/meta/contracts/quality.md` owns the normalized gap route; `plugin/skills/qa-gate/SKILL.md` consumes it.
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: SD owner keeps policy in the canonical contract and specifies adapter behavior there.

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: duplicate policy authority | `plugin/meta/contracts/quality.md`; host adapter proposal | `block` | SD owner: remove the parallel host decision before Mode/Slice selection. |

## Intentional, bounded trade-off

- architecture_relevance: `relevant`
- architecture_impact: `medium`
- architecture_reason: An existing CLI consumer needs a temporary compatibility adapter during its migration.
- architecture_evidence: `create-agdf/bin/create-agdf.js` exposes the CLI boundary; consumer migration plan is linked in the run's SD.
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: Arndt Gold coordinates the example consumer migration and removes the adapter by the review date.

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| trade-off: temporary CLI adapter | `create-agdf/bin/create-agdf.js`; linked SD migration plan | `warn` | Arndt Gold: retain only until the named consumer completes migration. |

### Retained Debt Detail

- finding: trade-off: temporary CLI adapter
- rationale: Preserve the existing consumer while the coordinated migration completes.
- accountable_owner: Arndt Gold (example owner).
- mitigation: Route both forms through the same canonical parser and monitor legacy usage.
- review_date_or_exit_condition: Review and remove by 2026-10-31 after the named consumer's migration is verified in QA.

An empty `accountable_owner` or `review_date_or_exit_condition` would leave this finding
unresolved; the reviewer must not call the debt accepted.

## Local change without architecture impact

- architecture_relevance: `architecture-not-applicable`
- architecture_impact: `none`
- architecture_reason: A wording-only change in `plugin/control/templates/artefacts/BROWNFIELD_REVIEW.md` stays with the existing template owner and changes no interface, state authority, runtime path or policy.
- architecture_evidence: The diff is confined to that template's explanatory prose; the existing owner and consumers are unchanged.
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: Template owner continues the existing Mode/Slice route.

No architecture finding or diagram is needed for this local case.
