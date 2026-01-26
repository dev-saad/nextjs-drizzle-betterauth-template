import { useCallback, useEffect, useState } from "react";

export const useCooldownTimer = (initialTimer: number = 60) => {
 const [cooldown, setCooldown] = useState(0);

 const startCooldown = useCallback(
  (time?: number) => {
   setCooldown(time ?? initialTimer);
  },
  [initialTimer]
 );

 const resetCooldown = useCallback(() => {
  setCooldown(0);
 }, []);

 useEffect(() => {
  if (cooldown <= 0) return;

  const intervalId = setInterval(() => {
   setCooldown((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(intervalId);
 }, [cooldown]);

 const isCooldown = cooldown > 0;

 return {
  cooldown,
  isCooldown,
  startCooldown,
  resetCooldown,
 };
};
