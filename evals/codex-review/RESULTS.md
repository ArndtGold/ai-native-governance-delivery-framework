# First local comparison — 2026-10-26

The runner completed twelve real account-backed Codex CLI sessions: six synthetic
cases, each reviewed in a fresh session using a standard or critical prompt.
Configured model: `gpt-6.1-sol`; reasoning: `high`; CLI: `0.163.0`;
platform: macOS (`darwin/x64`); Node: `22.22.3`. Server-side model resolution was
not independently observed. No AGDF operation or control-state mutation occurred.

| Observation | Standard reviewer | Critical reviewer |
|---|---:|---:|
| Valid sessions after offline event audit | 6/6 | 6/6 |
| Expected problem obligations matched | 3/3 | 3/3 |
| Expected obligations missed | 0 | 0 |
| Defective cases reported as clean | 0 | 0 |
| Additional unmatched findings | 2 | 0 |
| Redundant findings against an already matched obligation | 1 | 0 |
| Correct cases receiving a finding | 1/3 | 0/3 |
| Summed session wall time | 78.492 s | 69.162 s |
| Reported input tokens | 58,815 | 59,141 |
| Reported output tokens | 1,836 | 1,353 |

All twelve event streams contained no model tool/action items. Findings echoed
their packet digest and supplied verifiable source-line quotations. The hidden
trusted checks distinguished the boundary, retry and evidence defects from their
correct counterparts before the live run.

## What the outputs actually show

Both reviewers identified the inclusive-boundary defect, the duplicate write on
retry, and the mismatched browser evidence. The critical reviewer combined the
two evidence mismatches into one finding; the standard reviewer separated them.

The standard reviewer also noted missing executed retry coverage in C03 and C04.
Those observations accurately describe the supplied test evidence, even though
the oracle requires no behavioral finding for the correct C04 implementation.
They are not established false positives. The original proxy counted unmatched
and duplicate findings as false positives; qualitative inspection exposed that
overstatement. The corrected assessor reports them separately and leaves precision
and false-positive rate unavailable pending independent adjudication.

This comparison demonstrates working packet binding, structured output and trace
validation. It does **not** establish that the critical prompt improves defect
detection, lowers rework or outperforms the current AGDF review process. Both
variants are separate fresh reviewers; neither is an implementer's self-review.
One run with tiny visible examples cannot support general quality or speed claims.
Actual monetary cost and human rework were not measured.

## Capture and audit history

An initial restricted-sandbox attempt failed before a model turn because the CLI
could not initialize its in-process app server. It was retained separately.

The subsequent twelve-session capture initially rejected two pre-turn host notices
serialized by CLI 0.163.0 as `item.type=error`: the notice for the explicitly enabled
skill-discovery exclusion and the notice that the disabled code-mode host makes
code mode unavailable. Neither notice is a model tool action. The assessor now
recognizes only those identified pre-turn notices, preserves them in the report,
and continues to reject unknown errors and tool/action items.

All model responses were retained without rerunning any cell. Offline assessments
write new derived reports and preserve the original report, prompts, final JSON
and event streams. The latest local assessment links source and input digests:

- [Original local capture](../../probe-results/codex-review-2026-10-26-live/REPORT.md)
- [Derived assessment](../../probe-results/codex-review-2026-10-26-verified/REPORT.md)
- [Structured assessment and input digests](../../probe-results/codex-review-2026-10-26-verified/report.json)

Raw captures are local ignored `probe-results/` files, not included in a checkout
or a release qualification bundle. Source digests in the JSON are SHA-256 over
`JSON.stringify(value)`; packet and assessment reproduction use that same rule.

The next useful comparison needs representative held-out changes, independently
adjudicated findings and a baseline for actual developer review effort. Product
integration would additionally require current Run/revision/code binding and the
existing AGDF review/QA writers; this pilot does not supply that integration.
