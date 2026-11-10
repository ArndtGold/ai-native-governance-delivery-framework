declare module '*claude/companion/figure.mjs' {
  type Figure = import('./types').CompanionFigure;
  export interface FigureObservation {
    scope: string;
    state: string;
    current: boolean;
    mood: string;
    gate?: string;
    gesture: boolean;
    sequence: number;
  }
  export function observeFigure(previous: FigureObservation | null, input: {
    scope: string | null; figure?: Figure; current: boolean;
  }): FigureObservation | null;
  export function figureSvg(mood: string, options?: { still?: boolean; title?: string; gate?: string; gesture?: boolean; sequence?: number }): string;
}
