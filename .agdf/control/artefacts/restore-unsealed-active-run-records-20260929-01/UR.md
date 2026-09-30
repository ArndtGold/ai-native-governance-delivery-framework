# UR: Ungesiegelte aktive AGDF-Runs sicher wiederherstellen

Status: draft
Gate: UR
Gate approval: open
Date: 2026-09-29
Owner: Arndt Gold

## 1. Problem

Der Host-Startbefund meldet 86 Findings über aktive Runs. Davon sind 23 Blocker `AGDF_RUN_SEAL_INVALID`: Den jeweiligen aktiven Run States fehlt ein gültiges Siegel. Dadurch ist ihr aktueller Inhalt nicht als vertrauenswürdiger, normal änderbarer Kontrollstand bestätigt.

## 2. Goal

Jeder betroffene Run wird auf einen belegbar vertrauenswürdigen Kontrollstand zurückgeführt. Bestehende Freigaben oder Artefakte werden nur übernommen, wenn sie durch die wiederhergestellte Historie belegt sind. Runs ohne wiederherstellbare Historie werden als Legacy-Fall behandelt und nicht stillschweigend freigegeben.

## 3. Scope

- Für die 23 im Doctor-Bericht benannten aktiven Runs die Git-Historie auf den letzten gültig gesiegelten Stand untersuchen.
- Belegbar gesiegelte Stände mit dem unterstützten Wiederherstellungsweg zurückführen und danach regulär validieren.
- Runs ohne solchen Stand nur über den ausdrücklich vorgesehenen Legacy-Migrationsweg behandeln; unklare oder widersprüchliche Fälle bleiben blockiert und werden einzeln ausgewiesen.
- Den all-active Doctor-Bericht erneut ausführen und die Wirkung je Run dokumentieren.

## 4. Non-Goals

- Siegel manuell erzeugen oder bestehende Inhalte, Revisionen, Freigaben und Artefaktverweise ungeprüft übernehmen.
- Andere Runs, Host-Installation oder Plugin-Paket ändern.
- Freigaben zwischen Runs übertragen oder die vorhandenen Findings zu Risiken und fehlender Evidenz als erledigt markieren.

## 5. Acceptance Signals

- Für jeden der 23 Runs ist die Wiederherstellung auf einen konkreten vertrauenswürdigen Stand oder die Einstufung als Legacy-/ungeklärter Fall belegt.
- Keine Freigabe oder Artefaktreferenz wird ohne passende Historie übernommen.
- Der abschließende all-active Bericht zeigt keine unbegründet beseitigten Blocker; verbleibende Findings sind mit Run, Code und Grund dokumentiert.
- Der Run `agdf-review-remediation-20260929-01` und andere nicht betroffene Runs bleiben unverändert.

## 6. Existing Source Of Truth

- `.agdf/control/runs/<run_id>/RUN_STATE.md` für die kanonischen Run States.
- Git-Historie dieses Repositorys für belegbare frühere Run-State-Versionen.
- `create-agdf/lib/control-state/` und die zugehörigen Lifecycle-Befehle für unterstützte Wiederherstellung und Legacy-Migration.
- Der Doctor-Bericht vom 2026-09-29 14:58 UTC als Inventar der 23 betroffenen aktiven Runs.

## 7. Risks And Unknowns

- Es ist noch nicht geprüft, ob für alle 23 Runs eine frühere gesiegelte Version in der Git-Historie existiert.
- Ein fehlendes Siegel kann mit nicht protokollierten Änderungen zusammenhängen; ein älterer Stand darf nur wiederhergestellt werden, wenn Änderungen und Freigaben nachvollziehbar sind.
- Eine Migration kann nicht belegte Freigaben nicht nachträglich autorisieren.

## 8. Next Step

Diese UR prüfen. Erst die exakte Freigabe `Approval: UR` für diesen Run erlaubt Brownfield Review und die weitere Planung.
