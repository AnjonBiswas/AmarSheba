import { useEffect, useRef, useState } from 'react';

export function useScrollReveal() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return undefined;
    }

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
