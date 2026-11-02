# QA Report: Reliable npm Bootstrap Readiness

## QA Gate

- decision: revise
- scope: `npm-bootstrap-registry-readiness`
- derived_from: approved UR, PRD, SD and TP
- tp_review: `TP_REVIEW.md` — NBR-01 through NBR-08 locally fully covered
- brownfield_analysis: pass
- clean_implementation_review: pass
- code_review: pass

## Evidence

- `npm --prefix create-agdf run test:release-bootstrap` passed.
- `npm --prefix create-agdf run smoke-test` passed.
- `npm --prefix agdf run smoke-test` passed.
- `node plugin/scripts/check-runtime-integrity.mjs` passed.
- `npm pack --dry-run` passed from `create-agdf/` and `agdf/`.
- `git diff --check` passed.
- Public bootstrap command shape remains unchanged; no additional flags or parameters were added.
- The workflow now verifies exact package versions, `@agdf/cli@latest`, and runs the isolated clean-client smoke test after package readiness.

## Missing Evidence

The actual GitHub Actions publish workflow has not yet executed the new readiness step against a
real release and npm's external propagation path. Local tests cannot prove that the workflow's
published package, `latest` tag, and clean-client `npx` invocation converge after publication.

## Risks

- External npm/CDN propagation remains eventually consistent even with bounded workflow polling.
- The public command cannot control a stale npm cache already held by an arbitrary user's client;
  the approved solution addresses release-side readiness without adding user-facing parameters.

## Decision Rationale

The implementation and local evidence are sufficient for the code slice, Brownfield fit, and
solution integrity. QA cannot be marked `pass` until one real publish workflow captures the new
exact-version, `latest`, and clean-client bootstrap evidence.

## Required Next Step

Run the next real `agdf-v<version>` GitHub Actions publish workflow and retain its readiness and
clean-client smoke-test evidence. Then rerun the QA Gate. Do not claim release readiness from this
local run alone.

## Impact Codes

- `missing_live_release_evidence`
- `external_registry_propagation_unverified`
