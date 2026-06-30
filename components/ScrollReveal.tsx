'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    // Reset all reveals on page change so they animate again
    document.querySelectorAll<HTMLElement>('[data-reveal].revealed').forEach((el) => {
      el.classList.remove('revealed');
      el.style.transitionDelay = '';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.transitionDelay = `${el.dataset.delay ?? '0'}ms`;
            el.classList.add('revealed');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const observe = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.revealed)').forEach((el) => observer.observe(el));
    };

    observe();
    const t = setTimeout(observe, 80);
    return () => { clearTimeout(t); observer.disconnect(); };
  }, [pathname]);

  return null;
}
