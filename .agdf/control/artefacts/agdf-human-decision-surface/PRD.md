# PRD: Human-Centered Primary Decision Surface

Status: approved
Gate: PRD
Gate approval: `Approval: PRD` provided through deliberate native selection on 2026-07-14
Based on: `.agdf/control/artefacts/agdf-human-decision-surface/UR.md`; `.agdf/control/artefacts/agdf-human-decision-surface/BROWNFIELD_REVIEW.md`
Date: 2026-07-14
Owner: AGDF

## 1. Product Outcome

AGDF primary interactions explain what the user needs to understand or decide without exposing the internal representation of the control state. The existing fail-closed gate model, exact approvals and machine-readable reports remain unchanged.

## 2. Presentation Model

AGDF will maintain one canonical control-state model with three derived presentation layers:

| Layer | Purpose | Allowed content |
|---|---|---|
| Primary decision surface | Normal chat and approval interaction | Human-readable position, decision, consequence, blocker and next action |
| Detail surface | User-requested status or troubleshooting | Readable labels, selected run, artefacts, evidence and diagnostic explanation |
| Machine surface | CLI JSON, CI and integrations | Existing canonical fields, including snake_case keys and diagnostic codes |

The primary surface must never render the machine surface or the full detail surface by default. Locale presentation is data-driven and extensible; `de` and `en` are initial packs, not a structural language limit.

## 3. State-Specific User Experience

### 3.1 Ready user gate

Reuse the existing three-part Gate Transition Card: human-readable gate title and selected run context; readiness and exact approval effect; immediate next action and next actual user decision. The exact value `Approval: <GateName>` remains unchanged.

### 3.2 Clarification required

Explain the missing choice in plain language, name competing human-readable work items where available, and state that no gate approval or implementation can proceed until the choice is made. Do not present a gate-approval question.

Example:

> Mehrere Vorhaben sind aktiv. Bitte wähle zuerst, an welchem Vorhaben wir weiterarbeiten sollen. Danach prüft AGDF den Zustand erneut.

### 3.3 Blocked state

State what is missing, why AGDF cannot continue, and the single resolution action. Translate known diagnostic conditions such as active-run ambiguity into user language; retain the diagnostic code only in detail or machine output.

### 3.4 Status request or progress update

Give a compact answer about the current position, what is allowed now and the next useful action. Do not expose `next_user_gate`, `mode_slice_decision`, `required_next_gate` or similar keys in the primary response.

## 4. Functional Requirements

1. Every primary interaction answers the relevant subset of: where are we, what is possible now, what decision is needed, what happens next, and why are we blocked.
2. Internal field names and raw diagnostic codes are prohibited in primary copy.
3. The user-facing mapping is derived from the canonical report; no second state model or approval authority is introduced.
4. The exact approval formula remains `Approval: <GateName>` in every locale.
5. Internal mandatory steps are described as agent actions, never as additional user gates.
6. Run identifiers remain available as secondary context, but human-readable titles are preferred; when no title exists, a concise safe fallback is used.
7. German presentation is used for `chat=de`; absent or unsupported locales use English consistently.
8. CLI/JSON output remains backward compatible.
9. Existing native adapters, exact-text fallback and host authority boundaries remain unchanged.
10. Visible gate titles, option labels, option descriptions and fallback explanations use the active language pack; the exact approval value remains unchanged.
11. Language packs use standard language tags and a documented fallback order; adding a pack does not change gate logic or adapter contracts.
12. Button order and recommendation are stable, with no auto-selection, auto-submission or skip/bypass action.
13. Host-owned UI chrome is not translated or semantically mixed with AGDF chat language.
14. Labels and descriptions remain unambiguous for long translations, narrow layouts and assistive technologies.
15. Missing response, timeout, cancellation, empty response and explicit decline remain distinct non-equivalent outcomes.
16. A deterministic human-readable run-title fallback exists when only a `run_id` is available.
17. Only an exact, revalidated `Approval: <GateName>` may authorize a transition; labels, order and button position never authorize it.
18. Every primary chat card shows compact links for the durable `UR`, `PRD`, `SD` and `TP` artefacts whenever the corresponding artefact exists.
19. Missing artefacts are shown as `not yet created` or the configured localized equivalent; the card must never render a broken, guessed or non-existent link.
20. Artefact links use stable repository-relative ownership and readable labels (`UR`, `PRD`, `SD`, `TP`); raw internal paths are not shown as the primary label.
21. The same artefact-link semantics apply to native-card context, exact-text fallback and human-readable CLI output where links are supported; machine JSON retains canonical paths.

## 5. Acceptance Criteria

- Ready-gate approval continues to use the existing Gate Transition Card and exact approval token.
- Ambiguous-run, missing-artefact and missing-approval fixtures produce plain-language clarification/blocker copy without a native gate question.
- Status output in the primary interaction contains no raw snake_case keys, diagnostic codes, Markdown dashboard tables or internal gate-field vocabulary.
- Detail and machine surfaces still expose the information required for troubleshooting, CI and audit.
- TP approval and other internal-step transitions do not ask for a false second user approval.
- German and English-default fixtures preserve identical authority and transition semantics.
- Generated surfaces remain aligned with canonical sources.
- Native option payloads, localized gate titles, button ordering, fallback text and semantic outcome mappings are tested for multiple language packs.
- Tests cover `UR`, `PRD`, `SD`, `TP`, `QA`, `UAT`, internal steps and status-only interactions that must not request approval.
- Accessibility fixtures or checks cover stable names and long-label behavior without relying on color, position or truncation.
- Chat-card fixtures verify clickable `UR`, `PRD`, `SD` and `TP` links for existing artefacts, plus explicit non-link states for missing artefacts.
- Runtime-integrity, control-state, routing, package smoke and whitespace checks pass.

## 6. Non-Goals

- No new gate, approval syntax, persistence format or automatic run-selection policy.
- No custom UI renderer, dashboard redesign or host-control replacement.
- No removal or renaming of machine-readable fields.
- No changes to product responsibility, human UAT or release authority.
- No reopening of the declined UAT in `native-gate-buttons-live`; this slice creates its own acceptance evidence.

## 7. Source Of Truth And Ownership

- Presentation semantics: `plugin/meta/agdf-runtime-contract.md`
- Agent interaction guidance: `plugin/skills/gate-check/SKILL.md`
- Surface capability declaration: `plugin/meta/agdf-plugin.definition.json`
- Human CLI projection: `create-agdf/bin/create-agdf.js`
- Generated propagation: `create-agdf/scripts/sync-package-assets.js`
- Integrity and negative presentation checks: `plugin/scripts/check-runtime-integrity.mjs` and `create-agdf/scripts/runtime-integrity-negative-test.js`

## 8. Risks And Open Questions

- The exact boundary between primary and detail output must be stable across agent surfaces.
- Human-readable run titles may require a deterministic fallback from objective text or run ID.
- Existing tests protect approval-time leakage; new fixtures must cover clarification and blocked paths without weakening machine-output coverage.

## 9. Next Step

Review this PRD and approve only with:

`Approval: PRD`
