# Code Review: Repository-specific migration and repair

Date: 2026-09-30
Scope: Attributable source delta against the captured pre-implementation baseline, listed with digests in AUTOMATED_EVIDENCE.json; adjacent CLI parser/validator, generator, consent/provenance and canonical recovery boundaries. Extensive prior checkout changes are outside this review.

## Code Review

- decision: pass
- findings: No remaining actionable defect in the reviewed source/generated integration scope.
- evidence: Actual new command/service/contract/startup and extracted renderer/interaction diff reviewed; original migration body is byte-identical and repair body differs only by its shared import. Canonical writer/seal/lock code was reused without a new change. Explicit absolute target and immutable fixed validator argv remain authoritative; diagnostic text is data. Confirmation clones bind to current canonical sources and direct service additionally checks target directory identity before/after decisions. Default/JSON/details routes never apply; guided rejects noninteractive/JSON before mutation. Real EOF resolves deferral; partial/required-original results retain operation diagnostics and fresh compatibility. The new dependency closure is explicit; existing native Claude MCP support remains, and maintenance imports no installer/configuration service. 29 focused suites, deterministic package build, profile checks and positive/negative integrity guards passed.
- missing_evidence: The initial source review did not establish the installed lane. The live follow-up below now observes exact installed command behavior; native fresh-session startup is now observed under T-008 in NATIVE_SESSION_EVIDENCE.json.
- risks: A sufficiently large inventory may exhaust the shared startup deadline and correctly show unavailable with the manual route. Unix/PowerShell quoting has source/fixture evidence; native Windows and other fresh hosts are unobserved.
- required_next_step: Evaluate QA with the completed Task Plan Review and native session evidence.

## Resolved Findings

The review process identified and corrected a missing local renderer import after re-export extraction and a target-identity gap when an identical-content repository directory is replaced during confirmation. Installer regressions and direct replacement/no-write snapshots now pass.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-001 | implementation_gap | CD+Tests | resolved | Installer local import restored; install-control-migration/repair and CLI modularization pass. | Retain the installer regression coverage. |
| CR-002 | implementation_gap | CD+Tests | resolved | service.js compares realpath/dev/ino before and after decisions; identical-content replacement test leaves both trees unchanged. | Retain the direct target-replacement regression. |

## Installed live evidence refresh

2026-09-30: CODEX_LIVE_OBSERVATION.md identifies the exact reinstalled candidate and current refreshed model-visible context, actual installed startup hooks with unchanged real consent, and real PTY migration/repair/deferral/no-original/repeat outcomes. The source candidate has not changed. No new implementation or structural finding is evident. The subsequent NATIVE_SESSION_OBSERVATION.md / NATIVE_SESSION_EVIDENCE.json resolves TP-E01 through actual native fresh-session events, independently of source-review pass. Source digests remain unchanged.
