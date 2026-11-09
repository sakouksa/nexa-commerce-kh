"use client";

import React from "react";
import { cva } from "class-variance-authority";
import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const morphingSquareVariants = cva("flex gap-3 items-center justify-center", {
  variants: {
    messagePlacement: {
      bottom: "flex-col",
      top: "flex-col-reverse",
      right: "flex-row",
      left: "flex-row-reverse",
    },
  },
  defaultVariants: {
    messagePlacement: "bottom",
  },
});

export interface MorphingSquareProps {
  message?: string;
  /**
   * Duration of one full morph animation cycle in seconds.
   * @default 1.4
   */
  duration?: number;
  /**
   * Position of the message relative to the spinner.
   * @default bottom
   */
  messagePlacement?: "top" | "bottom" | "left" | "right";
}

export function MorphingSquare({
  className,
  message,
  duration = 1.4,
  messagePlacement = "bottom",
  ...props
}: HTMLMotionProps<"div"> & MorphingSquareProps) {
  return (
    <div className={cn(morphingSquareVariants({ messagePlacement }))}>
      <motion.div
        className={cn("w-10 h-10 bg-foreground", className)}
        animate={{
          borderRadius: ["6%", "50%", "6%"],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: duration,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        {...props}
      />
      {message && (
        <div className="text-sm font-medium text-muted-foreground animate-pulse tracking-wide select-none">
          {message}
        </div>
      )}
    </div>
  );
}

export default MorphingSquare;
