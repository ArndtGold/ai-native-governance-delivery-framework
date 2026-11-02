# UR: Fix Surface Parity — approvalValueTransport, defaultPrompt and Descriptions

Status: draft
Gate: UR
Date: 2026-07-16
Owner: agent

## 1. Problem

Three defects in `agdf-plugin.definition.json` create surface asymmetry and an internal
governance contradiction:

1. **`approvalValueTransport: "decorated_label_only"` for all three surfaces** — the
   Runtime Contract says `decorated_label_only` adapters must NOT be invoked for gate
   approvals. But `gateOptions()` sets `label: "Approval: ${gate}"` which IS the exact
   approval value. The actual transport is `exact_option_value`, not `decorated_label_only`.
   The preflight code (`evaluateNativeApprovalCapability`) returns `eligible: false` for
   `decorated_label_only`, contradicting the skill instructions that say to use the native
   adapter.

2. **`defaultPrompt` missing for Claude** — Codex users get starter prompts (proportionality
   check, "Start under AGDF governance", "Create durable control state", "Close with
   auditable report"). Claude users get none. Asymmetry in the same package.

3. **`shortDescription`/`longDescription` are Codex-centric** — both say "Codex-first
   operating system" or "to Codex". These are generic `interface` fields per the Codex
   plugin docs, shown on all surfaces. Claude users see "Codex-first" in their plugin
   description.

## 2. User Need

As a Claude Code user installing the AGDF plugin, I need the same capability declaration,
starter prompts and surface-neutral descriptions as a Codex user, so that the plugin works
correctly and does not privilege one surface over another in the same package.

## 3. Scope

Fix all three defects in `plugin/meta/agdf-plugin.definition.json` and align the Runtime
Contract surface adapter table and test expectations.

### 3.1 Fix `approvalValueTransport`

Change from `decorated_label_only` to `exact_option_value` for `codex`, `claude` and
`opencode` surfaces. The actual behavior is that the option label IS the exact approval
value (`"Approval: <GateName>"`), which is `exact_option_value`.

Update the Runtime Contract surface adapter table: remove the "current canonical
`decorated_label_only` capability uses exact text" caveat for Codex; state that all three
surfaces use `exact_option_value` and native adapters are eligible for invocation.

Update `interaction-presentation-test.js`: the test currently asserts
`decorated_label_only` → `eligible: false`. After the fix, the test must assert
`exact_option_value` → `eligible: true` for all three surfaces. The `decorated_label_only`
rejection test remains for defensive coverage.

### 3.2 Add `defaultPrompt` for Claude

Add the same `defaultPrompt` array under `claude` that exists under `codex`.

### 3.3 Make `shortDescription`/`longDescription` surface-neutral

Rewrite `shortDescription` and `longDescription` to be surface-neutral (not mentioning
"Codex" specifically). Keep `claudeDescription` as-is (it is Claude-specific and correct).

### 3.4 Files Affected

- `plugin/meta/agdf-plugin.definition.json` — 3 fixes
- `plugin/meta/agdf-runtime-contract.md` — surface adapter table update
- `create-agdf/scripts/interaction-presentation-test.js` — test alignment
- `create-agdf/lib/interaction-presentation.js` — no change (already handles
  `exact_option_value` correctly)

## 4. Non-Goals

- No change to `gateOptions()` (already correct — label IS the value).
- No change to `evaluateNativeApprovalCapability` logic (already correct —
  `exact_option_value` returns `eligible: true`).
- No change to gate logic, approval authority or interaction kinds.
- No new surface.

## 5. Acceptance Criteria

1. `approvalValueTransport` is `"exact_option_value"` for `codex`, `claude` and `opencode`.
2. `defaultPrompt` exists under `claude` with the same 4 prompts as `codex`.
3. `shortDescription` and `longDescription` do not mention "Codex" specifically.
4. Runtime Contract surface adapter table reflects `exact_option_value` for all three
   surfaces.
5. `evaluateNativeApprovalCapability` with `exact_option_value` returns `eligible: true`
   for all three surfaces (existing logic already does this — test confirms).
6. `interaction-presentation-test.js` includes assertions that `exact_option_value`
   → `eligible: true` and `native_attempt_required: true`.
7. `decorated_label_only` rejection test still passes (defensive coverage retained).
8. Tests and runtime integrity pass.

## 6. Next Step

Brownfield Review and Mode/Slice Decision.
