# UR: Review-Befunde zu Schreibintegrität und Auslieferung beheben

Status: draft
Gate: UR
Gate approval: open
Date: 2026-09-29
Owner: Arndt Gold

## 1. Problem

Die rein lesenden Reviews vom 2026-09-29 nennen mehrere Risiken, die zusammen eine verlässliche Auslieferung verhindern: Mehrdatei-Schreibvorgänge können bei Abbruch auseinanderlaufen, Installer können Konfigurationen beschädigen oder einen bereits übernommenen Stand zurückrollen, und der Release-Pfad kann inkonsistente oder unvollständige Pakete veröffentlichen. Weitere öffentliche Texte und Plugin-Pfade stimmen nicht mit der ausgelieferten Wirkung überein. Der Review hat diese Laufzeitfehler nicht reproduziert; Quelltextbefunde und vermutete Fehler sind vor einer Korrektur getrennt zu prüfen.

## 2. Goal

AGDF soll Kontrollzustand und Host-Konfiguration auch bei konkurrierenden Vorgängen und definierten Abbrüchen konsistent halten. Ein Release soll nur über einen geprüften, versionsgleichen Pfad mit vollständigen Lizenzdateien und stimmigen Plugin-Inhalten möglich sein. Öffentliche Aussagen über Evals und MCP sollen die tatsächlich belegte Leistung beschreiben.

## 3. Scope

1. **Schreibintegrität:** C1–C7 aus Review v2 gegen die aktuellen Eigentümer und betroffenen Plattformen reproduzieren oder begründet verwerfen. Bestätigte Risiken an Run-State, OR, Backlog, Locks, Pfadbegrenzung, Installer-Konfiguration, Ownership-Prüfung und Marketplace-Recovery durch eine zusammenhängende Fehler- und Wiederherstellungsregel beheben. Keine parallele zweite Quelle für Run- oder Besitzentscheidungen schaffen.
2. **Release-Integrität:** B1–B5 beheben: nur der gekoppelte `agdf-v*`-Publish-Pfad, deterministische Installation der benötigten Abhängigkeiten, versionsgleiche Lockfiles, vollständige LICENSE/NOTICE-Pakete und überprüfte Paket-Inhalte. Die CI-Härtung aus B4 wird nach ihrem konkreten Schutzbeitrag priorisiert, einschließlich minimaler Berechtigungen und reproduzierbarer Abhängigkeiten.
3. **Ausgelieferter Vertrag:** P1 mit einem im installierten Plugin auflösbaren Guard-Pfad, neu berechneten Fingerprints und Paketprüfung beheben. Weitere bestätigte Drift in generischen Verträgen und duplizierten Regeln (P2–P4) einem kanonischen Eigentümer zuordnen.
4. **Wahrheitsgemäße Nachweise:** D2 und D4 so korrigieren, dass Offline-Evals, tatsächliche Messungen, MCP-Aktivierung und Datenzugriffe nicht stärker dargestellt werden als belegt. Die übrigen niedriger priorisierten Reviewpunkte werden als begründete Folgeaufgaben oder ausdrücklich ausgeschlossene Punkte erfasst.

Die Arbeit wird nach Brownfield Review und freigegebenem TP in überprüfbare Pakete geschnitten; die Reihenfolge ist Schreibintegrität, Release-Blocker, Vertrags- und Aussagekorrekturen, danach zusätzliche Härtung.

## 4. Non-Goals

- Den bereits laufenden `agdf_inspect`-Slice, seine QA oder UAT durch diesen Run nachträglich freigeben; dessen Doku- und Protokollkorrektur bleibt bei `agdf-mcp-inspect-slice1-20260929-01`.
- Ein npm-Paket, einen Tag oder eine Website vor QA und UAT veröffentlichen.
- Freigabeformeln, Run-Auswahl oder Gate-Semantik abschwächen, um Tests oder einen Release zu ermöglichen.
- Aus nicht reproduzierten Review-Vermutungen ohne Gegenprobe neue Produktregeln ableiten.

## 5. Acceptance Signals

- Für jeden übernommenen C-Befund existiert eine isolierte Reproduktion oder ein dokumentierter Gegenbeweis. Fault-Injection- und Konkurrenztests zeigen nach Abbruch genau einen gültigen, wiederherstellbaren Stand; kein bestätigter Pfad verliert fremde Daten oder überschreibt ein ungeprüftes Symlink-Ziel.
- Der Release-Workflow installiert benötigte Abhängigkeiten aus konsistenten Lockfiles, veröffentlicht die drei Pakete nur über den gekoppelten Pfad und prüft deren gepackten Inhalt einschließlich LICENSE und erforderlicher NOTICE-Hinweise.
- Der installierte Plugin-Payload enthält einen auflösbaren Guard-Pfad; Quell-, generierte und gepackte Projektionen bestehen dieselbe Fingerprint- und Integritätsprüfung.
- Öffentliche Eval- und Datenschutztexte trennen Replay, Live-Beobachtung und noch nicht geprüfte Host-Wirkung. Automatische Prüfungen sichern konkrete, maschinenprüfbare Aussagen gegen erneute Drift.
- Relevante Linux- und Windows-Prüfungen, Paket- und Release-Vorbereitung sowie die AGDF-Gates für diesen exakten Run sind nachvollziehbar dokumentiert. Ein grüner Test allein gilt nicht als QA, UAT oder Release-Freigabe.

## 6. Existing Source Of Truth

- `docs/reviews/REVIEW_ai-native-governance-delivery-framework_v2.md` und `docs/reviews/REVIEW_ai-native-governance-delivery-framework_v3_Architektur.md` sind Hinweise und Prüfaufträge, keine Gate-Entscheidungen.
- `create-agdf/lib/control-state/`, `create-agdf/lib/installers/`, `create-agdf/lib/lifecycle/`, `create-agdf/lib/release/` und die vorhandenen Testbesitzer.
- `.github/workflows/publish-agdf.yml`, `.github/workflows/agdf-guardrails.yml`, `RELEASE.md`, Paketmanifeste und Lockfiles.
- `plugin/meta/contracts/`, `plugin/skills/`, `create-agdf/scripts/sync-package-assets.js` und die bestehenden Footprint- und Paketprüfungen.
- `.agdf/control/SOT_REGISTRY.md`, `.agdf/control/CONTEXT_GRAPH.md` und die exakten Run-States der bestehenden, getrennt verantworteten Arbeiten.

## 7. Risks And Unknowns

- Einige C-Befunde sind als `inferred` gekennzeichnet. Brownfield Review und TP müssen für sie einen reproduzierbaren Fehlerpfad festlegen, bevor ein Fix entworfen wird.
- C1/C2 betreffen mehrere Dateien. Nur die Schreibreihenfolge zu tauschen kann eine neue Inkonsistenz erzeugen; Recovery und Sperrgrenze müssen gemeinsam bestimmt werden.
- Host-Konfigurationen und Symlinks liegen außerhalb des Repositorys. Tests müssen in isolierten Verzeichnissen erfolgen und Eigentumsgrenzen vor jedem Löschvorgang erneut prüfen.
- Historische npm-Tags und der aktuelle Quellstand sind verschiedene Stände. Paket- und Dokuprüfungen dürfen `agdf-v0.14.5` nicht mit noch unveröffentlichten MCP-Änderungen gleichsetzen.
- Ob bestehende aktive Runs einzelne Befunde bereits besitzen, ist vor PRD/TP anhand ihrer Ziele und Revisionsstände aufzulösen; Freigaben werden nicht zwischen Runs übertragen.

## 8. Next Step

Diese UR und ihren Umfang prüfen. Erst die exakte Freigabe `Approval: UR` für diesen Run erlaubt Brownfield Review und PRD.
