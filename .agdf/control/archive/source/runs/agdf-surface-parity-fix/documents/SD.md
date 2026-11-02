# SD: Surface Parity Fix Solution Design

Status: draft
Gate: SD
Revision: 1
Derived from: PRD
Date: 2026-07-16

## 1. Changes

### 1.1 `agdf-plugin.definition.json`

```diff
- "shortDescription": "Codex-first operating system for governed AI-assisted delivery.",
+ "shortDescription": "Operating system for governed AI-assisted delivery.",

- "longDescription": "AI Governance & Delivery Framework (AGDF) brings an operating system for governed AI-assisted delivery to Codex, combining workflow skills, control templates and machine-readable repository checks for gate decisions, Brownfield analysis, task-plan review, QA decisions, durable run state and auditable delivery closeout.",
+ "longDescription": "AI Governance & Delivery Framework (AGDF) brings an operating system for governed AI-assisted delivery, combining workflow skills, control templates and machine-readable repository checks for gate decisions, Brownfield analysis, task-plan review, QA decisions, durable run state and auditable delivery closeout.",

  "claude": {
-   "skillPrefix": "",
-   "agentRouter": "meta/agdf-agent-router.md"
+   "skillPrefix": "",
+   "agentRouter": "meta/agdf-agent-router.md",
+   "defaultPrompt": [
+     "Assess whether AGDF is proportionate for this repository and request before proposing any implementation. Explain AGDF's purpose and practical benefits, weigh governance overhead against the project's delivery risk, and recommend the lightest suitable path — or explicitly advise against AGDF where it would add more process than value.",
+     "Start this request under AGDF governance.",
+     "Create durable AGDF control state for this repository.",
+     "Close this delivery run with an auditable AGDF report."
+   ]
  }

  "surfaces": {
    "codex": {
-     "approvalValueTransport": "decorated_label_only",
+     "approvalValueTransport": "exact_option_value",
    },
    "claude": {
-     "approvalValueTransport": "decorated_label_only",
+     "approvalValueTransport": "exact_option_value",
    },
    "opencode": {
-     "approvalValueTransport": "decorated_label_only",
+     "approvalValueTransport": "exact_option_value",
    }
  }
```

### 1.2 `agdf-runtime-contract.md` surface adapter table

Update the Codex row: remove "the current canonical `decorated_label_only` capability uses exact text without invoking the adapter" caveat. State `exact_option_value` for all three surfaces.

### 1.3 `interaction-presentation-test.js`

Add assertions: `exact_option_value` + `deliberate_no_auto_resolution` → `eligible: true`, `native_attempt_required: true`. Retain existing `decorated_label_only` → `eligible: false` test.

## 2. Test Plan

| Test | What it asserts |
|---|---|
| SPF-T01 | All 3 surfaces declare `exact_option_value` |
| SPF-T02 | `evaluateNativeApprovalCapability` with `exact_option_value` returns `eligible: true` |
| SPF-T03 | `decorated_label_only` still returns `eligible: false` (retained) |
| SPF-T04 | `claude` has `defaultPrompt` with 4 entries |
| SPF-T05 | `shortDescription` does not contain "Codex" |
| SPF-T06 | `test:interaction-presentation` passes |
| SPF-T07 | `check-runtime-integrity.mjs` passes |

## 3. Next Step

`Approval: SD`
