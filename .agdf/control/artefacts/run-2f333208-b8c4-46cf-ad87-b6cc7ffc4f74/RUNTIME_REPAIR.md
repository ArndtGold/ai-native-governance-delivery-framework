# Initial UX authoring projection repair

Date: 2026-10-31
Boundary: User-requested prerequisite repair ("Fix it") for this Run. This evidence is not a gate artefact, approval, release or implementation authorization for the planned-UR feature.

## Defect and correction

After approved UR and UX-required Brownfield Review, dispatch selected ux-intent-definition but authoring-inputs returned the PRD template and artefact.record. Source-revision UX reassessment was already handled; the first UX prerequisite was missing from this projection.

The authoring projection now shares the existing PRD routing eligibility and contained definition-source facts with dispatch. Missing, malformed or ready-but-unrecorded UX selects UX_INTENT_DEFINITION and step.record. Recorded ready UX returns to PRD. Explicit non-ready decisions and unsafe sources retain existing boundaries. No gate policy or canonical Run approval changed.

Canonical changes: packages/core/lib/control-inspect/authoring-inputs.js and packages/core/lib/skill-dispatch/prd-definition.js. Regression coverage: packages/core/test/authoring-reassessment-test.js; opt-in UX-required fixture in packages/cli/scripts/fixtures/prd-definition.js. Generated bundles regenerated with prepare-local-plugin.js codex and the regular local installer; ignored build output is not a second source of truth.

## Evidence

- Regression first failed with actual owner PRD instead of UX Intent Definition.
- node packages/core/test/authoring-reassessment-test.js: passed, including initial missing/malformed/unrecorded UX, explicit non-ready decisions, contained-source boundary (symlink case on non-Windows), ready-to-PRD transition, existing source-revision reassessment and binding renewal.
- node packages/cli/scripts/prd-definition-test.js: passed packaged authoring, clarification, revision, binding, presentation and approval boundaries.
- git diff --check: passed.
- Supported immutable publisher and runtime_generation.replace admitted generation 2, publication e50d68ccd7a90661770a7586a1bdb73498a94ed101ee32666782f78354d8743b.
- Actual MCP authoring-inputs against this Run at revision 046244dc-aec0-4431-87d1-eba063057af8 returned authoring_owner UX Intent Definition, UX_INTENT_DEFINITION template and step.record. All three pages read; Run revision unchanged.
- npm --prefix packages/cli run install:codex -- --plugin-only --json: success. Installed 0.20.2+codex.local-283f707b4b49; codex plugin list reports installed/enabled. Installed launcher reports owned_version_matched and provenance matched. A fresh Node process using the installed Core returns the correct UX template and writer for this Run.

## Limits and next action

Full CI, full regression, fresh Codex model session and human acceptance were not executed. Installer reports pending_restart for complete plugin activation; this serving MCP connection already uses the corrected generation. Changes remain uncommitted in the dedicated worktree. Main checkout was not modified.

The existing product question on initial optional-extension delivery/host scope remains unanswered. Do not infer that choice, PRD approval or TP authorization from this repair. Continue the existing UX/PRD preparation once the material choice is resolved.
