# UR: AGDF Product Maturity Roadmap

Status: approved
Gate: UR
Gate approval: `Approval: UR` accepted on 2026-07-28 after explicit run, target and scope revalidation.
Date: 2026-07-28
Owner: user / agent

## 1. Problem

AGDF ist als Governance-Layer konzeptionell und repositoryseitig belastbar, erreicht aber noch nicht
in allen Nutzungssituationen den gewünschten Produktreifegrad:

1. Die sichtbare Zeremonie ist für kleine oder klar begrenzte Änderungen teilweise zu hoch.
2. Kritische Grenzen sind je nach Host unterschiedlich stark technisch, validatorseitig oder nur
   instruktional durchgesetzt.
3. Deterministische Repository-Evidenz deckt reales Mehrturn-, Attachment- und Host-Verhalten nicht
   vollständig ab.
4. Die automatische Proportionalität kann kleine Arbeiten zu streng oder risikoreiche Arbeiten zu
   schwach klassifizieren.
5. Das interne Kontrollmodell ist für neue Nutzer sichtbarer und erklärungsbedürftiger als nötig.

Die fünf Befunde dürfen nicht als ein unkontrollierter Mega-Refactor umgesetzt werden. Bestehende
abgeschlossene und aktive AGDF-Runs besitzen bereits Teile der Lösung und bleiben autoritativ für
ihren jeweiligen Scope.

## 2. Ziel

AGDF von einer starken, aber teilweise zeremoniellen und instruktionalen Governance-Beta zu einem
proportionalen, host-verifizierten und einfach bedienbaren Control Layer weiterentwickeln, ohne
Freigaben, Evidenzgrenzen, Brownfield-Schutz oder fail-closed Verhalten zu schwächen.

## 3. Erforderliche Ergebnisse

### R1 — Weniger sichtbare Zeremonie

- Nutzer sehen nur echte Entscheidungen, relevante Ergebnisse und den nächsten zulässigen Schritt.
- Interne Reviews, Routing- und Kontrollschritte erzeugen keine künstlichen Nutzerfreigaben.
- Dauerhafte Evidenz bleibt vollständig, wird aber standardmäßig progressiv statt vollständig
  dargestellt.
- Bestehende Compact-Delivery- und Interaction-Arbeit wird zuerst per UAT bewertet und nicht
  dupliziert.

### R2 — Klare technische Durchsetzung

- Jede kritische AGDF-Garantie besitzt eine sichtbare Enforcement-Klasse:
  `tool_enforced`, `validator_enforced`, `host_limited`, `instruction_only` oder `not_enforceable`.
- Mutationsziel, Gate-Autorität, exakte Freigaben, Repository-Aktivierung und Schreibgrenzen werden
  pro unterstütztem Host ehrlich bewertet.
- Nicht technisch erzwingbare Regeln werden nicht als technische Garantie dargestellt.

### R3 — Echte Host- und Mehrturn-UAT

- Codex, Claude Code und OpenCode erhalten eine gemeinsame, wiederholbare Conformance-Matrix.
- Kritische Fälle umfassen externe Dateien, abweichenden Arbeitsordner, reine Evidenz-Repositories,
  mehrere plausible Ziele, Zielwechsel, nicht verfügbare Attachments, Neustart/Aktivierung und exakte
  sowie ungenaue Freigaben.
- Repository-, Replay-, authentifizierte Host- und UAT-Evidenz bleiben getrennt.

### R4 — Bessere automatische Proportionalität

- Ein repositoryeigenes Benchmark-Korpus deckt reale triviale, kompakte und strukturierte Aufgaben
  sowie adversariale Grenzfälle ab.
- Routing verwendet wenige nachvollziehbare Faktoren: neue Produktsemantik, Nutzerwirkung,
  Brownfield-Risiko, Reversibilität, Sicherheits-/Compliance-Auswirkung und betroffene Owner.
- Über- und Unter-Governance werden als getrennte Fehlerklassen gemessen.
- Nutzer können die Einstufung verstehen und über den bestehenden Challenge-Pfad korrigieren.

### R5 — Einfachere Nutzeroberfläche

- Die Standardinteraktion beantwortet: Arbeitsziel, entschiedener Stand, nächster Schritt und aktuell
  benötigte Entscheidung.
- Progressive Offenlegung hält interne Begriffe und vollständige Audit-Evidenz aus der Standardansicht
  heraus, ohne deren Autorität zu verändern.
- Host-native Interaktionen bleiben bevorzugt; exakte Textwerte bleiben der sichere Fallback.
- Es entsteht weder eine zweite State-Autorität noch ein zweiter Presentation-Owner.

## 4. Lieferstrategie

1. Offene QA-/UAT-Baselines für Task Target Resolution, Interaction/Compact Delivery und relevante
   Aktivierungsarbeit abschließen oder als explizite Evidenzgrenze dokumentieren.
2. Live-Host-Conformance als ersten neuen ausführbaren Arbeitslauf verwenden.
3. Proportionalität und sichtbare Zeremonie anhand der Host- und Benchmark-Evidenz schärfen.
4. Technische Enforcement-Lücken nur dort schließen, wo der jeweilige Host eine belastbare Grenze
   ermöglicht.
5. Die vereinfachte Gesamt-UX erst auf den stabilisierten Regeln und Zuständen aufbauen.

Der Brownfield Review entscheidet, ob diese Roadmap nur ein koordinierender Scope bleibt und welche
Ergebnisse eigene Runs benötigen. Er darf bestehende aktive Runs nicht still erweitern oder deren
Evidenz neu zuordnen.

## 5. Akzeptanzsignale

- Keine redundante Freigabeanforderung oder nutzerseitige Bestätigung eines rein internen Schritts.
- Kritische Garantien sind pro Host mit Enforcement-Level und Evidenzquelle nachweisbar.
- Alle kritischen Conformance-Fälle bestehen oder besitzen eine explizite sichtbare Einschränkung.
- Benchmark-Evidenz zeigt sowohl Schutz vor Unter-Governance als auch weniger Über-Governance.
- Ein neuer Nutzer kann Ziel, Status, nächste Aktion und Entscheidungswirkung ohne Kenntnis des
  vollständigen AGDF-Vokabulars erkennen.
- Bestehende SoT-, Contract-, Interaction-, Eval- und Control-State-Owner werden wiederverwendet.

## 6. Nicht-Ziele

- Gate-Reihenfolge, exakte Approval-Werte oder Nutzerautorität abschwächen.
- Repository-Tests als Live-Host-Beweis ausgeben.
- Eine universelle technische Durchsetzung behaupten, die der Host nicht unterstützt.
- Einen zweiten Router, Scope-Classifier, State Store, Presentation-Owner oder ein separates
  Governance-Dashboard als neue Autorität einführen.
- Alle fünf Arbeitslinien in einem einzigen Implementierungs-TP bündeln.
- Offene fremde Runs, bestehende Worktree-Änderungen, VCS-Aktionen, Release oder Reinstall automatisch
  verändern.

## 7. Risiken

- Ein überbreiter Roadmap-Run wird selbst zur Quelle zusätzlicher Zeremonie und Scope Drift.
- UX-Vereinfachung kann notwendige Evidenz oder Autoritätsgrenzen verbergen.
- Host-Matrizen können ohne authentifizierte Ausführung erneut nur Fixture-Evidenz produzieren.
- Technische Enforcement-Versuche können surface-spezifische Parallelstrukturen schaffen.
- Proportionalitätsoptimierung kann Unter-Governance begünstigen, wenn nur Interaktionsreduktion
  gemessen wird.

## 8. Nächster Schritt

Verpflichtenden Brownfield Review durchführen, bestehende Owner und aktive/abgeschlossene Runs
zuordnen, Überschneidungen benennen und den kleinsten belastbaren Run-Zuschnitt bestimmen.
