declare module '*claude/companion/figure.mjs' {
  type Figure = import('./types').CompanionFigure;
  export interface FigureObservation {
    scope: string;
    state: string;
    current: boolean;
    mood: string;
    gate?: string;
    gesture: boolean;
    seenCurrent: boolean;
    sequence: number;
  }
  export function observeFigure(previous: FigureObservation | null, input: {
    scope: string | null; figure?: Figure; current: boolean;
  }): FigureObservation | null;
  export function figureSvg(mood: string, options?: { still?: boolean; title?: string; gate?: string; workGate?: string; gesture?: boolean; sequence?: number; showcase?: boolean; smile?: boolean; tablet?: boolean }): string;
}

declare module '*core/lib/control-inspect/work-situation.js' {
  export interface WorkSituation { kind: string; code: string; en: string; de: string }
  export function projectWorkSituation(input: { assessment?: string; gate?: string; blockingReason?: string; missingApproval?: string; closureOutcome?: string }): WorkSituation;
}

declare module '*claude/companion/gate-bar.mjs' {
  export interface GateMark { gate: string; mark: 'done' | 'current' | 'open' }
  export function gateMarks(run: { path: import('./types').CompanionStatus['path']; gate?: string; route: string; lifecycle: string | null }):
    GateMark[];
  export function fullGateBar(marks: GateMark[]): string;
  export function condensedGateBar(marks: GateMark[]): string;
}

declare module '*core/lib/companion/activity.js' {
  export function matchesActivity(record: import('./types').CompanionActivity | undefined,
    scope: Partial<import('./types').ActivityScope>, now: number): boolean;
}

declare module '*claude/companion/view.mjs' {
  export function activityOf(derived: { reason: { key: 'building' | 'working'; gate: string } }, run: { gate: string },
    isTurnActive: boolean, t: (path: string, params?: Record<string, string>) => string, title: (gate: string) => string):
    { label: string; turn: { who: string; what: string } } | null;
  export function activityLabel(gate: string, isTurnActive: boolean,
    t: (path: string, params: Record<string, string>) => string, title: (gate: string) => string): string;
}

declare module '*claude/companion/localization.mjs' {
  interface CompanionLabels { fallbackLocale: string; locales: Record<string, unknown> }
  export function companionLabels(registry: { fallbackLocale: string; locales: Record<string, { companion?: unknown }> }): CompanionLabels;
  export function label(labels: CompanionLabels, locale: string, path: string, params?: Record<string, string>): string;
}
