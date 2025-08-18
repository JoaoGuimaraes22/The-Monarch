// src/app/components/ui/status-indicator.tsx
// Reusable status indicator component for scenes, chapters, etc.

import React from "react";

interface StatusIndicatorProps {
  status: string;
  variant?: "default" | "compact" | "detailed";
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export interface StatusConfig {
  icon: string;
  color: string;
  label: string;
  description?: string;
}

// Centralized status configurations
export const STATUS_CONFIGS: Record<string, StatusConfig> = {
  draft: {
    icon: "📄",
    color: "text-gray-400",
    label: "Draft",
    description: "Work in progress",
  },
  review: {
    icon: "📝",
    color: "text-yellow-400",
    label: "Review",
    description: "Ready for review",
  },
  revision: {
    icon: "📝",
    color: "text-yellow-400",
    label: "Revision",
    description: "Needs revision",
  },
  complete: {
    icon: "✅",
    color: "text-green-400",
    label: "Complete",
    description: "Finished and approved",
  },
  completed: {
    icon: "✅",
    color: "text-green-400",
    label: "Completed",
    description: "Finished and approved",
  },
  published: {
    icon: "🚀",
    color: "text-blue-400",
    label: "Published",
    description: "Live and published",
  },
  archived: {
    icon: "📦",
    color: "text-gray-500",
    label: "Archived",
    description: "Archived content",
  },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  variant = "default",
  showIcon = true,
  showText = true,
  className = "",
}) => {
  const config = STATUS_CONFIGS[status.toLowerCase()] || STATUS_CONFIGS.draft;

  if (variant === "compact") {
    return (
      <span className={`inline-flex items-center space-x-1 ${className}`}>
        {showIcon && <span className="text-xs">{config.icon}</span>}
        {showText && (
          <span className={`text-xs ${config.color}`}>{config.label}</span>
        )}
      </span>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showIcon && <span className="text-sm">{config.icon}</span>}
        <div>
          {showText && (
            <div className={`text-sm font-medium ${config.color}`}>
              {config.label}
            </div>
          )}
          {config.description && (
            <div className="text-xs text-gray-500">{config.description}</div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <span className={`inline-flex items-center space-x-1 ${className}`}>
      {showIcon && <span>{config.icon}</span>}
      {showText && (
        <span className={`text-sm ${config.color}`}>{config.label}</span>
      )}
    </span>
  );
};
