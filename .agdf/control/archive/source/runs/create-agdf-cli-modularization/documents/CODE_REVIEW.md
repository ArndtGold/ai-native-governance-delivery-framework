# Code Review: create-agdf CLI Modularization

Decision: pass
Date: 2026-07-16
Reviewed scope: CLI composition root, registry/parser/application, installers, scaffold,
control evaluation, package test wiring and Runtime Integrity ownership check.

## Findings

No open correctness, security, compatibility or maintainability finding remains.

Two review findings were corrected before this report:

1. `cli/application.js` originally treated every unhandled registered command as a scaffold
   command. It now registers all six scaffold commands explicitly and fails closed for a
   registry entry without an implementation.
2. `cli/parse-args.js` originally injected language preference resolution but referenced the
   language normalizer directly. Both language operations are now injectable and the parser
   remains output/process-mutation free.
3. A post-QA documentation audit found stale ownership and incomplete command/language copy.
   The canonical template now points to `control-evaluation/shared.js`; package guides cover
   lifecycle commands and BCP 47; a regression assertion prevents the old bin reference.

## Evidence

- `cli-modularization-test.js` verifies all registry handlers are explicit, application
  exits/channels, installer subprocess order, ownership uniqueness and import acyclicity.
- All new modules pass syntax and module-load checks.
- Aggregate package smoke, release bootstrap, Runtime Integrity and packed-module inventory pass.
- Focused live doctor reports `pass`; gate-check remains open at QA for the selected run.

## Missing Evidence And Risks

- missing_evidence: Native Windows installer execution was not available; its existing command
  construction remains unchanged and is outside the approved product-change scope.
- risks: Repository-wide `delivery-map --all-active` remains blocked by three unrelated active
  runs with invalid revision IDs; the selected modularization run passes.
- required_next_step: Run `qa-gate` using TP Review, Clean Review, Code Review and test evidence.
