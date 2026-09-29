import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { validateCopilotPayload } from "../lib/public-plugin/copilot-profile.js";

export function budgetReport(inventory, baseline) {
  const components = Object.create(null);
  for (const entry of inventory.entries) {
    const row = components[entry.component] ??= { files: 0, bytes: 0 };
    row.files += 1; row.bytes += entry.bytes;
  }
  return { profile: inventory.profile_id, observed: inventory.stats,
    limits: { files: baseline.max_files, bytes: baseline.max_bytes },
    headroom: { files: baseline.max_files - inventory.stats.files, bytes: baseline.max_bytes - inventory.stats.bytes },
    components, largest: [...inventory.entries].sort((a, b) => b.bytes - a.bytes).slice(0, 8)
      .map(({ destination, bytes }) => ({ destination, bytes })) };
}

export function reviewedBudget(stats, { files, bytes, reason }) {
  if (![files, bytes].every(value => Number.isSafeInteger(value) && value >= 0)
      || files < stats.files || bytes < stats.bytes || typeof reason !== "string" || reason.trim().length < 12) {
    throw new Error("AGDF_PAYLOAD_BUDGET_REVIEW_REQUIRED: supply --files, --bytes and a meaningful --reason; limits must cover the verified inventory");
  }
  return { schema_version: 1, profile_id: "copilot-runtime-plugin", max_files: files, max_bytes: bytes, rationale: reason.trim() };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    if (key === "--accept") { options.accept = true; continue; }
    if (!["--files", "--bytes", "--reason"].includes(key) || args[i + 1] === undefined) throw new Error("AGDF_PAYLOAD_BUDGET_ARGUMENT_INVALID");
    options[key.slice(2)] = key === "--reason" ? args[++i] : Number(args[++i]);
  }
  const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
  const path = resolve(repoRoot, "plugin/meta/copilot-payload-baseline.json");
  const baseline = JSON.parse(readFileSync(path, "utf8"));
  const definition = JSON.parse(readFileSync(resolve(repoRoot, "plugin/meta/agdf-plugin.definition.json"), "utf8"));
  // Only the size ceiling is suspended for reporting. Digest, source, inventory, profile and version
  // checks remain mandatory. Normal builds never pass checkBudget:false.
  const { inventory, stats } = validateCopilotPayload({ repoRoot,
    profileRoot: resolve(repoRoot, "create-agdf/generated/plugins/copilot/agdf"),
    expectedVersion: definition.version, expectedSkills: definition.skillSet.map(row => row.slug), baseline, checkBudget: false });
  console.log(JSON.stringify(budgetReport(inventory, baseline), null, 2));
  if (options.accept) {
    writeFileSync(path, `${JSON.stringify(reviewedBudget(stats, options), null, 2)}\n`);
    console.log("Reviewed budget saved. Run sync-package-assets again to bind the inventory to the new limits.");
  }
}
