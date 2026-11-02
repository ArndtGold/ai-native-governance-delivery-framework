# User Requirements: QA-Block Transition Integrity

Status: `approved`
Gate: UR
Revision: 1
Date: 2026-07-29
Run: `agdf-qa-block-transition-integrity`
Source finding: `SPF-06`
Gate approval: exaktes `Approval: UR` am 2026-07-29 nach Revalidierung von Run, Gate, Revision 1
und dauerhaftem Artefakt

## 1. Nutzerproblem

Ein dauerhafter QA-Bericht mit Entscheidung `block` wird vom Gate-Checker 0.11.4 als offener
QA-Approval-Pfad projiziert. Die Statuskarte meldet `missing_approval: Approval: QA` und erlaubt das
Anfordern der QA-Freigabe, obwohl `qa-gate` eine Freigabe bei `block` ausdrücklich verbietet.

Die nachgelagerte dauerhafte Artefaktprüfung verhindert weiterhin UAT, solange der QA-Bericht nicht
`pass` ist. Der Defekt ist daher eine widersprüchliche Transition-/Interaktionsprojektion, kein
belegter Autoritätsbypass.

## 2. Ziel

QA-Entscheidungen sollen über den bestehenden kanonischen Gate-Owner konsistent und fail-closed
projiziert werden:

- `pass` ohne Freigabe darf `Approval: QA` anfordern;
- `revise` darf keine Freigabe anfordern und muss zur Revision routen;
- `block` darf keine Freigabe anfordern und muss genau den blockierenden Remediation- oder
  Upstream-Schritt ausweisen;
- ein irrtümlich gespeichertes QA-Approval darf einen nicht-pass QA-Bericht niemals für UAT öffnen.

## 3. Anforderungen

### QBT-1 — Block-Erkennung

Der Gate-Checker erkennt den dauerhaften QA-Artefaktstatus `block` als eigene nicht
freigabebereite QA-Entscheidung.

### QBT-2 — Keine unzulässige Freigabeaufforderung

Bei QA-`block` sind:

- `missing_approval: none`;
- keine erlaubte Aktion zum Anfordern von `Approval: QA`;
- keine `approval_presentation`;
- UAT, Release und Delivery-Readiness ausdrücklich gesperrt.

### QBT-3 — Eindeutige nächste Aktion

Die Projektion übernimmt den dauerhaften nächsten zulässigen Remediation-/Upstream-Schritt, ohne
eine neue Produktentscheidung oder zweite Routinglogik zu erfinden.

### QBT-4 — Bestehende Zustände bewahren

Die Semantik für fehlenden QA-Bericht, noch nicht ausgeführtes QA, QA-`revise`, QA-`pass` ohne
Freigabe und genehmigtes QA-`pass` bleibt kompatibel.

### QBT-5 — Durable Fail-Closed

Ein gespeichertes `Approval: QA` zusammen mit QA-Artefaktstatus `block` oder `revise` öffnet UAT
nicht und erzeugt eine ehrliche Korrekturprojektion.

### QBT-6 — Oberflächenparität

Statuskarte, JSON, Approval Envelope und generierte Runtimeflächen verwenden dieselbe kanonische
Transitionentscheidung.

### QBT-7 — Regressionsevidenz

Automatisierte Tests decken mindestens ab:

- QA fehlt;
- QA `pass` ohne Approval;
- QA `revise`;
- QA `block`;
- QA `block` mit irrtümlich gespeichertem Approval;
- QA `pass` mit gültigem Approval.

Vollständiger Package-Smoke und Runtime Integrity müssen grün bleiben.

## 4. Nicht-Ziele

- keine neuen QA-Entscheidungswerte;
- keine Änderung der exakten Approval-Formel;
- keine neue Gate-Reihenfolge;
- keine Änderung von `qa-gate` als alleiniger QA-Entscheidungsowner;
- keine Structured-Slice-/Delivery- oder Benchmark-Semantik;
- keine automatische VCS-, Release- oder Reinstall-Aktion.

## 5. Akzeptanzsignale

- Ein reproduzierbarer QA-`block`-Fixture liefert `current_gate: QA`, keine fehlende Approval und
  keine Approval-Aktion.
- Die gerenderte Statuskarte enthält keine Aufforderung `Approval: QA`.
- QA-`revise` bleibt revisionsorientiert; QA-`pass` bleibt freigabefähig.
- QA-`block` plus gespeicherte Freigabe öffnet UAT nicht.
- Kein zweiter Transition-, Presentation- oder QA-Owner entsteht.
- Alle fokussierten und vollständigen Regressionstests sind grün.

## 6. Evidenz und Source of Truth

- `.agdf/control/artefacts/agdf-staged-proportionality-observation/QA_REPORT.md`;
- `.agdf/control/artefacts/agdf-product-maturity-roadmap/STAGED_PRODUCT_FINDINGS_ASSESSMENT.md`;
- `plugin/meta/contracts/gate-transition.md`;
- `plugin/skills/qa-gate/SKILL.md`;
- `create-agdf/lib/control-evaluation/gate-policy.js`;
- `create-agdf/lib/control-evaluation/run-state.js`.

## 7. Gate-Grenze

Diese UR autorisiert keine Implementierung. Nach exaktem `Approval: UR` folgt die
Brownfield Review mit Auswahl des kleinsten geeigneten Pfads.

Exakter Freigabewert:

`Approval: UR`
