"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, value, onChange, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    // Ensure value is never undefined to prevent controlled/uncontrolled warnings
    const inputValue = value ?? "";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          value={inputValue}
          onChange={onChange}
          className={cn(
            "flex h-11 w-full rounded-xl border bg-background px-4 text-sm transition-all duration-200",
            "placeholder:text-muted-foreground]",
            "focus:outline-none focus:ring-2 focus:ring-ring] focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "border-input]",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
export { Input };