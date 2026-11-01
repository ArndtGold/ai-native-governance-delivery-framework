# Implementation status after native Codex CLI qualification

Run: `run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74`. Current control revision: 28 / `3d110c21-eebf-4151-a5b6-35596c1d37c9`. CD+Tests, TP/Clean/Code reviews and technical QA pass are recorded through their canonical owners. Human Approval: QA is recorded for the exact presented report; Approval: UAT remains pending. This supporting scope report grants no approval or delivery authority.

## Delivered source boundary

- Independent planned UR creation, digest-bound replacement, readiness and derived inventory; shared UR authoring owner and template, no implied Run or approval.
- Explicit idempotent handoff with immutable origin/snapshot and one initial unapproved Run.
- New initialization uses `planned-urs-v1`, v3 Runs and strict v6 journals without a shared backlog dependency. Historical v2 and journals 1–5 retain compatibility. Ordinary mutation admission is per operation; explicit maintenance drains claims and freezes new writes.
- Explicit lossless migration preview/apply/recovery, raw byte snapshots, row dispositions, audited active v2 upgrade and unchanged ended v2 history. Actual Worktree migration was not applied.
- CLI/fixed-group MCP and passive Cockpit integration; optional skill-only planning package through existing generation/installation owners, with capability diagnosis and no second runtime/server/template.
- Tests registered in CLI smoke, the existing CI domain/transaction stage and MCP flow inventory. Generated package assets and compatibility reports use their existing owners.

## Verification evidence

All paths below are under `evidence/implementation/`.

| Scope | Executed result | Evidence |
|---|---|---|
| Planned Core/CLI, process termination, concurrency, handoff, migration, optional adapter | 76/76 pass | `core-cli.log` |
| HTTP and UI | 8/8 HTTP; 25 files / 283 UI tests pass; typecheck pass | `ui.log`, `ui-typecheck.log` |
| Actual browser cases | 5 affected cases plus the previously build-blocked palette case pass | `browser-affected.log`, `browser-palette.log` |
| Final candidate browser/Core integration | All 3 selected cases pass again after the admission integration fix | `browser-final-candidate.log` |
| Actual STDIO MCP | Both legacy and 2026-07-28 flows pass on the corrected assembled candidate, including stale-digest/unreadable-store reads | `native-read-regression-before.log` (0/2 reproduction), `native-read-regression-after.log` (2/2 pass), `native-read-errors.log` |
| Schema/discovery | Semantic contract pass; expanded/compact parity 3036 cases; fixed-group definitions remain bounded | `schemas.log`, original command regression log |
| Versioned persistence regression | Exact legacy approval checkpoints retained; v3 approval, early PRD, source revision, owned output and closeout checks pass | `boundary-first-attempt.log`, `revision-final.log`, `closeout.log` |
| Verified Change integration | 8/8 targeted checks pass, including actual Git flow and exact own-claim filtering; foreign bytes remain visible | `verified-change.log` |
| CI planning | 27/27 verification-plan checks pass | `verification-plan.log` |
| Compatibility source freshness | 56 scenarios / 0 failures; final source fingerprint `d2e83cd19a2fa73602fac4ad1d07cb6e138679414135482be742a9f2457f799c` | `review-compatibility.log`, `review-compatibility-check.log` |
| Preview regressions | Material, rendering and session checks pass; resumed foreign/symlinked partial publication explicitly returns `effect_unknown`, preserves bytes/claim and resumes only after exact fixture restoration | `preview-regression-first-attempt.log`, `preview-presentation-final.log` |
| Package/build | Generation and assembly pass; 1538 package files validated; payload-budget checks pass | `generation.log`, `assembly.log`, `package.log`, `payload.log` |
| Actual Worktree read-only preview | 156 Runs, 185 rows + 131 unparsed lines = all 316 backlog lines; 3 drafts, 0 blockers, 105 explicit findings. All 14,240 Control entries / 631,450,625 file bytes unchanged during preview | `worktree-preview.json`, `worktree-readonly.json` |
| Corrected candidate and actual native host | Core-only and Core+Planning pass on unchanged Core `826ca9884801`; actual serving provenance matched. Temporary global selection restored | `native-candidate.json`, `native/manifest.json`; `NATIVE_QUALIFICATION_REPORT.md` |
| Served governance runtime | Bound Doctor reports pass / 0 findings using the still-installed prior runtime. This does not qualify the new candidate | `doctor.json` |

The larger command regression first reported five failures. Four were diagnosed and rechecked through updated version-specific fixtures and the presentation/closeout tests. The fifth was a real integration defect: the active writer's own admission claim appeared as a foreign Verified Change path; `verified-change.log` proves its narrow production fix. The first attempt is retained as failed evidence, not relabelled green. The full chain was not blindly rerun after targeted repairs; its downstream preview-only programs are separately checked. A transient HTTP timeout passed on repetition without a production relaxation. Browser observation also found and fixed a duplicate close after confirmed handoff; its visibility regression and real assembled-Core browser case pass.

## Evidence limits and remaining work

- T-012 / G-08 passed in Codex CLI 0.163.0 on macOS with existing ChatGPT authentication. Core-only used one turn; optional Planning used three. Actual tool exchanges and resulting sources/Run states were reviewed together. Prior candidate failure and the safe startup correction are retained; see `NATIVE_QUALIFICATION_REPORT.md`. Previous Core and exact config bytes were restored. No persistent global update is claimed.
- T-013 technical work is complete: TP/Clean/Code reviews and the sole QA assessment are recorded; existing context nodes are reconciled. QA_REPORT.md is the authoritative technical decision. Human QA/UAT remain open. No human QA/UAT acceptance, OR, VCS completion, remote CI, native Desktop/Cockpit or other-host support is claimed.
- Migration has a bounded 256-Run lock set and 32 MiB journal; large/unknown/foreign states refuse rather than truncate or guess. The actual legacy preview's 105 findings include 61 unverified ended histories, 43 unresolved associations and one unavailable legacy UR. Unknown rows/history remain accounted evidence, not newly trusted decisions.
- Schema discovery ceilings changed explicitly to 9 KiB for record, 6 KiB for Inspect and 28 KiB aggregate command definitions; material (128 KiB), chunks (16 KiB), requests (64 KiB) and result limits remain bounded. The measured aggregate command definition is 24,879 bytes, excluding the separate facade. The reviewed Copilot payload baseline is 452 files / 4,927,790 bytes; this is a repository packaging check, not native Copilot qualification.
- Preserve the earlier prerequisite routing repair, all unrelated work and the primary checkout. No commit, push, PR, merge, persistent global update or real migration was performed. Temporary native installation and restoration were explicitly authorized.

## Native-discovered production correction

The initial native candidate failed `planned-entry` with `tool_result_invalid`: both new read operations were missing from the shared MCP result classifier and the successful report omitted explicit availability. The corrected production owner and actual STDIO negatives pass; Core authoring (4/4), generation, assembly, MCP error contracts and compatibility (56/56) were refreshed. The final candidate was then held unchanged across both native configurations. Older unrelated repository/browser results remain applicable because this correction changes only MCP result classification and explicit Inspect availability. Final compatibility freshness passes in `native-final-compatibility-check.log`.

## Code Review correction and final source

The migration journal was internally checked but not fully bound to its confirmed maintenance marker. A substituted preview/Run lock set could be consumed. The new regression reports 2/4 failures on the old implementation; after the production correction all 17 migration cases and 10 process/version cases pass. Marker operation/request/preview/config identities must match, and the closed lock set is validated against safe IDs, exact captured Run state, count/version/lifecycle/revision before any Run lock or archive. Final assembled STDIO 2/2, package 1538 files and compatibility 56/56 pass. The initial payload ceiling refusal is retained; the measured 1958-byte increase is exactly 1059 bytes in the migration owner plus 899 bytes in its generated worker function. The existing budget owner records the reviewed 452 files / 4,927,790 bytes.

Final packaged candidate `a679e02c1b68` was not globally installed. Native observations remain on `826ca9884801`; candidate file comparison and generated-worker AST establish that only migration `validateIntent` changed in executable behavior. Reuse is limited to the unchanged exercised UR/Planning/handoff entrypoints, not native migration or execution on a new digest. See `qa-final-candidate.json`, `qa-source-snapshot-summary.json`, `native-final-applicability.json` and the retained journal/review logs. No repeated completed native model cohort was used to manufacture a green result. Existing Context Graph nodes have been reconciled; mandatory review/QA recording follows.

## Final technical review recording

CD+Tests recorded at revision 23, Code Review at 24, Clean Implementation Review at 25, TP Review at 26 and QA_REPORT (pass, tests approved TP) at 27. All protected source approvals remain unchanged. TP Review left T-013 partial only for the final QA step; QA_REPORT explicitly completes that technical assessment without claiming human QA/UAT. No relevant normalized finding remains open. Current next action is canonical presentation and a new deliberate human Approval: QA. Installation is restored, the Worktree remains unmigrated, and no VCS/publication action has been taken.

## Human QA decision

The deliberate `Approval: QA` was recorded by approval.record operation e2d229d9-8965-41ba-8e31-a3a8d13bf9d3 against presentation 2e9da09a-7dca-40a0-b41c-01152d52a12c and QA digest sha256:f4a5326536d6ee217f3652dacba62349f045514f76e2e399698322859e66b9d2. The canonical owner advanced the same Run to revision 28/UAT. Earlier pending-QA notes describe their recording time; current authority is the Run/approval receipt. UAT, OR, actual migration, permanent installation and VCS/publication have not been performed by this approval.
