# UR: Staged Proportionality Baseline v3

Status: `approved`
Gate: UR
Gate approval: exact `Approval: UR` on 2026-08-19 after revalidation of run, gate, Revision 1 and durable artefact
Revision: 1
Date: 2026-08-19
Owner: user
Run: `agdf-staged-proportionality-baseline-v3`

## 1. Problem

The technically valid staged-v2 r3 series cannot support a new proportionality decision because
four benchmark-owned gaps remain:

- `PB-008` conflates a blocked control state with the still-permitted target-clarification action;
- `PB-010` does not distinguish a non-normative clarification from a semantic user-facing change;
- `PB-011` describes read-only visual verification while expecting a delivery path;
- the `PB-016`, `PB-017` and `PB-020` evidence packs do not expose all five canonical Verified
  Change eligibility facts.

The accepted Structured Depth boundary also postdates the current benchmark baseline. Reusing or
regrading the historical r3 series would mix old evidence with new semantics and could turn the
benchmark into a second routing authority.

## 2. Goal

Create a separately versioned, neutral Benchmark v3 baseline and observation protocol that measures
the currently permissible stage and eventual delivery path against complete canonical facts. The
result must preserve historical evidence, remain subordinate to existing Mode/Gate owners and make
ambiguity or missing evidence fail closed instead of tuning cases toward a preferred score.

## 3. Scope

### SPB3-1 — Historical integrity

Preserve all staged-v2/r3 baseline, fixture, observation and report artefacts byte-for-byte. Version
the v3 baseline, corpus, fixtures, adapter inputs, observations and reports as new evidence.

### SPB3-2 — Stage/action separation

Represent `PB-008` with distinct facts for current control state, currently permitted clarification
and eventual mutation path. A waiting or blocked state must not erase a permitted read-only action.

### SPB3-3 — Unambiguous task semantics

Version `PB-010` and `PB-011` so each case unambiguously states whether it is a non-normative/read-only
action or a user-facing mutation. Expected behavior must follow that neutral task definition rather
than a desired historical path.

### SPB3-4 — Complete Verified Change facts

Provide all five canonical eligibility facts for `PB-016`, `PB-017` and `PB-020`: one canonical
owner and bounded paths, prohibited-impact absence, deterministic propagation and validation, clean
baseline evidence, and an explicit structured escalation target.

### SPB3-5 — Structured Depth policy adoption

For structured cases including `PB-022`, `PB-028` and `PB-029`, provide complete versioned Depth
facts and apply only the accepted `Structured Depth Decision` in `plugin/meta/contracts/modes.md`.
Do not encode a hidden expected reason code in agent-visible input.

### SPB3-6 — Coverage and safety invariants

Retain the 40-case real-task baseline, all six delivery paths, adversarial coverage, zero tolerated
critical under-governance and the existing small-path over-governance ceiling unless a later approved
PRD explicitly changes a measurement contract with evidence.

### SPB3-7 — Evidence separation

Keep blind live observations, deterministic grading/replay and repository assertions as distinct
evidence classes. A new live series must use a separately approved, bounded and authenticated
execution plan and must not mutate the repository under test.

### SPB3-8 — Canonical ownership

Extend the existing proportionality benchmark pipeline and current Mode, Gate, Verified Change and
Structured Depth owners. Do not create benchmark-local routing, approval or policy semantics.

## 4. Non-Goals

- regrading, overwriting or optimizing the staged-v2 r3 series;
- changing Mode, Gate, approval, Brownfield, QA or Structured Depth policy;
- weakening thresholds to make the benchmark pass;
- prompt or fixture tuning toward a predetermined model score;
- implementing a Unified Journey or changing Interaction ownership;
- executing a live series, changing runtime code or generating later-gate artefacts before their
  separate approvals;
- commit, push, pull request, release, deployment or reinstall.

## 5. Acceptance Signals

- `SPB3-A01`: v3 uses new explicit versions and historical v2/r3 hashes remain unchanged.
- `SPB3-A02`: `PB-008`, `PB-010` and `PB-011` have unambiguous stage, action and mutation facts.
- `SPB3-A03`: each targeted Verified Change case exposes all five eligibility facts and a fail-closed
  escalation target.
- `SPB3-A04`: each structured case has complete versioned Depth facts and references the sole Modes
  owner without duplicating its trigger matrix.
- `SPB3-A05`: the corpus still covers exactly 40 cases, six paths and the approved adversarial and
  safety thresholds.
- `SPB3-A06`: expected facts are unavailable to the live agent while deterministic grading retains
  source fingerprints and provenance.
- `SPB3-A07`: missing, conflicting, stale or invalid evidence remains visibly `ambiguous` or blocked;
  it is never counted as correct.
- `SPB3-A08`: no v2/r3 artefact, canonical product contract or unrelated run changes.
- `SPB3-A09`: Brownfield Review identifies the existing pipeline owners and selects the smallest safe
  delivery depth before PRD.

## 6. Existing Source Of Truth

- Parent finding and ordering: `agdf-product-maturity-roadmap/STAGED_PRODUCT_FINDINGS_ASSESSMENT.md`.
- Historical baseline and scope: Parent `PROPORTIONALITY_BENCHMARK_BASELINE.json` and
  `PROPORTIONALITY_BENCHMARK_SCOPE.md`.
- Historical staged evidence: `agdf-staged-proportionality-observation` artefacts and OR.
- Structured depth policy: `plugin/meta/contracts/modes.md` and
  `agdf-structured-delivery-depth-boundary/OR.md`.
- Gate legality: `plugin/meta/contracts/gate-transition.md`.
- Verified Change eligibility: the existing Modes/Verified Change runtime owners.
- Existing benchmark implementation: `evals/proportionality/**` and
  `create-agdf/lib/proportionality-benchmark/**`.

## 7. Risks And Unknowns

- Neutral wording may still leak expected behavior through fixture structure; PRD/SD must define a
  blind-input boundary and a leakage test.
- Completing evidence packs may reveal that some historical expected paths should be versioned rather
  than retained; changes require explicit traceability to canonical owners.
- A model or host change may affect comparability; the execution plan must pin version, model,
  surface, authentication, retry and budget evidence without claiming cross-host universality.
- Benchmark v3 may still fail its thresholds. That is a valid product observation, not permission to
  weaken the policy or tune the corpus.
- The exact implementation and live-series budget remain later-gate decisions.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
