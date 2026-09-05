// Shared command and evidence mechanics. Native command sequences belong to each host.
export function historicalEvidenceEntries(transaction) {
  const historical = transaction.historicalEvidence;
  if (!historical) return [];
  return [
    `historical_release:${historical.releaseVersion}`,
    `historical_contract:${historical.contractId}`,
    `historical_contract_digest:${historical.contractDigest}`,
    `historical_entry_digest:${historical.entryDigest}`,
  ];
}

export function rollbackMarketplaceFilesystem(transaction, recovery) {
  try {
    transaction.rollback();
    recovery.push({ filesystem: transaction.root, status: "restored" });
    return true;
  } catch (rollbackError) {
    recovery.push({ filesystem: transaction.root, status: "failed", message: rollbackError.message });
    return false;
  }
}

export function captureOptions() {
  return { encoding: "utf8", stdio: "pipe" };
}

export function runPluginPhase(exec, executable, args, phase, options) {
  try {
    return exec(executable, args, options);
  } catch (error) {
    const effectivePhase = error?.code === "ENOENT" ? "executable" : phase;
    throw lifecycleAdapterError(effectivePhase, commandErrorText(error) || `${executable} ${args.join(" ")} failed`, {
      executable,
      args,
    });
  }
}

export function lifecycleAdapterError(phase, message, evidence = {}) {
  const error = new Error(message);
  error.name = "LifecycleAdapterError";
  error.phase = phase;
  error.evidence = evidence;
  return error;
}

export function commandErrorText(error) {
  return (error.stderr || error.stdout || error.message || "").toString().trim();
}

export function pluginListHasPlugin(output, pluginId) {
  const escapedPluginId = pluginId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return output
    .split(/\r?\n/)
    .some((line) => new RegExp(`(^|\\s)${escapedPluginId}(\\s|$)`).test(line));
}

export const VERSION_PATTERN = "v?(\\d+\\.\\d+\\.\\d+(?:[-+][0-9A-Za-z.-]+)?)";

export function pluginVersionFromList(output, pluginId) {
  const escapedPluginId = pluginId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const lines = output.split(/\r?\n/);
  const entryIndex = lines.findIndex((entry) => new RegExp(`(^|\\s)${escapedPluginId}(\\s|$)`).test(entry));
  if (entryIndex < 0) return "";
  const sameLine = lines[entryIndex].match(new RegExp(`\\b${VERSION_PATTERN}\\b`));
  if (sameLine) return sameLine[1];
  // Current `claude plugin list` prints the plugin id and its `Version:` on separate
  // lines; scan the entry's block until the next plugin id line.
  for (let index = entryIndex + 1; index < lines.length; index += 1) {
    if (/\S+@\S+/.test(lines[index])) break;
    const blockMatch = lines[index].match(new RegExp(`\\bVersion:?\\s*${VERSION_PATTERN}\\b`, "i"));
    if (blockMatch) return blockMatch[1];
  }
  return "";
}

export function versionMismatchMessage(surface, pluginId, expectedVersion, installedVersion, correctiveCommand) {
  return `AGDF ${surface} plugin version mismatch for ${pluginId}: expected ${expectedVersion}, observed ${installedVersion || "unknown"}. Refresh with: ${correctiveCommand}`;
}

export function recoveryAttempt(exec, executable, recovery) {
  return args => {
    try {
      exec(executable, args, captureOptions());
      recovery.push({ args, status: "restored" });
      return true;
    } catch (error) {
      recovery.push({ args, status: "failed", message: commandErrorText(error) });
      return false;
    }
  };
}

export function inspectPluginList({ surface, exec, executable, args, expectedVersion, selectPlugin, localVersion = () => false }) {
  try {
    const output = exec(executable, args, captureOptions());
    const pluginId = selectPlugin(output);
    const installed = pluginListHasPlugin(output, pluginId);
    const version = installed ? pluginVersionFromList(output, pluginId) : "";
    const local = localVersion(version);
    return {
      status: !installed ? "not_installed" : version === expectedVersion || local ? "healthy" : "degraded",
      surface, version: version || null, expected_version: expectedVersion,
      evidence: [`${executable} ${args.join(" ")}`, ...(local ? [`canonical_version:${expectedVersion}`, `local_install_version:${version}`] : []),
        ...(installed && !version ? ["host_did_not_expose_version"] : [])],
    };
  } catch (error) {
    return { status: "unknown", surface, version: null, expected_version: expectedVersion, evidence: [commandErrorText(error)] };
  }
}
