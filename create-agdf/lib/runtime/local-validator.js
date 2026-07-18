import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

export function digestDirectory(root) {
  const files = [];
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const stats = statSync(path);
      if (stats.isDirectory()) visit(path);
      else if (stats.isFile()) files.push(path);
    }
  }
  visit(root);
  const hash = createHash("sha256");
  for (const path of files) {
    hash.update(relative(root, path).replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(readFileSync(path));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function envelope(machineValidation, options, evidence = {}) {
  return {
    schema_version: "1",
    machine_validation: machineValidation,
    surface: options.surface,
    expected_version: options.expectedVersion,
    observed_version: evidence.observedVersion ?? null,
    source: evidence.source ?? null,
    registry_access: false,
    ...(evidence.reason ? { reason: evidence.reason } : {}),
  };
}

export function resolveLocalValidator(options) {
  if (options.ownedPackageRoot) {
    const packageManifest = readJson(join(options.ownedPackageRoot, "package.json"));
    const observedVersion = packageManifest?.version ?? null;
    if (!packageManifest) {
      return { envelope: envelope("unavailable", options, { source: "config_local_package", reason: "package_missing" }) };
    }
    if (observedVersion !== options.expectedVersion) {
      return { envelope: envelope("version_mismatch", options, { observedVersion, source: "config_local_package" }) };
    }
    const entrypoint = join(options.ownedPackageRoot, "bin", "create-agdf.js");
    if (!existsSync(entrypoint)) {
      return { envelope: envelope("unavailable", options, { observedVersion, source: "config_local_package", reason: "entrypoint_missing" }) };
    }
    return {
      envelope: envelope("owned_version_matched", options, { observedVersion, source: "config_local_package" }),
      executable: process.execPath,
      prefixArgs: [entrypoint],
    };
  }
  const manifestPath = join(options.runtimeRoot, "runtime-manifest.json");
  const manifestExists = existsSync(manifestPath);
  const manifest = manifestExists ? readJson(manifestPath) : null;
  if (manifestExists && !manifest) {
    return { envelope: envelope("version_mismatch", options, { source: "plugin_bundle", reason: "manifest_invalid" }) };
  }
  if (manifest) {
    const packageRoot = join(options.runtimeRoot, "create-agdf");
    if (!existsSync(packageRoot)) {
      return { envelope: envelope("unavailable", options, { source: "plugin_bundle", reason: "package_missing" }) };
    }
    const packageManifest = readJson(join(packageRoot, "package.json"));
    const observedVersion = packageManifest?.version ?? manifest.version ?? null;
    if (observedVersion !== options.expectedVersion || manifest.version !== options.expectedVersion) {
      return { envelope: envelope("version_mismatch", options, { observedVersion, source: "plugin_bundle" }) };
    }
    let observedDigest = null;
    try { observedDigest = digestDirectory(packageRoot); } catch {}
    if (!observedDigest || manifest.digest !== observedDigest) {
      return { envelope: envelope("version_mismatch", options, { observedVersion, source: "plugin_bundle", reason: "digest_mismatch" }) };
    }
    const entrypoint = resolve(options.runtimeRoot, manifest.entrypoint ?? "");
    const entrypointRelative = relative(options.runtimeRoot, entrypoint);
    if (!manifest.entrypoint || entrypointRelative === ".." || entrypointRelative.startsWith(`..${sep}`) || isAbsolute(entrypointRelative)) {
      return { envelope: envelope("version_mismatch", options, { observedVersion, source: "plugin_bundle", reason: "invalid_entrypoint" }) };
    }
    if (!existsSync(entrypoint)) {
      return { envelope: envelope("unavailable", options, { observedVersion, source: "plugin_bundle", reason: "entrypoint_missing" }) };
    }
    return {
      envelope: envelope("owned_version_matched", options, { observedVersion, source: "plugin_bundle" }),
      executable: process.execPath,
      prefixArgs: [entrypoint],
    };
  }

  const configuredPath = options.configuredPath ?? process.env.AGDF_VALIDATOR_PATH ?? "";
  if (configuredPath) {
    if (!isAbsolute(configuredPath) || !existsSync(configuredPath)) {
      return { envelope: envelope("unavailable", options, { source: "configured_path", reason: "invalid_absolute_path" }) };
    }
    const versionProbe = spawnSync(configuredPath, ["--version", "--json"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    let observedVersion = null;
    try { observedVersion = JSON.parse(versionProbe.stdout)?.version ?? null; } catch {}
    if (versionProbe.status !== 0 || observedVersion !== options.expectedVersion) {
      return { envelope: envelope("version_mismatch", options, { observedVersion, source: "configured_path" }) };
    }
    return {
      envelope: envelope("configured_version_matched", options, { observedVersion, source: "configured_path" }),
      executable: configuredPath,
      prefixArgs: [],
    };
  }

  return { envelope: envelope(options.externalRequired ? "external_required" : "unavailable", options) };
}

export function runLocalValidator(options, args, io = console) {
  const resolved = resolveLocalValidator(options);
  if (args[0] === "--resolve-only") {
    io.log(JSON.stringify(resolved.envelope, null, args.includes("--json") ? 2 : 0));
    return resolved.executable ? 0 : 2;
  }
  if (!resolved.executable) {
    io.error(JSON.stringify(resolved.envelope));
    return 2;
  }
  const child = spawnSync(resolved.executable, [...resolved.prefixArgs, ...args], {
    cwd: options.cwd ?? process.cwd(),
    env: { ...process.env, AGDF_MACHINE_VALIDATION: resolved.envelope.machine_validation },
    stdio: "inherit",
  });
  return child.status ?? 2;
}
