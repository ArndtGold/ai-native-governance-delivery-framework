# UR: Fix Codex Plugin Manifest Author Mismatch Breaking CI

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided in session on 2026-07-10
Date: 2026-07-10
Owner: agent

## 1. Problem

`node plugin/scripts/check-runtime-integrity.mjs` fails with "Codex plugin manifest author must
match canonical AGDF plugin definition" because `plugin/.codex-plugin/plugin.json` has
`author.name: "Arndt Gold"` while the canonical `plugin/meta/agdf-plugin.definition.json` still has
`author.name: "AI-native Governance & Delivery Framework"`. This was introduced by commit `12f9cd3`
("chore: update author name in plugin.json"), which updated one file but not the other.

Confirmed via the live CI run for commit `2a96edf` on `origin/main`
(`.github/workflows/agdf-guardrails.yml`, job "verify"): the "Verify runtime integrity" step fails,
and every subsequent step (`Verify create-agdf package`, `Verify agdf CLI package`, `Install Pages
dependencies`, `Verify Pages`) is skipped as a result. Reproduced locally and in an isolated worktree
at commit `12f9cd3` (before any work from this session), confirming the defect pre-dates and is
unrelated to the `gate-state-clarity` and `create-agdf-lib-test-coverage` runs.

## 2. Goal

Make the Codex plugin manifest author consistent with the canonical AGDF plugin definition again, so
`agdf-guardrails.yml` passes on `main` and downstream CI steps (including both packages' smoke tests)
actually run instead of being skipped.

## 3. Scope

- In scope: reconcile `author.name` (and `author` fields generally, if other sub-fields also diverge)
  between `plugin/meta/agdf-plugin.definition.json` and `plugin/.codex-plugin/plugin.json` so
  `check-runtime-integrity.mjs` passes.
- Determine which value is authoritative: `plugin/meta/agdf-plugin.definition.json` is documented as
  the canonical source (`SOT_REGISTRY.md`: "Skill routing | plugin/meta/agdf-plugin.definition.json |
  active"), so the default assumption is that `.codex-plugin/plugin.json` should be updated to match
  it — but Brownfield Review should confirm this is what the original author-name change intended,
  rather than assuming the newer commit's value should instead become canonical.

## 4. Non-Goals

- No other change to plugin metadata, skill routing or runtime contract content.
- Not fixing or re-running CI itself — only the source defect that breaks it.
- Not addressing the earlier finding that CI never actually exercised the `create-agdf-lib-test-coverage`
  unit tests or the `gate-state-clarity` implementation checks — that remains open until this fix lands
  and a subsequent CI run passes past the integrity-check step.

## 5. Acceptance Signals

- `node plugin/scripts/check-runtime-integrity.mjs` passes locally.
- `agdf-guardrails.yml`'s "verify" job reaches and passes all steps (not just "Verify runtime integrity")
  on the next push.

## 6. Existing Source Of Truth

- `.agdf/control/SOT_REGISTRY.md` (names `agdf-plugin.definition.json` as the active skill-routing SoT)
- `plugin/scripts/check-runtime-integrity.mjs` (the check that enforces this consistency)
- Commit `12f9cd3` (the change that introduced the divergence)

## 7. Risks And Unknowns

- Whether "Arndt Gold" or "AI-native Governance & Delivery Framework" is the actually-intended author
  value going forward — Brownfield Review should check commit `12f9cd3`'s intent rather than assume.
- Whether other generated/derived copies of plugin metadata (e.g. Copilot/OpenCode variants) also need
  reconciling, or only these two files.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
