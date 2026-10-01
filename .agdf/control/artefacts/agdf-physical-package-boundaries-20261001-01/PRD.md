# PRD: Physische Core-/CLI-/MCP-Paketstruktur

Status: draft
Gate: PRD
Gate approval: open
Based on: UR.md; BROWNFIELD_REVIEW.md
Date: 2026-10-01
Owner: Arndt Gold
Run: agdf-physical-package-boundaries-20261001-01
Language: de
Traceability contract: criteria-chain-v1

## 1. Product Scope

Das Repository erhält die verbindliche physische Struktur `plugins/agdf/`, `packages/core/`, `packages/cli/`, `packages/mcp-server/`, `docs/`, `evals/` und `scripts/`, mit tatsächlich getrennten Zuständigkeiten und kompatiblen bestehenden Verbrauchern.

Maintainer können Kontrollregeln und Validatoren im Core, Befehle/Installation/Setup in der CLI und Protokoll-/Transportadapter im MCP-Paket finden. Der Core besitzt die Kontrollentscheidungen und Zustandsänderungen; CLI und MCP verwenden diesen Owner. Ein verschobenes Mischpaket, nur logische Grenzen oder gepflegte Kopien in alten Quellbäumen erfüllen diesen PRD nicht.

```text
repository/
├── plugins/agdf/
│   ├── plugin.json
│   ├── skills/
│   ├── mcp.json             # profilabhängig; siehe AC-009
│   ├── hooks/               # profilabhängig; siehe AC-009
│   ├── assets/
│   ├── meta/contracts/
│   └── control/templates/
├── packages/
│   ├── core/                # Regeln, Kontrollzustand und Validatoren
│   ├── cli/                 # Befehle, Installation, Setup und Host-Komposition
│   └── mcp-server/          # Protokoll-/Transportadapter
├── docs/
├── evals/
└── scripts/                # übergreifender Build, Release und Prüfwerkzeuge
```

Repository-Konfiguration, bestehende Website und Governance-Dateien dürfen daneben ihre eigenen Owner behalten; dieser Baum verlangt keine fachfremde Umstrukturierung. Paketlokale Tests bleiben bei ihrem Code-Owner. Übergreifende Build-/Release-Logik erhält hingegen einen kanonischen Owner unter Root `scripts/`.

Die bestehenden drei öffentlichen npm-Identitäten bleiben `create-agdf`, `@agdf/cli` und `@agdf/mcp-server`. Physische Quellpakete sind von Veröffentlichungs- und Runtime-Artefakten zu unterscheiden. Eine zusätzliche Core-Veröffentlichung ist kein stiller Bestandteil dieses Auftrags. Wie die drei Identitäten aus den neuen Quellen zusammengesetzt werden, entscheidet SD unter diesen Kompatibilitätsbedingungen.

## 2. UX Intent And Success

- ui_ux_impact: none
- ux_intent_definition: not_applicable; Brownfield Review klassifiziert keine neue Benutzerfähigkeit, Entscheidung, Zustands-/Feedback- oder Recovery-Semantik.
- primary_user_intent: Maintainer findet den zuständigen Code-Owner direkt in der physischen Paketstruktur; bestehende Anwender verwenden ihre bisherigen Befehle und Integrationen weiter.
- success_signal: Zielbaum und technische Abhängigkeitsgrenzen sind nachgewiesen; echte Pakete und erzeugte Profile erfüllen die bisherigen Verbraucherverträge.
- primary_decision_or_action: Arndt Gold nimmt den vollständigen Zielbaum einschließlich sichtbarer profilbedingter Abweichungen und kompatibler Verbraucher ab.

## 3. Working Modes And Effective State

Die Migration führt keine neuen Produktmodi ein. Die Tabelle hält bestehende Zustandsautorität und Nachweisebenen auseinander.

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Repository-Entwicklung | Kanonische Plugin-/Software-/Buildquellen an den neuen Ownern | Quelle, generiertes Profil, Archiv, Prüfbericht separat | Quell-Owner und reproduzierbarer Build; kein generiertes Artefakt wird kanonische Policy | Architektur-/Paketdokumentation und Build-/Prüfbericht |
| Bestehender CLI-/Offline-Validator-/MCP-Betrieb | Derselbe gebundene Ziel-/Run-/Revisionszustand mit unveränderten Kontrollentscheidungen | Bestehende Ergebnisse, Karten, Blocker und nächste Aktion | Ein Kontrollkern; menschliche Gate-Freigabe und bestehende Zustandsvalidierung | Bestehende CLI-/Dispatch-Interaktionsprojektion |
| Bestehende Hostinstallation | Profil, Consent, Trust und Sessionstatus bleiben getrennte Tatsachen | Erzeugt/gepackt/installiert/geladen sowie technische Grenzen explizit | Bestehende Installer-, Provenance-, Host- und Consent-Owner | Bestehende Setup-/Statusprojektion; Bericht benennt seine Evidenzebene |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Nur die genehmigte Quell-/Paketmigration wird umgesetzt. Bestehende Request-Activation, Zielbindung, Plugin-/MCP-Enable/Disable und Consent behalten ihre Semantik. Der Quellumzug aktiviert keine neue öffentliche Hook-/MCP-Fähigkeit.
- blockers_and_visible_next_actions: Fehlende oder widersprüchliche Paketressourcen, Versionen, Provenance oder Ziel-/Runbindung führen weiterhin zur bestehenden fail-closed Recovery; der Bericht benennt den betroffenen Owner und nötigen Nachweis. Ein unvollständiger Zielbaum darf nicht als abgeschlossen dargestellt werden.
- recovery_paths: Die Migration erhält überprüfbare Zwischenstufen und einen begrenzten Rückweg auf konsistente Quellen und Build-/Paketartefakte. Bestehende retry-/repair-/rollback-Ausgaben bleiben kompatibel; automatische Hostmutationen oder Datenmigration sind daraus nicht abgeleitet.
- relevant_state_transitions: Ausgangsquellen → migrierte Quellen → erzeugte Profile → echte npm-Archive → Verbrauchernachweis. Jeder Übergang benennt Version/Quelle und Fehler-/Rückweg. Eine aktive Installation oder frische Hostsession ist ein eigener, gesondert autorisierter Nachweisschritt.

## 5. Acceptance Criteria

Die folgenden IDs bleiben für SD, TP und QA stabil. Die Kriterien beschreiben beobachtbare Ergebnisse; ihre konkrete Implementierung und Testfälle werden erst in SD/TP festgelegt. UX-Erweiterungskriterien sind nicht anwendbar; unveränderte Benutzer- und Kontrollsemantik wird trotzdem als Regression nachgewiesen.

- criterion_id: AC-001
  - observable_success: Die kanonischen Softwarequellen liegen physisch unter `packages/core/`, `packages/cli/` und `packages/mcp-server/` mit den benannten Zuständigkeiten. `create-agdf/`, `agdf/` und `agdf-mcp-server/` bleiben keine aktiven parallelen Quell-Owner.
  - evidence: Tatsächlicher Endbaum; modulbezogene Owner-Zuordnung; Inventur alter aktiver Pfade mit begründeten historischen/API-/Artefaktfällen.

- criterion_id: AC-002
  - observable_success: Regeln, Gate-/Run-/Revisions-/Approval-Validierung und Kontrollzustand haben genau einen Implementierungs-Owner im Core. CLI, Offline-Komposition und MCP verwenden dessen Schnittstellen; kein Verbraucher implementiert eine zweite Autorisierungsentscheidung.
  - evidence: Owner-/Consumer-Inventur; relevante Kontroll- und Mutationspfade; positive und negative Kontrollszenarien mit identischen Ergebnissen über die unterstützten Adapter.

- criterion_id: AC-003
  - observable_success: Core benötigt weder CLI-Komposition/Hostinstaller noch MCP-Adapter/SDK; keine direkten oder transitiven Rückimporte und keine Paketzyklen bleiben im Endzustand. Ressourcen-/Contract-Auflösung ist einem gemeinsamen Owner zugeordnet und funktioniert auch außerhalb des Repository-Quellbaums.
  - evidence: Prüfung statischer Import-/Exportkanten und Paketmetadaten; Behandlung dynamischer Auflösung; isolierter Core-/Ressourcen-Verbrauchernachweis ohne CLI-/MCP-/Installerabhängigkeit.

- criterion_id: AC-004
  - observable_success: CLI besitzt Befehle, Installation, Setup und Host-Komposition. Die bisherigen Befehle, Flags, Exit-/Fehlerverträge, relevante JSON-Schemas und Interaktionsausgaben bleiben kompatibel.
  - evidence: Bestehende CLI-/Setup-Regressionsfälle aus dem migrierten Code und aus tatsächlichem Paketinhalt; Host-/Installmutationen ausschließlich in isolierten kontrollierten Testzielen.

- criterion_id: AC-005
  - observable_success: MCP besitzt Protokoll-/Transportkomposition und nutzt dieselben Kontrollentscheidungen wie CLI. Toolnamen/-Schemas, read-/write-Grenzen, Zielbindung und nichtautorisiertes Dispatch-Verhalten bleiben kompatibel. Eine spätere UI kann diesen Adapter nutzen, ohne Kontrollautorität zu duplizieren.
  - evidence: Bestehende MCP-Vertrags-/Handshake-/Dispatch-/Inspektionsnachweise aus dem tatsächlichen MCP-Paket; erklärte Anschlussgrenze, kein UI-Fertigstellungsanspruch.

- criterion_id: AC-006
  - observable_success: Die npm-Namen `create-agdf`, `@agdf/cli`, `@agdf/mcp-server`, ihre unterstützten bin-/Exportpfade, Node-Baseline und exakten gemeinsamen Versionsbindungen bleiben kompatibel. Externe Verbraucher brauchen keinen Repository-Checkout und keine neuen manuell nachzuinstallierenden Voraussetzungen.
  - evidence: Vorher/Nachher-Manifeste und Lock-/Versionsprüfung; tatsächliche npm-Archive mit Inhalt, Abhängigkeiten und importierbaren öffentlichen Exports; CLI-/MCP-Verbrauchertests außerhalb des Quellcheckouts.

- criterion_id: AC-007
  - observable_success: Erzeugte lokale Offline-Validatoren funktionieren weiterhin ohne npm-/Netzzugriff mit ihren unterstützten Kontrollbefehlen. Profile enthalten nur die für sie zulässigen Runtimebestandteile; insbesondere wird das Copilot-Payload nicht durch Installer-/MCP-SDK-Übernahme aufgebläht.
  - evidence: Profilbezogene Inhalts-/Digest-/Integritätsprüfung, Offline-Verbrauchertests und vollständige semantische Payload-Inventur; bestehende Budget-/Ausschlussregeln ohne versteckte Lockerung.

- criterion_id: AC-008
  - observable_success: `plugins/agdf/` bleibt die einzige kanonische Pluginquelle für Identität, Skills, Verträge, Assets und Templates. Quelle, generiertes Profil, Runtimebundle, npm-Archiv und Installation sind nachvollziehbare Projektionen dieser Quellen mit geprüfter Versions-/Provenance-Bindung.
  - evidence: Quell→Artefakt-Zuordnung je Profil; vorhandene Integrity-/Provenance-Szenarien einschließlich Manipulations- und Versionsabweichungsfällen.

- criterion_id: AC-009
  - observable_success: MCP-/Hook-Dateien des Zielbaums sind für jedes bestehende Profil ausdrücklich zugeordnet. Wo ein Profil diese Fähigkeit bisher trägt, bleibt es funktionsfähig; das öffentliche skills-only Profil bleibt skills-only. Ein abweichender Dateipfad oder profilbedingt fehlender optionaler Eintrag ist technisch begründet, mit Owner und Auswirkung sichtbar entschieden und vor Abnahme akzeptiert. Die drei Softwarepakete dürfen nicht als Abweichung entfallen.
  - evidence: Profilmatrix mit kanonischen und erzeugten Datei-/Discoverypfaden, aktiviertem Verhalten und Nachweis; jede notwendige Zielbaumabweichung spätestens im SD als explizite Entscheidung zur Freigabe, keine nachträgliche stillschweigende Ausnahme.

- criterion_id: AC-010
  - observable_success: Übergreifender Build, Profil-/Assetgenerierung, Release und gemeinsame Prüfwerkzeuge haben einen kanonischen Owner unter Root `scripts/`. Root-/Paketbefehle und CI verwenden ihn; paketlokale Einstiegspunkte delegieren ohne zweite Build-/Releaselogik.
  - evidence: Entrypoint-/Owner-Matrix; erfolgreicher Build im sauberen Checkout; relevante CI-/Release-Vorbereitung und generated-asset-Reihenfolge mit neuen Pfaden.

- criterion_id: AC-011
  - observable_success: Laufende Installation, Update/Repair/Disable/Recovery und Runtime-Provenance bleiben unter ihren bestehenden Daten-/Installationspfaden kompatibel. Die Codeverschiebung verändert keine Kontrollzustandsformate, Approval-Bindungen, Consent-/Trustgrenzen oder Benutzerdateien.
  - evidence: Isolierte Lifecycle-/Recovery-/Ownership-/Consent-Regressionsszenarien; erhaltene Zustands-/Installationsverträge; Hash-/Version-/Tampernachweise.

- criterion_id: AC-012
  - observable_success: Release-/Versionprüfungen und historische Profil-/Paketvergleiche funktionieren trotz neuer aktiver Quellpfade. Unveränderliche Tags und frühere Artefakte behalten ihre damaligen Pfade und Aussage.
  - evidence: Aktuelle Version-Coherence/Archivprüfung; vorhandene historische Fixtures/Tag-Reader mit expliziter historischer Pfadauflösung; keine Umschreibung alter Reports als neue Umsetzung.

- criterion_id: AC-013
  - observable_success: Aktuelle Dokumentation, SoT, Context Graph, aktive Tests/Evaluationen und Workflows zeigen die tatsächlichen neuen Owner. Gepflegte alte Quellen, zweite Regel-/Buildkopien und ungeklärte aktive Pfadverweise fehlen.
  - evidence: Kuratierte Referenz-/Owner-Prüfung samt Suchinventur; aktuelle Architektur-/Install-/Entwicklungsdokumentation; historische und öffentliche Kompatibilitätsverweise getrennt begründet.

- criterion_id: AC-014
  - observable_success: Die Migration ist in prüfbare konsistente Zwischenstufen und einen begrenzten Rückweg gegliedert. Fehler führen zu einem bekannten konsistenten Stand; fremde Workspace-/Indexänderungen und andere Run-Freigaben werden nicht überschrieben oder übernommen.
  - evidence: Baseline/Revisionen, Zwischenstufen-, Fehler- und Rückwegplan mit späteren Ausführungsnachweisen; scoped Diff und kanonisch gebundene Run-Artefakte.

- criterion_id: AC-015
  - observable_success: Der Abschlussbericht vergleicht den tatsächlichen Quellbaum und die installierbaren Profile ausdrücklich mit diesem Zielbaum und jedem Kriterium. Er unterscheidet Repository-, Build-, npm-Archiv-, isolierte Installations-, echte Host- und frische Sessionevidenz; ungetestete Hosts/Windows werden nicht als verifiziert ausgewiesen.
  - evidence: Kriteriengebundener QA-/Abschlussbericht, tatsächlicher Endbaum, Profilmatrix, konkrete Artefakt-/Verbrauchernachweise und sichtbare verbleibende Einschränkungen.

## 6. Non-Goals

- Keine neue Policy, Gatefolge, Freigabeautorität, Benutzerfähigkeit, CLI-/MCP-Schnittstellenerweiterung oder Kontrollzustandsmigration.
- Keine neue UI, kein Remote-Service und keine Personal-/Teamreorganisation.
- Keine vierte öffentliche npm-Veröffentlichung als implizite Folge eines internen Core-Pakets.
- Keine automatische aktive Nutzerinstallation, Registry-Veröffentlichung, Commit-/Push-/PR-Aktion oder Portaländerung durch Freigabe dieses PRD.
- Keine fachfremde Neustrukturierung der Website und keine Umschreibung historischer Gates/Reports oder pauschale Workspacebereinigung.

## 7. Users And Roles

- Arndt Gold: PRD Owner und menschliche Produkt-/Gate-Abnahme einschließlich sichtbarer Zielbaumabweichungen.
- Maintainer: findet und ändert den zuständigen Owner; nutzt dieselben vorhandenen Entwicklungs-, Prüf- und Releasebefehle mit neuen kanonischen Quellen.
- Bestehende CLI-/Plugin-/MCP-Verbraucher: erhalten ihre unterstützten Verträge und bisherigen Kontroll-/Installationssemantiken.
- Codex: untersucht, bereitet SD/TP vor und setzt erst nach gültigen nachfolgenden Freigaben um; Runtimevalidierung erteilt keine menschliche Zustimmung.
- Kontroll-/CLI-/MCP-/Build-/QA-Owner: fachliche Implementierungszuständigkeiten des vorhandenen Codes; deren konkrete Modul- und Schnittstellenzuordnung wird in SD benannt, keine zusätzlichen parallel autorisierenden Instanzen.

## 8. Constraints

Die genehmigte UR und kanonischen Pluginverträge bleiben maßgeblich. `criteria-chain-v1` bindet nachfolgende SD-/TP-/QA-Mappings an diese Kriterien. Bestehende lokale Runtime-Paketnamen oder öffentliche Kompatibilitätsfassaden dürfen erhalten bleiben, solange sie eine erklärte Projektion oder Delegation sind und keine zweite gepflegte Quelle darstellen.

Die Core-Grenze muss wirkliche Abhängigkeiten trennen. Eine Fassade, die im Hintergrund weiter die CLI importiert, erfüllt AC-002/003 nicht. Ressourcen-/Metadatenauflösung und Git-/Hostanbieter müssen explizite technische Owner erhalten. Vorhandene Rückabhängigkeiten werden durch dieses PRD nicht als bleibende Schuld akzeptiert.

Aktive Installationen und Registryzustände sind separate operative Ziele. Isolierte Paket-/Lifecycle-Tests sind Teil der Verifikation; reale Mutationen brauchen den später konkreten Auftrag. Bestehende Host-/Windows-Evidenzlücken anderer Runs sind keine automatische Paritätszusage dieses Runs.

## 9. Evidence Requirements

Die Tabelle in §5 ist der einzige Produkt-Akzeptanzowner. SD ordnet jedem Kriterium genau einmal Design, Quelle/Owner, stabile SDD-Entscheidung und Kompatibilitäts-/Risikobehandlung zu. TP bindet Kriterien und Entscheidungen an Tasks, Szenarien, erwartete Ergebnisse und Evidenz.

Mindestens erforderlich sind technische Abhängigkeits-/Ownership-Prüfung, saubere Checkout-/Generierungsreihenfolge, echte npm-Archive mit externen Verbrauchern, alle betroffenen vorhandenen Kontroll-/CLI-/MCP-/Offline-/Lifecycle-/Provenance-Regressionen, Profil-/Payload-/Versions-/History-Nachweise sowie kuratierte aktive Referenzprüfung. Welche Tests konkret nötig sind und in welcher Reihenfolge sie laufen, wird im TP festgelegt.

Neue Brownfield-Evidenz: `BROWNFIELD_REVIEW.md`, `evidence/DEPENDENCY_INVENTORY.json`, `evidence/BASELINE.json`, `evidence/ACTIVE_RUN_INVENTORY.json`. Die statische Analyse und bisherige Ergebnisse des separaten Pluginstruktur-Runs sind Ausgangslage, kein fertiger Nachweis dieser noch nicht implementierten Migration.

## 10. Risks And Open Questions

Der aktuelle Contract-Reader liegt in CLI, der Offline-Validator komponiert CLI-Handlers, und Core-Metadaten hängen an relativen generated-Pfaden. Die drei veröffentlichten Paketidentitäten und Install-/Releasepfade sind exakt gekoppelt. Diese belegten Risiken erfordern technische Entscheidungen vor Umsetzung, siehe unten.

Neu eintretende Änderungen an Produktsemantik, öffentlichem Veröffentlichungsumfang oder Abnahmebedingungen sind keine bloße SD-Detailentscheidung: PRD revidieren und neu freigeben. Eine unvermeidbare verbleibende Schuld oder Zielbaumabweichung braucht konkreten Grund, accountable owner, Mitigation und endliche Exit-/Review-Bedingung; unbekannte Auswirkungen gelten nicht als akzeptiert.

## Approval Decisions

Alle `before_prd`-Antworten ergeben sich aus der bereits genehmigten UR; kein zusätzlicher Produktentscheid wird aus offenem technischen Design abgeleitet. Offene `later_sd`-/`later_tp`-Punkte dürfen die aufgelösten Produktbedingungen nicht ändern.

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Verbindlicher Zielbaum und tatsächliche Verantwortungsgrenzen | before_prd | resolved | Physische drei Softwarepakete und kanonische Plugin-/Buildquellen gemäß UR; eine logische Umbenennung reicht nicht. AC-001–003/010/013/015. | Arndt Gold |
| Bestehende Produkt-/Profilfähigkeiten und Kontrollautorität | before_prd | resolved | Bisherige Fähigkeiten und Befehle erhalten; skills-only bleibt skills-only; keine UI oder neue MCP-/Hook-Aktivierung. AC-004/005/008/009/011. | Arndt Gold |
| Veröffentlichungs- und operative Akzeptanzgrenze | before_prd | resolved | Bestehende drei npm-Identitäten erhalten, kein implizites viertes Release; Quelle/Paket-/Profilkompatibilität nachweisen; reale Installation/Publikation bleibt gesonderter Auftrag. AC-006/007/012/014/015. | Arndt Gold |
| Interne Core-Schnittstellen, Ressourcen-/Git-/Hostprovider und CLI-/MCP-Komposition | later_sd | open | Design mit einem Kontroll-/Metadatenowner und ohne Core-Rückabhängigkeit; stabilen öffentlichen Vertrag bewahren. | Codex, Core-/CLI-/MCP-Owner; SD-Abnahme Arndt Gold |
| Private Core-Grenze und Assemblierung der drei npm-Pakete | later_sd | open | Variante einschließlich Exports, Versionen, Ressourcen und Archivinhalten unter AC-006 entscheiden; neue Veröffentlichung nur nach revidiertem Produktentscheid. | Codex, Paket-/Release-Owner; SD-Abnahme Arndt Gold |
| Profilbezogene MCP-/Hook-Pfade und eventuelle optionale Zielbaumabweichung | later_sd | open | Pfadmatrix und technische Begründung mit Owner/Auswirkung vorlegen; konkrete Abweichung explizit im SD zur Freigabe ausweisen, ohne Softwarepakete oder vorhandene Fähigkeit zu streichen. | Codex, Profil-/Build-Owner; SD-Abnahme Arndt Gold |
| Migrationsfolge, konsistente Zwischenstufen, Rückweg und konkrete Prüfmatrix | later_tp | open | Stufen/Abhängigkeiten und Szenarien gegen jedes Kriterium und jede SD-Entscheidung planen. | Codex, CLI-/Release-/QA-Owner; TP-Abnahme Arndt Gold |

## 11. Next Step

Dieses PRD im ausgewählten neuen Run persistieren, an die aktuelle Revision binden und präsentieren. Mit einer neuen `Approval: PRD` wird das Solution Design erlaubt; Quellimplementierung folgt erst nach neuer SD-/TP-Freigabe und positiver Implementierungsvorbereitung.
