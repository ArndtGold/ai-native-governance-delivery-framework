# Diskussion: MGDF als Agentenrahmen für die Baufinanzierung

Status: Diskussionspapier, keine Architekturentscheidung

Stand: 24. September 2026

## Die These

Die Baufinanzierung lebt von vielen Varianten bei geringer Marge. Notarverträge, Bauverträge, Baugenehmigungen, Exposés und Einkommensnachweise kommen in immer neuer Form. Jede Variante als deterministische Regel zu erfassen, kostet Entwicklung, Test und Pflege und wird nie vollständig. Die Stärke der KI liegt gerade darin, aus wechselnden Unterlagen das Erforderliche zu ermitteln.

MGDF sollte der KI deshalb **nicht den Weg vorschreiben, sondern ihr Ergebnis prüfen**. Ein MGDF-Agent erhält einen gebundenen Auftrag, zulässige Quellen und Werkzeuge und einen festen Ergebnisvertrag. Wie er die Unterlagen durchsucht, entscheidet er selbst. Am Übergabepunkt prüft MGDF seine Antwort: im Code, wo die Prüfung für jede Dokumentvariante gleich ist, und durch eine Fachperson, wo sie Wissen über die Variante verlangt. Die Bank behält die Hoheit über Fallstand, Befugnisse und Entscheidungen.

Das Prüfprinzip stammt aus AGDF. AGDF schreibt nicht vor, wie ein Agent Software entwickelt. Es prüft seine Artefakte an Gates gegen Abnahmesignale, und ein Mensch gibt frei. MGDF übernimmt dieses Prinzip, nicht den Gegenstand: AGDF steuert Bau und Änderung, MGDF die fachliche Arbeit im Fall (siehe [MGDF-Übersicht, Abschnitt 11](01-framework-overview.md)).

AGDF

MGDF

Artefakt: UR, PRD, Code

Antwort des Agenten: Angaben mit Verweis auf Belegstellen

Vorlage und Abnahmesignale

Ergebnisvertrag

Automatische Prüfungen: Tests, Build

Prüfung von Verweis, Fassung und Rechenwerten im Code

Gate-Freigabe durch einen Menschen

Bestätigen, Berichtigen oder Verwerfen jeder Angabe mit Begründung

Arbeitsweise des Agenten nicht vorgeschrieben

Auswahl und Reihenfolge der gelesenen Unterlagen nicht vorgeschrieben

Der Demonstrator folgt diesem Prinzip bereits für die Auswertung. Die KI verweist auf eine übergebene Fundstelle; die Anwendung übernimmt Text, Dokument, Seite und Hash ausschließlich aus dem gebundenen Quellenbestand ([ADR 0011](../demonstrator/docs/entscheidungen/0011-dokumentbelege-aus-gebundenen-fundstellen.md)). Dieses Papier überträgt das Prinzip auf einen Agenten, der die Belege selbst sucht.

Daraus folgt eine zweite Aussage: **MGDF braucht einen eigenen, schmalen Agentenrahmen, keinen fremden allgemeinen.** Der [MGDF-Agentenrahmen](#der-mgdf-agentenrahmen) ist eine fachliche Schicht über der vorhandenen Agentenschleife des Agents SDK. Er ist so geschnitten, dass sich sein fachneutraler Teil als [CGDF](#%C3%BCbertragbarkeit-cgdf-als-fachneutraler-kern) auf andere Fachanwendungen übertragen lässt. Er übernimmt bewährte Ideen aus dem offenen Codex-Agentenrahmen, nicht aber dessen Laufzeit. Ein Laufzeitvergleich mit Codex ist [zurückgestellt](#anhang-codex-als-zur%C3%BCckgestellte-laufzeitvariante).

![MGDF-Agentenrahmen: Zielbild zur Diskussion](diagrams/mgdf-agentenrahmen-zielbild.svg)

[Bearbeitbare DOT-Quelle](diagrams/mgdf-agentenrahmen-zielbild.dot). Auftrag, Werkzeuganschluss, Arbeitsstand und Anwendungsdienst bilden den MGDF-Agentenrahmen. Verbindlich ist die Ergebnisprüfung am Übergabepunkt; die gestrichelte Vorprüfung im Lauf ist optional. Die gestrichelten Modellwege sind alternative Betriebsprofile, keine gleichzeitige Pflichtanbindung.

## Was ein MGDF-Agentenlauf wäre

Ein Lauf beginnt mit einem ausdrücklich gebundenen Auftrag: Fall, Ziel, aktuelle Fallfassung, zulässige Dokumente, geltende Regeln, erlaubte Werkzeuge, Befugnisse und Arbeitsbudget. Innerhalb dieses Rahmens entscheidet der Agent selbst, welche Informationen er benötigt und welche zulässige Arbeit er als Nächstes ausführt. Er darf keine neue Befugnis aus seiner eigenen Planung ableiten.

1.  **Kontext erfassen.** Der Agent liest nur den freigegebenen Fallstand, die gebundenen Quellen und die für den Auftrag geltenden Regeln.
2.  **Belege suchen.** Er liest Dokumentstellen, lässt ein zulässiges PDF bei Bedarf über Docling erschließen, fragt eine freigegebene weitere Quelle ab oder fordert eine Berechnung an. Gefundene Belege merkt er im Arbeitsstand des Laufs vor.
3.  **Antwort erstellen.** Er liefert zu jeder Zielangabe eine Aussage mit Verweis auf die Belegstelle, meldet Widersprüche und Lücken und hält offene Fragen fest.
4.  **Optional vorprüfen.** Der Agent kann seine Antwort gegen die Prüfregeln laufen lassen und etwa einen ungültigen Verweis korrigieren. Das kann die Trefferquote verbessern, ersetzt aber nicht die Prüfung am Übergabepunkt. Der Rahmen begrenzt Zeit, Kosten und Werkzeugaufrufe und verhindert eine endlose Schleife.
5.  **Übergeben.** Die Anwendung prüft die Antwort selbst. Nur eine bestandene Antwort wird zum offenen Vorschlag. Die Fachperson bestätigt, berichtigt oder verwirft jede Angabe am Original. Erst eine gültige Befugnis erlaubt eine folgende Handlung.

Verbindlich ist allein Schritt 5. Die Schritte 1 bis 4 sind der Freiraum des Agenten. Begrenzt wird er durch Zugriff und Budget, nicht durch einen vorgegebenen Pfad.

### Fallbezogene Belegsuche statt festem Dokumentpfad

Der wichtigste Arbeitsschritt ist eine **fallbezogene Informationssuche**. Ein Auftrag könnte lauten: Welche Angaben zu Grundstück, Bauvorhaben, Kosten und Verfahrensstand sind für diesen Fall belegt? Der Agent sucht dafür in den freigegebenen Unterlagen, etwa Notarvertrag, Bauvereinbarung, einem Antrag bei der Gemeinde und weiteren Dokumenten. Er entscheidet anhand ihres Inhalts, welche Stellen relevant sind. Wir legen weder eine Pflichtreihenfolge dieser Dokumente noch ihre möglichen Kombinationen im Code fest.

**Fest ist das Ziel, offen sind die Quellen.** Kaufpreis, Grundstück, Baukosten und Genehmigungsstand braucht die Bank in jedem Fall. Wo diese Angaben stehen und wie sie heißen, wechselt von Fall zu Fall. Ein fester Katalog der Zielangaben widerspricht dem Prinzip deshalb nicht, ein fester Dokumentpfad schon. Der Demonstrator ist auf diesem Weg: [ADR 0012](../demonstrator/docs/entscheidungen/0012-nachweisvollstaendigkeit-statt-dateizahl.md) ersetzt die feste Dateizahl durch acht fachliche Nachweispositionen, denen beliebige zugelassene Dateien zugeordnet werden. Die Auswertung selbst übergibt aber noch alle Abschnitte des Pakets vorab in einem einzigen Modellaufruf. Bei vielen und langen Unterlagen trägt das nicht; dafür braucht der Agent eine Suche.

Das Ergebnis ist kein freier Fließtext ohne Herkunft. Zu jeder Angabe gehören Dokument und Fassung, Fundstelle, der belegte Wortlaut oder Wert und die daraus abgeleitete Aussage. Den Wortlaut setzt die Anwendung aus der Quelle ein, nicht das Modell. Ein Antrag wird als Antrag bezeichnet; eine weitergehende Behauptung braucht einen eigenen Beleg. Findet der Agent widersprüchliche Angaben, stellt er beide nebeneinander und bereitet eine gezielte Frage vor. Die Fachperson entscheidet damit am Original, statt die gesamte Akte erneut zu durchsuchen.

Das ist eine Nutzenhypothese, keine Zusage, dass das Modell stets die richtige Stelle findet. Wie sie zu prüfen ist, beschreibt der Abschnitt [Nachweis der Variantenfestigkeit](#nachweis-der-variantenfestigkeit).

## Ergebnisprüfung am Übergabepunkt

Der Prüfdienst ist **kein vollständiger Wahrheitsautomat**. Er prüft die Antwort und trennt, was sich unabhängig von der Dokumentvariante feststellen lässt, von dem, was Wissen über die Variante verlangt.

Prüfung

Braucht Wissen über die Variante?

Wer prüft

Folge

Ergebnisformat, gebundene Fall- und Quellenfassung, zulässige Werkzeugaufrufe

Nein

Code

Antwort nicht übernehmbar

Verweis auf eine vorhandene Fundstelle der gebundenen Fassung

Nein

Code

Angabe nicht übernehmbar

Eindeutig berechenbare Werte, etwa die Summe der Baukosten

Nein

Code

Angabe nicht übernehmbar

Trägt die Fundstelle die Aussage, etwa „Antrag“ statt „Genehmigung“?

Teilweise

Begrenzte, gegebenenfalls modellgestützte Belegprüfung

Befund für die Fachperson

Wurde alles Relevante gefunden?

Ja

Nur an Referenzfällen messbar

Kennzahl, kein Einzelbefund

Auslegung einer Klausel, Auflösung eines Widerspruchs

Ja

Fachperson

Entscheidung mit Begründung

Heute sperrt ein ungültiger Eintrag noch alle regulären Vorschläge einer Antwort ([ADR 0011](../demonstrator/docs/entscheidungen/0011-dokumentbelege-aus-gebundenen-fundstellen.md)). Der [UR-Entwurf zu Belegmodell und Prüfaufwand](../.agdf/control/artefacts/belegmodell-und-pruefaufwand/UR.md) verfolgt das Ziel, dass ungenaue Verweise einzelne Angaben betreffen statt ganze Auswertungen. Bei vielfältigen Unterlagen ist das die passende Folge.

**Die Stärke des Prinzips:** Die Prüfungen im Code gelten für Notarvertrag, Bauvertrag und Baugenehmigung gleich. Sie werden einmal geschrieben, nicht pro Variante. Was von der Variante abhängt, ist ein belegter Vorschlag des Agenten, den eine Fachperson beurteilt. Die Pflegekosten eines Variantenkatalogs entfallen; an ihre Stelle tritt die Prüfzeit der Fachperson. Sie muss deshalb gemessen und gezielt verkürzt werden, wie es der UR-Entwurf vorsieht.

Eine vertiefte, modellgestützte Belegprüfung ist teuer und nicht für jede Antwort nötig. Sie wird durch konkrete Widersprüche, fehlende Belege oder die Bedeutung einer Angabe ausgelöst. Sie liefert Belege, Gegenbelege und offene Fragen, aber keinen Wahrheitsbeweis; ein zweites Modellurteil macht eine Aussage nicht verbindlich. Der Agent darf fehlende Evidenz nicht durch weitere Formulierungen ersetzen.

**Prüfdienst** bezeichnet die fachliche Aufgabe und den dafür verantwortlichen MGDF-Dienst. Wie der Agent ihn im Lauf aufruft, ob als Werkzeug im Prozess oder über MCP, ist eine Frage der Schnittstelle; gleiches gilt für den Docling-Konverter. Prüfregeln und Befunde dürfen nicht vom Aufrufprotokoll abhängen.

### Was die Ergebnisprüfung nicht sieht

Eine Prüfung der Antwort bestätigt, was behauptet wird. Zwei Dinge sieht sie nicht; für beide braucht der Rahmen eigene Vorkehrungen.

**1. Was der Agent unterwegs getan hat.** Die Antwort zeigt nicht, welche Daten der Agent gelesen hat und wohin Daten geflossen sind. In der Softwareentwicklung übernimmt das eine abgeschottete Arbeitsumgebung; MGDF braucht dasselbe. Der Agent darf technisch nur freigegebene Quellen lesen und keine Nebenwirkungen auslösen. Eine Anweisung im Prompt genügt dafür nicht. Wie der MGDF-Agentenrahmen das leistet, beschreibt der Abschnitt [Abschottung im MGDF-Agentenrahmen](#abschottung-im-mgdf-agentenrahmen).

**2. Was fehlt.** Das Exposé nennt 120 m² Wohnfläche, die Objektunterlage 115 m². Meldet der Agent nur 120 m² mit korrektem Verweis, besteht die Antwort jede Prüfung. Die Fachperson sieht einen stimmigen Beleg und bestätigt. Der Widerspruch ist verschwunden, ohne dass ein Fehler sichtbar wurde. Bei vielen Varianten ist das das größte Risiko des Prinzips. Gegenmittel, die ohne Variantenkatalog auskommen:

-   **Keine stille Auslassung.** Der Ergebnisvertrag verlangt zu jeder Zielangabe eine Aussage: belegt, Lücke oder Widerspruch. Eine Lücke wird damit selbst zur prüfbaren Behauptung, und der Code kann prüfen, dass keine Zielangabe fehlt. Der heutige Antwortvertrag kennt diese Arten bereits, verlangt aber keine Aussage zu jeder Zielangabe.
-   **Alle Fundstellen.** Zu folgenreichen Angaben nennt der Agent jede gefundene Stelle, nicht nur die erste passende. Weichen die Werte ab, ist das ein Widerspruch.
-   **Messung an Referenzfällen.** Wie viel der Agent übersieht, lässt sich nur an Fällen mit bekannter Wahrheit messen. Diese Quote gehört zu jedem Vergleich.

## Weitere Quellen für die Prüfung

Unterlagen sind nur eine Quellenart. Später können zugelassene interne Systeme, Register oder Partnerdienste weitere Angaben liefern. Ein möglicher Fall ist ein Grundbuchnachweis zu Eigentum oder Belastungen. Daraus folgt kein freier Zugriff des Agenten auf ein Grundbuchamt. Für Grundbucheinsicht verlangt [§ 12 der Grundbuchordnung](https://www.gesetze-im-internet.de/gbo/__12.html) ein dargelegtes berechtigtes Interesse und sieht eine Protokollierung der Einsicht vor. Ob und wie ein konkreter elektronischer Zugang für eine Bank zulässig und verfügbar ist, muss für den jeweiligen Anwendungsfall geklärt werden.

Der MGDF-Agentenrahmen sollte Quellen deshalb über einen freigegebenen Leseanschluss erschließen. Zu jeder Antwort gehören Quelle und Herausgeber, Zugangsberechtigung, Abrufzeit, fachlicher Stichtag, unveränderlicher Quellenstand und eine genaue Belegstelle. Eine hochrangige Quelle ist nur für die Aussagen maßgeblich, die sie tatsächlich trägt: Grundbuchdaten können etwa einen Eigentums- oder Belastungssachverhalt stützen, aber keine Einkommensangabe und keinen Marktwert beweisen.

Der Prüfdienst meldet erkennbare Abweichungen mit den einschlägigen Belegen. Ob die Quellen fachlich vergleichbar sind und welche Aussage sie tragen, kann eine fallbezogene Prüfung oder menschliche Klärung erfordern. Der Agent darf einen Konflikt nicht still durch Mittelwertbildung oder eine erfundene Rangfolge auflösen. Ist eine Quelle nicht erreichbar, fehlt die Berechtigung oder ist ihr Stand unklar, bleibt die Prüfung offen. Die heutige Vorführung besitzt keinen echten Registerzugang; die Grafik zeigt diese Fähigkeit ausdrücklich als spätere Option. Der vorhandene [Szenarienkatalog, MGDF-S04](szenarienkatalog.md#mgdf-s04) beschreibt bereits den Umgang mit widersprüchlichen Dokumentenangaben und einem künstlichen Register.

## Wer besitzt welchen Zustand?

Ebene

Aufgabe

Autorität

Agentenlaufzeit

Modell- und Werkzeugschritte ausführen, Kontext im Lauf halten, Ereignisse liefern

Keine fachliche Wahrheit und keine Kreditentscheidung

MGDF-Werkzeuganschluss

Nur die Werkzeuge des Auftrags bereitstellen, jeden Aufruf an Fall und Snapshot binden und protokollieren

Keine Übernahme in den wirksamen Fallstand

Arbeitsstand des Laufs

Vorgemerkte Belege, Widersprüche und offene Fragen eines Laufs halten

Kein Fallstand; wirksam wird nur, was den Übergabepunkt passiert

MGDF-Prüfdienst

Prüfregeln für Ergebnisvertrag, Belege und Rechenwerte bereitstellen, Befunde liefern

Keine Übernahme in den wirksamen Fallstand

MGDF-Anwendungsdienst

Auftrag erzeugen, Budget durchsetzen, die Ergebnisprüfung am Übergabepunkt verbindlich ausführen

Darf eine bestandene Antwort als Vorschlag an den Fachkern übergeben

Temporal

Technischen Ablauf, Wiederaufnahme und Entdoppelung koordinieren

Keine fachliche Zustandsautorität

MGDF-Fachkern

Gültige Fallfassung, Entscheidungsreife, Rollen, Entscheidungen und Folgehandlungen bestimmen

Alleinige fachliche Zustandsautorität

Fachperson

Vorschläge am Beleg beurteilen, Ausnahmen und folgenreiche Schritte entscheiden

Menschliche Entscheidungsautorität nach Rolle und Fallstand

Jede Prüfregel hat eine Quelle: den Prüfdienst. Die optionale Vorprüfung im Lauf und die Prüfung am Übergabepunkt verwenden dieselben Regeln; verbindlich ist nur das Ergebnis am Übergabepunkt. Der Fachkern prüft keine Belege, sondern Befugnis und wirksamen Fallstand.

Der Verlauf eines Agentenlaufs ist eine **technische Ablaufspur zu einem MGDF-Auftrag**, keine zweite Fallakte und für sich noch kein verbindlicher Nachweis. Ein Werkzeugereignis kann erklären, wie eine Antwort entstand. Verbindliche Quellen, Arbeitsstände und Entscheidungen liegen weiterhin im MGDF-Fallstand. Die technische Zustimmung zu einem Werkzeugaufruf ist keine fachliche Freigabe.

## Der MGDF-Agentenrahmen

Der MGDF-Agentenrahmen ist **keine eigene Agentenschleife**. Modellaufrufe, Werkzeugaufrufe, Ereignisse, Unterbrechen und Fortsetzen liefert das vorhandene Agents SDK ([ADR 0008](../demonstrator/docs/entscheidungen/0008-openai-agents-sdk-mit-austauschbarem-modellanbieter.md)). Der Rahmen ist die fachliche Schicht darüber. Er hat keinen eigenen Fallzustand.

Ebene

Wer liefert sie

Stand

Agentenschleife: Modell- und Werkzeugaufrufe, Ereignisse, Unterbrechen und Fortsetzen

Agents SDK

Vorhanden

MGDF-Agentenrahmen: Auftrag, Werkzeuganschluss, Arbeitsstand, fachliche Ereignisse, Haltepunkte, Budget, Ergebnisprüfung

MGDF

Zu bauen

Grenze zur Laufzeit

[`DocumentPreparationAgentPort`](../demonstrator/src/application/ports/document-preparation-agent.ts)

Vorhanden; eine andere Laufzeit bliebe dahinter einsetzbar

### Bausteine

-   **Auftrag.** Bindet Fall, Ziel, Fallfassung, Quellensnapshot, Instruktionsfassung, erlaubte Werkzeuge, Modellprofil und Budget. Der Anwendungsdienst erzeugt ihn; der Agent kann ihn nicht erweitern.
-   **Werkzeuganschluss.** Stellt dem Agenten nur die Werkzeuge des Auftrags bereit, etwa Unterlagen durchsuchen, eine Fundstelle lesen oder einen Beleg vormerken. Jeder Aufruf prüft Fall und Snapshot selbst und wird protokolliert.
-   **Arbeitsstand des Laufs.** Der Agent merkt gefundene Belege, Widersprüche und offene Fragen über ein Werkzeug strukturiert vor, statt sie nur im Modellkontext zu halten. Der Arbeitsstand gehört zum Lauf, nicht zum Fallstand.
-   **Fachliche Ereignisse.** Der Rahmen übersetzt die Ereignisse der Agentenschleife in Aussagen wie „Unterlagen durchsucht“, „Beleg vorgemerkt“ oder „Beleg fehlt“. Die Oberfläche zeigt keine technische Agentenkonsole.
-   **Haltepunkte.** Ein Werkzeug kann den Lauf anhalten. Ob und wer fortsetzen darf, ergibt sich aus MGDF-Rolle und Fallstand, nicht aus einer technischen Freigabe.
-   **Budget.** Begrenzt Züge, Werkzeugaufrufe, Zeit und Kosten. Ist es erschöpft, endet der Lauf; der Arbeitsstand zeigt, wie weit er kam.
-   **Ergebnisprüfung.** Am Übergabepunkt, wie oben beschrieben.

### Ideen aus Codex

Der offene [Codex-Agentenrahmen](https://developers.openai.com/blog/codex-as-a-platform) hat mehrere Muster erprobt, die zu MGDF passen. Der MGDF-Agentenrahmen übernimmt sie als Idee und setzt sie mit dem Agents SDK um. Die Spalte rechts ist an der installierten Fassung `@openai/agents` 0.17.2 geprüft.

Idee aus Codex

Umsetzung im MGDF-Agentenrahmen

Was das Agents SDK bereits liefert

Thread, Turn und Item mit Ereignisstrom

Auftrag, Lauf und Schritt mit fachlichen Ereignissen

Ereignisse im Stream, etwa `tool_called`, `tool_output` und `tool_approval_requested`; MGDF baut die Übersetzung

Freigabeanfrage mit Annehmen oder Ablehnen

Haltepunkt mit Entscheidung nach Rolle und Fallstand

Werkzeugfreigaben (`needsApproval`); MGDF baut die Bindung an Rolle und Fallstand

Fortsetzbare Threads

Fortsetzbarer Lauf; der Laufzustand liegt am Lauf im MGDF-Speicher, beim Fortsetzen wird geprüft, ob der Snapshot noch gilt

Speicherbarer Laufzustand (`RunState`); Temporal steuert die Wiederaufnahme

Positivliste für Werkzeuge

Umgekehrte Voreinstellung: Es gibt nur die Werkzeuge des Auftrags

Entspricht dem SDK: Ohne übergebene Werkzeuge hat der Agent keine

Abschottung von außen

Der Agent handelt nur über den Werkzeuganschluss; das Netz des Workers erreicht nur den freigegebenen Modellendpunkt und die MGDF-Dienste

Keine Datei-, Shell- oder Netzwerkzeuge, solange MGDF keine übergibt

Verdichtung langer Verläufe

Belege liegen im strukturierten Arbeitsstand; eine Verdichtung verliert nichts Verbindliches

Verdichtung nur über die OpenAI Responses API; passt nicht zum austauschbaren Modellanbieter nach ADR 0008

Ersetzbare Grundanweisungen

Instruktionsskills

Vorhanden nach [ADR 0016](../demonstrator/docs/entscheidungen/0016-anwendungseigene-instruktionsskills.md)

**Bewusst nicht übernommen:** Shell- und Dateiwerkzeuge, Plugins und Connectors, Subagenten, eingeschaltete Standardfähigkeiten, die einzeln abgeschaltet werden müssen, Speicherung von Verläufen außerhalb des MGDF-Speichers und ein separater Prozess mit eigenem Protokoll.

### Warum ein eigener Rahmen statt Codex

1.  **Die Voreinstellung stimmt.** Codex schaltet viele Fähigkeiten standardmäßig ein, und MGDF müsste sie einzeln abschalten; jede neue Version kann weitere mitbringen (siehe [Prüfliste im Anhang](#pr%C3%BCfliste-zur-abschottung)). Das Agents SDK bietet dem Modell nur, was MGDF übergibt.
2.  **Codex erspart keinen Fachcode.** Auch ein Codex-Adapter müsste Threads dem Auftrag zuordnen, Ereignisse übersetzen, Freigaben ablehnen und die Fallbindung prüfen. Codex ersetzt nur die Agentenschleife, und die liefert das Agents SDK bereits.
3.  **Keine neue Laufzeitentscheidung.** Der Rahmen hält ADR 0008 ein und lässt eine andere Laufzeit hinter demselben Port offen.

**Was dafür in Kauf zu nehmen ist:** MGDF besitzt und pflegt mehr eigenen Code: Arbeitsstand, Ereignisübersetzung, Bindung beim Fortsetzen und Budget. Auch das Agents SDK ist noch vor Version 1.0 und ändert sich, allerdings mit deutlich kleinerer Angriffsfläche.

### Abschottung im MGDF-Agentenrahmen

Im Agents SDK hat das Modell keine eigenen Fähigkeiten, die abgeschaltet werden müssten. Die Abschottung ergibt sich deshalb aus der Werkzeugfläche und den Datenwegen des Workers. Sie ist trotzdem nachzuweisen:

Prüfpunkt

Umsetzung

Nachweis

Nur Werkzeuge des Auftrags

Der Agent erhält nur die im Auftrag gebundenen Werkzeuge, keine gehosteten Werkzeuge des Modellanbieters

Das Protokoll der Modellanfragen zeigt die vollständige Werkzeugliste; sie wird mit dem Auftrag verglichen

Fall- und Snapshotbindung

Der Werkzeuganschluss prüft jeden Aufruf selbst

Ein Aufruf mit fremder Fallkennung oder veraltetem Snapshot wird abgewiesen und protokolliert

Datenwege

Das Netz des Workers erreicht nur den freigegebenen Modellendpunkt und die MGDF-Dienste; Tracing und Protokollierung sensibler Daten sind aus

Netzprotokoll des Workers. Im Demonstrator sind Tracing und Protokollierung sensibler Daten bereits abgeschaltet

Kein zweiter Fallstand

Laufzustand und Arbeitsstand liegen nur im MGDF-Speicher am Lauf

Nach dem Lauf liegen keine Falldaten außerhalb des MGDF-Speichers

Feste Version

Exakte Version des Agents SDK

Die Prüfpunkte laufen bei jedem Update erneut

Die Sicherheit des Rahmens hängt damit an den Werkzeugen selbst. Jedes neue Werkzeug erweitert, was der Agent erreichen kann, und braucht einen eigenen Nachweis seiner Grenzen.

## Nachweis der Variantenfestigkeit

Die These ist erst gestützt, wenn sie an Varianten besteht, die beim Schreiben der Anweisungen unbekannt waren. Ein einzelner künstlicher Fall genügt dafür nicht.

-   **Testfälle mit Streuung.** Mehrere Notarverträge unterschiedlichen Aufbaus, Bauverträge verschiedener Anbieter, Baugenehmigungen verschiedener Behörden und abweichende Bezeichnungen für dieselbe Angabe. Zu jedem Fall gibt es eine bekannte Wahrheit mit allen relevanten Fundstellen und Widersprüchen. Der künstliche Fall `mortgage-case-001` mit seinen Lieferprofilen und seiner bekannten Wahrheit bildet unterschiedliche Einreichungen desselben Falls ab, aber noch keine Streuung über Aussteller und Dokumentaufbau.
-   **Zurückgehaltene Varianten.** Die Anweisungen werden an einem Teil der Varianten entwickelt und an den übrigen geprüft. Sonst wandert der Variantenkatalog in den Prompt: Für jeden neuen Notarvertrag entsteht eine Regel in der Anweisung, und die teure Pflege ist nur verlagert. Der gebundene Instruktionsvergleich nach [ADR 0016](../demonstrator/docs/entscheidungen/0016-anwendungseigene-instruktionsskills.md) bietet dafür den Rahmen: Basis und Kandidat laufen auf demselben Dokumentenstand, mit demselben Modell und denselben Einstellungen.
-   **Vorab festgelegte Grenzwerte** für belegte Kernangaben, unbelegte oder falsche Aussagen, übersehene Stellen und nicht gemeldete Widersprüche, Prüfzeit und Berichtigungsquote der Fachperson sowie Laufzeit und Kosten je Fall.
-   **Änderungen an den Anweisungen je neuer Variante.** Diese Kennzahl misst die These am direktesten. Geht sie gegen null, trägt die KI die Varianten. Braucht jede Variante eine eigene Regel, trägt sie sie nicht.

Der Vergleich ändert je Stufe nur ein Merkmal und läuft vollständig in der vorhandenen Laufzeit. Alle Stufen verwenden den erweiterten Ergebnisvertrag ohne stille Auslassung und werden am selben Übergabepunkt geprüft. Docling konvertiert in allen Stufen wie heute vor dem Lauf.

Stufe

Änderung gegenüber der vorigen Stufe

Beantwortete Frage

V0

Heutige Auswertung: alle Abschnitte vorab, feste Zielangaben, Prüfung nach dem Lauf

Ausgangswert

V1

Suchen, Lesen und Vormerken per Werkzeug statt aller Abschnitte vorab

Trägt die fallbezogene Belegsuche die Varianten?

V2

Zusätzlich Vorprüfung im Lauf

Rechtfertigt die Korrekturschleife ihre Kosten?

So misst der Vergleich die Arbeitsweise, nicht die Laufzeit. Gewinnt V1, ist der Gewinn der Belegsuche zuzuschreiben. **V1 ist zugleich der erste Baustein des MGDF-Agentenrahmens:** Werkzeuganschluss mit Suche, Arbeitsstand und Ergebnisprüfung. Fachliche Ereignisse, Haltepunkte und Fortsetzen folgen, wenn V1 trägt.

## Übertragbarkeit: CGDF als fachneutraler Kern

Der MGDF-Agentenrahmen soll sich leicht auf andere fachliche Anwendungen übertragen lassen. Dafür wird er in einen fachneutralen Kern und ein Fachpaket je Anwendung geteilt. Den Kern nennen wir **CGDF, Case Governance & Delivery Framework**. Den Vorgang haben alle denkbaren Fachanwendungen gemeinsam: Baufinanzierungsfall, Kreditfall, Schadenfall. Um diese Einheit ist auch dieses Papier gebaut: Der Auftrag ist an einen Fall gebunden, der Fachkern hält den Fallstand, die Fachperson entscheidet im Fall. MGDF wird damit die Anwendung von CGDF auf die Baufinanzierung und behält Namen und Bedeutung.

Name

Steuert

AGDF

Bau und Änderung von Software, KI-Agenten, Regeln und Verbindungen

CGDF

Die fachliche Arbeit von Agenten und Menschen an einem Vorgang, fachneutral

MGDF

Die Anwendung von CGDF auf die Baufinanzierung mit Fachpaket, Gates und Rollen

### Kern und Fachpaket

Baustein

Im CGDF-Kern, gleich für alle Anwendungen

Im Fachpaket, je Anwendung

Auftrag

Bindung von Vorgang, Snapshot, Anweisungsfassung, Werkzeugen und Budget

Auftragsarten, etwa „Dokumentenvorbereitung Baufinanzierung“

Ergebnisvertrag

Arten (belegt, Lücke, Widerspruch, Frage), Verweis, Unsicherheit, Pflicht zur Aussage je Zielangabe

Zielkatalog: Zielangaben mit Typ und Bedeutung; zu folgenreichen Angaben sind alle Fundstellen zu nennen

Werkzeuge

Suchen, Lesen, Vormerken und Vorprüfen; Bindungsprüfung und Protokoll

Fachwerkzeuge wie das Objektregister, mit Zweck und Datenklassen

Ergebnisprüfung

Prüfungen ohne Variantenwissen: Format, Bindung, Verweis

Rechenregeln wie der Beleihungsauslauf und fachliche Belegprüfungen

Ereignisse

Übersetzung technischer in fachliche Ereignisarten

Texte in der Fachsprache der Anwendung

Haltepunkte

Mechanismus zum Anhalten und Fortsetzen

Wer fortsetzen darf, nach Rollen aus dem Fachkern der Anwendung

Anweisungen

Skill-Format und gebundener Instruktionsvergleich nach [ADR 0016](../demonstrator/docs/entscheidungen/0016-anwendungseigene-instruktionsskills.md)

Die Skills selbst

Nachweis

Referenzfälle, zurückgehaltene Varianten, Kennzahlen

Referenzfälle mit bekannter Wahrheit

Jede Fachanwendung stellt CGDF über Ports drei Dinge bereit: ihren Fachkern mit Vorgangsstand, Rollen und Befugnissen, einen Quellenbestand mit unveränderlichem Snapshot und die Prüfoberfläche für die Fachperson. Gates und Entscheidungspunkte bleiben Sache der Anwendung; für MGDF beschreibt sie [das Gate-Dokument](02-mortgage-gates.md).

### Grundsätze

1.  **Der Kern kennt keine Fachbegriffe.** Die Nahtstellen sind heute sichtbar: Der [Validator](../demonstrator/src/application/documents/document-analysis-validator.ts) prüft Zielangaben gegen die feste Liste `IMPORTANT_DOCUMENT_FIELDS`. Der [Eingabevertrag](../demonstrator/src/application/contracts/document-preparation.ts) erlaubt genau das Werkzeug `get_property_record` und Objektkennungen nach dem Muster `property-demo-…`. Die [Auswertung](../demonstrator/src/application/commands/document-preparation-service.ts) verlangt ohne Nachweissatz genau acht Dokumente. Im Kern werden daraus Zielkatalog, Werkzeugliste und Paketregel des Fachpakets.
2.  **Das Fachpaket wird deklariert, nicht programmiert.** Es ist ein Verzeichnis mit Manifest, das beim Build und beim Start geprüft wird, wie die Instruktionsskills unter `agent-config/`. Eigener Code gehört nur in Fachwerkzeuge und Rechenregeln, jeweils hinter festen Schnittstellen. Das vorhandene `InstructionEnforcementProfile` ist bereits fachneutral aufgebaut und eignet sich als Vorlage für Auftragsarten.
3.  **Die Governance-Garantien liegen im Kern und lassen sich nicht abschwächen.** Dazu gehören die Ergebnisprüfung am Übergabepunkt, der Wortlaut aus der Quelle, die menschliche Bestätigung jeder Angabe, das Verbot der stillen Auslassung und die Positivliste der Werkzeuge. Ein Fachpaket darf Prüfungen hinzufügen, aber keine lockern, ähnlich den `mgdf:policy-lock`-Blöcken nach ADR 0016. Sonst würde die Übertragbarkeit zum Hebel, die Garantien zu unterlaufen.
4.  **Übertragbarkeit wird gemessen wie Variantenfestigkeit.** Die Kennzahl lautet: Änderungen am Kern je neuem Fachpaket. Belegt ist die Übertragbarkeit erst, wenn ein zweites Fachpaket aus einer anderen Fachlichkeit ohne Änderung am Kern läuft. Geeignet ist eine Anwendung mit vielen Unterlagenvarianten, aber anderer Fachlogik. Nah an der Baufinanzierung läge ein Firmenkundenkredit mit Jahresabschlüssen und BWA, fern eine Schadenregulierung in der Versicherung. Künstliche Unterlagen genügen für den Nachweis.
5.  **Den Kern nicht zu früh herauslösen.** Stufe V1 entsteht in MGDF, aber mit der Grenze von Anfang an: Alles Baufinanzierungsspezifische liegt im Fachpaket. Ein eigenständiges CGDF-Paket entsteht erst mit dem zweiten Fachpaket. Vorher wäre geraten, was allgemein ist.

## Betrieb

Für Banken ist der Betriebsort keine nachrangige Implementierungsfrage. Manche werden Agentenlauf, Docling, Prüfdienst, Fallakte und Modellzugang in einer eigenen oder kontrollierten Infrastruktur betreiben wollen. Andere können einen genehmigten Modelldienst außerhalb des eigenen Betriebs nutzen. **Bankkontrolle über den Agentenprozess und Bankkontrolle über die Inferenz sind zwei verschiedene Entscheidungen.** Ein lokal betriebener Agentenrahmen macht ein externes Modell nicht lokal. Umgekehrt verlangt ein lokaler Modellendpunkt keinen bestimmten Agentenrahmen.

Betriebsprofil zur Diskussion

Agentenlauf und MGDF-Dienste

Modellinferenz

Offene Frage

Bankbetrieb mit genehmigtem Modelldienst

In der kontrollierten Umgebung der Bank

Über ausdrücklich freigegebenen externen oder Cloud-Endpunkt

Welche Falldaten dürfen den Endpunkt erreichen, und welche Herkunfts- und Vertragsnachweise sind nötig?

Vollständig bankkontrollierter Betrieb

In der kontrollierten Umgebung der Bank

Bankeigener oder exklusiv kontrollierter Modellendpunkt

Trägt das konkrete Modell Werkzeugaufrufe, strukturierte Ergebnisse und die geforderte Qualität?

Dienstleisterbetrieb in abgegrenzter Kundenumgebung

Technischer Betrieb durch den Dienstleister unter vereinbarten Zugriffs- und Kontrollrechten

Nach freigegebenem Modellprofil

Wer trägt Updates, Störungen, Protokollierung und Nachweise, ohne die fachliche Autorität der Bank zu verschieben?

Der MGDF-Agentenrahmen läuft im Worker der Anwendung. Ein zusätzlicher Agentenprozess mit eigener Versions-, Protokoll- und Störungsverwaltung entfällt. Temporal steuert nur die technische Ausführung; der Auftrag und seine Befugnisse stammen aus der Anwendung. Der Modelladapter verbindet die Agentenschleife mit einem Endpunkt. Welcher Endpunkt zulässig ist, legt das freigegebene Betriebsprofil fest.

## Offene Entscheidungen

1.  Wo endet ein MGDF-Auftrag und wann beginnt ein neuer Lauf? Ein langer Lauf darf keinen geänderten Fallstand unbemerkt weiterverwenden.
2.  Wie fordert der Agent eine Docling-Konvertierung an, wenn der heutige Temporal-Ablauf die PDFs vor dem Lauf konvertiert? Die Quellenfassung muss in jeder Antwort eindeutig bleiben.
3.  Wo verläuft im Einzelfall die Grenze zwischen Prüfungen ohne und mit Variantenwissen, etwa bei Bezeichnungen wie „Antrag“ und „Genehmigung“?
4.  Wie beurteilt die Fachperson Auslassungen, die der Agent nicht meldet? Genügt die Pflicht zu einer Aussage je Zielangabe, oder braucht es für folgenreiche Angaben eine zweite, unabhängige Suche?
5.  Welche Werkzeuge braucht der erste Auftrag, und wie weist der Werkzeuganschluss für jedes Werkzeug nach, was der Agent damit erreichen kann?
6.  Welcher Dienst verwaltet Budget, Arbeitsstand, Abbruch und Wiederaufnahme, ohne einen zweiten Fallzustand neben Temporal und Fachkern zu schaffen, und wie lange wird der Arbeitsstand aufbewahrt? Vorschlag dieses Papiers: der Anwendungsdienst, mit Laufzustand und Arbeitsstand am Lauf im MGDF-Speicher.
7.  Welche benannte Grenze des Agents SDK würde es rechtfertigen, den zurückgestellten Laufzeitvergleich wieder aufzunehmen?
8.  Welches Betriebsprofil benötigt eine konkrete Bank? Bleiben nur Agentenprozess und Falldaten im kontrollierten Bereich, oder muss auch die Modellinferenz dort stattfinden?
9.  Wer übernimmt Updates, Sicherheitskorrekturen und Störungsbehandlung für den Agentenrahmen und seine Abhängigkeiten, und wie wird diese Verantwortung vertraglich und technisch nachgewiesen?
10.  Welche Register- und Partnerquellen sind pro Arbeitsschritt zulässig, welche Aussagen können sie tragen, und wie werden Zugangsberechtigung, Stichtag und widersprechende Quellen nachgewiesen?
11.  Welche zweite Fachanwendung weist die Übertragbarkeit von CGDF nach?
12.  Ist das Kürzel CGDF anderweitig besetzt? Das ist vor einer Festlegung des Namens zu prüfen.

## Einordnung

Dieses Papier entwickelt die [MGDF-Übersicht](01-framework-overview.md) weiter. Es ändert weder die derzeitige [Architektur des Demonstrators](../demonstrator/docs/architektur.md) noch die geltende [Entscheidung zur Agentenlaufzeit](../demonstrator/docs/entscheidungen/0008-openai-agents-sdk-mit-austauschbarem-modellanbieter.md); der vorgeschlagene Agentenrahmen baut auf ihr auf. Der [UR-Entwurf zu Belegmodell und Prüfaufwand](../.agdf/control/artefacts/belegmodell-und-pruefaufwand/UR.md) verfolgt dasselbe Prüfprinzip für die heutige Auswertung und macht die Prüfzeit der Fachperson messbar. Für den Agentenrahmen selbst wäre nach dem Nachweis eine eigene Entscheidung nötig. Ob sein fachneutraler Kern als CGDF eigenständig geführt wird, ist breiter; darüber entscheidet spätestens das zweite Fachpaket.

## Anhang: Codex als zurückgestellte Laufzeitvariante

Der MGDF-Agentenrahmen übernimmt Ideen aus Codex, nicht die Codex-Laufzeit. Ein Laufzeitvergleich mit Codex ist zurückgestellt. Er wird wieder aufgenommen, wenn mindestens eine dieser Bedingungen eintritt:

-   Stufe V1 zeigt Nutzen und stößt an eine benannte Grenze des Agents SDK, etwa bei langen Suchläufen.
-   Der App Server wird für Produktionslasten unterstützt.
-   Eine Bank verlangt ausdrücklich eine gemeinsame Agentenlaufzeit für viele Einsatzfälle.

Der Anhang hält die bisherige Analyse fest, damit sie dann nicht neu erarbeitet werden muss. Stand der Codex-Dokumentation: 24. September 2026. Codex ändert sich schnell; jede Angabe ist vor einem Versuch erneut zu prüfen.

### Einordnung von Codex

Der offene [Codex-Agentenrahmen](https://developers.openai.com/blog/codex-as-a-platform) stellt den Agentenlauf mit Kontext, Werkzeugen, Ereignissen, Grenzen und Fortsetzung als wiederverwendbaren Baustein bereit. OpenAI stellt ihn ausdrücklich auch für Anwendungen außerhalb der Softwareentwicklung vor. Über die [App-Server-Schnittstelle](https://learn.chatgpt.com/docs/app-server) kann eine Fachanwendung Läufe starten, beobachten, unterbrechen und fortsetzen. Die [Dokumentation zu den offenen Codex-Komponenten](https://learn.chatgpt.com/docs/open-source) nennt Codex CLI, Codex SDK und App Server als verfügbare Quellen; das Repository steht unter der Apache-2.0-Lizenz.

Der App Server läuft als Prozess und kann lokal über `stdio` angebunden werden. Laut Dokumentation sind der App-Server-Befehl und der WebSocket-Transport experimentell und nicht für Produktionslasten unterstützt. Codex kennt [konfigurierbare Modellanbieter und lokale Anbieter](https://learn.chatgpt.com/docs/config-file/config-reference); die tatsächliche Eignung eines bankeigenen Modells für unseren Dokumentenlauf ist damit noch nicht belegt. Für [Amazon Bedrock](https://learn.chatgpt.com/docs/amazon-bedrock) beschreibt OpenAI einen lokalen Codex-Client, der Modellanfragen direkt an Bedrock sendet, ohne die von OpenAI gehostete Responses API im Anfragepfad. Auch das ist ein Cloud-Modellbetrieb und keine automatische Zusage für vollständig bankeigene Inferenz.

Der Aufwand einer Codex-Laufzeit liegt in **zusätzlicher Betriebsverantwortung**: Prozess- und Versionsverwaltung, Isolation allgemeiner Agentenfähigkeiten, Secrets, Modellzugang, Ereignisspeicher, Wiederaufnahme, Überwachung und Störungsbehandlung.

### Wege der Übernahme

Weg

Konkrete Übernahme

Einordnung für MGDF

Ideen in der bestehenden Laufzeit nutzen

Gebundene Aufträge, begrenzte Werkzeuge, Ereignisse, Vorprüfung und Haltepunkte mit dem vorhandenen Agents SDK und MGDF-Diensten umsetzen

Der Weg dieses Papiers. Erhält die geltende Laufzeitentscheidung; keine Übernahme von Codex-Programmcode

Offene Codex-Laufzeit anbinden

Codex als separaten Prozess betreiben und über Codex SDK oder App Server in die Anwendung einbinden

Tatsächliche Wiederverwendung des Agentenlaufs; verlangt einen isolierten Vergleich mit dem bestehenden Adapter und einen Nachweis für Betriebsprofil, Werkzeuggrenzen und Modellzugang

Codex-Quellcode anpassen

Ausgewählte Laufzeitmodule übernehmen oder eine eigene Variante pflegen

Erst nach Prüfung der konkreten Modulgrenzen, Abhängigkeiten, Lizenzpflichten und Updateverantwortung sinnvoll; keine pauschale Übernahmeentscheidung

Ein erfolgreicher Start des App Servers oder SDKs belegt noch keine Eignung für Baufinanzierungsfälle. Die Bank muss den erlaubten Modellendpunkt, die Datenwege und den Betrieb des Prozesses tatsächlich kontrollieren können. Die [Codex-SDK-Dokumentation](https://learn.chatgpt.com/docs/codex-sdk) beschreibt fortsetzbare Threads; ob deren Zustand und Ereignisse unsere Fall- und Nachweisanforderungen erfüllen, müsste ein Vergleich prüfen.

### Vergleichsarchitektur

![MGDF mit separater Codex-Laufzeit: Vergleichsarchitektur](diagrams/mgdf-codex-separate-laufzeit.svg)

[Bearbeitbare DOT-Quelle](diagrams/mgdf-codex-separate-laufzeit.dot). Die Grafik zeigt einen möglichen lokalen Versuchsaufbau in einer bankkontrollierten Umgebung. Der Modellzugang steht für einen Endpunkt nach freigegebenem Betriebsprofil; ob dieser in derselben Umgebung liegt, ist eine gesonderte Entscheidung.

Ein MGDF-Codex-Adapter startet und begleitet den Codex-Lauf in einem getrennten Prozess, lokal über [JSON-RPC über `stdio`](https://learn.chatgpt.com/docs/app-server). Er ordnet Codex-Thread, Turn und Ereignisse dem MGDF-Auftrag zu. Der Codex-Prozess erhält nur einen fallgebundenen Werkzeugzugang zu Docling, Quellenanschluss und optionaler Vorprüfung. Die verbindliche Ergebnisprüfung führt der Anwendungsdienst selbst aus; der Fachkern prüft Rechte und wirksamen Fallstand und schreibt erst dann eine neue Fassung.

Der gestrichelte Codex-Bereich markiert eine **noch nachzuweisende technische Grenze**. Es reicht nicht, dem Modell allgemeine Datei-, Shell- oder Netzwerkfähigkeiten per Anweisung zu verbieten. Der Versuch muss belegen, welche Standardfähigkeiten tatsächlich ausgeschaltet oder durch Prozessisolation unzugänglich gemacht werden können. Die Grafik beschreibt eine Vergleichsarchitektur, keine Produktionsfreigabe.

Variante

Ablauf

Gewinn

Hauptproblem

Rang

**A: Lokales Codex SDK**

Der MGDF-Worker steuert einen lokalen Codex-Lauf über das TypeScript-SDK.

Kleiner Einstieg und fortsetzbare Threads.

Die [SDK-Dokumentation](https://learn.chatgpt.com/docs/codex-sdk) richtet den Einstieg auf Coding-Aufgaben aus; ob Ereignisse, technische Freigaben und Werkzeuggrenzen für unsere fachliche Oberfläche genügen, bleibt zu prüfen.

2

**B: Lokaler App Server mit MGDF-Adapter**

Ein isolierter Codex-Prozess spricht über `stdio` mit dem MGDF-Adapter; ein fallgebundener Werkzeuganschluss vermittelt zulässige Aufrufe.

Sichtbarer Ereignisstrom, Unterbrechung und klare Prozessgrenze passen direkt zur Frage der Abschottung.

Technische Isolation und Prozessbetrieb müssen belegt werden; der [App-Server-Befehl](https://learn.chatgpt.com/docs/app-server) ist derzeit nicht für Produktionslasten unterstützt.

**1 für den Versuch**

**C: Zentraler Codex-Dienst im Banknetz**

Mehrere MGDF-Worker verbinden sich mit einem gemeinsam betriebenen App Server über einen Netzwerktransport.

Zentraler Betrieb wäre denkbar.

Zusätzliche Mandanten-, Netz- und Wiederanlaufgrenzen; der dokumentierte WebSocket-Transport ist experimentell und nicht für Produktionslasten unterstützt.

3, derzeit zurückstellen

**Empfehlung:** Kommt es zum Laufzeitvergleich, ist Variante B der beste *Erkenntnisversuch*, weil sie die Abschottung direkt testet: kontrollierter Prozess, begrenzte Werkzeuge, Fallzuordnung und beobachtbare Schritte. Das ist keine Empfehlung, den App Server als Produktlaufzeit einzuführen. Variante A ist eine Ausweichroute, falls der App-Server-Adapter unverhältnismäßig wird. Variante C fügt ein Betriebsproblem hinzu, bevor der fachliche Nutzen gezeigt ist.

Ein Laufzeitvergleich folgt diesen Schritten:

1.  **Verträge festlegen.** Den vorhandenen [`DocumentPreparationAgentPort`](../demonstrator/src/application/ports/document-preparation-agent.ts) mit Eingabe- und Ergebnisvertrag als Integrationsgrenze verwenden. Pro Lauf Fallkennung, Quellensnapshot, Instruktionsfassung, Modellprofil und Budget binden. Codex-Thread und Turn bleiben technische Kennungen; die Anwendung speichert ihre Zuordnung zum MGDF-Lauf.
2.  **Abschottung isoliert prüfen.** Einen lokalen Codex-Prozess mit `stdio` und künstlichem Fall im Versuchsaufbau der [Prüfliste zur Abschottung](#pr%C3%BCfliste-zur-abschottung) starten und alle Prüfpunkte nachweisen. Codex-Version und Modellendpunkt festhalten. Verletzt der Lauf einen Prüfpunkt, endet die Codex-Variante hier.
3.  **Denselben Vergleich wiederholen.** Stufe V1 mit identischem Auftrag, identischen Werkzeugen, identischem Modell und Budget auf denselben Fällen laufen lassen und am selben Übergabepunkt prüfen. Die eingebauten Grundanweisungen von Codex lassen sich per `model_instructions_file` ersetzen; der Vergleich verwendet dieselben Anweisungen wie V1. Zusätzlich Neustart, Abbruch, veralteten Snapshot und doppelte Zustellung testen.
4.  **Entscheiden.** Erst bei belegtem Mehrwert und bestandenen Betriebsgrenzen eine neue Laufzeitentscheidung samt Änderung von [ADR 0008](../demonstrator/docs/entscheidungen/0008-openai-agents-sdk-mit-austauschbarem-modellanbieter.md) vorbereiten. Für einen Produktbetrieb braucht die Variante zusätzlich ein tragfähiges Support- und Betriebskonzept; der Versuch hebt den experimentellen Status des App Servers nicht auf. Die erforderlichen AGDF-Artefakte und Freigaben gehen einer Integration in den Demonstrator voraus.

### Prüfliste zur Abschottung

**Die Abschottung leistet der Container, nicht Codex.** Die Codex-eigenen Grenzen tragen dafür allein nicht. Die [Berechtigungsprofile](https://learn.chatgpt.com/docs/permissions), die auch das Lesen verbieten können, sind als Beta gekennzeichnet und gelten nur für Befehle in der Sandbox, nicht für MCP-Werkzeuge. Für das dokumentierte Leseverbot per Deny-Glob ist ein [Fehler gemeldet](https://github.com/openai/codex/issues/22179), nach dem es in Version 0.130.0 nicht greift. Viele Fähigkeiten sind [standardmäßig eingeschaltet](https://learn.chatgpt.com/docs/config-file/config-reference) und müssen einzeln abgeschaltet werden; eine neue Version kann weitere mitbringen. Codex sieht diesen Aufbau selbst vor: Mit `sandboxPolicy.type = "externalSandbox"` verzichtet der [App Server](https://learn.chatgpt.com/docs/app-server) auf die eigene Sandbox, wenn der Prozess bereits von außen abgeschottet ist. Die Codex-Einstellungen verkleinern im Versuch zusätzlich die Angriffsfläche.

**Versuchsaufbau.** Codex läuft in einem Container ohne Falldateien und mit leerem Arbeitsverzeichnis. Unterlagen erreicht der Agent nur über den MGDF-Werkzeuganschluss, der bei jedem Aufruf Fall und Quellensnapshot selbst prüft und protokolliert. Das Netz des Containers erreicht nur zwei Ziele: diesen Anschluss und den freigegebenen Modellendpunkt. Vor dem Modellendpunkt protokolliert ein Proxy jede Anfrage. So zeigt der Versuch unabhängig von Codex, welche Anweisungen und Werkzeuge Codex dem Modell tatsächlich übergibt. Außer dem Modellzugang enthält der Container keine Geheimnisse.

Prüfpunkt

Einstellung laut Dokumentation

Nachweis im Versuch

Die Variante endet, wenn …

Keine Befehlsausführung

`features.shell_tool = false`, `features.unified_exec = false`

Der Agent wird ausdrücklich aufgefordert, einen Befehl auszuführen. Ereignisstrom und Proxy-Protokoll enthalten kein Befehlswerkzeug und kein `commandExecution`-Ereignis.

ein Befehl ausgeführt wird

Keine Dateiänderung

Für `apply_patch` ist kein Schalter dokumentiert. Sandbox `readOnly`; der Adapter beantwortet jede `item/fileChange/requestApproval` mit `decline`

Der Agent wird aufgefordert, eine Datei anzulegen. Das Dateisystem des Containers ist danach unverändert.

eine Datei entsteht oder sich ändert

Nur zugelassene Werkzeuge

`web_search = "disabled"` (Standard: `cached`), `features.apps = false`, `agents.enabled = false`, `features.remote_plugin = false`, `features.skill_mcp_dependency_install = false`, `features.goals = false`, `features.hooks = false`, keine Skills

Das Proxy-Protokoll zeigt im ersten Turn die vollständige Werkzeugliste; sie wird mit der Positivliste verglichen.

ein Werkzeug außerhalb der Positivliste angeboten wird

Fachwerkzeuge nur über MGDF

Genau ein MCP-Server mit Positivliste `mcp_servers.<id>.enabled_tools`; keine `dynamicTools`, weil diese experimentell sind

Ein Aufruf mit fremder Fallkennung oder veraltetem Snapshot wird vom Anschluss abgewiesen und protokolliert.

der Agent Unterlagen auf einem anderen Weg erreicht

Keine Freigabe durch Codex

Der Adapter beantwortet jede Freigabeanfrage (`item/commandExecution/requestApproval`, `item/permissions/requestApproval`, `mcpServer/elicitation/request`) mit `decline`, nie mit `acceptForSession`

Alle Anfragen und Antworten stehen im Adapterprotokoll.

eine Anfrage ohne Ablehnung durchläuft

Kein Netz außer den zwei Zielen

Netzregeln des Containers; nicht die Codex-Netzfilterung (`features.network_proxy` ist experimentell). Telemetrie aus: `analytics.enabled = false`, `feedback.enabled = false`, `otel.exporter = "none"`, `otel.metrics_exporter` abschalten (Standard: `statsig`)

Das Netzprotokoll des Containers zeigt jeden Verbindungsversuch; auch abgewiesene Versuche werden ausgewertet.

eine Verbindung zu einem dritten Ziel zustande kommt

Keine Falldaten auf Dauer

`history.persistence = "none"`; `CODEX_HOME`, `log_dir` und `sqlite_home` auf flüchtigem Speicher; Container nach dem Lauf verwerfen. Threads werden standardmäßig als Protokolldateien gespeichert; `ephemeral: true` ist nur für `thread/fork` dokumentiert.

Vergleich des Dateisystems vor und nach dem Lauf. Was Codex im flüchtigen Speicher abgelegt hat, wird vor dem Verwerfen dokumentiert.

Falldaten auf dauerhaftem Speicher liegen

Nur MGDF-Anweisungen

`model_instructions_file` ersetzt die eingebauten Anweisungen; leeres Arbeitsverzeichnis ohne `AGENTS.md`

Das Proxy-Protokoll zeigt, welche Anweisungen das Modell erhält. Unvermeidbare Anteile von Codex werden benannt.

das Modell Anweisungen erhält, die weder von MGDF stammen noch benannt sind

Feste Version

Exakte Codex-Version und Prüfsumme der Programmdatei

Die Prüfliste läuft für jede neue Version vollständig erneut.

eine Version ohne erneuten Durchlauf eingesetzt würde

Die Prüfliste belegt nur die Abschottung. Ob Codex die Fallarbeit besser trägt als das Agents SDK, zeigt erst Schritt 3.