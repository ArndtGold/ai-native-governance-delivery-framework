export const SUMMARY_KINDS: readonly string[];
export const SUMMARY_LABELS: Readonly<Record<string, readonly string[]>>;
export function summaryLabel(kind: string, language?: string): string;
