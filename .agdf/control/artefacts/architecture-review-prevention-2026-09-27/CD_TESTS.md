# Code Deliverables and Tests: Architecture Debt Prevention

Status: `draft` — implementation and source/package checks complete; host acceptance incomplete
Date: 2026-09-28
Run: `architecture-review-prevention-2026-09-27`
Based on: approved TP revision 17 and Brownfield Analysis revision 19

## Deliverables and TP coverage

| task_id | status | evidence | open item |
|---|---|---|---|
| T1 | done | `plugin/skills/brownfield-analysis/SKILL.md` conditional architecture guidance | Fresh installed-host route behavior. |
| T2 | done | `plugin/control/templates/artefacts/BROWNFIELD_REVIEW.md`; `evals/fixtures/architecture-impact-examples.md` | Actual host-produced review record. |
| T3 | done | Minimal `plugin/meta/contracts/gate-transition.md` cross-reference; Modes and Quality remain sole policy owners. | Formal review after CD+Tests. |
| T4 | done for source and model-eval scope | Runtime-integrity positive/negative checks; 90/90 deterministic replay; seven fresh Codex model evaluations with the same current source fingerprint, plus one retained failed attempt. | Deterministic replay and source-injected model evaluation do not prove installed-host route execution. |
| T5 | done | Generated profiles rebuilt; package contents and reproducible build passed; Copilot budget reviewed at 108 files/1,029,788 bytes. | None for package projection. |
| T6 | partial | `HOST_CODEX.md`, `HOST_CLAUDE.md`, `HOST_COPILOT.md`, `HOST_OPENCODE.md` | Claude login, Copilot CLI, and direct relevant/low-impact governed cases on every host. |
| T7 | open | Working diff inspected; no formal post-CD+Tests reviews recorded. | Complete TP, clean implementation and code reviews after T6 evidence. |

## Checks run

- `node plugin/scripts/check-runtime-integrity.mjs`: pass.
- `npm --prefix create-agdf run eval:skills`: pass, 90/90 deterministic replay cases; not live-host proof.
- `npm --prefix create-agdf run test:skill-evals`: pass.
- `npm --prefix create-agdf run test:runtime-integrity-negative`: pass, including missing Architecture Impact owner and broken finding-index cases.
- `npm --prefix create-agdf run test:payload-budget`: pass.
- `npm --prefix create-agdf run test:package-build`: pass, generated profiles reproducible.
- `npm --prefix create-agdf run test:package-contents`: pass, 544 release-built files.
- `node create-agdf/scripts/local-development-install-test.js`: pass, including npm 12 object-form `npm pack --json` output.
- `git diff --check`: pass.

The seven current Codex observations are stored under `evals/observations/live/codex/` with
fingerprint `99ab401f2f755b34fb7a3e5f5a65775899f901e611092e4d8a4f9dbd0afbcf77`.
They cover relevant ownership, complete and incomplete retained trade-offs, missing decisive
evidence, local not-applicable and optional diagram use. The prior raw failed Trade-off attempt
at `TRADEOFF_LIVE_ATTEMPT.json` shows the model grading its own answer `pass` while the fixture
needed `revise`; the evaluator prompt now requires the fixture's actual review outcome. This
counterevidence limits any claim of stable model behavior from one successful replay.

## Installation blocker repaired

OpenCode local installation initially failed because `parsePackResult` assumed an array from
`npm pack --json`; npm 12 returned an object keyed by package name. The existing parser now
accepts both validated shapes. The local development installation test and a real
`install:opencode -- --plugin-only` run passed after the fix.

## Evidence boundary and next action

Source checks, generated package checks, installed-plugin reads, source-injected model cases,
and a fully executed installed-host Brownfield route are separate evidence levels. This run
has the first four only in part. No QA pass or four-host acceptance is claimed. Keep CD+Tests
open until T6 is evidenced or the approved acceptance scope is revised through its owner.
