import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export function RouteScrollManager() {
  const location = useLocation();

  useLayoutEffect(() => {
    if (location.hash) {
      return;
    }

    const root = document.documentElement;
    const previousInlineBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = "auto";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const frameId = window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previousInlineBehavior;
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      root.style.scrollBehavior = previousInlineBehavior;
    };
  }, [location.pathname, location.search, location.hash]);

  return null;
}
