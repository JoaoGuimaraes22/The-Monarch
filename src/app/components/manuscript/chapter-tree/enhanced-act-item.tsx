// ==========================================
// FILE: src/app/components/manuscript/chapter-tree/enhanced-act-item.tsx
// ==========================================

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Plus,
  Trash2,
} from "lucide-react";
import { Act, Chapter, Scene } from "@/lib/novels";
import { EnhancedChapterItem } from "./enhanced-chapter-item";
import { formatWordCount } from "./utils";
import { EditableText } from "@/app/components/ui/editable-text";

interface EnhancedActItemProps {
  act: Act;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onActSelect: (act: Act) => void;
  onChapterSelect: (chapter: Chapter) => void;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onActDelete: (actId: string) => void;
  onChapterDelete: (chapterId: string) => void;
  onSceneDelete: (sceneId: string) => void;
  onAddChapter: (actId: string) => void;
  onAddScene: (chapterId: string) => void;
  // ✨ NEW: Name editing handlers
  onUpdateActName: (actId: string, newTitle: string) => Promise<void>;
  onUpdateChapterName: (chapterId: string, newTitle: string) => Promise<void>;
  onUpdateSceneName: (sceneId: string, newTitle: string) => Promise<void>;
  selectedSceneId?: string;
  selectedChapterId?: string;
  selectedActId?: string;
  expandedChapters: Set<string>;
  onToggleChapterExpand: (chapterId: string) => void;
  novelId: string;
}

export const EnhancedActItem: React.FC<EnhancedActItemProps> = ({
  act,
  isExpanded,
  onToggleExpand,
  onActSelect,
  onChapterSelect,
  onSceneSelect,
  onActDelete,
  onChapterDelete,
  onSceneDelete,
  onAddChapter,
  onAddScene,
  onUpdateActName,
  onUpdateChapterName,
  onUpdateSceneName,
  selectedSceneId,
  selectedChapterId,
  selectedActId,
  expandedChapters,
  onToggleChapterExpand,
  novelId,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingChapter, setIsAddingChapter] = useState(false);

  const isSelected = selectedActId === act.id;
  const totalWordCount = act.chapters.reduce(
    (sum, chapter) =>
      sum +
      chapter.scenes.reduce((sceneSum, scene) => sceneSum + scene.wordCount, 0),
    0
  );
  const totalScenes = act.chapters.reduce(
    (sum, chapter) => sum + chapter.scenes.length,
    0
  );

  const handleAddChapter = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingChapter(true);

    try {
      await onAddChapter(act.id);
    } catch (error) {
      console.error("Failed to add chapter:", error);
    } finally {
      setIsAddingChapter(false);
    }
  };

  const handleActDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(`Delete "${act.title}" and all its chapters and scenes?`)
    ) {
      onActDelete(act.id);
    }
  };

  // ✨ NEW: Handle act name update
  const handleUpdateActName = async (newTitle: string) => {
    await onUpdateActName(act.id, newTitle);
  };

  return (
    <div className="space-y-1">
      {/* Act Header */}
      <div
        className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors group ${
          isSelected
            ? "bg-red-600 text-white"
            : "hover:bg-gray-700 text-gray-300"
        }`}
        onClick={() => onActSelect(act)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="p-1 hover:bg-gray-600 rounded"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Act Icon */}
        <BookOpen className="w-4 h-4 text-red-400 flex-shrink-0" />

        {/* ✨ ENHANCED: Editable Act Title */}
        <div className="flex-1 min-w-0">
          <EditableText
            value={act.title}
            onSave={handleUpdateActName}
            placeholder="Act title"
            className="text-sm font-medium"
            maxLength={200}
          />
          <div className="text-xs text-gray-400">
            {act.chapters.length} chapter{act.chapters.length !== 1 ? "s" : ""}{" "}
            • {totalScenes} scenes • {formatWordCount(totalWordCount)}
          </div>
        </div>

        {/* Action Buttons */}
        {(isHovered || isSelected) && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Add Chapter Button */}
            <button
              onClick={handleAddChapter}
              disabled={isAddingChapter}
              className={`p-1 rounded text-blue-400 hover:bg-blue-400 hover:text-white transition-colors ${
                isAddingChapter ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Add Chapter"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Delete Act Button */}
            <button
              onClick={handleActDelete}
              className="p-1 rounded text-red-400 hover:bg-red-400 hover:text-white transition-colors"
              title="Delete Act"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Chapters List */}
      {isExpanded && (
        <div className="ml-6 space-y-1">
          {act.chapters
            .sort((a, b) => a.order - b.order)
            .map((chapter) => (
              <EnhancedChapterItem
                key={chapter.id}
                chapter={chapter}
                isExpanded={expandedChapters.has(chapter.id)}
                onToggleExpand={() => onToggleChapterExpand(chapter.id)}
                onChapterSelect={onChapterSelect}
                onSceneSelect={onSceneSelect}
                onChapterDelete={onChapterDelete}
                onSceneDelete={onSceneDelete}
                onAddScene={onAddScene}
                onUpdateChapterName={onUpdateChapterName}
                onUpdateSceneName={onUpdateSceneName}
                selectedSceneId={selectedSceneId}
                selectedChapterId={selectedChapterId}
                actId={act.id}
                novelId={novelId}
              />
            ))}

          {/* Add Chapter at End Button */}
          {act.chapters.length === 0 && (
            <div className="ml-4 py-2">
              <button
                onClick={handleAddChapter}
                disabled={isAddingChapter}
                className={`flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors ${
                  isAddingChapter ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>
                  {isAddingChapter ? "Adding chapter..." : "Add first chapter"}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
