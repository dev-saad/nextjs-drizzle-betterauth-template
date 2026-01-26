import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

function Skeleton({
 className,
 asChild = false,
 ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
 const Comp = asChild ? Slot : "div";

 return (
  <Comp
   data-slot="skeleton"
   className={cn("bg-accent animate-pulse rounded-md", className)}
   {...props}
  />
 );
}

export { Skeleton };
