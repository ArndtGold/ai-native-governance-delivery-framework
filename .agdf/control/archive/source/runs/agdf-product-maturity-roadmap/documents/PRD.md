# PRD: AGDF Product Maturity Roadmap

Status: approved
Gate: PRD
Gate approval: `Approval: PRD` accepted on 2026-07-28 after same-run, same-gate, revision-4 and durable-artefact revalidation.
Based on: genehmigte UR, Brownfield Review `structured_delivery`, UX Intent `ready`
Date: 2026-07-28
Owner: user / agent

## 1. Produktziel

AGDF soll für neue und erfahrene Nutzer proportional, verständlich und ehrlich durchgesetzt wirken,
ohne seine bestehende Autoritäts-, Evidenz- und fail-closed-Strenge zu reduzieren.

Die Roadmap ist ein koordinierender Produktvertrag. Sie definiert messbare Reifegradkriterien,
verbindliche Evidenzklassen, Abhängigkeiten und getrennte Arbeitslinien. Sie ist kein gemeinsamer
Implementierungs-Scope für alle fünf Linien.

## 2. Zielgruppen und Kernaufgabe

### Primäre Zielgruppe

Entwickler, Architekten und Maintainer, die AGDF über Codex, Claude Code oder OpenCode verwenden und
Governance-Sicherheit benötigen, ohne das vollständige interne AGDF-Modell auswendig zu kennen.

### Kernaufgabe

Der Nutzer muss jederzeit zuverlässig erkennen können:

1. woran AGDF arbeitet;
2. welcher Zustand und welche Autorität effektiv gelten;
3. was als Nächstes zulässig ist; und
4. welche echte Nutzerentscheidung jetzt erforderlich ist.

## 3. Verbindliche Produktoberflächen

- **Verbindliche Full-Surface-Baseline:** Codex, Claude Code und OpenCode.
- **Kompatibilitätsoberflächen:** GitHub Copilot und Generic bleiben im Scope der generierten
  Contract-/Instruction-Parität, aber ohne unbelegte technische Host-Garantien.
- Surface-spezifische Einschränkungen dürfen sichtbar und ehrlich sein. Parität bedeutet dieselben
  Produkt- und Autoritätsregeln, nicht identische Host-Funktionen.

## 4. Evidenzmodell

Jede Reifegradaussage verwendet genau eine sichtbare Evidenzklasse:

1. `repository_tested`
2. `deterministic_replay`
3. `authenticated_host_observed`
4. `user_accepted`
5. `unverified`

Eine niedrigere Klasse darf nicht als höhere ausgegeben werden. Insbesondere beweisen Repository-Test
und Replay weder authentifizierte Host-Darstellung noch reale Modellbefolgung.

Jede kritische Garantie verwendet zusätzlich genau eine Enforcement-Klasse:

- `tool_enforced`
- `validator_enforced`
- `host_limited`
- `instruction_only`
- `not_enforceable`

## 5. Roadmap-Anforderungen

### PMR-1 — Sichtbare Zeremonie

AGDF darf nur echte Nutzerentscheidungen als Entscheidung präsentieren.

Akzeptanz:

- Pure Quick Tasks erzeugen keine Gate-Freigabe.
- Compact Delivery erzeugt keine separate Nutzerentscheidung für Brownfield Review oder
  Mode/Slice-Auswahl.
- Structured Delivery fordert genau eine bewusste Antwort pro tatsächlich offenem User Gate und
  keine Antwort für interne Reviews.
- Derselbe Status oder dieselbe Gate-Aufforderung wird innerhalb eines Zustands nicht doppelt
  präsentiert.
- Audit-Evidenz bleibt dauerhaft vollständig, die Standardinteraktion bleibt kompakt.

### PMR-2 — Enforcement-Transparenz

Für mindestens diese kritischen Garantien muss eine surfacebezogene Enforcement-Matrix vorliegen:

1. primäres Arbeitsziel vor Repository-Aktivierung;
2. Trennung von Evidenzquelle und Mutationsziel;
3. ausgewählter Run und Governance-Ziel;
4. exakte Approval-Werte und Revalidierung;
5. Schreibschutz bei read-only Delivery Path Search;
6. exact-version lokaler Validator;
7. generierte Surface-/Contract-Parität;
8. Subagent-, Hook- und sonstige bekannte Host-Bypässe.

Akzeptanz:

- Jede Zelle nennt Enforcement-Klasse, Evidenzklasse, Quelle und bekannte Grenze.
- Fehlende technische Durchsetzung wird nicht durch eine globale Produktbehauptung überdeckt.
- Neue technische Maßnahmen erweitern bestehende Owner; surface-spezifische Policy-Kopien sind
  unzulässig.

### PMR-3 — Live-Host-Conformance

Ein eigenständiger erster Folgerun definiert und führt eine gemeinsame Conformance-Matrix aus.

Pflichtfälle:

- explizite externe Datei bei abweichendem Arbeitsordner;
- erwähntes Repository nur als Evidenz oder Bewertungsgegenstand;
- mehrere plausible Ziele;
- Target-Content-Mismatch;
- nicht verfügbares Attachment mit Retry;
- eindeutige Mehrturn-Fortsetzung;
- expliziter Zielwechsel;
- Aktivierung/Neustart;
- mehrere aktive Runs;
- exaktes Approval;
- ungenaues oder implizites Approval;
- Host- oder Subagent-Pfad ohne vollständige Enforcement-Abdeckung.

Akzeptanz:

- Jeder Pflichtfall besitzt Erwartung, tatsächliche Beobachtung, Host/Version, Evidenzklasse,
  Enforcement-Klasse, Ergebnis und Recovery.
- Ein Fall besteht nur bei direkter passender Beobachtung; eine ehrlich sichtbare Einschränkung ist
  ein dokumentierter Produktzustand, aber kein technischer Pass.
- Secrets, private Prompts und nicht redigierte Nutzerinhalte werden nicht persistiert.

### PMR-4 — Automatische Proportionalität

Ein versioniertes Benchmark-Korpus muss reale AGDF-Aufgaben gegen den erwarteten Delivery Path prüfen.

Akzeptanz:

- Mindestens 40 repräsentative Fälle decken Trivial Change, Quick Task, Compact Delivery,
  Verified Change, Structured Slice und Structured Delivery ab.
- Mindestens ein Viertel der Fälle sind adversariale Grenzfälle.
- Unter-Governance bei Fällen mit neuer Produktsemantik, Gate-, Sicherheits-, Persistenz- oder
  Architekturwirkung beträgt `0`.
- Über-Governance bei eindeutig trivialen oder ungated Quick Tasks beträgt höchstens `10 %`.
- Jede Einstufung besitzt eine kurze Begründung und nutzt den bestehenden Challenge-/Why-Pfad.
- Benchmark-Optimierung darf keine Gate- oder Evidenzanforderung abschwächen.

### PMR-5 — Einfache Standard-Journey

Die Standardinteraktion verwendet Progressive Disclosure über den bestehenden
Interaction-/Presentation-Owner.

Akzeptanz:

- Die erste sichtbare Ebene beantwortet Ziel, Status, nächste Aktion und aktuelle Entscheidung.
- Interne Begriffe wie Context Graph, OR oder Artefact Chain erscheinen nur, wenn sie für die
  Entscheidung relevant oder ausdrücklich angefordert sind.
- `Why?` liefert Begründung ohne Autorisierung.
- Blocker nennen eine konkrete Recovery-Aktion; transiente Hostfehler bieten sichtbaren Retry.
- Host-native Controls bleiben Adapter; exakter Text bleibt universeller Fallback.
- Es entsteht kein zweiter State Store, Router, Scope-Classifier, Presentation-Owner oder
  Governance-Dashboard-SoT.

### PMR-6 — Verständlichkeit

Die Journey muss nicht nur technisch korrekt, sondern für neue Nutzer verständlich sein.

Akzeptanz:

- Mindestens acht verblindete Verständlichkeitsszenarien decken Quick, Compact, Structured,
  Blocked Recovery, Host-Limit und Target-Wechsel ab.
- In jedem Szenario können Nutzer beziehungsweise unabhängige UAT-Teilnehmer Ziel, Status, nächste
  Aktion und Entscheidungswirkung korrekt bestimmen.
- Kritische Missverständnisse über Mutationsziel, Approval-Autorität oder angeblich verifizierte
  Host-Garantien sind nicht akzeptabel.
- Automatisierte Verständlichkeits-Fixtures dürfen echte Nutzer-UAT ergänzen, aber nicht ersetzen.

### PMR-7 — Schutzwirkung

Weniger sichtbare Interaktion gilt nur dann als Verbesserung, wenn die Schutzwirkung mindestens
gleich bleibt.

Akzeptanz:

- Exact-Approval-, Target-, Brownfield-, Quality- und Context-Graph-Regressions bleiben grün.
- Jede entfernte Interaktion ist als redundant oder intern belegt.
- QA blockiert bei offener Unter-Governance, unklarer Enforcement-Aussage oder nicht erfüllter
  sichtbarer UX-Evidenz.

## 6. Arbeitslinien und Abhängigkeiten

| Reihenfolge | Arbeitslinie | Eintrittsbedingung | Ergebnis |
|---:|---|---|---|
| 0 | Baseline Closeout | offene QA-/UAT-Artefakte sind prüfbar | akzeptierte oder ausdrücklich begrenzte Ausgangsbasis |
| 1 | Live-Host-Conformance | Roadmap-PRD freigegeben; eigener Run genehmigt | reale Gap-Liste statt Fixture-Annahmen |
| 2 | Proportionalität und Zeremonie | Conformance-Befunde und 40-Fall-Benchmark definiert | weniger Reibung bei unveränderter Schutzwirkung |
| 3 | Enforcement Closure | Garantie-Matrix benennt konkrete technisch schließbare Lücken | gezielte Owner-Erweiterungen ohne Universalclaim |
| 4 | Unified Journey | Zustände, Routing und Enforcement-Aussagen stabil | novice-taugliche Progressive-Disclosure-Journey |

Jede ausführbare Arbeitslinie erhält nur bei konkreter Restlücke eine eigene UR und ihren
proportionalen Brownfield-Zuschnitt. Die Roadmap-PRD autorisiert diese Folge-Runs nicht automatisch.

## 7. Nicht-funktionale Anforderungen

- Bestehende persistierte Mode- und Approval-Werte bleiben kompatibel.
- Runtime Contracts und generierte Oberflächen bleiben deterministisch synchronisiert.
- Routinevalidierung bleibt exact-version und ohne stillen Registry-Zugriff.
- Surface-spezifische Host-Evidenz bleibt reproduzierbar, redigiert und versionsgebunden.
- Keine stille Erweiterung fremder aktiver Runs oder Übernahme ihrer Diffs.
- Neue Messungen dürfen keine privaten Inhalte oder Hidden Reasoning persistieren.

## 8. Nicht-Ziele

- Alle fünf Linien in einem SD oder TP implementieren.
- Identische native UI auf allen Hosts erzwingen.
- Copilot oder Generic als technisch gleichwertig zu Full Surfaces behaupten.
- Gates, Approval-Werte, Brownfield Review, QA oder UAT entfernen.
- Ein separates Dashboard als neue Autorität bauen.
- Bereits gelöste Funktionen allein zur Vereinheitlichung neu implementieren.
- Commit, Push, Pull Request, Release oder Reinstall.

## 9. Abnahmemodell

Die Roadmap gilt erst als erfolgreich, wenn:

- jede Arbeitslinie ihren eigenen evidenzbasierten Abschluss besitzt;
- PMR-1 bis PMR-7 nachvollziehbar erfüllt sind;
- Repository-, Replay-, Host- und Nutzerakzeptanz getrennt ausgewiesen bleiben; und
- der finale Reifegrad nicht nur weniger Interaktion, sondern unveränderte oder höhere
  Schutzwirkung zeigt.

## 10. Nächster Schritt

PRD prüfen und nur mit folgendem exakten Wert freigeben:

`Approval: PRD`
