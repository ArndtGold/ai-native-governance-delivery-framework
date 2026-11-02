# TP: Task Target Resolution Boundary

Status: approved
Gate: TP
Gate approval: `Approval: TP` accepted on 2026-07-28 after same-run, same-gate, revision and durable-artefact revalidation.
Based on: SD (approved 2026-07-28)
Date: 2026-07-28
Owner: user / agent

## 1. Task List

| task_id | Aufgabe | Acceptance Mapping | Erforderliche Evidenz |
|---|---|---|---|
| T1 | Neuen kanonischen Contract `plugin/meta/contracts/task-target-resolution.md` anlegen: Begriffe, Autoritätsreihenfolge, Rollenmodell, Resolution States, Reason Codes, stabile Fortsetzung, Zielwechsel, Blocker und fail-closed Recovery exakt nach SD AD-1 bis AD-4 und AD-6 definieren. | TTR-1 bis TTR-8 | Contract-Review; Runtime-Integrity-Präsenzprüfung; keine Gate- oder Scope-Classification-Duplikation |
| T2 | `plugin/meta/agdf-runtime-contract.md`, `create-agdf/scripts/sync-package-assets.js` und die Contract-Modul-Inventare in `plugin/scripts/check-runtime-integrity.mjs` um das neue Modul erweitern. | TTR-3, TTR-10 | Manifest-/Inventar-Assertions; Sync-Idempotenz; Source- und Installed-Layout-Integrity |
| T3 | `plugin/meta/agdf-agent-router.md` so erweitern, dass Task Target Resolution vor Mode Selection, Repository-Aktivierung und Gate Routing erfolgt; nur kurze operative Regeln und Verweis auf den Contract, keine zweite Semantiktabelle. | TTR-1 bis TTR-7 | Reihenfolge-Assertion in Runtime Integrity; Router-Review; adversariales Eval gegen `cwd`-Fallback |
| T4 | `plugin/skills/gate-check/SKILL.md` um den Contract-Input und den ersten Resolution-/Revalidierungsschritt erweitern: erst Target, dann Governance Repository, Doctor und Gate-Auswertung; Blocker verhindern nachgelagerte Auswertung und Mutation. | TTR-2 bis TTR-8 | Skill-Integrity-Assertion; Behavioral Evals für resolved/unresolved; kein lokales Presentation-Template |
| T5 | `plugin/meta/contracts/interaction.md` um die nicht-autorisierende Task-Target-Orientierung erweitern: Aktivierung bei relevanter Zieltrennung, Blockern und Zielwechsel; Reihenfolge vor Scope Classification; Abgrenzung zu Read-only Orientation, Run Status und Gate Transition Card. | TTR-3, TTR-5 bis TTR-9 | Contract-Assertion; Interaction-Review; keine neue Approval- oder Card-Autorität |
| T6 | Im bestehenden `create-agdf/lib/interaction-presentation.js` einen reinen Renderer für das normalisierte Resolution-Ergebnis implementieren: Pflichtfeldvalidierung, `authorizes: false`, kompakte resolved-/blocked-/changed-Projektion und `null` bei widersprüchlichem Input. | TTR-7 bis TTR-9 | Unit-Tests für resolved, changed, mismatch, unavailable, multiple targets und invalid input |
| T7 | Die kanonische Locale Registry für `en` und `de` um `taskTargetResolution` erweitern und bestehende Pack-Parität sowie vollständigen English-Unit-Fallback wiederverwenden. | TTR-8, TTR-9 | Locale-Parity-Test; erzwungener unvollständiger Pack fällt als Einheit auf Englisch zurück; keine Sprachmischung |
| T8 | Runtime-Integrity-Assertions ergänzen: Contract in Manifest und beiden Modulinventaren; Router-/Skill-Verweis und vorgelagerte Reihenfolge; bestehender Presentation-Owner; keine Gate-/Scope-Duplikation; Renderer-Export und Locale-Sektion vorhanden. | TTR-3, TTR-9, TTR-10 | `check-runtime-integrity.mjs` grün im Source- und staged Installed Layout; gezielter negativer Drift-Test |
| T9 | Gate-check-Eval-Corpus und notwendige Fixture-/Observation-/Manifest-Dateien erweitern: explizite Datei vor anderem `cwd`, Evidenz-Repository ohne Mutation Authority, Governance-Aktivierung erst nach Resolution, Mehrziel-Ambiguität, Inhalts-Mismatch und Target-Unavailable mit Retry. | TTR-1 bis TTR-3, TTR-6 bis TTR-8 | deterministische Eval-Replays; aktualisierte Fingerprints/Corpus-Version; `eval:skills` und Skill-Eval-Tests grün |
| T10 | Mehrturn-Evals ergänzen: bestätigtes Ziel bleibt bei eindeutiger Fortsetzung stabil; expliziter Zielwechsel beendet die alte Bindung; neue Ambiguität nach stabiler Bindung führt fail-closed statt Scope Drift. | TTR-4, TTR-5, TTR-6 | positive und adversariale Mehrturn-Beobachtungen; keine Mutation außerhalb des erwarteten Ziels |
| T11 | Nach SD-Freigabe einen neuen Context-Graph-Knoten für die Task-Target-Autorität anlegen, mit Beziehung zu `CG-NATIVE-INTERACTION-AUTHORITY` und klarer Abgrenzung von Gate-/Repository-Scope-Autorität. | TTR-3, TTR-9 | Graph-Schema-/Doctor-Prüfung; `context_graph_reconciliation` bleibt bis Closeout sichtbar |
| T12 | Bestehenden Asset-Sync ausführen und generierte Codex-, Claude-Code-, OpenCode- und Copilot-Oberflächen sowie Plugin-Runtime-Paket synchronisieren; keine Handänderungen an generierten Assets. | TTR-10 | Sync-Diff-Inspektion; zweiter Sync ist idempotent; Runtime-Manifest-Digests aktuell |
| T13 | Fokussierte Tests, vollständigen `create-agdf`-Smoke, Runtime Integrity, Skill-Evals, Pages-Check, Doctor, Gate Check und `git diff --check` ausführen; Evidenzgrenzen für nicht getestete Live Hosts dokumentieren. | TTR-1 bis TTR-10 | vollständiges Befehls-/Ergebnisprotokoll; grüne relevante Checks oder präzise blockierende Befunde |

### UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| TTR-1 | `explicit_single_target` | T1, T3, T9 | Contract-Präzedenz plus Eval „explizite Datei vor anderem cwd“ | planned | none |
| TTR-2 | alle | T1, T4, T9 | getrennte Rollen plus Eval „Evidenz-Repository ohne Mutation“ | planned | none |
| TTR-3 | alle | T2, T3, T4, T8, T9 | Router-Reihenfolge, Integrity-Assertion und Eval | planned | none |
| TTR-4 | `continued_confirmed_target` | T1, T4, T10 | positiver Mehrturn-Eval für stabile Fortsetzung | planned | none |
| TTR-5 | `explicit_single_target` nach Fortsetzung | T1, T5, T6, T10 | Zielwechsel-Eval plus sichtbarer `target_changed`-Renderer-Test | planned | none |
| TTR-6 | `unresolved_target` | T1, T3, T4, T9, T10 | Mehrziel- und Ambiguitäts-Evals mit verbotener Mutation | planned | none |
| TTR-7 | `unresolved_target` | T1, T4, T6, T9 | Mismatch-Contract, Renderer-Test und Behavioral Eval | planned | none |
| TTR-8 | `unresolved_target` | T1, T6, T7, T9 | Unavailable-/Retry-Eval und lokalisierte Recovery-Projektion | planned | none |
| TTR-9 | alle | T5, T6, T7, T8, T11 | nicht-autorisierender Renderer, Locale-/Ownership-Assertions und Graph-Beziehung | planned | none |
| TTR-10 | alle Oberflächen | T2, T8, T12, T13 | Sync-Idempotenz, Installed-Layout-Integrity und vollständige Smoke-Evidenz | planned | none |

## 2. Test Plan

### Fokussierte Tests

- Interaction-Presentation-Tests: resolved, changed, mismatch, unavailable, multiple targets,
  ungültige Eingaben, `authorizes: false`, deterministische Ausgabe.
- Locale-Tests: `en`/`de`-Parität und vollständiger English-Fallback als Einheit.
- Runtime Integrity: Source Layout, staged Installed Layout und negativer Drift-Fall.
- Skill-Evals: alle neuen Single-Turn- und Mehrturn-Fälle mit Mutation Boundary.

### Integrations- und Regressionstests

- Asset-Sync zweimal ausführen; zweiter Lauf darf keinen weiteren Diff erzeugen.
- Vollständige `create-agdf`-Smoke-Kette einschließlich Runtime- und Eval-Tests.
- Package-/Plugin-Integrity mit aktualisierten Runtime-Digests.
- Pages-Check auf abgeleitete Eval-Zahlen, Skill-Metadaten und veraltete Runtime-Copy.

### Kontroll- und Review-Evidenz

- `doctor --run task-target-resolution-boundary --json`.
- `gate-check --run task-target-resolution-boundary --json`.
- `git diff --check` für den vollständigen Scope.
- Task Plan Review T1–T13 und UX Intent Fidelity TTR-1–TTR-10.
- Clean Implementation Review und Code Review vor QA.
- Repository-Evidenz und Live-Host-Evidenz ausdrücklich getrennt berichten.

## 3. Brownfield Scope

Die verpflichtende Pre-Implementation Brownfield Analysis nach `Approval: TP` prüft mindestens:

- Contract-Modularisierung und Inventare in Runtime Manifest, Sync und Runtime Integrity;
- Router-Reihenfolge und bestehende Repository-Aktivierungsdiagnose;
- Gate Transition als alleinigen Gate-/Repository-Scope-Owner;
- Interaction Contract, Scope Classification Card und Read-only Orientation auf
  Aktivierungsreihenfolge und Nicht-Duplikation;
- `interaction-presentation.js`, Locale Registry und bestehende Presentation-Tests;
- `gate-check`-Skill, Eval-Katalog, Fixtures, deterministic replay und Corpus-Fingerprints;
- Context-Graph-Schema und `CG-NATIVE-INTERACTION-AUTHORITY`;
- Generated-Surface- und Runtime-Packaging-Pfade;
- bestehende fremde Worktree-Änderungen, insbesondere `pages/.astro/settings.json`, als strikt
  ausgeschlossenen Scope.

## 4. Out of Scope

- Änderung der Gate-Reihenfolge, Approval-Werte oder Ready-Gate-Interaktion.
- Globales Target-State-Repository, neuer Run-State oder neue Persistenzdatei.
- Sandbox-, ACL- oder allgemeines Berechtigungssystem.
- Zweiter Scope-Classifier, Presentation-Owner, Renderer-Pfad oder Asset-Sync.
- Automatische Zielwahl bei Unsicherheit.
- Rückwirkende Migration historischer Runs.
- Live-Host-Claims ohne direkte Beobachtung.
- Commit, Push, Pull Request, Release oder Reinstall.
- Die fremde Änderung `pages/.astro/settings.json`.

## 5. Risiken und Blocker

- **block:** Target-Semantik landet zusätzlich in Router, Skill oder Renderer statt ausschließlich
  im neuen Contract.
- **block:** Ein unresolved Reason Code erlaubt dennoch Repository-Aktivierung, Gate-Auswertung oder
  Mutation.
- **block:** Evidence Source kann Governance oder Mutation Target werden.
- **revise:** Mehrturn-Stabilität ist nur als Prosa, nicht adversarial getestet.
- **revise:** Generated Surfaces oder Runtime-Paket driften vom kanonischen Contract.
- **revise:** Renderer erzeugt Approval Controls, entscheidet Target-Semantik oder mischt Sprachen.
- **warn:** Live Host kann Attachment-Verfügbarkeit anders darstellen als Repository-Tests; als
  unverified ausweisen.
- **warn:** Zusätzliche Orientierung kann Chat-Rauschen erzeugen; nur bei relevanter Trennung,
  Blocker oder Zielwechsel anzeigen.

## 6. Nächster Schritt

Aufgaben- und Testplan prüfen und nur mit folgendem exakten Wert freigeben:

`Approval: TP`
