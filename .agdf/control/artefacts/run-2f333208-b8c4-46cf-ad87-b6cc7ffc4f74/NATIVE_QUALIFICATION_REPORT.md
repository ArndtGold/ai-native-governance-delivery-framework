# Native Codex CLI qualification

Decision: pass
Date: 2026-10-31
Run: run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74
Scope: approved TP G-08, N-CORE and N-PLUGIN only.

## Candidate and environment

The final two configurations used the same unchanged Core candidate `0.20.2+codex.local-826ca9884801`, source SHA-256 `826ca9884801494b1650a5d2a716d4cace45106657653537df15f193c7d30245`. The optional skill-only package was `0.20.2+codex.local-8b32f58de579`, source SHA-256 `8b32f58de5790be47a3953e91de3d3d30d2ce1a270262ade131a6d57ca5eff64`. Exact source roots and package identities are in `evidence/implementation/native-candidate.json`.

Actual client: Codex CLI 0.163.0; Darwin 24.6.0, x86_64; model `gpt-6.1-sol`, low reasoning effort. Existing ChatGPT authentication was reused in place. No credential was read, copied or acquired. User `Ja` explicitly authorized temporary installation, both configurations and restoration; this is machine authority, not a gate approval.

Both native configurations observed `provenance_status: matched` and serving runtime digest `a9f3e146a950f6a3c93fe4c10e6b19acfa7f1f83dcfbfb4e8f9a70f759b689e5`. This serving-generation identity is distinct from the assembled package runtime digest `f2294181292ee7155483b592737300d74b5e22cb768a5e2d692d0e362dcb8b9b`; neither is substituted for the other. Actual tools reported the same candidate-owned generation root. Both configurations used normal Codex `:workspace` permissions, four scoped Core MCP tools, process-scoped plugin selection, existing independent CLI environment cleanup and `mcp_optional_startup_grace_ms=0`. A model-free native sandbox canary proved that a repository append was denied while a disposable fixture write succeeded.

## Actual observations

| Procedure / scenario | Actual result | Durable evidence |
|---|---|---|
| N-CORE / SCN-012 | Installed Core UR skill was read. Version-matched UR template and shared `ur-definition` planning owner were consumed. One canonical UR was captured with normal priority, then replaced at high priority. Exact source inspection succeeded. | `native/final-cohort/core-tool-exchanges.jsonl`; `native/final-cohort/core-only/planned/` |
| N-CORE handoff and direct creation | Exact selected source produced `run-34d488bb-d9b7-4a83-a8f1-f64d0f1a2ba1`. Original operation inspection reported recorded; exact original UUID/payload replay returned `already_applied` and the same Run/revision. Separate direct creation produced `run-8c534ac8-2ff1-4512-bd2b-56343f23eddf`. | Core trace and `native/final-cohort/core-fixture.json`; copied Run states/origin/snapshot |
| N-PLUGIN / SCN-013, 028 | Actual installed optional `planning` skill was read and invoked. Capability declares `planned-ur-v1`, protocol 1, owner `ur-definition`. It delegated through Core and used the same template digest `sha256:2ba8dc982a1b264682e553c290c3b7fb26ee74425ab1b1fb49afb423d64d7d01`. | `native/final-cohort/planning-tool-exchanges.jsonl`; `native/trace-review.json` |
| N-PLUGIN clarification and priority | Turn 1 saved high-priority incomplete `plan-2d2eed01-526d-4aeb-9662-8ac55066b366`, asked the missing multiple-match question and created no Run. Turn 2 applied the supplied fixture answer to that same source, changed priority to low and completed clarification without starting delivery. | Actual trace; `incomplete-fixture.json`, `refined-fixture.json` |
| N-PLUGIN / SCN-031, 032 | Turn 3 reinspected exact ready source `sha256:ae7d529ed357a3d3cbedd2124aca8c1a6d15f9fc550ecf2648e7571eb885ab77`, deliberately handed it to one Run, inspected original operation `ba1a9751-4edd-41e9-b38d-bcc7ec7380c1` and replayed that unchanged request. Result `already_applied`, same Run/revision and immutable origin. | Actual trace; `planning-fixture.json`; copied `run-ba1a9751-4edd-41e9-b38d-bcc7ec7380c1` state/origin/snapshot |
| Authority and preservation | All three resulting fixture Runs retain missing UR approval. No PRD, SD, TP, QA or OR was created. Original and imported UR/snapshot bytes agree. Real repository Control hashes were unchanged throughout the cohort. | `native/final-cohort/summary.json`, copied sources/Run states |
| Restoration | Previous Core `0.20.2+codex.local-283f707b4b49`, enabled, and its original marketplace were restored through native lifecycle commands. Optional plugin/marketplace removed. Configuration bytes exactly restored, SHA-256 `0b4f0002d6c56132a036510e93800a1d085373a8dc0e74ed90e5c38dd9e55ea5`. Owned fixture trust entries were removed through version-bound native config writes. | `native/final-cohort/lifecycle.jsonl`, `restoration-digests.json` |

Core used one model turn (about 87 seconds); Planning used three turns (about 103 seconds total). The harness deliberately leaves its raw `native_qualified: false` / `trace_review_pending` marker unchanged: this report supplies the subsequent semantic trace assessment. It does not rewrite historical execution results. Public model prose alone is not qualification evidence; actual tools and stored effects were reviewed together. The Planning procedure had one rejected read with `working_directory_required`; supplying that required field retried the same read before any mutation. This is retained as an input error, not described as an error-free trace or a product failure.

## Failed attempts and correction

The first candidate `2a5fde88040a` failed native `planned-entry` inspection with `tool_result_invalid` after a real capture/refinement. The new Inspect reads were absent from the shared result classifier and successful reports omitted `available`. The production correction registers both reads in `mcp-tool-errors.js`, classifies stale planning bindings and supplies explicit Inspect availability. Actual STDIO regression reproduced failure on the prior assembled runtime (0/2) and passes on the corrected candidate (2/2, both protocol eras), including stale-digest/unreadable-store negatives. Error-contract and Core authoring checks pass; generated assets, assembly and 56 compatibility scenarios were refreshed. See the retained `native-read-*.log` files.

Automatic approval review rejected a restart using `--dangerously-bypass-approvals-and-sandbox`. That rejected command was not executed or indirectly retried. The method changed to the regular `:workspace` permission profile. One subsequent startup lacked AGDF MCP discovery because the standalone harness omitted the existing independent CLI environment/startup helper. That attempt created no planned source or Run; its owned trust entry and previous installation were restored. The final bounded attempt used the established helper behavior and passed. Failed attempts remain in `native/attempt-01/` and `native/corrected-cohort/`; no failed result was relabelled green.

## Limits

Qualification is limited to these Codex CLI/macOS cases and exact candidates. No Desktop/Cockpit, Windows, other host, performance, human QA/UAT, publication or release claim follows. Clarification answers in the disposable fixture are test inputs, not a human acceptance review. No actual Worktree migration was applied. Global installation was temporary and restored. Repository checks, native observations and later mandatory review/QA remain distinct.

Sanitized tool exchanges, public outputs, fixture sources and digests are retained under `evidence/implementation/native/manifest.json`. Raw user prompts, model reasoning, auth files and unrelated conversations are excluded. Temporary harnesses/raw rollouts remain outside repository evidence.

## Applicability after Code Review correction

Code Review subsequently tightened migration journal/epoch binding and the closed Run lock set. It does not alter the native UR/Planning cases. The final packaged source is `a679e02c1b680ba3d6c0eb82a0d2e80b1917d6d8f42a205662cba99a782fb95f` (`0.20.2+codex.local-a679e02c1b68`), not installed natively. `evidence/implementation/native-final-applicability.json` compares every candidate file and the generated worker AST: the only changed worker function is migration `validateIntent`; UR authoring, material, schemas, planned reads, handoff/status/replay, direct creation and the optional package remain unchanged. Affected migration (17/17), process/version (10/10), assembled STDIO (2/2), package and compatibility (56/56) checks were rerun. Under TP reuse/invalidation rules, retain the applicable native feature observations on their exact original identity, without relabelling them as execution or full native qualification of the final digest. No native migration was planned or claimed.
