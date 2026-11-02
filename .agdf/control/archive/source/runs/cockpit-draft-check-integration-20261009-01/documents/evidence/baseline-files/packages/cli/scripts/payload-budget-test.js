import assert from "node:assert/strict";
import { budgetReport, reviewedBudget } from "../../../scripts/payload-budget.js";
const stats = { files: 2, bytes: 10 };
for (const options of [{}, { files: 2, bytes: 9, reason: "Reviewed runtime change" },
  { files: 2, bytes: Infinity, reason: "Reviewed runtime change" }, { files: 2, bytes: 10, reason: "short" }]) {
  assert.throws(() => reviewedBudget(stats, options), /REVIEW_REQUIRED/);
}
const budget = reviewedBudget(stats, { files: 2, bytes: 10, reason: "Reviewed runtime change" });
const report = budgetReport({ stats, entries: [{ component: "runtime", bytes: 6 }, { component: "runtime", bytes: 4 }] }, budget);
assert.deepEqual(report.headroom, { files: 0, bytes: 0 });
assert.deepEqual(report.components.runtime, stats);
assert.equal(report.largest[0].bytes, 6);
console.log("Payload budget review/report tests passed.");
