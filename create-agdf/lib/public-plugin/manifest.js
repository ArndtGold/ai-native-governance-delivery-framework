function publicValues(definition) {
  const distribution = definition.publicDistribution;
  if (!distribution || distribution.schemaVersion !== 1) {
    throw new Error("AGDF_PUBLIC_PLUGIN_CONTRACT_INVALID: publicDistribution schemaVersion 1 is required");
  }
  return distribution;
}

export function createCodexPluginManifest(definition, { publicCandidate = false } = {}) {
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
      supportURL: distribution.urls.support,
      composerIcon: definition.codex.composerIcon,
      logo: definition.codex.logo,
      defaultPrompt: pluginInterface.defaultPrompt,
      brandColor: definition.brandColor,
    },
  };
  if (!publicCandidate) manifest.hooks = `./${definition.codex.hooks}`;
  return manifest;
}

export function renderCodexPluginManifest(definition, options) {
  return `${JSON.stringify(createCodexPluginManifest(definition, options), null, 2)}\n`;
}

export function createClaudePluginManifest(definition) {
  return {
    name: definition.id,
    version: definition.version,
    description: definition.longDescription,
    keywords: definition.keywords,
    homepage: definition.homepage,
    repository: definition.repository,
    license: definition.license,
    author: definition.author,
  };
}

export function renderClaudePluginManifest(definition) {
  return `${JSON.stringify(createClaudePluginManifest(definition), null, 2)}\n`;
}

export function createRepositoryCodexMarketplace(definition) {
  const distribution = publicValues(definition);
  return {
    name: definition.id,
    interface: {
      displayName: distribution.publicDisplayName,
    },
    plugins: [
      {
        name: definition.id,
        source: {
          source: "local",
          path: "./plugin",
        },
        policy: {
          installation: "AVAILABLE",
          authentication: "ON_INSTALL",
        },
        category: definition.category,
      },
    ],
  };
}

export function renderRepositoryCodexMarketplace(definition) {
  return `${JSON.stringify(createRepositoryCodexMarketplace(definition), null, 2)}\n`;
}
