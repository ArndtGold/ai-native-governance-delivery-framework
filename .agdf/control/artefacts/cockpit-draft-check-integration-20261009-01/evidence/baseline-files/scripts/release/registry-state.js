export const RELEASE_PACKAGES = Object.freeze(["create-agdf", "@agdf/mcp-server", "@agdf/cli"]);

export function classifyRegistryResult(packageName, version, result) {
  const exact = `${packageName}@${version}`;
  if (result.status === 0) {
    try {
      const value = JSON.parse(result.stdout);
      return { package: packageName, version, state: value === version ? "published" : "unknown",
        ...(value === version ? {} : { detail: "unexpected_registry_version" }) };
    } catch {
      return { package: packageName, version, state: "unknown", detail: "invalid_registry_response" };
    }
  }
  if (/\b(?:E404|ETARGET)\b/u.test(result.stderr ?? "")) {
    return { package: packageName, version, state: "absent" };
  }
  return { package: packageName, version, state: "unknown", detail: "registry_query_failed", exact };
}

export function releaseRegistryDecision(entries) {
  const states = Object.fromEntries(entries.map((entry) => [entry.package, entry.state]));
  const safeToStart = RELEASE_PACKAGES.every((name) => states[name] === "absent");
  const complete = RELEASE_PACKAGES.every((name) => states[name] === "published");
  return { schema_version: 1, safe_to_start: safeToStart, complete,
    outcome: complete ? "complete" : safeToStart ? "unpublished" : "partial_or_unknown",
    packages: entries };
}
