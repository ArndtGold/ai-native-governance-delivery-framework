# UR: Task Target Resolution Boundary

Status: approved
Gate: UR
Gate approval: `Approval: UR` accepted on 2026-07-28 after same-run, same-gate, revision and durable-artefact revalidation.
Revision: 1
Date: 2026-07-28
Owner: user / agent

## 1. Problem

AGDF kann den Kontrollzustand mehrerer Repositories erkennen und eine Scope Classification
darstellen. Vor dieser repositorybezogenen Aktivierung fehlt jedoch eine kanonische Auflösung des
eigentlichen Arbeitsziels einer Nutzeranfrage.

Dadurch können der aktuelle Arbeitsordner, ein erwähntes Projekt und eine explizit benannte Datei
unbeabsichtigt als gleichrangige Ziele behandelt werden. Ein Repository kann dann zum
Governance-Ziel und sogar zum Änderungsziel werden, obwohl es nur als Evidenzquelle oder
Kontext erwähnt wurde. Das Framework klassifiziert in diesem Fall einen präzise aufgelösten
Repository-Scope, aber möglicherweise den falschen Task-Scope.

## 2. Ziel

Vor Repository-Aktivierung, Scope Classification und Gate-Auswertung muss AGDF das primäre
Arbeitsziel der aktuellen Anfrage bestimmen und sichtbar von Evidenzquellen sowie dem aktuellen
Arbeitsordner trennen. Nur das aufgelöste Ziel darf die anschließende Governance-Aktivierung und
Änderungsgrenze bestimmen.

## 3. Scope

Nach den erforderlichen Freigaben soll die kleinste sichere Änderung:

1. ein kanonisches Task-Target-Modell mit mindestens `primary_target`,
   `evidence_sources`, `working_directory` und `governance_target` definieren;
2. eine explizit vom Nutzer benannte Datei oder ein explizit benanntes Artefakt höher priorisieren
   als den aktuellen Arbeitsordner;
3. Evidenzquellen ausdrücklich von zulässigen Änderungszielen trennen;
4. AGDF nur für das aufgelöste Governance-Ziel aktivieren und erst danach Repository-Scope,
   Modus und Gates bestimmen;
5. bei einem Widerspruch zwischen angefragter Inhaltsänderung und Zielinhalt den Zustand
   `target_content_mismatch` sichtbar und fail-closed behandeln;
6. das bestätigte Ziel über zusammengehörige Folgeturns stabil halten, bis der Nutzer es ändert
   oder eine echte Mehrziel-Ambiguität entsteht;
7. Mehrziel-Ambiguität sichtbar machen und vor Mutation eine Klärung verlangen;
8. Router, `gate-check`, bestehende Scope-Presentation, generierte Oberflächen,
   Runtime-Integrity-Prüfungen und Verhaltens-Evals konsistent anpassen.

## 4. Nicht-Ziele

- Keine Änderung der Gate-Reihenfolge, der Approval-Werte oder der Approval-Autorität.
- Kein allgemeines Dateisystem-Sandboxing oder neues Berechtigungssystem.
- Keine automatische Absichtsermittlung außerhalb der expliziten Anfrage und ihrer stabilen
  Gesprächsfortsetzung.
- Kein zweiter Repository-Scope-Classifier und kein paralleler Presentation-Owner.
- Keine rückwirkende Reklassifikation historischer Runs.
- Kein Commit, Push, Pull Request, Release oder Reinstall in diesem Run ohne gesonderten Auftrag.

## 5. Akzeptanzsignale

1. Bei einer explizit benannten Datei außerhalb des aktuellen Arbeitsordners wird diese Datei als
   `primary_target` aufgelöst; der Arbeitsordner wird nicht automatisch zum Änderungsziel.
2. Erwähnte Repositories können als `evidence_sources` dienen, ohne dadurch Mutation oder
   repositorybezogene AGDF-Aktivierung zu autorisieren.
3. Scope Classification und Gate-Auswertung starten erst nach erfolgreicher Target Resolution.
4. Ein `target_content_mismatch` führt zu sichtbarer Klärung oder begrenzter Neuauslegung, nicht
   zu stiller Scope-Erweiterung.
5. Ein bestätigtes Ziel bleibt bei Folgeturns stabil; ein Zielwechsel ist sichtbar und begründet.
6. Mehrere plausible Änderungsziele führen vor Mutation zu einem fail-closed Ergebnis.
7. Runtime Integrity verhindert doppelte Semantik- oder Presentation-Owner.
8. Verhaltens-Evals decken explizite Datei vor `cwd`, Evidenz-vs.-Mutation,
   Inhalts-Mismatch, Folgeturn-Stabilität und Mehrziel-Ambiguität ab.

## 6. Bestehende Source of Truth

- `plugin/meta/agdf-agent-router.md` — Einstieg, Aktivierung und Moduswahl;
- `plugin/meta/contracts/gate-transition.md` — Source Precedence und Scope-Ambiguität;
- `plugin/meta/contracts/interaction.md` — sichtbare Scope-Presentation und
  Presentation-Ownership;
- `plugin/skills/gate-check/SKILL.md` — operative Scope- und Gate-Auswertung;
- `create-agdf/lib/interaction-presentation.js` — kanonischer Presentation-Owner;
- `plugin/scripts/check-runtime-integrity.mjs` — Ownership- und Drift-Prüfungen;
- `evals/cases/gate-check.json` — Verhaltens-Evidenz für `gate-check`.

## 7. Risiken und offene Punkte

- Die neue Grenze darf nicht als zweiter Scope-Classifier neben der bestehenden
  Scope Classification entstehen.
- Ein externes Datei-Artefakt kann primäres Ziel sein, während ein Repository nur fachliche
  Evidenz liefert; diese Autoritätsgrenze muss durch alle Oberflächen erhalten bleiben.
- Anhänge, nicht verfügbare Pfade und semantisch unpassende Zieldateien brauchen einen
  einheitlichen, sichtbaren Fehlerzustand.
- Gesprächsfortsetzungen dürfen das Ziel weder still verlieren noch unbegrenzt an einen alten
  Scope binden.
- Die Darstellung muss kompakt bleiben und darf keine neue Approval-Autorität erzeugen.

## 8. Nächster Schritt

Brownfield Review durchführen, bestehende Owner wiederverwenden und den kleinsten sicheren
Delivery Path bestimmen. Freigabe:

`Approval: UR`
