// app/components/characters/character-detail/character-detail-sidebar.tsx
// Sidebar navigation for character detail sections

import React from "react";
import { User, Timeline, Users, FileText, Badge } from "lucide-react";

interface CharacterDetailSidebarProps {
  activeTab: "profile" | "states" | "relationships" | "manuscript";
  onTabChange: (
    tab: "profile" | "states" | "relationships" | "manuscript"
  ) => void;
  character: any;
  states: any[];
}

export const CharacterDetailSidebar: React.FC<CharacterDetailSidebarProps> = ({
  activeTab,
  onTabChange,
  character,
  states,
}) => {
  const tabs = [
    {
      id: "profile" as const,
      label: "Profile",
      icon: User,
      description: "Basic information & background",
      count: null,
    },
    {
      id: "states" as const,
      label: "Character Evolution",
      icon: Timeline,
      description: "Character states across story",
      count: states.length,
    },
    {
      id: "relationships" as const,
      label: "Relationships",
      icon: Users,
      description: "Connections with other characters",
      count: 0, // TODO: Get actual relationship count
    },
    {
      id: "manuscript" as const,
      label: "Manuscript Integration",
      icon: FileText,
      description: "POV scenes & appearances",
      count: null, // TODO: Get POV scene count
    },
  ];

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-white mb-6">
          Character Details
        </h2>

        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  isActive
                    ? "bg-red-900/30 border border-red-700 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Icon
                    className={`w-5 h-5 mt-0.5 ${
                      isActive ? "text-red-400" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{tab.label}</span>
                      {tab.count !== null && (
                        <Badge
                          variant={isActive ? "primary" : "secondary"}
                          className="text-xs"
                        >
                          {tab.count}
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        isActive ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {tab.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Character Quick Stats */}
        <div className="mt-8 p-4 bg-gray-700/50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Quick Stats
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Species</span>
              <span className="text-gray-200">{character.species}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">States</span>
              <span className="text-gray-200">{states.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">POV Scenes</span>
              <span className="text-gray-200">0</span>{" "}
              {/* TODO: Get actual count */}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Relationships</span>
              <span className="text-gray-200">0</span>{" "}
              {/* TODO: Get actual count */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Badge component if not available in UI
const Badge: React.FC<{
  variant: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
}> = ({ variant, className = "", children }) => {
  const baseClasses =
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
  const variantClasses = {
    primary: "bg-red-900/50 text-red-300",
    secondary: "bg-gray-600 text-gray-300",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
