# Product Requirements Document

## Document Control

- work item: `agdf-pages-limits-and-risks`
- source: `.agdf/control/artefacts/agdf-pages-limits-and-risks/UR.md`
- brownfield basis: `.agdf/control/artefacts/agdf-pages-limits-and-risks/BROWNFIELD_REVIEW.md`
- gate approval: exact `Approval: PRD` received on 2026-07-15 after canonical run, current-gate and revision revalidation

## 1. User Outcome

Visitors to the AGDF Pages site should understand both the value and the limits of the framework. They should not infer that AGDF replaces architecture, security, domain, regulatory, testing or human responsibilities, nor that the framework is free of process overhead.

## 2. Product Behavior

Extend the existing `What AGDF Is Not` / governance-evidence area with a coherent limits-and-dependencies presentation. The content should use two paired groups:

### What AGDF Does Not Replace

- Architecture expertise
- Security and privacy review
- Domain acceptance
- Regulatory certification
- Good tests
- Human judgment

### What AGDF Depends On

- Correct repository control state
- Complete and traceable evidence
- Actually executed tests
- Honest human UAT
- Disciplined use by agents and teams

Include the framing statement:

> AGDF makes delivery more governable. It does not make engineering judgment, verification or human responsibility optional.

Also state:

> AGDF reduces uncontrolled delivery risk, but it adds process overhead. Its value depends on choosing the smallest governance path that matches the change.

## 3. Requirements

### PRD-01: Boundary clarity

The Pages site must explicitly state that AGDF does not replace architecture expertise, security/privacy review, domain acceptance, regulatory certification, good tests or human judgment.

### PRD-02: Dependency clarity

The Pages site must explicitly state that AGDF depends on correct control state, complete evidence, executed tests, honest human UAT and disciplined use by agents and teams.

### PRD-03: Process-overhead honesty

The Pages site must acknowledge that governance adds process overhead and explain that AGDF uses proportional paths to manage that cost.

### PRD-04: Non-certification boundary

The wording must remain consistent with the existing statement that AGDF is not compliance certification or legal assessment.

### PRD-05: Coherent placement

The new content must appear near the existing boundary and governance-evidence sections, with no redundant or contradictory copy introduced in `notFor` or `aiActFit`.

### PRD-06: Existing-site integrity

Existing section anchors, navigation, styling conventions, responsive layout and build behavior must remain intact.

## 4. Acceptance Criteria

| ID | Acceptance criterion | Evidence |
|---|---|---|
| AC-01 | All six non-replacement responsibilities are visible. | Rendered Pages inspection |
| AC-02 | All five AGDF dependencies are visible. | Rendered Pages inspection |
| AC-03 | Process overhead and proportional governance are explained. | Rendered Pages inspection |
| AC-04 | Non-certification and human responsibility boundaries remain clear. | Content review |
| AC-05 | Existing boundary/evidence content is coherent and non-duplicative. | Data and page diff review |
| AC-06 | Pages build/check and relevant repository validation pass. | Command results |

## 5. Scope And Out Of Scope

### In scope

- Public Pages content data and the existing boundary/evidence section composition.
- Concise English copy aligned with the existing site voice.
- Render/build verification.

### Out of scope

- AGDF runtime behavior, plugin manifests, gate semantics or control templates.
- Legal or regulatory advice.
- New navigation routes, interactive components or visual system changes.
- Claims that AGDF guarantees correctness, safety or compliance.

## 6. Risks And Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| The section feels defensive or weakens the value proposition. | medium | Pair each limitation with the practical dependency or proportional-governance explanation. |
| Existing `notFor` and AI-governance copy becomes repetitive. | medium | Consolidate overlapping claims and keep each section semantically distinct. |
| Users read the text as legal advice or certification language. | high | Retain explicit non-certification wording and avoid regulatory conclusions. |

## 7. Implementation Boundary

Implementation is limited to existing Pages data and section composition. No new content owner, route, component system or runtime decision point may be introduced.

## 8. Gate Decision

This PRD is approved with exact `Approval: PRD`. The existing SD must be revalidated next; implementation remains non-authorizing until the ordered SD and TP gates are restored.
