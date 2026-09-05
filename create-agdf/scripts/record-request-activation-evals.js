#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { persistRequestActivationBehavioralReport, runRequestActivationBehavioralEvaluation } from "../lib/request-activation-evals/behavioral.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const allowedOptions = new Set(["--input-mode", "--profile-surface", "--evaluator-surface", "--surface", "--model", "--case", "--output"]);
const option = (name) => {
  const indexes = process.argv.flatMap((value, index) => value === name ? [index] : []);
  if (indexes.length > 1) throw new Error(`${name} may be provided only once`);
  if (indexes.length === 0) return undefined;
  const value = process.argv[indexes[0] + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value`);
  return value;
};

try {
  for (const value of process.argv.slice(2)) {
    if (value.startsWith("--") && !allowedOptions.has(value)) throw new Error(`unknown option ${value}`);
  }
  const legacySurface = option("--surface");
  const explicitEvaluatorSurface = option("--evaluator-surface");
  if (legacySurface && explicitEvaluatorSurface) throw new Error("--surface is an evaluator-only alias and cannot be combined with --evaluator-surface");
  const report = await runRequestActivationBehavioralEvaluation({
    repoRoot,
    inputMode: option("--input-mode") || "canonical_contract",
    profileSurface: option("--profile-surface"),
    ...(legacySurface
      ? { surface: legacySurface }
      : { evaluatorSurface: explicitEvaluatorSurface || process.env.AGDF_EVAL_SURFACE || "codex" }),
    model: option("--model"),
    caseId: option("--case"),
  });
  const outputPath = option("--output")
    ? resolve(option("--output"))
    : report.input_mode === "composed_profile"
      ? join(repoRoot, "evals", "request-activation", "observations", "source-composed", `${report.profile_surface}-via-${report.evaluator_surface}`, "latest.json")
      : join(repoRoot, "evals", "request-activation", "observations", "behavioral", report.evaluator_surface, "latest.json");
  persistRequestActivationBehavioralReport(outputPath, report);
  process.stdout.write(`${JSON.stringify({
    status: report.status,
    evidence_kind: report.evidence_kind,
    evidence_plane: report.evidence_plane,
    profile_surface: report.profile_surface,
    evaluator_surface: report.evaluator_surface,
    output_path: outputPath,
    cases: report.cases,
  }, null, 2)}\n`);
  if (report.status !== "pass") process.exitCode = 1;
} catch (error) {
  console.error(`Request Activation behavioral evidence recording failed: ${error.message}`);
  process.exitCode = 1;
}
