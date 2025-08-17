import React from "react";
import { FileText, BookOpen, Users } from "lucide-react";

export type ViewMode = "scene" | "chapter" | "act";

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  disabled?: boolean;
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  viewMode,
  onViewModeChange,
  disabled = false,
}) => {
  const modes = [
    { id: "scene" as const, label: "Scene", icon: FileText },
    { id: "chapter" as const, label: "Chapter", icon: BookOpen },
    { id: "act" as const, label: "Act", icon: Users },
  ];

  return (
    <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = viewMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => onViewModeChange(mode.id)}
            disabled={disabled}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm transition-colors ${
              isActive
                ? "bg-red-600 text-white"
                : disabled
                ? "text-gray-500 cursor-not-allowed"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};
