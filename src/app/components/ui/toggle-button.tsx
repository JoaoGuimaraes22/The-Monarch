// src/app/components/ui/toggle-button.tsx
// Reusable expand/collapse toggle button component

import React from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
} from "lucide-react";

interface ToggleButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
  direction?: "down" | "right" | "up" | "left";
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "subtle" | "bordered";
  disabled?: boolean;
  className?: string;
  title?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  isExpanded,
  onToggle,
  direction = "down",
  size = "md",
  variant = "ghost",
  disabled = false,
  className = "",
  title,
}) => {
  // Icon selection based on direction and state
  const getIcon = () => {
    const iconClass = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    }[size];

    switch (direction) {
      case "down":
        return isExpanded ? (
          <ChevronDown className={iconClass} />
        ) : (
          <ChevronRight className={iconClass} />
        );
      case "right":
        return isExpanded ? (
          <ChevronRight className={iconClass} />
        ) : (
          <ChevronDown className={iconClass} />
        );
      case "up":
        return isExpanded ? (
          <ChevronUp className={iconClass} />
        ) : (
          <ChevronRight className={iconClass} />
        );
      case "left":
        return isExpanded ? (
          <ChevronLeft className={iconClass} />
        ) : (
          <ChevronDown className={iconClass} />
        );
      default:
        return <ChevronRight className={iconClass} />;
    }
  };

  // Button styling based on variant and size
  const getButtonClass = () => {
    const baseClass =
      "inline-flex items-center justify-center transition-colors";

    const sizeClass = {
      sm: "p-0.5",
      md: "p-1",
      lg: "p-2",
    }[size];

    const variantClass = {
      ghost: "text-gray-400 hover:text-white hover:bg-gray-600 rounded",
      subtle: "text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 rounded",
      bordered:
        "text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded",
    }[variant];

    const disabledClass = disabled
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer";

    return `${baseClass} ${sizeClass} ${variantClass} ${disabledClass} ${className}`;
  };

  // Generate title text if not provided
  const buttonTitle = title || (isExpanded ? "Collapse" : "Expand");

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={getButtonClass()}
      title={buttonTitle}
      type="button"
    >
      {getIcon()}
    </button>
  );
};
