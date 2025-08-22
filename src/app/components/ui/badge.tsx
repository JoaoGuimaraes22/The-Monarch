// app/components/ui/badge.tsx
// Updated Badge component with outline variant

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "outline"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "royal";
  size?: "xs" | "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "sm",
  className = "",
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full";

  const sizeStyles = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const variantStyles = {
    default: "bg-gray-100 text-gray-800",
    outline: "border border-gray-600 text-gray-300 bg-transparent",
    primary: "bg-red-100 text-red-800",
    secondary: "bg-amber-100 text-amber-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    royal: "bg-gradient-to-r from-red-100 to-amber-100 text-red-900",
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
