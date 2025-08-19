// src/app/components/manuscript/manuscript-editor/content-views/grid-view/scene-grid.tsx
// ✨ ENHANCED: Added act naming, chapter focus buttons, and improved titles

import React from "react";
import { Scene, NovelWithStructure, Chapter, Act } from "@/lib/novels";
import { SceneCard } from "./";
import { EditableText } from "@/app/components/ui";
import { AggregatedContent } from "@/app/components/manuscript/manuscript-editor/services/";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/";
import { Eye } from "lucide-react";

interface SceneGridProps {
  aggregatedContent: AggregatedContent;
  viewMode: ViewMode;
  onSceneClick: (sceneId: string, scene: Scene) => void;
  onSceneRename?: (sceneId: string, newTitle: string) => Promise<void>;
  onChapterRename?: (chapterId: string, newTitle: string) => Promise<void>;
  onChapterClick?: (chapter: Chapter) => void; // ✨ NEW: For focus button
  onActRename?: (actId: string, newTitle: string) => Promise<void>; // ✨ NEW: For act renaming
  novel?: NovelWithStructure | null | undefined;
}

// ✨ Helper function to find chapter object from novel structure
const findChapterFromSection = (
  novel: NovelWithStructure | null | undefined,
  section: { scenes: Scene[]; id: string; title: string; wordCount: number }
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

// ✨ Helper function to find act from chapter ID
const findActFromChapter = (
  novel: NovelWithStructure | null | undefined,
  chapterId: string
): Act | null => {
  if (!novel?.acts) return null;

  for (const act of novel.acts) {
    if (act.chapters.some((chapter) => chapter.id === chapterId)) {
      return act;
    }
  }
  return null;
};

export const SceneGrid: React.FC<SceneGridProps> = ({
  aggregatedContent,
  viewMode,
  onSceneClick,
  onSceneRename,
  onChapterRename,
  onChapterClick, // ✨ NEW: Chapter focus handler
  onActRename, // ✨ NEW: Act rename handler
  novel,
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

  // ✨ ENHANCED: For chapter view - show all scenes in the chapter with editable title
  if (viewMode === "chapter") {
    const section = aggregatedContent.sections[0];
    const scenes = section.scenes;

    // ✨ Find the actual chapter object for editing
    const chapterInfo = findChapterFromSection(novel, section);
    const actInfo = chapterInfo
      ? findActFromChapter(novel, chapterInfo.id)
      : null;

    return (
      <div className="p-6">
        <div className="mb-4">
          {/* ✨ ENHANCED: Chapter header with ACT and CHAPTER info */}
          {onChapterRename && chapterInfo && actInfo ? (
            <div className="mb-2">
              {/* ✨ Act and Chapter identifier line */}
              <div className="text-sm text-gray-400 mb-1">
                ACT{actInfo.order} - {actInfo.title}, CH{chapterInfo.order}
              </div>

              <EditableText
                value={chapterInfo.title}
                onSave={(newTitle) => onChapterRename(chapterInfo.id, newTitle)}
                placeholder="Chapter title"
                className="text-xl text-white font-medium"
                maxLength={200}
              />
            </div>
          ) : (
            <div>
              {/* ✨ Show act and chapter info even when not editable */}
              {chapterInfo && actInfo && (
                <div className="text-sm text-gray-400 mb-1">
                  ACT{actInfo.order} - {actInfo.title}, CH{chapterInfo.order}
                </div>
              )}
              <h2 className="text-xl text-white font-medium mb-2">
                {section.title}
              </h2>
            </div>
          )}

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

  // ✨ ENHANCED: Act view with act renaming and chapter focus functionality
  if (viewMode === "act") {
    // Find the actual act from the first section
    const firstSection = aggregatedContent.sections[0];
    const firstChapter = findChapterFromSection(novel, firstSection);
    const actInfo = firstChapter
      ? findActFromChapter(novel, firstChapter.id)
      : null;

    return (
      <div className="p-6">
        <div className="mb-6">
          {/* ✨ ENHANCED: Act header with rename capability */}
          {onActRename && actInfo ? (
            <div className="mb-2">
              <div className="text-sm text-gray-400 mb-1">
                ACT{actInfo.order}
              </div>
              <EditableText
                value={actInfo.title}
                onSave={(newTitle) => onActRename(actInfo.id, newTitle)}
                placeholder="Act title"
                className="text-2xl text-white font-medium"
                maxLength={200}
              />
            </div>
          ) : (
            <div>
              {actInfo && (
                <div className="text-sm text-gray-400 mb-1">
                  ACT{actInfo.order}
                </div>
              )}
              <h1 className="text-2xl text-white font-medium mb-2">
                {actInfo?.title ||
                  aggregatedContent.sections[0]?.title ||
                  "Act"}
              </h1>
            </div>
          )}

          <p className="text-gray-400 text-sm">
            {aggregatedContent.sections.length} chapter
            {aggregatedContent.sections.length !== 1 ? "s" : ""} •{" "}
            {aggregatedContent.totalWordCount.toLocaleString()} words
          </p>
        </div>

        <div className="space-y-8">
          {aggregatedContent.sections.map((section, sectionIndex) => {
            // ✨ Find the actual chapter object
            const chapterInfo = findChapterFromSection(novel, section);

            return (
              <div key={section.id} className="space-y-4">
                {/* ✨ ENHANCED: Chapter header with rename capability and focus button */}
                <div className="border-b border-gray-700 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {onChapterRename && chapterInfo ? (
                        <div className="mb-1">
                          <div className="text-sm text-gray-400 mb-1">
                            CH{chapterInfo.order}
                          </div>
                          <EditableText
                            value={chapterInfo.title}
                            onSave={(newTitle) =>
                              onChapterRename(chapterInfo.id, newTitle)
                            }
                            placeholder="Chapter title"
                            className="text-xl text-white font-medium"
                            maxLength={200}
                          />
                        </div>
                      ) : (
                        <div>
                          {chapterInfo && (
                            <div className="text-sm text-gray-400 mb-1">
                              CH{chapterInfo.order}
                            </div>
                          )}
                          <h2 className="text-xl text-white font-medium">
                            {section.title}
                          </h2>
                        </div>
                      )}
                      <p className="text-gray-400 text-sm mt-1">
                        {section.scenes.length} scene
                        {section.scenes.length !== 1 ? "s" : ""} •{" "}
                        {section.wordCount.toLocaleString()} words
                      </p>
                    </div>

                    {/* ✨ NEW: Focus button for chapters in act view */}
                    {onChapterClick && chapterInfo && (
                      <button
                        onClick={() => onChapterClick(chapterInfo)}
                        className="ml-4 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-md transition-colors flex items-center space-x-2"
                        title="Focus on this chapter"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Focus</span>
                      </button>
                    )}
                  </div>
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
