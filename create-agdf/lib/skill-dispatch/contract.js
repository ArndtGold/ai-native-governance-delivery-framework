import { isAbsolute } from "node:path";
import { RUN_ID_PATTERN } from "../control-state/run-identity.js";

export const SKILL_DISPATCH_SCHEMA_VERSION = "1";
export const SKILL_DISPATCH_CONTRACT_VERSION = 1;
export const SKILL_DISPATCH_MAX_OUTPUT_BYTES = 1024 * 1024;

const DISPATCH_MODES = new Set(["deterministic_control", "judgement_required"]);
const SURFACES = new Set(["codex", "claude", "copilot", "opencode"]);

export class SkillDispatchInputError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "SkillDispatchInputError";
    this.field = field;
  }
}

function requireText(value, field, maximum = 240) {
  if (typeof value !== "string" || !value.trim()) throw new SkillDispatchInputError(field, `${field} is required`);
  if (value.length > maximum || /[\r\n\0]/u.test(value)) throw new SkillDispatchInputError(field, `${field} is invalid`);
  return value;
}

export function buildSkillDispatchRegistry(skillSet) {
  if (!Array.isArray(skillSet) || skillSet.length === 0) throw new Error("AGDF skillSet must be a non-empty array");
  const entries = skillSet.map((skill) => {
    const skillId = requireText(skill?.slug, "skill_id");
    const dispatch = skill?.dispatch;
    if (!dispatch || !DISPATCH_MODES.has(dispatch.mode)) throw new Error(`AGDF skill ${skillId} has invalid dispatch metadata`);
    const deterministicCommand = dispatch.deterministicCommand ?? null;
    if (typeof dispatch.requiresControlSnapshot !== "boolean") throw new Error(`AGDF skill ${skillId} must declare requiresControlSnapshot`);
    if (dispatch.mode === "deterministic_control"
        && (skillId !== "gate-check" || deterministicCommand !== "gate-check")) {
      throw new Error(`AGDF deterministic skill ${skillId} must map to gate-check`);
    }
    if (dispatch.mode === "judgement_required" && deterministicCommand) throw new Error(`AGDF judgement skill ${skillId} must not declare deterministicCommand`);
    return [skillId, Object.freeze({
      skill_id: skillId,
      dispatch_mode: dispatch.mode,
      deterministic_command: deterministicCommand,
      requires_control_snapshot: dispatch.requiresControlSnapshot === true,
      contract_version: SKILL_DISPATCH_CONTRACT_VERSION,
    })];
  });
  const registry = new Map(entries);
  if (registry.size !== entries.length) throw new Error("AGDF skillSet contains duplicate slugs");
  return registry;
}

export function normalizeSkillDispatchInput(input, registry) {
  const skillId = requireText(input.skillId, "skill_id");
  const skill = registry.get(skillId);
  if (!skill) throw new SkillDispatchInputError("skill_id", `Unknown AGDF skill: ${skillId}`);
  const surface = requireText(input.surface, "surface");
  if (!SURFACES.has(surface)) throw new SkillDispatchInputError("surface", `Unsupported surface: ${surface}`);
  const presentationLanguage = requireText(input.presentationLanguage, "presentation_language", 64);
  const workingDirectory = requireText(input.workingDirectory, "working_directory", 4096);
  if (!isAbsolute(workingDirectory)) throw new SkillDispatchInputError("working_directory", "working_directory must be absolute");
  const targetSource = input.targetSource || null;
  const primaryTarget = input.primaryTarget || null;
  if (Boolean(targetSource) !== Boolean(primaryTarget)) throw new SkillDispatchInputError("primary_target", "target_source and primary_target must be supplied together");
  if (primaryTarget && (!isAbsolute(primaryTarget) || primaryTarget.length > 4096)) throw new SkillDispatchInputError("primary_target", "primary_target must be an absolute bounded path");
  if (targetSource && !["explicit_target", "continued_target", "current_repository"].includes(targetSource)) throw new SkillDispatchInputError("target_source", `Unsupported target_source: ${targetSource}`);
  const runId = input.runId || null;
  if (runId && !RUN_ID_PATTERN.test(runId)) throw new SkillDispatchInputError("run_id", "run_id is invalid");
  return Object.freeze({
    schema_version: SKILL_DISPATCH_SCHEMA_VERSION,
    skill_id: skillId,
    surface,
    presentation_language: presentationLanguage,
    working_directory: workingDirectory,
    target_source: targetSource,
    primary_target: primaryTarget,
    run_id: runId,
    expected_version: requireText(input.expectedVersion, "expected_version", 64),
    skill,
  });
}

export function emptySkillDispatchTiming() {
  return { wrapper_ms: 0, input_ms: 0, target_ms: 0, control_ms: 0, render_ms: 0, total_ms: 0 };
}

export function serializeSkillDispatchResult(result) {
  const output = JSON.stringify(result, null, 2);
  if (Buffer.byteLength(output, "utf8") <= SKILL_DISPATCH_MAX_OUTPUT_BYTES) return output;
  return JSON.stringify({
    schema_version: SKILL_DISPATCH_SCHEMA_VERSION,
    contract_version: SKILL_DISPATCH_CONTRACT_VERSION,
    outcome: "evaluator_error",
    terminal: true,
    authorizes: false,
    skill: result.skill ?? null,
    runtime: result.runtime ?? {},
    target: null,
    control: null,
    presentation: null,
    continuation: null,
    recovery: { action: "Repair the evaluator output bound and retry once." },
    host_action: {
      mode: "transmit_recovery_verbatim_and_stop",
      source: "recovery.action",
      text: "Repair the evaluator output bound and retry once.",
      allow_surrounding_text: false,
      may_request_run_or_evidence: false,
    },
    timing: result.timing ?? emptySkillDispatchTiming(),
    diagnostics: [{ code: "dispatch_output_too_large" }],
  }, null, 2);
}
