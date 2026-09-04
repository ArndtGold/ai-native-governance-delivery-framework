# Brownfield Review: Windows-portable Release-Bump Symlink Fixture

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `verified_change`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/windows-release-bump-symlink-fixture/BROWNFIELD_REVIEW.md`

## Scope

Correct only the unconditional negative-test symlink creation in
`create-agdf/scripts/release-bump-test.js`. Production release recovery, installer behavior and
other runs remain unchanged.

- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: Test-fixture portability changes without a user-facing capability or state.
- ux_intent_definition_required: `no`

## Existing-system Evidence

| Existing owner | Coverage | Evidence | Reuse strategy |
|---|---|---|---|
| `release-bump-test.js` recovery safety suite | partially_done | Unconditional `symlinkSync` at line 224 fails before its assertion on Windows without privilege. | extend |
| `public-plugin-test.js` Windows symlink guard | fully_done | `symlinkCreationAvailable()` skips only the impossible negative fixture on `EPERM` and rethrows all other errors. | reuse pattern |
| `version-bump.js` production recovery validation | fully_done | Existing recovery rejects invalid or symlinked transaction paths; no source change required. | preserve |

## Impact

- Files/modules: one test script.
- Interfaces and persisted data: none.
- Production runtime and installer semantics: none.
- Backward compatibility: unchanged.
- Regression evidence: direct release-bump test, full `release:prepare`, then native-Windows
  `install:copilot` rerun.
- Parallel-structure risk: low; reuse the existing one-file capability-probe pattern.
- SoT or product drift: none.
- Context Graph impact: `not_applicable` unless implementation exposes a broader invariant.

## Verified Change Eligibility

- canonical_owner: `create-agdf/scripts/release-bump-test.js`
- candidate_path_clean_at_baseline: `pass`
- baseline_commit: `2d3df45aa34cb67684f54b29b10062125ecb797e`
- baseline_candidate_digest: `a50283076c8925fc10445437dd863e74cc7709eb`
- prohibited_impacts_absent: `pass`
- propagation: `not_applicable`
- deterministic_validation: `node create-agdf/scripts/release-bump-test.js`; `npm --prefix create-agdf run release:prepare`
- escalation_target: `structured_slice`

The existing dirty paths belong to this run's control artefacts and one explicitly excluded image.
The candidate source path is clean.

## Transparency

PRD, SD and TP are skipped because the approved defect has one existing owner, no product semantics,
no architecture or policy effect, a clean baseline and deterministic validation. Native Windows
evidence remains mandatory before the host-specific claim can close.

## Missing Evidence

- Post-change native-Windows `release:prepare` and `install:copilot` result.

## Required Next Step

Execute the bounded Verified Change only in the declared test path.
