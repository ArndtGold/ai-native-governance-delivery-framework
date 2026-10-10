import { inheritedPermissionEffect, referenceIdentityForSurface } from "./file-utils.js";

function nativeScope(scope) { return scope === "project" ? "local" : "user"; }

function commandArgs(action, scope, spec) {
  if (action === "enable") return ["mcp", "add", "--transport", "stdio", "--scope", nativeScope(scope), "agdf", "--", spec.command, ...spec.args];
  return ["mcp", "remove", "--scope", nativeScope(scope), "agdf"];
}

function parse(output) {
  const fields = new Map(String(output).split("\n").map((line) => {
    const match = /^\s*([^:]+):\s*(.*)$/u.exec(line);
    return match ? [match[1], match[2]] : ["", ""];
  }).filter(([name]) => name));
  const scopeText = fields.get("Scope") ?? "";
  const observedScope = scopeText.startsWith("Local config") ? "local"
    : scopeText.startsWith("Project config") ? "shared_project"
      : scopeText.startsWith("User config") ? "user" : "unknown";
  const argsText = fields.get("Args") ?? "";
  const suffix = " --surface claude";
  const observed = fields.get("Type") === "stdio" && argsText.endsWith(suffix)
    ? { command: fields.get("Command"), args: [argsText.slice(0, -suffix.length), "--surface", "claude"] }
    : null;
  return { fields, observedScope, observed };
}

function sources({ scope }) {
  const selectedNative = nativeScope(scope);
  return [
    { id: "local", path: "claude:local:agdf", priority: 10, selected: selectedNative === "local", status: "absent" },
    { id: "shared_project", path: "claude:project:agdf", priority: 20, selected: false, status: "absent" },
    { id: "user", path: "claude:user:agdf", priority: 30, selected: selectedNative === "user", status: "absent" },
  ];
}

function inspect({ scope, target, spec, exec }) {
  const selectedNative = nativeScope(scope);
  const sourceList = sources({ scope });
  try {
    const parsed = parse(exec("claude", ["mcp", "get", "agdf"], { cwd: target, encoding: "utf8", stdio: "pipe" }));
    const source = sourceList.find((item) => item.id === parsed.observedScope);
    if (!source) return { status: "invalid", selected_status: "invalid", effective_status: "invalid",
      selected_source: selectedNative, effective_source: "unknown", sources: sourceList, native_scope: selectedNative,
      path: `claude:${selectedNative}:agdf`, identity: null, observed: parsed.observed };
    const matched = parsed.fields.get("Type") === "stdio" && parsed.fields.get("Command") === spec.command
      && parsed.fields.get("Args") === spec.args.join(" ");
    source.status = matched ? "matched" : "foreign";
    const selected = sourceList.find((item) => item.selected);
    const conflict = selectedNative === "user" && ["local", "shared_project"].includes(parsed.observedScope);
    return { status: conflict ? "precedence_conflict" : source.status, selected_status: selected.status,
      effective_status: source.status, selected_source: selectedNative, effective_source: source.id,
      sources: sourceList.map((item) => Object.freeze({ ...item, source: item.id })), native_scope: selectedNative, path: selected.path,
      identity: null, observed: parsed.observed };
  } catch (error) {
    const output = `${String(error?.stdout ?? "")}\n${String(error?.stderr ?? "")}`;
    if (error?.status === 1 && output.includes('No MCP server named "agdf"')) {
      return { status: "absent", selected_status: "absent", effective_status: "absent",
        selected_source: selectedNative, effective_source: selectedNative,
        sources: sourceList.map((item) => Object.freeze({ ...item, source: item.id })),
        native_scope: selectedNative, path: `claude:${selectedNative}:agdf`, identity: null };
    }
    throw new Error("AGDF_MCP_CLAUDE_INSPECTION_FAILED");
  }
}

function transaction({ action, scope, target, spec, previousSpec, exec }) {
  const current = inspect({ scope, target, spec, exec });
  if (current.status === "precedence_conflict") throw new Error("AGDF_MCP_REGISTRATION_PRECEDENCE_CONFLICT");
  if (["foreign", "invalid"].includes(current.selected_status) && !previousSpec) throw new Error("AGDF_MCP_REGISTRATION_FOREIGN");
  if ((action === "enable" && current.selected_status === "matched") || (action === "disable" && current.selected_status === "absent")) {
    return { status: "unchanged", path: current.path, apply() {}, rollback() {} };
  }
  let applied = "none";
  const call = (args) => exec("claude", args, { cwd: target, encoding: "utf8", stdio: "pipe" });
  const remove = () => call(commandArgs("disable", scope, spec));
  const add = (value) => call(commandArgs("enable", scope, value));
  return { status: "changed", path: current.path,
    apply() {
      if (action === "enable" && previousSpec) {
        remove();
        applied = "previous_removed";
        try { add(spec); applied = "new_added"; } catch (error) {
          try { add(previousSpec); applied = "none"; } catch { throw new Error("AGDF_MCP_CLAUDE_UPDATE_ROLLBACK_FAILED"); }
          throw error;
        }
      } else {
        call(commandArgs(action, scope, spec));
        applied = "single_applied";
      }
    },
    rollback() {
      if (applied === "none") return;
      if (action === "enable" && previousSpec) {
        if (applied === "new_added") remove();
        add(previousSpec);
      } else {
        const inverse = action === "enable" ? "disable" : "enable";
        call(commandArgs(inverse, scope, spec));
      }
      applied = "none";
    },
  };
}

function probe({ exec, target }) {
  try {
    const output = String(exec("claude", ["--version"], { cwd: target, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })).trim();
    const version = output.match(/\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/)?.[0];
    return Object.freeze({ status: version ? "detected" : "unsupported", version: version ?? null,
      client_variant: "cli", config_variant: "native_cli" });
  } catch { return Object.freeze({ status: "unavailable", version: null, client_variant: "cli", config_variant: "native_cli" }); }
}

export const claudeAdapter = Object.freeze({
  surface: "claude",
  nativeScope,
  probeHost: probe,
  resolveSources: sources,
  inspect,
  createTransaction: transaction,
  referenceIdentity: (input) => referenceIdentityForSurface("claude", nativeScope, input),
  permissionEffect: inheritedPermissionEffect,
});
