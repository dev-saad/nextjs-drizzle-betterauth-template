/**
 * Storage Persistence Utilities
 *
 * Generic adapters and utilities for persisting state
 * across page reloads using localStorage, sessionStorage, or cookies.
 */

export type StorageType = "localStorage" | "sessionStorage" | "cookie";

export interface CookieOptions {
 maxAge?: number; // Cookie expiration in seconds
 path?: string; // Cookie path (default: '/')
 sameSite?: "strict" | "lax" | "none";
 secure?: boolean; // Only send cookie over HTTPS
}

export interface PersistConfig {
 key: string; // Storage key name (required)
 storage?: StorageType; // Storage type (default: 'localStorage')
 debounceMs?: number; // Debounce delay in ms. If undefined, saves immediately.
 exclude?: string[]; // Field paths to exclude from persistence
 cookieOptions?: CookieOptions; // Only for cookie storage
}

// ============================================================================
// Storage Adapter Interface & Implementations
// ============================================================================

interface StorageAdapter {
 getItem(key: string): string | null;
 setItem(key: string, value: string): void;
 removeItem(key: string): void;
}

class LocalStorageAdapter implements StorageAdapter {
 getItem(key: string): string | null {
  try {
   if (typeof window === "undefined") return null;
   return localStorage.getItem(key);
  } catch (error) {
   console.error("LocalStorage getItem error:", error);
   return null;
  }
 }

 setItem(key: string, value: string): void {
  try {
   if (typeof window === "undefined") return;
   localStorage.setItem(key, value);
  } catch (error) {
   console.error("LocalStorage setItem error:", error);
  }
 }

 removeItem(key: string): void {
  try {
   if (typeof window === "undefined") return;
   localStorage.removeItem(key);
  } catch (error) {
   console.error("LocalStorage removeItem error:", error);
  }
 }
}

class SessionStorageAdapter implements StorageAdapter {
 getItem(key: string): string | null {
  try {
   if (typeof window === "undefined") return null;
   return sessionStorage.getItem(key);
  } catch (error) {
   console.error("SessionStorage getItem error:", error);
   return null;
  }
 }

 setItem(key: string, value: string): void {
  try {
   if (typeof window === "undefined") return;
   sessionStorage.setItem(key, value);
  } catch (error) {
   console.error("SessionStorage setItem error:", error);
  }
 }

 removeItem(key: string): void {
  try {
   if (typeof window === "undefined") return;
   sessionStorage.removeItem(key);
  } catch (error) {
   console.error("SessionStorage removeItem error:", error);
  }
 }
}

class CookieAdapter implements StorageAdapter {
 private options: CookieOptions;

 constructor(options: CookieOptions = {}) {
  this.options = {
   path: "/",
   sameSite: "lax",
   ...options,
  };
 }

 getItem(key: string): string | null {
  try {
   if (typeof document === "undefined") return null;
   const name = encodeURIComponent(key) + "=";
   const cookies = document.cookie.split(";");
   for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name)) {
     return decodeURIComponent(cookie.substring(name.length));
    }
   }
   return null;
  } catch (error) {
   console.error("Cookie getItem error:", error);
   return null;
  }
 }

 setItem(key: string, value: string): void {
  try {
   if (typeof document === "undefined") return;
   const encodedKey = encodeURIComponent(key);
   const encodedValue = encodeURIComponent(value);
   let cookie = `${encodedKey}=${encodedValue}`;
   if (this.options.maxAge !== undefined)
    cookie += `; max-age=${this.options.maxAge}`;
   if (this.options.path) cookie += `; path=${this.options.path}`;
   if (this.options.sameSite) cookie += `; samesite=${this.options.sameSite}`;
   if (this.options.secure) cookie += "; secure";
   document.cookie = cookie;
  } catch (error) {
   console.error("Cookie setItem error:", error);
  }
 }

 removeItem(key: string): void {
  try {
   if (typeof document === "undefined") return;
   const encodedKey = encodeURIComponent(key);
   document.cookie = `${encodedKey}=; max-age=0; path=${this.options.path}`;
  } catch (error) {
   console.error("Cookie removeItem error:", error);
  }
 }
}

function createStorageAdapter(
 type: StorageType = "localStorage",
 cookieOptions?: CookieOptions,
): StorageAdapter {
 switch (type) {
  case "localStorage":
   return new LocalStorageAdapter();
  case "sessionStorage":
   return new SessionStorageAdapter();
  case "cookie":
   return new CookieAdapter(cookieOptions);
  default:
   return new LocalStorageAdapter();
 }
}

// ============================================================================
// Generic Persistence Utilities
// ============================================================================

// Global map to track active debounce timers per storage key
const saveTimeouts = new Map<string, NodeJS.Timeout>();

function excludeFields<T extends Record<string, any>>(
 obj: T,
 excludePaths: string[] = [],
): Partial<T> {
 if (!excludePaths.length) return obj;
 const result = { ...obj };
 for (const path of excludePaths) {
  const keys = path.split(".");
  let current: any = result;
  for (let i = 0; i < keys.length - 1; i++) {
   if (current[keys[i]] === undefined) break;
   current = current[keys[i]];
  }
  if (current && keys.length > 0) {
   delete current[keys[keys.length - 1]];
  }
 }
 return result;
}

/**
 * Generic: Save any value to storage
 * Supports debouncing if `debounceMs` is provided in config.
 */
export function saveState<T>(config: PersistConfig, value: T): void {
 const adapter = createStorageAdapter(config.storage, config.cookieOptions);

 // Define the actual save operation
 const performSave = () => {
  try {
   const dataToSave =
    typeof value === "object" && value !== null
     ? excludeFields(value as Record<string, any>, config.exclude)
     : value;

   const serialized = JSON.stringify(dataToSave);
   adapter.setItem(config.key, serialized);
  } catch (error) {
   console.error("Failed to save state:", error);
  }
 };

 // Handle Debounce
 if (config.debounceMs && config.debounceMs > 0) {
  // 1. Clear any pending save for this specific key
  if (saveTimeouts.has(config.key)) {
   clearTimeout(saveTimeouts.get(config.key));
  }

  // 2. Set new timeout
  const timeoutId = setTimeout(() => {
   performSave();
   saveTimeouts.delete(config.key); // Cleanup map after execution
  }, config.debounceMs);

  saveTimeouts.set(config.key, timeoutId);
 } else {
  // No debounce: save immediately
  performSave();
 }
}

/**
 * Generic: Load any value from storage
 */
export function loadState<T>(config: PersistConfig): T | null {
 const adapter = createStorageAdapter(config.storage, config.cookieOptions);
 try {
  const serialized = adapter.getItem(config.key);
  if (!serialized) return null;
  return JSON.parse(serialized) as T;
 } catch (error) {
  console.error("Failed to load state:", error);
  return null;
 }
}

/**
 * Generic: Clear value from storage
 */
export function clearState(config: PersistConfig): void {
 // If there is a pending debounced save, cancel it first
 if (saveTimeouts.has(config.key)) {
  clearTimeout(saveTimeouts.get(config.key));
  saveTimeouts.delete(config.key);
 }

 const adapter = createStorageAdapter(config.storage, config.cookieOptions);
 try {
  adapter.removeItem(config.key);
 } catch (error) {
  console.error("Failed to clear state:", error);
 }
}

/**
 * @deprecated Use `saveState` instead. Kept for backward compatibility.
 */
export const saveFormState = saveState;

/**
 * @deprecated Use `loadState` instead. Kept for backward compatibility.
 */
export const loadFormState = loadState;
