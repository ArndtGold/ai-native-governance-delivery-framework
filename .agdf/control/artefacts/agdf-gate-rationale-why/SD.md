# SD: Gate-Rationale-Registry and On-Demand "Why?" Solution Design (Slice B)

Status: approved
Gate: SD
Gate approval: exact `Approval: SD` provided on 2026-07-16 after the SD artefact was persisted and same-run, same-gate and revision revalidation
Revision: 1
Derived from: `.agdf/control/artefacts/agdf-gate-rationale-why/PRD.md`
Date: 2026-07-16
Owner: AGDF

## 1. Solution Overview

Extend the existing locale registry with a `gateRationale` section (deterministic one-liners
per gate/step) and add a `gateRationale()` retrieval function to `interaction-presentation.js`.
Add a Gate-Rationale-Registry contract clause and an on-demand "Why?" interaction clause to
the runtime contract. Add "Why?" response guidance to the gate-check skill. No new gate model,
interaction kind, machine field name, or authority path is introduced.

```
agdf-interaction-locales.json
  └─ locales.{en,de}.gateRationale[gate] ──► deterministic one-liner per gate/step

interaction-presentation.js
  ├─ gateRationale(registry, locale, gate) ──► curated string (deterministic)
  └─ validateLocaleRegistry() ──► enforces gateRationale key parity + budget (automatic via flattenKeys)

agdf-runtime-contract.md
  ├─ §Gate-Rationale-Registry clause (deterministic, localized, curated)
  └─ §On-Demand "Why?" Interaction clause (status kind, non-authorizing, progressive disclosure)

gate-check/SKILL.md
  └─ "Why?" response guidance (status interaction, no approval controls)
```

## 2. Architecture And Ownership

| Concern | Canonical owner | Design rule |
|---|---|---|
| Rationale content | `plugin/meta/agdf-interaction-locales.json` | New `gateRationale` top-level key per locale; 12 keys (6 gates + 6 internal steps); `en` and `de` |
| Rationale retrieval | `create-agdf/lib/interaction-presentation.js` `gateRationale()` | New exported function; returns curated string for given locale + gate; deterministic |
| Rationale validation | `create-agdf/lib/interaction-presentation.js` `validateLocaleRegistry()` | Existing function; `flattenKeys` baseline comparison enforces parity automatically; budget category update needed for `gateRationale` keys |
| Runtime contract | `plugin/meta/agdf-runtime-contract.md` | New subsection in §Native Interaction Contract: §Gate-Rationale-Registry and §On-Demand "Why?" |
| Skill guidance | `plugin/skills/gate-check/SKILL.md` | New "Why?" response block after existing interaction guidance |
| Generated surfaces | `create-agdf/scripts/sync-package-assets.js` | Propagate without forking |
| Regression tests | `create-agdf/scripts/interaction-presentation-test.js` | New assertions for rationale presence, budget, determinism, parity |

## 3. Gate-Rationale-Registry Design (H6)

### 3.1 JSON Structure

Add a `gateRationale` top-level key inside each locale pack (sibling to `gateTitles`,
`gateActionTitles`, `interaction`, `primary`, etc.):

```json
{
  "gateRationale": {
    "UR": "one-liner",
    "PRD": "one-liner",
    "SD": "one-liner",
    "TP": "one-liner",
    "QA": "one-liner",
    "UAT": "one-liner",
    "Brownfield Review": "one-liner",
    "Mode/Slice Decision": "one-liner",
    "Brownfield Analysis": "one-liner",
    "CD+Tests": "one-liner",
    "CR": "one-liner",
    "OR": "one-liner"
  }
}
```

### 3.2 Key Set

The key set matches `gateTitles` (6 user gates) plus 6 internal steps = 12 keys. The
`flattenKeys` baseline comparison in `validateLocaleRegistry` enforces that every locale
pack has the same key set — adding `gateRationale` to `en` makes it mandatory for `de` and
any future locale automatically.

### 3.3 Budget Category

In `validateLocaleRegistry` (line 66–70 of `interaction-presentation.js`), the budget
selection logic currently routes keys to `label` (40), `description` (160), or `title` (100)
based on key patterns:

```js
const budget = key.startsWith("gateTitles.") ? budgets.title
  : key.includes("Description") || key.includes("fallbackReasons") || key.startsWith("primary.actions.") || key.startsWith("primary.afterApproval.") || key.startsWith("primary.narration.") || key === "primary.quality"
    ? budgets.description
    : budgets.label;
```

Add `gateRationale` keys to the `description` budget category by adding
`|| key.startsWith("gateRationale.")` to the description condition. This enforces the 160-char
budget on all rationale strings.

### 3.4 Curated Content (en)

| Key | Rationale (en) |
|---|---|
| `UR` | "UR clarifies what you want, why and for whom — before anything gets built that nobody needed." |
| `PRD` | "PRD defines product behavior before the solution design locks it in." |
| `SD` | "Solution design fixes ownership, architecture and dependencies — before code makes them permanent." |
| `TP` | "Task plan makes acceptance criteria and tests binding, so QA can measure later." |
| `QA` | "QA evaluates real evidence before a release relies on assumptions." |
| `UAT` | "UAT requires deliberate acceptance before the run counts as delivered." |
| `Brownfield Review` | "Checks whether existing systems, owners and conventions are affected, so nothing breaks or duplicates." |
| `Mode/Slice Decision` | "Decides the proportionate delivery scope, so the process fits the change — not the other way around." |
| `Brownfield Analysis` | "Verifies reuse paths, owners and regression risk before code exists." |
| `CD+Tests` | "Implementation and tests produce evidence — not just code." |
| `CR` | "Code review is mandatory before QA decides." |
| `OR` | "The delivery report makes the run auditable — not just claimed." |

### 3.5 Curated Content (de)

| Key | Rationale (de) |
|---|---|
| `UR` | "UR klärt, was du willst, warum und für wen — bevor etwas gebaut wird, das niemand brauchte." |
| `PRD` | "PRD definiert das Produktverhalten, bevor das Lösungsdesign es zementiert." |
| `SD` | "Lösungsdesign legt Ownership, Architektur und Abhängigkeiten fest — bevor Code sie faktisch zementiert." |
| `TP` | "Taskplan macht Akzeptanzkriterien und Tests verbindlich, damit QA später messen kann." |
| `QA` | "QA bewertet die echten Nachweise, bevor eine Freigabe auf Vermutungen basiert." |
| `UAT` | "UAT verlangt eine bewusste Abnahme, bevor der Lauf als geliefert gilt." |
| `Brownfield Review` | "Prüft, ob bestehende Systeme, Owners und Konventionen betroffen sind, damit nichts kaputt geht oder doppelt entsteht." |
| `Mode/Slice Decision` | "Entscheidet den angemessenen Lieferumfang, damit der Prozess zur Veränderung passt — nicht umgekehrt." |
| `Brownfield Analysis` | "Verifiziert Wiederverwendung, Owners und Regressionstests, bevor Code existiert." |
| `CD+Tests` | "Implementierung und Tests liefern Nachweise — nicht nur Code." |
| `CR` | "Code-Review ist verpflichtend, bevor QA entscheidet." |
| `OR` | "Der Lieferbericht macht den Lauf auditierbar — nicht nur behauptet." |

### 3.6 Budget Verification

All 12 strings in both `en` and `de` are under 160 characters. The longest is the German
`Brownfield Review` rationale at 107 chars. Budget compliance is verified by
`validateLocaleRegistry` after the budget category update.

## 4. gateRationale() Retrieval Function (H6)

### 4.1 Signature

```js
export function gateRationale(registry, requestedLocale, gate) {
  const pack = localePack(registry, requestedLocale);
  return pack.gateRationale?.[gate] || String(gate || "");
}
```

### 4.2 Behaviour

- Resolves the locale pack using the existing `resolvePresentationLocale` → `localePack`
  chain (exact complete pack, language subtag, English fallback).
- Returns the curated string for the given gate from the resolved pack's `gateRationale`
  section.
- Falls back to the raw gate name if the key is missing (defensive; should not occur when
  `validateLocaleRegistry` passes).
- Deterministic: same inputs → same output.

### 4.3 "Why?" Interaction Additions to Locale Registry

Add a `why` block inside each locale's `interaction` section:

```json
"why": {
  "label": "Warum?",
  "fulfilledPrefix": "Erfüllt:",
  "protectsPrefix": "Schützt vor:"
}
```

For `en`:

```json
"why": {
  "label": "Why?",
  "fulfilledPrefix": "Fulfilled:",
  "protectsPrefix": "Protects against:"
}
```

These are presentation labels for the "Why?" response, not new interaction kinds or
approval options. The `why.label` is the trigger label; `fulfilledPrefix` and
`protectsPrefix` structure the fulfilled/protects line.

## 5. On-Demand "Why?" Interaction Design (H7)

### 5.1 Interaction Kind

The "Why?" response is a `status` interaction per the existing Native Interaction Contract.
It does not request a decision, does not display approval controls, and does not advance
any gate.

### 5.2 Trigger

The user explicitly asks "why?" or "Warum?" (case-insensitive) at any gate or internal
step. The agent classifies this as a `status` interaction, not a `gate_approval`.

### 5.3 Response Composition

The "Why?" response is composed deterministically from existing state:

1. **Rationale line:** `gateRationale(registry, locale, currentGate)` — the curated
   one-liner.
2. **Fulfilled line:** Composed from the selected run's Approvals table and artefact
   status. Example: "Fulfilled: UR approved, PRD approved." The agent reads this from
   `RUN_STATE.md` — it does not generate it.
3. **Protects line:** Composed from the runtime contract's gate description. The agent
   pulls the protects-against information from the rationale itself or from the
   existing `primary.actions` locale key — it does not generate new prose.

The response format:

```text
<rationale one-liner>

Fulfilled: <what is already done at this gate>
Protects against: <what this gate specifically prevents>
```

### 5.4 Separation Contract

- The `gate_approval` options from `gateOptions()` remain exactly
  `approve | revise | decline` (+ optional `cancel`). No "why" option.
- The "Why?" response never enters `APPROVAL_SEQUENCE`.
- `validateApprovalOrientationSnapshot` is unchanged.
- The "Why?" response is emitted as a separate assistant message, not merged with the
  approval envelope.

### 5.5 Runtime Contract Clause

Add a new subsection in §Native Interaction Contract:

```markdown
### Gate-Rationale-Registry

The locale registry contains a deterministic, localized `gateRationale` section with one
curated one-liner per gate and internal step. The agent retrieves rationale strings via
`gateRationale()`; it does not generate rationale prose. Rationale strings are the same
across invocations for the same gate and locale.

### On-Demand "Why?" Interaction

When the user asks "why?" at any gate or internal step, the agent responds with a
`status` interaction containing the curated rationale (Gate-Rationale-Registry) plus one
line of fulfilled/protects context composed from existing state. The response is
deterministic, non-authorizing, and does not display approval controls. It is a separate
interaction, never merged with the `gate_approval` sequence. Default output is unchanged
when the user does not ask.
```

### 5.6 Gate-Check Skill Guidance

Add a block after the existing Native Interaction Path guidance in `gate-check/SKILL.md`:

```markdown
### On-Demand "Why?" Response

When the user asks "why?" or "Warum?" at any gate or internal step, respond with a
`status` interaction (not `gate_approval`):
1. Pull the curated rationale from `gateRationale()` in the resolved locale.
2. Compose one fulfilled line from the selected run's Approvals table and artefact status.
3. Compose one protects-against line from the gate's rationale and the existing
   `primary.actions` copy.
4. Do not show approval controls. Do not advance any gate. Do not merge with the
   approval envelope.
The response is deterministic: same gate, same question, same answer.
```

## 6. validateLocaleRegistry Changes

### 6.1 Budget Category Update

In `validateLocaleRegistry` (line 66–70), add `gateRationale` keys to the `description`
budget:

```js
const budget = key.startsWith("gateTitles.") ? budgets.title
  : key.includes("Description") || key.includes("fallbackReasons") || key.startsWith("primary.actions.") || key.startsWith("primary.afterApproval.") || key.startsWith("primary.narration.") || key.startsWith("gateRationale.") || key.startsWith("interaction.why.") || key === "primary.quality"
    ? budgets.description
    : budgets.label;
```

### 6.2 Key Parity

No explicit change needed. The existing `flattenKeys` baseline comparison (line 63)
automatically enforces that all locale packs have the same key set, including the new
`gateRationale` and `interaction.why` keys.

### 6.3 Required Gate Title Keys

The existing check (lines 72–75) validates `gateTitles` and `gateActionTitles` for
REQUIRED_GATES. No change needed — `gateRationale` is covered by the `flattenKeys`
parity check.

## 7. Non-Overlapping File Sections

| File | This slice adds | `agdf-state-orientation` owns | `agdf-human-decision-surface` owns |
|---|---|---|---|
| `agdf-interaction-locales.json` | `locales.{en,de}.gateRationale` (new top-level key); `locales.{en,de}.interaction.why` (new sub-key) | `statusCard.breadcrumb*`, `primary.narration`, `internalStateLabels` | `statusCard`, `interaction`, `primary.afterApproval` (existing keys) |
| `agdf-runtime-contract.md` | §Gate-Rationale-Registry, §On-Demand "Why?" Interaction (new subsections in §Native Interaction Contract) | §Breadcrumb, §Post-Acceptance Narration, §Internal-State Collapse (new subsections in §Run Status Card) | §Gate Transition Card, §Human Decision Presentation (existing) |
| `gate-check/SKILL.md` | "On-Demand 'Why?' Response" block (new, after Native Interaction Path) | Breadcrumb rendering, narration guidance, collapse rules | Approval-time card composition, native-attempt preflight |
| `interaction-presentation.js` | `gateRationale()` (new exported function); `validateLocaleRegistry` budget condition update (one line) | `buildBreadcrumb()`, `buildTransitionNarration()`, `collapseInternalState()` | `buildApprovalOrientationSnapshot()`, `attachApprovalOrientationSnapshot()` |

## 8. Regression Test Plan

| Test | What it asserts |
|---|---|
| Rationale key presence | Both `en` and `de` packs contain `gateRationale` with all 12 keys |
| Rationale budget | All rationale strings are within `lengthBudgets.description` (160 chars) |
| Rationale determinism | `gateRationale(registry, "de", "UR")` returns the same string across calls |
| Rationale fallback | `gateRationale(registry, "fr", "UR")` returns the English fallback |
| Parity failure | Removing `gateRationale` from `de` causes `validateLocaleRegistry` to return `valid: false` |
| `why` key presence | Both `en` and `de` packs contain `interaction.why` with `label`, `fulfilledPrefix`, `protectsPrefix` |
| `why` budget | `why` strings are within budget |
| Approval options unchanged | `gateOptions()` still returns exactly `approve | revise | decline`; no "why" option |
| Snapshot validation | `validateApprovalOrientationSnapshot` still passes for all 6 user gates |

## 9. Risks

- **Sequencing:** If `agdf-state-orientation` or `agdf-human-decision-surface` modify
  `validateLocaleRegistry`'s budget condition simultaneously, a merge conflict is
  possible. Mitigation: the change is a single-line addition to an existing condition.
- **Locale budget:** All 12 strings verified under 160 chars. The budget check enforces
  this automatically.
- **"Why?" non-overlap:** Tests assert `gateOptions()` is unchanged and
  `validateApprovalOrientationSnapshot` is unaffected.

## 10. Required Next Step

Review this SD and approve it only with:

`Approval: SD`
