// ==========================================
// FILE: src/app/components/manuscript/chapter-tree/editable-act-item.tsx
// ==========================================

import React from "react";
import { Scene, Chapter, Act } from "@/lib/novels";
import { formatWordCount } from "./utils";
import { EditableText } from "@/app/components/ui/editable-text";
import { EditableChapterItem } from "./editable-chapter-item";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";

interface EditableActItemProps {
  act: Act;
  isExpanded: boolean;
  isSelected: boolean;
  selectedChapterId?: string;
  selectedSceneId?: string;
  onToggle: () => void;
  onSelect: (act: Act) => void;
  onChapterSelect: (chapter: Chapter) => void;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onAddScene?: (chapterId: string, afterSceneId?: string) => void;
  onAddChapter?: (actId: string, afterChapterId?: string) => void;
  onDeleteScene?: (sceneId: string) => void;
  onDeleteChapter?: (chapterId: string) => void;
  onDeleteAct?: (actId: string) => void;
  onUpdateActName?: (actId: string, newTitle: string) => Promise<void>;
  onUpdateChapterName?: (chapterId: string, newTitle: string) => Promise<void>;
  onUpdateSceneName?: (sceneId: string, newTitle: string) => Promise<void>;
  expandedChapters: Set<string>;
  onToggleChapter: (chapterId: string) => void;
  novelId: string;
}

export const EditableActItem: React.FC<EditableActItemProps> = ({
  act,
  isExpanded,
  isSelected,
  selectedChapterId,
  selectedSceneId,
  onToggle,
  onSelect,
  onChapterSelect,
  onSceneSelect,
  onAddScene,
  onAddChapter,
  onDeleteScene,
  onDeleteChapter,
  onDeleteAct,
  onUpdateActName,
  onUpdateChapterName,
  onUpdateSceneName,
  expandedChapters,
  onToggleChapter,
  novelId,
}) => {
  const totalWords = act.chapters.reduce(
    (sum, chapter) =>
      sum + chapter.scenes.reduce((s, scene) => s + scene.wordCount, 0),
    0
  );

  const handleUpdateActName = async (newTitle: string) => {
    if (onUpdateActName) {
      await onUpdateActName(act.id, newTitle);
    } else {
      // Fallback to direct API call
      try {
        const response = await fetch(`/api/novels/${novelId}/acts/${act.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });

        if (!response.ok) {
          throw new Error("Failed to update act name");
        }
      } catch (error) {
        console.error("❌ Error updating act name:", error);
        throw error;
      }
    }
  };

  // Action buttons for delete (acts typically aren't added inline)
  const actions = onDeleteAct ? (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDeleteAct(act.id);
      }}
      className="p-1 text-red-400 hover:text-red-300 transition-colors"
      title="Delete act"
    >
      <Trash2 className="w-3 h-3" />
    </button>
  ) : null;

  return (
    <div>
      <div
        className={`flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer group transition-colors ${
          isSelected
            ? "bg-red-900 text-white border border-red-700"
            : "hover:bg-gray-700 text-gray-300"
        }`}
        style={{ paddingLeft: `${1 * 16 + 8}px` }}
        onClick={() => onSelect(act)}
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
            value={act.title}
            onSave={handleUpdateActName}
            placeholder="Act title"
            className="text-white font-semibold"
            maxLength={200}
          />
          <div className="text-xs text-gray-400">
            {act.chapters.length} chapters • {formatWordCount(totalWords)} words
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {actions}
          </div>
        )}
      </div>

      {/* Child chapters */}
      {isExpanded && (
        <div className="mt-1">
          {act.chapters
            .sort((a, b) => a.order - b.order)
            .map((chapter) => (
              <EditableChapterItem
                key={chapter.id}
                chapter={chapter}
                isExpanded={expandedChapters.has(chapter.id)}
                isSelected={selectedChapterId === chapter.id}
                selectedSceneId={selectedSceneId}
                onToggle={() => onToggleChapter(chapter.id)}
                onSelect={onChapterSelect}
                onSceneSelect={onSceneSelect}
                onAddScene={onAddScene}
                onAddChapter={onAddChapter}
                onDeleteScene={onDeleteScene}
                onDeleteChapter={onDeleteChapter}
                onUpdateChapterName={onUpdateChapterName}
                onUpdateSceneName={onUpdateSceneName}
                actId={act.id}
                novelId={novelId}
              />
            ))}

          {act.chapters.length === 0 && onAddChapter && (
            <div
              className="flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer text-gray-400 italic hover:bg-gray-700"
              style={{ paddingLeft: `${2 * 16 + 8}px` }}
              onClick={() => onAddChapter(act.id)}
            >
              <span className="text-sm">+ Add first chapter</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
