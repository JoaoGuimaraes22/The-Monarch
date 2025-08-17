// src/app/components/manuscript/chapter-tree/enhanced-chapter-tree.tsx
import React, { useState } from "react";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { EnhancedActItem } from "./enhanced-act-item";
import { AddActInterface } from "./add-act-interface";

interface EnhancedChapterTreeProps {
  novel: NovelWithStructure;
  selectedSceneId?: string;
  selectedChapterId?: string;
  selectedActId?: string;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onChapterSelect?: (chapter: Chapter) => void;
  onActSelect?: (act: Act) => void;
  onRefresh: () => void;
  onAddScene: (chapterId: string) => Promise<void>;
  onAddChapter: (actId: string) => Promise<void>;
  onAddAct?: (title?: string, insertAfterActId?: string) => Promise<void>; // ✨ NEW
  onDeleteScene: (sceneId: string) => Promise<void>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
  onDeleteAct: (actId: string) => Promise<void>;
  // ✨ NEW: Name editing handlers
  onUpdateActName?: (actId: string, newTitle: string) => Promise<void>;
  onUpdateChapterName?: (chapterId: string, newTitle: string) => Promise<void>;
  onUpdateSceneName?: (sceneId: string, newTitle: string) => Promise<void>;
  novelId: string;
}

export const EnhancedChapterTree: React.FC<EnhancedChapterTreeProps> = ({
  novel,
  selectedSceneId,
  selectedChapterId,
  selectedActId,
  onSceneSelect,
  onChapterSelect,
  onActSelect,
  onRefresh,
  onAddScene,
  onAddChapter,
  onAddAct,
  onDeleteScene,
  onDeleteChapter,
  onDeleteAct,
  onUpdateActName,
  onUpdateChapterName,
  onUpdateSceneName,
  novelId,
}) => {
  const [expandedActs, setExpandedActs] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );

  // Don't show add act interface if handler not provided
  const showAddAct = !!onAddAct;

  // CRUD handlers - call parent handlers
  const handleAddScene = async (chapterId: string) => {
    await onAddScene(chapterId);
  };

  const handleAddChapter = async (actId: string) => {
    await onAddChapter(actId);
  };

  const handleActDelete = async (actId: string) => {
    await onDeleteAct(actId);
  };

  const handleChapterDelete = async (chapterId: string) => {
    await onDeleteChapter(chapterId);
  };

  const handleSceneDelete = async (sceneId: string) => {
    await onDeleteScene(sceneId);
  };

  // ✨ NEW: Name update handlers with fallback API calls
  const handleUpdateActName = async (actId: string, newTitle: string) => {
    if (onUpdateActName) {
      await onUpdateActName(actId, newTitle);
    } else {
      // Fallback to direct API call
      try {
        const response = await fetch(`/api/novels/${novelId}/acts/${actId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });

        if (!response.ok) {
          throw new Error("Failed to update act name");
        }

        // Refresh the data
        onRefresh();
      } catch (error) {
        console.error("❌ Error updating act name:", error);
        throw error;
      }
    }
  };

  const handleUpdateChapterName = async (
    chapterId: string,
    newTitle: string
  ) => {
    if (onUpdateChapterName) {
      await onUpdateChapterName(chapterId, newTitle);
    } else {
      // Fallback to direct API call
      try {
        const response = await fetch(
          `/api/novels/${novelId}/chapters/${chapterId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update chapter name");
        }

        // Refresh the data
        onRefresh();
      } catch (error) {
        console.error("❌ Error updating chapter name:", error);
        throw error;
      }
    }
  };

  const handleUpdateSceneName = async (sceneId: string, newTitle: string) => {
    if (onUpdateSceneName) {
      await onUpdateSceneName(sceneId, newTitle);
    } else {
      // Fallback to direct API call
      try {
        const response = await fetch(
          `/api/novels/${novelId}/scenes/${sceneId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update scene name");
        }

        // Refresh the data
        onRefresh();
      } catch (error) {
        console.error("❌ Error updating scene name:", error);
        throw error;
      }
    }
  };

  const toggleActExpand = (actId: string) => {
    const newExpanded = new Set(expandedActs);
    if (newExpanded.has(actId)) {
      newExpanded.delete(actId);
    } else {
      newExpanded.add(actId);
    }
    setExpandedActs(newExpanded);
  };

  const toggleChapterExpand = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  // ✨ UPDATED: Handle empty state with Add Act option
  if (!novel.acts || novel.acts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No content yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Create your first act to start writing
          </p>
        </div>
        {showAddAct && <AddActInterface onAddAct={onAddAct} />}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ✨ NEW: Add Act button at the top */}
      {showAddAct && <AddActInterface onAddAct={onAddAct} />}

      {/* ✨ UPDATED: Acts list with inline add buttons */}
      <div className="space-y-2">
        {novel.acts
          .sort((a, b) => a.order - b.order)
          .map((act, index) => (
            <React.Fragment key={act.id}>
              <EnhancedActItem
                act={act}
                isExpanded={expandedActs.has(act.id)}
                onToggleExpand={() => toggleActExpand(act.id)}
                onActSelect={onActSelect || (() => {})}
                onChapterSelect={onChapterSelect || (() => {})}
                onSceneSelect={onSceneSelect}
                onActDelete={handleActDelete}
                onChapterDelete={handleChapterDelete}
                onSceneDelete={handleSceneDelete}
                onAddChapter={handleAddChapter}
                onAddScene={handleAddScene}
                // ✨ NEW: Name editing handlers
                onUpdateActName={handleUpdateActName}
                onUpdateChapterName={handleUpdateChapterName}
                onUpdateSceneName={handleUpdateSceneName}
                selectedSceneId={selectedSceneId}
                selectedChapterId={selectedChapterId}
                selectedActId={selectedActId}
                expandedChapters={expandedChapters}
                onToggleChapterExpand={toggleChapterExpand}
                novelId={novelId}
              />

              {/* ✨ NEW: Add act button between acts */}
              {showAddAct && index < novel.acts.length - 1 && (
                <div className="py-1">
                  <AddActInterface
                    onAddAct={onAddAct}
                    insertAfterActId={act.id}
                    isInline
                  />
                </div>
              )}
            </React.Fragment>
          ))}

        {/* ✨ NEW: Add act button at the end */}
        {showAddAct && novel.acts.length > 0 && (
          <div className="py-1">
            <AddActInterface
              onAddAct={onAddAct}
              insertAfterActId={novel.acts[novel.acts.length - 1].id}
              isInline
            />
          </div>
        )}
      </div>
    </div>
  );
};
