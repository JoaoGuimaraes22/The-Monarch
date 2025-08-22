// app/components/ui/button.tsx
// Updated Button component with loading support and enhanced features

import React from "react";
import { LucideIcon, Loader2 } from "lucide-react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean; // ✨ NEW: Add loading support
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  disabled = false,
  loading = false, // ✨ NEW: Default to false
  onClick,
  icon: Icon,
  iconPosition = "left",
  className = "",
  type = "button",
}) => {
  // Button is disabled if explicitly disabled OR loading
  const isDisabled = disabled || loading;

  // Base styles that all buttons share
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Size variations
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
    xl: "px-8 py-4 text-lg rounded-xl",
  };

  // Color/variant styles using royal dark fantasy palette
  const variantStyles = {
    primary:
      "bg-red-700 text-white hover:bg-red-800 focus:ring-red-500 shadow-lg hover:shadow-xl",
    secondary:
      "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 shadow-lg hover:shadow-xl",
    outline:
      "border-2 border-red-700 text-red-700 hover:bg-red-700 hover:text-white focus:ring-red-500",
    ghost: "text-red-700 hover:bg-red-50 focus:ring-red-500",
    danger:
      "bg-red-900 text-white hover:bg-red-950 focus:ring-red-500 shadow-lg",
  };

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  // ✨ NEW: Determine which icon to show
  const DisplayIcon = loading ? Loader2 : Icon;
  const iconClassName = loading ? "w-4 h-4 animate-spin" : "w-4 h-4";

  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={isDisabled}
      onClick={onClick}
    >
      {/* Left icon (including loading spinner) */}
      {DisplayIcon && iconPosition === "left" && (
        <DisplayIcon className={`${iconClassName} mr-2`} />
      )}

      {/* Button text */}
      {children}

      {/* Right icon (including loading spinner) */}
      {DisplayIcon && iconPosition === "right" && (
        <DisplayIcon className={`${iconClassName} ml-2`} />
      )}
    </button>
  );
};
