import { motion, HTMLMotionProps } from "motion/react";

interface SmoothTextProps extends HTMLMotionProps<"div"> {
  text: string;
  delay?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
}

export function SmoothText({ text, delay = 0, className = "", as = "div", ...props }: SmoothTextProps) {
  const Component = motion.create(as as any);
  
  return (
    <Component 
      className={`overflow-hidden inline-block ${className}`}
      {...(props as any)}
    >
      <motion.div
        initial={{ y: "150%", rotate: 2 }}
        animate={{ y: "0%", rotate: 0 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.16, 1, 0.3, 1], // Expo ease out
          delay 
        }}
        className="origin-top-left"
      >
        {text}
      </motion.div>
    </Component>
  );
}
