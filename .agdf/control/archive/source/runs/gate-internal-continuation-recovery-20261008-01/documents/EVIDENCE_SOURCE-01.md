# Source and package checks

- assessed_at: 2026-10-08T18:30:08.764183+00:00
- candidate: 0.14.5+codex.local-0ad3b168da8e
- runtime_digest: 28272da8a656085b27358972926afa67051c2544328f0259dae3e667df65f278
- evidence_boundary: source/package/protocol; no new native model session observed

Use the Node executable in CANDIDATE-01.json. CHECKS-01.json records exit status and observation time; check-Cxxx.log files retain command output. C007 initially ran all existing cases, then reran the affected QA case after the last parser changes. Unaffected input/binding/catalog/next-action checks retain applicability: their inputs and owners did not change. C015 was rerun after shortening the selected skill reference to preserve its existing budget; later source-only Core/locale changes add no eager instruction surface. C012 uses the assembled CLI and exercises 51 synthetic source-revision cases.

| Check | Command (node prefix except C018) | Evidence |
|---|---|---|
| C001 | scripts/sync-package-assets.js | check-C001.log |
| C002 | packages/cli/scripts/prd-definition-test.js | check-C002.log |
| C003 | packages/cli/scripts/sd-definition-test.js | check-C003.log |
| C004 | packages/cli/scripts/skill-dispatch-function-contract-test.js | check-C004.log |
| C005 | packages/cli/scripts/skill-dispatch-binding-test.js | check-C005.log |
| C006 | packages/cli/scripts/skill-dispatch-test.js | check-C006.log |
| C007 | packages/cli/scripts/cli-gate-scenarios-test.js | check-C007.log |
| C008 | packages/core/test/interaction-presentation-test.js | check-C008.log |
| C009 | packages/cli/scripts/operational-localization-test.js | check-C009.log |
| C010 | packages/cli/scripts/interaction-catalog-test.js | check-C010.log |
| C011 | packages/cli/scripts/control-inspect-test.js | check-C011.log |
| C012 | packages/cli/scripts/late-source-revision-test.js | check-C012.log |
| C013 | packages/core/test/control-state-test.js | check-C013.log |
| C014 | packages/core/test/next-action-test.js | check-C014.log |
| C015 | packages/cli/scripts/instruction-footprint-test.js | check-C015.log |
| C016 | plugins/agdf/scripts/check-runtime-integrity.mjs | check-C016.log |
| C017 | packages/cli/scripts/package-contents-test.js | check-C017.log |
| C018 | git diff --check | check-C018.log |
| C019 | packages/core/test/control-read-provider-test.js | check-C019.log |

C019 verifies QA reports stay in the immutable captured control-read view while the normative quality contract is read through the existing trusted runtime-resource owner; unrelated data reads stay denied. No capture data-root widening is introduced.

Source facts are shared between PRD gate readiness and authoring dispatch. Ready bytes require canonical analytical registration; a ready registered PRD cannot skip this requirement. SD diagnoses preserve the already approved PRD boundary. Normalized review meanings/routes remain in quality.md; Core reads its declared table, while dispatch only selects an existing continuation from the evaluated private result. No public input/schema/phase/result variant or approval value changes. Tests retain strict presentation_language/--language and judgement-skill input rules.
