# Interne Abnahme der Aktivitätsanzeige in Claude Code und Codex

Am 22. November 2026 wurde die Aktivitätsanzeige für die interne Nutzung mit einer dokumentierten Abweichung abgenommen. Geprüft wurde der Stand `f1fde31b`. Die technische QA-Bewertung lautet weiterhin `revise`.

| Prüfumgebung | Beobachtung |
|---|---|
| Claude Code | Beim Wechsel zu einem anderen Run zeigte der Begleiter dessen eigenen nächsten Schritt. Nach regulärem Ende und nach Abbruch mit Escape verschwand die Arbeitsmeldung. |
| Codex-Begleiter im Browser, 360 Pixel breit | „Einen Augenblick“ erschien nur beim arbeitenden Run. Nach simuliertem Ende und Abbruch kehrte der Begleiter automatisch zum nächsten Schritt zurück. Eine verspätete Tool-Antwort aktivierte die Arbeitsmeldung in beiden Fällen kein zweites Mal. |
| Codex-Laufzeit | Zwei getrennte Testläufe bestätigten die Zustände `completed` und `interrupted`. |

**Offener Desktop-Test.** Vor der produktiven Freigabe prüft der AGDF-Maintainer für Codex Desktop dieselbe Fassung in einem entsperrten Testprofil mit freigegebenen Hooks. Im Seitenpanel muss die Arbeitsmeldung dem richtigen Run folgen und nach regulärem Ende sowie nach einem Klick auf „Stopp“ automatisch verschwinden.
