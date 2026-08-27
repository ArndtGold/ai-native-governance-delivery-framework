const surfaceLabels = Object.freeze({
  codex: "Codex",
  claude: "Claude Code",
  copilot: "GitHub Copilot",
  opencode: "OpenCode",
  generic: "Generic coding agent",
});

function titleFor(report) {
  if (report.result === "failed") return "AGDF installation failed";
  if (report.result === "partial") return "AGDF installation partially completed";
  if (report.result === "preview") return report.operation === "uninstall"
    ? "AGDF uninstall preview"
    : "AGDF installation cancelled";
  if (report.operation === "repository_setup") return "AGDF repository setup complete";
  return "AGDF installation complete";
}

export function lifecycleCardLines(report) {
  const version = report.version.transition === "updated" && report.version.previous && report.version.installed
    ? `${report.version.previous} -> ${report.version.installed}`
    : report.version.installed || (report.version.expected ? `unknown; expected ${report.version.expected}` : "unknown");
  const versionStatus = report.version.transition && report.version.transition !== "updated"
    ? `${report.version.status}; transition ${report.version.transition}`
    : report.version.status;
  return [
    titleFor(report),
    `Surface: ${surfaceLabels[report.surface]}`,
    `Version: ${version} (${versionStatus})`,
    `Installation scope: ${report.scope}`,
    `Installation: ${report.installation.status}`,
    `Activation: ${report.activation.status}`,
    `Repository delivery: ${report.delivery.status}`,
    `Automatic runtime checks: requested=${report.runtime_checks.requested}; effective=${report.runtime_checks.effective}; reason=${report.runtime_checks.reason}`,
    `Verification: ${report.verification.status}`,
    `Restart required: ${report.restart.required ? "yes" : "no"}${report.restart.reason !== "none" ? ` (${report.restart.reason})` : ""}`,
    `Next action: ${report.next_action.text}`,
  ];
}

function friendlyRuntimeCheckState(report) {
  if (report.runtime_checks.requested === "cancelled") return "Cancelled";
  if (report.runtime_checks.effective === "enabled") return "On";
  if (report.runtime_checks.effective === "manual") return "Manual";
  if (report.runtime_checks.effective === "decision_required") return `Waiting for ${surfaceLabels[report.surface]} permission`;
  if (report.runtime_checks.effective === "renewal_required") return "Needs your review";
  if (["degraded", "failed", "unavailable"].includes(report.runtime_checks.effective)) return "Not available; use manual checks";
  return report.runtime_checks.requested === "enabled" ? "Requested; verification pending" : "Not configured";
}

function compactVersionLine(report) {
  if (report.version.transition === "updated" && report.version.previous && report.version.installed) {
    return `Updated: ${report.version.previous} -> ${report.version.installed} (${report.version.status})`;
  }
  if (report.version.installed) return `Version: ${report.version.installed} (${report.version.status})`;
  if (report.version.expected) return `Version: not verified (expected ${report.version.expected})`;
  return "Version: not verified";
}

export function compactLifecycleCardLines(report) {
  if (report.result === "preview") return [
    titleFor(report),
    "No changes were made.",
    `Next: ${report.next_action.text}`,
  ];
  return [
    report.result === "success"
      ? `AGDF ${report.operation === "update" ? "updated" : "installed"} for ${surfaceLabels[report.surface]}`
      : titleFor(report),
    compactVersionLine(report),
    `Installation: ${report.installation.status === "healthy" ? "Ready" : report.installation.status}`,
    `Automatic checks: ${friendlyRuntimeCheckState(report)}`,
    `Next: ${report.next_action.text}`,
  ];
}

export function printLifecycleResult(report, { json = false, compact = false, io = console } = {}) {
  if (json) {
    io.log(JSON.stringify(report, null, 2));
    return;
  }
  for (const line of compact ? compactLifecycleCardLines(report) : lifecycleCardLines(report)) io.log(line);
  if (report.failure) io.log(`Failure phase: ${report.failure.phase}: ${report.failure.message}`);
  if (report.retained.length) {
    io.log("Retained:");
    for (const item of report.retained) io.log(`- ${typeof item === "string" ? item : JSON.stringify(item)}`);
  }
}

export function printGeneralStatus(report, { json = false, io = console } = {}) {
  if (json) {
    io.log(JSON.stringify(report, null, 2));
    return;
  }
  io.log("AGDF status");
  io.log(`Installation: ${report.installation.status}${report.installation.version ? ` (${report.installation.version})` : ""}`);
  io.log(`Repository: ${report.repository.status}`);
  io.log(`Delivery: ${report.delivery.status}${report.delivery.current_gate ? ` (${report.delivery.current_gate})` : ""}`);
  io.log(`Automatic runtime checks: requested=${report.runtime_checks.requested}; effective=${report.runtime_checks.effective}; reason=${report.runtime_checks.reason}`);
  io.log(`Next action: ${report.next_action.text}`);
}
