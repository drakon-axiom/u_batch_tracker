import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-zinc-800 text-zinc-300 ring-zinc-700",
        secondary:   "bg-zinc-800/60 text-zinc-400 ring-zinc-700/50",
        success:     "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
        warning:     "bg-amber-500/10 text-amber-400 ring-amber-500/20",
        destructive: "bg-red-500/10 text-red-400 ring-red-500/20",
        teal:        "bg-teal-500/10 text-teal-400 ring-teal-500/20",
        indigo:      "bg-indigo-500/10 text-indigo-400 ring-indigo-500/20",
        outline:     "text-zinc-400 ring-zinc-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
