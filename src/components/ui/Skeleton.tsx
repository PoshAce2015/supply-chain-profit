import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
}

export default function Skeleton({ 
  className, 
  width, 
  height, 
  rounded = "md" 
}: SkeletonProps) {
  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md", 
    lg: "rounded-lg",
    full: "rounded-full"
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200",
        roundedClasses[rounded],
        className
      )}
      style={{
        width: width,
        height: height
      }}
    />
  );
}

// Predefined skeleton components
export function SkeletonCard() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="kpi-card space-y-3">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

export function SkeletonActivity() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
