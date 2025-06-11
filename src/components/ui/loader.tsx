import React from "react";
import { cn } from "@/lib/utils";

/**
 * Loader spinner using the global primary color.
 * No text, centered, accessible.
 */
export function Loader({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("flex items-center justify-center", className)}
    >
      <svg
        className="animate-spin text-primary"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
      >
        <circle
          className="opacity-20"
          cx="16"
          cy="16"
          r="14"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          d="M30 16a14 14 0 0 0-14-14"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="opacity-100"
        />
      </svg>
    </span>
  );
}
