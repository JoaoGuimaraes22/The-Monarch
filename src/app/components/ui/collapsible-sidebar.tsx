// src/app/components/ui/collapsible-sidebar.tsx
// Reusable collapsible sidebar component to eliminate duplication

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CollapsibleSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  position: "left" | "right";
  width: string;
  left?: string;
  right?: string;
  children: React.ReactNode;
  className?: string;
  zIndex?: number;
  collapsedContent?: React.ReactNode; // What to show when collapsed
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  title,
  subtitle,
  icon: IconComponent,
  position,
  width,
  left,
  right,
  children,
  className = "",
  zIndex = 20,
  collapsedContent,
}) => {
  const sideStyle = {
    [position]: position === "left" ? left || "0" : right || "0",
    width: isCollapsed ? "4rem" : width,
    zIndex,
  };

  const chevronIcon =
    position === "left" ? (
      isCollapsed ? (
        <ChevronRight className="w-4 h-4" />
      ) : (
        <ChevronLeft className="w-4 h-4" />
      )
    ) : isCollapsed ? (
      <ChevronLeft className="w-4 h-4" />
    ) : (
      <ChevronRight className="w-4 h-4" />
    );

  return (
    <div
      className={`fixed top-0 bg-gray-800 border-gray-700 flex flex-col transition-all duration-300 ${
        position === "left" ? "border-r" : "border-l"
      } ${className}`}
      style={{ ...sideStyle, height: "100vh" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (title || subtitle) && (
            <div className="flex items-center space-x-3">
              {IconComponent && (
                <IconComponent className="w-6 h-6 text-red-500" />
              )}
              <div>
                {title && (
                  <h2 className="text-lg font-semibold text-white">{title}</h2>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-400">{subtitle}</p>
                )}
              </div>
            </div>
          )}

          {isCollapsed && IconComponent && (
            <IconComponent className="w-6 h-6 text-red-500 mx-auto" />
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title={
              isCollapsed
                ? `Expand ${title || "sidebar"}`
                : `Collapse ${title || "sidebar"}`
            }
          >
            {chevronIcon}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed ? (
        <div className="flex-1 overflow-y-auto">{children}</div>
      ) : (
        <div className="flex-1 flex flex-col items-center pt-4 space-y-4">
          {collapsedContent}
        </div>
      )}
    </div>
  );
};
