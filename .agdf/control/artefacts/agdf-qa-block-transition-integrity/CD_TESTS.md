# CD+Tests: QA-Block Transition Integrity

Status: `done`
Date: 2026-07-29
Run: `agdf-qa-block-transition-integrity`
Mode: `quick_task`

## Implementierung

- `create-agdf/lib/control-evaluation/gate-policy.js`
  - erweitert den bestehenden QA-Nicht-Pass-Owner von ausschließlich `revise` auf die
    kanonischen Werte `revise | block`;
  - projiziert QA-`block` als `status: blocked`, `current_gate: QA`,
    `blocking_reason: qa_blocked` und `missing_approval: none`;
  - verbietet QA-/UAT-Freigabe, Release und Delivery-Readiness;
  - routet zur dauerhaften Remediation beziehungsweise zum autoritativen Upstream-Owner.
- `create-agdf/scripts/control-state-test.js`
  - ergänzt direkte JSON-/Statuskarten-/Interaction-Regressionen für QA-`block`;
  - belegt, dass keine Approval Presentation entsteht;
  - belegt, dass QA-`block` mit irrtümlich gespeichertem Approval durch Runtime Integrity
    fail-closed bei QA bleibt.
- `create-agdf/scripts/smoke-test.js`
  - ergänzt die Gate-Transition-Matrix um `revise`, `block` und
    `approved + block`.

## Akzeptanzabdeckung

| Requirement | Status | Evidenz |
|---|---|---|
| QBT-1 | pass | `qaNonPassDecision` erkennt ausschließlich `revise | block`; fehlende und unbekannte Werte bleiben im bisherigen Pfad. |
| QBT-2 | pass | Block-Fixture: `missing_approval: none`, `interaction_kind: blocked`, `approval_presentation: null`; QA/UAT/Release gesperrt. |
| QBT-3 | pass | Der gemeinsame Transitionowner liefert die Blockroute; `gate-check` übernimmt weiterhin den dauerhaften `next_allowed_action` des Run State. |
| QBT-4 | pass | Bestehende Matrixfälle für fehlendes QA, pass ohne Approval, revise, pass mit Approval und UAT/OR bleiben grün. |
| QBT-5 | pass | `approved + block` endet bei QA mit `AGDF_GATE_ARTEFACT_STATUS_INCONSISTENT`; kein UAT-Pfad wird angeboten. |
| QBT-6 | pass | JSON, Statuskarte und Approval Presentation werden aus derselben Transitionentscheidung erzeugt; kein zweiter Owner ergänzt. |
| QBT-7 | pass | Fokussierte Tests, vollständiger CLI-Smoke und vollständige Package-Suite grün. |

## Testevidenz

| Befehl | Ergebnis | Abdeckung |
|---|---|---|
| `node --check create-agdf/lib/control-evaluation/gate-policy.js` | pass | Syntax Implementierungsowner |
| `node --check create-agdf/scripts/control-state-test.js` | pass | Syntax fokussierte Tests |
| `node --check create-agdf/scripts/smoke-test.js` | pass | Syntax Smoke-Matrix |
| `npm --prefix create-agdf run test:control-state` | pass | fokussierte Gate-/Runtime-Regressionen |
| `node create-agdf/scripts/smoke-test.js` | pass | vollständige CLI-Transitionen |
| `npm --prefix create-agdf run smoke-test` | pass | vollständige Package-Suite einschließlich 47/47 Skill-Evals, Runtime Integrity, Proportionalität, OpenCode-Hardening, Packaging und Routing |
| `git diff --check -- create-agdf/lib/control-evaluation/gate-policy.js create-agdf/scripts/control-state-test.js create-agdf/scripts/smoke-test.js` | pass | Whitespace-/Patchintegrität |

Der zunächst verwendete Alias `npm --prefix create-agdf run test:smoke` existiert nicht und wurde
durch die kanonischen Repository-Befehle `node create-agdf/scripts/smoke-test.js` und
`npm --prefix create-agdf run smoke-test` ersetzt. Dies ist kein Produkt- oder Testfehler.

## Änderungsintegrität

Baseline-Commit: `7a15768d319b47f78e6a178c52e94682360ad6dc`

| Datei | SHA-256 vorher | SHA-256 nachher |
|---|---|---|
| `create-agdf/lib/control-evaluation/gate-policy.js` | `ee2e0acf0f3d8f5fb438ba6a2befea4e65b53bf83dc0480eb810df944f6f1854` | `52b7ba7d32258fc2d5f7dd99202174b5af43d4a433a084156a9b6b8eb6b5831b` |
| `create-agdf/scripts/control-state-test.js` | `e2d1b5da58cfd444cf71ba332609e2bdc18e43bece7b8bd8654ebe31ef0ee490` | `9df838bb26727933cbb51948cee4692f772ed2d8741b35c86aadd3881c0d9de6` |
| `create-agdf/scripts/smoke-test.js` | `89e70831091e65e6a2a3e6d6ed4ca646764e73c6b592491d03b8edc47a33c77e` | `52f944f4a01636a61674859317d66a042bb1fc8400c5d5f4251c92200ee7f987` |

## Scope und Abweichungen

- Keine Änderung an QA-Entscheidungswerten, Gate-Reihenfolge, Approval-Formel, CLI-Schema oder
  Runtime-Integrity-Grenzen.
- Keine Benchmark-, Structured-Depth-, fremde Run-, VCS-, Release- oder Reinstall-Änderung.
- Der Test für den widersprüchlichen Zustand `approved + block` erwartet bewusst die stärkere
  Runtime-Integrity-Sperre statt der normalen `qa_blocked`-Projektion.

## Ergebnis

- decision: `pass`
- missing_evidence: keine im genehmigten Quick-Task-Scope
- required_next_step: Verpflichtenden Code Review und OR-lite abschließen.
