export const projectOperationStatusCall = input => ({ tool: 'agdf_inspect', arguments: {
  operation: 'operation-status', module: `project.initialize/${input.operation_id}`,
  presentation_language: input.presentation_language, working_directory: input.working_directory,
  primary_target: input.primary_target, target_source: input.target_source } });

