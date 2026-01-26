import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

const Loading = () => {
 return (
  <DataTableSkeleton
   columnCount={5}
   rowCount={12}
   filterCount={3}
   withViewOptions
  />
 );
};

export default Loading;
