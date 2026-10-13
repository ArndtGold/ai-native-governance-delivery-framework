# Prompts für die AGDF UI Mockups

Die fünf Bilder begleiten [AGDF Hub und Run Cockpit](../07-ui-konzept.md).
Sie zeigen ein UI-Zielkonzept mit erfundenen Beispieldaten. Erzeugung: integriertes Imagegen,
Use Case `ui-mockup`, am 12. Oktober 2026. Die erste Ansicht dient den weiteren Bildern als
Referenz für Stil und Anwendungskopf. Die finalen PNG-Dateien liegen in diesem Verzeichnis.
Die Bilder sind illustrative Entwürfe; die im Architekturkapitel beschriebenen Zuständigkeiten
und Grenzen bestimmen ihre Bedeutung.

## 01 chat einstieg

Datei: `01-chat-einstieg.png`

```text
Use case: ui-mockup. Asset type: high fidelity desktop UI mockup for German AGDF architecture documentation. Output one crisp landscape 1536x1024 screenshot-like image, straight-on, no perspective, no computer hardware, no photographs, no collage, no decorative presentation margins. This is a fictional product concept, not an actual software screenshot.
Design system shared by all scenes: neutral light background #fcfcfc, subtle #eff0f0 borders, white cards with restrained 8px radius, charcoal #3c3e40 text, muted #66686a labels, dark teal #0f766e primary buttons, pale teal selected states #f0fdfa, amber only for pending clarification, Inter-style highly legible sans serif. Small wordmark AGDF. Mature calm coding workspace, generous spacing, readable German text, clear hierarchy, no racing car graphics, no circular gauges, no invented percentages. Every panel must fit cleanly inside the frame. Exact supplied German copy, avoid random filler and tiny text. A quiet footer says "UI-Konzept · Beispieldaten".
Scene 01: a user's conversation in a coding-agent desktop host. The scene must teach that the first AGDF run cockpit appears AS A CARD INSIDE THE CHAT, before a large right panel exists. The workspace shows small app header "Kundenportal", a narrow 160px navigation rail with "Chat" selected and "AGDF Hub", then a large spacious conversation area. No expanded right panel.
At top of conversation: title "Anmeldung verbessern". User message: "Verbessere die Anmeldung. Bei falschen Zugangsdaten soll eine klare Meldung erscheinen." AI response: "Ich habe Ziel und Umfang als Anforderung vorbereitet."
Below that, an embedded substantial card, around 780px wide, unmistakably part of the chat. Card top "AGDF · Run-Cockpit", small "Stand 12.10.2026 · 09:15". Heading "Anmeldung verbessern". Teal outlined chip "UR · Anforderung", pale amber chip "Du bist dran".
Inside card key line: "Ziel und Umfang prüfen". Short content "Klare Fehlermeldung bei ungültigen Zugangsdaten." and "Passwort-Reset und neue Anmeldung bleiben außerhalb des Umfangs."
Subsection "Deine Entscheidung": "Prüfe diese Fassung. Du kannst sie freigeben oder eine Änderung verlangen."
Visible button row: dark teal "UR freigeben", secondary "Änderung verlangen", text action "Ablehnen". Second action row: "Dokument lesen" and "Cockpit groß öffnen".
Bottom of card "Danach: Bestehendes System untersuchen." At bottom of conversation, real chat composer "Frage oder Änderungswunsch …". Ensure card is not depicted as a hub, ensure it carries its own orientation. No arrows or external labels.
```

## 02 run cockpit rechts

Datei: `02-run-cockpit-rechts.png`

```text
Use case: ui-mockup. Asset type: high fidelity desktop UI mockup for German AGDF architecture documentation. Output one crisp landscape 1536x1024 screenshot-like image, straight-on, no perspective, no computer hardware, no photographs, no collage, no decorative presentation margins. This is a fictional product concept, not an actual software screenshot.
Design system shared by all scenes: neutral light background #fcfcfc, subtle #eff0f0 borders, white cards with restrained 8px radius, charcoal #3c3e40 text, muted #66686a labels, dark teal #0f766e primary buttons, pale teal selected states #f0fdfa, amber only for pending clarification, Inter-style highly legible sans serif. Small wordmark AGDF. Mature calm coding workspace, generous spacing, readable German text, clear hierarchy, no racing car graphics, no circular gauges, no invented percentages. Every panel must fit cleanly inside the frame. Exact supplied German copy, avoid random filler and tiny text. A quiet footer says "UI-Konzept · Beispieldaten".
Input image 1 is a STYLE AND APPLICATION SHELL REFERENCE only. Generate a new independent scene; do not repeat the reference screen's layout when this scene requests a split or hub.
Scene 02: SAME "Kundenportal" workspace and SAME fictional user Julia Kramer as style reference. Desktop split composition: narrow left rail 150px with "Chat" selected and "AGDF Hub"; chat column around 390px; LARGE RIGHT RUN COCKPIT around 930px. Make right area dominant. Small app header "AGDF  Kundenportal". Left chat title "Anmeldung verbessern", user "Bitte zeig mir die Anforderung genauer.", AI "Rechts findest du dieselbe Fassung.", small inline card "UR · Anforderung" and "Rechts geöffnet", chat composer bottom "Frage oder Änderungswunsch …".
Right has a permanently visible orientation header, distinct from scrollable content: breadcrumb "Run-Cockpit" and text button "Hub öffnen", title "Anmeldung verbessern", compact progress strip "UR" (active teal) → "Analyse" → "Planung" → "Umsetzung" → "QA / UAT" (future gray). Banner "UR · Anforderung zur Entscheidung", amber tag "Du bist dran". Clear text "Prüfe Ziel und Umfang dieser Fassung." Smaller line "Danach: Bestehendes System untersuchen."
Below pinned header tabs "Aktueller Schritt" selected, "Dokumente", "Verlauf". Main white decision card title "Anforderung prüfen", muted "UR · Fassung 1". Two tidy sections "Das soll sich ändern" with text "Klare Fehlermeldung bei falschen Zugangsdaten." and "Außerhalb des Umfangs" with text "Passwort-Reset und neue Anmeldung."
Three concise decision buttons "UR freigeben", "Änderung verlangen", "Ablehnen". Link "Genaues Dokument lesen". Separate pale information card "Was deine Freigabe bewirkt" text "Die Anforderung ist vereinbart. AGDF kann das bestehende System untersuchen." Footer small "Stand 12.10.2026 · 09:15". Include an unobtrusive vertical scrollbar only on body below the orientation to demonstrate persistence. No external arrows or annotation banners.
```

## 03 dokument pruefen

Datei: `03-dokument-pruefen.png`

```text
Use case: ui-mockup. Asset type: high fidelity desktop UI mockup for German AGDF architecture documentation. Output one crisp landscape 1536x1024 screenshot-like image, straight-on, no perspective, no computer hardware, no photographs, no collage, no decorative presentation margins. This is a fictional product concept, not an actual software screenshot.
Design system shared by all scenes: neutral light background #fcfcfc, subtle #eff0f0 borders, white cards with restrained 8px radius, charcoal #3c3e40 text, muted #66686a labels, dark teal #0f766e primary buttons, pale teal selected states #f0fdfa, amber only for pending clarification, Inter-style highly legible sans serif. Small wordmark AGDF. Mature calm coding workspace, generous spacing, readable German text, clear hierarchy, no racing car graphics, no circular gauges, no invented percentages. Every panel must fit cleanly inside the frame. Exact supplied German copy, avoid random filler and tiny text. A quiet footer says "UI-Konzept · Beispieldaten".
Input image 1 is a STYLE AND APPLICATION SHELL REFERENCE only. Generate a new independent scene; do not repeat the reference screen's layout when this scene requests a split or hub.
Scene 03: SAME Kundenportal desktop split with narrow left rail, chat LEFT and LARGE RUN COCKPIT RIGHT, like style reference. User Julia Kramer. Top header "AGDF  Kundenportal".
Left conversation title "Anmeldung verbessern". User message "Ist eindeutig festgelegt, welche Meldung angezeigt wird?", AI reply "Prüfe den Abschnitt Verhalten bei ungültigen Zugangsdaten." Composer bottom.
Right persistent orientation header must remain fully visible even though document body is scrolled: title "Anmeldung verbessern", progress strip "UR" active, "Analyse", "Planung", "Umsetzung", "QA / UAT" future; banner "UR · Anforderung zur Entscheidung", amber "Du bist dran". Instruction "Prüfe Ziel und Umfang dieser Fassung." Label "UR · Fassung 1".
Below header reader toolbar with "Zur Entscheidung" on left, "Mit der KI besprechen" on right. Main large document reading area title "Anforderung: Anmeldung verbessern". Gray source note "Exakte Entscheidungsfassung · Noch nicht freigegeben". Visible document body:
heading "Verhalten bei ungültigen Zugangsdaten"
paragraph "Die Anmeldung bleibt geöffnet. Eine verständliche Meldung erscheint direkt am Formular."
Inset amber highlighted proposed sentence "Die Meldung lautet: Anmeldung nicht möglich."
Below heading "Noch zu klären"
text "Ist diese Meldung für den Anwender konkret genug?"
Below heading "Umfang"
text "Bestehende Anmeldung verbessern. Passwort-Reset bleibt unverändert."
Show a vertical document scrollbar partway down, while orientation above remains pinned. Text is large readable. This scene should make a realistic decision tension visible: user discovers vague wording and can discuss or request a specific correction. No approval buttons inside the document body, return to decision is clear.
```

## 04 entscheidung bestaetigt

Datei: `04-entscheidung-bestaetigt.png`

```text
Use case: ui-mockup. Asset type: high fidelity desktop UI mockup for German AGDF architecture documentation. Output one crisp landscape 1536x1024 screenshot-like image, straight-on, no perspective, no computer hardware, no photographs, no collage, no decorative presentation margins. This is a fictional product concept, not an actual software screenshot.
Design system shared by all scenes: neutral light background #fcfcfc, subtle #eff0f0 borders, white cards with restrained 8px radius, charcoal #3c3e40 text, muted #66686a labels, dark teal #0f766e primary buttons, pale teal selected states #f0fdfa, amber only for pending clarification, Inter-style highly legible sans serif. Small wordmark AGDF. Mature calm coding workspace, generous spacing, readable German text, clear hierarchy, no racing car graphics, no circular gauges, no invented percentages. Every panel must fit cleanly inside the frame. Exact supplied German copy, avoid random filler and tiny text. A quiet footer says "UI-Konzept · Beispieldaten".
Input image 1 is a STYLE AND APPLICATION SHELL REFERENCE only. Generate a new independent scene; do not repeat the reference screen's layout when this scene requests a split or hub.
Scene 04: SAME Kundenportal desktop, Julia Kramer. Narrow rail left, conversation column left, large run cockpit right. Show the result AFTER user requested clearer error copy, received revised UR Fassung 2, and deliberately approved it. This is a confirmed stored decision, not pending and not execution already started.
Left chat shows three concise chronological messages:
Julia: "Bitte verwende: E-Mail oder Passwort ist nicht korrekt."
AGDF: "Die Anforderung ist überarbeitet. Fassung 2 liegt zur Entscheidung vor."
A compact pale teal event "UR freigegeben · Fassung 2".
Bottom chat composer.
Right pinned orientation header "Anmeldung verbessern", progress strip "UR" with completed check, "Analyse" current teal, "Planung", "Umsetzung", "QA / UAT" future gray.
Header status "Aktueller Schritt: Bestehendes System untersuchen".
Banner "Als Nächstes ist die KI dran" and text "Keine weitere Gate-Entscheidung erforderlich."
Tabs "Aktueller Schritt", "Dokumente", "Verlauf".
Main centered result card with subtle green/teal check and title "UR-Freigabe gespeichert".
Exact text "Du hast Fassung 2 der Anforderung freigegeben." Revised requirement quotation "E-Mail oder Passwort ist nicht korrekt."
Subsection "Was jetzt möglich ist": "AGDF darf das bestehende System untersuchen und den weiteren Ablauf bestimmen."
Primary button "Weiterarbeit beauftragen". Secondary "Freigegebene Fassung lesen". Small line "Umsetzung ist noch nicht freigegeben." Lower concise history card "Zurückgelegte Schritte" with 3 items "Anforderung vorbereitet", "Meldung präzisiert", "UR · Fassung 2 freigegeben".
Do not show a running spinner or execution in progress; this is the next work intent awaiting explicit continue in this example. Do not retain active approval buttons for the already approved version.
```

## 05 hub und verlauf

Datei: `05-hub-und-verlauf.png`

```text
Use case: ui-mockup. Asset type: high fidelity desktop UI mockup for German AGDF architecture documentation. Output one crisp landscape 1536x1024 screenshot-like image, straight-on, no perspective, no computer hardware, no photographs, no collage, no decorative presentation margins. This is a fictional product concept, not an actual software screenshot.
Design system shared by all scenes: neutral light background #fcfcfc, subtle #eff0f0 borders, white cards with restrained 8px radius, charcoal #3c3e40 text, muted #66686a labels, dark teal #0f766e primary buttons, pale teal selected states #f0fdfa, amber only for pending clarification, Inter-style highly legible sans serif. Small wordmark AGDF. Mature calm coding workspace, generous spacing, readable German text, clear hierarchy, no racing car graphics, no circular gauges, no invented percentages. Every panel must fit cleanly inside the frame. Exact supplied German copy, avoid random filler and tiny text. A quiet footer says "UI-Konzept · Beispieldaten".
Input image 1 is a STYLE AND APPLICATION SHELL REFERENCE only. Generate a new independent scene; do not repeat the reference screen's layout when this scene requests a split or hub.
Scene 05: SAME calm light Kundenportal workspace with AGDF wordmark and Julia Kramer. AGDF HUB selected in a narrow left rail, Chat other item. This screenshot teaches PROJECT-WIDE run discovery and selected run history. Large main hub center 850px and an integrated selected-run detail panel right 420px. Top header "AGDF  Kundenportal". Main title "Meine Vorhaben", subtitle "Was läuft und wo du gebraucht wirst".
Search box populated "Anmeldung". Horizontal filter chips "Aktiv" selected, "Geplant", "Abgeschlossen"; attention filter "Alle" selected and "Meine Entscheidung". Tiny summary "2 Treffer im Projekt Kundenportal". A table-like list with clear readable columns "Vorhaben", "Aktueller Schritt", "Wer ist dran". Selected pale teal row "Anmeldung verbessern" / "Analyse" / "KI · Weiterarbeit beauftragen". Second row "Anmeldung barrierefrei machen" / "PRD" / "Du · Fassung prüfen". Small line under selected row "UR freigegeben · Fassung 2".
Right selected-run panel title "Anmeldung verbessern". Tab bar "Überblick" and "Verlauf" with Verlauf selected. Timeline titled "Zurückgelegte Schritte": "09:15 · Anforderung vorbereitet" (UR Fassung 1); "09:22 · Meldung präzisiert" (UR Fassung 2); "09:28 · UR freigegeben" (Fassung 2 · Entscheidung gespeichert). Each history event gets a discreet link "Fassung ansehen".
At bottom of right panel a separately bordered pale teal current block "Jetzt: Bestehendes System untersuchen" and "Als Nächstes ist die KI dran". Primary button "Run-Cockpit öffnen". Make current state visually distinct from the timeline. No approve buttons in hub; it routes to selected run. No invented full-project coverage percentages. Footer "Stand 12.10.2026 · 09:30" and "UI-Konzept · Beispieldaten".
```

## Präzisierungen der finalen Ansichten

Die Bilder 04 und 05 wurden durch gezielte Imagegen-Bearbeitung präzisiert. Die Zeitpunkte
wurden zwischen Cockpit und Hub vereinheitlicht. Der Hub benennt den Anwender als Akteur für
„Weiterarbeit beauftragen“; danach ist die KI für die Untersuchung zuständig.

### Ansicht 04

```text
Use case: text-localization. Edit this existing AGDF UI mockup with precise text-only corrections. Preserve every layout, element, color, font, German sentence, and position exactly. Only change the timestamps so the fictional timeline matches the companion hub view: in the lower "Zurückgelegte Schritte" timeline change "Heute · 09:13" to "Heute · 09:15", change "Heute · 09:21" to "Heute · 09:22", and change "Heute · 09:24" to "Heute · 09:28". Also change the left chat timestamp of the "UR freigegeben · Fassung 2" message from "Heute · 09:24" to "Heute · 09:28". No other changes.
```

### Ansicht 05

```text
Use case: text-localization. Edit this existing AGDF Hub UI mockup with one precise text correction. Preserve all layout, all other text, colors, typefaces and spacing exactly. In the selected first row, in the "Wer ist dran" column, replace "KI · Weiterarbeit beauftragen" with "Du · Weiterarbeit beauftragen". This clarifies that the user issues the continuation request and the AI will then execute the next task. Keep the right-panel sentence "Als Nächstes ist die KI dran" unchanged. No other changes.
```
