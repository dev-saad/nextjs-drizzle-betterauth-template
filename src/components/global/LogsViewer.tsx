"use client";

import {
 AuditLogsReturnType,
 AuditLogsType,
 getLogs,
} from "@/actions/server/log.controllers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import {
 Empty,
 EmptyContent,
 EmptyDescription,
 EmptyHeader,
 EmptyMedia,
 EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import {
 actionsEnum,
 auditStatusEnum,
 entityTypesEnum,
} from "@/lib/drizzle/schemas/other.schema";
import { cn } from "@/lib/utils";
import { getStorageUrl } from "@/lib/utils/files";
import { FilterConfig, FilterValue } from "@/types/filter-types";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { format } from "date-fns";
import {
 Activity,
 AlertCircle,
 Box,
 Briefcase,
 CheckCircle2,
 ChevronDown,
 ChevronRight,
 Clock,
 FileText,
 Fingerprint,
 History,
 LayoutGrid,
 ListTreeIcon,
 Loader2,
 Search,
 Shield,
 ShoppingCart,
 Tag,
 Truck,
 User,
 Users,
 XCircle,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { FilterRow } from "./FilterRow";

export type FilterType = "search" | "date" | "action" | "entity" | "status";

interface LogsViewerProps {
 initialData?: AuditLogsType;
 className?: string;
 title?: string;
 description?: string;
 enabledFilters?: FilterType[];
 actions?: (typeof actionsEnum.enumValues)[number][];
 entityTypes?: (typeof entityTypesEnum.enumValues)[number][];
 entityId?: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
 "2FA_VERIFY_TOTP": <Shield className="size-4 text-emerald-500" />,
 "2FA_VERIFY_EMAIL": <Shield className="size-4 text-emerald-500" />,
 "2FA_VERIFY_BACKUP_CODES": <Shield className="size-4 text-emerald-500" />,
 "2FA_ENABLE": <Shield className="size-4 text-blue-500" />,
 "2FA_DISABLE": <Shield className="size-4 text-orange-500" />,
 "2FA_GENERATE_BACKUP_CODES": <Shield className="size-4 text-blue-500" />,
 CHANGE_PASSWORD: <Shield className="size-4 text-blue-500" />,
 SIGN_OUT: <User className="size-4 text-gray-400" />,
 SIGN_IN: <User className="size-4 text-green-500" />,
 SIGN_UP: <User className="size-4 text-green-500" />,
 CREATE: <CheckCircle2 className="size-4 text-green-500" />,
 UPDATE: <Activity className="size-4 text-blue-500" />,
 DELETE: <XCircle className="size-4 text-red-500" />,
 REVOKE: <XCircle className="size-4 text-red-500" />,
};

const ENTITY_ICONS: Record<string, React.ReactNode> = {
 USER: <User className="size-3 md:size-4" />,
 SECURITY: <Shield className="size-3 md:size-4" />,
 ORGANIZATION: <Briefcase className="size-3 md:size-4" />,
 PRODUCT: <Box className="size-3 md:size-4" />,
 ORDER: <ShoppingCart className="size-3 md:size-4" />,
 CATEGORY: <LayoutGrid className="size-3 md:size-4" />,
 BRAND: <Tag className="size-3 md:size-4" />,
 SUPPLIER: <Truck className="size-3 md:size-4" />,
 CUSTOMER: <Users className="size-3 md:size-4" />,
 GENERAL: <FileText className="size-3 md:size-4" />,
 SESSION: <History className="size-3 md:size-4" />,
};

const LOGS_LIMIT = 10;

const LogsViewer: React.FC<LogsViewerProps> = ({
 initialData,
 className,
 title = "Audit Logs",
 description = "View and filter system activity logs.",
 enabledFilters = ["search", "date", "action", "entity", "status"],
 actions,
 entityTypes,
 entityId,
}) => {
 const [searchQuery, setSearchQuery] = useState("");
 const [debouncedSearch] = useDebouncedValue(searchQuery, { wait: 500 });
 const [selectedAction, setSelectedAction] = useState<
  (typeof actionsEnum.enumValues)[number] | "ALL"
 >("ALL");
 const [selectedEntity, setSelectedEntity] = useState<
  (typeof entityTypesEnum.enumValues)[number] | "ALL"
 >("ALL");
 const [selectedStatus, setSelectedStatus] = useState<
  (typeof auditStatusEnum.enumValues)[number] | "ALL"
 >("ALL");
 const [dateRange, setDateRange] = useState<DateRange | undefined>();
 const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

 console.log(initialData);

 const fetchLogsCallback = useCallback(
  async (page: number) => {
   const response = await getLogs({
    page,
    limit: LOGS_LIMIT,
    search: debouncedSearch,
    status: selectedStatus === "ALL" ? undefined : (selectedStatus as any),
    actions:
     selectedAction === "ALL" ? (actions as any) : [selectedAction as any],
    entityTypes:
     selectedEntity === "ALL" ? (entityTypes as any) : [selectedEntity as any],
    entityId: entityId,
    dateRange: dateRange
     ? { from: dateRange.from, to: dateRange.to }
     : undefined,
   });

   if (response?.error || !response?.success) {
    toast.error(`Failed to fetch logs: ${response?.error}`);
    return { data: [], total: 0 };
   }

   return {
    data: response?.data?.logs || [],
    total: response?.data?.total || 0,
   };
  },
  [debouncedSearch, selectedStatus, selectedAction, selectedEntity, dateRange],
 );

 const {
  data: logs,
  total,
  isLoading,
  hasMore,
  observerRef,
  reset,
 } = useInfiniteScroll({
  fetchData: fetchLogsCallback,
  initialData: initialData?.logs || [],
  initialTotal: initialData?.total || 0,
  limit: LOGS_LIMIT,
  defaultLoading: initialData?.logs.length === 0,
 });

 // Effect to handle filter changes (reset)
 useEffect(() => {
  reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [fetchLogsCallback]);

 const actionOptions = useMemo(
  () => [...(actions ?? actionsEnum.enumValues)],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [JSON.stringify(actions)],
 );
 const entityOptions = useMemo(
  () => [...(entityTypes ?? entityTypesEnum.enumValues)],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [JSON.stringify(entityTypes)],
 );
 const statusOptions = useMemo(() => [...auditStatusEnum.enumValues], []);

 const filterConfigs = useMemo<FilterConfig[]>(() => {
  const configs: FilterConfig[] = [];

  if (enabledFilters.includes("search")) {
   configs.push({
    key: "search",
    type: "text",
    placeholder: "Search by ID, User, or Action...",
    onChange: (value) => setSearchQuery(value),
    onClear: () => setSearchQuery(""),
   });
  }

  if (enabledFilters.includes("date")) {
   configs.push({
    key: "date",
    type: "date",
    placeholder: "Pick a date",
    onChange: (value) => setDateRange(value),
    onClear: () => setDateRange(undefined),
   });
  }

  if (enabledFilters.includes("action")) {
   configs.push({
    key: "action",
    type: "select",
    placeholder: "Action",
    allOptionLabel: "All Actions",
    options: actionOptions.map((action) => ({
     label: action.replace(/_/g, " "),
     value: action,
    })),
    onChange: (value) => setSelectedAction(value as any),
    onClear: () => setSelectedAction("ALL"),
   });
  }

  if (enabledFilters.includes("entity")) {
   configs.push({
    key: "entity",
    type: "select",
    placeholder: "Device",
    allOptionLabel: "All Devices",
    options: entityOptions.map((entity) => ({
     label: entity.charAt(0).toUpperCase() + entity.slice(1),
     value: entity,
    })),
    onChange: (value) => setSelectedEntity(value as any),
    onClear: () => setSelectedEntity("ALL"),
   });
  }

  if (enabledFilters.includes("status")) {
   configs.push({
    key: "status",
    type: "select",
    placeholder: "Status",
    allOptionLabel: "All Status",
    options: statusOptions.map((status) => ({
     label: status.charAt(0).toUpperCase() + status.slice(1),
     value: status,
    })),
    onChange: (value) => setSelectedStatus(value as any),
    onClear: () => setSelectedStatus("ALL"),
   });
  }

  return configs;
 }, [
  enabledFilters,
  actionOptions,
  entityOptions,
  statusOptions,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  setSearchQuery,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  setDateRange,
 ]);

 // Universal filter change handler (for analytics or global state monitoring)
 const handleFilterChange = (key: string, value: FilterValue) => {
  // Logic moved to individual filter configs.
  // This handler allows for global side effects if needed.
  console.log("Filter changed:", key, value);
 };

 const toggleExpand = (id: string) => {
  setExpandedLogId(expandedLogId === id ? null : id);
 };

 const clearFilters = () => {
  setSearchQuery("");
  setSelectedAction("ALL");
  setSelectedEntity("ALL");
  setSelectedStatus("ALL");
  setDateRange(undefined);
 };

 const hasActiveFilters =
  searchQuery ||
  selectedAction !== "ALL" ||
  selectedEntity !== "ALL" ||
  selectedStatus !== "ALL" ||
  dateRange;

 const getLogTitle = (
  log: NonNullable<
   NonNullable<Awaited<AuditLogsReturnType>["data"]>["logs"]
  >[number],
 ) => {
  const { action, status, entityType } = log;

  switch (action) {
   case "SIGN_IN":
    return status === "failed" ? "Failed login attempt" : "User logged in";
   case "SIGN_OUT":
    return "User signed out";
   case "SIGN_UP":
    return "New user registered";
   case "CHANGE_PASSWORD":
    return "Password changed";
   case "2FA_VERIFY_TOTP":
   case "2FA_VERIFY_EMAIL":
   case "2FA_VERIFY_BACKUP_CODES":
    return "Two-factor authentication verified";
   case "2FA_ENABLE":
    return "Two-factor authentication enabled";
   case "2FA_DISABLE":
    return "Two-factor authentication disabled";
   case "2FA_GENERATE_BACKUP_CODES":
    return "Backup codes generated";
   case "CREATE":
    return `${
     entityType.charAt(0).toUpperCase() + entityType.slice(1).toLowerCase()
    } created`;
   case "UPDATE":
    if (entityType === "USER") return "Profile information updated";
    return `${
     entityType.charAt(0).toUpperCase() + entityType.slice(1).toLowerCase()
    } updated`;
   case "DELETE":
    return `${
     entityType.charAt(0).toUpperCase() + entityType.slice(1).toLowerCase()
    } deleted`;
   case "REVOKE":
    return "Access revoked";
   default:
    return action;
  }
 };

 return (
  <Card
   className={cn(
    "w-full shadow-sm border-border/50 bg-background overflow-hidden",
    className,
   )}>
   <CardHeader className="px-6 py-4 border-b border-border/50 bg-muted/20">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
     <div>
      <CardTitle className="text-lg font-semibold flex items-center gap-2">
       <Activity className="h-5 w-5 text-primary" /> {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
     </div>
     <div className="flex items-center gap-2">
      <Badge variant="outline" className="bg-background">
       {total} {total === 1 ? "Log" : "Logs"}
      </Badge>
     </div>
    </div>

    {/* Filters Section */}
    <FilterRow
     filters={filterConfigs}
     values={{
      search: searchQuery,
      date: dateRange,
      action: selectedAction,
      entity: selectedEntity,
      status: selectedStatus,
     }}
     onFilterChange={handleFilterChange}
     onClearFilters={clearFilters}
    />
   </CardHeader>

   <CardContent className="p-0">
    <ScrollArea className="h-[600px] w-full">
     {logs?.length === 0 && isLoading ? (
      <LogsLoading />
     ) : logs?.length === 0 ? (
      <Empty>
       <EmptyMedia>
        <Search className="h-8 w-8 text-muted-foreground/50" />
       </EmptyMedia>
       <EmptyHeader>
        <EmptyTitle>No logs found</EmptyTitle>
        <EmptyDescription>
         {hasActiveFilters
          ? "No logs found matching your current filters."
          : "No logs found."}
        </EmptyDescription>
       </EmptyHeader>
       {hasActiveFilters && (
        <EmptyContent>
         <Button variant="outline" onClick={clearFilters}>
          Clear all filters
         </Button>
        </EmptyContent>
       )}
      </Empty>
     ) : (
      <div className="divide-y divide-border/50">
       {logs?.map((log) => {
        const isExpanded = expandedLogId === log.id;
        const ActionIcon = ACTION_ICONS[
         log.action as keyof typeof ACTION_ICONS
        ] || <Activity className="h-4 w-4" />;
        const EntityIcon = ENTITY_ICONS[
         log.entityType as keyof typeof ENTITY_ICONS
        ] || <Box className="h-4 w-4" />;
        const avatar = getStorageUrl(log.actorAvatar);

        return (
         <div
          key={log.id}
          className={cn(
           "group hover:bg-muted/30 transition-colors duration-200 cursor-pointer",
           isExpanded && "bg-muted/30",
          )}>
          {/* Main Row */}
          <div
           className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 text-sm"
           onClick={() => toggleExpand(log.id)}>
           {/* Mobile Header Row (Unwraps on Desktop) */}
           <div className="flex items-center justify-between sm:contents">
            {/* Icon & Title Group */}
            <div className="flex items-center gap-3 sm:gap-0 mb-auto">
             {/* Icon Column */}
             <div className="flex-shrink-0">
              <div
               className={cn(
                "rounded-full flex items-center justify-center border shadow-sm",
                "h-8 w-8 sm:h-10 sm:w-10",
                log.status === "failed"
                 ? "bg-red-500/10 border-red-500/20 text-red-500"
                 : "bg-background border-border",
               )}>
               {log.status === "failed" ? (
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
               ) : (
                ActionIcon
               )}
              </div>
             </div>

             {/* Mobile Title */}
             <div className="flex items-center gap-2 font-medium text-foreground sm:hidden">
              <Typography
               variant="p"
               as="span"
               className="text-sm sm:text-base">
               {getLogTitle(log)}
              </Typography>
              {log.status === "failed" && (
               <Badge
                variant="destructive"
                className="h-4 px-1 text-[10px] uppercase">
                Failed
               </Badge>
              )}
             </div>
            </div>

            {/* Mobile Expand Toggle */}
            <Button
             variant="ghost"
             size="icon"
             className="h-8 w-8 rounded-full text-muted-foreground group-hover:text-foreground group-hover:bg-muted sm:hidden">
             <ChevronDown
              className={cn(
               "h-4 w-4 transition-transform duration-200",
               isExpanded && "rotate-180",
              )}
             />
            </Button>
           </div>

           {/* Content Column */}
           <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center">
            {/* Action & User info */}
            <div className="md:col-span-5 flex flex-col gap-0.5">
             {/* Desktop Title */}
             <div className="hidden sm:flex items-center gap-2 font-medium text-foreground">
              <Typography
               variant="p"
               as="span"
               className="text-sm sm:text-base">
               {getLogTitle(log)}
              </Typography>
              {log.status === "failed" && (
               <Badge
                variant="destructive"
                className="h-4 px-1 text-[10px] uppercase">
                Failed
               </Badge>
              )}
             </div>
             <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              <Avatar className="h-4 w-4">
               <AvatarImage src={avatar || ""} />
               <AvatarFallback className="text-[9px]">
                {log.actorName?.charAt(0) || "U"}
               </AvatarFallback>
              </Avatar>
              <span className="truncate">{log.actorEmail || "System"}</span>
              {log.actorName && log.actorName !== log.actorEmail && (
               <>
                <span className="text-border mx-1">|</span>
                <span className="truncate opacity-80">{log.actorName}</span>
               </>
              )}
             </div>
            </div>

            {/* Entity Info */}
            <div className="md:col-span-4 flex items-center gap-1 md:gap-2 text-muted-foreground">
             <div
              className={cn(
               "bg-muted px-1 md:px-2 py-1 rounded font-medium flex items-center gap-1.5 border border-border/50",
               "text-[10px] sm:text-xs",
              )}>
              {EntityIcon}
              <span>{log.entityType}</span>
             </div>
             <ChevronRight className="h-3 w-3 opacity-50" />
             <span
              className={cn(
               "font-mono opacity-80 truncate",
               "text-[10px] sm:text-xs",
              )}
              title={log.entityId}>
              {log.entityId}
             </span>
            </div>

            {/* Date & Time */}
            <div className="md:col-span-3 text-left md:text-right flex flex-col items-start md:items-end gap-0.5 pt-1 md:pt-0 ml-auto">
             <Typography variant="muted" className="text-xs">
              {format(new Date(log.createdAt), "MMM d, yyyy")}
             </Typography>
             <Typography variant="muted" className="text-xs">
              {format(new Date(log.createdAt), "HH:mm:ss")}
             </Typography>
            </div>
           </div>

           {/* Desktop Expand Toggle */}
           <div className="hidden sm:block flex-shrink-0">
            <Button
             variant="ghost"
             size="icon"
             className="h-8 w-8 rounded-full text-muted-foreground group-hover:text-foreground group-hover:bg-muted">
             <ChevronDown
              className={cn(
               "h-4 w-4 transition-transform duration-200",
               isExpanded && "rotate-180",
              )}
             />
            </Button>
           </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
           {isExpanded && (
            <m.div
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: "auto", opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             transition={{ duration: 0.2 }}
             className="overflow-hidden bg-muted/40 border-t border-border/50">
             <div className="p-4 grid grid-cols-1 gap-6 text-sm">
              {/* Technical Details Section */}
              <div className="space-y-3">
               <Typography
                variant="small"
                className="uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ListTreeIcon className="h-3 w-3" /> Log Details
               </Typography>
               <div className="space-y-2">
                {log.orgName && (
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-1 gap-1 sm:gap-0 border-b border-border/50">
                  <Typography
                   variant="muted"
                   className="flex items-center gap-1.5">
                   <Briefcase className="h-3.5 w-3.5" /> Organization
                  </Typography>
                  <span className="font-mono text-foreground text-xs sm:text-sm break-all sm:break-normal text-left sm:text-right">
                   {log.orgName} ({log.orgSlug})
                  </span>
                 </div>
                )}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-1 gap-1 sm:gap-0 border-b border-border/50">
                 <Typography
                  variant="muted"
                  className="flex items-center gap-1.5">
                  <Fingerprint className="h-3.5 w-3.5" /> Log ID
                 </Typography>
                 <span className="font-mono text-xs text-muted-foreground break-all text-left sm:text-right">
                  {log.id}
                 </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-1 gap-1 sm:gap-0">
                 <Typography
                  variant="muted"
                  className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Timestamp
                 </Typography>
                 <span className="font-mono text-xs text-muted-foreground break-all sm:break-normal text-left sm:text-right">
                  {new Date(log.createdAt).toISOString()}
                 </span>
                </div>
               </div>
              </div>
             </div>
            </m.div>
           )}
          </AnimatePresence>
         </div>
        );
       })}
       {/* Infinite Scroll Loader / Sentinel */}
       {hasMore && (
        <div
         ref={observerRef}
         className="py-6 flex justify-center items-center">
         {isLoading && (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
         )}
        </div>
       )}
      </div>
     )}
    </ScrollArea>
   </CardContent>
  </Card>
 );
};

const LogsLoading = () => {
 return (
  <div className="divide-y divide-border/50">
   {Array.from({ length: 5 }).map((_, i) => (
    <div
     key={i}
     className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4">
     <div className="flex items-center justify-between sm:contents">
      <div className="flex items-center gap-3 sm:gap-0">
       <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
       {/* Mobile Title Skeleton */}
       <Skeleton className="h-4 w-32 sm:hidden" />
      </div>
      {/* Mobile Arrow Skeleton */}
      <Skeleton className="h-8 w-8 rounded-full sm:hidden" />
     </div>

     <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-5 flex flex-col gap-2">
       {/* Desktop Title Skeleton */}
       <Skeleton className="hidden sm:block h-4 w-32" />
       <Skeleton className="h-3 w-24" />
      </div>
      <div className="md:col-span-4">
       <Skeleton className="h-6 w-24 rounded" />
      </div>
      <div className="md:col-span-3 flex flex-col items-start md:items-end gap-2">
       <Skeleton className="h-4 w-20" />
       <Skeleton className="h-3 w-16" />
      </div>
     </div>
     {/* Desktop Arrow Skeleton */}
     <Skeleton className="hidden sm:block h-8 w-8 rounded-full flex-shrink-0" />
    </div>
   ))}
  </div>
 );
};

export default LogsViewer;
