# AGDF 0.20.0 closeout preparation after Desktop scope clarification

Date: 2026-10-22
Run: release-0200-codex-claude-20261020-01
Status: preparation only; no QA, UAT, OR or release decision

## Prepared inputs

- [Proposed matrix](RELEASE_MATRIX_REVISION_20261022.md): Desktop scope, separate CLI evidence, explicitly unqualified Codex Linux/Windows and unchanged experimental hosts.
- [Desktop handcheck record](DESKTOP_HANDCHECKS_20261022.md): direct user statements, all three reported scenarios for both hosts and visible missing execution identity.
- Existing Claude CLI evidence: candidate 830d8b94, Windows x64, Claude Code 2.1.302, claude-sonnet-5-5, Node v22.22.3; five per-record validator passes. Formal review/import remains pending.
- Existing Codex CLI macOS diagnostics and Windows lifecycle/cleanup CI remain separate evidence for their measured paths. They do not qualify untested host surfaces.

## Ordered remaining work

| Step | Owner | Completion evidence / boundary |
|---|---|---|
| Preview and confirm revision of approved PRD | Existing source-revision owner and maintainer | Exact impact and confirmation; original approved sources remain unchanged until confirmed apply |
| Reassess the prior Brownfield Review | Existing Brownfield owner | The accepted preview marks its applicability for reassessment and routes there first; UR approval stays exact and no new UR approval is inferred or requested |
| Renew PRD, SD and TP for the revised matrix | Existing authoring owners and maintainer | Fresh recorded sources and deliberate approvals; unchanged UR intent preserved |
| Reassess implementation preparation | Brownfield owner | Current policy/schema/evidence/publication/report owners, reuse and impact checked |
| Propagate approved matrix | Existing metadata, evidence, release and compatibility owners | Matching canonical policy, generated projections and fail-closed validators/workflow; complete ordinary CI coverage |
| Complete Desktop evidence binding | Maintainer / original manual test executors | Recover actual environment, test date/session, candidate and original evidence if available; retain unknowns honestly; request only specific missing verification |
| Review and import applicable evidence | Evidence reviewer | Exact final candidate match, consistent tuples, provenance and complete renewed matrix; retain superseded records |
| Refresh verification and reports | Implementation/test owners | Affected regression checks, current build/compatibility and shared CI; fresh candidate; no synthetic native pass |
| Perform TP, clean-implementation and code reviews | Existing review owners | Current source and result applicability; actionable findings routed |
| Final QA, UAT and OR | QA owner and maintainer | Fulfilled scope/evidence, exact later human decisions and accurate closeout report |
| Any commit, PR, release tag or publication | Maintainer-authorized delivery owner | Separate explicit authorization and final checked commit; not performed by this preparation |

## Current blockers and resolved expectations

The existing approved PRD still requires Codex Linux/Windows. The requested change must use the versioned source-revision path before production release policy changes. Lack of those native environments is an explicit unqualified-scope fact, not evidence that either platform passed.

Both Desktop handchecks are now documented as human-reported passes for invocation, upgrade and recovery. They are not missing assertions. The outstanding work is their exact environment/candidate binding and evidence review. No version/model/commit is invented from the answer "alle".

No known result is discarded and no whole handcheck is ordered to repeat merely because a report was previously incomplete. A final candidate/content mismatch or an unsupported capability claim must name the specific affected evidence obligation. Preparation and manual confirmation do not themselves approve QA, UAT, OR or publication.

## AGDF Approval Summary (de; source=en)

Vorbereitet sind die neue Matrix, die Bestätigung beider Desktop-Handprüfungen und die konkrete Abschlussfolge. Zuerst muss die freigegebene PRD revisionssicher angepasst werden; anschließend folgen SD/TP, konsistente Policy-/Validator-/Workflow-Änderungen und aktuelle Nachweisprüfung. Die Desktop-Versionen, Modelle und getesteten Kandidaten sind noch nicht konkret benannt. Danach folgen die erforderlichen Reviews und bewussten QA-/UAT-/OR-Schritte. Es wurde nichts veröffentlicht oder als abschließend freigegeben erklärt.
