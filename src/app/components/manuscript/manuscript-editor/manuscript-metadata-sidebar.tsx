import React from "react";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { Scene } from "@/lib/novels";
import { ViewMode } from "@/app/components/manuscript/view-mode-selector";

interface ViewInfo {
  title: string;
  subtitle: string;
  wordCount: number;
  sceneCount: number;
}

interface ManuscriptMetadataSidebarProps {
  selectedScene: Scene | null;
  viewMode: ViewMode;
  viewInfo: ViewInfo;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  width: string;
}

export const ManuscriptMetadataSidebar: React.FC<
  ManuscriptMetadataSidebarProps
> = ({
  selectedScene,
  viewMode,
  viewInfo,
  isCollapsed,
  onToggleCollapse,
  width,
}) => {
  return (
    <div
      className="fixed top-0 right-0 bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-300 z-20"
      style={{ width, height: "100vh" }}
    >
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggleCollapse}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {!isCollapsed && (
            <div className="flex-1 ml-3">
              <h2 className="text-lg font-semibold text-white">
                {viewMode === "scene" ? "Scene Details" : "Content Details"}
              </h2>
              <p className="text-sm text-gray-400">
                {viewMode === "scene"
                  ? "Metadata and tools"
                  : `${viewMode} overview`}
              </p>
            </div>
          )}

          {isCollapsed && <Settings className="w-6 h-6 text-red-500 mx-auto" />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex-1 p-4">
          {selectedScene ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  View Mode
                </label>
                <div className="text-sm text-gray-400 capitalize">
                  {viewMode} view
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Word Count
                </label>
                <div className="text-sm text-gray-400">
                  {viewInfo.wordCount.toLocaleString()} words
                </div>
              </div>

              {viewMode === "scene" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <div className="text-sm text-gray-400">
                      {selectedScene.status}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      POV Character
                    </label>
                    <div className="text-sm text-gray-400">
                      {selectedScene.povCharacter || "Not set"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Scene Type
                    </label>
                    <div className="text-sm text-gray-400">
                      {selectedScene.sceneType || "Not set"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notes
                    </label>
                    <div className="text-sm text-gray-400">
                      {selectedScene.notes || "No notes"}
                    </div>
                  </div>
                </>
              )}

              {viewMode !== "scene" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Scenes Included
                  </label>
                  <div className="text-sm text-gray-400">
                    {viewInfo.sceneCount} scenes combined
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>Select a scene to view details</p>
            </div>
          )}
        </div>
      )}

      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center pt-4 space-y-4">
          <button
            onClick={onToggleCollapse}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Expand Details"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
