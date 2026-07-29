# UR: Structured Depth Positioning auf AGDF Pages

Status: ready_for_approval
Gate: UR
Gate approval: open
Revision: 1
Date: 2026-07-29
Owner: user
Run: `agdf-pages-structured-depth-positioning`

## 1. Problem

Die öffentliche Pages-Kommunikation beschreibt AGDF bereits als proportionalen, evidenzbasierten
Delivery-Workflow, bildet die neue kanonische Grenze zwischen `structured_slice`,
`structured_delivery` und unresolved Facts jedoch noch nicht präzise ab.

Insbesondere:

- neue Capability, UX oder Produktsemantik kann derzeit pauschal wie ein Full-Delivery-Trigger
  wirken, obwohl die normative Entscheidung wirkungsbasiert ist;
- Begriffe wie „bounded“ und „structured“ sind gegenüber den kanonischen Modewerten unscharf;
- die Gate Map zeigt nicht, dass Structured Slice und Structured Delivery dieselbe Gate-Reihenfolge
  und nur unterschiedliche Artefakttiefe besitzen;
- `depth_unresolved`, owner-orientierte Recovery und das Verbot numerischer Proxyentscheidungen
  sind öffentlich nicht verständlich sichtbar;
- die vorhandene `gateModeMatrix` ist nicht als klare Vergleichsfläche in Pages erkennbar.

Dadurch kann die Website mehr oder weniger Zeremonie versprechen als das Produkt tatsächlich
vorsieht.

## 2. Goal

Pages soll die proportionale AGDF-Pfadauswahl korrekt, verständlich und überprüfbar erklären:

- kompakte Pfade bleiben von strukturierten Pfaden getrennt;
- Structured Slice und Structured Delivery werden anhand belegter Wirkung unterschieden;
- beide strukturierten Modi verwenden dieselbe Gate-Reihenfolge;
- fehlende oder widersprüchliche Fakten führen sichtbar zu `block`/Recovery, nicht zu einer
  scheinbar sicheren Full-Delivery-Klassifikation;
- Datei-, Owner-, Consumer-, Task- oder Derived-Path-Zahlen werden nicht als alleinige
  Entscheidungsschwelle dargestellt.

## 3. Scope

Diese erste Slice umfasst:

- Korrektur widersprüchlicher oder zu pauschaler Public-Copy in `pages/src/data/site.ts`;
- kanonische, menschenlesbare Benennung von Quick/Compact, Verified Change, Structured Slice,
  Structured Delivery und Blocked/Depth Unresolved;
- eine kompakte sichtbare Vergleichsfläche „How AGDF chooses depth“;
- Präzisierung der Gate Map: gleiche strukturierte Gate-Kette, unterschiedliche Artefakttiefe;
- sichtbare Erklärung der sechs Full-Depth-Wirkungsfamilien auf angemessener Marketingtiefe;
- sichtbare Erklärung der sieben belegten Bounded-Slice-Bedingungen ohne zweite normative
  Vollkopie;
- sichtbare unresolved-Recovery und Proxy-Verbot;
- Ableitung dynamischer Evaluationszahlen aus der bestehenden Repositoryevidenz;
- responsive, barrierearme Darstellung innerhalb des vorhandenen Pages-Designsystems;
- fokussierte Copy-/Daten-/Render-/Build-Tests sowie sichtbare Browserprüfung.

## 4. Non-Goals

- keine Änderung an `plugin/meta/contracts/modes.md`, Gate Transition, Skills oder Runtime;
- keine neue Mode-, Gate-, Approval-, CLI- oder öffentliche Schemasemantik;
- keine Benchmark-v3-Kalibrierung oder historische Umwertung;
- kein vollständiges Pages-Redesign;
- keine neue zweite Produktpolicy in Pages;
- keine Release-, Deploy-, VCS- oder Reinstall-Aktion;
- keine Behauptung garantierter semantischer Modellbefolgung auf Live-Hosts.

## 5. Acceptance Signals

Die Anforderung ist bereit für PRD, wenn:

1. der Modes Contract als alleiniger normativer Owner benannt und Pages als erklärende Projektion
   abgegrenzt ist;
2. bestehende falsche oder missverständliche Public-Copy vollständig inventarisiert ist;
3. Structured Slice und Structured Delivery sichtbar dieselbe Gate-Kette verwenden;
4. Full Depth nicht allein aus Produktsemantik, UX oder Zahlen abgeleitet wird;
5. `depth_unresolved` verständlich als `block` mit fehlender Evidenz, Owner und erneuter Bewertung
   erklärt wird;
6. die Vergleichsfläche ohne vollständige Policyduplikation auskommt;
7. mobile, Desktop-, Tastatur-, Kontrast- und semantische HTML-Akzeptanzsignale festgelegt werden;
8. Evaluationszahlen repository-derived bleiben und keine Live-Host-Evidenz vortäuschen.

## 6. Existing Source Of Truth

- `plugin/meta/contracts/modes.md`, Abschnitt `Structured Depth Decision`;
- `plugin/meta/contracts/gate-transition.md` für operative Gate-Integration;
- `plugin/skills/brownfield-analysis/SKILL.md` und Brownfield-Review-Template als Konsumenten;
- `pages/src/data/site.ts` als bestehender Pages-Copy-/Datenowner;
- `pages/src/pages/index.astro` als bestehende Landingpage-Komposition;
- `pages/src/data/evaluationEvidence.ts` für repository-derived Eval-Evidenz;
- vorhandene Pages-Komponenten, Styles, Build- und visuelle Evidenzpfade;
- QA-Bericht des abgeschlossenen Structured-Depth-Implementierungsscopes als Repositoryevidenz,
  nicht als vererbte Freigabe.

## 7. Risks And Unknowns

- zu viel Detail könnte die Marketingseite in eine zweite Runtime-Dokumentation verwandeln;
- zu wenig Detail könnte die gerade geschlossene Ambiguität erneut erzeugen;
- `gateModeMatrix` kann ungerendert, redundant oder semantisch veraltet sein;
- vorhandene Copy zu Quick Task, Bug Lightweight und QA muss gegen die aktuellen Contracts
  abgegrenzt werden, ohne den Scope unnötig auszuweiten;
- responsive Vergleichstabellen können auf kleinen Screens unlesbar werden;
- sichtbare Evaluationsevidenz muss nach der Corpus-Erweiterung automatisch konsistent bleiben;
- Brownfield Review muss entscheiden, ob dies eine `structured_slice`, ein `verified_change` oder
  wegen breiter Public-Copy-/UX-Wirkung `structured_delivery` ist.

## 8. Next Step

Diese UR Revision 1 prüfen und nur mit folgendem exakten Wert freigeben:

`Approval: UR`

Danach folgt intern Brownfield Review mit UI/UX-Impact-Routing und Mode/Slice Decision. Es ist noch
keine Implementierung erlaubt.
