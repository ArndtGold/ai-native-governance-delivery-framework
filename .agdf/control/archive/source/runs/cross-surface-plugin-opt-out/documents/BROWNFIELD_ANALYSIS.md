# Brownfield Analysis: Projektbezogener Plugin-Opt-out über alle Oberflächen

Status: done
Mode: pre_implementation_analysis
Decision: pass
Revision: 1
Date: 2026-09-02
Owner: agent
Based on: approved TP revision 1

## 1. Scope And Baseline

- Baseline commit: `2cc30a68be5b`.
- Freigegebener Scope: `CSO-T01` bis `CSO-T12` aus TP revision 1.
- Die vorgesehenen Produktions-, Test- und Dokumentationspfade sind vor Implementierungsbeginn
  unverändert.
- Die Arbeitskopie enthält umfangreiche fremde Änderungen des Runs
  `legacy-profile-upgrade-recovery` in Release-Profil-, Workflow-, Versions- und Control-Dateien.
  Zusätzlich liegen zwei fremde Bilddateien untracked vor.
- Diese Änderungen werden nicht zurückgesetzt, umformatiert, gestaged oder in Implementierungsevidenz
  dieses Runs aufgenommen. `MASTER_BACKLOG.md` ist ein gemeinsamer Control-Pfad und wird ausschließlich
  in der bereits vorhandenen Zeile `cross-surface-plugin-opt-out` verändert.

## 2. Existing Coverage And Reuse Strategy

| Concern | Current coverage | Existing owner | Reuse strategy |
|---|---|---|---|
| CLI option parsing | partially_done | `create-agdf/lib/cli/parse-args.js` | `extend`: ein Boolean `shared`, keine zweite Parser-Schicht |
| Option compatibility and help | partially_done | `create-agdf/lib/cli/command-registry.js` | `extend`: exakte erlaubte Kombination und bestehende Usage-Ausgabe |
| Repository disable lifecycle | partially_done | `create-agdf/lib/lifecycle/operations.js` | `extend`: Codex-Zweig erhalten, Copilot an Settings-Owner delegieren |
| Lifecycle composition and output | partially_done | `create-agdf/lib/cli/application.js`; `result.js` | `extend`: bestehendes Plan/Apply/Verify-Ergebnis und Schema 1 erhalten |
| Copilot JSON safety and atomic write | partially_done | `create-agdf/lib/installers/copilot-settings.js`; `fs-swap.js` | `refactor` intern, dann `extend`: denselben Reader/Writer für explizite Pfade wiederverwenden |
| Effective Git-ignore evidence | not_done | argumentbasierte Node-Subprocess-Konvention | `new` als kleine injizierbare Preflight-Funktion im Settings-Owner, keine neue Policy-Schicht |
| CLI and lifecycle regression | partially_done | `cli-modularization-test.js`; `lifecycle-test.js` | `extend` vorhandener Assertions |
| Copilot repository retention | partially_done | `copilot-repository-retention-test.js` | `extend` vom bisherigen unsupported-Fall zu beiden sicheren Modi |
| Public lifecycle guidance | partially_done | `INSTALL.md`; root `README.md`; `create-agdf/README.md`; CLI help | `extend` mit einer konsistenten Vier-Oberflächen-Matrix |

## 3. Minimal Clean Implementation Path

1. `copilot-settings.js` bleibt einziger Owner für Pfadauflösung, Settings-Validierung, reinen Merge,
   Ignore-Preflight, atomisches Schreiben und Copilot-Postcondition.
2. `operations.js` bleibt einziger Repository-Lifecycle-Owner und delegiert nur die neue fokussierte
   Copilot-Mutation. Der Codex-Pfad bleibt funktional unverändert.
3. Parser und Command-Registry führen genau `--shared` ein und lehnen jede andere Kombination vor
   Filesystemzugriff ab.
4. `application.js` transportiert Mode und surface-aware verification in das bestehende Lifecycle-
   Resultat. Es entsteht kein zweites Ausgabeformat.
5. Bestehende drei Testowner werden erweitert. Ein neuer fokussierter Test ist nur zulässig, falls die
   Failure-Injection sonst den Lifecycle-Test unlesbar macht; er muss dann denselben Produktionsowner
   direkt prüfen.
6. Öffentliche Dokumentation übernimmt dieselben Befehle, Pfade und Evidenzgrenzen.

## 4. Compatibility, Migration And Side Effects

- Keine Datenmigration: vorhandene valide JSON-Dateien werden semantisch gemerged.
- Bestehende JSONC- oder kommentierte Dateien werden nicht verändert.
- Neue persönliche Dateien werden nur bei belegtem Ignore-Status erstellt.
- `.gitignore`, `.git/info/exclude`, Instruktionsdateien, `.agdf/control` und globale Plugin-Einträge
  bleiben außerhalb der Mutation.
- Codex repository disable und alle globalen uninstall-Befehle bleiben rückwärtskompatibel.
- Claude Code und OpenCode erhalten keine neue Disable-Semantik.
- Das Lifecycle-Schema bleibt Version 1; neue Wirkung wird über bestehende Felder projiziert.

## 5. Regression And Test Impact

| Risk | Required control |
|---|---|
| `--shared` wird global oder auf einer anderen Oberfläche akzeptiert | vollständige negative Option-Matrix in `cli-modularization-test.js` |
| Settings-Merge beschädigt fremde Werte | positive und negative strukturierte Fixtures plus Vorher/Nachher-Vergleich |
| atomischer Fehler hinterlässt Teilzustand | injizierte Write-, Rename- und Verify-Fehler mit Byte- und Temp-Artefaktprüfung |
| Git-Ignore-Prüfung hängt vom Prozess-CWD ab | explizites `cwd: targetDir` und argumentbasierte Executor-Fixtures |
| Codex-Verhalten driftet | bestehende Codex-Lifecycle-Assertions unverändert weiterführen |
| Instruktionen werden mit Plugin-Zustand vermischt | Retention-Test und Dokumentationsassertion für getrennte Prüfung |
| fremder Release-Scope wird versehentlich aufgenommen | scoped diff inventory vor Reviews und QA; keine Änderung seiner Produktionspfade |

## 6. Parallel Structure And Drift Check

- parallel_structure_risk: controlled
- Ein Settings-Owner, ein Lifecycle-Owner, ein Parser und ein Resultatformat reichen aus.
- Es ist kein Fallback, Compatibility-Shim, zweites Schema oder zweiter Support-Matrix-Owner nötig.
- Die offiziellen Copilot-Dateipfade und die bereits bestätigte Instruktionsunabhängigkeit entsprechen
  PRD und SD. Kein Product-Semantics-Drift wurde gefunden.
- Sichtbarer Status und Recovery bleiben bei der bestehenden Lifecycle-Präsentation.
- UI-Monolith-Risiko ist nicht anwendbar; es wird keine UI oder zentrale View-State-Schicht geändert.

## 7. Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- required_action: none before QA
- evidence: bestehende CLI-Komposition und fokussierte Adaptergrenzen decken den Erweiterungspfad ab

## 8. Missing Evidence

- Frisch gestarteter Copilot-Host und managed-policy precedence bleiben spätere UAT-Evidenz.
- Repository- und Fixture-Tests dürfen diese Evidence Plane nicht ersetzen.

## 9. Result

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `none` before QA
- artefact: `.agdf/control/artefacts/cross-surface-plugin-opt-out/BROWNFIELD_ANALYSIS.md`
- scope: approved TP revision 1, `CSO-T01` through `CSO-T12`
- evidence: clean candidate paths, existing parser/lifecycle/settings/test owners, scoped dirty-worktree inventory
- transparency: full structured chain remains required because public CLI and external repository configuration change together
- missing_evidence: fresh Copilot session and managed-policy effectiveness, deferred to UAT
- current_coverage: partially_done with one missing Git-ignore preflight
- reuse_strategy: extend existing owners; one bounded internal refactor of the Copilot settings owner
- risks: atomicity, exact option scope, Git-ignore safety, retention and evidence overclaim
- context_graph_impact: link_only
- required_next_step: implement `CSO-T02` through `CSO-T10`, run `CSO-T11`, then mandatory reviews and QA
