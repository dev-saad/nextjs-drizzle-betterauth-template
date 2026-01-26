"use client";

import { createContext, ReactNode, use, useContext } from "react";

// Generic type for the methods/promises map
type ServerActionsMap = Record<string, Promise<any>>;

interface ServerActionContextType {
 promises: ServerActionsMap;
}

const ServerActionContext = createContext<ServerActionContextType | undefined>(
 undefined
);

export function PromiseProvider({
 children,
 promises,
}: {
 children: ReactNode;
 promises: ServerActionsMap;
}) {
 return (
  <ServerActionContext.Provider value={{ promises }}>
   {children}
  </ServerActionContext.Provider>
 );
}

/**
 * Custom hook to consume a server action promise from the context.
 * It uses React's `use` hook to unwrap the promise.
 *
 * @param key The key of the promise to retrieve
 * @template T The expected type of the resolved promise value
 */
export function usePromise<T = any>(key: string): T {
 const context = useContext(ServerActionContext);
 if (context === undefined) {
  throw new Error("usePromise must be used within a PromiseProvider");
 }

 const promise = context.promises[key];
 if (!promise) {
  throw new Error(`No server action promise found for key: ${key}`);
 }

 return use(promise) as T;
}
