# UR: Copilot-Skillnamen zuverlässig auf AGDF-IDs abbilden

Status: draft
Gate: UR
Gate approval: open
Date: 2026-10-02
Owner: Arndt Gold

## 1. Problem

Copilot zeigt den Skill als `agdf-gate-check`, während der Dispatcher ausschließlich
`gate-check` akzeptiert. Ein beobachteter Aufruf verwendete den sichtbaren Namen und
scheiterte. Die Copilot-Projektion benennt außerdem alle einzeln in Backticks gesetzten
Skillnamen um und vermischt dadurch sichtbare Hostnamen mit kanonischen IDs.

## 2. Goal

Bekannte Copilot-Skillnamen werden technisch und eindeutig auf ihre kanonische AGDF-ID
abgebildet. Das Modell muss die Zuordnung nicht selbst herleiten. Der sichtbare Präfix
`agdf-` und der bestehende Kollisionsschutz bleiben erhalten.

## 3. Scope

- Am zentralen Dispatcher-Eingang kanonische IDs und exakt registrierte Hostnamen
  akzeptieren; Zuordnungen aus der bestehenden Plugin-Definition ableiten.
- Intern ausschließlich kanonische IDs für Evaluierung, Contracts und Fortsetzungen nutzen.
- Unbekannte oder mehrdeutige Namen ablehnen; verständliche Diagnostik mit den gültigen
  Eingabeformen bereitstellen.
- Copilot-Projektion so präzisieren, dass sichtbare Skillnamen umbenannt werden,
  kanonische Dispatcher-IDs und technische Referenzen jedoch erhalten bleiben.
- Zuordnung und Grenzen dokumentieren; fokussierte Core-, MCP-/CLI- und
  Projektionsprüfungen ergänzen und ausführen.

## 4. Non-Goals

- Zielprojekt, Run oder Freigabe aus einem Skillnamen ableiten.
- Beliebige Präfixe entfernen oder unbekannte Namen heuristisch korrigieren.
- Neue Gate- oder Approval-Logik, einen zweiten Skill-Katalog oder einen zweiten
  Dispatcher einführen.
- Installation, Veröffentlichung oder Behauptung frischer Copilot-Host-Evidenz.

## 5. Acceptance Signals

1. Auf der Copilot-Oberfläche führen `agdf-gate-check` und `gate-check` bei ansonsten
   identischen Eingaben zum gleichen kanonischen Dispatcher-Verhalten.
2. Alle ausgelieferten Copilot-Skills sind aus einer einzigen Definition zuordenbar;
   bestehende kanonische Aufrufe anderer Hosts bleiben kompatibel.
3. Unbekannte und mehrdeutige Namen werden vor der Governance-Evaluierung abgelehnt.
4. Generierte Copilot-Skills behalten den sichtbaren Präfix und dokumentieren die
   kanonische ID konsistent, ohne technische Referenzen pauschal umzubenennen.
5. Ein fehlendes Ziel bleibt ungeklärt; Aliasauflösung gewährt keine Delivery-Autorität.
6. Fokussierte Regressionstests und Paket-/Projektionsprüfungen belegen das Verhalten.
   Quellcode-, Paket- und frische Host-Evidenz werden getrennt ausgewiesen.

## 6. Existing Source Of Truth

- `plugins/agdf/meta/agdf-plugin.definition.json`: kanonische skillSet-Slugs und Hostpräfixe.
- `packages/core/lib/skill-dispatch/contract.js`: Eingabevalidierung und Registry.
- `packages/core/lib/skill-dispatch/service.js`: gemeinsamer Dispatcher.
- `scripts/sync-package-assets.js`: Hostprojektionen.
- `plugins/agdf/skills/` und `plugins/agdf/meta/contracts/`: kanonische Anweisungen.
- `docs/architecture/02-dispatcher.md`: Beschreibung des implementierten Dispatchers.

## 7. Risks And Unknowns

Brownfield Review klärt die kleinste gemeinsame Normalisierungsgrenze für CLI und MCP,
die Bindung eines Alias an seine vertrauenswürdige Hostoberfläche und die Prüfung von
Namenskollisionen. Die Projektion muss sichtbare Skillreferenzen und technische IDs
unterscheiden. Breite bestehende Dispatcher-/Copilot-Runs werden durch diesen gezielten
Fehlerbehebungs-Scope weder umgebunden noch abgeschlossen.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

- Problem: Copilot zeigt `agdf-gate-check`, der Dispatcher akzeptiert nur `gate-check`; die Generierung vermischt sichtbare Skillnamen und kanonische IDs.
- Ziel: Bekannte Copilot-Skillnamen technisch auf kanonische AGDF-IDs abbilden und den sichtbaren Kollisionsschutz `agdf-` erhalten.
- Umfang: Zentrale, aus der bestehenden Plugin-Definition abgeleitete Namensauflösung; kanonische interne IDs; Ablehnung unbekannter und mehrdeutiger Namen mit verständlicher Diagnostik; präzise Copilot-Projektion sowie Dokumentation und fokussierte Regressionstests.
- Abnahme: Bekannte Copilot-Namen und kanonische IDs liefern dasselbe kanonische Verhalten; alle ausgelieferten Skills sind eindeutig zugeordnet; unbekannte Namen scheitern vor Governance-Evaluierung; generierte Anweisungen erhalten technische IDs; fehlende Ziele und Freigaben werden nicht ersetzt.
- Offen: Brownfield Review klärt die gemeinsame CLI-/MCP-Grenze, vertrauenswürdige Hostbindung und Kollisionsprüfung. Installation und Veröffentlichung gehören nicht zum Scope; frische Copilot-Host-Evidenz bleibt separat.
