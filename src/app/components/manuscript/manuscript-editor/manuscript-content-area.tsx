import React from "react";
import { FileText, Plus } from "lucide-react";
import { SceneTextEditor } from "@/app/components/manuscript/scene-text-editor";
import { SceneGrid } from "./scene-grid";
import { AggregatedContent } from "@/app/components/manuscript/content-aggregation-service";
import { ViewMode } from "@/app/components/manuscript/view-mode-selector";
import { Scene, Chapter, Act } from "@/lib/novels";

export type ContentDisplayMode = "document" | "grid";

interface ManuscriptContentAreaProps {
  aggregatedContent: AggregatedContent | null;
  viewMode: ViewMode;
  contentDisplayMode: ContentDisplayMode;
  onContentChange: (content: string) => void;
  onSceneClick: (sceneId: string, scene: Scene) => void;
  onAddScene?: (chapterId: string, afterSceneId?: string) => void;
  onAddChapter?: (actId: string, afterChapterId?: string) => void;
  novel?: any | null; // ✨ NEW: Need novel data for structure
  marginLeft: string;
  marginRight: string;
}

// ✨ NEW: Add Scene Button Component
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

// ✨ NEW: Add Chapter Button Component
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

// ✨ NEW: Chapter Header Component
const ChapterHeader: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  return (
    <div className="my-8 py-4 px-6 border-t-2 border-b-2 border-red-600 bg-red-900/10 rounded-lg">
      <h2 className="text-xl font-bold text-red-400 text-center">
        {chapter.title}
      </h2>
    </div>
  );
};

// ✨ NEW: Scene Header Component
const SceneHeader: React.FC<{
  scene: Scene;
  showChapterContext?: boolean;
  chapterTitle?: string;
}> = ({ scene, showChapterContext = false, chapterTitle }) => {
  return (
    <div className="my-4 py-2 px-4 border-t border-b border-gray-600 bg-gray-800/50 rounded">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-gray-300 font-medium">Scene {scene.order}</span>
          {showChapterContext && chapterTitle && (
            <span className="text-gray-500 text-sm ml-2">• {chapterTitle}</span>
          )}
        </div>
        <div className="text-xs text-gray-400">
          {scene.wordCount} words • {scene.status}
        </div>
      </div>
    </div>
  );
};

export const ManuscriptContentArea: React.FC<ManuscriptContentAreaProps> = ({
  aggregatedContent,
  viewMode,
  contentDisplayMode,
  onContentChange,
  onSceneClick,
  onAddScene,
  onAddChapter,
  novel,
  marginLeft,
  marginRight,
}) => {
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

  // ✨ Grid view (unchanged)
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
        />
      </div>
    );
  }

  // ✨ NEW: Sectioned Document View
  if (viewMode === "scene") {
    // Single scene - use original behavior
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

  // ✨ NEW: Chapter Document View - Separate Scene Editors
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

    return (
      <div
        className="flex-1 transition-all duration-300 overflow-y-auto"
        style={{ marginLeft, marginRight }}
      >
        <div className="p-6 space-y-6">
          {scenes.map((scene, index) => (
            <div key={scene.id}>
              {/* Scene Header */}
              <SceneHeader scene={scene} />

              {/* Scene Editor */}
              <div className="border border-gray-600 rounded-lg overflow-hidden">
                <SceneTextEditor
                  content={scene.content}
                  onContentChange={(newContent) => {
                    // Handle individual scene content changes
                    // This would need to be updated to save individual scenes
                    console.log("Scene content changed:", scene.id, newContent);
                  }}
                  placeholder={`Scene ${scene.order} content...`}
                  readOnly={true} // Read-only for now in chapter view
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
          ))}

          {/* Add Scene Button for empty chapter */}
          {scenes.length === 0 && onAddScene && chapterInfo && (
            <AddSceneButton
              chapterId={chapterInfo.id}
              onAddScene={onAddScene}
            />
          )}
        </div>
      </div>
    );
  }

  // ✨ NEW: Act Document View - Separate Chapter Sections
  if (viewMode === "act") {
    // Group scenes by chapter
    const scenesByChapter = new Map<
      string,
      { chapter: Chapter; scenes: Scene[] }
    >();

    // Find act info from novel data
    const actInfo = novel?.acts?.find((act: Act) =>
      aggregatedContent.sections[0].scenes.some((s: Scene) =>
        act.chapters.some((chapter: Chapter) =>
          chapter.scenes.some((cs: Scene) => cs.id === s.id)
        )
      )
    );

    // Group scenes by their chapters
    if (actInfo) {
      actInfo.chapters.forEach((chapter: Chapter) => {
        const chapterScenes = chapter.scenes.filter((scene: Scene) =>
          aggregatedContent.sections[0].scenes.some(
            (s: Scene) => s.id === scene.id
          )
        );
        if (chapterScenes.length > 0) {
          scenesByChapter.set(chapter.id, { chapter, scenes: chapterScenes });
        } else {
          // Include empty chapters
          scenesByChapter.set(chapter.id, { chapter, scenes: [] });
        }
      });
    }

    return (
      <div
        className="flex-1 transition-all duration-300 overflow-y-auto"
        style={{ marginLeft, marginRight }}
      >
        <div className="p-6 space-y-8">
          {Array.from(scenesByChapter.entries()).map(
            ([chapterId, { chapter, scenes }], chapterIndex) => (
              <div key={chapterId}>
                {/* Chapter Header */}
                {chapterIndex > 0 && <ChapterHeader chapter={chapter} />}

                {/* Chapter Scenes */}
                <div className="space-y-6">
                  {scenes.map((scene, sceneIndex) => (
                    <div key={scene.id}>
                      {/* Scene Header */}
                      <SceneHeader
                        scene={scene}
                        showChapterContext={chapterIndex === 0}
                        chapterTitle={chapter.title}
                      />

                      {/* Scene Editor */}
                      <div className="border border-gray-600 rounded-lg overflow-hidden">
                        <SceneTextEditor
                          content={scene.content}
                          onContentChange={(newContent) => {
                            console.log(
                              "Scene content changed:",
                              scene.id,
                              newContent
                            );
                          }}
                          placeholder={`Scene ${scene.order} content...`}
                          readOnly={true} // Read-only for now in act view
                        />
                      </div>

                      {/* Add Scene Button */}
                      {onAddScene && (
                        <AddSceneButton
                          chapterId={chapter.id}
                          afterSceneId={scene.id}
                          onAddScene={onAddScene}
                        />
                      )}
                    </div>
                  ))}

                  {/* Add Scene Button for empty chapter */}
                  {scenes.length === 0 && onAddScene && (
                    <AddSceneButton
                      chapterId={chapter.id}
                      onAddScene={onAddScene}
                    />
                  )}
                </div>

                {/* Add Chapter Button */}
                {onAddChapter && actInfo && (
                  <AddChapterButton
                    actId={actInfo.id}
                    afterChapterId={chapter.id}
                    onAddChapter={onAddChapter}
                  />
                )}
              </div>
            )
          )}

          {/* Add Chapter Button for empty act */}
          {scenesByChapter.size === 0 && onAddChapter && actInfo && (
            <AddChapterButton actId={actInfo.id} onAddChapter={onAddChapter} />
          )}
        </div>
      </div>
    );
  }

  // Fallback - shouldn't reach here
  return null;
};
