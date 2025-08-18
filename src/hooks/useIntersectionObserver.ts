import { useEffect, useRef, useState } from "react";
import { createIntersectionObserver } from "../lib/utils";

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = createIntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const isVisible = entry.isIntersecting;
        
        if (options.triggerOnce && hasTriggered) {
          return;
        }

        if (isVisible && options.triggerOnce) {
          setHasTriggered(true);
        }

        setIsIntersecting(isVisible);
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || "50px",
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options.threshold, options.rootMargin, options.triggerOnce, hasTriggered]);

  return { elementRef, isIntersecting };
}
