import { useEffect, useState } from "react";

/** Tailwind's `lg` breakpoint — below it counts as "mobile/tablet", at or above as "laptop/desktop". */
const BREAKPOINT_PX = 1024;

/** Reactive, not a one-time read — rotating a tablet or resizing a window flips it live. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < BREAKPOINT_PX,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT_PX - 1}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}
