// src/app/components/manuscript/manuscript-editor/content-views/manuscript-content-area.tsx
// ✨ ENHANCED: Added scene rename functionality in grid view

import React from "react";
import { FileText, Plus } from "lucide-react";
import { SceneTextEditor } from "@/app/components/manuscript/manuscript-editor/scene-text-editor";
import { SceneGrid } from "./grid-view/";
import { AggregatedContent } from "@/app/components/manuscript/manuscript-editor/services/";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/";
import { Scene, Chapter, Act, NovelWithStructure } from "@/lib/novels";
import { EditableText } from "@/app/components/ui"; // ✨ NEW: Import EditableText

export type ContentDisplayMode = "document" | "grid";

interface ManuscriptContentAreaProps {
  aggregatedContent: AggregatedContent | null;
  viewMode: ViewMode;
  contentDisplayMode: ContentDisplayMode;
  onContentChange: (content: string) => void;
  onSceneClick: (sceneId: string, scene: Scene) => void;
  onSceneRename?: (sceneId: string, newTitle: string) => Promise<void>; // ✨ NEW: Scene rename handler
  onAddScene?: (chapterId: string, afterSceneId?: string) => void;
  onAddChapter?: (actId: string, afterChapterId?: string) => void;
  onChapterRename?: (chapterId: string, newTitle: string) => Promise<void>; // ✨ NEW: Chapter rename handler
  novel?: NovelWithStructure | null;
  marginLeft: string;
  marginRight: string;
}

// ✨ Helper function to find the actId for a given chapter
const findActIdForChapter = (
  novel: NovelWithStructure | null | undefined,
  chapterId: string
): string | null => {
  if (!novel?.acts) return null;

  for (const act of novel.acts) {
    if (act.chapters.some((chapter) => chapter.id === chapterId)) {
      return act.id;
    }
  }
  return null;
};

// ✨ Add Scene Button Component
const AddSceneButton: React.FC<{
  chapterId: string;
  afterSceneId?: string;
  onAddScene: (chapterId: string, afterSceneId?: string) => void;
}> = ({ chapterId, afterSceneId, onAddScene }) => {
  return (
    <div className="flex justify-center my-6">
      <button
        onClick={() => onAddScene(chapterId, afterSceneId)}
        className="flex items-center space-x-2 px-6 py-3 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800 text-gray-300 hover:border-green-500 hover:text-green-400 hover:bg-gray-750 transition-all duration-200 group"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add Scene</span>
      </button>
    </div>
  );
};

// ✨ Add Chapter Button Component
const AddChapterButton: React.FC<{
  actId: string;
  afterChapterId?: string;
  onAddChapter: (actId: string, afterChapterId?: string) => void;
}> = ({ actId, afterChapterId, onAddChapter }) => {
  return (
    <div className="flex justify-center my-8">
      <button
        onClick={() => onAddChapter(actId, afterChapterId)}
        className="flex items-center space-x-2 px-8 py-4 border-2 border-dashed border-red-600 rounded-lg bg-red-900/20 text-red-300 hover:border-red-400 hover:text-red-200 hover:bg-red-900/30 transition-all duration-200 group"
      >
        <Plus className="w-6 h-6" />
        <span className="font-medium text-lg">Add Chapter</span>
      </button>
    </div>
  );
};

// ✨ Enhanced Chapter Header Component with Rename Functionality
const ChapterHeader: React.FC<{
  chapter: Chapter;
  onChapterRename?: (chapterId: string, newTitle: string) => Promise<void>;
}> = ({ chapter, onChapterRename }) => {
  return (
    <div className="my-8 py-4 px-6 border-t-2 border-b-2 border-red-600 bg-red-900/10 rounded-lg">
      {onChapterRename ? (
        <div className="flex justify-center">
          <EditableText
            value={chapter.title}
            onSave={(newTitle) => onChapterRename(chapter.id, newTitle)}
            placeholder="Chapter title"
            className="text-xl font-bold text-red-400 text-center"
            maxLength={200}
          />
        </div>
      ) : (
        <h2 className="text-xl font-bold text-red-400 text-center">
          {chapter.title}
        </h2>
      )}
    </div>
  );
};

// ✨ Scene Header Component with Click to Edit
const SceneHeader: React.FC<{
  scene: Scene;
  showChapterContext?: boolean;
  chapterTitle?: string;
  onSceneClick: (sceneId: string, scene: Scene) => void;
}> = ({ scene, showChapterContext, chapterTitle, onSceneClick }) => {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-800 border border-gray-600 rounded-t-lg">
      <div>
        <h3 className="text-lg font-medium text-white">
          {scene.title || `Scene ${scene.order}`}
        </h3>
        {showChapterContext && chapterTitle && (
          <p className="text-sm text-blue-400">{chapterTitle}</p>
        )}
        <p className="text-sm text-gray-400">
          {scene.wordCount} words • {scene.status}
        </p>
      </div>
      <button
        onClick={() => onSceneClick(scene.id, scene)}
        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
      >
        Edit
      </button>
    </div>
  );
};

// ✨ Custom hook for scene content handling
const useSceneContentHandler = (
  sceneId: string,
  onContentChange?: (sceneId: string, content: string) => void
) => {
  return React.useCallback(
    (content: string) => {
      if (onContentChange) {
        onContentChange(sceneId, content);
      }
    },
    [sceneId, onContentChange]
  );
};

// ✨ Individual Scene Editor Component for Document View
const SceneEditor: React.FC<{
  scene: Scene;
  onSceneClick: (sceneId: string, scene: Scene) => void;
  onContentChange?: (sceneId: string, content: string) => void;
  onAddScene?: (chapterId: string, afterSceneId?: string) => void;
  chapterInfo?: Chapter;
  showChapterContext?: boolean;
  chapterTitle?: string;
}> = ({
  scene,
  onSceneClick,
  onContentChange,
  onAddScene,
  chapterInfo,
  showChapterContext = false,
  chapterTitle,
}) => {
  const handleContentChange = useSceneContentHandler(scene.id, onContentChange);

  return (
    <div>
      {/* Scene Header with Edit Button */}
      <SceneHeader
        scene={scene}
        showChapterContext={showChapterContext}
        chapterTitle={chapterTitle}
        onSceneClick={onSceneClick}
      />

      {/* Scene Editor */}
      <div className="border border-gray-600 rounded-lg overflow-hidden">
        <SceneTextEditor
          content={scene.content}
          onContentChange={handleContentChange}
          placeholder={`Scene ${scene.order} content...`}
          readOnly={false}
        />
      </div>

      {/* Add Scene Button */}
      {onAddScene && chapterInfo && (
        <AddSceneButton
          chapterId={chapterInfo.id}
          afterSceneId={scene.id}
          onAddScene={onAddScene}
        />
      )}
    </div>
  );
};

export const ManuscriptContentArea: React.FC<ManuscriptContentAreaProps> = ({
  aggregatedContent,
  viewMode,
  contentDisplayMode,
  onContentChange,
  onSceneClick,
  onSceneRename, // ✨ Scene rename handler
  onChapterRename, // ✨ NEW: Chapter rename handler
  onAddScene,
  onAddChapter,
  novel,
  marginLeft,
  marginRight,
}) => {
  // ✨ NEW: Handler for individual scene changes in multi-scene views
  const handleIndividualSceneChange = React.useCallback(
    async (sceneId: string, content: string) => {
      if (!novel) return;

      try {
        const response = await fetch(
          `/api/novels/${novel.id}/scenes/${sceneId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          }
        );

        if (response.ok) {
          console.log("Scene saved successfully:", sceneId);
        } else {
          console.error("Failed to save scene content");
        }
      } catch (error) {
        console.error("Error saving scene content:", error);
      }
    },
    [novel]
  );

  // Show empty state if no content
  if (!aggregatedContent) {
    return (
      <div
        className="flex-1 p-6 transition-all duration-300"
        style={{ marginLeft, marginRight }}
      >
        <div className="h-full bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a scene from the left panel to start viewing</p>
          </div>
        </div>
      </div>
    );
  }

  // ✨ Grid view - Enhanced with rename functionality
  if (
    (viewMode === "chapter" || viewMode === "act") &&
    contentDisplayMode === "grid"
  ) {
    return (
      <div
        className="flex-1 transition-all duration-300 overflow-y-auto"
        style={{ marginLeft, marginRight }}
      >
        <SceneGrid
          aggregatedContent={aggregatedContent}
          viewMode={viewMode}
          onSceneClick={onSceneClick}
          onSceneRename={onSceneRename} // ✨ Scene rename handler
          onChapterRename={onChapterRename} // ✨ NEW: Chapter rename handler
          novel={novel} // ✨ NEW: Pass novel data for chapter lookup
        />
      </div>
    );
  }

  // ✨ Single scene view - original behavior
  if (viewMode === "scene") {
    const section = aggregatedContent.sections[0];
    return (
      <div
        className="flex-1 p-6 transition-all duration-300"
        style={{ marginLeft, marginRight }}
      >
        <SceneTextEditor
          content={section.content}
          onContentChange={onContentChange}
          placeholder="Start writing your scene..."
          readOnly={false}
        />
      </div>
    );
  }

  // ✨ Chapter Document View - Separate Scene Editors
  if (viewMode === "chapter") {
    const section = aggregatedContent.sections[0];
    const scenes = section.scenes;

    // Find the chapter info from novel data
    const chapterInfo = novel?.acts
      ?.flatMap((act: Act) => act.chapters)
      ?.find((chapter: Chapter) =>
        section.scenes.some((s: Scene) =>
          chapter.scenes.some((cs: Scene) => cs.id === s.id)
        )
      );

    // ✨ FIX: Find actId using helper function
    const actId = chapterInfo
      ? findActIdForChapter(novel, chapterInfo.id)
      : null;

    return (
      <div
        className="flex-1 transition-all duration-300 overflow-y-auto"
        style={{ marginLeft, marginRight }}
      >
        <div className="p-6 space-y-8">
          {/* Chapter Header */}
          {chapterInfo && (
            <ChapterHeader
              chapter={chapterInfo}
              onChapterRename={onChapterRename}
            />
          )}

          {/* Individual Scene Editors */}
          {scenes.map((scene) => (
            <SceneEditor
              key={scene.id}
              scene={scene}
              onSceneClick={onSceneClick}
              onContentChange={handleIndividualSceneChange}
              onAddScene={onAddScene}
              chapterInfo={chapterInfo}
              showChapterContext={false}
            />
          ))}

          {/* Add Chapter Button at the end */}
          {onAddChapter && chapterInfo && actId && (
            <AddChapterButton
              actId={actId}
              afterChapterId={chapterInfo.id}
              onAddChapter={onAddChapter}
            />
          )}
        </div>
      </div>
    );
  }

  // ✨ Act Document View - All scenes with chapter context
  if (viewMode === "act") {
    return (
      <div
        className="flex-1 transition-all duration-300 overflow-y-auto"
        style={{ marginLeft, marginRight }}
      >
        <div className="p-6 space-y-8">
          {aggregatedContent.sections.map((section) => {
            const scenes = section.scenes;

            // Extract chapter name from section title
            const chapterMatch = section.title.match(/:([^:]+)$/);
            const chapterTitle = chapterMatch
              ? chapterMatch[1].trim()
              : "Chapter";

            // Find chapter info for this section
            const chapterInfo = novel?.acts
              ?.flatMap((act: Act) => act.chapters)
              ?.find((chapter: Chapter) =>
                section.scenes.some((s: Scene) =>
                  chapter.scenes.some((cs: Scene) => cs.id === s.id)
                )
              );

            // ✨ FIX: Find actId using helper function
            const actId = chapterInfo
              ? findActIdForChapter(novel, chapterInfo.id)
              : null;

            return (
              <div key={section.id} className="space-y-6">
                {/* Chapter Header */}
                {chapterInfo && (
                  <ChapterHeader
                    chapter={chapterInfo}
                    onChapterRename={onChapterRename}
                  />
                )}

                {/* Scenes in this chapter */}
                {scenes.map((scene) => (
                  <SceneEditor
                    key={scene.id}
                    scene={scene}
                    onSceneClick={onSceneClick}
                    onContentChange={handleIndividualSceneChange}
                    onAddScene={onAddScene}
                    chapterInfo={chapterInfo}
                    showChapterContext={true}
                    chapterTitle={chapterTitle}
                  />
                ))}

                {/* Add Chapter Button */}
                {onAddChapter && chapterInfo && actId && (
                  <AddChapterButton
                    actId={actId}
                    afterChapterId={chapterInfo.id}
                    onAddChapter={onAddChapter}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};
