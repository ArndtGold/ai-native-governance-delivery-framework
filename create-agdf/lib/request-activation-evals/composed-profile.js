import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { validateDispatchBinding } from "../skill-dispatch/binding.js";

export const REQUEST_ACTIVATION_PROFILE_SURFACES = Object.freeze(["codex", "claude", "copilot", "opencode"]);
export const REQUEST_ACTIVATION_EVALUATOR_SURFACES = Object.freeze(["codex", "claude"]);

const PROFILE_KEYS = Object.freeze({
  session_start: ["eager_kind", "eager_source", "skill_prefix", "skill_root"],
  opencode: ["dynamic_source", "eager_kind", "eager_source", "skill_prefix", "skill_root"],
});
const KERNEL_START = "<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->";
const KERNEL_END = "<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->";

function normalizeLf(content) {
  return content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function exactKeys(value, expected) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function repositoryPath(repoRoot, relativePath) {
  if (typeof relativePath !== "string" || !relativePath || isAbsolute(relativePath)) {
    throw new Error("composed-profile source must be a repository-relative path");
  }
  const root = resolve(repoRoot);
  const candidate = resolve(root, relativePath);
  const relation = relative(root, candidate);
  if (relation === ".." || relation.startsWith(`..${sep}`) || isAbsolute(relation)) {
    throw new Error(`composed-profile source escapes repository: ${relativePath}`);
  }
  return candidate;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readSource(repoRoot, relativePath) {
  return normalizeLf(readFileSync(repositoryPath(repoRoot, relativePath), "utf8"));
}

function extractKernel(content, label) {
  const starts = content.split(KERNEL_START).length - 1;
  const ends = content.split(KERNEL_END).length - 1;
  const start = content.indexOf(KERNEL_START);
  const end = content.indexOf(KERNEL_END, start + KERNEL_START.length);
  if (starts !== 1 || ends !== 1 || start < 0 || end < start) {
    throw new Error(`${label} must contain exactly one ordered Request Activation kernel`);
  }
  return content.slice(start, end + KERNEL_END.length);
}

function validateDispatcherBinding(content, surface, label) {
  const matches = [...content.matchAll(/^AGDF dispatcher binding: (\{.*\})$/gmu)];
  if (matches.length !== 1) throw new Error(`${label} must contain exactly one dispatcher binding`);
  let binding;
  try { binding = JSON.parse(matches[0][1]); } catch { throw new Error(`${label} dispatcher binding must be valid JSON`); }
  validateDispatchBinding(binding);
  const surfaceIndex = Array.isArray(binding.argv_prefix) ? binding.argv_prefix.indexOf("--surface") : -1;
  if (surfaceIndex < 0 || binding.argv_prefix[surfaceIndex + 1] !== surface || binding.authorizes !== false) {
    throw new Error(`${label} dispatcher binding does not match profile surface ${surface}`);
  }
  if (surface !== "opencode" && (!exactKeys(binding.route_source_after_activation, ["path", "relative_to"])
      || binding.route_source_after_activation.relative_to !== "validator_directory"
      || ![
        "../meta/contracts/request-activation.md",
        "../copilot-skills/contracts/request-activation.md",
      ].includes(binding.route_source_after_activation.path))) {
    throw new Error(`${label} dispatcher binding has no exact post-activation route source`);
  }
  return binding;
}

function parseSkill(content, label) {
  const normalized = normalizeLf(content);
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/u.exec(normalized);
  if (!match) throw new Error(`${label} must contain one YAML frontmatter block`);
  const readField = (name) => {
    const lines = match[1].split("\n").filter((line) => line.startsWith(`${name}:`));
    if (lines.length !== 1) throw new Error(`${label} frontmatter must contain exactly one ${name}`);
    const raw = lines[0].slice(name.length + 1).trim();
    if (!raw) throw new Error(`${label} frontmatter ${name} must be non-empty`);
    if (raw.startsWith('"')) {
      try { return JSON.parse(raw); } catch { throw new Error(`${label} frontmatter ${name} must be valid JSON-quoted YAML`); }
    }
    return raw;
  };
  return Object.freeze({
    name: readField("name"),
    description: readField("description"),
    body: match[2].trimEnd(),
  });
}

function digestComponent(component) {
  return `sha256:${createHash("sha256").update(component.kind).update("\0")
    .update(component.source).update("\0").update(component.content).digest("hex")}`;
}

function validateProfileManifest(manifest) {
  const config = manifest?.composed_profile;
  if (!exactKeys(config, ["evaluator_surfaces", "evidence_plane", "loaded_profile", "profiles", "required_pairs", "schema_version"])
      || config.schema_version !== 1
      || config.evidence_plane !== "source_composed"
      || config.loaded_profile !== false
      || !Array.isArray(config.evaluator_surfaces)
      || config.evaluator_surfaces.join("\0") !== REQUEST_ACTIVATION_EVALUATOR_SURFACES.join("\0")
      || !exactKeys(config.profiles, REQUEST_ACTIVATION_PROFILE_SURFACES)) {
    throw new Error("request activation composed_profile manifest is invalid");
  }
  for (const surface of REQUEST_ACTIVATION_PROFILE_SURFACES) {
    const profile = config.profiles[surface];
    const keys = PROFILE_KEYS[profile?.eager_kind];
    if (!keys || !exactKeys(profile, keys)
        || (surface === "opencode") !== (profile.eager_kind === "opencode")) {
      throw new Error(`composed-profile manifest for ${surface} is invalid`);
    }
    for (const key of keys.filter((name) => name.endsWith("source") || name === "skill_root")) {
      if (typeof profile[key] !== "string" || !profile[key]) throw new Error(`composed-profile source for ${surface} is invalid`);
    }
    if (typeof profile.skill_prefix !== "string") throw new Error(`composed-profile skill prefix for ${surface} is invalid`);
  }
  if (!Array.isArray(config.required_pairs) || config.required_pairs.length === 0) {
    throw new Error("request activation composed_profile manifest needs required pairs");
  }
  return config;
}

function sessionStartContext(repoRoot, surface, profile, sandbox) {
  const env = {
    ...process.env,
    AGDF_DATA_DIR: join(sandbox, "agdf-data"),
    AGDF_SURFACE: surface,
  };
  delete env.CLAUDE_PLUGIN_ROOT;
  delete env.COPILOT_PLUGIN_DATA;
  const raw = normalizeLf(execFileSync(process.execPath, [repositoryPath(repoRoot, profile.eager_source)], {
    cwd: sandbox,
    encoding: "utf8",
    env,
    input: "",
    maxBuffer: 1024 * 1024,
    timeout: 15000,
  })).trimEnd();
  if (surface !== "copilot") return raw;
  let envelope;
  try { envelope = JSON.parse(raw); } catch { throw new Error("Copilot SessionStart output must be a JSON envelope"); }
  if (!exactKeys(envelope, ["additionalContext"]) || typeof envelope.additionalContext !== "string") {
    throw new Error("Copilot SessionStart output must contain only additionalContext");
  }
  return normalizeLf(envelope.additionalContext).trimEnd();
}

async function openCodeContext(repoRoot, profile, sandbox) {
  const controlRoot = join(sandbox, ".agdf", "control");
  mkdirSync(controlRoot, { recursive: true });
  writeFileSync(join(controlRoot, "config.json"), `${JSON.stringify({
    artifact_language: "en",
    chat_language: "en",
    runtime_language: "en",
  }, null, 2)}\n`, "utf8");
  const moduleUrl = pathToFileURL(repositoryPath(repoRoot, profile.dynamic_source)).href;
  const { AGDFPlugin } = await import(moduleUrl);
  if (typeof AGDFPlugin !== "function") throw new Error("OpenCode composed-profile source does not export AGDFPlugin");
  // Source composition is not an installed OpenCode config layout.
  const hooks = await AGDFPlugin({ directory: sandbox, client: {} }, {
    validatorPath: repositoryPath(repoRoot, "create-agdf/bin/agdf-validator.js"),
  });
  const transform = hooks?.["experimental.chat.system.transform"];
  if (typeof transform !== "function") throw new Error("OpenCode composed-profile source has no system transform");
  const output = { system: [] };
  await transform({}, output);
  if (output.system.length !== 1 || typeof output.system[0] !== "string") {
    throw new Error("OpenCode active system transform must emit exactly one context block");
  }
  return normalizeLf(output.system[0]).trimEnd();
}

export function loadRequestActivationComposedProfileConfig(repoRoot, manifest) {
  const resolvedManifest = manifest ?? readJson(repositoryPath(repoRoot, "evals/request-activation/manifest.json"));
  const config = validateProfileManifest(resolvedManifest);
  for (const profile of Object.values(config.profiles)) {
    for (const key of Object.keys(profile).filter((name) => name.endsWith("source") || name === "skill_root")) {
      repositoryPath(repoRoot, profile[key]);
    }
  }
  return config;
}

export async function composeRequestActivationProfile({ repoRoot, manifest, profileSurface, instructionSkill } = {}) {
  if (!repoRoot) throw new Error("composed-profile evaluation requires repoRoot");
  if (!REQUEST_ACTIVATION_PROFILE_SURFACES.includes(profileSurface)) {
    throw new Error(`unsupported request activation profile surface: ${profileSurface || "missing"}`);
  }
  const config = loadRequestActivationComposedProfileConfig(repoRoot, manifest);
  const definition = readJson(repositoryPath(repoRoot, "plugin/meta/agdf-plugin.definition.json"));
  const skills = Array.isArray(definition.skillSet) ? definition.skillSet : [];
  const registry = new Set(skills.map(({ slug }) => slug));
  if (typeof instructionSkill !== "string" || !registry.has(instructionSkill)) {
    throw new Error(`unknown composed-profile instruction skill: ${instructionSkill || "missing"}`);
  }
  const profile = config.profiles[profileSurface];
  const contract = readSource(repoRoot, "plugin/meta/contracts/request-activation.md");
  const canonicalKernel = extractKernel(contract, "canonical Request Activation Contract");
  const sandbox = mkdtempSync(join(tmpdir(), `agdf-${profileSurface}-composed-profile-`));
  try {
    const components = [];
    const eagerContent = profile.eager_kind === "session_start"
      ? sessionStartContext(repoRoot, profileSurface, profile, sandbox)
      : readSource(repoRoot, profile.eager_source).trimEnd();
    if (extractKernel(eagerContent, `${profileSurface} eager source`) !== canonicalKernel) {
      throw new Error(`${profileSurface} eager source does not contain the canonical Request Activation kernel`);
    }
    if (profile.eager_kind === "session_start") {
      const binding = validateDispatcherBinding(eagerContent, profileSurface, `${profileSurface} SessionStart`);
      const routeSourcePath = resolve(dirname(binding.argv_prefix[0]), binding.route_source_after_activation.path);
      const routeRelation = relative(resolve(repoRoot), routeSourcePath);
      if (routeRelation === ".." || routeRelation.startsWith(`..${sep}`) || isAbsolute(routeRelation)) {
        throw new Error(`${profileSurface} SessionStart route source escapes the repository`);
      }
      const routeSource = normalizeLf(readFileSync(routeSourcePath, "utf8"));
      if (!routeSource.includes("<!-- AGDF-REQUEST-ACTIVATION-OPERATIONS:START -->")
          || !routeSource.includes("<!-- AGDF-REQUEST-ACTIVATION-OPERATIONS:END -->")
          || extractKernel(routeSource, `${profileSurface} on-demand route source`) !== canonicalKernel) {
        throw new Error(`${profileSurface} SessionStart route source does not expose the canonical operation catalog`);
      }
    }
    components.push({
      kind: profile.eager_kind === "session_start" ? "session_start" : "bootstrap",
      source: profile.eager_source,
      content: eagerContent,
    });
    if (profile.eager_kind === "opencode") {
      const dynamicContent = await openCodeContext(repoRoot, profile, sandbox);
      if (dynamicContent.includes(KERNEL_START) || dynamicContent.includes(KERNEL_END)) {
        throw new Error("OpenCode dynamic context must not duplicate the Request Activation kernel");
      }
      validateDispatcherBinding(dynamicContent, profileSurface, "OpenCode active dynamic context");
      components.push({ kind: "active_dynamic_context", source: profile.dynamic_source, content: dynamicContent });
    }

    let selectedBody = null;
    for (const { slug } of skills) {
      const relativePath = `${profile.skill_root}/${profile.skill_prefix}${slug}/SKILL.md`;
      const parsed = parseSkill(readSource(repoRoot, relativePath), `${profileSurface} ${slug} skill`);
      if (parsed.name !== `${profile.skill_prefix}${slug}`) {
        throw new Error(`${profileSurface} discovery name does not match registered skill ${slug}`);
      }
      components.push({ kind: "discovery", source: relativePath, content: parsed.description });
      if (slug === instructionSkill) {
        if (extractKernel(parsed.body, `${profileSurface} ${slug} skill`) !== canonicalKernel) {
          throw new Error(`${profileSurface} ${slug} skill does not contain the canonical Request Activation kernel`);
        }
        selectedBody = { kind: "selected_skill", source: relativePath, content: parsed.body };
      }
    }
    if (!selectedBody) throw new Error(`composed-profile instruction skill is unavailable: ${instructionSkill}`);
    components.push(selectedBody);

    const fingerprint = createHash("sha256");
    for (const component of components) fingerprint.update(component.kind).update("\0").update(component.source).update("\0").update(component.content).update("\0");
    return Object.freeze({
      profile_surface: profileSurface,
      evidence_plane: config.evidence_plane,
      loaded_profile: config.loaded_profile,
      fingerprint: `sha256:${fingerprint.digest("hex")}`,
      model_instructions: components.map(({ content }) => content).join("\n\n"),
      components: components.map((component) => Object.freeze({
        kind: component.kind,
        source: component.source,
        normalized_bytes: Buffer.byteLength(component.content, "utf8"),
        fingerprint: digestComponent(component),
      })),
    });
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}
