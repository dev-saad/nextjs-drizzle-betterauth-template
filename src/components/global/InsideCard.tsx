import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import React from "react";

const InsideCard = ({
 children,
 title,
 subtitle,
 icon,
 className,
 variant = "default",
 contentClassName,
}: {
 children: React.ReactNode;
 title?: string;
 subtitle?: string;
 icon?: React.ReactNode;
 className?: string;
 variant?: "default" | "destructive";
 contentClassName?: string;
}) => {
 return (
  <Card
   className={cn(
    "gap-4 shadow-none",
    variant === "destructive" && "border-destructive/50",
    className
   )}>
   {(title || subtitle) && (
    <CardHeader>
     {title && (
      <CardTitle>
       <Typography
        variant="p"
        className={cn(
         "font-medium flex items-center gap-2",
         variant === "destructive" && "text-destructive"
        )}>
        {icon && (
         <div
          className={cn(
           "flex size-8 items-center justify-center rounded-lg bg-muted",
           variant === "destructive" && "bg-destructive/10 text-destructive"
          )}>
          {icon}
         </div>
        )}
        {title}
       </Typography>
       {subtitle && (
        <Typography variant="small" className="text-muted-foreground">
         {subtitle}
        </Typography>
       )}
      </CardTitle>
     )}
    </CardHeader>
   )}
   <CardContent className={contentClassName}>{children}</CardContent>
  </Card>
 );
};

export default InsideCard;
