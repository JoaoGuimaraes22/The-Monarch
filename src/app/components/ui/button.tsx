// app/components/ui/button.tsx
// Updated Button component with optional children and icon-only support

import React from "react";
import { LucideIcon, Loader2 } from "lucide-react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  children?: React.ReactNode; // ✅ Made optional
  disabled?: boolean;
  loading?: boolean;
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
  loading = false,
  onClick,
  icon: Icon,
  iconPosition = "left",
  className = "",
  type = "button",
}) => {
  // Button is disabled if explicitly disabled OR loading
  const isDisabled = disabled || loading;

  // Check if this is an icon-only button
  const isIconOnly = Icon && !children;

  // Base styles that all buttons share
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Size variations - adjusted for icon-only buttons
  const sizeStyles = {
    sm: isIconOnly ? "p-1.5 rounded-md" : "px-3 py-1.5 text-sm rounded-md",
    md: isIconOnly ? "p-2 rounded-lg" : "px-4 py-2 text-sm rounded-lg",
    lg: isIconOnly ? "p-3 rounded-lg" : "px-6 py-3 text-base rounded-lg",
    xl: isIconOnly ? "p-4 rounded-xl" : "px-8 py-4 text-lg rounded-xl",
  };

  // Color/variant styles using your established dark theme
  const variantStyles = {
    primary:
      "bg-red-700 text-white hover:bg-red-800 focus:ring-red-500 shadow-lg hover:shadow-xl",
    secondary:
      "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 shadow-lg hover:shadow-xl",
    outline:
      "border-2 border-red-700 text-red-700 hover:bg-red-700 hover:text-white focus:ring-red-500",
    ghost:
      "text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-red-500",
    danger:
      "bg-red-900 text-white hover:bg-red-950 focus:ring-red-500 shadow-lg",
  };

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  // Determine which icon to show
  const DisplayIcon = loading ? Loader2 : Icon;

  // Icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "w-3 h-3";
      case "md":
        return "w-4 h-4";
      case "lg":
        return "w-5 h-5";
      case "xl":
        return "w-6 h-6";
      default:
        return "w-4 h-4";
    }
  };

  const iconClassName = loading
    ? `${getIconSize()} animate-spin`
    : getIconSize();

  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={isDisabled}
      onClick={onClick}
    >
      {/* Icon-only button */}
      {isIconOnly && DisplayIcon && <DisplayIcon className={iconClassName} />}

      {/* Button with text (and optional icon) */}
      {!isIconOnly && (
        <>
          {/* Left icon */}
          {DisplayIcon && iconPosition === "left" && (
            <DisplayIcon
              className={`${iconClassName} ${children ? "mr-2" : ""}`}
            />
          )}

          {/* Button text */}
          {children}

          {/* Right icon */}
          {DisplayIcon && iconPosition === "right" && (
            <DisplayIcon
              className={`${iconClassName} ${children ? "ml-2" : ""}`}
            />
          )}
        </>
      )}
    </button>
  );
};
