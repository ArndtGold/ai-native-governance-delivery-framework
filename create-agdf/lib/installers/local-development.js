import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";
import { npmExecutable } from "./npm-invocation.js";

const LOCAL_PACKAGE_OWNER = "create-agdf";
const LOCAL_PACKAGE_KIND = "opencode_local_development_package";
const OWNERSHIP_FILE = ".agdf-owned.json";

function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function pathInside(root, candidate) {
  const relativePath = candidate.slice(root.length);
  return candidate === root || (candidate.startsWith(root) && ["/", "\\"].includes(relativePath[0]));
}

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} is invalid: ${error.message}`);
  }
}

function parsePackResult(output) {
  const start = String(output).indexOf("[");
  if (start < 0) throw new Error("AGDF local package build did not return npm pack JSON.");
  const parsed = JSON.parse(String(output).slice(start));
  const result = parsed?.[0];
  const filename = result?.filename;
  if (typeof filename !== "string" || !filename || filename.includes("/") || filename.includes("\\")) {
    throw new Error("AGDF local package build returned an unsafe tarball name.");
  }
  if (!Array.isArray(result.files) || result.files.length === 0) {
    throw new Error("AGDF local package build did not report its packed file inventory.");
  }
  return { filename, files: result.files };
}

export function localNpmExecutable(platform = process.platform, execPath = process.execPath) {
  const invocation = npmExecutable({ platform, execPath, env: {} });
  return { executable: invocation.executable, prefix: [...invocation.prefix] };
}

function digestPackedFiles(packageRoot, files) {
  const root = resolve(packageRoot);
  const paths = files.map((entry) => {
    if (!entry
        || typeof entry.path !== "string"
        || !entry.path
        || entry.path.includes("\\")
        || !Number.isInteger(entry.mode)) {
      throw new Error("AGDF local package build returned an invalid packed file path.");
    }
    const path = resolve(root, entry.path);
    if (!pathInside(root, path) || path === root) throw new Error(`AGDF local package build returned an unsafe packed file path: ${entry.path}`);
    const stats = lstatSync(path);
    if (!stats.isFile() || stats.isSymbolicLink()) throw new Error(`AGDF local package build returned a non-file package entry: ${entry.path}`);
    return { path, relative: entry.path.replaceAll("\\", "/"), mode: entry.mode };
  }).sort((left, right) => left.relative.localeCompare(right.relative));
  const hash = createHash("sha256");
  for (const entry of paths) {
    hash.update(entry.relative);
    hash.update("\0");
    hash.update(String(entry.mode));
    hash.update("\0");
    hash.update(readFileSync(entry.path));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function validateOwnedPackageDirectory(root, expected = {}) {
  const rootStats = lstatSync(root);
  if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) throw new Error(`Refusing unsafe AGDF local package directory: ${root}`);
  const marker = readJson(join(root, OWNERSHIP_FILE), "AGDF local package ownership marker");
  if (marker.schema_version !== 1
      || marker.owner !== LOCAL_PACKAGE_OWNER
      || marker.kind !== LOCAL_PACKAGE_KIND
      || !/^[a-f0-9]{64}$/.test(marker.digest ?? "")
      || !/^[a-f0-9]{64}$/.test(marker.archive_digest ?? "")
      || typeof marker.filename !== "string"
      || !marker.filename) {
    throw new Error(`Refusing unowned AGDF local package directory: ${root}`);
  }
  if (expected.version && marker.version !== expected.version) throw new Error(`AGDF local package version mismatch: ${root}`);
  if (expected.digest && marker.digest !== expected.digest) throw new Error(`AGDF local package digest mismatch: ${root}`);
  const tarball = join(root, marker.filename);
  if (!existsSync(tarball)
      || !lstatSync(tarball).isFile()
      || lstatSync(tarball).isSymbolicLink()
      || sha256File(tarball) !== marker.archive_digest) {
    throw new Error(`AGDF local package tarball is missing or tampered: ${root}`);
  }
  return { marker, tarball };
}

export function validateLocalOpenCodePackageSource(source) {
  if (!source
      || source.kind !== "local_checkout"
      || typeof source.root !== "string"
      || typeof source.dataRoot !== "string"
      || !/^[a-f0-9]{64}$/.test(source.digest ?? "")) {
    throw new Error("Invalid AGDF OpenCode local package source.");
  }
  const root = resolve(source.root);
  const dataRoot = resolve(source.dataRoot);
  const expectedRoot = join(dataRoot, "packages", "local", source.digest);
  if (root !== expectedRoot) throw new Error("AGDF OpenCode local package source is outside its owned data root.");
  const { marker, tarball } = validateOwnedPackageDirectory(root, {
    version: source.version,
    digest: source.digest,
  });
  const specifier = tarball;
  if (source.specifier && source.specifier !== specifier) throw new Error("AGDF OpenCode local package specifier does not match its owned tarball.");
  return Object.freeze({
    kind: "local_checkout",
    dataRoot,
    root,
    markerPath: join(root, OWNERSHIP_FILE),
    tarball,
    specifier,
    version: marker.version,
    digest: marker.digest,
    archiveDigest: marker.archive_digest,
  });
}

export function prepareLocalOpenCodePackage({
  dataRoot,
  packageRoot,
  expectedVersion,
  exec = execFileSync,
} = {}) {
  if (!dataRoot || !packageRoot || !expectedVersion) throw new Error("AGDF local package preparation requires dataRoot, packageRoot and expectedVersion.");
  const localRoot = resolve(dataRoot, "packages", "local");
  mkdirSync(localRoot, { recursive: true });
  const stageRoot = mkdtempSync(join(localRoot, ".stage-"));
  const npmCacheRoot = mkdtempSync(join(localRoot, ".npm-cache-"));
  try {
    const npm = localNpmExecutable();
    const output = exec(npm.executable, [
      ...npm.prefix,
      "pack",
      "--ignore-scripts",
      "--json",
      "--pack-destination",
      stageRoot,
    ], {
      cwd: resolve(packageRoot),
      encoding: "utf8",
      stdio: "pipe",
      env: { ...process.env, npm_config_cache: npmCacheRoot },
    });
    const { filename, files } = parsePackResult(output);
    const stagedTarball = join(stageRoot, filename);
    if (!existsSync(stagedTarball) || !statSync(stagedTarball).isFile()) throw new Error("AGDF local package tarball was not created.");
    const digest = digestPackedFiles(packageRoot, files);
    const archiveDigest = sha256File(stagedTarball);
    const stableRoot = join(localRoot, digest);
    if (existsSync(stableRoot)) {
      const existing = validateLocalOpenCodePackageSource({ kind: "local_checkout", dataRoot, root: stableRoot, version: expectedVersion, digest });
      if (existing.archiveDigest !== archiveDigest) throw new Error(`AGDF local package archive is not deterministic for packed content: ${stableRoot}`);
      rmSync(stageRoot, { recursive: true, force: true });
      return existing;
    }
    writeFileSync(join(stageRoot, OWNERSHIP_FILE), `${JSON.stringify({
      schema_version: 1,
      owner: LOCAL_PACKAGE_OWNER,
      kind: LOCAL_PACKAGE_KIND,
      version: expectedVersion,
      digest,
      archive_digest: archiveDigest,
      filename,
    }, null, 2)}\n`, "utf8");
    renameSync(stageRoot, stableRoot);
    return validateLocalOpenCodePackageSource({ kind: "local_checkout", dataRoot, root: stableRoot, version: expectedVersion, digest });
  } catch (error) {
    if (existsSync(stageRoot)) rmSync(stageRoot, { recursive: true, force: true });
    throw error;
  } finally {
    rmSync(npmCacheRoot, { recursive: true, force: true });
  }
}

export const localDevelopmentConstants = Object.freeze({
  owner: LOCAL_PACKAGE_OWNER,
  kind: LOCAL_PACKAGE_KIND,
  ownershipFile: OWNERSHIP_FILE,
});
