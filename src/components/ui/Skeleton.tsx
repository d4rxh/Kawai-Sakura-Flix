import React from "react";
import { cn } from "@/src/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl shimmer", className)}
      {...props}
    />
  );
}
