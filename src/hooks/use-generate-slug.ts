"use client";

import { getSlugSuggestions } from "@/actions/server/organization.controllers";
import { useState } from "react";
import { toast } from "sonner";

export function useGenerateSlug() {
 const [isGenerating, setIsGenerating] = useState(false);

 const generateSlug = async (name: string) => {
  if (!name) {
   toast.error("Please enter a name first");
   return null;
  }

  setIsGenerating(true);
  try {
   const { data } = await getSlugSuggestions({ name });

   if (!data) {
    toast.error("Failed to generate slug");
    return null;
   }

   if (data.originalAvailable) {
    toast.success("Slug generated successfully");
    return data.baseSlug;
   }

   if (data.suggestions.length > 0) {
    // Pick a random suggestion from the list to ensure variety on repeated clicks
    const randomIndex = Math.floor(Math.random() * data.suggestions.length);
    const suggestion = data.suggestions[randomIndex];
    toast.success("Slug generated (original was taken)");
    return suggestion;
   }

   // Fallback if no suggestions
   toast.info("Slug generated but might be taken");
   return data.baseSlug;
  } catch (error) {
   console.error(error);
   toast.error("Failed to generate slug");
   return null;
  } finally {
   setIsGenerating(false);
  }
 };

 return {
  generateSlug,
  isGenerating,
 };
}
