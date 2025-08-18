import { useEffect, useState, useRef } from "react";
import { cn } from "../../lib/utils";

interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export default function AnimatedCounter({
  value,
  duration = 1000,
  className,
  prefix = "",
  suffix = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef<number | string>(value);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (typeof value === "number" && typeof prevValueRef.current === "number") {
      const startValue = prevValueRef.current;
      const endValue = value;
      const startTime = performance.now();

      setIsAnimating(true);

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (endValue - startValue) * easeOutQuart;

        setDisplayValue(currentValue);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      setDisplayValue(typeof value === "number" ? value : 0);
    }

    prevValueRef.current = value;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formatValue = (val: number) => {
    if (decimals > 0) {
      return val.toFixed(decimals);
    }
    return Math.round(val).toLocaleString();
  };

  return (
    <span
      className={cn(
        "transition-all duration-300",
        isAnimating && "scale-105",
        className
      )}
    >
      {prefix}
      {typeof value === "number" ? formatValue(displayValue) : value}
      {suffix}
    </span>
  );
}
