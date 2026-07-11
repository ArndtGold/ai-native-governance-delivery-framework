# UR: Enforce Run Status Card in Claude Code

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided on 2026-07-11
Date: 2026-07-11
Owner: agent

## 1. Problem

The AGDF Claude Code plugin can discover the shared runtime contract, skills and SessionStart hook, but it does not reliably cause Claude Code to render the complete Run Status Card. The immediate `gate-check` output contract omits fields required by the shared runtime contract, while the SessionStart hook points to other sources without directly establishing the Run Status Card contract. In addition, Claude Code's plugin validator rejects the current `brownfield-analysis` skill frontmatter, weakening confidence that the packaged plugin will install and load cleanly.

## 2. Goal

Make an installed AGDF plugin cause Claude Code to apply the same canonical Run Status Card semantics as the other supported surfaces, with deterministic validation that the packaged plugin is structurally valid and that gate-facing output exposes the required human-readable projection.

## 3. Scope

- Align Claude Code's effective `gate-check` instructions with the canonical Run Status Card fields in `plugin/meta/agdf-runtime-contract.md`.
- Preserve the Runtime Contract as the single semantic source of truth and avoid a Claude-specific gate model.
- Fix Claude plugin validation defects that prevent clean package validation.
- Add the smallest relevant automated checks for Claude plugin structure, skill metadata and Run Status Card propagation.
- Review whether the SessionStart/router path provides sufficient runtime-contract reachability for Claude Code and strengthen it only where evidence requires.

## 4. Non-Goals

- Introduce a Claude-only Run Status Card schema.
- Display a status card on every unrelated Claude Code response.
- Change AGDF gate order, approval semantics or Context Graph semantics.
- Install, authenticate or modify the user's Claude Code configuration.
- Expand the work into general Claude plugin redesign.

## 5. Acceptance Signals

- `claude plugin validate plugin` passes for the packaged plugin.
- Claude Code discovers all intended AGDF skills and the SessionStart hook from the packaged plugin.
- A gate-facing Claude Code invocation is instructed to present the complete readable Run Status Card required by the shared Runtime Contract, including `Blocked by` and `Quality outlook` where applicable.
- Automated repository validation detects regressions in Claude skill frontmatter and Run Status Card propagation.
- Existing Codex, Copilot and OpenCode behavior remains coherent and relevant runtime/package checks pass.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-runtime-contract.md`
- `plugin/meta/agdf-agent-router.md`
- `plugin/meta/agdf-plugin.definition.json`
- `plugin/skills/gate-check/SKILL.md`
- `plugin/hooks/hooks.json`
- `plugin/hooks/session-start.sh`
- `plugin/scripts/check-runtime-integrity.mjs`
- `.agdf/control/CONTEXT_GRAPH.md` (`CG-RUN-STATUS-CARD`)

## 7. Risks And Unknowns

- Brownfield Review must determine whether the defect is shared skill-contract drift, Claude packaging drift, or both.
- A real model-level probe requires an authenticated Claude Code session; structural and deterministic checks must remain useful without authentication.
- Strengthening always-on instructions may increase token cost or duplicate the canonical Runtime Contract.
- Fixing only the observed YAML error could hide other Claude-specific parser differences unless validation covers every packaged skill.

## 8. Next Step

Run the post-UR Brownfield Review and record the Mode / Slice Decision before implementation.
