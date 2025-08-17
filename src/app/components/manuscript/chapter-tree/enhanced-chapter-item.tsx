// ==========================================
// FILE: src/app/components/manuscript/chapter-tree/enhanced-chapter-item.tsx
// ==========================================

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { Chapter, Scene } from "@/lib/novels";
import { EnhancedSceneItem } from "./enhanced-scene-item";
import { formatWordCount } from "./utils";
import { EditableText } from "@/app/components/ui/editable-text";

interface EnhancedChapterItemProps {
  chapter: Chapter;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChapterSelect: (chapter: Chapter) => void;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onChapterDelete: (chapterId: string) => void;
  onSceneDelete: (sceneId: string) => void;
  onAddScene: (chapterId: string) => void;
  // ✨ NEW: Name editing handlers
  onUpdateChapterName: (chapterId: string, newTitle: string) => Promise<void>;
  onUpdateSceneName: (sceneId: string, newTitle: string) => Promise<void>;
  selectedSceneId?: string;
  selectedChapterId?: string;
  actId: string;
  novelId: string;
}

export const EnhancedChapterItem: React.FC<EnhancedChapterItemProps> = ({
  chapter,
  isExpanded,
  onToggleExpand,
  onChapterSelect,
  onSceneSelect,
  onChapterDelete,
  onSceneDelete,
  onAddScene,
  onUpdateChapterName,
  onUpdateSceneName,
  selectedSceneId,
  selectedChapterId,
  actId,
  novelId,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingScene, setIsAddingScene] = useState(false);

  const isSelected = selectedChapterId === chapter.id;
  const totalWordCount = chapter.scenes.reduce(
    (sum, scene) => sum + scene.wordCount,
    0
  );

  const handleAddScene = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingScene(true);

    try {
      await onAddScene(chapter.id);
    } catch (error) {
      console.error("Failed to add scene:", error);
    } finally {
      setIsAddingScene(false);
    }
  };

  const handleChapterDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${chapter.title}" and all its scenes?`)) {
      onChapterDelete(chapter.id);
    }
  };

  // ✨ NEW: Handle chapter name update
  const handleUpdateChapterName = async (newTitle: string) => {
    await onUpdateChapterName(chapter.id, newTitle);
  };

  return (
    <div className="space-y-1">
      {/* Chapter Header */}
      <div
        className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors group ${
          isSelected
            ? "bg-red-600 text-white"
            : "hover:bg-gray-700 text-gray-300"
        }`}
        onClick={() => onChapterSelect(chapter)}
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

        {/* Chapter Icon */}
        <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />

        {/* ✨ ENHANCED: Editable Chapter Title */}
        <div className="flex-1 min-w-0">
          <EditableText
            value={chapter.title}
            onSave={handleUpdateChapterName}
            placeholder="Chapter title"
            className="text-sm font-medium"
            maxLength={100}
          />
          <div className="text-xs text-gray-400">
            {chapter.scenes.length} scene
            {chapter.scenes.length !== 1 ? "s" : ""} •{" "}
            {formatWordCount(totalWordCount)}
          </div>
        </div>

        {/* Action Buttons */}
        {(isHovered || isSelected) && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Add Scene Button */}
            <button
              onClick={handleAddScene}
              disabled={isAddingScene}
              className={`p-1 rounded text-green-400 hover:bg-green-400 hover:text-white transition-colors ${
                isAddingScene ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Add Scene"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Delete Chapter Button */}
            <button
              onClick={handleChapterDelete}
              className="p-1 rounded text-red-400 hover:bg-red-400 hover:text-white transition-colors"
              title="Delete Chapter"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Scenes List */}
      {isExpanded && (
        <div className="ml-6 space-y-1">
          {chapter.scenes
            .sort((a, b) => a.order - b.order)
            .map((scene) => (
              <EnhancedSceneItem
                key={scene.id}
                scene={scene}
                onSelect={() => onSceneSelect(scene.id, scene)}
                onDelete={() => onSceneDelete(scene.id)}
                onUpdateSceneName={onUpdateSceneName}
                isSelected={selectedSceneId === scene.id}
                chapterId={chapter.id}
                novelId={novelId}
              />
            ))}

          {/* Add Scene at End Button */}
          {chapter.scenes.length === 0 && (
            <div className="ml-4 py-2">
              <button
                onClick={handleAddScene}
                disabled={isAddingScene}
                className={`flex items-center space-x-2 text-sm text-green-400 hover:text-green-300 transition-colors ${
                  isAddingScene ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>
                  {isAddingScene ? "Adding scene..." : "Add first scene"}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
