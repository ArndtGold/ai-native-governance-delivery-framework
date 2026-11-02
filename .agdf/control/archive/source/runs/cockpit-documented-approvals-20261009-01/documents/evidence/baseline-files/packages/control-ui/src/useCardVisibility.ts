import { useEffect, useState, type RefObject } from 'react';

// Document visibility alone does not cover a chat card scrolled out of view.
export function useCardVisibility(heading: RefObject<HTMLHeadingElement | null>, compact: boolean) {
  const [intersecting, setIntersecting] = useState(() => !compact || typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    if (!compact || typeof IntersectionObserver === 'undefined') { setIntersecting(true); return; }
    const card = heading.current?.closest('.compact-cockpit');
    setIntersecting(false);
    if (!card) return;
    const observer = new IntersectionObserver(entries => {
      setIntersecting(entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0));
    });
    observer.observe(card);
    return () => observer.disconnect();
  }, [heading, compact]);
  return !compact || intersecting;
}
