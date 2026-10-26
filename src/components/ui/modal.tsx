"use client";

import { Fragment, ReactNode } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[90vw]",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  showClose = true,
}: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center p-4",
              "pointer-events-none"
            )}
          >
            <div
              className={cn(
                "w-full bg-card] rounded-2xl shadow-xl border border-border] pointer-events-auto",
                sizeClasses[size]
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {(title || showClose) && (
                <div className="flex items-start justify-between p-6 border-b border-border]">
                  <div>
                    {title && (
                      <h2 className="text-lg font-semibold text-foreground]">{title}</h2>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-muted-foreground]">{description}</p>
                    )}
                  </div>
                  {showClose && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="h-8 w-8 text-muted-foreground] hover:text-foreground]"
                      aria-label="Close modal"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}