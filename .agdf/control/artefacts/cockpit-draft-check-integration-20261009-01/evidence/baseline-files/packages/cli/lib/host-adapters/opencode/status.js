import { defaultOpenCodeConfigDir } from "../../installers/opencode.js";
export function inspectOpenCodeInstallation(options, evaluateOpenCodeGlobalStatus) {
  const surface = "opencode";
    const configDir = options.configDir ?? defaultOpenCodeConfigDir();
    const report = evaluateOpenCodeGlobalStatus(configDir);
    const healthy = report.status === "configured"
      && report.global_config?.plugin_configured === true
      && report.package?.loadable === true
      && report.package?.version_status === "current"
      && report.global_native_surface?.complete === true
      && report.experimental_hooks?.aggregate === "declared_supported"
      && report.host_sdk_version?.status === "matching";
    const hasAgdfEvidence = report.global_config?.plugin_configured === true
      || report.global_config?.legacy_plugin_configured === true
      || report.package?.loadable === true
      || report.global_native_surface?.present === true;
    return {
      status: healthy ? "healthy" : hasAgdfEvidence ? "degraded" : "not_installed",
      surface,
      version: report.package?.installed_version ?? null,
      evidence: [
        report.global_config?.path,
        `package:${report.package?.version_status ?? "unknown"}`,
        `global_native_surface:${report.global_native_surface?.complete === true ? "complete" : "incomplete"}`,
        `experimental_hooks:${report.experimental_hooks?.aggregate ?? "unknown"}`,
        `host_sdk_version:${report.host_sdk_version?.status ?? "unknown"};policy=${report.host_sdk_version?.policy ?? "unknown"}`,
      ].filter(Boolean),
      recommended_action: report.next_step || null,
    };
}

export function inspectOpenCodeRepositoryStatus(targetDir, evaluateActivation) {
    const activation = evaluateActivation(targetDir);
    return {
      status: activation.active ? "active" : activation.state === "invalid_control" ? "degraded" : "not_configured",
      scope: "repository",
      evidence: [
        activation.config_path,
        activation.diagnostic,
        ...(activation.error ? [activation.error] : []),
      ].filter(Boolean),
    };
}
