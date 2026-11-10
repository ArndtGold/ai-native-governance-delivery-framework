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
  export function figureSvg(mood: string, options?: { still?: boolean; title?: string; gate?: string; workGate?: string; gesture?: boolean; sequence?: number; showcase?: boolean }): string;
}

declare module '*core/lib/control-inspect/work-situation.js' {
  export interface WorkSituation { kind: string; code: string; en: string; de: string }
  export function projectWorkSituation(input: { assessment?: string; gate?: string; blockingReason?: string; missingApproval?: string; closureOutcome?: string }): WorkSituation;
}
