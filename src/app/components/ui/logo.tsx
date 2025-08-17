import React from "react";
import { Crown } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "light" | "dark";
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  className = "",
  variant = "light",
}) => {
  const sizeStyles = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  } as const;

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  } as const;

  const variantStyles = {
    light: "text-white",
    dark: "text-gray-900",
  } as const;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Crown className={`${iconSizes[size]} text-amber-400`} />
      <span
        className={`${sizeStyles[size]} font-bold ${variantStyles[variant]}`}
      >
        The Monarch
      </span>
    </div>
  );
};
