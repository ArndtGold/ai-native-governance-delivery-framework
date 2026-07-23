import { execFileSync, spawnSync } from "node:child_process";
import process from "node:process";
import { validateEvaluation } from "../contracts.js";
import { guardedExecFileSync } from "../transports/read-only-guard.js";
import { buildEvaluatorPrompt } from "./prompt.js";

export const OPENCODE_EVALUATOR_AGENT = "agdf-evaluator";

export const OPENCODE_DENY_PERMISSIONS = Object.freeze({
  "*": "deny",
  read: "deny",
  edit: "deny",
  bash: "deny",
  task: "deny",
  webfetch: "deny",
  websearch: "deny",
  skill: "deny",
  lsp: "deny",
  todowrite: "deny",
  question: "deny",
  external_directory: "deny",
});

const executablePermissions = Object.freeze([
  "edit", "bash", "task", "webfetch", "websearch", "skill", "lsp", "todowrite", "question",
]);

export function openCodePermissionEnvironment(env = process.env) {
  return {
    ...env,
    OPENCODE_PERMISSION: JSON.stringify(OPENCODE_DENY_PERMISSIONS),
  };
}

function preflightFailure(code, detail, evidence = []) {
  return {
    surface: "opencode",
    status: "failed",
    code,
    detail,
    evidence,
  };
}

function extractAgentPermissions(output, agentName) {
  const marker = `${agentName} (`;
  const lines = output.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith(marker));
  if (start < 0) return null;
  const mode = lines[start].slice(marker.length).split(")")[0];
  let jsonStart = -1;
  let depth = 0;
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (jsonStart < 0 && line === "[") {
      jsonStart = index;
      depth = 1;
      continue;
    }
    if (jsonStart >= 0) {
      for (const character of line) {
        if (character === "[") depth += 1;
        if (character === "]") depth -= 1;
      }
      if (depth === 0) return { mode, permissions: JSON.parse(lines.slice(jsonStart, index + 1).join("\n")) };
    }
  }
  return null;
}

function terminalPermissionDecision(permissions, permissionName) {
  let decision = null;
  for (const entry of permissions) {
    if (entry?.pattern === "*" && (entry.permission === "*" || entry.permission === permissionName)) {
      decision = entry.action;
    }
  }
  return decision;
}

export function preflightOpenCodeEvaluator(options = {}) {
  const executable = options.openCodeBin ?? process.env.AGDF_OPENCODE_BIN ?? "opencode";
  const run = options.execFileSync ?? execFileSync;
  const cwd = options.cwd ?? process.cwd();
  const agentName = options.agentName ?? OPENCODE_EVALUATOR_AGENT;
  const env = openCodePermissionEnvironment(options.env ?? process.env);
  let runtime;
  let help;
  let agents;
  try {
    runtime = run(executable, ["--version"], {
      cwd, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 5000,
    }).trim();
  } catch (error) {
    return preflightFailure("opencode_host_unavailable", (error.stderr || error.message).toString().trim());
  }
  try {
    if (options.execFileSync) {
      help = run(executable, ["run", "--help"], {
        cwd, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 5000,
      });
    } else {
      const helpProbe = (options.spawnSync ?? spawnSync)(executable, ["run", "--help"], {
        cwd, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 5000,
      });
      if (helpProbe.error || helpProbe.status !== 0) throw helpProbe.error ?? new Error(helpProbe.stderr || "OpenCode run help failed.");
      help = `${helpProbe.stdout ?? ""}\n${helpProbe.stderr ?? ""}`;
    }
  } catch (error) {
    return preflightFailure("opencode_run_unavailable", (error.stderr || error.message).toString().trim(), [`opencode ${runtime}`]);
  }
  const requiredFlags = ["--pure", "--agent", "--format", "--dir"];
  const missingFlags = requiredFlags.filter((flag) => !help.includes(flag));
  if (missingFlags.length) {
    return preflightFailure("opencode_run_capability_missing", `Missing required flags: ${missingFlags.join(", ")}`, [`opencode ${runtime}`]);
  }
  try {
    agents = run(executable, ["agent", "list", "--pure"], {
      cwd, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 10000,
    });
  } catch (error) {
    return preflightFailure("opencode_agent_probe_failed", (error.stderr || error.message).toString().trim(), [`opencode ${runtime}`]);
  }
  let projection;
  try {
    projection = extractAgentPermissions(agents, agentName);
  } catch (error) {
    return preflightFailure("opencode_agent_permissions_unparseable", error.message, [`opencode ${runtime}`]);
  }
  if (!projection) {
    return preflightFailure("opencode_evaluator_agent_missing", `OpenCode agent ${agentName} is not available.`, [`opencode ${runtime}`]);
  }
  if (projection.mode !== "primary") {
    return preflightFailure("opencode_evaluator_agent_incompatible", `OpenCode agent ${agentName} must be primary for opencode run --agent; observed ${projection.mode || "unknown"}.`, [
      `opencode ${runtime}`,
      `agent:${agentName}`,
    ]);
  }
  const unsafe = executablePermissions.filter((permission) => terminalPermissionDecision(projection.permissions, permission) !== "deny");
  if (unsafe.length) {
    return preflightFailure("opencode_evaluator_permissions_unsafe", `Terminal deny is not effective for: ${unsafe.join(", ")}`, [
      `opencode ${runtime}`,
      `agent:${agentName}`,
    ]);
  }
  return {
    surface: "opencode",
    status: "passed",
    code: "opencode_evaluator_ready",
    invocation_id: `${process.pid}-${Date.now()}`,
    runtime,
    agent: agentName,
    evidence: [
      `opencode ${runtime}`,
      "opencode run --pure --agent agdf-evaluator --format json",
      "effective executable permissions terminal-deny",
    ],
    env,
  };
}

export function parseOpenCodeEvaluatorOutput(raw) {
  const text = [];
  for (const line of raw.split(/\r?\n/).filter(Boolean)) {
    const event = JSON.parse(line);
    if (event?.type === "error") {
      const status = event.error?.data?.statusCode;
      const detail = event.error?.data?.message || event.error?.message || "unknown OpenCode evaluator error";
      const error = new Error(`OpenCode evaluator error${status ? ` (${status})` : ""}: ${detail}`);
      error.code = status === 401 || /auth|credential|provider available/i.test(detail)
        ? "OPENCODE_EVALUATOR_AUTHENTICATION_FAILED"
        : "OPENCODE_EVALUATOR_UNAVAILABLE";
      throw error;
    }
    if (event?.part?.type === "text" && typeof event.part.text === "string") text.push(event.part.text);
    else if (event?.type === "text" && typeof event.text === "string") text.push(event.text);
  }
  if (!text.length) throw new Error("OpenCode evaluator returned no text event.");
  if (text.length !== 1) throw new Error(`OpenCode evaluator returned ${text.length} text events; exactly one final payload is required.`);
  return JSON.parse(text[0]);
}

function fatalEvaluatorError(error) {
  const wrapped = new Error(error.message);
  wrapped.code = typeof error.code === "string" && error.code.startsWith("OPENCODE_EVALUATOR_")
    ? error.code
    : error.code === "GENERATOR_MUTATION_DETECTED"
    ? "OPENCODE_EVALUATOR_MUTATION_DETECTED"
    : error.code === "GENERATOR_TIMEOUT"
      ? "OPENCODE_EVALUATOR_TIMEOUT"
      : error.code === "ENOENT"
        ? "OPENCODE_EVALUATOR_UNAVAILABLE"
        : /auth|unauthorized|credential/i.test(`${error.message}\n${error.stderr ?? ""}`)
          ? "OPENCODE_EVALUATOR_AUTHENTICATION_FAILED"
          : "OPENCODE_EVALUATOR_OUTPUT_INVALID";
  wrapped.fatalEvaluator = true;
  return wrapped;
}

export function openCodeEvaluator(options = {}) {
  if (options.preflight?.status !== "passed" || options.preflight.surface !== "opencode") {
    throw new Error("OpenCode evaluator requires a successful current-invocation preflight.");
  }
  const executable = options.openCodeBin ?? process.env.AGDF_OPENCODE_BIN ?? "opencode";
  const agentName = options.preflight.agent ?? OPENCODE_EVALUATOR_AGENT;
  return {
    name: "opencode",
    metadata: {
      name: "opencode",
      runtime: options.preflight.runtime,
      agent: agentName,
      preflight: options.preflight.code,
    },
    async evaluate(input, candidate) {
      const args = [
        "run", "--pure", "--agent", agentName, "--format", "json", "--dir", options.cwd,
      ];
      if (options.model) args.push("--model", options.model);
      args.push(buildEvaluatorPrompt(input, candidate));
      try {
        const raw = guardedExecFileSync(executable, args, {
          cwd: options.cwd,
          env: options.preflight.env,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
          timeout: options.timeoutMs ?? 120000,
        });
        return validateEvaluation(parseOpenCodeEvaluatorOutput(raw), candidate.id);
      } catch (error) {
        throw fatalEvaluatorError(error);
      }
    },
  };
}
