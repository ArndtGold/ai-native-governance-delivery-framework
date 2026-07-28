# CD+Tests: Task Target Resolution Boundary

Status: done
Date: 2026-07-28
Based on: genehmigter TP T1–T13

## Ergebnis

T1–T13 sind implementiert. Die Task Target Resolution Boundary liegt normativ vor
Repository-Aktivierung, Scope Classification und Gate-Auswertung; ein bestehender
Presentation-Owner projiziert resolved und unresolved Zustände nicht-autorisierend.

## Implementierte Deliverables

| task_id | Ergebnis | Primäre Evidenz |
|---|---|---|
| T1 | fokussierter Contract mit Präzedenz, Rollen, Reason Codes, Fortsetzung und fail-closed Recovery | `plugin/meta/contracts/task-target-resolution.md` |
| T2 | Runtime Manifest sowie Sync-/Integrity-Modulinventare erweitert | `plugin/meta/agdf-runtime-contract.md`; `sync-package-assets.js`; `check-runtime-integrity.mjs` |
| T3 | Router löst Target vor Mode Selection und Governance-Aktivierung | `plugin/meta/agdf-agent-router.md` |
| T4 | Gate-check revalidiert Target vor Run/Gate und konsumiert Target Orientation verbatim | `plugin/skills/gate-check/SKILL.md` |
| T5 | Interaction Contract besitzt Aktivierung, Reihenfolge, Abgrenzung und fail-closed Presentation | `plugin/meta/contracts/interaction.md` |
| T6 | bestehender Presentation-Owner rendert validierte Target Orientation oder `null` | `create-agdf/lib/interaction-presentation.js` |
| T7 | vollständige `en`/`de`-Locale-Sektion und Paritätsprüfung | `plugin/meta/agdf-interaction-locales.json`; Presentation Tests |
| T8 | positive und negative Runtime-Integrity-Assertions für Contract, Reihenfolge, Skill, Renderer und Locale | `plugin/scripts/check-runtime-integrity.mjs`; `runtime-integrity-negative-test.js`; `smoke-test.js` |
| T9 | sechs Single-Turn-Target-Evals mit Fixtures und Replay-Evidenz | `evals/cases/gate-check.json`; Fixture/Replay/Manifest |
| T10 | zwei Mehrturn-Evals für stabile Fortsetzung und expliziten Zielwechsel | Gate-check-Eval-Corpus |
| T11 | neuer Context-Graph-Knoten und Beziehung zur Interaction Authority | `CG-TASK-TARGET-AUTHORITY` |
| T12 | bestehender Sync propagiert Contract, Router, Skill, Locale und Runtime; wiederholte Sync-Läufe idempotent | vollständige Smoke-Läufe |
| T13 | fokussierte, vollständige, Pages- und Control-State-Validierung | Testevidenz unten |

## Testevidenz

| Check | Ergebnis |
|---|---|
| `npm --prefix create-agdf run test:interaction-presentation` | pass; Target Orientation resolved/changed/unresolved/invalid, `authorizes: false` |
| `npm --prefix create-agdf run test:runtime-integrity-negative` | pass; gezielte entfernte Target-/Gate-check-Boundaries werden abgelehnt |
| `npm --prefix create-agdf run test:skill-evals` | pass |
| `npm --prefix create-agdf run eval:skills` | pass; 47/47, 10 Skills, deterministic replay |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass; Source Layout, 10 Skills, 16 Control Files |
| `npm --prefix create-agdf run smoke-test` | pass auf finalem Codezustand; Package Build/Contents, Installed Layout, Delivery Path Search, OpenCode, CLI und Routing eingeschlossen |
| `npm --prefix pages run check` | pass; 10 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise |
| `git diff --check HEAD -- ':!pages/.astro/settings.json'` | pass |

## Behobene Testbefunde

1. Neue Locale-Beschreibungen überschritten zunächst das bestehende Label-Budget. Die beiden Texte
   wurden innerhalb der vorhandenen Registry-Grenze gekürzt; Paritäts- und Budgettests sind grün.
2. Der negative Integrity-Test referenzierte nach der Target-Revalidierung noch die alte
   Gate-check-Zeichenfolge. Fixture und Smoke-Assertion wurden auf die genehmigte neue Boundary
   aktualisiert; negative und vollständige Smoke-Tests sind grün.
3. Review ergänzte eine strikte Boolean-Prüfung für `target_changed`, sodass unnormalisierte Werte
   fail-closed `null` liefern; fokussierte und vollständige Tests sind danach grün.

## Evidenzgrenzen

- Deterministic Replay ist kein Live-Host-Verhaltensnachweis.
- Attachment-Verfügbarkeit, Host-Pfadtransport und reale Modellbefolgung auf Codex, Claude Code,
  OpenCode und Copilot sind nicht direkt beobachtet.
- `pages/.astro/settings.json` war eine fremde bestehende Änderung, wurde nicht als Scope autorisiert
  und nicht als Implementierungsevidenz verwendet.
