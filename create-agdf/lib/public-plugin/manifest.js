function publicValues(definition) {
  const distribution = definition.publicDistribution;
  if (!distribution || distribution.schemaVersion !== 1) {
    throw new Error("AGDF_PUBLIC_PLUGIN_CONTRACT_INVALID: publicDistribution schemaVersion 1 is required");
  }
  return distribution;
}

// Codex reads the plugin-local MCP declaration only from the runtime plugin, where the installer has
// written absolute paths; the source plugin and public candidates carry no runtime and no declaration.
export const CODEX_RUNTIME_MCP_SERVERS = "./mcp/codex.mcp.json";

export function createCodexPluginManifest(definition, { publicCandidate = false, runtimeProfile = false } = {}) {
  const distribution = publicValues(definition);
  const pluginInterface = publicCandidate ? {
    displayName: distribution.publicDisplayName,
    shortDescription: distribution.shortDescription,
    longDescription: definition.longDescription,
    defaultPrompt: distribution.defaultPrompt,
  } : {
    displayName: definition.displayName,
    shortDescription: definition.description,
    longDescription: definition.longDescription,
    defaultPrompt: definition.codex.defaultPrompt,
  };
  const manifest = {
    name: definition.id,
    version: definition.version,
    description: definition.description,
    author: definition.author,
    homepage: definition.homepage,
    repository: definition.repository,
    license: definition.license,
    keywords: definition.keywords,
    skills: definition.codex.skills,
    ...(runtimeProfile && !publicCandidate ? { mcpServers: CODEX_RUNTIME_MCP_SERVERS } : {}),
    interface: {
      displayName: pluginInterface.displayName,
      shortDescription: pluginInterface.shortDescription,
      longDescription: pluginInterface.longDescription,
      developerName: distribution.developerName,
      category: distribution.category,
      capabilities: definition.codex.capabilities,
      websiteURL: distribution.urls.website,
      privacyPolicyURL: distribution.urls.privacy,
      termsOfServiceURL: distribution.urls.terms,
      composerIcon: definition.codex.composerIcon,
      logo: definition.codex.logo,
      defaultPrompt: pluginInterface.defaultPrompt,
      brandColor: definition.brandColor,
    },
  };
  return manifest;
}

export function renderCodexPluginManifest(definition, options) {
  return `${JSON.stringify(createCodexPluginManifest(definition, options), null, 2)}\n`;
}

// The runtime plugin declares the plugin-local AGDF MCP server; the source plugin ships no runtime.
export function createClaudePluginManifest(definition, { runtimeProfile = false } = {}) {
  return {
    name: definition.id,
    version: definition.version,
    description: definition.longDescription,
    keywords: definition.keywords,
    homepage: definition.homepage,
    repository: definition.repository,
    license: definition.license,
    author: definition.author,
    ...(runtimeProfile ? { mcpServers: definition.claude.mcpServers } : {}),
  };
}

export function renderClaudePluginManifest(definition, options) {
  return `${JSON.stringify(createClaudePluginManifest(definition, options), null, 2)}\n`;
}

function requireCopilotPath(value, field) {
  if (typeof value !== "string" || !value || value.startsWith("/") || value.includes("..") || value.includes("\\")) {
    throw new Error(`AGDF_COPILOT_PLUGIN_CONTRACT_INVALID: ${field} must be a relative POSIX path`);
  }
  return value;
}

export function createCopilotPluginManifest(definition) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(definition.id ?? "") || definition.id.length > 64) {
    throw new Error("AGDF_COPILOT_PLUGIN_CONTRACT_INVALID: kebab-case name is required");
  }
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(definition.version ?? "")) {
    throw new Error("AGDF_COPILOT_PLUGIN_CONTRACT_INVALID: semantic version is required");
  }
  const copilot = definition.copilot ?? {};
  return {
    name: definition.id,
    version: definition.version,
    description: definition.description,
    author: definition.author,
    homepage: definition.homepage,
    repository: definition.repository,
    license: definition.license,
    keywords: definition.keywords,
    category: definition.category,
    skills: requireCopilotPath(copilot.skills, "skills"),
    hooks: requireCopilotPath(copilot.hooks, "hooks"),
  };
}

export function renderCopilotPluginManifest(definition) {
  return `${JSON.stringify(createCopilotPluginManifest(definition), null, 2)}\n`;
}
