# UR: Record host-compatibility evidence from LF source bytes

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-16
Owner: Arndt Gold

## 1. Problem

CI run 38859307536 (PR #16, commit `93adf9ca`, job `verify (ubuntu-latest)`) fails at
`compatibility-freshness`: `npm run compatibility:check` reports `source_snapshot_changed`.

The recorded source snapshot (`docs/compatibility/evidence/snapshot.json`) holds for
`packages/cli/lib/installers/packaged-app-marketplace.js` the SHA-256 of a CRLF working copy
(SHA-256 prefix `35eb6d2a`). The repository stores the file with LF (`.gitattributes`: `* text=auto eol=lf`), and CI
checks out LF bytes (SHA-256 prefix `c0d138a0`). The Windows working copy still holds CRLF because Git normalizes only on
commit; the recorder hashes working-copy bytes. All other 237 snapshot files match their LF blobs, and the
generated payloads contain no CR bytes. The same stale hash is also in local commit `8467f354`.

## 2. Goal

The committed host-compatibility evidence matches the LF bytes CI checks out, so `compatibility:check`
passes on CI as it does locally.

## Affected Users

AGDF maintainers and the PR #16 CI pipeline.

## 3. Scope

- Normalize the working copy of `packages/cli/lib/installers/packaged-app-marketplace.js` to LF so that it
  equals the committed blob (no Git content change).
- Re-record host-compatibility evidence with `npm run compatibility:record` and confirm with
  `npm run compatibility:check`.
- Verify CI equivalence: every file hash in the recorded snapshot equals the hash of its committed LF blob, and
  the generated payloads contain no CR bytes.

## 4. Non-Goals

- Changing the recorder or checker (for example hashing Git-normalized content or refusing CRLF working
  copies); that prevention is a separate follow-up.
- Changing any product code or tests.
- Committing or pushing; the user commits.

## 5. Acceptance Signals

- `npm run compatibility:check` passes locally after re-recording.
- All recorded snapshot file hashes equal their committed LF blob hashes (0 mismatches).
- No working-copy file in the snapshot contains CR bytes.

## 6. Existing Source Of Truth

- `scripts/host-compatibility/run.mjs` (`sourceSnapshot`, record and check).
- `docs/compatibility/evidence/snapshot.json`, `docs/compatibility/evidence/facts.json`,
  `docs/compatibility/HOST_COMPATIBILITY.md`, `evals/host-compatibility/observations/`.
- `.gitattributes` (LF policy).

## 7. Risks And Unknowns

- Other Windows working copies can hit the same trap until the recorder is hardened; the follow-up should
  address it.
- CI green can only be confirmed after the user pushes.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

Problem: Der CI-Lauf 38859307536 (PR #16, Commit 93adf9ca, Job „verify (ubuntu-latest)“) scheitert bei `compatibility-freshness`, weil `compatibility:check` `source_snapshot_changed` meldet. Der aufgezeichnete Snapshot enthält für `packages/cli/lib/installers/packaged-app-marketplace.js` den Hash einer CRLF-Arbeitskopie (SHA-256-Präfix 35eb6d2a). Das Repo speichert die Datei laut `.gitattributes` mit LF, und CI checkt LF aus (SHA-256-Präfix c0d138a0). Die Windows-Arbeitskopie hat noch CRLF, weil Git erst beim Commit normalisiert, und der Recorder hasht die Bytes der Arbeitskopie. Alle anderen 237 Snapshot-Dateien stimmen mit ihren LF-Blobs überein, die generierten Payloads enthalten keine CR-Bytes. Derselbe veraltete Hash steckt auch im lokalen Commit 8467f354.

Ziel: Die committeten Host-Kompatibilitätsbelege passen zu den LF-Bytes, die CI auscheckt. `compatibility:check` besteht dadurch auf CI wie lokal.

Betroffene: AGDF-Maintainer und die CI-Pipeline von PR #16.

Umfang: Die Arbeitskopie von `packaged-app-marketplace.js` wird auf LF normalisiert, sodass sie dem committeten Blob entspricht; am Git-Inhalt ändert sich nichts. Die Belege werden mit `npm run compatibility:record` neu aufgezeichnet und mit `npm run compatibility:check` bestätigt. Zur CI-Äquivalenz wird geprüft, dass jeder Datei-Hash im Snapshot dem Hash des committeten LF-Blobs entspricht und die generierten Payloads keine CR-Bytes enthalten.

Grenzen: Keine Änderung an Recorder oder Checker, etwa normalisiertes Hashing oder Ablehnen von CRLF-Arbeitskopien; diese Vorbeugung ist ein eigener Folgeschritt. Keine Änderung an Produktcode oder Tests. Kein Commit und kein Push, das übernimmt der Nutzer.

Erfolg: `compatibility:check` besteht lokal nach der Neuaufzeichnung. Alle Datei-Hashes im Snapshot entsprechen den committeten LF-Blobs (0 Abweichungen). Keine Snapshot-Datei in der Arbeitskopie enthält CR-Bytes.

Quellen: `scripts/host-compatibility/run.mjs` (Snapshot, record, check); `docs/compatibility/evidence/snapshot.json`, `facts.json`, `HOST_COMPATIBILITY.md` und `evals/host-compatibility/observations/`; `.gitattributes` (LF-Regel).

Risiken: Andere Windows-Arbeitskopien können in dieselbe Falle laufen, bis der Recorder gehärtet ist; das soll der Folgeschritt lösen. Ein grüner CI-Lauf lässt sich erst nach dem Push durch den Nutzer bestätigen.

Nächster Schritt: UR prüfen und freigeben, danach folgt der Brownfield Review mit der Wahl des Lieferwegs.
