# Desktop evidence review for clean candidate af150d33

Date: 2026-10-22
Run: release-0200-codex-claude-20261020-01
Reviewer: Claude (agent in Claude Desktop Code on Windows); cooperative evidence review
Candidate: af150d337fbf47abcfea5f03ae06a53b15107a4b219495ab54ea424c869f1158 (commit 17a82bf6, clean)
Assurance: no operator_observed record exists; nothing below is a qualified Desktop result
Gate authority: none

## Scope and sources searched

The maintainer's confirmation of normal invocation, upgrade and recovery for both Desktop hosts is
preserved unchanged as human_reported (DESKTOP_HANDCHECKS_20261022.md; human-reports.json, SOURCE.md
sha256 d0e02f91bf7e989144a07088a485aaee54ba4fe9906db9abf6368b5de3d2e0ba). It was not asked again.

Searched for original Desktop sessions, logs or exports, bounded to relevant test material:

- Run evidence of this run, including DESKTOP_MATRIX_IMPLEMENTATION_20261022 and the CLI bundles.
- Ignored probe-results of the main checkout and of the earlier clean worktree agdf-e2e-97454ec2
  (only Claude CLI material for candidate 830d8b94; no Desktop session or capture).
- This host's Claude Desktop session store through the Desktop's own session tools: listing of
  recent sessions and full-text searches for `mcp__plugin_agdf_agdf__agdf_dispatch`,
  `"expected_version":"0.20.0"`, `agdf@agdf 0.20.0`, `owned_stale_install` and `Handprüfung`.
  Hits are the 2026-10-21 Claude CLI release session and older AGDF development sessions; no
  session exercising Desktop invocation, upgrade or recovery of 0.20.0 was found. No unrelated
  session content was read beyond the returned match snippets.
- Claude Desktop application logs: the roaming log directory was last written 2026-08-24 and holds
  no AGDF session data. No profile, credential or unrelated transcript was opened or copied.

Codex Desktop is not installed on this Windows host; its original OS, app, model and session are
not recoverable here.

## Why original handchecks cannot bind to af150d33

The handcheck statement was recorded 2026-10-22T07:34Z. The schema-2 Desktop policy reached a
commit in d7e2587a at 09:47Z and the current candidate commit 17a82bf6 at 10:10Z. The report names no
candidate, app version, model, session or loaded runtime. A schema-3 record requires a primary
capture that names exactly this candidate and its loaded identity. No original reference can do so,
and relabelling is excluded. Policy digest and plugin payload of af150d33 are byte-identical to the
earlier macOS diagnostic candidate 5143cc19 (dirty), but that candidate was computed at 09:34Z, after
the handchecks, and was never named by any Desktop observation. The match therefore does not
transfer the reported passes. Each of the six cases needs a candidate-bound observation; this is the
consequence of the identity rule, not a blanket retest request.

## Current Windows Claude Desktop facts (present day, not original evidence)

See CLAUDE_DESKTOP_CURRENT_HOST.json.

| Fact | Observed value | Matches af150d33 |
|---|---|---|
| App / OS | Claude Desktop 3.1623.1.0 x64 (MSIX); Windows 11 Enterprise 10.0.26200; embedded Claude Code 2.1.304 | not a candidate field |
| Session / model | local_ee5f44cb (transcript 6da83f61), created 11:37:32Z, claude-opus-5-5 | not a candidate field |
| Executed MCP dispatcher digest | 61e3e38eeaca4af5c3494156e7e1fe58ac0db37daf25229d06f203bf460ca485 | yes (identities.mcp_dispatcher) |
| Plugin runtime digest | 89c28ecbdac8ff15f0091df6f0e29810957e4b70f3d715eb45922d3a7cbe7fcf | yes |
| Installed plugin source digest | 8f11a04ca6f22d2212df1569ba426f994d90612e3049cd9880796cb39de33716 | no (candidate 6eeb51bb…) |

The installed copy is a local development installation in the daily user profile. It differs from
the candidate payload only in install-time materializations: `.codex-plugin/plugin.json` (local
Codex version), `mcp.json` (resolved local paths) and `mcp/claude.mcp.json` (an added local Cockpit
server); `mcp/claude.mcp.json` is not part of the normalized digest. Installer code under
packages/cli/lib and packages/core/lib/runtime is unchanged since the Claude CLI evidence commit
97454ec2. This install therefore is not a candidate-identical installation and is not used as
loaded identity for any case.

## Finding F-001: native Claude Desktop captures cannot pass the Desktop validator

The schema-3 branch passes every Claude Desktop call through captureNativeCall, which takes the
model only from a CLI `stream-json` `system`/`init` event. The native Claude Desktop session store
(JSONL, entrypoint `claude-desktop`) has no such event; the model is carried per assistant message.
Probe: CLAUDE_DESKTOP_CAPTURE_PROBE_DISPATCH_ONLY.json applies the candidate's own parser to the two
unmodified native lines of one actual agdf_dispatch call in this Desktop session. The call is
recognized (control_result, terminal, authorizes false, dispatcher 61e3e38e…), but observed_models is
empty, so assertDesktopRecord fails with desktop_model_mismatch. The repository fixtures for Claude
Desktop use the CLI event shape (release-handoff-test.mjs desktopFixtures), so tests do not reveal
this. SD requires native tool traces of the Desktop coding session with app-specific identity.
Converting a Desktop transcript into CLI events would be a synthetic trace and is excluded.

- gap_type: implementation_gap; routing_target: CD+Tests; gap_status: open
- required_next_step: extend the existing Claude capture owner (claude-session.mjs /
  release-observation.mjs) to accept the native Claude Desktop session transcript with equivalent
  strictness (one consistent assistant model, only AGDF dispatch/ToolSearch calls, exactly one
  dispatch), with positive and negative fixtures; then recompute the candidate.

## Six-case disposition

| Case | Human report | Primary reference for af150d33 | Concrete remaining gap | Owner / bounded next action |
|---|---|---|---|---|
| Codex Desktop session | reported_pass | none recoverable | Actual OS/app/model tuple via preflight; candidate-bound primary with rollout calls (dispatch, failure_case, skill_continuation), app capture, owned scope, consent, discovery, cleanup | Codex Desktop executor: one fresh session in a host-supported isolated scope with af150d33 |
| Codex Desktop upgrade | reported_pass | none recoverable | Released 0.14.5 baseline integrity/source digest, production upgrade, fresh dispatch, foreign-state and permission preservation, cleanup | Same executor after the session case |
| Codex Desktop recovery | reported_pass | none recoverable | Supported owned_stale_install repair, fresh dispatch, preservation, cleanup | Same executor |
| Claude Desktop Windows session | reported_pass | none found in this host's session store | F-001; isolated owned Desktop scope with consent/discovery/cleanup; app capture; candidate-identical installation | Repair F-001, then Windows Desktop executor in a dedicated scope |
| Claude Desktop Windows upgrade | reported_pass | none found | F-001; released 0.14.5 baseline and production transition on Desktop; preservation/cleanup | Same |
| Claude Desktop Windows recovery | reported_pass | none found | F-001; owned_stale_install on Desktop; preservation/cleanup | Same |

## Why no targeted observation was executed here

- This host has exactly one Claude Desktop profile: the daily profile that runs this session and
  holds the active AGDF installation. Installing 0.14.5, upgrading, injecting stale state or
  uninstalling for cleanup proof would replace or remove that active installation. TP and SD
  exclude active-profile replacement; no host-supported isolated Desktop scope was verified.
- F-001 would reject even a genuine capture from this Desktop.
- Codex Desktop is not available on this host.

No preflight tuple or desktop template was created: each binds to the candidate, which must change
when F-001 is repaired, and the executor's isolated environment may differ from this session.
No record was imported; no review was marked reviewed.
