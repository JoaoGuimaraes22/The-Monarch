// src/app/components/manuscript/manuscript-editor/layout/manuscript-metadata-sidebar.tsx
// Updated to use shared components

import React from "react";
import { Settings, Tag } from "lucide-react";
import {
  CollapsibleSidebar,
  StatusIndicator,
  WordCountDisplay,
} from "@/app/components/ui";
import { Scene, UpdateSceneMetadata } from "@/lib/novels";
import { ViewMode } from "../controls/view-mode-selector";

interface ViewInfo {
  title: string;
  subtitle: string;
  wordCount: number;
  sceneCount: number;
}

interface ManuscriptMetadataSidebarProps {
  selectedScene: Scene | null;
  viewMode: ViewMode;
  viewInfo: ViewInfo | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  right: string;
  width: string;
  onSceneMetadataUpdate?: (
    sceneId: string,
    metadata: UpdateSceneMetadata
  ) => void;
}

export const ManuscriptMetadataSidebar: React.FC<
  ManuscriptMetadataSidebarProps
> = ({
  selectedScene,
  viewMode,
  viewInfo,
  isCollapsed,
  onToggleCollapse,
  right,
  width,
  onSceneMetadataUpdate,
}) => {
  // Collapsed content
  const collapsedContent = (
    <button
      onClick={onToggleCollapse}
      className="p-2 text-gray-400 hover:text-white transition-colors"
      title="Expand Details"
    >
      <Settings className="w-5 h-5" />
    </button>
  );

  return (
    <CollapsibleSidebar
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      title="Scene Details"
      subtitle="Metadata and properties"
      icon={Settings}
      position="right"
      width={width}
      right={right}
      collapsedContent={collapsedContent}
      className="z-20"
    >
      <div className="p-4 space-y-6">
        {selectedScene && viewInfo ? (
          <div className="space-y-6">
            {/* Scene Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white border-b border-gray-700 pb-2">
                Scene Information
              </h4>

              {/* Word Count with Reading Time */}
              <WordCountDisplay
                count={selectedScene.wordCount}
                variant="detailed"
                showIcon
                showReadingTime
                label="Word Count"
                className="p-3 bg-gray-700/50 rounded-lg"
              />

              {/* Scene Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <StatusIndicator
                  status={selectedScene.status}
                  variant="detailed"
                  className="p-2 bg-gray-700/50 rounded-lg"
                />
              </div>

              {/* POV Character */}
              {selectedScene.povCharacter && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    POV Character
                  </label>
                  <div className="flex items-center space-x-2 p-2 bg-gray-700/50 rounded-lg">
                    <Tag className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300">
                      {selectedScene.povCharacter}
                    </span>
                  </div>
                </div>
              )}

              {/* Scene Type */}
              {selectedScene.sceneType && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Scene Type
                  </label>
                  <div className="p-2 bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-300">
                      {selectedScene.sceneType}
                    </span>
                  </div>
                </div>
              )}

              {/* Scene Notes */}
              {selectedScene.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <div className="p-2 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">
                      {selectedScene.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Multi-Scene View Information */}
            {viewMode !== "scene" && viewInfo && (
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-white mb-3">
                  {viewMode === "chapter" ? "Chapter" : "Act"} Overview
                </h4>

                {/* Combined Word Count */}
                <WordCountDisplay
                  count={viewInfo.wordCount}
                  variant="card"
                  showReadingTime
                  label={`Total ${viewMode} content`}
                  className="mb-3"
                />

                {/* Scene Count */}
                <div className="p-3 bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-300">
                    <strong>{viewInfo.sceneCount}</strong> scenes combined
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Select a scene to view details</p>
          </div>
        )}
      </div>
    </CollapsibleSidebar>
  );
};
