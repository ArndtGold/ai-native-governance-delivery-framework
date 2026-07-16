# PRD: Gate-Rationale-Registry and On-Demand "Why?" Interaction (Slice B)

Status: approved
Gate: PRD
Gate approval: exact `Approval: PRD` provided on 2026-07-16 after the PRD artefact was persisted and same-run, same-gate and revision revalidation
Date: 2026-07-16
Derived from: `.agdf/control/artefacts/agdf-gate-rationale-why/UR.md`
Based on Brownfield Review: `.agdf/control/artefacts/agdf-gate-rationale-why/BROWNFIELD_REVIEW.md`

## 1. Product Outcome

AGDF users encountering a gate can ask "why?" and receive a deterministic, curated
one-line rationale for why the gate exists — plus one line of fulfilled/protects context —
without flooding the default output. The rationale is the same every time for the same
gate (not generated), localized to the configured chat language, and available on demand
only. Default card output is unchanged when the user does not ask.

## 2. State Contract

### 2.1 Gate-Rationale-Registry (H6)

A `gateRationale` section is added to `agdf-interaction-locales.json` with one deterministic,
localized one-liner per gate and per internal step.

Keys (same set for every locale pack, enforced by existing `flattenKeys` parity):

| Key | Gate / Step | Example (de) |
|---|---|---|
| `UR` | User requirements | "UR klärt, was du willst, warum und für wen — bevor etwas gebaut wird, das niemand brauchte." |
| `PRD` | Product requirements | "PRD definiert das Produktverhalten, bevor das Lösungsdesign es zementiert." |
| `SD` | Solution design | "Lösungsdesign legt Ownership, Architektur und Abhängigkeiten fest — bevor Code sie faktisch zementiert." |
| `TP` | Task and test plan | "Taskplan macht Akzeptanzkriterien und Tests verbindlich, damit QA später messen kann." |
| `QA` | Quality assurance | "QA bewertet die echten Nachweise, bevor eine Freigabe auf Vermutungen basiert." |
| `UAT` | User acceptance | "UAT verlangt eine bewusste Abnahme, bevor der Lauf als geliefert gilt." |
| `Brownfield Review` | Internal step | "Prüft, ob bestehende Systeme, Owners und Konventionen betroffen sind, damit nichts kaputt geht oder doppelt entsteht." |
| `Mode/Slice Decision` | Internal step | "Entscheidet den angemessenen Lieferumfang, damit der Prozess zur Veränderung passt — nicht umgekehrt." |
| `Brownfield Analysis` | Internal step | "Verifiziert Wiederverwendung, Owners und Regressionstests, bevor Code existiert." |
| `CD+Tests` | Internal step | "Implementierung und Tests liefern Nachweise — nicht nur Code." |
| `CR` | Internal step | "Code-Review ist verpflichtend, bevor QA entscheidet." |
| `OR` | Internal step | "Der Lieferbericht macht den Lauf auditierbar — nicht nur behauptet." |

Trade-off: a one-liner cannot explain the full protective function. The user needs enough
to accept that the gate makes sense. Deeper context stays on demand (H7).

### 2.2 On-Demand "Why?" Interaction (H7)

The "Why?" response is a `status` interaction — no new `interaction_kind`. It is
non-authorizing, deterministic and never part of the `gate_approval` sequence.

**Trigger:** The user asks "why?" or "Warum?" at any gate or internal step.

**Response (deterministic):**

1. The curated one-liner from `gateRationale` (H6).
2. One line stating what is already fulfilled at this gate and what this gate specifically
   protects against — composed from existing state (Approvals table, artefact status) and
   the rationale.

**Separation contract:**

- The `gate_approval` options remain exactly `approve | revise | decline | cancel`.
- The "Why?" response never appears inside the approval question's option list.
- The "Why?" response never breaks `APPROVAL_SEQUENCE` or
  `validateApprovalOrientationSnapshot`.
- The "Why?" response is emitted as a separate `status` interaction, before or after the
  approval envelope, never merged into it.
- No approval controls are shown in the "Why?" response.

**Determinism:** same gate, same question → same answer. The agent does not generate
rationale prose; it pulls the curated string and composes the fulfilled/protects line from
existing state.

### 2.3 Machine Contract Preservation

- No new CLI-JSON field name is added.
- No new `interaction_kind`.
- No new persisted state field.
- `doctor --json`, `gate-check --json` and `delivery-map --json` remain compatible.
- `validateLocaleRegistry` enforces `gateRationale` key parity across all locale packs.

## 3. Functional Requirements

- **PRD-01 Rationale registry:** `agdf-interaction-locales.json` contains a `gateRationale`
  section in both `en` and `de` with one localized string per gate (`UR`, `PRD`, `SD`, `TP`,
  `QA`, `UAT`) and per internal step (`Brownfield Review`, `Mode/Slice Decision`,
  `Brownfield Analysis`, `CD+Tests`, `CR`, `OR`).
- **PRD-02 Rationale budget:** Each rationale string stays within `lengthBudgets.description`
  (160 chars). Budget enforcement is automatic via the existing `validateLocaleRegistry`
  budget check.
- **PRD-03 Rationale determinism:** A `gateRationale(registry, requestedLocale, gate)`
  function returns the same string for the same inputs across invocations.
- **PRD-04 Locale parity:** `validateLocaleRegistry` enforces `gateRationale` key parity
  across all locale packs via the existing `flattenKeys` baseline comparison. A missing
  `gateRationale` in one locale causes a validation error.
- **PRD-05 "Why?" interaction kind:** The "Why?" response uses the existing `status`
  interaction kind. No new `interaction_kind` is introduced.
- **PRD-06 "Why?" non-overlap:** The "Why?" response never enters the `gate_approval`
  option list, never breaks `APPROVAL_SEQUENCE`, and never passes
  `validateApprovalOrientationSnapshot` as an approval.
- **PRD-07 "Why?" determinism:** The "Why?" response is deterministic: same gate, same
  question → same curated rationale. The fulfilled/protects line is composed from existing
  state, not generated.
- **PRD-08 Default output unchanged:** When the user does not ask "why?", the default card
  output (Run Status Card, Gate Transition Card, approval question) is unchanged.
- **PRD-09 Runtime contract:** `agdf-runtime-contract.md` gains a Gate-Rationale-Registry
  contract clause (deterministic, localized, curated) and an on-demand "Why?" interaction
  clause (status kind, non-authorizing, deterministic, progressive disclosure).
- **PRD-10 Gate-check skill:** `gate-check/SKILL.md` gains guidance for responding to
  "why?"/"Warum?" with the curated rationale + fulfilled/protects line, as a `status`
  interaction without approval controls.
- **PRD-11 Propagation:** Generated surface copies are propagated via
  `sync-package-assets.js` without forking content.
- **PRD-12 Non-overlapping file sections:** The SD must name the exact JSON keys and JS
  functions this slice owns versus `agdf-state-orientation` and
  `agdf-human-decision-surface`, to prevent concurrent-modification conflicts.

## 4. Acceptance Criteria

1. `agdf-interaction-locales.json` contains a `gateRationale` section in both `en` and `de`
   with one localized string for each of the 12 gates/steps.
2. Each rationale string is within the `description` budget (160 chars).
3. `validateLocaleRegistry()` returns `{ valid: true, errors: [] }` with the new
   `gateRationale` keys present.
4. Removing `gateRationale` from one locale causes `validateLocaleRegistry()` to return
   `{ valid: false }` with an `incomplete_locale` error.
5. `gateRationale(registry, "de", "UR")` returns the German UR rationale string
   deterministically across invocations.
6. `gateRationale(registry, "en", "UR")` returns the English UR rationale string
   deterministically across invocations.
7. The `gate_approval` option list in `gateOptions()` remains exactly
   `approve | revise | decline` (+ optional `cancel`); no "why" option is present.
8. `validateApprovalOrientationSnapshot` is unchanged and still passes for all six user
   gates.
9. `npm --prefix create-agdf run test:interaction-presentation` passes.
10. Generated surface copies are propagated and `check-runtime-integrity.mjs` passes.

## 5. Non-Goals

- No new `interaction_kind`.
- No change to approval authority, gate logic, the gate-transition model, or the
  approval-question option list.
- No change to the `gate_approval` interaction sequence.
- No automatic rationale display in the default card output.
- No change to the machine-readable Run Status Card JSON fields or CLI output.
- No change to the `agdf-state-orientation` Slice A scope.
- No new locale pack beyond `en`/`de`.
- No live host-rendering proof.

## 6. Brownfield Fit

- Extend `plugin/meta/agdf-interaction-locales.json` with a new `gateRationale` top-level
  key per locale.
- Extend `plugin/meta/agdf-runtime-contract.md` with a Gate-Rationale-Registry clause and
  an on-demand "Why?" interaction clause (new subsection in §Native Interaction Contract).
- Extend `plugin/skills/gate-check/SKILL.md` with "Why?" response guidance (new block after
  existing interaction guidance).
- Extend `create-agdf/lib/interaction-presentation.js` with a `gateRationale()` retrieval
  function and update `validateLocaleRegistry` budget category for rationale strings.
- Extend `create-agdf/scripts/interaction-presentation-test.js` with regression tests.
- Propagate via `create-agdf/scripts/sync-package-assets.js`.
- Update `CG-NATIVE-INTERACTION-AUTHORITY` and `CG-RUN-STATUS-CARD` in
  `.agdf/control/CONTEXT_GRAPH.md` at OR closeout.

## 7. Non-Overlapping File Sections

| File | This slice owns | `agdf-state-orientation` owns | `agdf-human-decision-surface` owns |
|---|---|---|---|
| `agdf-interaction-locales.json` | `gateRationale` top-level key per locale (new) | `breadcrumb`, `narration`, `internalStateLabels` keys (new under existing sections) | `statusCard`, `interaction`, `primary.afterApproval` keys (existing) |
| `agdf-runtime-contract.md` | Gate-Rationale-Registry clause, on-demand "Why?" clause (new subsection in §Native Interaction Contract) | Breadcrumb, narration, collapse rules (new subsections in §Run Status Card) | Two-card envelope ordering, semantic payload, sequence preflight (§Gate Transition Card) |
| `gate-check/SKILL.md` | "Why?" response guidance (new block after existing interaction guidance) | Breadcrumb rendering, narration guidance, collapse rules | Approval-time card composition, native-attempt preflight |
| `interaction-presentation.js` | `gateRationale()` retrieval function (new); budget category update for `gateRationale` keys in `validateLocaleRegistry` | `buildBreadcrumb()`, `buildTransitionNarration()`, `collapseInternalState()` | `buildApprovalOrientationSnapshot()`, `attachApprovalOrientationSnapshot()` |

## 8. Risks

- **Sequencing:** If `agdf-state-orientation` or `agdf-human-decision-surface` produce
  further changes to shared files, this slice's non-overlapping sections must be
  re-verified. SD must define a merge or rebase strategy.
- **Locale budget:** Rationale strings must stay within `lengthBudgets.description`
  (160 chars). SD must verify all 12 strings fit in both `en` and `de`.
- **"Why?" non-overlap enforcement:** Tests must assert that the "Why?" response never
  enters `gateOptions()` or `validateApprovalOrientationSnapshot`.

## 9. Required Next Step

Review this PRD and approve it only with:

`Approval: PRD`
