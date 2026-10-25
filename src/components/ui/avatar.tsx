"use client";

import { forwardRef, HTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    const [imageError, setImageError] = useState(false);

    if (src && !imageError) {
      return (
        <div
          ref={ref}
          className={cn(
            "relative inline-flex shrink-0 overflow-hidden rounded-full bg-[rgb(var(--muted))]",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <img
            src={src}
            alt={alt || ""}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-medium",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {fallback || alt?.charAt(0).toUpperCase() || "?"}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";