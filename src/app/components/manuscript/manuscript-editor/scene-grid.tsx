import React from "react";
import { Scene } from "@/lib/novels";
import { SceneCard } from "./scene-card";
import { AggregatedContent } from "@/app/components/manuscript/content-aggregation-service";
import { ViewMode } from "@/app/components/manuscript/view-mode-selector";

interface SceneGridProps {
  aggregatedContent: AggregatedContent;
  viewMode: ViewMode;
  onSceneClick: (sceneId: string, scene: Scene) => void;
}

export const SceneGrid: React.FC<SceneGridProps> = ({
  aggregatedContent,
  viewMode,
  onSceneClick,
}) => {
  if (!aggregatedContent || aggregatedContent.sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">📄</div>
          <p className="text-gray-400">No scenes to display</p>
        </div>
      </div>
    );
  }

  // For chapter view: show all scenes in the chapter (single section)
  if (viewMode === "chapter") {
    const section = aggregatedContent.sections[0];
    const scenes = section.scenes;

    return (
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-xl text-white font-medium mb-2">
            {section.title}
          </h2>
          <p className="text-gray-400 text-sm">
            {scenes.length} scene{scenes.length !== 1 ? "s" : ""} •{" "}
            {aggregatedContent.totalWordCount.toLocaleString()} words
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {scenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              onClick={() => onSceneClick(scene.id, scene)}
              showChapterContext={false}
            />
          ))}
        </div>

        {scenes.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p>No scenes in this chapter</p>
          </div>
        )}
      </div>
    );
  }

  // For act view: each section represents a chapter
  if (viewMode === "act") {
    // ✨ FIXED: Extract full act name (including subtitle) from the first section title
    const firstSectionTitle = aggregatedContent.sections[0]?.title || "";
    // Extract "ACT I: The Island" from "ACT I: The Island: Chapter 1 — A Taste of Lightning"
    const actNameMatch = firstSectionTitle.match(/^([^:]+:[^:]+)/);
    const actName = actNameMatch
      ? actNameMatch[1]
      : firstSectionTitle.split(":")[0] || "Act Overview";

    // Calculate total scenes across all chapters
    const totalScenes = aggregatedContent.sections.reduce(
      (total, section) => total + section.scenes.length,
      0
    );

    return (
      <div className="p-6">
        {/* ✨ FIXED: Show act overview once at the top */}
        <div className="mb-6">
          <h2 className="text-xl text-white font-medium mb-2">{actName}</h2>
          <p className="text-gray-400 text-sm">
            {aggregatedContent.sections.length} chapter
            {aggregatedContent.sections.length !== 1 ? "s" : ""} • {totalScenes}{" "}
            scene{totalScenes !== 1 ? "s" : ""} •{" "}
            {aggregatedContent.totalWordCount.toLocaleString()} words
          </p>
        </div>

        {/* ✨ FIXED: Display each section as a chapter */}
        <div className="space-y-8">
          {aggregatedContent.sections.map((section, index) => {
            // ✨ EXTRACT: Get just the chapter part from "ACT I: The Island: Chapter 1 — A Taste of Lightning"
            const fullTitle = section.title;
            let chapterTitle = fullTitle;

            // Remove act prefix if present (everything before and including the second colon)
            const colonCount = (fullTitle.match(/:/g) || []).length;
            if (colonCount >= 2) {
              const parts = fullTitle.split(":");
              // Take everything after the second colon
              chapterTitle = parts.slice(2).join(":").trim();
            } else if (colonCount === 1) {
              // If only one colon, take everything after it
              chapterTitle = fullTitle.split(":")[1]?.trim() || fullTitle;
            }

            return (
              <div key={section.id}>
                {/* Chapter header */}
                <div className="mb-4 pb-2 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">
                    {chapterTitle}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {section.scenes.length} scene
                    {section.scenes.length !== 1 ? "s" : ""} •{" "}
                    {section.wordCount.toLocaleString()} words
                  </p>
                </div>

                {/* Scenes grid for this chapter */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {section.scenes.map((scene) => (
                    <SceneCard
                      key={scene.id}
                      scene={scene}
                      onClick={() => onSceneClick(scene.id, scene)}
                      showChapterContext={false} // Don't show chapter context when already grouped
                    />
                  ))}
                </div>

                {/* Empty state for chapter with no scenes */}
                {section.scenes.length === 0 && (
                  <div className="text-center text-gray-400 py-8 border border-gray-700 rounded-lg border-dashed">
                    <p>No scenes in this chapter</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state for act with no chapters */}
        {aggregatedContent.sections.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p>No chapters in this act</p>
          </div>
        )}
      </div>
    );
  }

  // Fallback for scene view (shouldn't happen, but just in case)
  return null;
};
