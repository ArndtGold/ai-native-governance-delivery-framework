# Connected current work step — implementation evidence

- Run: agdf-cockpit-mcp-app-20261005-01
- Source revision: 48 / 89c93583-6376-4eda-bf09-228e56ec7e08
- User request: unite current step, its prerequisites and access to open evidence, and carry that orientation into Run lists.
- Approved UR/PRD/SD/TP: unchanged. This is presentation and registered-source navigation inside their existing read-only/adaptive scope.
- Status: scoped implementation and tests pass; broader CD+Tests/current native qualification and formal reviews remain open.

## Result and owners

One shared WorkStep component presents current action, Core control qualification, explicit blockers/missing approval, stored approval/source disclosure and open evidence within the same accessible section. Compact navigation is inside that section. Run views, including summary mode, expose registered current-step/Run State documents directly beside the open evidence. Closing a source returns to the same Run and focuses its originating evidence button. Run lists group phase/control attention and the named evidence access in one cell; narrow rows use the full available width.

Only existing Core facts drive this presentation. Approved gates alone do not prove prerequisite fulfillment. Partial/stale/mismatched readings, a Core blocker, missing approval or non-passing control qualification cannot claim the step is open. Original missing-evidence descriptions, impact and required-next-step fields stay visible; strings and unknown records are not silently dropped. No unclassified gap is invented as a prerequisite or step output. Source access uses only existing registered opaque resources, without fuzzy evidence/file association. The overview's reduced projection leads to Run detail for prerequisite/source qualification.

Shared Pages typography/spacing and adaptive behavior remain. Unavailable evaluation retains explicit Run navigation. No Core evaluator, protocol, gate rule, approval authority, context/question behavior or persisted product state changes. README describes these owners and boundaries.

## Tests and actual browser evidence

66 UI tests and all five HTTP/service tests pass. New policy regressions exercise connected evidence/source access, blocked/missing approval despite stored approvals, incomplete control, non-passing status/doctor, unknown evidence and absent evaluation navigation. Initial removed status/code assertions found a real presentation regression; those source facts were restored inside the work unit before the final passing suite.

All five browser journeys pass on the final build, including direct registered Run State source opening and exact return focus. All 32 combinations of four views, two themes and 320/560/800/1280px remain within page width and retain shared loaded fonts despite the host body override. An initially ambiguous broad h2 font locator was narrowed to the actual Run title after the extra work-unit heading; assertions were not weakened. Fixture reading preserves source bytes and sends no external requests.

Typecheck, browser/MCP builds, git diff whitespace and both actual stdio protocol eras pass. WORK_STEP_VERIFICATION-01.json records exact source hashes, all matrix observations, startup/UI identities and unchanged approvals. context-evidence/work-step-*.log and selected screenshots preserve final results.

In the actual project browser, the exact Run's card and complete unit were inspected. Its registered CD+Tests document opened directly from the unit; document close returned to the same Run and focused that evidence button. WORK_STEP_REAL_CARD-01.png and WORK_STEP_REAL_RUN-01.png preserve the real reading path. The local read-only preview remains deliberately open at http://127.0.0.1:53105/card.html. Bookkeeping below occurred afterwards.

## Native boundary and remaining work

Owned preparation replaced only its exact running cockpit process and preserved its verified project config byte-for-byte (sha256:9a0a10a5ff4eb139d05946ec610ae7432bf595bfca469ad8a07ad6bd0f4401a9). Final UI digest and server digest are in WORK_STEP_VERIFICATION-01.json and protocol logs. The single current exact-Run native opening responds successfully after preparation. This supersedes the previous connection-only Transport closed gap, but is not visual/native loaded-identity proof. Full host recovery/rollback and final reviews/QA/UAT remain required for regular run completion; no automatic contextual question was sent and no approval or VCS action was inferred.
