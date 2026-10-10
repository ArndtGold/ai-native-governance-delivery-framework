export const BACKLOG_SUMMARY_FIELDS: readonly string[];
export function validBacklogSummary(value: unknown): boolean;

export function validWorkSummary(value: unknown, runId: string): boolean;
