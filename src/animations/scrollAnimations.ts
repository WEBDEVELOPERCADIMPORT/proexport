/**
 * Global Scroll Animation Observer (CAD Import Inc)
 * Automatically observes any element with `[data-animate]` and adds `.is-visible`
 * when it enters the viewport. Supports Astro ClientRouter (`astro:page-load`).
 */
export function initScrollAnimations(): void {
  const animatedElements = document.querySelectorAll<HTMLElement>('[data-animate]');
  if (animatedElements.length === 0) return;

  // Fallback for environments without IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    animatedElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.05,
      rootMargin: '0px 0px -10px 0px',
    }
  );

  animatedElements.forEach((el) => {
    if (!el.classList.contains('is-visible')) {
      observer.observe(el);
    }
  });
}
