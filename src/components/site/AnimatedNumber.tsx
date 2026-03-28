import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  className,
  padStart = 0,
  enabled = true,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  padStart?: number;
  enabled?: boolean;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.8 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(0);
      return;
    }

    if (!isInView) {
      return;
    }

    let frameId = 0;
    let startTime: number | null = null;
    const duration = 1400;

    const update = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      setDisplayValue(Math.round(value * easedProgress));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(update);
      }
    };

    frameId = window.requestAnimationFrame(update);

    return () => window.cancelAnimationFrame(frameId);
  }, [enabled, isInView, value]);

  const formattedValue = padStart > 0
    ? String(displayValue).padStart(padStart, "0")
    : String(displayValue);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
