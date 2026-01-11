import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "motion/react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function GlassButton({ 
  children, 
  variant = "primary", 
  size = "md",
  className = "",
  ...props 
}: GlassButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    secondary: "bg-[var(--glass-background)] border border-[var(--glass-border)] backdrop-blur-[12px]",
    ghost: "hover:bg-[var(--glass-background)] hover:backdrop-blur-[12px]"
  };

  return (
    <motion.button
      className={`
        rounded-xl transition-all duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
