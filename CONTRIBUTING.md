# Zu AGDF beitragen

Danke für dein Interesse an AGDF. Beiträge auf Deutsch oder Englisch sind willkommen. Deutsch bleibt die primäre Sprache für Governance und fachliche Begründungen; technische Kennungen, Befehle und exakte AGDF-Freigabewerte bleiben unverändert.

## Den richtigen Weg wählen

- Fragen, frühe Ideen und offene Designvorschläge: [Discussions](https://github.com/ArndtGold/ai-native-governance-delivery-framework/discussions)
- reproduzierbare Fehler oder umsetzungsreife Vorschläge: [Issue-Formulare](https://github.com/ArndtGold/ai-native-governance-delivery-framework/issues/new/choose)
- vermutete Sicherheitslücken: ausschließlich [SECURITY.md](SECURITY.md)
- Code- oder Dokumentationsänderungen: Pull Request nach den Regeln dieses Dokuments

## Vor einer Änderung

1. Prüfe, ob bereits ein Issue oder eine Discussion existiert.
2. Wähle einen proportionalen Arbeitsweg. Kleine Änderungen sollen klein bleiben; Änderungen an Produktsemantik, Governance, Architektur, Persistenz oder Release-Verhalten benötigen die passende AGDF-Steuerung.
3. Identifiziere die kanonische Quelle und davon abgeleitete Dateien.
4. Lege fest, welche Tests und sichtbaren Nachweise die Änderung belegen.

## Kanonische und abgeleitete Pfade

- `plugin/` und die dort dokumentierten Runtime-Verträge sind kanonisch für Plugin-Semantik.
- `create-agdf/` besitzt CLI, Installer, Packaging und die Synchronisierung abgeleiteter Plugin-Assets.
- `create-agdf/generated/` wird durch die vorhandenen Synchronisierungs- und Paketprozesse erzeugt und nicht als primäre Quelle editiert.
- installierte Codex-, Claude-Code- oder OpenCode-Caches sind keine Repository-Quelle und dürfen nicht als Implementierungspfad verwendet werden.
- `INSTALL.md` besitzt Installations- und Runtime-Unterstützungsaussagen.
- `RELEASE.md` und `.github/workflows/publish-agdf.yml` besitzen den Release-Ablauf.
- `LICENSE`, `NOTICE` und `TRADEMARKS.md` besitzen rechtliche und markenbezogene Grenzen.

Wenn eine Änderung kanonische und abgeleitete Dateien betrifft, verwende die vorhandene Synchronisierung und prüfe danach den exakten Diff.

## Lokale Prüfung

Wähle die für deinen Scope relevanten Befehle. Für größere Repository-Änderungen gehören typischerweise dazu:

```bash
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix create-agdf run smoke-test
npm --prefix agdf run smoke-test
npm --prefix pages run check
git diff --check
```

Community-Health-Dateien werden zusätzlich geprüft mit:

```bash
npm run test:community-health
npm run check:community-health
```

Dokumentiere ausgeführte Tests, sichtbare Nachweise und bewusst nicht ausgeführte Prüfungen. Ein grüner Test ersetzt keine erforderliche Host- oder UI-Beobachtung.

## Pull Requests

Ein Pull Request sollte:

- Problem und beabsichtigte Wirkung erklären;
- zugehöriges Issue oder Discussion verlinken;
- betroffene Oberflächen und kanonische/abgeleitete Pfade nennen;
- Tests und sichtbare Nachweise aufführen;
- Sicherheits-, Kompatibilitäts-, Dokumentations- und Release-Auswirkungen bewerten;
- den verwendeten AGDF-Run oder die begründete proportionale Ausnahme nennen.

Kein Contributor License Agreement (CLA) und kein Developer Certificate of Origin (DCO) sind erforderlich.

## KI-Unterstützung

Wenn KI-Unterstützung den Inhalt, Code, das Design, die Analyse oder die Tests wesentlich beeinflusst hat, beschreibe kurz:

- welche Teile wesentlich unterstützt wurden;
- was ein Mensch geprüft oder angepasst hat;
- welche Tests oder anderen Nachweise das Ergebnis stützen.

Sende keine Rohprompts, verborgenen Gedankengänge, Tokens, Zugangsdaten, Geheimnisse oder nicht erforderlichen privaten Daten. Die Offenlegung soll Review und Verantwortungsübernahme unterstützen, nicht vertrauliche Arbeitsinhalte sammeln.

## Review und Entscheidung

`@ArndtGold` ist derzeit der alleinige Maintainer. Review-Kommentare, angeforderte Änderungen oder eine Schließung sollen den technischen oder Governance-Grund nachvollziehbar machen. Ein Pull Request begründet keine Annahme, Merge- oder Release-Zusage. Siehe [GOVERNANCE.md](GOVERNANCE.md).
