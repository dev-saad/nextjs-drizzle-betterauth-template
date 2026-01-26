"use client";

import {
 clearState,
 loadState,
 PersistConfig,
 saveState,
} from "@/lib/utils/persist"; // Ensure this matches your file path (form-persist.ts vs persist.ts)
import { useEffect, useRef } from "react";

/**
 * Deep merge helper that properly handles nested objects
 */
function deepMerge(target: any, source: any): any {
 const output = { ...target };

 if (isObject(target) && isObject(source)) {
  Object.keys(source).forEach((key) => {
   if (isObject(source[key])) {
    if (!(key in target)) {
     Object.assign(output, { [key]: source[key] });
    } else {
     output[key] = deepMerge(target[key], source[key]);
    }
   } else {
    Object.assign(output, { [key]: source[key] });
   }
  });
 }

 return output;
}

function isObject(item: any): boolean {
 return item && typeof item === "object" && !Array.isArray(item);
}

/**
 * Hook to add persistence functionality to a form
 *
 * @param form - The TanStack form instance
 * @param config - Persistence configuration
 */
export function useFormPersist<TFormData>(
 form: {
  state: { values: TFormData };
  setFieldValue: any;
  store: { subscribe: (cb: () => void) => () => void };
 } & Record<string, any>,
 config?: PersistConfig,
) {
 const hasRestoredRef = useRef(false);
 const isRestoringRef = useRef(false);

 // Restore saved state on mount (only once)
 useEffect(() => {
  if (!config || hasRestoredRef.current) return;

  const savedState = loadState<TFormData>(config);

  if (savedState) {
   isRestoringRef.current = true;

   // Deep merge saved state with current values to preserve all fields
   const currentValues = form.state.values;
   const mergedValues = deepMerge(currentValues, savedState);

   // Set each field individually to avoid triggering full form update
   Object.keys(mergedValues).forEach((key) => {
    const value = (mergedValues as any)[key];
    if (value !== undefined) {
     form.setFieldValue(key as any, value);
    }
   });

   isRestoringRef.current = false;
  }

  hasRestoredRef.current = true;
 }, [config, form]); // Added form dependency for safety, though mostly static

 // Setup auto-save subscription
 useEffect(() => {
  if (!config) return;

  // Merge default debounce if not provided in config
  // This maintains your previous 500ms behavior
  const effectiveConfig: PersistConfig = {
   debounceMs: 500,
   ...config,
  };

  // Subscribe to form state changes
  const unsubscribe = form.store.subscribe(() => {
   // Don't save while restoring to avoid overwriting with incomplete data
   if (isRestoringRef.current) return;

   const values = form.state.values;

   // saveState now handles the debouncing internally
   saveState(effectiveConfig, values);
  });

  // Cleanup subscription
  return () => {
   unsubscribe();
  };
 }, [config, form]);

 // Return utility to manually clear persisted state
 return {
  clearPersistedState: () => {
   if (config) {
    clearState(config);
   }
  },
 };
}
