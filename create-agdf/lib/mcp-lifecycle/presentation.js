import { interactionLocales } from "../cli/runtime-context.js";
import { localePack } from "../interaction-presentation.js";

function localized(pack, group, code) {
  const value = pack?.mcpLifecycle?.[group]?.[code];
  if (typeof value !== "string") throw new Error(`AGDF_MCP_PRESENTATION_UNLOCALIZED:${group}:${code}`);
  return value;
}

export function projectMcpLifecycleResult(report, { language } = {}) {
  const pack = localePack(interactionLocales, language);
  const permissionCode = typeof report.permission_effect === "string"
    ? report.permission_effect : report.permission_effect?.code ?? "inherited_host_user";
  return Object.freeze({
    ...report,
    permission_effect: Object.freeze({ ...(typeof report.permission_effect === "object" ? report.permission_effect : {}),
      code: permissionCode, text: localized(pack, "permissionEffects", permissionCode) }),
    fallback: Object.freeze({ ...report.fallback, text: localized(pack, "actions", report.fallback.code) }),
    next_action: Object.freeze({ ...report.next_action, text: localized(pack, "actions", report.next_action.code) }),
    diagnostics: Object.freeze((report.diagnostics ?? []).map((item) => Object.freeze({
      ...item,
      text: localized(pack, "diagnostics", item.code),
    }))),
  });
}

export function renderMcpLifecycleText(report, { language } = {}) {
  const pack = localePack(interactionLocales, language);
  const projected = projectMcpLifecycleResult(report, { language });
  const labels = pack.mcpLifecycle.labels;
  return [
    pack.mcpLifecycle.title,
    `${labels.operation}: ${report.operation}`,
    `${labels.result}: ${localized(pack, "results", report.result)}`,
    `${labels.capability}: ${localized(pack, "capabilities", report.capability)}`,
    `${labels.surface}: ${report.surface}`,
    `${labels.scope}: ${report.scope}`,
    `${labels.scopeEffect}: ${localized(pack, "scopeEffects", report.scope_effect)}`,
    `${labels.target}: ${report.target}`,
    `${labels.authorizes}: ${report.authorizes}`,
    `${labels.runtime}: ${report.runtime?.package_status ?? report.runtime?.status ?? "unknown"}`,
    `${labels.registration}: ${localized(pack, "registrations", report.registration?.status)}`,
    `${labels.discovery}: ${localized(pack, "discoveries", report.discovery?.status)}`,
    `${labels.permissionEffect}: ${projected.permission_effect.text}`,
    `${labels.diagnostics}: ${projected.diagnostics.length ? projected.diagnostics.map((item) => item.text).join(", ") : localized(pack, "diagnostics", "none")}`,
    `${labels.nextAction}: ${projected.next_action.text}`,
    `${labels.fallback}: ${projected.fallback.text}`,
  ].join("\n");
}

export function printMcpLifecycleResult(report, { json = false, io = console, language } = {}) {
  io.log(json ? JSON.stringify(projectMcpLifecycleResult(report, { language }), null, 2)
    : renderMcpLifecycleText(report, { language }));
}
