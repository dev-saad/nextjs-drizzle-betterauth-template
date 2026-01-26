import { DateRange } from "react-day-picker";

export type FilterValue = string | string[] | DateRange | undefined;

export interface BaseFilterConfig<T = FilterValue> {
 key: string;
 label?: string; // Optional label, mostly for accessibility or UI
 placeholder?: string;
 className?: string; // For overriding specific filter width/style
 onChange?: (value: T) => void;
 onClear?: () => void;
 allOptionLabel?: string;
}

export interface TextFilterConfig extends BaseFilterConfig<string> {
 type: "text";
}

export interface SelectFilterConfig<T = string> extends BaseFilterConfig<T[]> {
 type: "select";
 options: { label: string; value: T; default?: boolean }[];
 multiple?: boolean;
}

export interface DateFilterConfig extends BaseFilterConfig<
 DateRange | undefined
> {
 type: "date";
}

export type FilterConfig<T = any> =
 | TextFilterConfig
 | SelectFilterConfig<T>
 | DateFilterConfig;

export interface FilterRowProps {
 filters: FilterConfig<any>[];
 values: Record<string, FilterValue>;
 onFilterChange?: (key: string, value: FilterValue) => void;
 onClearFilters?: () => void;
 className?: string;
}
