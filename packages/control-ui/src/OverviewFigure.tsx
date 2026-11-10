import { figureSvg } from '../../../plugins/agdf/host-templates/claude/companion/figure.mjs';
import { useReducedFigureMotion } from './RunFigure';

/** A decorative overview companion; its pose does not represent a run state. */
export function OverviewFigure({ visible = true }: { visible?: boolean }) {
  const still = useReducedFigureMotion() || !visible;
  const movement = still ? '' : '<animateTransform attributeName="transform" type="rotate" values="-8 151 82;-8 151 82;-11 151 82;-8 151 82;-8 151 82" keyTimes="0;0.73;0.76;0.79;1" dur="29s" repeatCount="indefinite"/>';
  const tap = still ? '' : '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;-3 -3;0 0;0 0" keyTimes="0;0.75;0.77;0.79;1" dur="29s" repeatCount="indefinite"/>';
  const tablet = `<g data-accessory="overview-tablet" transform="rotate(-8 151 82)">${movement}<rect x="132" y="61" width="43" height="36" rx="5" fill="#213a43" stroke="#a9c3ca" stroke-width="2"/><rect x="136" y="65" width="35" height="27" rx="2" fill="#416a6c"/><path d="M141 72h20M141 77h15M141 82h18" stroke="#9edbd1" stroke-width="1.5" stroke-linecap="round"/><g>${tap}<rect x="135" y="86" width="13" height="9" rx="4" fill="url(#metal)" stroke="#41616a" stroke-width="1.5"/></g></g>`;
  const svg = figureSvg('laeuft', { still }).replace('</svg>', `${tablet}</svg>`);
  return <img className="overview-figure" alt="" aria-hidden="true" width={100} height={70} src={`data:image/svg+xml,${encodeURIComponent(svg)}`}/>;
}
