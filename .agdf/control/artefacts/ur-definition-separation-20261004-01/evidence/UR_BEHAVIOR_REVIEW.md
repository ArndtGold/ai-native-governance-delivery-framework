# UR Behavior Review

Decision: pass

Die aktuelle Codex-Instanz hat nach Lesen der neuen Skillfassung die vier aufgezeichneten
Aufträge selbst beantwortet und gegen Originalauftrag und bestätigten Kontext geprüft.
Die tatsächlichen Entwürfe und die tatsächliche gebündelte Frage sind vollständig in
UR_BEHAVIOR_CASES.json gespeichert. Die Herleitung des Problems aus dem konkret geforderten Statusfilter wurde ausdrücklich
als Annahme markiert; die Kopier-UR verspricht nur die angefragte ID.
Alle neun Bedarfsfelder, offener Freigabestatus,
Annahmen und deferred technische Unbekannte wurden geprüft.

complete_request und answered_context erzeugen sofort einen vollständigen Entwurf.
material_gap bewahrt einen offenen Entwurf und fragt Anlass, Empfänger und Kanal gemeinsam.
minor_gap hält Gestaltung als Annahme offen, ohne einen geklärten Bedarf erneut abzufragen.
Keine zusätzliche Produktzusage, kein technischer Komponentenentscheid und keine Freigabe
wurde aus den Aufträgen erfunden.

Evidenzgrenze: kooperative Beobachtung derselben Agenteninstanz, keine unabhängige Bewertung,
kein frisch installierter nativer Host. Der gebaute stdio MCP-Server lieferte hingegen
vier tatsächliche Bindungen; die Agenteninstanz verfasste danach die Entwürfe, erfasste sie
mit run-step und prüfte die neue Revision. BOUND_BEHAVIOR_RUNTIME.json belegt drei
presentation_required-Ergebnisse und die Zurückhaltung der materiell offenen UR.
Die semantischen Antworten stammen vom aktuellen Agenten, nicht vom MCP-Server selbst.
Deterministische Paket-/Transporttests prüfen separat Bindung, Writer und Freigabegrenzen.
