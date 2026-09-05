import { sessionCommand as codexSessionCommand } from "../host-adapters/codex/session-command.js";
import { sessionCommand as claudeSessionCommand } from "../host-adapters/claude/session-command.js";
import { sessionCommand as copilotSessionCommand } from "../host-adapters/copilot/session-command.js";
import { sessionCommand as openCodeSessionCommand } from "../host-adapters/opencode/session-command.js";
import { createHash } from "node:crypto";

const OPERATIONS = Object.freeze([
  "resolve-local-runtime",
  "inspect-control-state",
  "render-bounded-orientation",
]);

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

export function validateRuntimeCheckCapability(capability) {
  if (capability?.schemaVersion !== 1 || capability.capabilityId !== "automatic-runtime-checks") {
    throw new Error("AGDF_RUNTIME_CHECK_CAPABILITY_INVALID: schema or capability id");
  }
  if (!Number.isInteger(capability.adapterContractVersion) || capability.adapterContractVersion < 1) {
    throw new Error("AGDF_RUNTIME_CHECK_CAPABILITY_INVALID: adapter contract version");
  }
  if (capability.entrypoint !== "runtime/agdf-session-check.js") {
    throw new Error("AGDF_RUNTIME_CHECK_CAPABILITY_INVALID: fixed entrypoint required");
  }
  if (JSON.stringify(capability.operations) !== JSON.stringify(OPERATIONS)) {
    throw new Error("AGDF_RUNTIME_CHECK_CAPABILITY_INVALID: closed operation vocabulary required");
  }
  const constraints = capability.constraints ?? {};
  if (constraints.arguments !== "forbidden" || constraints.filesystemWrites !== "forbidden"
      || constraints.network !== "forbidden" || constraints.gateAuthority !== "none") {
    throw new Error("AGDF_RUNTIME_CHECK_CAPABILITY_INVALID: read-only constraints required");
  }
  const surfaces = capability.surfaces ?? {};
  if (surfaces.codex !== "native-hook-review" || surfaces.claude !== "exact-command-rule"
      || surfaces.copilot !== "plugin-hook-review"
      || surfaces.opencode !== "plugin-internal"
      || surfaces["portable-skills"] !== "manual-external-required") {
    throw new Error("AGDF_RUNTIME_CHECK_CAPABILITY_INVALID: surface contract");
  }
  return capability;
}

export function runtimeCheckCapabilityIdentity({ capability, surface, runtimeDigest, sourceDigest, command }) {
  validateRuntimeCheckCapability(capability);
  if (!["codex", "claude", "copilot", "opencode"].includes(surface)) throw new Error("AGDF_RUNTIME_CHECK_SURFACE_INVALID");
  for (const [name, value] of Object.entries({ runtimeDigest, sourceDigest })) {
    if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value)) throw new Error(`AGDF_RUNTIME_CHECK_IDENTITY_INVALID: ${name}`);
  }
  if (typeof command !== "string" || !command.trim()) throw new Error("AGDF_RUNTIME_CHECK_IDENTITY_INVALID: command");
  const payload = stable({
    schema_version: 1,
    surface,
    capability,
    runtime_digest: runtimeDigest,
    source_digest: sourceDigest,
    command: command.trim(),
  });
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function fixedRuntimeCheckCommand(surface, pluginRoot, platform = process.platform) {
  if (surface === "opencode") return openCodeSessionCommand(pluginRoot, platform);
  if (surface === "copilot") return copilotSessionCommand(pluginRoot, platform);
  if (surface === "codex") return codexSessionCommand(pluginRoot, platform);
  if (surface === "claude") return claudeSessionCommand(pluginRoot, platform);
  const normalizedRoot = platform === "win32" ? pluginRoot.replaceAll("/", "\\") : pluginRoot;
  return `node \"${normalizedRoot}${platform === "win32" ? "\\" : "/"}runtime${platform === "win32" ? "\\" : "/"}agdf-session-check.js\"`;
}

export const runtimeCheckOperations = OPERATIONS;
