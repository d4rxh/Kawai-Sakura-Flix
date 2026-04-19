import { motion } from "motion/react";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ 
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] // ease-smooth
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
