import React from "react";

import { cn } from "@/lib/utils";

type RainbowButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function RainbowButton({
  children,
  className,
  ...props
}: RainbowButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex h-12 cursor-pointer items-center justify-center rounded-full px-8 py-3 font-medium transition-all duration-300",
        // Glass effect
        "bg-white/[0.05] backdrop-blur-md",
        "border border-white/[0.15]",
        "shadow-[0_8px_32px_0_rgba(0,200,200,0.15)]",
        // Hover effects
        "hover:bg-white/[0.08] hover:border-white/[0.25] hover:shadow-[0_8px_40px_0_rgba(0,200,200,0.25)]",
        "hover:scale-[1.02]",
        // Focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {/* Gradient text */}
      <span className="relative z-10 flex items-center bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent font-semibold">
        {children}
      </span>

      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
}
