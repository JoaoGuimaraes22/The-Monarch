// ==========================================
// FILE: src/app/components/manuscript/chapter-tree/editable-chapter-item.tsx
// ==========================================

import React from "react";
import { Scene, Chapter } from "@/lib/novels";
import { formatWordCount } from "./utils";
import { EditableText } from "@/app/components/ui/editable-text";
import { EditableSceneItem } from "./editable-scene-item";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

interface EditableChapterItemProps {
  chapter: Chapter;
  isExpanded: boolean;
  isSelected: boolean;
  selectedSceneId?: string;
  onToggle: () => void;
  onSelect: (chapter: Chapter) => void;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onAddScene?: (chapterId: string, afterSceneId?: string) => void;
  onAddChapter?: (actId: string, afterChapterId?: string) => void;
  onDeleteScene?: (sceneId: string) => void;
  onDeleteChapter?: (chapterId: string) => void;
  onUpdateChapterName?: (chapterId: string, newTitle: string) => Promise<void>;
  onUpdateSceneName?: (sceneId: string, newTitle: string) => Promise<void>;
  actId: string;
  novelId: string;
}

export const EditableChapterItem: React.FC<EditableChapterItemProps> = ({
  chapter,
  isExpanded,
  isSelected,
  selectedSceneId,
  onToggle,
  onSelect,
  onSceneSelect,
  onAddScene,
  onAddChapter,
  onDeleteScene,
  onDeleteChapter,
  onUpdateChapterName,
  onUpdateSceneName,
  actId,
  novelId,
}) => {
  const totalWords = chapter.scenes.reduce(
    (sum, scene) => sum + scene.wordCount,
    0
  );

  const handleUpdateChapterName = async (newTitle: string) => {
    if (onUpdateChapterName) {
      await onUpdateChapterName(chapter.id, newTitle);
    } else {
      // Fallback to direct API call
      try {
        const response = await fetch(
          `/api/novels/${novelId}/chapters/${chapter.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update chapter name");
        }
      } catch (error) {
        console.error("❌ Error updating chapter name:", error);
        throw error;
      }
    }
  };

  // Action buttons for add/delete
  const actions = (
    <div className="flex items-center space-x-1">
      {onAddChapter && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddChapter(actId, chapter.id);
          }}
          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
          title="Add chapter after this one"
        >
          <Plus className="w-3 h-3" />
        </button>
      )}
      {onDeleteChapter && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteChapter(chapter.id);
          }}
          className="p-1 text-red-400 hover:text-red-300 transition-colors"
          title="Delete chapter"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <div>
        <div
          className={`flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer group transition-colors ${
            isSelected
              ? "bg-red-900 text-white border border-red-700"
              : "hover:bg-gray-700 text-gray-300"
          }`}
          style={{ paddingLeft: `${2 * 16 + 8}px` }}
          onClick={() => onSelect(chapter)}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-0.5 hover:bg-gray-600 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>

          {/* Editable Title */}
          <div className="flex-1 min-w-0">
            <EditableText
              value={chapter.title}
              onSave={handleUpdateChapterName}
              placeholder="Chapter title"
              className="text-white font-medium"
              maxLength={100}
            />
            <div className="text-xs text-gray-400">
              {chapter.scenes.length} scenes • {formatWordCount(totalWords)}{" "}
              words
            </div>
          </div>

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {actions}
          </div>
        </div>

        {/* Child scenes */}
        {isExpanded && (
          <div className="mt-1">
            {chapter.scenes
              .sort((a, b) => a.order - b.order)
              .map((scene) => (
                <EditableSceneItem
                  key={scene.id}
                  scene={scene}
                  isSelected={selectedSceneId === scene.id}
                  onSelect={onSceneSelect}
                  onAddScene={onAddScene}
                  onDeleteScene={onDeleteScene}
                  onUpdateSceneName={onUpdateSceneName}
                  chapterId={chapter.id}
                  novelId={novelId}
                />
              ))}

            {chapter.scenes.length === 0 && onAddScene && (
              <div
                className="flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer text-gray-400 italic hover:bg-gray-700"
                style={{ paddingLeft: `${3 * 16 + 8}px` }}
                onClick={() => onAddScene(chapter.id)}
              >
                <span className="text-sm">+ Add first scene</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
