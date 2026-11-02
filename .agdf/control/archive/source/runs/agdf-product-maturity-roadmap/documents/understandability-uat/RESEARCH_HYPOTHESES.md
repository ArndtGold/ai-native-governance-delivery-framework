# Vorab registrierte Verständlichkeitshypothesen

Status: `unconfirmed_until_independent_observation`
Freeze ID: `pmr6-understandability-v1-20260827`
Registriert am: `2026-08-27`

## Zweck und Grenze

Diese Hypothesen beschreiben mögliche Missverständnisse in der aktuellen AGDF Statuskarte. Sie sind
keine Produktfehler, kein UAT Ergebnis und kein Grund, die eingefrorenen Stimuli vor der Beobachtung
zu ändern.

- Die Hypothesen werden Teilnehmenden nicht gezeigt.
- Wortgetreue Antworten werden vor jeder Bewertung erfasst.
- Bewertet wird ausschließlich mit dem Scoring Key im UAT Protokoll.
- Eine Hypothese gilt nur dann als gestützt, wenn eine unabhängige Beobachtung den entsprechenden
  falschen oder unklaren Schluss tatsächlich zeigt.
- Nicht beobachtete Hypothesen werden nicht nachträglich als Befund ausgegeben.
- Produktänderungen werden erst nach abgeschlossener Auswertung in einen separat gegateten Child Run
  geroutet.

## Hypothesen

| ID | Beobachtbarer Kandidat | Zu prüfender möglicher Fehlschluss | Primäres Bewertungsfeld |
|---|---|---|---|
| UH-01 | Deutsche Feldnamen enthalten englische Handlungsbeschreibungen. | Die Person versteht erlaubte, verbotene oder nächste Handlungen nicht sicher oder verwechselt sie. | `next_action`, `authority_effect` |
| UH-02 | `Blockiert durch: keine` steht neben einer praktisch unerfüllten externen Voraussetzung. | Die Person folgert, dass die Durchführung jetzt möglich ist. | `status`, `next_action` |
| UH-03 | Das interne Gate heißt `CD+Tests`, während die konkrete Tätigkeit eine menschliche Verständlichkeitsbeobachtung ist. | Die Person erwartet Implementierung oder automatisierte Tests statt externer Beobachtung. | `status`, `next_action` |
| UH-04 | `Fehlende Freigabe: keine` ist formal korrekt, obwohl noch externe Evidenz fehlt. | Die Person folgert, dass keine Voraussetzung mehr offen ist oder der Run weitergehen darf. | `status`, `authority_effect` |
| UH-05 | Die Karte trennt einen Gate Blocker nicht sichtbar von fehlender Durchführbarkeit. | Die Person setzt formale Prozessfreigabe mit aktueller Ausführbarkeit gleich. | `status`, `next_action`, `authority_effect` |

## Auswertungsregel

Nach allen acht Beobachtungen werden die wortgetreuen Antworten zuerst regulär bewertet. Erst danach
wird geprüft, ob ein falscher oder unklarer Schluss einer Hypothese zugeordnet werden kann. Die
Zuordnung ergänzt die UAT Evidenz, verändert aber weder Antworten noch Primärscore.
