function skillNames(values, field) {
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string" || !value.trim())) {
    throw new Error(`AGDF_COPILOT_PRECEDENCE_INVALID: ${field}`);
  }
  const normalized = values.map((value) => value.trim());
  if (new Set(normalized).size !== normalized.length) throw new Error(`AGDF_COPILOT_PRECEDENCE_DUPLICATE: ${field}`);
  return new Set(normalized);
}

export function diagnoseCopilotSkillPrecedence({ declaredPluginSkills, projectSkills = [], personalSkills = [] } = {}) {
  const plugin = skillNames(declaredPluginSkills, "declaredPluginSkills");
  const project = skillNames(projectSkills, "projectSkills");
  const personal = skillNames(personalSkills, "personalSkills");
  const skills = [...plugin].sort().map((name) => {
    const projectMatch = project.has(name);
    const personalMatch = personal.has(name);
    return Object.freeze({
      name,
      effective_source: projectMatch ? "project" : personalMatch ? "personal" : "plugin",
      plugin_loaded: !projectMatch && !personalMatch,
      collisions: Object.freeze([
        ...(projectMatch ? ["project"] : []),
        ...(personalMatch ? ["personal"] : []),
      ]),
      mutation: "none",
    });
  });
  return Object.freeze({
    schema_version: 1,
    precedence: Object.freeze(["project", "personal", "plugin"]),
    skills: Object.freeze(skills),
    destructive_override: false,
  });
}
