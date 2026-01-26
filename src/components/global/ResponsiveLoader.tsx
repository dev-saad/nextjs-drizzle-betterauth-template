import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ResponsiveLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
 size?: number;
 color?: string;
}

const FlowketLoader = ({
 className,
 size = 24,
 color,
 ...props
}: ResponsiveLoaderProps) => {
 return (
  <div className={cn("flex items-center justify-center", className)} {...props}>
   <Loader2
    className="animate-spin"
    size={size}
    color={color}
    aria-label="Loading"
   />
   <span className="sr-only">Loading...</span>
  </div>
 );
};

export default FlowketLoader;
