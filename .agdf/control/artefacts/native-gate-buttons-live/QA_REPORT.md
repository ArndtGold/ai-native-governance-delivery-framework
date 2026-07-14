# QA Report: Reliable Native Gate-Approval Invocation

- decision: `revise`
- run: `native-gate-buttons-live`
- date: 2026-07-14

## Evidence

- Approved TP is persisted and reviewed in `TP_REVIEW.md`.
- Brownfield Analysis passed; the implementation extends existing owners.
- Clean Implementation Review passed; no workaround, retry loop, parallel
  owner or alternate approval store was introduced.
- Code Review passed with no blocking or revisable findings.
- Runtime integrity, routing, control-state and whitespace checks passed.
- The canonical Runtime Contract and gate-check skill now require one first
  native attempt followed by immediate exact-text fallback.

## Missing evidence

- A bounded live Codex probe has not yet captured visible first-attempt native
  rendering and the immediate fallback branch in the current session.
- A bounded live Claude Code probe has not yet captured whether the first
  eligible attempt renders the control; prior evidence shows it appeared only
  after a follow-up request.
- The final smoke run completed without a captured summary/exit line in the
  current evidence record.

## Risks

- Host-owned presentation may remain unavailable or delayed even though AGDF's
  invocation and fallback contract is now explicit.
- The implementation must not be presented as proof that buttons are visible;
  exact textual approval remains the verified correctness path.

## Required next step

Run the bounded live Codex and Claude probes at a ready gate without mutating
AGDF state, and capture a clean final smoke-test result. If the host still does
not render buttons on the first attempt, record the capability boundary and
close with the immediate text fallback as the supported outcome.

## Impact codes

- `TP_PARTIAL_LIVE_EVIDENCE`
- `HOST_UI_SUPPORTING_EVIDENCE_MISSING`
- `SMOKE_EVIDENCE_CAPTURE_INCOMPLETE`
