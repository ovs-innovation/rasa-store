import { useState, useEffect, useCallback } from "react";

export default function useResendTimer(defaultSeconds = 60) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const id = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const startTimer = useCallback(
    (overrideSeconds) => {
      const secs =
        typeof overrideSeconds === "number" && overrideSeconds > 0
          ? Math.ceil(overrideSeconds)
          : defaultSeconds;
      setRemaining(secs);
    },
    [defaultSeconds]
  );

  const resetTimer = useCallback(() => {
    setRemaining(0);
  }, []);

  return {
    remaining,
    startTimer,
    resetTimer,
    canResend: remaining <= 0,
    formatted: `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`,
  };
}
