import { ReactNode } from "react";
import { motion } from "motion/react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = "", hover = false, onClick }: GlassCardProps) {
  const Component = onClick ? motion.button : motion.div;
  
  return (
    <Component
      onClick={onClick}
      className={`
        relative backdrop-blur-[12px] rounded-2xl border
        bg-[var(--glass-background)] border-[var(--glass-border)]
        shadow-[var(--glass-shadow)]
        ${hover ? "hover:scale-[1.02] hover:shadow-xl transition-all duration-300" : ""}
        ${className}
      `}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </Component>
  );
}
