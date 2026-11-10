# OR: Fix seven companion review findings before merge

Run: run-de95feb2-537c-4d1f-a974-8bd350772636
Report mode: OR-lite

## Result

Compact Delivery (`quick_task`) of the approved UR is implemented in the working tree of branch `feat/companion-core-run-view`. All seven review findings are fixed, each with a test:

1. `notice.mjs` announces only reasons with a catalog notice text, so an unreadable run raises no toast reading `notices.unreadable`.
2. The adapter fingerprint in `register.mjs` lists the run's `evidence` folder, so a changed evidence report reads the run view again.
3. `run-state.mjs` fails the whole view only for a single run's `source_changed`; a single run's `timeout` stays that run's reason, and such a view is read again at the next check.
4. `server.js`, `generation-runtime.js` and `generation.js` write at most one companion event per tool call, including the production facade path and a facade failure after the generation replied.
5. `figure-state.js` shows a completed run that evaluates as blocked as blocked; `view.mjs` keeps its next step.
6. `run-view.js` evaluates invalid runs only when requested by id.
7. `events.js` derives `document_recorded` for `verified_change.record` and `ur_draft.replace`, with review facts.

Derived compatibility evidence is re-recorded.

## Evidence

- Approved UR: `.agdf/control/runs/run-de95feb2-537c-4d1f-a974-8bd350772636/documents/UR.md` (sha256:be212880898bf845b287bb48056b90863e163c09da8795829a246e53c72d5a31).
- Brownfield Review with Mode/Slice `quick_task`: `documents/BROWNFIELD_REVIEW.md` (sha256:5f2831c0a69a983e693ba0ef5bbc164ed36a5962ecf72943036580a777dd836c).
- Verification evidence: `evidence/EVIDENCE-9861c1da1db7c956d45e16f163036a5f4b997d370810ec11a559bef3ba27de65.md`. Each finding was reproduced by a failing test or probe before its fix; `test:claude-companion`, `test:companion-run-view`, `test:plugin-mcp-runtime`, `test:claude-plugin-mcp`, `test:copilot-profile`, `test:package-contents`, MCP server `test:protocol`, `test:safety`, `test:generation`, `test:contract` and `compatibility:check` (after `compatibility:record`) pass on the final diff.
- Code Review `pass` from an independent review agent with five resolved normalized findings and one open evidence gap: `documents/CODE_REVIEW.md` (sha256:758ef5920b5e4a41ae8841cb5c6528d93b98c1ad25b65628b785fd22110a352c).
- Context Graph: no impact (`context_graph_impact: none`, `context_graph_reconciliation: not_applicable`); knowledge persistence `scope_artifact` (this Run's evidence).

## Risk

- Open evidence gap CR-F03: the change in `generation-runtime.js` has no test of its own; the same rule is tested at the server and the facade.
- The cases added after the independent review were written together with their fix and not observed failing first.
- No native Claude run of the companion against an installed build of this change.
- A run that always exceeds the read budget causes one run-view call per 30-second check.
- By default the `run-view` JSON no longer carries status card fields for unreadable runs; they are available when the run is requested by id.

## Next Step

Commit the source changes, tests, re-recorded compatibility evidence and this Run folder on `feat/companion-core-run-view` and open the pull request against `main`, as the owner requested on 2026-11-10. A later run should add a generation-child test with a failing send (CR-F03).
