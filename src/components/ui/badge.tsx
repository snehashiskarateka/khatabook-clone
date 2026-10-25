"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "destructive" | "warning" | "outline" | "secondary";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
      success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      destructive: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      outline: "border border-slate-300 bg-transparent dark:border-slate-600",
      secondary: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
export { Badge };