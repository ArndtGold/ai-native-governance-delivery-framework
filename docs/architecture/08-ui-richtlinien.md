# UI Richtlinien für AGDF

AGDF soll dem Anwender helfen, sein Vorhaben zu verstehen, die nächste Aufgabe zu erkennen
und eine konkrete Entscheidung bewusst zu treffen. Diese Richtlinien gelten für den Hub,
das Run-Cockpit im Chat, die große Appfläche sowie Dokumente und Verlauf innerhalb der App.

**Dokumentrolle: Gestaltungsgrundlage für die UI-Weiterentwicklung, Stand 13. Oktober 2026.**
Die beschriebenen Regeln sind Anforderungen an neue und überarbeitete Ansichten. Sie sind
kein Nachweis, dass der heutige Bestand sie vollständig erfüllt. Das
[UI-Konzept](07-ui-konzept.md) beschreibt Nutzerweg, Ansichten und Mockups; diese Seite
definiert die dazugehörigen Gestaltungs- und Prüfkriterien. Die
[Cockpit-Referenz](06-agdf-cockpit.md) beschreibt den Bestand. Entscheidungsregeln und
Zuständigkeiten bleiben bei den bestehenden Core-Diensten und Runtime-Verträgen; diese
Richtlinien ändern keine Freigabe oder Berechtigung.

## 1 Verständliche Sprache

**Regel:** Sichtbare Schritte heißen nach der Aufgabe des Anwenders. Entscheidungskarten
führen mit einer konkreten Frage. UR, PRD, SD und andere technische Kürzel stehen in Details,
zusammen mit Fassung und Herkunft. Dieselben Bezeichnungen gelten in Karten, Dokumentzugängen,
Suchfiltern, Bestätigungen und Verlauf. Die [Zuordnung im UI-Konzept](07-ui-konzept.md#verständliche-aufgaben-statt-vorausgesetzter-abkürzungen)
ist die gemeinsame Begriffsliste; hier wird keine zweite gepflegt.

**Beispiel:** „Ziel und Umfang klären“ und „Haben wir deinen Wunsch richtig verstanden?“
statt einer alleinstehenden „UR-Freigabe“. Die bestätigte Entscheidung heißt
„Anforderung bestätigt · Fassung 2“.

**Prüfkriterium:** Ein neuer Anwender erkennt Aufgabe und Entscheidung, ohne eine Abkürzung
nachzuschlagen. In der normalen Ansicht führen keine technischen Kürzel. Aufgeklappte
Details ermöglichen weiterhin die eindeutige technische Zuordnung.

## 2 Orientierung am aktuellen Vorhaben

**Regel:** Jede aktuelle Cockpit-Ansicht beantwortet: Welches Vorhaben? Welcher Schritt?
Wer ist dran? Was muss als Nächstes passieren? In der großen Ansicht bleiben diese Angaben
sichtbar, während der Inhalt scrollt. In der Chatkarte stehen sie kompakt am Anfang.
Der tatsächliche Run bestimmt die Schritte; interne Arbeit erzeugt keine zusätzliche
menschliche Entscheidung. Historische Inhalte sind als frühere Stände erkennbar.

**Beispiel:** „Anmeldung verbessern · Ziel und Umfang klären · Du bist dran: Prüfe Ziel
und Umfang dieser Fassung.“ Beim Lesen bleibt dieser Kopf stehen.

**Prüfkriterium:** Nach Öffnen eines Dokuments und Scrollen bis zum Ende sind Vorhaben,
aktueller Schritt und Handlungserwartung weiterhin erkennbar. Der Rückweg erhält den
auslösenden Zusammenhang. Der Verlauf verwechselt frühere und heutige Aufgaben nicht.

## 3 Entscheidungen mit klarer Grundlage und Wirkung

**Regel:** Vor einer Entscheidung benennt die Karte die konkrete Fassung, Ziel und Umfang,
wesentliche offene Punkte sowie den erlaubten nächsten Schritt. Die genaue Quelle ist
lesbar. „So stimmt es“ bestätigt ausschließlich die gebundene Fassung. Eine Ersatzfassung
benötigt erneut eine Entscheidung. „Änderung nötig“ klärt den Änderungswunsch und erfasst
keine Zustimmung. Eine Bestätigung wird erst nach erfolgreich bestätigter Speicherung gezeigt.

**Beispiel:** „Fassung 2 · Entscheidung ausstehend. Danach darf die KI das bestehende System
untersuchen. Umsetzung ist noch nicht freigegeben.“ Nach erfolgreicher Erfassung:
„Anforderung bestätigt · Fassung 2“.

**Prüfkriterium:** Der Anwender kann vor der Aktion sagen, was er bestätigt und was dadurch
erlaubt wird. Während der Erfassung, nach bestätigtem Erfolg und bei unklarer Antwort sind
unterschiedliche Zustände sichtbar. Eine verlorene Antwort führt zur Prüfung des ursprünglichen
Vorgangs; ein wiederholter Klick erzeugt keine zweite wirksame Entscheidung.

## 4 Aktionen nach Aufgabe und Verfügbarkeit

**Regel:** Eine aktuell nutzbare Hauptaktion führt die Ansicht. Weitere Aktionen sind nachrangig
gestaltet. Lesen, Navigieren, Kontext übergeben und Entscheiden haben eindeutige Bezeichnungen.
Nicht verfügbare Aktionen erklären unmittelbar den Grund und einen vorhandenen nächsten Weg.
Die Oberfläche zeigt nur Aktionen, die für den aktuellen Zustand sinnvoll sind.

**Beispiel:** Solange die Bestätigung per Klick nicht verfügbar ist, führt „Anforderung lesen“.
„So stimmt es“ bleibt deaktiviert; daneben steht „Bestätigung hier noch nicht verfügbar“ und
„Entscheide im bestehenden Codex-Chat“. Die exakte Antwortregel steht in Entscheidungsdetails.

**Prüfkriterium:** Der erste Blick zeigt die wichtigste verfügbare Aktion. Zwei gleichwertige
Primärbuttons konkurrieren nicht. Ein deaktivierter Button lässt den Anwender nicht ohne
Erklärung zurück. Nach bestätigter Entscheidung bleiben keine alten Entscheidungsaktionen aktiv.

## 5 Gemeinsames Bedienmodell für Chat und große Ansicht

**Regel:** Beide Darstellungen verwenden dieselbe Vorhabenidentität, Entscheidungsgrundlage
und Bedeutung der Zustände. Vergrößern ändert die verfügbare Fläche, keine Freigabe. Die
Chatkarte bleibt kurz und einspaltig; ihr Inhalt benötigt keinen eigenen Scrollbereich. Die
große Ansicht bietet dauerhaft sichtbare Orientierung und einen darunter scrollenden Inhalt.
Zusatzinformationen öffnen über eindeutig benannte Zugänge und zunächst geschlossene Details.

**Beispiel:** „Groß öffnen“ übernimmt „Anmeldung verbessern · Fassung 1“. „Zur Entscheidung“
kehrt nach dem Lesen zur auslösenden Karte und ihrem aktuellen Stand zurück.

**Prüfkriterium:** Der Wechsel erhält Auswahl und Zusammenhang. Eine inzwischen geänderte
Quelle wird erklärt und neu geprüft. Die kompakte Karte benötigt keine verschachtelte
Navigation; in der großen Ansicht verdeckt das Scrollen die Orientierung nicht.

## 6 Grenzen der Host-Integration

**Regel:** AGDF gestaltet ausschließlich seinen App-Inhalt. Codex beziehungsweise der konkrete
Host besitzt Gespräch, natives Eingabefeld, äußere Navigation und Fenstersteuerung. Die App
erzeugt keinen eigenen Chat und bildet das native Gespräch nicht nach. Vergrößerung,
Kontextaufnahme und Nachrichtenzustellung setzen die jeweils angebotene Host-Fähigkeit und
deren bestätigte Wirkung voraus. Die Auswahl eines Runs im Hub ist zunächst ein lesender Wechsel.

Die [zentrale Architekturentscheidung](07-ui-konzept.md#architekturentscheidung-zur-gemeinsamen-host-schnittstelle)
bestimmt MCP/MCP Apps als gemeinsame Schnittstelle. Ansichten sollen über kompatible Hosts
dieselbe fachliche Bedeutung besitzen. CopilotKit bleibt optional; fehlende UI-Fähigkeiten
führen zu den unterstützten Text- oder Navigationswegen, nicht zu veränderten Entscheidungsregeln.

AGDF verwendet für nutzerseitige Präsentationen ausschließlich
[MCP-App-UI und Portable Markdown](07-ui-konzept.md#verbindliche-darstellungsformate).
Eine automatische Auswahl ist eine Strategie, kein zusätzliches Format. Beide Darstellungen
führen aus derselben gebundenen Grundlage mit Vorhaben, aktuellem Schritt, Fassung,
Entscheidungsfolgen und zulässiger Antwort. Fehlt eine bestätigte MCP-App-Darstellung, muss
Portable Markdown die vollständige Entscheidungsgrundlage liefern und auch ungerendert
verständlich bleiben. Ein Fallback darf keine Host-Fähigkeit, Klickqualifizierung oder
stärkere Herkunftsabsicherung vortäuschen.

**Beispiel:** „Groß öffnen“ fordert einen angebotenen Modus an. „Rechts öffnen“ wird ohne
entsprechenden Host-Nachweis nicht als zugesicherte Wirkung versprochen. „Vorhaben ansehen“
öffnet den ausgewählten Kontrollstand, ohne den bestehenden Chat oder seinen Auftrag zu ersetzen.
Kann die MCP-App nicht bestätigt angezeigt werden, erscheint derselbe Entscheidungsgegenstand
vollständig als Portable Markdown. Fachliche Antwortregel und Gate-Wirkung ändern sich dadurch
nicht; ein erforderlicher stärker abgesicherter Eingabekanal wird jedoch nicht ersetzt.

**Prüfkriterium:** App und Host sind eindeutig getrennt. Die App enthält keinen nachgebauten
Codex-Composer und kein eigenes Host-Schließen-X. Kontextübergabe behauptet weder eine
gesendete Frage noch eine Freigabe. Run-Auswahl startet keine automatische Fortsetzung.
Für jeden unterstützten Host sind Version, Fähigkeiten und die tatsächlichen Interaktionen
belegt; ein Erfolg in einem anderen Host genügt dafür nicht.
Conformance-Tests vergleichen beide Formate auf dieselbe Run-, Gate-, Revisions- und
Digest-Bindung, dieselben Konsequenzen und dieselbe zulässige Antwort. Portable Markdown
verlangt keine HTML-Details, Diagramme, lokalen Links oder nativen Bedienelemente, um den
Kerninhalt zu verstehen. Die Formatauswahl stammt aus vertrauenswürdiger Host-Konfiguration
und beobachteten Fähigkeiten, nicht aus frei modellierbaren Werkzeugeingaben.

## 7 Gemeinsame Gestaltung und bestehende Komponenten

**Regel:** Neue Ansichten verwenden die vorhandenen Design-Tokens und geeigneten gemeinsamen
Komponenten. Schriften, Farben, Abstände, Radien, Fokus und Theme-Verhalten werden aus ihren
bestehenden Quellen übernommen. Lokale Sonderwerte benötigen einen konkreten gestalterischen
Grund; sie bilden keine zweite allgemeine Farb- oder Typografiesystematik. Status wird durch
verständlichen Text und bei Bedarf ein Symbol erklärt, zusätzlich zur Farbe.

**Beispiel:** Inter führt die Oberfläche, JetBrains Mono technische Angaben. Der bestehende
Tealton kennzeichnet wichtige Aktionen. Eine bestätigte Anforderung trägt zusätzlich den
Text „Anforderung bestätigt“; ein grünes Symbol allein reicht nicht.

**Prüfkriterium:** Die Umsetzung verwendet die [Pages-Tokens](../../pages/src/design/tokens.json)
und [Styles](../../pages/src/styles/) sowie die passende
[Cockpit-Zuordnung](../../packages/control-ui/src/theme.css) und das
[Branding](../../packages/control-ui/src/brand.css). Helle und dunkle Darstellung bleiben
lesbar. Das Kopfmotiv beeinträchtigt weder Inhalt noch Zustandsanzeigen. Die exakten bestehenden
Gestaltungswerte erläutert das [UI-Konzept](07-ui-konzept.md#gestaltungsgrundlage-des-vorhandenen-cockpits).

## 8 Zugängliche Bedienung und kleine Flächen

**Regel:** Alle Aktionen sind per Tastatur erreichbar und haben verständliche zugängliche
Namen. Der Fokus ist sichtbar und kehrt beim Schließen einer Vertiefung zum auslösenden
Element zurück, soweit die Host-Grenzen dies erlauben. Überschriften, Buttons und geschlossene
Details besitzen passende Semantik. Relevante Zustandsänderungen sind auch mit assistiver
Technik erfassbar. Text bleibt kontrastreich, vergrößerbar und bei schmaler Breite lesbar.
Wichtige Aktionen bieten die bestehende Mindesthöhe von 44px.

**Beispiel:** „Anforderung lesen“ ist mit Tab erreichbar. Nach „Zur Entscheidung“ liegt der
Fokus wieder am Lesezugang. Auf kleiner Breite stehen Aktionen untereinander; ihre Bedeutung
geht nicht durch abgeschnittene Beschriftungen verloren.

**Prüfkriterium:** Der Kernweg lässt sich mit Tastatur und assistiver Technik bedienen.
Fokus wird weder verdeckt noch eingeschlossen. Bei schmaler Fläche und vergrößertem Text
bleiben Aufgabe und Aktionen erreichbar; der Kerninhalt verlangt kein horizontales Scrollen.
Farbe, Hover und Animation sind keine alleinigen Informationsträger.

## 9 Aktualität, Laden, leere Ergebnisse und Fehler

**Regel:** Datenstand und Herkunft sind zugänglich. Laden, fehlende Quelle, abgelaufene Sitzung,
veränderte Fassung und unklare Speicherung werden getrennt und verständlich erklärt. Fehler
nennen die konkrete Einschränkung und einen passenden nächsten Schritt. Die Ansicht bewahrt
Auswahl und Lesezusammenhang, soweit möglich. Alte Daten erhalten keinen scheinbar aktuellen
Entscheidungsstatus. Suchergebnisse benennen ihren tatsächlichen Umfang.

**Beispiel:** „Diese Fassung hat sich geändert. Lade den aktuellen Stand, bevor du entscheidest.“
Im Hub: „Keine Treffer in den bisher gelesenen Einträgen“ bei begrenzter Suchabdeckung.
„Als Nächstes ist die KI dran“ bezeichnet die nächste Aufgabe; „Die KI arbeitet“ verlangt
eine bestätigte Beobachtung tatsächlicher Aktivität.

**Prüfkriterium:** Der Anwender erkennt Ursache, verbleibende Lesemöglichkeiten und nächste
Handlung. Ein leerer Hub behauptet ohne ausreichende Abdeckung keine vollständige Suche.
Eine veraltete Ansicht ermöglicht keine vermeintlich aktuelle Entscheidung. Ein gespeicherter
Freigabevermerk allein wird nicht als Beleg für die heute gelesene Dokumentfassung ausgegeben.

## 10 Prüfung, Nachweise und Pflege

**Regel:** Jede neue oder überarbeitete Ansicht wird gegen die passenden Regeln dieses
Kapitels geprüft. Mockups zeigen das Ziel. Gerenderte Komponenten zeigen den jeweiligen
Darstellungsstand. Aussagen über Host-Fähigkeiten benötigen die Beobachtung der konkret
verwendeten Fassung im betreffenden Host. Die vorhandenen Qualifizierungsvoraussetzungen
bleiben erhalten. Eine dokumentierte Abweichung nennt Grund, betroffene Ansicht und Nutzerfolge.

**Beispiel:** Die fünf Imagegen-Mocks zeigen den gewünschten Ablauf. Für „Groß öffnen“ wird
zusätzlich im echten Host beobachtet, ob der angeforderte Modus bestätigt wird und die
ausgewählte Fassung erhalten bleibt. Ein Mockup belegt keine erfolgreiche Klickfreigabe.

**Prüfkriterium:** Beim Review sind Ansicht, geprüfter Stand und verwendete Nachweise benannt.
Die Prüfung umfasst die [beobachtbaren Nutzererlebnisse](07-ui-konzept.md#10-beobachtbare-nutzererlebnisse)
und den [Aktionsfluss](07-ui-konzept.md#welche-aktion-führt-zu-welcher-ansicht), einschließlich
Rückwegen und fehlender Host-Fähigkeit. Erfolgreiche Quell- oder Browserprüfungen werden nicht
als native Host-Abnahme ausgegeben.

Die UI-Richtlinien besitzen die übergreifenden Gestaltungsregeln. Das UI-Konzept besitzt
Nutzerweg, Begriffsliste und Mockups; die gemeinsamen Tokens besitzen die exakten Designwerte.
Bestandsreferenz und technische Verträge behalten ihre eigenen Zuständigkeiten. Eine Änderung
wird an der jeweils zuständigen Stelle vorgenommen und hier verlinkt, statt parallel neu definiert.
