import { useEffect, useState } from "react";

export function useTypewriter(text: string, enabled: boolean, speed: number) {
  const [visibleChars, setVisibleChars] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisibleChars(0);
      setComplete(false);
      return;
    }

    setVisibleChars(0);
    setComplete(false);

    let timeoutId = 0;

    const tick = (index: number) => {
      setVisibleChars(index);

      if (index >= text.length) {
        setComplete(true);
        return;
      }

      timeoutId = window.setTimeout(() => tick(index + 1), speed);
    };

    timeoutId = window.setTimeout(() => tick(1), speed);

    return () => window.clearTimeout(timeoutId);
  }, [enabled, speed, text]);

  return {
    value: text.slice(0, visibleChars),
    complete,
  };
}
