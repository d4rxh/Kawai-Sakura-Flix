import React from "react";
import { cn } from "@/src/lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "filled" | "outlined" | "text" | "tonal";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "filled", size = "md", icon, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      filled: "bg-white text-black hover:bg-white/90 cursor-pointer border-none",
      outlined: "border border-white/10 bg-transparent text-white hover:bg-white/5 cursor-pointer",
      text: "bg-transparent text-white/60 hover:text-white transition-colors cursor-pointer",
      tonal: "bg-white/5 text-white hover:bg-white/10 cursor-pointer backdrop-blur-md"
    };

    const sizes = {
      sm: "h-8 px-4 text-xs",
      md: "h-10 px-6 text-sm",
      lg: "h-12 px-8 text-sm"
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
