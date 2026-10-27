# UAT Live Recheck: Corrected AGDF Companion Build

Date: 2026-10-26
Run: `agdf-begleiter-companion-20261025-01` (gate UAT after `Approval: QA`)
Host: Claude Code 2.1.302, Claude desktop app (Code tab), Windows

This recheck is the live spot check that the QA report promised before UAT approval. It covers the build with the CR corrections, the QA-round corrections and owner requests 3 and 4.

## Installation

The branch build was installed into the real Claude with `create-agdf claude`. Following the Windows rule, the installer ran outside the desktop app package (`explorer.exe` on `probe-results/t9j/run.cmd`, later `t9k`).

- Result: exit 0, `agdf@agdf` 0.20.1 enabled, and the AGDF MCP server connected.
- The installed copy under `%LOCALAPPDATA%\agdf\marketplaces\agdf\plugins\agdf\companion\` contains the corrected texts and layout.

## Setup

The live project `C:\Workspace\agdf-companion-live` already held the T-009 runs. `live-harness.mjs setup-recheck` added two runs:

- `live-cr-revise`: current gate `CR` with a `CR | … | revise` Artefacts row, the shape the canonical writers produce for a review revise (CR-F02).
- `live-abgeloest`: lifecycle `superseded` (TPR-F01).

An empty folder `C:\Workspace\agdf-companion-ohne-steuerung` covers the missing-control case. A Claude session was started there that only greets.

## Observations

| Screenshot | Check | Result |
|---|---|---|
| `live/12-recheck-open-runs-without-superseded.png` | Open runs without a change in the session | "Kein Run zugeordnet" with exactly four open runs (`live-cr-revise`, `live-blockiert`, `live-wartet`, `live-laeuft`). The superseded `live-abgeloest` and the completed `live-fertig` are not offered. |
| `live/13-recheck-laeuft-next-step-text-buttons.png` | Run-derived „läuft“ reason; stepping buttons | „läuft“ with „Als Nächstes: Nutzeranforderungen“ and „Von dir ausgewählt“. **Finding:** the desktop draws the stepping buttons with their label text („Vorheriger Run“, „Nächster Run“), not the glyph children ◀ ▶ that the `claude plugin test` engine had drawn. The count „4 von 4 offenen Runs“ wrapped onto three lines between the two buttons. |
| `live/14-recheck-laeuft-stepping-row-fixed.png` | Stepping row after the layout fix | The count stands on its own line. „Vorheriger Run“ and „Nächster Run“ sit side by side below it, without wrapping. |
| `live/15-recheck-blockiert-code-review-row.png` | Blocked state from the Artefacts row (CR-F02) | Red figure with stop sign, „blockiert“, „Code-Review: Überarbeitung nötig“. Stepping wrapped from 4 to 1 of 4. |
| `live/16-recheck-no-control-folder-name.png` | Missing control folder | "No AGDF control folder in “agdf-companion-ohne-steuerung”." with "Checked project folder: C:\Workspace\agdf-companion-ohne-steuerung". The text is English, because a folder without `.agdf/control` has no configured chat language (SDD-05 fallback `en`). The window was captured directly from the desktop app. |
| `live/17-recheck-footer-read-time-own-line.png` | Footer after the second layout fix (2026-10-27) | „Bewegung aus“ and „Neu lesen“ sit side by side, „Stand 07:04“ stands on its own line below them. Before the fix the read time wrapped onto two lines beside the buttons (visible in screenshot 14: „Stand“ above „18:41“). The stepping row above stays intact. |

A new session in the live project reopened the panel by itself and kept the remembered selection (`live-cr-revise`, „Von dir ausgewählt“).

## Layout Fix Outside AGDF

On 2026-10-26 the owner decided to fix the stepping-row finding in this run without using the AGDF process. After `Approval: QA`, AGDF would have required a TP source revision followed by renewed TP approval, CD+Tests, reviews and QA.

- **Change.** In `register.mjs` the count moved to its own line above a row with the two buttons. The buttons carry only their localized label, without glyph children.
- **Tests.** The adapter suite checks label, absence of children, the button-only row, the count line above it, and a terminal width of at most 40 columns (en, de). The old layout and glyph children both fail the suite.
- **Native.** On the corrected build, `claude plugin validate` passes and `claude plugin test` passes 3/3.
- **Evidence.** The runtime plugin was rebuilt and compatibility re-recorded (56/0).

On 2026-10-27 the owner had the footer corrected the same way, again without the AGDF process. Screenshot 14 showed the read time „Stand 18:41“ wrapping onto two lines beside „Bewegung aus“ and „Neu lesen“.

- **Change.** In `register.mjs` the two footer buttons form a row of their own, and the read time stands on its own line below them.
- **Tests.** The adapter suite checks that the footer row holds only the two buttons, that the read time is the line below it, and a terminal width of at most 40 columns (desktop en and de, terminal en). The old footer fails the suite ("the footer row holds only the two buttons"). The native test checks the footer labels and the read-time line.
- **Native.** On the corrected build, `claude plugin validate` passes and `claude plugin test` passes 3/3.
- **Evidence.** The runtime plugin was rebuilt and compatibility re-recorded (56/0). The branch build was installed again (`probe-results/t9l`, exit 0, installed `register.mjs` identical to the generated one) and checked live in a new desktop session (screenshot 17).

Neither correction is recorded in the AGDF run. The recorded CD+Tests, Code Review and QA statements that the buttons "draw ◀ ▶" describe the state before the first fix and do not hold for the desktop surface.

## Byte Identity

`live-harness.mjs check` after the recheck and again after the footer session on 2026-10-27: no run state changed since the harness's last write (`setup-recheck`, 2026-10-26T17:25:13Z). That covers six runs read across four desktop sessions, "Read again" and the 30-second timer. The missing-control folder stayed empty. The ledger is copied to `live/harness-ledger.json`.

## Observations For The Follow-Up Run

- When a run's current gate is an internal step (Brownfield Analysis, CD+Tests, CR), the gate bar marks no gate as current (screenshot 15). The planned CD+Tests mark covers this.
- A fresh run shows the TP template prompt „Describe the trustworthy outcome.“ as its objective. The core already classifies it as a placeholder (`isDecisionContentPlaceholder`).
- In a folder without `.agdf/control`, the panel speaks English even in a German session, because no chat language is configured there.

## Verification

A first `npm run verify:ci` on the tree with only the stepping-row fix was interrupted: the machine went to standby at 20:10 on critical battery and resumed at 06:47. No stage had failed until then. It was stopped for the footer fix.

On 2026-10-27 the owner chose a targeted check instead of a complete run, because the layout fixes touch only the companion. A second full `npm run verify:ci` on the tree with both layout fixes passed 23 of 27 stages, from `dependencies` through `archives`, including `runtime`, `built-runtime` and `cli-package`, before it was stopped. The companion suites, which are part of cli-smoke, passed separately. `cli-smoke`, `wrapper-smoke` and `pages` were not rerun on this tree; the PR CI covers them.

### Merge With Main

PR 36 reported merge conflicts, so `origin/main` (99aaf01b, 18 commits) was merged into the branch. Git combined all code automatically. Four generated evidence files conflicted, and none of them was merged by hand:

- `plugins/agdf/meta/copilot-payload-baseline.json`: the merged payload measures 397 files and 3,510,143 bytes, 682 bytes above main's reviewed budget because of the Brownfield Analysis revision initiator. The budget was recorded again through `scripts/payload-budget.js` with a combined reason.
- `docs/compatibility/HOST_COMPATIBILITY.md`, `facts.json`, `snapshot.json`: rebuilt with `npm run build:prepare` and re-recorded with `npm run compatibility:record` (56 scenarios, 0 failed). The new observation is `47edc090…`, and `compatibility:check` passes.

Checks on the merged tree:

- `build:prepare` passes.
- verify:ci stages run one by one: `maintenance`, `shell`, `build-contracts`, `evals`, `compatibility-freshness`, `mcp-dependencies`, `runtime`, `community`, `host-compatibility`, `mcp-ergonomics`, `built-runtime`, `cli-package`, `wrapper-package`, `transactions`, `delivery-map`, `mcp-package` and `archives`. All 17 pass, and the eval fingerprints stay unchanged.
- Suites where main's changes meet this branch: `test:claude-companion`, `test:skill-dispatch`, `test:control-inspect`, `test:mcp-lifecycle`, `test:plugin-mcp-runtime`, `test:control-state`, `test:run-revision`, `test:late-source-revision`, `test:interaction-presentation` and `test:mcp-server` pass, as do the core tests `run-command-contract-test.js` and `expanded-source-revision-test.js`. Main's command contract builds its revision help from `recording-formats.js`, which this branch extends.

`cli-smoke` as a whole, `wrapper-smoke` and `pages` were not run on the merged tree. The PR CI runs the complete verification on Linux Node 22/24 and Windows Node 22.
