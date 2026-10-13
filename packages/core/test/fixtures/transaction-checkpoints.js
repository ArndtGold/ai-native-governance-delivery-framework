// Existing process-interruption hooks. This is not physical power-loss evidence.
export const atomicStages = ['temp_opened', 'temp_written', 'after_file_sync', 'before_rename', 'after_rename', 'after_directory_sync'];
export const intentStages = [...atomicStages.map(stage => 'intent_' + stage), 'intent'];
export const commitStages = [...atomicStages.map(stage => 'run_' + stage), 'run', ...atomicStages.map(stage => 'backlog_' + stage), 'backlog', 'retired'];
export const archiveStages = ['archive_intent', ...atomicStages.map(stage => 'archive_' + stage), 'archive_file',
  ...atomicStages.map(stage => 'manifest_' + stage), 'archive_synced', 'archive_published'];
export const outputStages = [...atomicStages.map(stage => 'output_' + stage), 'output'];
export const beforeIntent = stage => intentStages.slice(0, 4).includes(stage);
export const beforeRunCommit = stage => stage.startsWith('intent') || stage.startsWith('archive') || stage.startsWith('manifest') || stage.startsWith('output')
  || commitStages.slice(0, 4).includes(stage);
