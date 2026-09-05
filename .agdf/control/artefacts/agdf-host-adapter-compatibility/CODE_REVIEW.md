# Code Review

Run: agdf-host-adapter-compatibility
Revision: 2
Date: 2026-09-05

- decision: pass
- findings: No meaningful unresolved defect remains in the reviewed final scope.
- missing_evidence: No independent second reviewer or current native session evidence. This is an
  explicit agent review of the actual diff and final fixture/package/report outputs.
- risks: Native host changes can still require fresh evidence. A hard process interruption between
  directory renames may temporarily leave the comparison unavailable with the prior directory retained;
  checks fail closed and do not accept mixed report bytes. This is not native installation recovery proof.
- required_next_step: Consume this review with Clean/TP Review in qa-gate.

## Reviewed implementation

Compared retained facades and new native owners with their original bodies, including Codex cache
identity/refresh recovery, Claude uninstall/reinstall/cache retry ordering, Copilot Git transport,
settings and enablement restoration, and OpenCode installation/uninstall defaults and ownership.
Existing status precedence, unsupported/undefined/null facade behavior, command errors and receipt
write/revoke order remain preserved. CLI modularization/import-cycle and focused regressions pass.
Generated runtime includes only the four pure command leaves and one shared formatter, with isolated
execution tested; the development reporter does not enter production import or package paths.

Reviewed contract/evaluation/record/render code and adversarial cases: no installation or trust enum
promotes another claim, missing identities fail closed, original negative evidence survives conflict,
newer results require explicit evidenced supersession, sources and evidence cannot drift unnoticed,
foreign output is retained, failed recordings preserve the accepted report, and current partial
recovery facts are freshly observed. Explicit public evidence excludes private path content; the real
manifest contains no native source or public transcript inputs. Markdown escapes table/HTML content.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| HAC-CR-05 | implementation_gap | CD+Tests | resolved | Clean clone reproduced missing generated payloads before release preparation. Existing workflow now builds before runtime-integrity/community-health consumers; five clean-clone checks and two reversed-order negative probes pass. evidence/CI_CHECK_ORDER.json. | Retain the clean-checkout prerequisite regression. |
| HAC-CR-01 | implementation_gap | CD+Tests | resolved | Copilot fixture extraction omitted skills import; existing assertion failed. Corrected import; evidence/VERIFICATION_HISTORY.json preserves the error and correction; evidence/FINAL_VERIFICATION.json records the passing copilot-installer result. | Retain independent Copilot regression in future refactors. |
| HAC-CR-02 | implementation_gap | CD+Tests | resolved | Initial evidence logic could classify an unknown target as stale and allow execution proof without runtime identity. Explicit target gaps and relevant runtime requirements now pass the final 64-case suite. | Retain unknown-target/runtime negative controls. |
| HAC-CR-03 | implementation_gap | CD+Tests | resolved | Native input hashes were captured after decoding, and publication lacked final native evidence revalidation. Read-time hashes and final input/reference checks now reject injected races while preserving accepted output. | Retain concurrent-evidence recording controls. |
| HAC-CR-04 | implementation_gap | CD+Tests | resolved | Partial-recovery observation reused earlier success facts and non-Copilot preservation was implicit. Final suite freshly observes partial payload plus native settings/enablement fingerprints for all hosts. | Retain the shared recovery observation checks. |

Existing behavior deliberately retained outside redesign scope: the consent service's existing
non-OpenCode prospective identity source and native host fallback algorithms were not changed.
Their compatibility is preserved; this review does not create a new support claim for those paths.

## CI correction review

The follow-up diff changes only workflow ordering and its existing smoke-test assertions. Release
preparation runs once after repository dependencies, with all existing validations retained. No
check is skipped, no accepted observation is rewritten and no checker gains build side effects.
The actual missing-build failures and both final-test negative probes establish regression
sensitivity. Review decision remains pass for the scoped correction; remote Ubuntu execution has
not been observed.
