// src/app/components/manuscript/chapter-tree/chapter-tree.tsx
import React, { useState } from "react";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { ActItem } from "./act-item";

interface ChapterTreeProps {
  novel: NovelWithStructure;
  selectedSceneId?: string;
  selectedChapterId?: string;
  selectedActId?: string;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onChapterSelect?: (chapter: Chapter) => void;
  onActSelect?: (act: Act) => void;
  onRefresh: () => void;
  onAddScene: (chapterId: string) => Promise<void>; // ✨ Add handlers
  onAddChapter: (actId: string) => Promise<void>; // ✨ Add handlers
  onDeleteScene: (sceneId: string) => Promise<void>; // ✨ NEW: Delete handlers
  onDeleteChapter: (chapterId: string) => Promise<void>; // ✨ NEW: Delete handlers
  onDeleteAct: (actId: string) => Promise<void>; // ✨ NEW: Delete handlers
  novelId?: string;
}

export const ChapterTree: React.FC<ChapterTreeProps> = ({
  novel,
  selectedSceneId,
  selectedChapterId,
  selectedActId,
  onSceneSelect,
  onChapterSelect,
  onActSelect,
  onRefresh,
  onAddScene, // ✨ Add handlers
  onAddChapter, // ✨ Add handlers
  onDeleteScene, // ✨ NEW: Delete handlers
  onDeleteChapter, // ✨ NEW: Delete handlers
  onDeleteAct, // ✨ NEW: Delete handlers
  novelId,
}) => {
  const [expandedActs, setExpandedActs] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );

  // ✨ SIMPLE: Just call the parent handlers
  const handleAddScene = async (chapterId: string) => {
    await onAddScene(chapterId);
  };

  const handleAddChapter = async (actId: string) => {
    await onAddChapter(actId);
  };

  // ✨ SIMPLE: Delete handlers - no more refresh!
  const handleActDelete = async (actId: string) => {
    await onDeleteAct(actId);
  };

  const handleChapterDelete = async (chapterId: string) => {
    await onDeleteChapter(chapterId);
  };

  const handleSceneDelete = async (sceneId: string) => {
    await onDeleteScene(sceneId);
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

  if (!novel.acts || novel.acts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No manuscript structure found.</p>
        <p className="text-sm mt-2">Import a document to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {novel.acts
        .sort((a, b) => a.order - b.order)
        .map((act) => (
          <ActItem
            key={act.id}
            act={act}
            isExpanded={expandedActs.has(act.id)}
            onToggleExpand={() => toggleActExpand(act.id)}
            onActSelect={onActSelect || (() => {})}
            onChapterSelect={onChapterSelect || (() => {})}
            onSceneSelect={onSceneSelect}
            onActDelete={handleActDelete}
            onChapterDelete={handleChapterDelete}
            onSceneDelete={handleSceneDelete}
            onAddChapter={handleAddChapter} // ✨ SIMPLE: Pass through
            onAddScene={handleAddScene} // ✨ SIMPLE: Pass through
            selectedSceneId={selectedSceneId}
            selectedChapterId={selectedChapterId}
            selectedActId={selectedActId}
            expandedChapters={expandedChapters}
            onToggleChapterExpand={toggleChapterExpand}
          />
        ))}
    </div>
  );
};
