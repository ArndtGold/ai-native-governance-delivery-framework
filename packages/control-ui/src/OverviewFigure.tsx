import { figureSvg } from '../../../plugins/agdf/host-templates/claude/companion/figure.mjs';
import { useReducedFigureMotion } from './RunFigure';

/** A decorative overview companion; its pose does not represent a run state. */
export function OverviewFigure({ visible = true }: { visible?: boolean }) {
  const still = useReducedFigureMotion() || !visible;
  const svg = figureSvg('laeuft', { still, tablet: true });
  return <img className="overview-figure" alt="" aria-hidden="true" width={100} height={70} src={`data:image/svg+xml,${encodeURIComponent(svg)}`}/>;
}
