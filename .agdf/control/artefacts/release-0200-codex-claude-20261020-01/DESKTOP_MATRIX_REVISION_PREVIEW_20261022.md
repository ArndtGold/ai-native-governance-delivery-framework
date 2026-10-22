# Desktop release-matrix revision: impact preview

Date: 2026-10-22
Run: release-0200-codex-claude-20261020-01
Current revision: 38b4d50c-ab56-4693-a352-5000cf4e6185
Operation: b65c1a90-2c2e-44e3-b949-28a28f8491e9
Status: preview accepted; application not performed

## Reviewable change

- [Proposed release matrix](RELEASE_MATRIX_REVISION_20261022.md): manually checked Codex Desktop and Claude Desktop; separate Windows Claude CLI evidence; Codex Linux/native Windows explicitly unqualified outside the proposed mandatory matrix; experimental hosts preserved.
- [Recorded human handchecks](DESKTOP_HANDCHECKS_20261022.md): invocation, upgrade and recovery reported passed on both Desktop hosts. Concrete app/model/candidate values were not supplied and are not invented.
- [Closeout preparation](CLOSEOUT_PREPARATION_20261022.md): ordered owners, evidence conditions and remaining review/approval work.

## Exact previewed effects

- Retain the approved UR and its exact source bytes.
- Archive and supersede the existing PRD, SD and TP approvals and their source bindings before renewing them.
- Reassess the prior Brownfield Review, implementation preparation, CD+Tests and affected or unassociated quality records. The preview's next gate is Brownfield Review.
- Retain all code, tests and raw observations with their existing provenance. They require a fresh applicability assessment under the renewed TP; they are not erased or automatically relabeled as new passes.
- No implementation authority, QA/UAT/OR approval, release, tag, commit or push follows from the preview or from applying the source revision.

The current Run remains at revision 17 / CD+Tests. Approved sources and production release policy have not been modified. This preview alone does not enact the new matrix.

## Bound confirmation material

Proposal: [PRD_SCOPE_REVISION_PROPOSAL_20261022_01.json](PRD_SCOPE_REVISION_PROPOSAL_20261022_01.json)

Preview digest: `sha256:c4fccd8ff7e83b13e4469c53373996baee5931cb3408b8fa86d3e95fabbfea51`

Exact confirmation selector returned by Core:

```text
Apply source revision: release-0200-codex-claude-20261020-01 38b4d50c-ab56-4693-a352-5000cf4e6185 b65c1a90-2c2e-44e3-b949-28a28f8491e9 PRD sha256:c4fccd8ff7e83b13e4469c53373996baee5931cb3408b8fa86d3e95fabbfea51
```

[Exact command request](PRD_SCOPE_REVISION_PREVIEW_REQUEST_01.json) and [returned preview](PRD_SCOPE_REVISION_PREVIEW_RESULT_01.json) are retained. The response grants no gate approval. A new deliberate confirmation of this specific impact is required before source_revision.apply.

## AGDF Approval Summary (de; source=en)

Die neue Matrix, beide Desktop-Handprüfungen und der Abschlussplan sind vorbereitet. Die Vorschau ist akzeptiert, aber noch nicht angewendet. Beim Anwenden bleiben UR, Code, Tests und Rohbelege erhalten; die bisherigen PRD-/SD-/TP-Freigaben werden archiviert und müssen für die neue Matrix erneuert werden. Eine interne Brownfield-Neubewertung steht zuerst an. Desktop-Aufruf, Upgrade und Wiederherstellung sind als menschlich bestätigte Prüfungen dokumentiert; konkrete Versions-/Modell-/Kandidatenangaben bleiben unbekannt. Codex unter Linux/Windows bleibt unqualifiziert. Das ist keine QA-/UAT-/OR- oder Veröffentlichungsfreigabe.
