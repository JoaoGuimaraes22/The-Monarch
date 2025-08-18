// src/app/components/manuscript/manuscript-editor/content-views/grid-view/scene-grid.tsx
// ✨ ENHANCED: Added scene and chapter rename functionality

import React from "react";
import { Scene, NovelWithStructure, Chapter, Act } from "@/lib/novels";
import { SceneCard } from "./";
import { EditableText } from "@/app/components/ui";
import { AggregatedContent } from "@/app/components/manuscript/manuscript-editor/services/";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/";

interface SceneGridProps {
  aggregatedContent: AggregatedContent;
  viewMode: ViewMode;
  onSceneClick: (sceneId: string, scene: Scene) => void;
  onSceneRename?: (sceneId: string, newTitle: string) => Promise<void>; // ✨ Scene rename handler
  onChapterRename?: (chapterId: string, newTitle: string) => Promise<void>; // ✨ NEW: Chapter rename handler
  novel?: NovelWithStructure | null; // ✨ NEW: Access to novel data for finding chapters
}

// ✨ NEW: Helper function to find chapter object from novel structure
const findChapterFromSection = (
  novel: NovelWithStructure | null,
  section: any
): Chapter | null => {
  if (!novel?.acts) return null;

  // Find chapter by matching scenes
  for (const act of novel.acts) {
    for (const chapter of act.chapters) {
      // Check if this chapter contains the scenes from this section
      if (
        section.scenes.some((sectionScene: Scene) =>
          chapter.scenes.some(
            (chapterScene) => chapterScene.id === sectionScene.id
          )
        )
      ) {
        return chapter;
      }
    }
  }
  return null;
};

export const SceneGrid: React.FC<SceneGridProps> = ({
  aggregatedContent,
  viewMode,
  onSceneClick,
  onSceneRename,
  onChapterRename, // ✨ NEW: Chapter rename handler
  novel, // ✨ NEW: Novel data
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
              onRename={onSceneRename}
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

  // ✨ ENHANCED: Act view with chapter rename functionality
  if (viewMode === "act") {
    // Extract act name from first section title
    const firstSectionTitle = aggregatedContent.sections[0]?.title || "";
    const actNameMatch = firstSectionTitle.match(/^([^:]+:[^:]+)/);
    const actName = actNameMatch
      ? actNameMatch[1]
      : aggregatedContent.sections[0]?.title || "Act";

    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl text-white font-medium mb-2">{actName}</h1>
          <p className="text-gray-400 text-sm">
            {aggregatedContent.sections.length} chapter
            {aggregatedContent.sections.length !== 1 ? "s" : ""} •{" "}
            {aggregatedContent.totalWordCount.toLocaleString()} words
          </p>
        </div>

        <div className="space-y-8">
          {aggregatedContent.sections.map((section, sectionIndex) => {
            // Extract chapter name from section title
            const chapterMatch = section.title.match(/:([^:]+)$/);
            const chapterName = chapterMatch
              ? chapterMatch[1].trim()
              : `Chapter ${sectionIndex + 1}`;

            // ✨ NEW: Find the actual chapter object
            const chapterInfo = findChapterFromSection(novel, section);

            return (
              <div key={section.id} className="space-y-4">
                {/* ✨ ENHANCED: Chapter header with rename capability */}
                <div className="border-b border-gray-700 pb-2">
                  {onChapterRename && chapterInfo ? (
                    <div className="mb-1">
                      <EditableText
                        value={chapterInfo.title}
                        onSave={(newTitle) =>
                          onChapterRename(chapterInfo.id, newTitle)
                        }
                        placeholder="Chapter title"
                        className="text-lg text-white font-medium"
                        maxLength={200}
                      />
                    </div>
                  ) : (
                    <h3 className="text-lg text-white font-medium mb-1">
                      {chapterName}
                    </h3>
                  )}

                  <p className="text-gray-400 text-sm">
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
                      onRename={onSceneRename}
                      showChapterContext={false}
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
