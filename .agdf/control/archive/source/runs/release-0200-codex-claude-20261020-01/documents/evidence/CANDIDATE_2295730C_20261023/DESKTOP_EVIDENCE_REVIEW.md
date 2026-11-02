# Desktop evidence review for final candidate aa3e4b02

Date: 2026-10-23
Run: release-0200-codex-claude-20261020-01
Reviewer: Claude (agent in Claude Desktop Code on Windows); cooperative evidence review
Candidate: aa3e4b02af5650c8c2aab5f965fccd87924db2f40d928c72e24061baecc26108 (commit 2295730c, clean)
Assurance: no operator_observed record exists; nothing below is a qualified Desktop result
Gate authority: none

This review supersedes the disposition in evidence/CANDIDATE_17A82BF6_20261022/DESKTOP_EVIDENCE_REVIEW.md
for the final candidate. The source search, the original handcheck analysis and the current host facts
recorded there stay valid and are not repeated in full.

## What changed since candidate af150d33

- F-001 is resolved (d4f39956): Claude Desktop calls are parsed from the native Desktop session
  transcript. Unmodified native lines of one real agdf_dispatch call in this Claude Desktop 3.1623.1.0
  session now yield model claude-opus-5-5 and session 6da83f61
  (evidence/CANDIDATE_D4F39956_20261023/CLAUDE_DESKTOP_CAPTURE_PROBE_AFTER_FIX.json).
- Review fixes (0e93784f): Codex Desktop calls need their own session rollout (one session_meta id
  equal to session_id, no exec/cli source); each case binds its scenario and its own fresh session; each
  review locks only its own tuple; captures need a real image signature.
- Plugin payload and loaded identity are byte-identical to af150d33: agdf 0.20.0, source 6eeb51bb…,
  runtime 89c28ecb…, MCP dispatcher 61e3e38e…. Only release tooling and tests changed.

## Six-case disposition for aa3e4b02

| Case | Human report | Primary reference | Remaining gap | Next bounded action |
|---|---|---|---|---|
| Codex Desktop session | reported_pass | none | Actual tuple; rollout calls (dispatch, failure_case, skill_continuation) in one fresh Desktop session; app capture; owned scope, consent, discovery, cleanup | Codex Desktop executor with handoff for aa3e4b02 |
| Codex Desktop upgrade | reported_pass | none | Released 0.14.5 baseline (registry sha512-ZC1fPJc0…), production upgrade, fresh session dispatch, preservation, cleanup | Same executor |
| Codex Desktop recovery | reported_pass | none | owned_stale_install repair in its own fresh session, preservation, cleanup | Same executor |
| Claude Desktop Windows session | reported_pass | none | Dedicated isolated Desktop profile with candidate-identical installation, transcript excerpts per call, capture, consent, discovery, cleanup | Windows Claude Desktop executor |
| Claude Desktop Windows upgrade | reported_pass | none | Released baseline transition on Desktop in its own fresh session | Same executor |
| Claude Desktop Windows recovery | reported_pass | none | owned_stale_install on Desktop in its own fresh session | Same executor |

Original handchecks remain unbindable: they were recorded before the schema-2 policy existed in any
commit and name no candidate. Their reported passes stay human_reported.

## Why no targeted observation was executed

The reasons from the af150d33 review still hold: the only Claude Desktop profile on this host is the
daily profile running this session, with a development-local AGDF installation whose plugin source
digest (8f11a04c…) differs from the candidate (6eeb51bb…); installing 0.14.5, upgrading, injecting
stale state or uninstalling would replace or remove that active installation. Codex Desktop is not
installed here. F-001 no longer blocks Claude Desktop captures.

## Executor notes for the next capture

- Use handoff/ from this directory (candidate.json equals CANDIDATE.json).
- Claude Desktop: record session_id as the transcript sessionId; each call's stdout is the unmodified
  transcript lines of that call (entrypoint claude-desktop, no sidechain).
- Codex Desktop: record session_id as the rollout session_meta id; keep the rollout lines in rollouts.
- Compare the transition baseline against BASELINE_REGISTRY_CHECK.json before review.
