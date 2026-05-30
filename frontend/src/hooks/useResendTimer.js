import { useState, useEffect, useCallback } from "react";

export default function useResendTimer(seconds = 60) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const id = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const startTimer = useCallback(() => {
    setRemaining(seconds);
  }, [seconds]);

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
