import { clsx, type ClassValue } from "clsx";
import { endOfDay, startOfDay } from "date-fns";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export function copyToClipboard(
 text: string,
 options: { message?: string } = {},
) {
 const { message = "Copied to clipboard" } = options;
 navigator.clipboard.writeText(text);
 toast.success(message);
}

export function getInitials(name: string) {
 return name
  .split(" ")
  .map((n) => n[0])
  .join("")
  .substring(0, 2)
  .toUpperCase();
}

export function parseDateRange(rangeStr: string | undefined) {
 if (!rangeStr) return undefined;

 const [startStr, endStr] = rangeStr.split(",");

 // 1. Parse 'From' (Start of day is default, so this is fine)
 const from = startStr ? startOfDay(new Date(Number(startStr))) : undefined;

 // 2. Parse 'To' AND set it to End of Day
 let to = endStr ? endOfDay(new Date(Number(endStr))) : undefined;

 return { from, to };
}
