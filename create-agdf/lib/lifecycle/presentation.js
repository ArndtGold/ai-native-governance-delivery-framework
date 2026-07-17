import { interactionLocales } from "../cli/runtime-context.js";

function copy(locale) {
  const language = String(locale ?? "").toLowerCase().split("-")[0];
  return (interactionLocales.locales[language] ?? interactionLocales.locales[interactionLocales.fallbackLocale]).primary.lifecycleResult;
}

export function lifecycleCardLines(report, locale = "en") {
  const c = copy(locale);
  const version = report.version.transition === "updated" && report.version.previous && report.version.installed
    ? `${report.version.previous} -> ${report.version.installed}`
    : report.version.installed || (report.version.expected ? `${c.unknown}; expected ${report.version.expected}` : c.unknown);
  const versionStatus = report.version.transition && report.version.transition !== "updated"
    ? `${report.version.status}; transition ${report.version.transition}`
    : report.version.status;
  return [
    c.title,
    `${c.result}: ${report.result}`,
    `${c.surface}: ${report.surface}`,
    `${c.scope}: ${report.scope}`,
    `${c.version}: ${version} (${versionStatus})`,
    `${c.verification}: ${report.verification.status}`,
    `${c.restart}: ${report.restart.required ? c.yes : c.no}${report.restart.reason !== "none" ? ` (${report.restart.reason})` : ""}`,
    `${c.next}: ${report.next_action.text}`,
  ];
}

export function printLifecycleResult(report, { json = false, locale = "en", io = console } = {}) {
  if (json) {
    io.log(JSON.stringify(report, null, 2));
    return;
  }
  for (const line of lifecycleCardLines(report, locale)) io.log(line);
  if (report.failure) io.log(`Failure phase: ${report.failure.phase}: ${report.failure.message}`);
  if (report.retained.length) {
    io.log("Retained:");
    for (const item of report.retained) io.log(`- ${typeof item === "string" ? item : JSON.stringify(item)}`);
  }
}

export function printGeneralStatus(report, { json = false, locale = "en", io = console } = {}) {
  if (json) {
    io.log(JSON.stringify(report, null, 2));
    return;
  }
  const c = copy(locale);
  io.log(c.statusTitle);
  io.log(`${c.installation}: ${report.installation.status}${report.installation.version ? ` (${report.installation.version})` : ""}`);
  io.log(`${c.repository}: ${report.repository.status}`);
  io.log(`${c.delivery}: ${report.delivery.status}${report.delivery.current_gate ? ` (${report.delivery.current_gate})` : ""}`);
  io.log(`${c.next}: ${report.next_action.text}`);
}
