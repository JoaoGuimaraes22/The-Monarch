// src/app/components/manuscript/manuscript-editor/content-views/manuscript-content-area.tsx
// ✅ FINAL: Complete with breadcrumbs, focus buttons ONLY in act view, and Add Scene button

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
                className="text-base font-medium text-white"
                maxLength={200}
              />
            ) : (
              <h3 className="text-base font-medium text-white">
                {scene.title || `Scene ${scene.order}`}
              </h3>
            )}
          </div>
          {showChapterContext && chapterInfo && (
            <p className="text-xs text-gray-500 mt-0.5">
              {chapterInfo.title} • {scene.wordCount} words • {scene.status}
            </p>
          )}
        </div>

        <button
          onClick={() => onSceneClick(scene.id, scene)}
          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        >
          Focus
        </button>
      </div>

      {/* Scene Content */}
      <div className="bg-gray-800 rounded-lg p-3">
        <SceneTextEditor
          content={scene.content}
          onContentChange={handleContentChange}
          placeholder="Start writing your scene..."
          readOnly={false}
        />
      </div>

      {/* Add Scene Button - Compact */}
      {showAddButton && onAddScene && chapterInfo && (
        <div className="flex justify-center py-2">
          <button
            onClick={() => onAddScene(chapterInfo.id, scene.id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-dashed border-blue-600 rounded bg-blue-900/20 text-blue-300 hover:border-blue-400 hover:text-blue-200 hover:bg-blue-900/30 transition-all duration-200 text-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-medium">Add Scene</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ✅ Chapter Header with conditional Focus button (only in act view)
const ChapterHeader: React.FC<{
  chapter: Chapter;
  onChapterRename?: (chapterId: string, newTitle: string) => Promise<void>;
  onChapterClick?: (chapter: Chapter) => void;
  showWordCount?: boolean;
}> = ({ chapter, onChapterRename, onChapterClick, showWordCount = true }) => {
  const totalWords = chapter.scenes.reduce(
    (sum, scene) => sum + scene.wordCount,
    0
  );

  return (
    <div className="my-4 p-3 border border-yellow-600/40 rounded bg-gray-800/30">
      <div className="flex items-center space-x-3">
        {/* Compact chapter order number */}
        <span className="text-sm font-medium text-gray-400 flex-shrink-0">
          CH{chapter.order}
        </span>

        <div className="flex-1">
          {onChapterRename ? (
            <EditableText
              value={chapter.title}
              onSave={(newTitle) => onChapterRename(chapter.id, newTitle)}
              placeholder="Chapter title"
              className="text-lg font-bold text-gray-200"
              maxLength={200}
            />
          ) : (
            <h2 className="text-lg font-bold text-gray-200">{chapter.title}</h2>
          )}

          {showWordCount && (
            <p className="text-gray-400 mt-1 text-sm">
              {chapter.scenes.length} scene
              {chapter.scenes.length !== 1 ? "s" : ""} •{" "}
              {totalWords.toLocaleString()} words
            </p>
          )}
        </div>

        {/* ✅ CRITICAL: Focus button only shows when onChapterClick is provided */}
        {onChapterClick && (
          <button
            onClick={() => onChapterClick(chapter)}
            className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
          >
            Focus
          </button>
        )}
      </div>
    </div>
  );
};

// Add Chapter Button with golden theme
const AddChapterButton: React.FC<{
  actId: string;
  afterChapterId?: string;
  onAddChapter: (actId: string, afterChapterId?: string) => void;
}> = ({ actId, afterChapterId, onAddChapter }) => {
  return (
    <div className="flex justify-center my-3">
      <button
        onClick={() => onAddChapter(actId, afterChapterId)}
        className="flex items-center space-x-1.5 px-4 py-2 border border-dashed border-yellow-600 rounded bg-yellow-900/20 text-yellow-300 hover:border-yellow-400 hover:text-yellow-200 hover:bg-yellow-900/30 transition-all duration-200 text-sm"
      >
        <Plus className="w-4 h-4" />
        <span className="font-medium">Add Chapter</span>
      </button>
    </div>
  );
};

// Act Document View Header
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
    <div className="mb-4 p-4 border-b border-red-700/40 bg-gray-800/50">
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-400 flex-shrink-0">
          ACT{act.order}
        </span>

        <div className="flex-1">
          {onActRename ? (
            <EditableText
              value={act.title}
              onSave={(newTitle) => onActRename(act.id, newTitle)}
              placeholder="Act title"
              className="text-xl font-bold text-white"
              maxLength={200}
            />
          ) : (
            <h1 className="text-xl font-bold text-white">{act.title}</h1>
          )}

          <p className="text-gray-400 mt-1 text-sm">
            Act view • {totalChapters} chapter{totalChapters !== 1 ? "s" : ""} •{" "}
            {totalScenes} scene{totalScenes !== 1 ? "s" : ""} •{" "}
            {totalWords.toLocaleString()} words
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper functions to find chapter/act info
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

  // Grid view
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

  // ✅ Scene view with breadcrumbs and Add Scene button
  if (viewMode === "scene") {
    const section = aggregatedContent.sections[0];
    const scene = section.scenes[0];

    // Find chapter and act info for breadcrumbs
    const chapterInfo = findChapterFromSection(novel, section);
    const actInfo = chapterInfo ? findActFromSection(novel, section) : null;

    return (
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft, marginRight }}
      >
        <div className="p-6 h-full flex flex-col">
          {/* ✅ Breadcrumb navigation */}
          {actInfo && chapterInfo && (
            <div className="text-xs text-gray-500 mb-3 border-b border-gray-700 pb-2">
              ACT{actInfo.order} - {actInfo.title}, CH{chapterInfo.order} -{" "}
              {chapterInfo.title}
            </div>
          )}

          {/* Scene Content */}
          <div className="flex-1">
            <SceneTextEditor
              content={section.content}
              onContentChange={onContentChange}
              placeholder="Start writing your scene..."
              readOnly={false}
            />
          </div>

          {/* Add Scene Button at bottom */}
          {onAddScene && chapterInfo && (
            <div className="flex justify-center py-3 border-t border-gray-700 mt-4">
              <button
                onClick={() => onAddScene(chapterInfo.id, scene.id)}
                className="flex items-center space-x-2 px-4 py-2 border border-dashed border-blue-600 rounded bg-blue-900/20 text-blue-300 hover:border-blue-400 hover:text-blue-200 hover:bg-blue-900/30 transition-all duration-200 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Add Scene</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ✅ Chapter view with breadcrumbs - NO focus button
  if (viewMode === "chapter") {
    const section = aggregatedContent.sections[0];
    const scenes = section.scenes;
    const chapterInfo = findChapterFromSection(novel, section);
    const actInfo = chapterInfo ? findActFromSection(novel, section) : null;
    const actId = chapterInfo
      ? findActIdForChapter(novel, chapterInfo.id)
      : null;

    return (
      <div
        className="flex-1 transition-all duration-300 overflow-y-auto"
        style={{ marginLeft, marginRight }}
      >
        <div className="p-4 space-y-4">
          {/* ✅ Breadcrumb navigation for chapter view */}
          {actInfo && (
            <div className="text-xs text-gray-500 mb-3 border-b border-gray-700 pb-2">
              ACT{actInfo.order} - {actInfo.title}
            </div>
          )}

          {chapterInfo && (
            <ChapterHeader
              chapter={chapterInfo}
              onChapterRename={onChapterRename}
              // ✅ CRITICAL: NO focus button in chapter view - we're already there!
              onChapterClick={undefined}
            />
          )}

          {scenes.map((scene, index) => (
            <SceneEditor
              key={scene.id}
              scene={scene}
              onSceneClick={onSceneClick}
              onContentChange={handleIndividualSceneChange}
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

  // ✅ Act view with focus buttons on chapters
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
        <div className="p-4 space-y-4">
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
                  // ✅ CRITICAL: Focus button ONLY in act view
                  onChapterClick={onChapterClick}
                  showWordCount={true}
                />

                <div className="space-y-3 ml-3">
                  {sortedScenes.map((scene) => (
                    <SceneEditor
                      key={scene.id}
                      scene={scene}
                      onSceneClick={onSceneClick}
                      onContentChange={handleIndividualSceneChange}
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
