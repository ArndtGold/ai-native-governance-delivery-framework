# UR: AGDF Live Host Conformance Matrix

Status: approved
Gate: UR
Gate approval: `Approval: UR` accepted on 2026-07-28 after same-run, same-gate, revision-2 and durable-artefact revalidation.
Date: 2026-07-28
Owner: user / agent
Parent evidence: `.agdf/control/artefacts/agdf-product-maturity-roadmap/CONFORMANCE_SCOPE.md`

## 1. Problem

AGDF besitzt umfangreiche Repository-, Integrity-, Replay- und teilweise Host-Evidenz. Diese
Nachweise beantworten jedoch nicht gemeinsam und reproduzierbar, wie Codex, Claude Code und OpenCode
in kritischen Mehrturn-, Attachment-, Target-, Approval-, Aktivierungs- und Enforcement-Situationen
tatsächlich reagieren.

Ohne gemeinsame Live-Host-Matrix besteht das Risiko, dass:

- deterministische Tests als reale Host-Garantie verstanden werden;
- surface-spezifische Enforcement-Lücken unsichtbar bleiben;
- dasselbe Fehlverhalten mehrfach und uneinheitlich untersucht wird; oder
- Produktänderungen auf Annahmen statt beobachteten Gaps beruhen.

## 2. Ziel

Eine redigierte, reproduzierbare und host-/versionsgebundene Conformance-Matrix für Codex, Claude
Code und OpenCode erstellen, die erwartetes und tatsächlich beobachtetes Verhalten, Evidenzklasse,
Enforcement-Klasse, Einschränkung und Recovery trennt.

Der Run ist zunächst Diagnose und Evidenzgewinnung. Er repariert gefundene Produkt- oder
Runtime-Lücken nicht still.

## 3. Verbindliche Fälle

1. explizite externe Datei bei abweichendem Arbeitsordner;
2. erwähntes Repository nur als Evidenz oder Bewertungsgegenstand;
3. mehrere plausible Ziele;
4. Target-Content-Mismatch;
5. nicht verfügbares Attachment mit Retry;
6. eindeutige Mehrturn-Fortsetzung;
7. expliziter Zielwechsel;
8. Aktivierung und Neustart;
9. mehrere aktive Runs;
10. exaktes Approval;
11. ungenaues oder implizites Approval;
12. Host-/Subagent-Pfad ohne vollständige Enforcement-Abdeckung.

## 4. Erforderliche Ergebnisse

- Ein gemeinsames Beobachtungsschema für alle drei Full Surfaces.
- Host, Host-Version, AGDF-Version, Aktivierungszustand und Beobachtungszeitpunkt je Lauf.
- Erwartung und tatsächliches sichtbares Verhalten je Fall.
- Genau eine Evidenzklasse:
  `repository_tested | deterministic_replay | authenticated_host_observed | user_accepted | unverified`.
- Genau eine Enforcement-Klasse:
  `tool_enforced | validator_enforced | host_limited | instruction_only | not_enforceable`.
- Ergebnis:
  `pass | limitation | product_gap | host_unavailable | invalid_evidence`.
- Konkrete Recovery oder nächster Gap-Routing-Schritt.
- Redigierte Evidenzreferenz ohne Secrets, private Vollprompts oder Hidden Reasoning.

## 5. Akzeptanzsignale

- 12/12 Fälle sind je verbindlich ausführbarem Full Surface direkt beobachtet oder präzise als
  `host_unavailable` dokumentiert.
- Ein Fall erhält nur bei passender direkter Beobachtung `pass`.
- Repository- oder Replay-Evidenz wird nicht als authentifizierte Host-Beobachtung ausgegeben.
- Surface-spezifische Grenzen werden nicht zu einer globalen technischen Garantie hochgestuft.
- Jeder `product_gap` nennt den bestehenden kanonischen Owner und einen möglichen separaten UR-Scope.
- Während der Beobachtung findet keine stille Produktreparatur statt.
- Alle persistenten Artefakte erfüllen die Redaction-Regeln.

## 6. Bestehende Owner und Brownfield-Fragen

- Task Target: `plugin/meta/contracts/task-target-resolution.md`
- Gate-/Run-Autorität: `gate-transition.md`, run-scoped Control State und `gate-check`
- Interaction/Approval: `interaction.md`, `interaction-presentation.js`
- Capability/Enforcement: bestehende Surface Capabilities, Adapter und Context-Graph-Evidenz
- vorhandene Host-/UAT-Evidenz: Task-Target-, Interaction-, OpenCode- und Delivery-Path-Runs

Brownfield Review muss klären:

- welche Fälle bereits direkt beobachtet und wiederverwendbar sind;
- welche Hosts in der aktuellen Umgebung authentifiziert und ausführbar sind;
- welche Beobachtungen externe Mutation, Installation oder Neustart benötigen;
- wie Testdaten und Screenshots sicher redigiert werden;
- welche aktiven Runs angrenzenden Scope besitzen; und
- welcher kleinste Delivery Path reine Beobachtung ohne Produktänderung erlaubt.

## 7. Nicht-Ziele

- Gefundene Runtime-, Plugin-, Router-, Interaction-, Eval- oder Host-Gaps reparieren.
- Host-Funktionen vereinheitlichen oder simulierte Ergebnisse als live ausgeben.
- Parent-Freigaben wiederverwenden.
- Secrets, Cookies, Tokens, vollständige private Attachments, Vollprompts oder Hidden Reasoning
  persistieren.
- Einen neuen Capability-, Gate-, State- oder Presentation-Owner schaffen.
- Commit, Push, Pull Request, Release oder Reinstall ohne späteren eigenen Scope.

## 8. Risiken

- Host oder Provider ist nicht authentifiziert beziehungsweise nicht verfügbar.
- Attachment- und Restart-Verhalten ist hostseitig nicht automatisierbar.
- Beobachtungen verändern externe Konfiguration oder Repositoryzustand.
- Screenshots oder Logs enthalten private Daten.
- Ein diagnostischer Befund wird während des Runs unkontrolliert repariert.
- Surface-spezifische Beobachtung wird als universelle AGDF-Garantie interpretiert.

## 9. Nächster Schritt

UR prüfen und nur mit folgendem exakten Wert freigeben:

`Approval: UR`
