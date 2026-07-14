import { useEffect, useState } from 'react';

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((value) => (value <= 0 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return seconds;
}
