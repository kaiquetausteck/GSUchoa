import { useEffect, useRef, useState } from "react";

type PanelAnimatedNumberProps = {
  className?: string;
  duration?: number;
  formatter?: (value: number) => string;
  value: number;
};

export function PanelAnimatedNumber({
  className,
  duration = 650,
  formatter = (value) => value.toString(),
  value,
}: PanelAnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    previousValueRef.current = value;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(endValue);
      return;
    }

    if (Math.abs(endValue - startValue) < 0.001) {
      setDisplayValue(endValue);
      return;
    }

    let frameId = 0;
    let startTime: number | null = null;

    const update = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      setDisplayValue(startValue + (endValue - startValue) * easedProgress);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(update);
      }
    };

    frameId = window.requestAnimationFrame(update);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [duration, value]);

  return <span className={className}>{formatter(displayValue)}</span>;
}
