"use client";

import { UserPreferences } from "@/lib/types/user";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

export function ThemeSync({
 userTheme,
}: {
 userTheme?: UserPreferences["theme"];
}) {
 const { setTheme, theme } = useTheme();
 const mounted = useRef(false);

 useEffect(() => {
  if (!mounted.current) {
   if (userTheme && userTheme !== theme) {
    setTheme(userTheme);
   }
   mounted.current = true;
  }
 }, [userTheme, setTheme, theme]);

 return null;
}
