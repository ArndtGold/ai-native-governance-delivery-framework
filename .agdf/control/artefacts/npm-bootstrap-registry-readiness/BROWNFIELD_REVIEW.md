# Brownfield Review: Reliable npm Bootstrap Readiness

## Review Meta

- mode: post_ur_review
- decision: pass
- mode_slice_decision: structured_slice
- required_next_gate: PRD
- owner: agent
- reviewed_scope: `npm-bootstrap-registry-readiness`

## Scope And Existing Owners

The requested behavior is owned by the existing package/release surfaces:

- `.github/workflows/publish-agdf.yml` owns coupled npm publication and exact-version readiness polling.
- `create-agdf/scripts/smoke-test.js` owns package-level release workflow and public help contract checks.
- `create-agdf/bin/create-agdf.js` owns the generated CLI help and the public bootstrap command strings.
- `create-agdf/README.md`, `agdf/README.md`, `INSTALL.md`, and `pages/src/pages/index.astro` expose public command examples.
- `create-agdf/scripts/sync-package-assets.js` propagates package-owned runtime/help assets.

No new package, installer, registry service, or user-facing command layer is needed.

## Current Coverage

| Area | Coverage | Evidence |
|---|---|---|
| Coupled package versions | fully_done | `create-agdf/package.json`; `agdf/package.json`; release tag validation |
| Publication ordering | fully_done | `publish-agdf.yml` publishes `create-agdf` before `@agdf/cli` |
| Exact-version npm readiness | fully_done | bounded `npm view <package>@<version>` polling for both packages |
| `latest` tag readiness | partially_done | package publication uses the default `latest` tag, but the workflow does not explicitly verify the tag after publication |
| Clean-client bootstrap | not_done | no isolated npm-cache smoke test executes the unchanged public command shape against the registry |
| Public command immutability | partially_done | help/smoke assertions exist, but no centralized cross-surface contract check covers all documented/generated examples |

## Reuse Strategy

- extend the existing release workflow with a single shared readiness/assertion path;
- extend the existing `create-agdf` smoke-test owner for command-shape and clean-client coverage;
- reuse existing package help generation and synchronization rather than introducing a second command registry;
- add only the smallest test fixture/helper required to run bootstrap checks in an isolated temporary directory.

## Impact Assessment

- Files/modules: release workflow, package smoke tests, generated help/docs synchronization, and selected public documentation examples.
- Interfaces: public command strings remain byte-for-byte compatible; no new flags or parameters are allowed.
- Data model/migrations: none.
- Backwards compatibility: preserved for `npx --yes @agdf/cli@latest codex`, `copilot`, `claude`, and the equivalent existing targets.
- Regression coverage: release sequencing, exact version, `latest` tag, clean npm client resolution, and command-shape assertions.
- Side effects: CI may perform real registry reads; no real user configuration may be modified by the smoke test.

## Risks And Gaps

- npm and CDN propagation remain external eventual-consistency behavior; CI can prove readiness at a bounded point in time but cannot control an already-stale user-local cache.
- `latest` is currently implicit in `npm publish`; explicit verification is needed to detect a tag mismatch before reporting success.
- The public command is repeated across generated and hand-authored surfaces; without a single test contract, future drift can reintroduce syntax changes.

## Parallel-Structure Check

Pass. The review found no justification for a new bootstrap wrapper or alternate user command. The primary owners remain the existing release workflow and `create-agdf` smoke-test surface.

## Context Graph Impact

- context_graph_impact: no_new_node
- rationale: this is release-operational hardening of the existing package-readiness invariant, not a new durable product or architecture invariant at review time.

## Required Next Step

Create a focused PRD for the structured slice, covering explicit `latest` verification, isolated clean-client bootstrap evidence, and cross-surface command immutability. Do not implement before PRD/SD/TP approval and Brownfield Analysis.
