# Renewed implementation verification

Bound Run: cockpit-documented-approvals-20261009-01. Sources and current approved digests are in PROTECTED_AFTER-final.json; renewed TP is ac12ce007409e7bbb936e4c23f12f8a77f3b9d4fae4ed23886b0ed37b8b5b6f4. Historical inline evidence is retained separately and does not certify this solution.

## Executed checks

| Check | Current evidence | Result |
|---|---|---|
| Node --test focused Core document-state, original draft-check and artifact-readiness suites | core-qualified.log | 18/18 pass, no skips |
| Actual before/after aggregate proof | proof-parity-final.log, PROOF_PARITY.json | 154 comparisons pass |
| Original canonical recording/source-revision regressions | artefact-recording.log, source-revisions.log | 210 recording assertions; 20 source-revision cases pass |
| Existing scoped capture/publication/session/context/changes suites | core-regressions-serial.log plus core-changes-host.log | 48 other cases pass; both unchanged observer cases pass in host run; 50 distinct cases fulfilled |
| Scoped UI and async/context/handoff regressions | ui-review-serial.log, ui-refresh-review.log | 123 + 3 distinct cases pass, no skips |
| Production HTTP service/worker | http-worker-qualified.log | 9/9 pass, serial host execution, no skips |
| Real offline-qualified STDIO MCP | mcp-protocol-quality.log, RUNTIME_QUALIFICATION-quality.json | 6 independent fixture/protocol combinations pass; returned UI resource hash matches manifest |
| Type checking and production builds | typecheck-review.log, build-browser-review.log, build-mcp-review.log | pass |
| Built browser/card reading, resize, keyboard and recovery | browser-review.log, browser-consumer-qualified.log, browser-changes-review.log, browser-quality.log | 20 original/focused cases pass plus corrected multiple/old-consumer case and 4 changes cases; 25 distinct cases, latest affected authoring journey rechecked |
| Protection/diff | PROTECTED_AFTER-final.json, INCREMENT-final.json, increment-final.patch | 5375 protected paths unchanged; 27 attributable paths; whitespace check pass |

Exact UI manifest: sha256:1adf4ff5985aa747176450849cce1eeffd31c3445dead0a113c6f83ae20200c6, 1081513 bytes. Immutable qualified-browser-review and qualified-mcp-review assets. BUILD_IDENTITY-quality.json and RUNTIME_QUALIFICATION-quality.json record current source/test/dependency/Core/server/dispatcher/SDK identities. The final Core change only narrows known diagnostic families to exact existing codes; unchanged UI assets are reused and the affected browser authoring journey/HTTP/MCP/Core tests rerun.

## Visible observations

Inspected actual screenshots in browser-review: documents-browser-light-960, documents-card-dark-320 and multiple-consumer-references. Wide columns and narrow stacked groups are readable; long references wrap. Measured responsive-observations.json records 12 transitions around 320/960 CSS px across routes/themes with same focused DOM row/action, at least 44px targets and no horizontal clipping. Current check findings are visible in browser-quality correction screenshots. No list remount, focus jump or observed flicker during tested resize/scroll/return/reload.

Multiple-reference and old-server absence variants are explicitly consumer DTO fixtures; they do not certify Core registration expansion or fabricated approval. Canonical positive byte/proof evidence comes from real disposable approval fixtures through Core/HTTP/STDIO.

## Failures retained and resolution

Earlier logs remain intact. Initial socket/Chromium/notification sandbox failures were rerun on the local host without relaxing assertions. One existing HTTP observer case under parallel qualification and one existing timeout UI case under concurrent load failed; unchanged serial suites subsequently passed. No cause beyond the observed execution conditions is asserted and no production workaround was added.

Early test fixture errors (wrong resource-reference property; shared object alias; stale raw/approval assumption; missing reseal; consumer adapter not intercepting snapshot recovery) were corrected to match real source/boundary behavior. The final consumer browser assertion accepts the existing 'Zuletzt beobachtet' qualification; it still requires actual uncertainty. Earlier failed logs are not counted as pass. No required test remains skipped or waived.

## Evidence mapping and boundary

SCENARIO_RESULTS.json maps all 20 required scenarios to executable owners/results. READ_ONLY_WINDOWS.json identifies actual byte-equal read windows; setup/writer operations excluded. PROOF_FIXTURES.json distinguishes actual canonical fixture behavior from human production approval. Evidence names differ from planned illustrative tests/*.log paths; this index resolves every planned purpose to actual executed files without claiming an unexecuted filename.

Native limits are in NATIVE_LIMITS.md. Current implementation has no fresh native observation. QA, QA approval, UAT and closeout remain separate until their canonical steps run.
