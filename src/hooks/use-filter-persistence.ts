"use client";

import {
 clearState,
 loadState,
 saveState,
 type PersistConfig,
 type StorageType,
} from "@/lib/utils/persist";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface UseFilterPersistenceProps {
 key?: string;
 storage?: StorageType;
 enabled?: boolean;
}

export function useFilterPersistence({
 key,
 storage = "localStorage",
 enabled = false,
}: UseFilterPersistenceProps) {
 const searchParams = useSearchParams();
 const router = useRouter();
 const pathname = usePathname();

 // Start unhydrated if enabled
 const [isHydrated, setIsHydrated] = useState(!enabled);
 const isRestoring = useRef(false);

 const persistenceKey = key || `filter-state-${pathname}`;
 const config: PersistConfig = {
  key: persistenceKey,
  storage,
 };

 // 1. Mount: Check & Restore
 useEffect(() => {
  if (!enabled) return;

  // If URL already has params, we assume user linked directly -> Trust URL, don't restore.
  if (searchParams.size > 0) {
   setIsHydrated(true);
   return;
  }

  // Try to load saved query
  const savedQuery = loadState<string>(config);

  if (savedQuery && typeof savedQuery === "string") {
   // 🛑 Flag that we are restoring
   isRestoring.current = true;

   // Trigger update
   router.replace(`${pathname}?${savedQuery}`);

   // ⚠️ DO NOT setHydrated(true) yet.
   // We wait for the URL to actually update in the next useEffect.
  } else {
   // Nothing to restore, we are ready.
   setIsHydrated(true);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [enabled, persistenceKey, pathname, router]);

 // 2. Watch for URL updates to complete hydration
 useEffect(() => {
  if (!enabled || isHydrated) return;

  // If we were restoring, and the URL is now populated (or we decided it failed), finish hydration.
  if (isRestoring.current) {
   // Simple check: if params exist now, we are done.
   // (You could do a stricter check matching savedQuery, but this is usually sufficient)
   if (searchParams.size > 0) {
    isRestoring.current = false;
    setIsHydrated(true);
   }
  }
 }, [searchParams, enabled, isHydrated]);

 // 3. Save updates (Only after hydration)
 useEffect(() => {
  if (!enabled || !isHydrated) return;

  // Don't save if we are still in the middle of a restore
  if (isRestoring.current) return;

  const currentQuery = searchParams.toString();

  if (currentQuery) {
   saveState(config, currentQuery);
  } else {
   clearState(config);
  }
 }, [searchParams, enabled, isHydrated, config]);

 return { isHydrated };
}
