// src/app/components/manuscript/manuscript-editor/content-views/manuscript-content-area.tsx
// ✨ FINAL: Act Document View with proper chapter boundaries and complete TypeScript compliance

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
  onSceneRename?: (sceneId: string, newTitle: string) => Promise<void>;
  onAddScene?: (chapterId: string, afterSceneId?: string) => void;
  onAddChapter?: (actId: string, afterChapterId?: string) => void;
  onChapterRename?: (chapterId: string, newTitle: string) => Promise<void>;
  onActRename?: (actId: string, newTitle: string) => Promise<void>;
  novel?: NovelWithStructure;
  // ✨ NEW: Separate handler for individual scene changes in document views
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
    <div className="space-y-4">
      {/* Scene Header */}
      <div className="flex items-center justify-between border-b border-gray-600 pb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-400">
              Scene {scene.order}
            </span>
            {onSceneRename ? (
              <EditableText
                value={scene.title || `Scene ${scene.order}`}
                onSave={(newTitle) => onSceneRename(scene.id, newTitle)}
                placeholder="Scene title"
                className="text-lg font-medium text-white"
                maxLength={200}
              />
            ) : (
              <h3 className="text-lg font-medium text-white">
                {scene.title || `Scene ${scene.order}`}
              </h3>
            )}
          </div>
          {showChapterContext && chapterInfo && (
            <p className="text-xs text-gray-500 mt-1">
              {chapterInfo.title} • {scene.wordCount} words • {scene.status}
            </p>
          )}
        </div>

        <button
          onClick={() => onSceneClick(scene.id, scene)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          Focus
        </button>
      </div>

      {/* Scene Content */}
      <div className="bg-gray-800 rounded-lg p-4">
        <SceneTextEditor
          content={scene.content}
          onContentChange={handleContentChange}
          placeholder="Start writing your scene..."
          readOnly={false}
        />
      </div>

      {/* Add Scene Button */}
      {showAddButton && onAddScene && chapterInfo && (
        <div className="flex justify-center py-4">
          <button
            onClick={() => onAddScene(chapterInfo.id, scene.id)}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-dashed border-blue-600 rounded-lg bg-blue-900/20 text-blue-300 hover:border-blue-400 hover:text-blue-200 hover:bg-blue-900/30 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Scene</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ✨ Chapter Header Component for Act Document View
const ChapterHeader: React.FC<{
  chapter: Chapter;
  onChapterRename?: (chapterId: string, newTitle: string) => Promise<void>;
  showWordCount?: boolean;
}> = ({ chapter, onChapterRename, showWordCount = true }) => {
  const totalWords = chapter.scenes.reduce(
    (sum, scene) => sum + scene.wordCount,
    0
  );

  return (
    <div className="my-8 p-6 border border-red-700 rounded-lg bg-red-900/10">
      <div className="text-center">
        {onChapterRename ? (
          <EditableText
            value={chapter.title}
            onSave={(newTitle) => onChapterRename(chapter.id, newTitle)}
            placeholder="Chapter title"
            className="text-2xl font-bold text-red-400"
            maxLength={200}
          />
        ) : (
          <h2 className="text-2xl font-bold text-red-400">{chapter.title}</h2>
        )}

        {showWordCount && (
          <p className="text-gray-400 mt-2">
            {chapter.scenes.length} scene
            {chapter.scenes.length !== 1 ? "s" : ""} •{" "}
            {totalWords.toLocaleString()} words
          </p>
        )}
      </div>
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

// ✨ Act Document View Title Header
const ActDocumentViewHeader: React.FC<{
  act: Act;
  onActRename?: (actId: string, newTitle: string) => Promise<void>;
}> = ({ act, onActRename }) => {
  const totalChapters = act.chapters.length;
  const totalScenes = act.chapters.reduce(
    (sum, chapter) => sum + chapter.scenes.length,
    0
  );
  const totalWords = act.chapters.reduce(
    (sum, chapter) =>
      sum +
      chapter.scenes.reduce(
        (chapterSum, scene) => chapterSum + scene.wordCount,
        0
      ),
    0
  );

  return (
    <div className="mb-8 p-6 border-b border-gray-700 bg-gray-800/50">
      <div className="text-center">
        {onActRename ? (
          <EditableText
            value={act.title}
            onSave={(newTitle) => onActRename(act.id, newTitle)}
            placeholder="Act title"
            className="text-3xl font-bold text-white"
            maxLength={200}
          />
        ) : (
          <h1 className="text-3xl font-bold text-white">{act.title}</h1>
        )}

        <p className="text-gray-400 mt-2">
          Act view • {totalChapters} chapter{totalChapters !== 1 ? "s" : ""} •{" "}
          {totalScenes} scene{totalScenes !== 1 ? "s" : ""} •{" "}
          {totalWords.toLocaleString()} words
        </p>
      </div>
    </div>
  );
};

// Helper functions to find chapter/act info - PROPERLY TYPED
const findChapterFromSection = (
  novel: NovelWithStructure | undefined,
  section: ContentSection
): Chapter | null => {
  if (!novel?.acts) return null;

  for (const act of novel.acts) {
    for (const chapter of act.chapters) {
      if (
        section.scenes.some((s: Scene) =>
          chapter.scenes.some((cs: Scene) => cs.id === s.id)
        )
      ) {
        return chapter;
      }
    }
  }
  return null;
};

const findActFromSection = (
  novel: NovelWithStructure | undefined,
  section: ContentSection
): Act | null => {
  if (!novel?.acts) return null;

  for (const act of novel.acts) {
    for (const chapter of act.chapters) {
      if (
        section.scenes.some((s: Scene) =>
          chapter.scenes.some((cs: Scene) => cs.id === s.id)
        )
      ) {
        return act;
      }
    }
  }
  return null;
};

const findActIdForChapter = (
  novel: NovelWithStructure | undefined,
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

export const ManuscriptContentArea: React.FC<ManuscriptContentAreaProps> = ({
  aggregatedContent,
  viewMode,
  contentDisplayMode,
  onContentChange,
  onSceneClick,
  onSceneRename,
  onAddScene,
  onAddChapter,
  onChapterRename,
  onActRename,
  novel,
  onIndividualSceneChange, // ✨ NEW: Proper content saving handler
  marginLeft = "0",
  marginRight = "0",
}) => {
  // ✨ UPDATED: Simplified handler that uses the prop
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

  // ✅ Grid view - Enhanced with rename functionality
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
          novel={novel}
        />
      </div>
    );
  }
  // ✅ Single scene view - uses main onContentChange
  if (viewMode === "scene") {
    const section = aggregatedContent.sections[0];
    return (
      <div
        className="flex-1 p-6 transition-all duration-300"
        style={{ marginLeft, marginRight }}
      >
        <SceneTextEditor
          content={section.content}
          onContentChange={onContentChange} // ✅ Uses main handler for single scene
          placeholder="Start writing your scene..."
          readOnly={false}
        />
      </div>
    );
  }

  // ✅ Chapter Document View - uses individual scene handler
  if (viewMode === "chapter") {
    const section = aggregatedContent.sections[0];
    const scenes = section.scenes;
    const chapterInfo = findChapterFromSection(novel, section);
    const actId = chapterInfo
      ? findActIdForChapter(novel, chapterInfo.id)
      : null;

    return (
      <div
        className="flex-1 transition-all duration-300 overflow-y-auto"
        style={{ marginLeft, marginRight }}
      >
        <div className="p-6 space-y-8">
          {chapterInfo && (
            <ChapterHeader
              chapter={chapterInfo}
              onChapterRename={onChapterRename}
            />
          )}

          {scenes.map((scene, index) => (
            <SceneEditor
              key={scene.id}
              scene={scene}
              onSceneClick={onSceneClick}
              onContentChange={handleIndividualSceneChange} // ✅ Uses individual handler
              onAddScene={onAddScene}
              onSceneRename={onSceneRename}
              chapterInfo={chapterInfo}
              showChapterContext={false}
              isLastInChapter={index === scenes.length - 1}
            />
          ))}

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

  // ✅ Act Document View - uses individual scene handler
  if (viewMode === "act") {
    const firstSection = aggregatedContent.sections[0];
    const actInfo = findActFromSection(novel, firstSection);

    if (!actInfo) {
      return (
        <div
          className="flex-1 p-6 transition-all duration-300"
          style={{ marginLeft, marginRight }}
        >
          <div className="text-center text-gray-400">
            <p>Could not find act information</p>
          </div>
        </div>
      );
    }

    const sortedChapters = [...actInfo.chapters].sort(
      (a, b) => a.order - b.order
    );
    return (
      <div
        className="flex-1 transition-all duration-300 overflow-y-auto"
        style={{ marginLeft, marginRight }}
      >
        <div className="p-6 space-y-8">
          <ActDocumentViewHeader act={actInfo} onActRename={onActRename} />

          {sortedChapters.map((chapter, chapterIndex) => {
            const sortedScenes = [...chapter.scenes].sort(
              (a, b) => a.order - b.order
            );

            return (
              <React.Fragment key={chapter.id}>
                <ChapterHeader
                  chapter={chapter}
                  onChapterRename={onChapterRename}
                  showWordCount={true}
                />

                <div className="space-y-6 ml-4">
                  {sortedScenes.map((scene) => (
                    <SceneEditor
                      key={scene.id}
                      scene={scene}
                      onSceneClick={onSceneClick}
                      onContentChange={handleIndividualSceneChange} // ✅ Uses individual handler
                      onAddScene={onAddScene}
                      onSceneRename={onSceneRename}
                      chapterInfo={chapter}
                      showChapterContext={false}
                    />
                  ))}
                </div>

                {onAddChapter && chapterIndex < sortedChapters.length - 1 && (
                  <AddChapterButton
                    actId={actInfo.id}
                    afterChapterId={chapter.id}
                    onAddChapter={onAddChapter}
                  />
                )}
              </React.Fragment>
            );
          })}

          {onAddChapter && sortedChapters.length > 0 && (
            <AddChapterButton
              actId={actInfo.id}
              afterChapterId={sortedChapters[sortedChapters.length - 1].id}
              onAddChapter={onAddChapter}
            />
          )}
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div
      className="flex-1 p-6 transition-all duration-300"
      style={{ marginLeft, marginRight }}
    >
      <div className="text-center text-gray-400">
        <p>Unsupported view mode: {viewMode}</p>
      </div>
    </div>
  );
};
