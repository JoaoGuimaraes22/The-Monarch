// chapter-tree/tree-item.tsx
import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { BaseTreeItemProps } from "./types";

export const TreeItem: React.FC<BaseTreeItemProps> = ({
  level,
  children,
  isExpanded,
  onToggle,
  isSelected,
  onClick,
  icon,
  title,
  subtitle,
  actions,
  className = "",
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div>
      <div
        className={`flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer group transition-colors ${
          isSelected
            ? "bg-red-900 text-white border border-red-700"
            : "hover:bg-gray-700 text-gray-300"
        } ${className}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={onClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Expand/Collapse Button */}
        {onToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-0.5 hover:bg-gray-600 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        )}

        {/* Icon */}
        <div className="flex-shrink-0">{icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{title}</div>
          {subtitle && (
            <div className="text-xs text-gray-400 truncate">{subtitle}</div>
          )}
        </div>

        {/* Actions */}
        {actions && showActions && (
          <div className="flex-shrink-0">{actions}</div>
        )}
      </div>

      {/* Children */}
      {isExpanded && children && <div className="mt-1">{children}</div>}
    </div>
  );
};
