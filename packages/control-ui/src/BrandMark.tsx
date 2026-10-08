import logo from '../../../pages/public/assets/agdf-logo.svg?inline';

// Keep the Pages asset as the sole logo source; Vite embeds it in the MCP HTML.
export function BrandMark({ className }: { className: string }) {
  return <img className={className} src={logo} alt="" aria-hidden="true"/>;
}
