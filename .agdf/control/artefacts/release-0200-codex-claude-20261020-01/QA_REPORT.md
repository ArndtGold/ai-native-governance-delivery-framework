# QA Report: AGDF 0.20.0 original CLI evidence and local import correction

Status: draft
Gate: QA
Gate approval: open
Based on: approved TP, current Code/Clean/TP reviews, complete local verification and original native evidence
Date: 2026-10-24
Owner: Codex using qa-gate; human acceptance belongs to the maintainer

## 1. QA Decision

Decision: revise

qa-gate is the sole final Quality Readiness decision owner. All 27 shared repository verification
stages now pass on the exact isolated source snapshot, including the complete CLI/MCP smoke chain.
The complete canonical read-only validate --all-hosts route passes the ten actual original native
records and their locked reviews. The prior import defect and Delivery Map blockers are corrected.

The remaining findings are evidence-only: the maintainer-accepted missing Windows review/import,
its final repository-import projection, and the new final source commit/candidate/evidence needed
if the changed probe/tooling files enter the release. These are proposed for bounded human QA
acceptance below. They are not resolved or silently converted into passing qualification.

| Quality Readiness | Evidence owner | Result |
|---|---|---|
| Plan coverage | task-plan-review | revise: T-008 to T-010 retain the three stated final evidence obligations |
| Solution integrity | clean-implementation-review | pass for the source correction, derived outputs and traceability metadata |
| Code quality | code-review | pass for the actual scoped diff and preserved authority/source boundaries |
| QA decision | qa-gate, sole decision owner | revise; bounded deviation proposal prepared, not approved |

## 2. TP Coverage

- delivered_result: The failure-case producer now records authorizes explicitly; the existing validator accepts its absence only in a legacy Codex failure_case summary with hash-checked primary authorizes false. All ten actual original cases and their reviews pass the complete read-only matrix validator. All 27 shared verification stages pass on the exact current-source snapshot. Three traceability metadata defects are corrected through the existing writer without changing approved artefacts, gates or approval seals. Original records and the Codex archive remain unchanged; no repository import was performed.

Approved TP: sha256:ee5e322f0887d8cd14912d9953b6676a733aefa908bdef13a3dc5592502d4581.
Current TP Review records T-001 to T-007 and T-011 fully_done; T-008 to T-010 partially_done.
The partial states preserve missing import/projection and final release-candidate evidence; they
do not represent an open implementation defect. Code/Clean reviews pass the actual three-file
correction, reviewed compatibility outputs and three source-backed metadata corrections.

## 3. Evidence

- QA_FINISH_20261024/VERIFICATION.json, FINAL_VERIFICATION.md and verification.log: all 27
  canonical stages pass. Source digest: 9888565d0513806fda85ef1eb860f1c6a8e9e32800497a9229a502bd3264cfc4.
  The complete CLI/MCP smoke chain passes, including the previously incomplete source-revision
  and workflow checks. Normal OS-specific Windows live-shim skips remain Mac test limits.
- SNAPSHOT_IDENTITY.json and SOURCE_APPLICABILITY.json: reproducible Git-exported current files,
  no new root commit. The closing index observation preserves existing staged additions as found;
  it does not claim the index stayed empty. Two pre-existing ignored local configuration files
  are preserved and excluded from this Git snapshot, not relabelled as tested release input.
- PAYLOAD_COMPARISON.json: all five shipped package/plugin payload inventories and loaded runtime
  identities remain identical to original candidate 8e2b8699. The three changed probe/tooling
  source files still change candidate source identity; strict candidate checks remain intact.
- RELATIONSHIP_CORRECTIONS.json: one subordinate PRD relation corrected to informed_by and two
  existing QA reports linked through the canonical QA_REPORT/tests/TP relation. All approval
  seals, current gates and listed artefacts stay unchanged. The aggregate Delivery Map has zero
  block/revise findings; thirteen pre-existing objective warnings remain visible.
- REVIEWED_MATRIX_VALIDATION.json: canonical validate --all-hosts passes ten cases in a temporary
  input tree containing unchanged copies of actual records/references and exact locked reviews.
  Validation uses the clean original candidate checkout and the separate corrected tool. It
  performs no repository import, projection write or native scenario execution.
- Current CODE_REVIEW.md and CLEAN_IMPLEMENTATION_REVIEW.md pass the actual scope. These are
  cooperative agent reviews, not independent human review. TP_REVIEW.md preserves remaining gaps.
  The coupled targeted release suite passes 34/34, including authority/hash/scope negatives.
- Deterministic compatibility evidence: 56 scenarios, zero unexpected failures; fixtures are not
  native-host qualification. Earlier failed/interrupted logs remain historical evidence in
  QA_RECHECK_20261024; the complete final local result above supersedes their current test status.
- Original candidate: 8e2b86992e009f5a597fdd45075c7e43f054b836f584fc68fc891c73f32bb692;
  clean original source commit: 460027fabc58fe0da041bbabe117519dd1f696b7.
- Original-head remote CI only: AGDF Guardrails 40079920556 succeeded for
  94ef61c9f0aa5a2041269236affc6556c33ed5a3. It is not remote CI for the uncommitted correction:
  https://github.com/ArndtGold/ai-native-governance-delivery-framework/actions/runs/40079920556.
- Codex frozen tuple: CLI 0.163.0, gpt-6-luna, darwin/x64, Node v22.22.3; observed macOS 15.7.7.
  Tuple digest: 8299345338bf8687140d55d13cdc8242137cb7da0fbfeaeee4e3f57cda18e347.
- Original bundle: /Users/arndtgold/codex-cli-bundle-8e2b8699.tar.gz, SHA-256
  2d9798679652f8bf80acd529496e4b0f09fdb35cb3b73ca1382c82f89241ea36.
  Fresh immutability checks cover the protected original Codex and imported Claude files.

- Evidence manifest: QA_FINISH_20261024/EVIDENCE_MANIFEST.json, SHA-256 46c47609beb6624ae2a580cfd3978cb32188e82db4e0b8cb79f6ee0ad51a2d85.

## 4. Missing Evidence

- qualification_limits: The specified Windows Codex review/import and final combined repository-import projection remain absent; the maintainer explicitly accepts the Windows gap. The current source correction has a complete passing local snapshot, but no new authorized final commit/candidate, commit-bound CI or native qualification for its changed source identity. Original records qualify only candidate 8e2b8699. No new production or cross-host qualification is inferred.

The approved TP requires a new clean final commit/candidate and native records after probe/source
changes enter the release. The current no-commit/no-push instruction remains in force. This report
proposes bounded acceptance for internal review/handoff, not publication or relabelled native proof.

## 5. Risks

- delivery_risks: Treating a passing local snapshot or accepted Windows gap as qualification of changed release source would lose exact-candidate provenance. The final imported repository matrix is not present. Original archive scan found 20 absolute /Users/ path occurrences in 16 files and no token-like secrets, email addresses, auth.json, config directories or work-tmp entries; its bytes remain unchanged and no native work-tmp remains. Dependency audit warnings remain visible in logs; broad dependency remediation or general security certification is not claimed.

The original CLI harness accepts hook_review_required as its recorded installation outcome. This supplies no separate native hook qualification.

## Maintainer Disposition: Windows Evidence Gap

The direct statement "Windows al s Lücke akzeptieren" is registered in
QA_RECHECK_20261024/WINDOWS_GAP_MAINTAINER_DISPOSITION.json. It accepts the specified Windows
review/import as a residual evidence limitation. It does not claim that execution happened and
has not been reused as approval of this new complete QA presentation. The original records,
archive, private profiles and credentials remain untouched. The prepared Windows return package
remains available if a later actual import/qualification claim requires it.

## 6. Required Next Step

Present the complete bounded QA deviation proposal for one deliberate maintainer decision on
this exact version. Only a current explicit QA acceptance may advance to UAT; the technical
result remains revise and every remaining finding accompanies UAT/OR. No commit, push, merge,
tag, import or publication is performed or granted by preparing this report.

## Normalized Findings

Current TP-owner fields are repeated unchanged. No finding is resolved by deviation acceptance.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-101 | evidence_gap | evidence_obligation | resolved | Five original candidate-bound Claude CLI records and exact review already imported under 8e2b8699/claude/cli | Preserve that imported candidate-bound proof |
| TPR-102 | evidence_gap | evidence_obligation | open | Five original Codex cases and the full read-only reviewed matrix pass; specified Windows review/import remains unexecuted and is explicitly accepted as a residual gap | Retain the unchanged return package and execute the documented Windows review/import before claiming that execution |
| TPR-103 | implementation_gap | CD+Tests | resolved | Recorded af660509 repair and original reviewed evidence, retained in BEFORE_TP_REVIEW.md | Preserve the recorded fix and its exact evidence |
| TPR-104 | evidence_gap | evidence_obligation | resolved | Guardrails 40079920556 success for exact PR head 94ef61c9 | Preserve the original-head CI link without extending it to uncommitted source |
| TPR-105 | evidence_gap | evidence_obligation | open | The changed source passes the complete 27-stage isolated snapshot verification, but no new final commit/candidate or native qualification exists for that changed identity | Establish the expressly authorized clean final commit/candidate and its required CI/native evidence before releasing the changed source |
| TPR-106 | evidence_gap | evidence_obligation | open | Full reviewed ten-case read-only validation passes and readiness is current, but the final combined repository-import projection remains absent | Refresh the existing projection after an actual authorized import if the later qualification claim requires it |
| TPR-107 | evidence_gap | evidence_obligation | resolved | All 27 shared verification stages pass in the exact isolated snapshot; reviewed relationship corrections clear aggregate blockers; complete CLI/MCP smoke passes | Preserve the full verification log, source identity and unchanged-source guards |
| QA-101 | evidence_gap | evidence_obligation | resolved | Current registered Code/Clean reviews pass the actual correction, metadata and derived outputs | Preserve those scoped reviews and their exact applicability limits |

## QA Deviation Acceptance

```json
{
  "schema_version": "1",
  "reviewer": "Codex, kooperative QA-Prüfung; bewusste Freigabe beim Maintainer",
  "usage_scope": "Interne Prüfung und Übergabe des Originalkandidaten 8e2b8699 und des separat lokal geprüften Import-Fixes. Keine Veröffentlichung, keine Qualifikation geänderter Quellen und kein automatischer Git-Commit, Push oder Import.",
  "deviations": [
    {
      "finding_id": "TPR-102",
      "severity": "medium",
      "risk": "Der vorgesehene Windows-Review/Import der Codex-Mac-Nachweise wurde nicht ausgeführt; diese Restlücke hat der Maintainer bereits ausdrücklich akzeptiert.",
      "consequence": "Die zehn Originalfälle bestehen die vollständige lesende Matrixprüfung, aber eine ausgeführte Windows-Importstrecke ist damit nicht nachgewiesen.",
      "follow_up": "Das unveränderte Übergabepaket aufbewahren; vor einem entsprechenden Windows-Importnachweis den dokumentierten Ablauf tatsächlich ausführen.",
      "owner": "Arndt Gold, Maintainer"
    },
    {
      "finding_id": "TPR-105",
      "severity": "medium",
      "risk": "Der korrigierte Quellstand hat einen exakt erfassten lokalen Prüfsnapshot, aber keinen neuen freigegebenen Commit, finalen Release-Kandidaten und dazugehörige native Qualifikation.",
      "consequence": "Die Akzeptanz gilt nur für interne Prüfung und Übergabe. Die alten nativen Datensätze qualifizieren weiterhin ausschließlich Kandidat 8e2b8699.",
      "follow_up": "Vor Veröffentlichung der geänderten Quellen den ausdrücklich autorisierten VCS-Schritt, einen sauberen finalen Kandidaten sowie dessen erforderliche CI- und native Nachweise herstellen.",
      "owner": "Arndt Gold, Maintainer; bestehender Release-Verifikationsowner"
    },
    {
      "finding_id": "TPR-106",
      "severity": "medium",
      "risk": "Die endgültige Projektion einer gemeinsam importierten nativen Matrix fehlt; die vorhandene Projektion zeigt weiterhin nur tatsächlich importierte Nachweise.",
      "consequence": "Lesende Zehn-Fall-Validierung und vollständiger Repository-Import bleiben getrennte Aussagen. Es wird kein zusätzlicher qualifizierter Hoststatus behauptet.",
      "follow_up": "Falls die spätere Veröffentlichung diese importierte Matrix benötigt, den dokumentierten Import abschließen und die bestehende Kompatibilitätsprojektion erneuern.",
      "owner": "Arndt Gold, Maintainer; bestehender Kompatibilitätsowner"
    }
  ]
}
```

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing producer, validator, traceability writer and reporting owners are retained; exact source/native facts remain Run-specific.
- memory_target: scope_artifact
- memory_reason: Candidate-specific qualification and remaining obligations belong to this Run.
- memory_refs: QA_REPORT.md; evidence/QA_FINISH_20261024/FINAL_VERIFICATION.md

## 7. Gate Approval

The bounded deviation proposal is prepared, not accepted. No deliberate QA/UAT/OR approval is
inferred from "Leg los" or the earlier Windows-only disposition. The exact current presentation
must expose scope, each risk, consequence, follow-up and owner before any human QA acceptance.

## AGDF Approval Summary (de; source=en)

- Ziel: AGDF 0.20.0 anhand exakter CLI-Kandidaten- und Umgebungsnachweise prüfen und verbleibende Grenzen offenlegen.
- Ergebnis: Alle 27 lokalen Prüfstufen und die vollständige lesende Matrixprüfung mit zehn Originalfällen bestehen; Import- und Traceability-Fehler sind korrigiert.
- Grenzen: Der Windows-Review/Import und die endgültige Importprojektion fehlen. Die geänderten Probe-Quellen haben noch keinen neuen freigegebenen finalen Commit/Kandidaten mit zugehöriger CI und nativen Nachweisen.
- Risiken: Die vorgeschlagene Akzeptanz gilt nur für interne Prüfung und Übergabe. Sie qualifiziert keine geänderten Quellen und erlaubt keine Veröffentlichung oder automatischen VCS-/Importaktionen.
