// The public projection expands only eligible omissions. Complete Core contracts
// still validate the adapter-produced envelope, including every explicit value.
export function projectMcpInputSchema(complete) {
  const schema = structuredClone(complete);
  if (Array.isArray(schema.required)) schema.required = schema.required.filter(key => !['presentation_language', 'working_directory', 'schema_version', 'assurance'].includes(key));
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (value.properties?.route?.enum?.slice().sort().join(',') === 'automatic,fallback,markdown' && Array.isArray(value.required))
      value.required = value.required.filter(key => key !== 'route');
    Object.values(value).forEach(visit);
  }
  visit(schema);
  return schema;
}
