import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { evaluateOpenCodeRepositoryActivation } from "./lib/installers/opencode-activation.js";
import { executeOpenCodeAutomaticRuntimeCheck } from "./lib/runtime-check-consent/service.js";

const packageJson = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const requestActivationMarkers = Object.freeze({
  start: "<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->",
  end: "<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->",
});

function normalizeLf(content) {
  return content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function validateRequestActivationIdentity(identity) {
  if (identity?.owner !== "request_activation_contract"
      || identity?.path !== "plugin/meta/contracts/request-activation.md"
      || identity?.policy_version !== 1
      || !/^sha256:[0-9a-f]{64}$/.test(identity?.guard_fingerprint ?? "")) {
    throw new Error("AGDF Request Activation binding identity is invalid.");
  }
  return Object.freeze({ ...identity });
}

function contractFromRequestActivationContent(rawContent) {
  const content = normalizeLf(rawContent);
  const { start, end } = requestActivationMarkers;
  if (content.split(start).length !== 2 || content.split(end).length !== 2) {
    throw new Error("AGDF Request Activation Guard markers must occur exactly once.");
  }
  const startIndex = content.indexOf(start);
  const endIndex = content.indexOf(end, startIndex);
  if (endIndex < startIndex) throw new Error("AGDF Request Activation Guard markers are out of order.");
  const guard = content.slice(startIndex, endIndex + end.length);
  const readMetadata = (name, pattern) => {
    const matches = [...guard.matchAll(pattern)];
    if (matches.length !== 1) throw new Error(`AGDF Request Activation Guard ${name} must occur exactly once.`);
    return matches[0][1];
  };
  const identity = validateRequestActivationIdentity({
    owner: readMetadata("owner", /- `owner`: `([^`]+)`/g),
    path: readMetadata("path", /- `path`: `([^`]+)`/g),
    policy_version: Number(readMetadata("policy_version", /- `policy_version`: `(\d+)`/g)),
    guard_fingerprint: readMetadata("guard_fingerprint", /- `guard_fingerprint`: `(sha256:[0-9a-f]{64})`/g),
  });
  const fingerprintInput = guard.replace(
    /- `guard_fingerprint`: `sha256:[0-9a-f]{64}`/,
    "- `guard_fingerprint`: `sha256:<computed>`",
  );
  const computed = `sha256:${createHash("sha256").update(fingerprintInput).digest("hex")}`;
  if (identity.guard_fingerprint !== computed) {
    throw new Error(`AGDF Request Activation Guard fingerprint mismatch: declared ${identity.guard_fingerprint}, computed ${computed}.`);
  }
  return Object.freeze({ identity, kernel: guard });
}

function readRequestActivationContract() {
  const candidates = [
    new URL("./generated/.opencode/contracts/request-activation.md", import.meta.url),
    new URL("../plugin/meta/contracts/request-activation.md", import.meta.url),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return contractFromRequestActivationContent(readFileSync(candidate, "utf8"));
  }
  throw new Error("AGDF Request Activation Contract is unavailable from the installed package.");
}

const readValidatorExpectedVersion = () => {
  try {
    const validatorPath = new URL("../../agdf/bin/agdf-local.js", import.meta.url);
    if (!existsSync(validatorPath)) return null;
    const content = readFileSync(validatorPath, "utf8");
    const match = content.match(/expectedVersion["']?\s*[:=]\s*["']([^"']+)["']/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

export const AGDFPlugin = async ({ directory, client }, dependencies = {}) => {
  const controlDir = `${directory}/.agdf/control`;
  const activation = () => evaluateOpenCodeRepositoryActivation(directory);
  const status = () => {
    const repositoryActivation = activation();
    return {
    active: repositoryActivation.active,
    version: packageJson.version,
    controlDir,
    repositoryActivation: repositoryActivation.state,
    repositorySurface: repositoryActivation.legacy_surface,
    };
  };
  const validatorPath = fileURLToPath(new URL("../../agdf/bin/agdf-local.js", import.meta.url));
  const activationContract = readRequestActivationContract();
  const activationIdentity = validateRequestActivationIdentity(
    dependencies.requestActivationIdentity ?? activationContract.identity,
  );
  if (Object.entries(activationContract.identity).some(([key, value]) => activationIdentity[key] !== value)) {
    throw new Error("AGDF Request Activation dependency identity does not match the installed kernel.");
  }
  const activeContext = [
    `AGDF dispatcher binding: ${JSON.stringify({
      schema_version: "1",
      executable: process.execPath,
      argv_prefix: [validatorPath, "skill-dispatch", "--json", "--surface", "opencode"],
      expected_version: packageJson.version,
      request_activation: {
        owner: activationIdentity.owner,
        policy_version: activationIdentity.policy_version,
        guard_fingerprint: activationIdentity.guard_fingerprint,
      },
      authorizes: false,
    })}`,
    `AGDF runtime facts: ${JSON.stringify({ active: true, version: packageJson.version })}`,
  ].join("\n");

  const appendContentOnce = async (output, key, content) => {
    if (!content) return;
    if (!output || !Array.isArray(output[key])) {
      try {
        await safeLog({
          service: "agdf",
          level: "warn",
          message: `AGDF OpenCode context degraded: ${key} output is unavailable`,
          extra: { key, repositoryActivation: activation().state },
        });
      } catch {}
      return;
    }
    if (!output[key].includes(content)) output[key].push(content);
  };

  const safeToast = async (message, variant) => {
    try {
      if (client?.tui?.showToast) await client.tui.showToast({ body: { message, variant } });
    } catch {}
  };

  const safeLog = async (body) => {
    try {
      const response = await client?.app?.log?.({ body });
      if (response?.error) await client?.app?.log?.(body);
    } catch {
      try { await client?.app?.log?.(body); } catch {}
    }
  };

  let automaticCheck;
  const currentAutomaticCheck = () => {
    automaticCheck ??= (dependencies.executeAutomaticRuntimeCheck ?? executeOpenCodeAutomaticRuntimeCheck)({ directory });
    return automaticCheck;
  };

  return {
    event: async ({ event }) => {
      if (event?.type === "session.created") {
        const currentStatus = status();
        const runtimeCheck = currentAutomaticCheck();
        await safeLog({
          service: "agdf",
          level: "info",
          message: currentStatus.active ? "AGDF OpenCode active through durable control" : "AGDF OpenCode global hook active without durable control",
          extra: { ...currentStatus, automatic_runtime_check: { effective: runtimeCheck.effective, reason: runtimeCheck.reason, ran: runtimeCheck.ran } },
        });
        const validatorVersion = readValidatorExpectedVersion();
        if (validatorVersion && validatorVersion !== packageJson.version) {
          await client.app.log({
            body: {
              service: "agdf",
              level: "warn",
              message: `AGDF version drift: plugin ${packageJson.version} vs validator ${validatorVersion}`,
              extra: { plugin_version: packageJson.version, validator_version: validatorVersion },
            },
          });
          await safeToast(
            `AGDF version drift: plugin ${packageJson.version} vs validator ${validatorVersion}. Run npx --yes @agdf/cli@latest opencode-repo to repair.`,
            "warning",
          );
        }
      }
    },

    "shell.env": async (_input, output) => {
      const currentStatus = status();
      output.env.AGDF_PLUGIN_ACTIVE = currentStatus.active ? "1" : "0";
      output.env.AGDF_PLUGIN_VERSION = currentStatus.version;
      output.env.AGDF_CONTROL_DIR = controlDir;
      output.env.AGDF_OPENCODE_REPOSITORY_SURFACE = currentStatus.repositorySurface ? "1" : "0";
      output.env.AGDF_OPENCODE_REPOSITORY_ACTIVATION = currentStatus.repositoryActivation;
    },

    "experimental.chat.system.transform": async (_input, output) => {
      if (!activation().active) return;
      await appendContentOnce(output, "system", activeContext);
    },

    "experimental.session.compacting": async (_input, output) => {
      if (!activation().active) return;
      await appendContentOnce(output, "context", activationContract.kernel);
    },
  };
};

export default AGDFPlugin;
