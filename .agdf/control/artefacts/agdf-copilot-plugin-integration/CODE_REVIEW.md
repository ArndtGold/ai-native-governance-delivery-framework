# Code Review: Copilot-Specific AGDF Payload

- decision: pass
- revision: 3
- date: 2026-08-30
- findings: none open
- reviewed_scope: Copilot profile builder and inventory; runtime/provenance profile detection; isolated marketplace creation; legacy registration migration and recovery; same-version cache refresh; public and local installer routing; package, conformance, lifecycle and documentation changes.
- resolved_findings: Real-host verification exposed two implementation defects before review completion: the prior AGDF-owned shared registration was initially classified as foreign, and the isolated Marketplace used the wrong descriptor location. Both were corrected with exact ownership validation, rollback tests and GitHub's documented `.github/plugin/marketplace.json` layout. Installed-root evidence was also separated from host-loaded-session evidence.
- evidence: Actual diff and adjacent-owner inspection; negative payload and provenance fixtures; migration failure recovery; two installation orderings; full smoke; package contents; Runtime Integrity; Pages tests; direct `agdf@agdf` 0.14.1 read-back; installed local-validator result; `git diff --check`.
- missing_evidence: A restarted Copilot app session was not observed after the final refresh. This limits loaded-session claims but is not a code defect.
- risks: Future Copilot CLI manifest or output changes may require adapter maintenance. Parsing and ownership checks fail closed on unknown or foreign state.
- required_next_step: run QA Gate and persist the revision 3 decision.
