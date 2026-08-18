import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { LISTING_LIMITS, unicodeLength } from "./contract.js";

function inside(root, candidate) {
  const rel = relative(root, candidate);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

function hasExactCase(root, target) {
  const rel = relative(root, target);
  let current = root;
  for (const segment of rel.split(sep)) {
    if (!readdirSync(current).includes(segment)) return false;
    current = join(current, segment);
  }
  return true;
}

export function listCandidateFiles(root) {
  root = realpathSync(resolve(root));
  const files = [];
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const stats = lstatSync(path);
      if (stats.isSymbolicLink()) throw new Error(`AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING: symlink not allowed: ${relative(root, path)}`);
      if (stats.isDirectory()) visit(path);
      else if (stats.isFile()) files.push(relative(root, path).replaceAll("\\", "/"));
    }
  }
  visit(root);
  return files;
}

function declaredPath(root, value, label, { directory = false } = {}) {
  if (typeof value !== "string" || !value.startsWith("./")) throw new Error(`AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING: ${label} must start with ./`);
  const target = resolve(root, value);
  if (!inside(root, target)) throw new Error(`AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING: ${label} escapes candidate root`);
  if (!hasExactCase(root, target)) throw new Error(`AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING: ${label} has case mismatch or is missing`);
  const actual = realpathSync(target);
  if (!inside(root, actual)) throw new Error(`AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING: ${label} resolves outside candidate root`);
  const stats = statSync(target);
  if (directory ? !stats.isDirectory() : !stats.isFile()) throw new Error(`AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING: ${label} has wrong type`);
}

function assertReferencedSkillResources(root) {
  const skillsRoot = join(root, "skills");
  for (const skillName of readdirSync(skillsRoot).sort()) {
    const skillRoot = join(skillsRoot, skillName);
    if (!statSync(skillRoot).isDirectory()) continue;
    const skillPath = join(skillRoot, "SKILL.md");
    if (!statSync(skillPath).isFile()) throw new Error(`AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING: skills/${skillName}/SKILL.md`);
    const content = readFileSync(skillPath, "utf8");
    const references = [...content.matchAll(/\.\.\/\.\.\/meta\/([A-Za-z0-9._/-]+)/g)].map((match) => match[1].replace(/[`)\],.;:]+$/, ""));
    for (const reference of references) {
      const target = resolve(root, "meta", reference);
      if (!inside(root, target) || !statSync(target).isFile()) throw new Error(`AGDF_PUBLIC_PLUGIN_BUNDLE_PATH_MISSING: skills/${skillName} references meta/${reference}`);
    }
  }
}

export function validateCandidate(root) {
  root = realpathSync(resolve(root));
  const manifestPath = join(root, ".codex-plugin", "plugin.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.hooks || manifest.mcp || manifest.app) throw new Error("AGDF_PUBLIC_PLUGIN_CONTRACT_INVALID: Skills-only candidate must not declare hooks, MCP or app configuration");
  declaredPath(root, manifest.skills, "skills", { directory: true });
  declaredPath(root, manifest.interface?.composerIcon, "composerIcon");
  declaredPath(root, manifest.interface?.logo, "logo");
  const definition = JSON.parse(readFileSync(join(root, "meta", "agdf-plugin.definition.json"), "utf8"));
  if (definition.version !== manifest.version) throw new Error("AGDF_PUBLIC_PLUGIN_VERSION_DRIFT: manifest and definition differ");
  for (const [label, source] of Object.entries(definition.publicDistribution?.submissionSources ?? {})) {
    declaredPath(root, `./${source}`, `submissionSources.${label}`);
  }
  assertReferencedSkillResources(root);
  if (unicodeLength(manifest.interface?.displayName) > LISTING_LIMITS.displayName) throw new Error("AGDF_PUBLIC_PLUGIN_LISTING_LIMIT_EXCEEDED: displayName");
  if (unicodeLength(manifest.interface?.shortDescription) > LISTING_LIMITS.shortDescription) throw new Error("AGDF_PUBLIC_PLUGIN_LISTING_LIMIT_EXCEEDED: shortDescription");
  if (unicodeLength(manifest.interface?.developerName) > LISTING_LIMITS.developerName) throw new Error("AGDF_PUBLIC_PLUGIN_LISTING_LIMIT_EXCEEDED: developerName");
  const prompts = manifest.interface?.defaultPrompt ?? [];
  if (prompts.length !== LISTING_LIMITS.promptCount || prompts.some((prompt) => unicodeLength(prompt) > LISTING_LIMITS.promptLength)) throw new Error("AGDF_PUBLIC_PLUGIN_LISTING_LIMIT_EXCEEDED: defaultPrompt");
  for (const field of ["websiteURL", "privacyPolicyURL", "termsOfServiceURL", "supportURL"]) {
    let url;
    try { url = new URL(manifest.interface?.[field]); } catch { throw new Error(`AGDF_PUBLIC_PLUGIN_CONTRACT_INVALID: ${field}`); }
    if (url.protocol !== "https:") throw new Error(`AGDF_PUBLIC_PLUGIN_CONTRACT_INVALID: ${field} must use HTTPS`);
  }
  const files = listCandidateFiles(root);
  for (const forbidden of [".app.json", ".mcp.json", ".agdf/control/", "node_modules/", ".git/"]) {
    if (files.some((file) => file === forbidden || file.startsWith(forbidden))) throw new Error(`AGDF_PUBLIC_PLUGIN_CONTRACT_INVALID: forbidden candidate content ${forbidden}`);
  }
  return { manifest, files };
}

export function inventory(root, { exclude = [] } = {}) {
  const excluded = new Set(exclude);
  return listCandidateFiles(root).filter((path) => !excluded.has(path)).map((path) => ({
    path,
    sha256: createHash("sha256").update(readFileSync(join(root, path))).digest("hex"),
  }));
}
