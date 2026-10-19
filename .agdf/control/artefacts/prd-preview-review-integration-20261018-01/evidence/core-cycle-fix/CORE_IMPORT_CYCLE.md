# Core import cycle correction

The user explicitly requested correction of the existing Core cycle and fresh checks on 2026-10-19. This continues `prd-preview-review-integration-20261018-01` under its approved TP. It changes internal dependency ownership, not product/gate/receipt semantics.

## Cause and correction

The previous 26-module strongly connected component mixed structural document parsing, material identity, seal computation, prepared-state policy, immutable presentation validation and higher-level orchestration. In particular:

- Run parsing imported receipt readers that imported the projection owner which read those same receipts.
- Seal validation imported revision-history verification; archived verification imported the combined seal owner to compute original seals.
- Gate policy imported prepared Run state; preparation imported QA acceptance and QA report inspection, which imported gate policy and state predicates.
- Archived binding proof imported the live presentation owner to validate immutable envelope structure; live presentation imported writer/render/history orchestration.

Five lower-level owners now hold the existing implementations:

| Owner | Responsibility | Compatibility |
|---|---|---|
| `control-state/run-state-document.js` | Structural fields, tables, paths and control-document parsing | Old parser reexports the same functions; validated Run parsing still checks all receipt histories. |
| `control-state/decision-material-contract.js` | Material schema and version digest | Old presentation-decision owner reexports the same functions; projection still reads both operation histories. |
| `control-state/run-seal-compute.js` | Canonical artefact digests and seal computation/application | Old seal owner reexports all prior computational exports; `runSealState` still validates approval/binding histories and archived revisions. |
| `control-evaluation/run-state-policy.js` | Predicates over prepared Run facts | Old Run-state owner reexports the same functions and collections; preparation and QA acceptance remain unchanged. |
| `control-state/run-presentation-envelope.js` | Immutable envelope checks, versions 1 through 5 | Old live presentation owner reexports the validator; historical proof uses that same lower owner. |

Internal consumers import the owner they actually need. No lazy callback registration, dynamic import, skipped historical check, expanded schema allowance or cycle exception is introduced. The original strict Acorn dependency graph/cycle guard remains in force.

`movement-audit.json` verifies 42 moved pre-existing declarations byte-for-byte against the recorded base commit. Feature envelope version 5 retains its dedicated existing preview/approval/history regressions rather than being compared with the pre-feature implementation.

The first post-fix graph contains 142 modules and zero cyclic components. The isolated Core boundary check also passes with missing-resource and forged-resource negative fixtures.

## Verification follow-through

The first clean-source rerun passed the earlier Core boundary and reached a stale English handbook source-reference diagnostic. Its existing translated preview additions match the German additions. Only `source_revision` was refreshed; translation content and the existing review marker were preserved. A subsequent apparently green clean-source run exposed a harness gap: macOS `/var` path aliases could suppress a direct-entry Community check. The harness now canonicalizes its fixture root and requires the actual boundary and Community success markers. Only the strengthened rerun is final evidence. The source-bound adapter compatibility report is regenerated through actual fresh execution after the final payload, rather than copying or editing a fingerprint.

This report is accompanied by actual execution logs and a final command/result manifest. Synthetic adapter, package, Core and browser evidence does not establish a new native-host observation, independent human review, UAT, or release approval.
