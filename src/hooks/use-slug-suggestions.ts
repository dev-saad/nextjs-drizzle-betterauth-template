"use client";

import { getSlugSuggestions } from "@/actions/server/organization.controllers";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useCallback, useEffect, useState } from "react";

export function useSlugSuggestions(initialName: string = "") {
 const [name, setName] = useState(initialName);
 const [slug, setSlug] = useState("");
 const [isLoading, setIsLoading] = useState(false);
 const [suggestions, setSuggestions] = useState<string[]>([]);
 const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

 // Debounce the name input
 const [debouncedName] = useDebouncedValue(name, { wait: 500 });

 const checkSlug = useCallback(async (currentName: string) => {
  if (!currentName) {
   setSuggestions([]);
   setIsSlugAvailable(null);
   return;
  }

  setIsLoading(true);
  try {
   const { data } = await getSlugSuggestions({
    name: currentName,
   });
   if (data) {
    if (data.originalAvailable) {
     setSlug(data.baseSlug);
     setIsSlugAvailable(true);
     setSuggestions([]);
    } else {
     // If original alias not available, keep it as "slug" but show it's taken (by not setting isSlugAvailable true or similar logic?
     // Actually, if taken, we usually want to show suggestions.
     // The requirement: "If the user's typed name results in a taken slug, display the available suggestions"
     // So we set the slug to the base one (even if taken) so the form reflects it, but we offer suggestions.
     setSlug(data.baseSlug);
     setIsSlugAvailable(false);
     setSuggestions(data.suggestions);
    }
   }
  } catch (error) {
   console.error("Failed to check slug availability", error);
  } finally {
   setIsLoading(false);
  }
 }, []);

 useEffect(() => {
  checkSlug(debouncedName);
 }, [debouncedName, checkSlug]);

 return {
  name,
  setName,
  slug,
  setSlug, // Allow manual override
  isLoading,
  suggestions,
  isSlugAvailable,
  checkSlug,
 };
}
