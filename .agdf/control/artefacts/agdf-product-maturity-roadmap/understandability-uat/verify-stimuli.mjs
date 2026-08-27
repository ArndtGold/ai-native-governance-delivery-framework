import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = join(packageDir, "../../../../..");
const manifest = JSON.parse(readFileSync(join(packageDir, "STIMULUS_MANIFEST.json"), "utf8"));
const failures = [];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

if (manifest.schema_version !== 1) failures.push("manifest schema version must be 1");
if (manifest.status !== "frozen_not_exposed") failures.push("manifest is no longer in the pre-exposure frozen state");
if (manifest.stimulus_count !== 8 || manifest.stimuli?.length !== 8) failures.push("exactly eight stimuli are required");

for (const source of manifest.source_owners ?? []) {
  const path = join(repositoryRoot, source.file);
  if (!existsSync(path)) failures.push(`missing source owner: ${source.file}`);
  else if (sha256(readFileSync(path)) !== source.sha256) failures.push(`source owner drift: ${source.file}`);
}

for (const stimulus of manifest.stimuli ?? []) {
  const path = join(packageDir, stimulus.file);
  if (!existsSync(path)) {
    failures.push(`missing stimulus: ${stimulus.scenario_id}`);
    continue;
  }
  const content = readFileSync(path);
  if (sha256(content) !== stimulus.sha256) failures.push(`stimulus digest mismatch: ${stimulus.scenario_id}`);
  const text = content.toString("utf8");
  for (const forbidden of ["critical_misunderstanding", "incorrect | unclear", "Scoring Key", "kritisches Missverständnis"]) {
    if (text.includes(forbidden)) failures.push(`answer leakage in ${stimulus.scenario_id}: ${forbidden}`);
  }
}

const assignments = manifest.randomization?.assignments ?? [];
const assigned = assignments.flatMap((entry) => entry.scenario_ids ?? []);
if (assignments.length !== 4 || assignments.some((entry) => entry.scenario_ids?.length !== 2)) failures.push("four two-scenario participant assignments are required");
if (new Set(assigned).size !== 8 || assigned.length !== 8) failures.push("every scenario must be assigned exactly once");
for (const assignment of assignments) {
  for (const scenarioId of assignment.scenario_ids ?? []) {
    const record = join(packageDir, "records", `${assignment.participant_id}-${scenarioId}.md`);
    if (!existsSync(record)) failures.push(`missing observation form: ${assignment.participant_id}-${scenarioId}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`UAT stimulus package verified: ${manifest.freeze_id}; 8 stimuli; 4 blinded assignments; no source or stimulus drift.`);
