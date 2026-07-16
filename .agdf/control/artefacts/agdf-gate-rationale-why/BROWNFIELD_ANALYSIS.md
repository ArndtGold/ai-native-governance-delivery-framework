# Brownfield Analysis: Pre-Implementation Verification (Slice B)

Status: done
Mode: pre_implementation_analysis
Date: 2026-07-16
Owner: agent

## 1. Decision

- decision: pass

## 2. Scope

Verify the implementation path for the approved TP (GRW-01 through GRW-08) against the
actual code before CD+Tests.

## 3. Evidence

### Reuse path verification

| Task | Target | Confirmed | Location |
|---|---|---|---|
| GRW-01 | `agdf-interaction-locales.json` `locales.{en,de}` | yes | Top-level `locales.en` and `locales.de` exist; `gateRationale` will be a new sibling key to `gateTitles`, `gateActionTitles` |
| GRW-02 | `agdf-interaction-locales.json` `locales.{en,de}.interaction` | yes | `interaction` section exists in both locales with `ready`, `approveHeading`, etc.; `why` will be a new sub-key |
| GRW-03 | `interaction-presentation.js` after `gateTitle()` (line 96) | yes | `gateTitle()` at line 96 follows the exact pattern `gateRationale()` will use: `localePack(registry, requestedLocale).X[gate]` |
| GRW-04 | `interaction-presentation.js` `validateLocaleRegistry` budget condition (line 66-68) | yes | Budget condition at lines 66-68 is a single expression; adding `|| key.startsWith("gateRationale.") || key.startsWith("interaction.why.")` to the description branch is a one-line extension |
| GRW-05 | `agdf-runtime-contract.md` §Native Interaction Contract | yes | Section exists; new subsections will be appended |
| GRW-06 | `gate-check/SKILL.md` after Native Interaction Path | yes | Native Interaction Path section exists; new block will follow it |
| GRW-07 | `interaction-presentation-test.js` | yes | Existing tests at lines 29-257; new assertions will be appended before the final `console.log` |
| GRW-08 | `sync-package-assets.js` | yes | Copies `plugin/meta/` verbatim to generated tree; no change needed to the script itself |

### Owner verification

No conflicting ownership. All target files are owned by the AGDF framework. No other active
run modifies the exact same functions or JSON keys:
- `gateRationale` is a new top-level key — no other run adds it.
- `interaction.why` is a new sub-key — no other run adds it.
- `gateRationale()` is a new function — no other run defines it.
- The `validateLocaleRegistry` budget condition change is a one-line addition to an
  existing condition — no other run modifies the exact same line.

### Regression risk

Low. All changes are additive:
- New JSON keys (no existing keys removed or renamed).
- New exported function (no existing function signature changed).
- One-line extension to an existing condition (no logic removed).
- New test assertions (no existing assertions weakened or skipped).

### Parallel-structure risk

None. The "Why?" interaction uses the existing `status` kind. No new interaction kind, no
new approval option, no new sequence step.

## 4. Missing Evidence

None. All target locations confirmed.

## 5. Risks

- The `flattenKeys` baseline comparison will include `gateRationale` and `interaction.why`
  keys automatically once added to the `en` pack. If `de` is not updated simultaneously,
  validation fails — this is intended and tested (GRW-T05).

## 6. Required Next Step

Proceed to CD+Tests: implement GRW-01 through GRW-07, then run verification (GRW-08).
