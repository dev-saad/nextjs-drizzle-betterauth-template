import {
 type ColumnFiltersState,
 getCoreRowModel,
 getFacetedMinMaxValues,
 getFacetedRowModel,
 getFacetedUniqueValues,
 getFilteredRowModel,
 getPaginationRowModel,
 getSortedRowModel,
 type PaginationState,
 type RowSelectionState,
 type SortingState,
 type TableOptions,
 type TableState,
 type Updater,
 useReactTable,
 type VisibilityState,
} from "@tanstack/react-table";
import {
 parseAsArrayOf,
 parseAsInteger,
 parseAsString,
 type SingleParser,
 useQueryState,
 type UseQueryStateOptions,
 useQueryStates,
} from "nuqs";
import * as React from "react";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { QUERY_KEYS } from "@/lib/constants/routes";
import { getSortingStateParser } from "@/lib/parsers";
import { loadState, saveState, StorageType } from "@/lib/utils/persist";
import { ExtendedColumnSort, QueryKeys } from "@/types/data-table";
import { usePathname } from "next/navigation";

const PAGE_KEY = "page";
const PER_PAGE_KEY = QUERY_KEYS.limit;
const SORT_KEY = "sort";
const SEARCH_KEY = "search";
const FILTERS_KEY = "filters";
const JOIN_OPERATOR_KEY = "joinOperator";
const ARRAY_SEPARATOR = ",";
const DEBOUNCE_MS = 300;
const THROTTLE_MS = 50;

interface UseDataTableProps<TData>
 extends
  Omit<
   TableOptions<TData>,
   | "state"
   | "pageCount"
   | "getCoreRowModel"
   | "manualFiltering"
   | "manualPagination"
   | "manualSorting"
  >,
  Required<Pick<TableOptions<TData>, "pageCount">> {
 initialState?: Omit<Partial<TableState>, "sorting"> & {
  sorting?: ExtendedColumnSort<TData>[];
 };
 queryKeys?: Partial<QueryKeys>;
 history?: "push" | "replace";
 debounceMs?: number;
 throttleMs?: number;
 clearOnDefault?: boolean;
 enableGlobalFilter?: boolean;
 enableAdvancedFilter?: boolean;
 enablePersistence?: boolean;
 persistenceId?: string;
 storageType?: StorageType;
 scroll?: boolean;
 shallow?: boolean;
 startTransition?: React.TransitionStartFunction;
 persistOptions?: DataTablePersistOptions;
}

export interface DataTablePersistOptions {
 sorting?: boolean;
 columnFilters?: boolean;
 globalFilter?: boolean;
 columnVisibility?: boolean;
 pagination?: boolean;
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
 const {
  columns,
  pageCount = -1,
  initialState,
  queryKeys,
  history = "replace",
  debounceMs = DEBOUNCE_MS,
  throttleMs = THROTTLE_MS,
  clearOnDefault = false,
  enableGlobalFilter = false,
  enableAdvancedFilter = false,
  enablePersistence = false,
  storageType = "localStorage",
  persistenceId,
  persistOptions = {
   sorting: false,
   columnFilters: false,
   globalFilter: false,
   columnVisibility: true,
   pagination: false,
  },
  scroll = false,
  shallow = true,
  startTransition,
  ...tableProps
 } = props;
 const pageKey = queryKeys?.page ?? PAGE_KEY;
 const perPageKey = queryKeys?.perPage ?? PER_PAGE_KEY;
 const sortKey = queryKeys?.sort ?? SORT_KEY;
 const searchKey = queryKeys?.search ?? SEARCH_KEY;
 const filtersKey = queryKeys?.filters ?? FILTERS_KEY;
 const joinOperatorKey = queryKeys?.joinOperator ?? JOIN_OPERATOR_KEY;

 const queryStateOptions = React.useMemo<
  Omit<UseQueryStateOptions<string>, "parse">
 >(
  () => ({
   history,
   scroll,
   shallow,
   throttleMs,
   debounceMs,
   clearOnDefault,
   startTransition,
  }),
  [
   history,
   scroll,
   shallow,
   throttleMs,
   debounceMs,
   clearOnDefault,
   startTransition,
  ],
 );

 const memoizedPersistOptions = React.useMemo(() => {
  return {
   sorting: persistOptions?.sorting ?? true,
   columnFilters: persistOptions?.columnFilters ?? true,
   globalFilter: persistOptions?.globalFilter ?? true,
   columnVisibility: persistOptions?.columnVisibility ?? true,
   pagination: persistOptions?.pagination ?? false,
  };
 }, [
  persistOptions?.sorting,
  persistOptions?.columnFilters,
  persistOptions?.globalFilter,
  persistOptions?.columnVisibility,
  persistOptions?.pagination,
 ]);

 const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
  initialState?.rowSelection ?? {},
 );
 const [columnVisibility, setColumnVisibility] =
  React.useState<VisibilityState>(initialState?.columnVisibility ?? {});

 const [page, setPage] = useQueryState(
  pageKey,
  parseAsInteger.withOptions(queryStateOptions).withDefault(1),
 );
 const [perPage, setPerPage] = useQueryState(
  perPageKey,
  parseAsInteger
   .withOptions(queryStateOptions)
   .withDefault(initialState?.pagination?.pageSize ?? 10),
 );

 const pagination: PaginationState = React.useMemo(() => {
  return {
   pageIndex: page - 1, // zero-based index -> one-based index
   pageSize: perPage,
  };
 }, [page, perPage]);

 const onPaginationChange = React.useCallback(
  (updaterOrValue: Updater<PaginationState>) => {
   if (typeof updaterOrValue === "function") {
    const newPagination = updaterOrValue(pagination);
    void setPage(newPagination.pageIndex + 1);
    void setPerPage(newPagination.pageSize);
   } else {
    void setPage(updaterOrValue.pageIndex + 1);
    void setPerPage(updaterOrValue.pageSize);
   }
  },
  [pagination, setPage, setPerPage],
 );

 const columnIds = React.useMemo(() => {
  return new Set(
   columns.map((column) => column.id).filter(Boolean) as string[],
  );
 }, [columns]);

 const [sorting, setSorting] = useQueryState(
  sortKey,
  getSortingStateParser<TData>(columnIds)
   .withOptions(queryStateOptions)
   .withDefault(initialState?.sorting ?? []),
 );

 const onSortingChange = React.useCallback(
  (updaterOrValue: Updater<SortingState>) => {
   if (typeof updaterOrValue === "function") {
    const newSorting = updaterOrValue(sorting) as ExtendedColumnSort<TData>[];
    void setSorting(newSorting.length > 0 ? newSorting : null);
   } else {
    const newSorting = updaterOrValue as ExtendedColumnSort<TData>[];
    void setSorting(newSorting.length > 0 ? newSorting : null);
   }
  },
  [sorting, setSorting],
 );

 // Global Filter State
 const [globalFilterParam, setGlobalFilterParam] = useQueryState(
  searchKey,
  parseAsString
   .withOptions({ ...queryStateOptions, history: "push", scroll: false })
   .withDefault(""),
 );

 const [globalFilter, setGlobalFilter] = React.useState<string>(
  globalFilterParam ?? "",
 );

 const debouncedSetGlobalFilterParam = useDebouncedCallback((value: string) => {
  void setPage(1);
  void setGlobalFilterParam(value || null);
 }, debounceMs);

 // Sync local state with URL param (e.g. back button)
 React.useEffect(() => {
  if (globalFilterParam !== globalFilter) {
   setGlobalFilter(globalFilterParam ?? "");
  }
 }, [globalFilterParam]);

 const onGlobalFilterChange = React.useCallback(
  (updaterOrValue: Updater<string>) => {
   if (enableGlobalFilter) {
    setGlobalFilter((prev) => {
     const next =
      typeof updaterOrValue === "function"
       ? updaterOrValue(prev)
       : updaterOrValue;
     debouncedSetGlobalFilterParam(next);
     return next;
    });
   }
  },
  [enableGlobalFilter, debouncedSetGlobalFilterParam],
 );

 const filterableColumns = React.useMemo(() => {
  if (enableAdvancedFilter) return [];

  return columns.filter((column) => column.enableColumnFilter);
 }, [columns, enableAdvancedFilter]);

 const filterParsers = React.useMemo(() => {
  if (enableAdvancedFilter) return {};

  return filterableColumns.reduce<
   Record<string, SingleParser<string> | SingleParser<string[]>>
  >((acc, column) => {
   if (column.meta?.options) {
    acc[column.id ?? ""] = parseAsArrayOf(
     parseAsString,
     ARRAY_SEPARATOR,
    ).withOptions(queryStateOptions);
   } else {
    acc[column.id ?? ""] = parseAsString.withOptions(queryStateOptions);
   }
   return acc;
  }, {});
 }, [filterableColumns, queryStateOptions, enableAdvancedFilter]);

 const [filterValues, setFilterValues] = useQueryStates(filterParsers);

 const debouncedSetFilterValues = useDebouncedCallback(
  (values: typeof filterValues) => {
   void setPage(1);
   void setFilterValues(values);
  },
  debounceMs,
 );

 const initialColumnFilters: ColumnFiltersState = React.useMemo(() => {
  if (enableAdvancedFilter) return [];

  return Object.entries(filterValues).reduce<ColumnFiltersState>(
   (filters, [key, value]) => {
    if (value !== null) {
     const processedValue = Array.isArray(value)
      ? value
      : typeof value === "string" && /[^a-zA-Z0-9]/.test(value)
        ? value.split(/[^a-zA-Z0-9]+/).filter(Boolean)
        : [value];

     filters.push({
      id: key,
      value: processedValue,
     });
    }
    return filters;
   },
   [],
  );
 }, [filterValues, enableAdvancedFilter]);

 const [columnFilters, setColumnFilters] =
  React.useState<ColumnFiltersState>(initialColumnFilters);

 const onColumnFiltersChange = React.useCallback(
  (updaterOrValue: Updater<ColumnFiltersState>) => {
   if (enableAdvancedFilter) return;

   setColumnFilters((prev) => {
    const next =
     typeof updaterOrValue === "function"
      ? updaterOrValue(prev)
      : updaterOrValue;

    const filterUpdates = next.reduce<Record<string, string | string[] | null>>(
     (acc, filter) => {
      if (filterableColumns.find((column) => column.id === filter.id)) {
       const value = filter.value as string | string[];
       if (Array.isArray(value) && value.length === 0) {
        acc[filter.id] = null;
       } else if (value === "") {
        acc[filter.id] = null;
       } else {
        acc[filter.id] = value;
       }
      }
      return acc;
     },
     {},
    );

    for (const prevFilter of prev) {
     if (!next.some((filter) => filter.id === prevFilter.id)) {
      filterUpdates[prevFilter.id] = null;
     }
    }

    debouncedSetFilterValues(filterUpdates);
    return next;
   });
  },
  [debouncedSetFilterValues, filterableColumns, enableAdvancedFilter],
 );

 // Persistence Logic
 const pathname = usePathname();
 const persistenceKey = `datatable-state-${persistenceId || pathname}`;
 const [isLoading, setIsLoading] = React.useState(true);

 // Load State from LocalStorage
 React.useEffect(() => {
  if (!enablePersistence || typeof window === "undefined") {
   setIsLoading(false);
   return;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const hasTableParams = [
   pageKey,
   perPageKey,
   sortKey,
   searchKey,
   filtersKey,
   joinOperatorKey,
  ].some((key) => searchParams.has(key));

  if (!hasTableParams) {
   const stored = loadState<{
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    globalFilter?: string;
    columnVisibility?: VisibilityState;
    pagination?: PaginationState;
   }>({
    key: persistenceKey,
    storage: storageType,
   });

   if (stored) {
    if (memoizedPersistOptions.sorting && stored.sorting) {
     const validSorting = stored.sorting.filter((sort) =>
      columnIds.has(sort.id),
     );
     void setSorting(validSorting as ExtendedColumnSort<TData>[]);
    }
    if (memoizedPersistOptions.globalFilter && stored.globalFilter) {
     void onGlobalFilterChange(stored.globalFilter);
    }
    if (memoizedPersistOptions.columnFilters && stored.columnFilters) {
     const validFilters = stored.columnFilters.filter((filter) =>
      filterableColumns.find((col) => col.id === filter.id),
     );
     void onColumnFiltersChange(validFilters);
    }
    if (memoizedPersistOptions.columnVisibility && stored.columnVisibility) {
     setColumnVisibility(stored.columnVisibility);
    }
    if (memoizedPersistOptions.pagination && stored.pagination) {
     onPaginationChange(stored.pagination);
    }
   }
  }
  setIsLoading(false);
 }, [enablePersistence, persistenceKey, memoizedPersistOptions]);

 // Save State to LocalStorage
 React.useEffect(() => {
  if (!enablePersistence || isLoading) return;

  const stateToSave: Record<string, any> = {};

  if (memoizedPersistOptions.sorting) stateToSave.sorting = sorting;
  if (memoizedPersistOptions.columnFilters)
   stateToSave.columnFilters = columnFilters;
  if (memoizedPersistOptions.globalFilter)
   stateToSave.globalFilter = globalFilter;
  if (memoizedPersistOptions.columnVisibility)
   stateToSave.columnVisibility = columnVisibility;
  if (memoizedPersistOptions.pagination) stateToSave.pagination = pagination;

  saveState(
   {
    key: persistenceKey,
    storage: storageType,
   },
   stateToSave,
  );
 }, [
  enablePersistence,
  isLoading,
  persistenceKey,
  sorting,
  columnFilters,
  globalFilter,
  columnVisibility,
  pagination,
  memoizedPersistOptions,
 ]);

 const table = useReactTable({
  ...tableProps,
  columns,
  initialState,
  pageCount,
  state: {
   pagination,
   sorting,
   columnVisibility,
   rowSelection,
   columnFilters,
   globalFilter: enableGlobalFilter ? globalFilter : undefined,
  },
  defaultColumn: {
   ...tableProps.defaultColumn,
   enableColumnFilter: false,
  },
  enableRowSelection: true,
  onRowSelectionChange: setRowSelection,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  onGlobalFilterChange: enableGlobalFilter ? onGlobalFilterChange : undefined,
  onColumnVisibilityChange: setColumnVisibility,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
  getFacetedMinMaxValues: getFacetedMinMaxValues(),
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  meta: {
   ...tableProps.meta,
   queryKeys: {
    page: pageKey,
    perPage: perPageKey,
    sort: sortKey,
    search: searchKey,
    filters: filtersKey,
    joinOperator: joinOperatorKey,
   },
  },
  enableGlobalFilter,
 });

 return React.useMemo(
  () => ({ table, shallow, debounceMs, throttleMs }),
  [table, shallow, debounceMs, throttleMs],
 );
}
