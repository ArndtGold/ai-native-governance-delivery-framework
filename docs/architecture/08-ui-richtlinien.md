# UI Richtlinien für AGDF

AGDF soll dem Anwender helfen, sein Vorhaben zu verstehen, die nächste Aufgabe zu erkennen
und eine konkrete Entscheidung bewusst zu treffen. Diese Richtlinien gelten für den Hub,
das Run-Cockpit im Chat, die große Appfläche sowie Dokumente und Verlauf innerhalb der App.

**Dokumentrolle: Gestaltungsgrundlage für die UI-Weiterentwicklung, Stand 14. Oktober 2026.**
Die beschriebenen Regeln sind Anforderungen an neue und überarbeitete Ansichten. Sie sind
kein Nachweis, dass der heutige Bestand sie vollständig erfüllt. Das
[UI-Konzept](07-ui-konzept.md) beschreibt Nutzerweg, Ansichten und Mockups; diese Seite
definiert die dazugehörigen Gestaltungs- und Prüfkriterien. Die
[Cockpit-Referenz](06-agdf-cockpit.md) beschreibt den Bestand. Entscheidungsregeln und
Zuständigkeiten bleiben bei den bestehenden Core-Diensten und Runtime-Verträgen; diese
Richtlinien ändern keine Freigabe oder Berechtigung.

MCP-App und MCP-Server gehören zum vorgesehenen Plugin-Lieferumfang. Die App zeigt generische
AGDF-Inhalte im vorhandenen Host: Stand, Dokumente, Änderungen, Nachweise und Entscheidungen.
Die [Mock-Referenz](mockups/cockpit-erlebnis.html) zeigt die Gewichtung dieser Inhalte.
Projektspezifische Produktoberflächen, Vorschau-Server und Testanwendungen gehören zum
bearbeiteten Projekt. Vorhandene Ergebniszugänge werden zugeordnet angezeigt und über
unterstützte Hostwege geöffnet; die App bildet die Zielanwendung nicht nach.

## Orientierung nach Aufgabe

| Du arbeitest an … | Beginne hier |
|---|---|
| Texten und Orientierung | [Sprache](#1-verständliche-sprache) und [Vorhabenbezug](#2-orientierung-am-aktuellen-vorhaben) |
| Entscheidungen und Aktionen | [Entscheidungsgrundlage](#3-entscheidungen-mit-klarer-grundlage-und-wirkung) und [Aktionen](#4-aktionen-nach-aufgabe-und-verfügbarkeit) |
| Darstellung und Bedienbarkeit | [Gemeinsamem Bedienmodell](#5-gemeinsames-bedienmodell-für-chat-und-große-ansicht), [Gestaltung](#7-gemeinsame-gestaltung-und-bestehende-komponenten) und [Zugänglichkeit](#8-zugängliche-bedienung-und-kleine-flächen) |
| Fehlern, Aktualität und Prüfung | [Host-Grenzen](#6-grenzen-der-host-integration), [Zuständen](#9-aktualität-laden-leere-ergebnisse-und-fehler) und [Nachweisen](#10-prüfung-nachweise-und-pflege) |

Die nachfolgende Bestandsregel gilt für jede dieser Aufgaben. Der
[nummerierte Nutzerweg](07-ui-konzept.md#1-nutzerabsicht-und-einstieg) zeigt den Zusammenhang.

## Bestand übernehmen, Ergänzungen gezielt prüfen

Die [Umsetzungszuordnung im Konzept](07-ui-konzept.md#9-bestand-und-erforderliche-weiterentwicklung)
trennt vorhandene Fähigkeiten, verbleibende Ergänzungen und offene Host-Nachweise. Die Regeln
hier begründen keinen erneuten Bau bereits vorhandener Entscheidungs-, Quellen-, Status- oder
Übergabelogik. Neue Ansichten erweitern die dort genannten Komponenten und Core-Projektionen.

Die Mocks tragen außerhalb der eigentlichen Produktansicht die Hinweise **„Bereits umgesetzt“**
und **„Noch ergänzen“**. Diese Hinweise dienen dem Entwurfsreview und werden nicht Teil der
Anwenderoberfläche. Ein Vorher-/Nachher-Vergleich nutzt die vorhandene geprüfte Archivbindung;
Abschnittsfragen erweitern den vorhandenen Handoff. Der manuelle Textweg im Mock ist kein Ersatz
für eine bereits unterstützte Nachrichtenübermittlung im Host.

**Prüfkriterium:** Für jede geplante Änderung ist erkennbar, welche vorhandene Komponente sie
weiterverwendet und welche konkrete Lücke sie schließt. Gestaltungsziel, Quellcode,
Paketstand und native Qualifizierung bleiben getrennte Aussagen.

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
menschliche Entscheidung. Historische Inhalte sind als frühere Stände erkennbar. Die vier
Orientierungsfragen verlangen keine vier Informationsblöcke: Vorhaben, Fassung und eine
konkrete Prüfaufgabe können sie verdichtet beantworten. Auf schmalen Flächen und bei
Textvergrößerung darf der Kopf den Arbeitsinhalt nicht verdrängen; die Orientierung bleibt
zugänglich, auch wenn dafür die Fixierung entfallen muss.
Der vollständige Ablauf ist standardmäßig eingeklappt. Bei der Wiederaufnahme führen der
relevante Unterschied zum letzten belegten Prüfstand und die jetzt erforderliche Handlung.
Fehlt dieser Prüfstand, wird der aktuelle Stand gezeigt, ohne eine persönliche Verlaufsaussage
zu erfinden.

**Beispiel:** „Anmeldung verbessern · Anforderung, Fassung 2. Deine Entscheidung: Soll die
vereinbarte Meldung bei falschen Zugangsdaten erscheinen?“ Beim Lesen bleibt die Orientierung
sichtbar; Details und vollständiger Ablauf sind erreichbar.

**Prüfkriterium:** Nach Öffnen eines Dokuments und Scrollen bis zum Ende sind Vorhaben,
aktueller Schritt und Handlungserwartung weiterhin erkennbar. Auf schmaler Fläche bleibt
der Inhalt auch mit der beschriebenen Alternative zum fixierten Kopf lesbar. Der Rückweg erhält den
auslösenden Zusammenhang. Der Verlauf verwechselt frühere und heutige Aufgaben nicht.

## 3 Entscheidungen mit klarer Grundlage und Wirkung

**Regel:** Vor einer Entscheidung benennt die Karte die konkrete Fassung, Ziel und Umfang,
wesentliche offene Punkte sowie den erlaubten nächsten Schritt. Sie erklärt die konkrete
Prüfaufgabe, benötigte Zuständigkeit und bereits belegte Prüfungen mit Quelle, Fassung und
Aussagegrenze. Bei Überarbeitung zeigt sie relevante Änderungen und die Behandlung der
Rückmeldungen, sobald eine belastbare Vergleichsgrundlage vorhanden ist; andernfalls erklärt
sie die fehlende Vergleichbarkeit. Die genaue Quelle ist lesbar. Eine gegenstandsbezogene
Aktion wie „Anforderung bestätigen“ bestätigt ausschließlich die gebundene Fassung. Eine Ersatzfassung
benötigt erneut eine Entscheidung. „Änderung nötig“ klärt den Änderungswunsch und erfasst
keine Zustimmung. Entscheidungsrelevante Risiken bleiben im Hauptinhalt. Die UI weist keine
neuen Entscheidungsrechte zu; ungeklärte Zuständigkeit wird vor der Entscheidung benannt.
Eine Bestätigung wird erst nach erfolgreich bestätigter Speicherung gezeigt.
Ist das bestehende Gespräch der einzige verfügbare Entscheidungsweg, steht die exakt zulässige
Antwort direkt bei dieser Handlungsanweisung. Sie darf nicht ausschließlich hinter
geschlossenen Details verborgen sein. Bei einem verfügbaren qualifizierten Klickweg kann
das technische Antwortprotokoll nachrangig in Details stehen.

Ein relevanter Dokumentausschnitt, Änderungsvergleich oder Ergebnisbericht trägt die Entscheidung. Eine Empfehlung
nennt Grund, Quelle und relevante Gegenargumente. Eine offene Prüfung bleibt bei der Empfehlung
sichtbar. Übernommene Rückmeldung und tatsächlich geänderte Stelle stehen nebeneinander;
unerwartete Folgen werden ebenfalls benannt. Quellenzugänge gehören an die Aussage, die sie
stützen. Ein allgemeiner Vertrauenswert ersetzt keinen Nachweis.

**Beispiel:** „Fassung 2 · Entscheidung ausstehend. Danach darf die KI das bestehende System
untersuchen. Umsetzung ist noch nicht freigegeben.“ Nach erfolgreicher Erfassung:
„Anforderung bestätigt · Fassung 2“.

**Prüfkriterium:** Der Anwender kann vor der Aktion sagen, was er bestätigt und was dadurch
erlaubt wird, was weiterhin unbestätigt bleibt und welche Vorprüfung ihn entlastet. Während
der Erfassung, nach bestätigtem Erfolg und bei unklarer Antwort sind
unterschiedliche Zustände sichtbar. Eine verlorene Antwort führt zur Prüfung des ursprünglichen
Vorgangs; ein wiederholter Klick erzeugt keine zweite wirksame Entscheidung.

### Gate-spezifische Mindestinhalte

Der [gemeinsame Gate-Kartenvertrag](07-ui-konzept.md#durchgehender-vertrag-für-alle-menschlichen-gates)
gilt für alle anwendbaren menschlichen Gates. Die gemeinsame Form darf ihre fachlichen
Unterschiede nicht verdecken.

| Gate | Vor der Entscheidung sichtbar und prüfbar |
|---|---|
| `UR` | Ziel, Umfang, Ausschlüsse, betroffene Nutzer, offene Klärungen und Wirkung auf Brownfield Review und Routenwahl |
| `PRD` | Verhalten, Akteure, Akzeptanzkriterien, Produktentscheidungen, UX-Auswirkungen, bei beauftragter Vorschau deren Zugang, Version und Prüfaufgabe sowie weiterhin gesperrte Umsetzung |
| `SD` | Architektur, Owner, Wiederverwendung, Schnittstellen, Alternativen, Risiken, Fallbacks und Wirkung auf den TP |
| `TP` | Aufgaben, Kriterien- und Designabdeckung, Tests, Nachweise, Reihenfolge, Owner, Risiken und vorgeschaltete Brownfield Analysis |
| `QA` | Technische Entscheidung, Tests, Reviews, Befunde, Restgrenzen und bei Abweichungsannahme deren Scope, Risiko, Folge, Owner und unveränderter technischer QA-Status |
| `UAT` | Geliefert, nicht geliefert, erfüllte Akzeptanzkriterien, Restrisiken, übernommene QA-Abweichungen und Grenze zu VCS/Release |

**Prüfkriterium:** Eine generische Gate-Karte ohne diese gate-spezifischen Angaben ist nicht
entscheidungsreif. QA-Pass und QA-Abweichungsannahme besitzen unterscheidbare Überschrift,
Zusammenfassung und Bestätigung. UAT übernimmt jede akzeptierte Abweichung sichtbar. Ein
kompakter oder anders gerouteter Run zeigt nur seine tatsächlich anwendbaren menschlichen Gates.

Für beauftragte Vorschauen gilt der zentrale
[PRD-Präsentationsvertrag](../../plugins/agdf/meta/contracts/interaction.md#prd-preview-review-at-approval).
„Vorschau ansehen“ ist eine Leseaktion; die vorhandene Freigabeaktion entscheidet über das PRD.
Eine Vorschau soll das geplante Verhalten beurteilbar machen. Ihre bloße Existenz, ein Öffnungsklick
oder ein attraktiver Entwurf belegen weder Umsetzung noch Zustimmung. Nicht verfügbare oder
veraltete Pflichtmaterialien erhalten einen konkreten Klärungsweg vor der Freigabeaufforderung.

## 4 Aktionen nach Aufgabe und Verfügbarkeit

**Regel:** Eine aktuell nutzbare Hauptaktion führt die Ansicht. Weitere Aktionen sind nachrangig
gestaltet. Lesen, Navigieren, Kontext übergeben und Entscheiden haben eindeutige Bezeichnungen.
Nicht verfügbare Aktionen erklären unmittelbar den Grund und einen vorhandenen nächsten Weg.
Die Oberfläche zeigt nur Aktionen, die für den aktuellen Zustand sinnvoll sind.
Ein Änderungswunsch beginnt an der betroffenen Stelle. Vorhaben, Fassung und Quelle werden
mitgeführt; der Anwender muss sie nicht erneut in den Chat kopieren. Lesen, Kontextübergabe, Änderungsauftrag im bestehenden Gespräch und Zustimmung bleiben getrennt.
Die Rückkehr aus einer Quelle oder einer anderen Ansicht erhält den noch nicht abgesendeten
Entwurf. Bei geänderter Quelle wird dessen Bezug vor der Übergabe erneut geprüft.

**Beispiel:** Solange die Bestätigung per Klick nicht verfügbar ist, führt „Anforderung lesen“.
Ein gegebenenfalls gezeigter Bestätigungsbutton bleibt nachrangig deaktiviert; daneben steht
„Bestätigung hier noch nicht verfügbar“ und
„Entscheide im bestehenden Gespräch“. Unmittelbar darunter steht die exakt zulässige
Chat-Antwort. „Antwort kopieren“ kann sie vorbereiten, sofern verfügbar; Kopieren sendet
nichts und entscheidet nichts. Ein deaktivierter Button ist visuell nachrangiger als die
verfügbare Hauptaktion. Bei gespeicherter Freigabe und unbestätigter Fortsetzung prüft ein
unterstützter Statusabgleich den ursprünglichen Vorgang, ohne erneut freizugeben oder zu beauftragen.

**Prüfkriterium:** Der erste Blick zeigt die wichtigste verfügbare Aktion. Zwei gleichwertige
Primärbuttons konkurrieren nicht. Ein deaktivierter Button lässt den Anwender nicht ohne
Erklärung zurück. Der einzige verfügbare Entscheidungsweg ist ohne Suche in geschlossenen
Details ausführbar. Nach bestätigter Entscheidung bleiben keine alten Entscheidungsaktionen aktiv.

## 5 Gemeinsames Bedienmodell für Chat und große Ansicht

**Regel:** Beide Darstellungen verwenden dieselbe Vorhabenidentität, Entscheidungsgrundlage
und Bedeutung der Zustände. Vergrößern ändert die verfügbare Fläche, keine Freigabe. Die
Chatkarte bleibt kurz und einspaltig; ihr Inhalt benötigt keinen eigenen Scrollbereich. Die
große Ansicht bietet dauerhaft sichtbare Orientierung und einen darunter scrollenden Inhalt.
Zusatzinformationen öffnen über eindeutig benannte Zugänge und zunächst geschlossene Details.
Ein Ablaufbalken zeigt ausschließlich Schritte, die aus der tatsächlichen Run-Route stammen.
Er bildet keine feste universelle Gate-Folge und stellt nicht anwendbare Schritte nicht als
zukünftige Pflicht dar. Er öffnet auf Wunsch und verdrängt im Normalfall nicht den
Arbeitsgegenstand. Die schmale Ansicht ordnet denselben Gegenstand, die relevante Abwägung
und die Handlung linear; sie verkleinert keine komplette Desktop-Ansicht.

**Beispiel:** „Groß öffnen“ übernimmt „Anmeldung verbessern · Fassung 1“. „Zur Entscheidung“
kehrt nach dem Lesen zur auslösenden Karte und ihrem aktuellen Stand zurück.

**Prüfkriterium:** Der Wechsel erhält Auswahl und Zusammenhang. Eine inzwischen geänderte
Quelle wird erklärt und neu geprüft. Die kompakte Karte benötigt keine verschachtelte
Navigation; in der großen Ansicht verdeckt das Scrollen die Orientierung nicht.

## 6 Grenzen der Host-Integration

**Regel:** AGDF gestaltet ausschließlich seinen App-Inhalt. Der konkrete
Host besitzt Gespräch, natives Eingabefeld, äußere Navigation und Fenstersteuerung. Die App
erzeugt keinen eigenen Chat und bildet das native Gespräch nicht nach. Vergrößerung,
Kontextaufnahme und Nachrichtenzustellung setzen die jeweils angebotene Host-Fähigkeit und
deren bestätigte Wirkung voraus. Die Auswahl eines Runs im Hub ist zunächst ein lesender Wechsel.
Hostnamen stammen aus bestätigter Clientidentität oder vertrauenswürdiger Hostkonfiguration.
Gemeinsame Texte verwenden andernfalls „Host“ oder „bestehendes Gespräch“ statt eines
fest eingebauten Produktnamens.

Die [zentrale Architekturentscheidung](07-ui-konzept.md#architekturentscheidung-zur-gemeinsamen-host-schnittstelle)
bestimmt MCP/MCP Apps als gemeinsame Schnittstelle. Ansichten sollen über kompatible Hosts
dieselbe fachliche Bedeutung besitzen. Ein eigener Webhost ist keine Voraussetzung; fehlende UI-Fähigkeiten
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

Der [Übergang vom Lesen zum Arbeitsauftrag](07-ui-konzept.md#vom-lesen-zum-bestätigten-arbeitsauftrag)
ist zusätzlich zu prüfen: Bei einem Run-Wechsel erkennt der Anwender Leseauswahl und belegten
Gesprächsauftrag. „Dieses Vorhaben im Gespräch weiterbearbeiten“ benennt Run, Quelle und Ziel.
Kontextaufnahme, Nachrichtenannahme und Agentenübernahme werden einzeln bestätigt, ohne dem
Anwender technische Orchestrierung aufzubürden. Unbekannte Zuordnung bleibt unbekannt;
mehrdeutige Änderungsaufträge werden bei ihrer Aufnahme vor einer Änderung geklärt. Fehlende
Hostfähigkeit bietet einen ausdrücklich zugeordneten Textauftrag; unklare Zustellung wird
vor einer Wiederholung geprüft. Unterbrechung wird erst bei bestätigtem Host-Halt als erfolgt gezeigt.

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
Farbe, Hover und Animation sind keine alleinigen Informationsträger. Hilfs-, Zeit- und
Metatexte erfüllen mindestens WCAG AA für den jeweiligen Textumfang. Bei 200 Prozent
Textvergrößerung bleiben Frage, Fassung, Wirkung, Hauptaktion und nächster Weg vollständig
erkennbar. Deaktivierte Elemente bleiben lesbar und unterscheiden sich zusätzlich semantisch.

## 9 Aktualität, Laden, leere Ergebnisse und Fehler

**Regel:** Datenstand und Herkunft sind zugänglich. Laden, fehlende Quelle, abgelaufene Sitzung,
veränderte Fassung und unklare Speicherung werden getrennt und verständlich erklärt. Fehler
nennen die konkrete Einschränkung und einen passenden nächsten Schritt. Die Ansicht bewahrt
Auswahl und Lesezusammenhang, soweit möglich. Alte Daten erhalten keinen scheinbar aktuellen
Entscheidungsstatus. Suchergebnisse benennen ihren tatsächlichen Umfang.

**Beispiel:** „Diese Fassung hat sich geändert. Lade den aktuellen Stand, bevor du entscheidest.“
Im Hub: „Keine Treffer in den bisher gelesenen Einträgen“ bei begrenzter Suchabdeckung.
„Als Nächstes ist die KI dran“ bezeichnet die nächste Aufgabe; „Die KI arbeitet“ verlangt
eine bestätigte Beobachtung tatsächlicher Aktivität. Kann eine angeforderte MCP-App nicht
bestätigt angezeigt werden, erklärt die Portable-Markdown-Ausgabe den Fallback. Bei unklarer
Speicherung zeigt die Oberfläche weder „bestätigt“ noch einen freigegebenen Folgeschritt.

**Prüfkriterium:** Der Anwender erkennt Ursache, verbleibende Lesemöglichkeiten und nächste
Handlung. Ein leerer Hub behauptet ohne ausreichende Abdeckung keine vollständige Suche.
Eine veraltete Ansicht ermöglicht keine vermeintlich aktuelle Entscheidung. Ein gespeicherter
Freigabevermerk allein wird nicht als Beleg für die heute gelesene Dokumentfassung ausgegeben.
Geänderte Fassung, unklare Speicherung und Format-Fallback besitzen unterscheidbare
Recovery-Zustände mit genau einer sicheren nächsten Handlung.

### Reale Bestände statt idealisierter Einzelfälle

**Regel:** Eine Übersicht weist ihren Suchumfang aus. „Aktiv“ bezeichnet keine persönliche
Aufgabe, „abgeschlossen“ keine uneingeschränkte Qualität. Bei relevanten Widersprüchen erklärt
die Ansicht Quelle, Phase und Konsequenz. Aktuelle Aktionen kommen aus der kanonischen
Auswertung; historische Dokumenttexte bleiben unverändert und erhalten eine Einordnung.

**Beispiel:** Der Host-Adapter-Run zeigt die Rücksetzung neben der abweichenden Backlog-Angabe.
Der Core-/MCP-Abschluss führt mit interner Erprobung und angenommenen Risiken. Der abgeschlossene
Inhalts-Run erklärt die frühere offene QA-Aufforderung vor dem Originalbericht.

**Prüfkriterium:** Der Anwender muss keinen Widerspruch selbst auflösen. Er findet die
erläuternde Quelle, erkennt die Nutzungsgrenze und erhält keine unberechtigte Freigabeaktion.
Die [vier Praxisfälle](07-ui-konzept.md#praxisreferenz-vier-echte-vorhaben-in-derselben-mcp-app)
sind verbindliche Beispiele dafür, keine zusätzlichen Status- oder Governance-Regeln.

### Lesen mit erhaltenem Arbeitsbezug

**Regel:** Umfangreiche Dokumente bieten Inhaltsübersicht, Suche und Rückweg zur Aufgabe.
Eine Rückfrage übernimmt Quelle, Quellfassung und Abschnitt. Ein Vergleich benötigt ein
belegtes Dokumentpaar; eine Run-Revision ist keine Dokument-Fassungsnummer. Ein Quellenwechsel
bewahrt den Entwurf und verlangt die Prüfung seines Bezugs. Leseposition, Suchfilter und
Frageentwürfe werden bei Navigation erhalten und nicht als Arbeitsauftrag interpretiert.

**Beispiel:** Im vollständigen Cockpit-PRD führt die Suche nach AC-003 zur Dokumentprüfung.
„Zu diesem Abschnitt fragen“ bereitet den Bezug im bestehenden Gespräch vor. Bei fehlender
Nachrichtenfähigkeit bleibt der Text manuell übernehmbar und ausdrücklich ungesendet.

**Prüfkriterium:** Die Originalstelle bleibt lesbar; Rückkehr per Tastatur landet am Auslöser.
Beim Run-Wechsel wird kein Entwurf einem anderen Vorhaben zugeordnet. Alte Nachweise werden
als Historie erreicht, aktuelle Risiken bleiben bei der Aufgabe sichtbar. Schmale Ansichten
und 200 Prozent Schrift dürfen Aktionen oder den Rückweg nicht abschneiden.

## 10 Prüfung, Nachweise und Pflege

**Regel:** Jede neue oder überarbeitete Ansicht wird gegen die passenden Regeln dieses
Kapitels geprüft. Mockups zeigen das Ziel. Gerenderte Komponenten zeigen den jeweiligen
Darstellungsstand. Aussagen über Host-Fähigkeiten benötigen die Beobachtung der konkret
verwendeten Fassung im betreffenden Host. Die vorhandenen Qualifizierungsvoraussetzungen
bleiben erhalten. Eine dokumentierte Abweichung nennt Grund, betroffene Ansicht und Nutzerfolge.

**Beispiel:** Der [Plugin-Mock mit vier echten Runs](mockups/cockpit-erlebnis.html) führt die
Gestaltung für Wiederaufnahme, Statuskonflikte, umfangreiche Quellen und begrenzte Abschlüsse. Die
[v3-Serie](mockups/human-gate-mocks-v3.md) ergänzt Gate-Inhalte, Arbeitsübergabe und
Fortsetzungsdiagnose. Die fünf historischen Imagegen-Mocks zeigen den frühen App-Ablauf. Die
[Übersicht aller menschlichen Gates](07-ui-konzept.md#durchgehender-vertrag-für-alle-menschlichen-gates)
und der QA-/UAT-Sonderfall zeigen die gateübergreifende Informationsstruktur. Eine ergänzende
Portable-Markdown-Referenz zeigt denselben Entscheidungsgegenstand ohne App. Für „Groß öffnen“
wird zusätzlich im echten Host beobachtet, ob der angeforderte Modus bestätigt wird und die
ausgewählte Fassung erhalten bleibt. Separate Recovery-Ansichten zeigen geänderte Fassung,
unklare Speicherung und Format-Fallback. Ein Mockup belegt keine erfolgreiche Klickfreigabe.

**Prüfkriterium:** Beim Review sind Ansicht, geprüfter Stand und verwendete Nachweise benannt.
Die Prüfung umfasst die [beobachtbaren Nutzererlebnisse](07-ui-konzept.md#10-beobachtbare-nutzererlebnisse)
und den [Aktionsfluss](07-ui-konzept.md#welche-aktion-führt-zu-welcher-ansicht), einschließlich
Rückwegen und fehlender Host-Fähigkeit. Erfolgreiche Quell- oder Browserprüfungen werden nicht
als native Host-Abnahme ausgegeben. Der Review vergleicht mindestens ein semantisch identisches
Paar aus MCP-App-UI und Portable Markdown und prüft Hosttexte mit neutralem Fallback sowie
mit den konkret unterstützten Hostanzeigenamen. Für jedes anwendbare menschliche Gate wird
zusätzlich geprüft, dass Mindestinhalt, Zustimmungswirkung, weiterhin gesperrte Arbeit und
post-decision receipt dem gemeinsamen Kartenvertrag entsprechen.

Die [Ergebnis- und Abnahmesituation](07-ui-konzept.md#ergänzung-ergebnis-prüfen-und-abnehmen)
führt mit zugeordneter Ergebnisfassung, Umgebung, konkreten Prüfschritten und sichtbaren
Restgrenzen. Bestandene technische Prüfungen ersetzen keine menschliche Abnahme. Abnahme,
Integration, Veröffentlichung und Abschluss benötigen ihre jeweils eigenen Belege.
Die Verständnisprüfung lässt den Anwender ohne externe Erklärung Entscheidungsgegenstand,
Zuständigkeit, erlaubte Folge und verbleibende Grenze benennen. Nach einem Run-Wechsel muss
er den tatsächlichen oder unbestätigten Arbeitsauftrag erkennen. Zeit bis zur richtigen
Handlung, Fehlzuordnungen und unnötige Dokumentwechsel werden mit dem bisherigen Weg verglichen.
Die Prüfung beginnt mit dem [Nutzerweg im vorhandenen Host](07-ui-konzept.md#entlastung-am-durchgängigen-weg-prüfen):
Der Nutzer findet die entscheidende Stelle, bespricht seine Korrektur mit gebundenem Bezug
im bestehenden Gespräch und erkennt die Rückmeldung in der neuen Fassung. Zur Abnahme zeigt
die App den Ergebnisbericht und vorhandene Zugänge. Ein geöffneter Link oder gelesener Bericht
ist keine Abnahme. Prüfung der Zielanwendung und AGDF-Entscheidung bleiben unterscheidbar.

Die UI-Richtlinien besitzen die übergreifenden Gestaltungsregeln. Das UI-Konzept besitzt
Nutzerweg, Begriffsliste und Mockups; die gemeinsamen Tokens besitzen die exakten Designwerte.
Bestandsreferenz und technische Verträge behalten ihre eigenen Zuständigkeiten. Eine Änderung
wird an der jeweils zuständigen Stelle vorgenommen und hier verlinkt, statt parallel neu definiert.
