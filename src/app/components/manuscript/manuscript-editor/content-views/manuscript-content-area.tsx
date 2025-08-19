// src/app/components/manuscript/manuscript-editor/content-views/manuscript-content-area.tsx
// ✅ UPDATED: Pass new props to SceneGrid for enhanced grid view functionality

import React from "react";
import { FileText, Plus } from "lucide-react";
import { SceneTextEditor } from "@/app/components/manuscript/manuscript-editor/scene-text-editor";
import { SceneGrid } from "./grid-view/";
import {
  AggregatedContent,
  ContentSection,
} from "@/app/components/manuscript/manuscript-editor/services/";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/";
import { Scene, Chapter, Act, NovelWithStructure } from "@/lib/novels";
import { EditableText } from "@/app/components/ui";

export type ContentDisplayMode = "document" | "grid";

interface ManuscriptContentAreaProps {
  aggregatedContent: AggregatedContent | null;
  viewMode: ViewMode;
  contentDisplayMode: ContentDisplayMode;
  onContentChange: (content: string) => void;
  onSceneClick: (sceneId: string, scene: Scene) => void;
  onChapterClick?: (chapter: Chapter) => void; // ✅ Handler for chapter focus
  onSceneRename?: (sceneId: string, newTitle: string) => Promise<void>;
  onAddScene?: (chapterId: string, afterSceneId?: string) => void;
  onAddChapter?: (actId: string, afterChapterId?: string) => void;
  onChapterRename?: (chapterId: string, newTitle: string) => Promise<void>;
  onActRename?: (actId: string, newTitle: string) => Promise<void>;
  novel?: NovelWithStructure;
  onIndividualSceneChange?: (sceneId: string, content: string) => void;
  marginLeft?: string;
  marginRight?: string;
}

// ✨ Scene Editor Component for Document Views
const SceneEditor: React.FC<{
  scene: Scene;
  onSceneClick: (sceneId: string, scene: Scene) => void;
  onContentChange: (sceneId: string, content: string) => void;
  onAddScene?: (chapterId: string, afterSceneId?: string) => void;
  onSceneRename?: (sceneId: string, newTitle: string) => Promise<void>;
  chapterInfo?: Chapter | null;
  showChapterContext?: boolean;
  showAddButton?: boolean;
  isLastInChapter?: boolean;
}> = ({
  scene,
  onSceneClick,
  onContentChange,
  onAddScene,
  onSceneRename,
  chapterInfo,
  showChapterContext = true,
  showAddButton = true,
}) => {
  const handleContentChange = React.useCallback(
    (content: string) => {
      onContentChange(scene.id, content);
    },
    [scene.id, onContentChange]
  );

  return (
    <div className="space-y-3">
      {/* Scene Header - Tighter */}
      <div className="flex items-center justify-between border-b border-gray-600 pb-1.5">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-400">
              SC{scene.order}
            </span>
            {onSceneRename ? (
              <EditableText
                value={scene.title || `Scene ${scene.order}`}
                onSave={(newTitle) => onSceneRename(scene.id, newTitle)}
                placeholder="Scene title"
                className="text-sm font-medium text-white"
                maxLength={100}
              />
            ) : (
              <span className="text-sm font-medium text-white">
                {scene.title || `Scene ${scene.order}`}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {scene.wordCount} words
          </div>
        </div>

        {/* Add Scene Button - Compact */}
        {showAddButton && onAddScene && chapterInfo && (
          <button
            onClick={() => onAddScene(chapterInfo.id, scene.id)}
            className="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 text-white rounded flex items-center space-x-1 transition-colors"
            title="Add scene after this one"
          >
            <Plus className="w-3 h-3" />
            <span>Scene</span>
          </button>
        )}
      </div>

      {/* Scene Content Editor */}
      <div className="bg-gray-800 rounded-lg p-4 min-h-[300px]">
        <SceneTextEditor
          key={`scene-editor-${scene.id}`}
          content={scene.content}
          onContentChange={handleContentChange}
        />
      </div>
    </div>
  );
};

// Helper function to find chapter from scene
const findChapterFromSection = (
  novel: NovelWithStructure | null | undefined,
  section: ContentSection
): Chapter | null => {
  if (!novel?.acts) return null;

  for (const act of novel.acts) {
    for (const chapter of act.chapters) {
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

// Helper function to find act from chapter ID
const findActFromChapterId = (
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

export const ManuscriptContentArea: React.FC<ManuscriptContentAreaProps> = ({
  aggregatedContent,
  viewMode,
  contentDisplayMode,
  onContentChange,
  onSceneClick,
  onChapterClick,
  onSceneRename,
  onAddScene,
  onAddChapter,
  onChapterRename,
  onActRename,
  novel,
  onIndividualSceneChange,
  marginLeft = "0",
  marginRight = "0",
}) => {
  const handleIndividualSceneChange = React.useCallback(
    (sceneId: string, content: string) => {
      if (onIndividualSceneChange) {
        onIndividualSceneChange(sceneId, content);
      }
    },
    [onIndividualSceneChange]
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

  // ✅ UPDATED: Grid view with all new props passed to SceneGrid
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
          onSceneRename={onSceneRename}
          onChapterRename={onChapterRename}
          onChapterClick={onChapterClick} // ✅ NEW: Pass chapter focus handler
          onActRename={onActRename} // ✅ NEW: Pass act rename handler
          novel={novel}
        />
      </div>
    );
  }

  // ✅ Scene view with breadcrumbs and Add Scene button
  if (viewMode === "scene") {
    const section = aggregatedContent.sections[0];
    const scene = section.scenes[0];

    // Find chapter and act info for breadcrumbs
    const chapterInfo = findChapterFromSection(novel, section);
    const actInfo = chapterInfo
      ? findActFromChapterId(novel, chapterInfo.id)
      : null;

    return (
      <div
        className="flex-1 transition-all duration-300 overflow-y-auto"
        style={{ marginLeft, marginRight }}
      >
        <div className="p-6">
          {/* ✅ Breadcrumb Navigation */}
          <div className="mb-4 text-sm text-gray-400">
            {actInfo && chapterInfo && (
              <span>
                ACT{actInfo.order} - {actInfo.title} / CH{chapterInfo.order} -{" "}
                {chapterInfo.title}
              </span>
            )}
          </div>

          {/* ✅ Scene Editor */}
          <SceneEditor
            scene={scene}
            onSceneClick={onSceneClick}
            onContentChange={handleIndividualSceneChange || (() => {})}
            onAddScene={onAddScene}
            onSceneRename={onSceneRename}
            chapterInfo={chapterInfo}
            showChapterContext={false}
            showAddButton={true}
          />
        </div>
      </div>
    );
  }

  // ✅ Document views for chapter and act
  if (contentDisplayMode === "document") {
    return (
      <div
        className="flex-1 transition-all duration-300 overflow-y-auto"
        style={{ marginLeft, marginRight }}
      >
        <div className="p-6">
          {/* ✅ Document Header */}
          <div className="mb-6">
            {viewMode === "act" && aggregatedContent.sections.length > 0 && (
              <div>
                <h1 className="text-2xl text-white font-medium mb-2">
                  {aggregatedContent.sections[0]?.title?.split(":")[0] || "Act"}
                </h1>
                <p className="text-gray-400 text-sm">
                  {aggregatedContent.sections.length} chapter
                  {aggregatedContent.sections.length !== 1 ? "s" : ""} •{" "}
                  {aggregatedContent.totalWordCount.toLocaleString()} words
                </p>
              </div>
            )}

            {viewMode === "chapter" &&
              aggregatedContent.sections.length > 0 && (
                <div>
                  <h2 className="text-xl text-white font-medium mb-2">
                    {aggregatedContent.sections[0]?.title || "Chapter"}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {aggregatedContent.sections[0]?.scenes.length} scene
                    {aggregatedContent.sections[0]?.scenes.length !== 1
                      ? "s"
                      : ""}{" "}
                    • {aggregatedContent.totalWordCount.toLocaleString()} words
                  </p>
                </div>
              )}
          </div>

          {/* ✅ Document Content */}
          <div className="space-y-8">
            {aggregatedContent.sections.map((section) => (
              <div key={section.id} className="space-y-6">
                {/* Chapter Header for Act view */}
                {viewMode === "act" && (
                  <div className="border-b border-gray-700 pb-3">
                    <h3 className="text-lg text-white font-medium">
                      {section.title?.split(":").pop()?.trim() || "Chapter"}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {section.scenes.length} scene
                      {section.scenes.length !== 1 ? "s" : ""} •{" "}
                      {section.wordCount.toLocaleString()} words
                    </p>
                  </div>
                )}

                {/* Scenes */}
                <div className="space-y-6">
                  {section.scenes.map((scene, sceneIndex) => {
                    const chapterInfo = findChapterFromSection(novel, section);
                    return (
                      <SceneEditor
                        key={scene.id}
                        scene={scene}
                        onSceneClick={onSceneClick}
                        onContentChange={
                          handleIndividualSceneChange || (() => {})
                        }
                        onAddScene={onAddScene}
                        onSceneRename={onSceneRename}
                        chapterInfo={chapterInfo}
                        showChapterContext={viewMode === "act"}
                        showAddButton={sceneIndex === section.scenes.length - 1}
                      />
                    );
                  })}
                </div>

                {/* Add Chapter button for Act view */}
                {viewMode === "act" && onAddChapter && (
                  <div className="pt-4 border-t border-gray-700">
                    <button
                      onClick={() => {
                        const chapterInfo = findChapterFromSection(
                          novel,
                          section
                        );
                        const actInfo = chapterInfo
                          ? findActFromChapterId(novel, chapterInfo.id)
                          : null;
                        if (actInfo) {
                          onAddChapter(actInfo.id, chapterInfo?.id);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Chapter</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};
