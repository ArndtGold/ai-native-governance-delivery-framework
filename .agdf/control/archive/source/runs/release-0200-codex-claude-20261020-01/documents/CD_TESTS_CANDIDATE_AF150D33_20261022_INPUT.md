# CD+Tests — 0.20.0 clean candidate af150d33 and Desktop evidence binding

- decision: revise
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-22
- owner: Claude (Claude Desktop Code, Windows), current bound implementation and evidence review
- source_head: 17a82bf6a8476c7a0c1380d6476537bf256659a8
- source_state: clean isolated worktree of the pushed PR head; no stage, commit, push, tag or publication

## Bound sources and work boundary

Continues the approved UR/PRD/SD/TP and the recorded Brownfield Analysis. Current approved digests
are unchanged: UR sha256:2d92505776f81a79e399e124c434e501c96e5bf05510f1f185fca397d7224248,
PRD sha256:1d6bf911c1d9229d6c54ddfc0fc74bb3402d0e1a8efff775ad5903d81b657a9e,
SD sha256:0a1f8de1bb71b1ffbb317af7f5977dc9c0b617d3080fc62d7d998528fe7f11f1,
TP sha256:0a00d7cd0c13858e038b38a8b18e6419cc4dc21375c4702db4c0d3e6b01a23ff.
No approved source, sealed artefact, receipt or foreign run was edited. The previous CD+Tests result
(sha256:8c55fa9539a68248fb9275bcac2de80e1153b259989f023be76f03ecde549a99) is superseded by this
result only for its clean-source and Desktop-binding statements; its implementation evidence stays.

No source file was changed in this step. The handed-over commit 2e797838 and its repair 17a82bf6
(maintainer-requested CI fixture fix outside AGDF) are the implementation under test.

Evidence directory: evidence/CANDIDATE_17A82BF6_20261022/ (relative to this run).

## Clean candidate (T-009)

- Main checkout keeps its untracked session-local .claude/launch.json; it was not removed. The
  candidate was built in an isolated git worktree detached at 17a82bf6 (porcelain 0 throughout).
- Candidate af150d337fbf47abcfea5f03ae06a53b15107a4b219495ab54ea424c869f1158, version 0.20.0,
  source commit 17a82bf6, dirty false. File CANDIDATE.json, sha256
  66a98318e5b1e2233ad5fc66c1cefb187dbc6b928a5a6def2b279800a6da514a; summary CANDIDATE_IDENTITY.json.
- Policy digest 1bf3c8c9d3a23cfc4ee2f5b672fd15d6c913095116736682ffd557c54b6fffbf. Loaded identity
  agdf 0.20.0 / source 6eeb51bb9050fb0806f7dd1b32a4e0672d0753d666e0249095c3112942b9f048 /
  runtime 89c28ecbdac8ff15f0091df6f0e29810957e4b70f3d715eb45922d3a7cbe7fcf; MCP dispatcher
  61e3e38eeaca4af5c3494156e7e1fe58ac0db37daf25229d06f203bf460ca485. Source inventory 1,591 files,
  digest 27a5b71dd61d6c6fb9ef662294280bad3f0bd0cf319ec90c89f551dc02f03b7a.
- Reproducibility: policy, plugin identity and all five payload inventories built on Windows are
  byte-identical to the earlier macOS diagnostic candidate 5143cc19. That diagnostic ID and the CLI
  candidate 830d8b94 are not reused.
- A preliminary candidate computed before stages 17-27 equals the final one.

## Executed verification

| Check | Result |
|---|---|
| npm run verify:commit -- --ref HEAD | Fail, exit 1: stages 1-15 pass; mcp-ergonomics 43/44 (Windows test path defect, see E-WIN-TEST-PATH) |
| Documented preparation: npm ci, build:prepare, MCP ci, compatibility:record, compatibility:check, build, release:prepare | All exit 0; compatibility 56 evaluated / 0 failed |
| npm run verify:ci in the clean worktree | Fail, exit 1 at the same test; stages 1-15 pass |
| Stages 17-27 individually through verify-ci --stage | All 11 exit 0, incl. cli-smoke (6,831 s), archives, wrapper-smoke and pages |
| Remote CI AGDF Guardrails run 39770870527, head 17a82bf6 | Success, 118/118 jobs, 48 Windows jobs; mcp-ergonomics runs only on the Linux repository lane |
| git diff --check origin/main...HEAD for implementation paths | Pass |
| release-evidence handoff | Prepared; six required Desktop cases; qualification pending |
| release-evidence validate --all-hosts | Rejected, exit 1: no candidate-bound import exists |

Platform-generated output: compatibility:record relabels the deterministic fixture snapshot
darwin -> win32 with unchanged fingerprint; pages check rewrites pages/.astro/content.d.ts. Both own
outputs are preserved under platform-generated-output/ and committed bytes were restored; the
committed snapshot passes compatibility:check. Platform limit: 24 symlink assertions SKIPPED (EPERM).
Local results cover win32 x64 Node v22.22.3 only. Repository tests, commit-bound remote CI, native
host observations and human acceptance remain separate.

## Desktop evidence (T-010)

DESKTOP_EVIDENCE_REVIEW.md lists sources searched and the six-case disposition. Summary:

- Both human reports stay reported_pass with null identity; no confirmation was requested again.
- No original Desktop session, log or export was found in the run evidence, probe results or this
  host's Claude Desktop session store; Codex Desktop is not installed on this host.
- Binding to af150d33 is impossible for originals: the handchecks were recorded at 07:34Z, before
  the schema-2 policy commit (09:47Z) and the candidate commit (10:10Z), and name no candidate.
- Current Windows Claude Desktop (3.1623.1.0, Claude Code 2.1.304, claude-opus-5-5) executes the
  candidate's MCP dispatcher and runtime digests, but its daily-profile local development install
  has source digest 8f11a04c… instead of 6eeb51bb… (install-time materialization incl. a local
  Cockpit server). It is no candidate-identical installation and no isolated test scope.
- No targeted observation was executed: it would replace or remove the active daily installation,
  and F-001 would reject any genuine Claude Desktop capture. No preflight, template, review or import
  was created; qualified Desktop records: 0 of 6.

## Task disposition

| Task | State | Evidence / remaining work |
|---|---|---|
| T-001 to T-008 | Complete as previously recorded | Unchanged implementation; reverified in this candidate's checks |
| T-009 | Complete except full single-run Windows pass | Clean committed candidate af150d33; 26/27 stages and remote CI pass; E-WIN-TEST-PATH |
| T-010 | Partial | Originals unbindable; F-001 blocks Claude Desktop; six records missing |
| T-011 | Not started | Core admits TP Review, Clean Implementation Review and CR only after CD+Tests done |

## Decision and normalized findings

Decision: revise. F-001 is an open implementation gap in the approved Desktop validator scope.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| F-001 | implementation_gap | CD+Tests | open | CLAUDE_DESKTOP_CAPTURE_PROBE_DISPATCH_ONLY.json: native Desktop dispatch recognized, observed_models empty, desktop_model_mismatch; desktopFixtures use CLI system/init events only | Extend claude-session.mjs/release-observation.mjs to accept the native Claude Desktop session transcript with equivalent strictness, add positive and negative fixtures, rerun test:release-qualification, then recompute the candidate |
| E-WIN-TEST-PATH | evidence_gap | evidence_obligation | open | logs/verify-commit-ref-HEAD.log: native.test.mjs:271/275 pass URL.pathname to node, MODULE_NOT_FOUND on Windows; from 8ad683bc on main, outside this run's TP scope | Maintainer authorizes a bounded portability fix outside this run, then rerun npm run verify:commit -- --ref on the resulting commit |
| E-DESKTOP-CODEX | evidence_gap | evidence_obligation | open | DESKTOP_EVIDENCE_REVIEW.md: no recoverable reference; Codex Desktop absent on this host | Codex Desktop executor records session, upgrade and recovery for the final candidate in a host-supported isolated scope via preflight and desktop-template |
| E-DESKTOP-CLAUDE | evidence_gap | evidence_obligation | open | DESKTOP_EVIDENCE_REVIEW.md: no original session found; only the daily profile exists here | After F-001, Windows Claude Desktop executor records the three cases in a dedicated isolated Desktop scope |
| E-CLEAN-SOURCE | evidence_gap | evidence_obligation | resolved | CANDIDATE.json: commit 17a82bf6, dirty false, pushed PR head | none |

Formatting diagnostic outside the findings: git diff --check origin/main...HEAD flags a blank line
at EOF in the sealed BROWNFIELD_REVIEW.md:124 and in two recorded PRD revision JSON files, plus
trailing whitespace in one verbatim log. All are run artefacts; implementation paths pass and no
repository or CI check enforces it. Sealed bytes stay unchanged; a correction would need the
Brownfield Review owner to re-record from a corrected source, which is a maintainer decision.

No QA, UAT, OR, release or publication authority is inferred.
