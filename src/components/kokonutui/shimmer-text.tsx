"use client";

/**
 * @author: @dorian_baffier
 * @description: Shimmer Text
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { cn } from "@/lib/utils";
import * as m from "motion/react-m";

interface Text_01Props {
 text: string;
 className?: string;
 color?: string;
}

export default function ShimmerText({
 text = "Text Shimmer",
 className,
 color,
}: Text_01Props) {
 const colorClass =
  color === "primary"
   ? "from-primary/95 via-primary/50 to-primary/95"
   : color === "secondary"
   ? "from-secondary/95 via-secondary/40 to-secondary/95"
   : "from-primary/95 via-primary/40 to-primary/95";
 return (
  <div className="flex items-center justify-center p-8">
   <m.div
    className="relative px-4 py-2 overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}>
    <m.h1
     className={cn(
      `text-3xl font-bold bg-gradient-to-r ${colorClass} dark:from-white dark:via-neutral-600 dark:to-white bg-[length:200%_100%] bg-clip-text text-transparent`,
      className
     )}
     animate={{
      backgroundPosition: ["200% center", "-200% center"],
     }}
     transition={{
      duration: 2.5,
      ease: "linear",
      repeat: Number.POSITIVE_INFINITY,
     }}>
     {text}
    </m.h1>
   </m.div>
  </div>
 );
}
