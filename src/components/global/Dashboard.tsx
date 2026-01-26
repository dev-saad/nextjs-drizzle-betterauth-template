import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import React from "react";

interface DashboardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
 mainTitle: string | React.ReactNode;
 subtitle?: string | React.ReactNode;
 section?: string | React.ReactNode;
 children?: React.ReactNode;
}

export const DashboardTitle = ({
 mainTitle,
 subtitle,
 section,
 className,
 children,
 ...props
}: DashboardTitleProps) => {
 return (
  <div
   className={cn(
    "flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center",
    className,
   )}
   {...props}>
   <div className="flex flex-col gap-1">
    {section && (
     <Typography variant="muted" className="mb-0.5 text-xs uppercase">
      {section}
     </Typography>
    )}
    <Typography variant="h2" as="h1">
     {mainTitle}
    </Typography>
    {subtitle && <Typography variant="muted">{subtitle}</Typography>}
   </div>
   {children && <div className="flex items-center gap-2">{children}</div>}
  </div>
 );
};

interface DashboardContentProps extends React.HTMLAttributes<HTMLDivElement> {
 children: React.ReactNode;
}

export const DashboardContent = ({
 className,
 children,
 ...props
}: DashboardContentProps) => {
 return (
  <div className={cn("flex flex-1 flex-col gap-6", className)} {...props}>
   {children}
  </div>
 );
};
