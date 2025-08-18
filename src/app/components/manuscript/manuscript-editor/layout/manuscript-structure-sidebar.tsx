// src/app/components/manuscript/manuscript-editor/layout/manuscript-structure-sidebar.tsx
// ✨ UPDATED: Added auto-save controls to TOOLS section

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Save,
  RotateCcw,
  Power,
  PowerOff,
  Clock,
} from "lucide-react";
import { CollapsibleSidebar } from "@/app/components/ui";
import { DeleteAllManuscriptButton } from "./delete-all-button";
import { DraggableManuscriptTree } from "../../chapter-tree/draggable-manuscript-tree";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";

export type ViewDensity = "clean" | "detailed";

interface ManuscriptStructureSidebarProps {
  novel: NovelWithStructure;
  selectedScene: Scene | null;
  selectedChapterId?: string;
  selectedActId?: string;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onChapterSelect?: (chapter: Chapter) => void;
  onActSelect?: (act: Act) => void;
  onRefresh: () => void;
  onAddScene: (chapterId: string, afterSceneId?: string) => Promise<void>;
  onAddChapter: (actId: string, afterChapterId?: string) => Promise<void>;
  onAddAct?: (title?: string, insertAfterActId?: string) => Promise<void>;
  onDeleteScene: (sceneId: string) => Promise<void>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
  onDeleteAct: (actId: string) => Promise<void>;
  onUpdateActName?: (actId: string, newTitle: string) => Promise<void>;
  onUpdateChapterName?: (chapterId: string, newTitle: string) => Promise<void>;
  onUpdateSceneName?: (sceneId: string, newTitle: string) => Promise<void>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  left: string;
  width: string;
  // ✨ NEW: Auto-save props
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  handleManualSave: () => Promise<void>;
  pendingChanges: boolean;
  isSavingContent: boolean;
  lastSaved: Date | null;
}

// ✨ NEW: Auto-Save Tools Component
const AutoSaveTools: React.FC<{
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  handleManualSave: () => Promise<void>;
  pendingChanges: boolean;
  isSavingContent: boolean;
  lastSaved: Date | null;
}> = ({
  autoSaveEnabled,
  setAutoSaveEnabled,
  handleManualSave,
  pendingChanges,
  isSavingContent,
  lastSaved,
}) => {
  const [isManualSaving, setIsManualSaving] = useState(false);

  const handleManualSaveClick = async () => {
    setIsManualSaving(true);
    try {
      await handleManualSave();
    } finally {
      setIsManualSaving(false);
    }
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return "Never";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes === 1) return "1 minute ago";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Auto-Save Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {autoSaveEnabled ? (
            <Power className="w-4 h-4 text-green-400" />
          ) : (
            <PowerOff className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm font-medium text-white">Auto-Save</span>
        </div>
        <button
          onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoSaveEnabled ? "bg-green-600" : "bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoSaveEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Manual Save Button */}
      <button
        onClick={handleManualSaveClick}
        disabled={isManualSaving || isSavingContent || !pendingChanges}
        className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          pendingChanges && !isSavingContent && !isManualSaving
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-700 text-gray-400 cursor-not-allowed"
        }`}
      >
        <Save className="w-4 h-4" />
        <span>
          {isManualSaving || isSavingContent
            ? "Saving..."
            : pendingChanges
            ? "Save Now"
            : "No Changes"}
        </span>
      </button>

      {/* Save Status */}
      <div className="flex items-center space-x-2 text-xs text-gray-400">
        <Clock className="w-3 h-3" />
        <span>Last saved: {formatLastSaved(lastSaved)}</span>
      </div>

      {/* Pending Changes Indicator */}
      {pendingChanges && (
        <div className="flex items-center space-x-2 text-xs text-amber-400">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span>Unsaved changes</span>
        </div>
      )}
    </div>
  );
};

export const ManuscriptStructureSidebar: React.FC<
  ManuscriptStructureSidebarProps
> = ({
  novel,
  selectedScene,
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
  isCollapsed,
  onToggleCollapse,
  left,
  width,
  // ✨ NEW: Auto-save props
  autoSaveEnabled,
  setAutoSaveEnabled,
  handleManualSave,
  pendingChanges,
  isSavingContent,
  lastSaved,
}) => {
  // Smart chapter expansion state management
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // View density state
  const [viewDensity, setViewDensity] = useState<ViewDensity>("detailed");

  // Initialize with smart defaults
  useEffect(() => {
    if (!novel.acts || novel.acts.length === 0) return;

    const allChapterIds = novel.acts.flatMap((act) =>
      act.chapters.map((chapter) => chapter.id)
    );

    if (allChapterIds.length === 0) return;

    // Smart initialization strategy
    if (isFirstLoad) {
      if (selectedScene) {
        // Find and expand the chapter containing the selected scene
        for (const act of novel.acts) {
          for (const chapter of act.chapters) {
            if (chapter.scenes.some((scene) => scene.id === selectedScene.id)) {
              setExpandedChapters(new Set([chapter.id]));
              setIsFirstLoad(false);
              return;
            }
          }
        }
      } else if (selectedChapterId) {
        setExpandedChapters(new Set([selectedChapterId]));
      } else {
        // Default to expanding the first chapter
        setExpandedChapters(new Set([allChapterIds[0]]));
      }
      setIsFirstLoad(false);
    }
  }, [novel.acts, selectedScene, selectedChapterId, isFirstLoad]);

  // Collapsed content
  const collapsedContent = (
    <button
      onClick={onToggleCollapse}
      className="p-2 text-gray-400 hover:text-white transition-colors"
      title="Expand Structure"
    >
      <BookOpen className="w-5 h-5" />
    </button>
  );

  return (
    <CollapsibleSidebar
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      title="Manuscript Structure"
      subtitle="Navigate your story • Drag to reorder"
      icon={BookOpen}
      position="left"
      width={width}
      left={left}
      collapsedContent={collapsedContent}
      className="z-30"
    >
      <div className="h-full flex flex-col">
        {/* ✨ UPDATED: TOOLS Section with Auto-Save Controls */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-300">TOOLS</h3>
          </div>

          <div className="space-y-4">
            {/* Auto-Save Tools */}
            <AutoSaveTools
              autoSaveEnabled={autoSaveEnabled}
              setAutoSaveEnabled={setAutoSaveEnabled}
              handleManualSave={handleManualSave}
              pendingChanges={pendingChanges}
              isSavingContent={isSavingContent}
              lastSaved={lastSaved}
            />

            {/* Existing Tools */}
            <div className="flex space-x-2">
              <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                <BookOpen className="w-4 h-4" />
                <span>Details</span>
              </button>

              <DeleteAllManuscriptButton
                novelId={novel.id}
                onSuccess={onRefresh}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Chapter Tree */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-400">
                {expandedChapters.size} of{" "}
                {novel.acts?.flatMap((act) => act.chapters).length || 0}{" "}
                chapters expanded
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const allChapterIds =
                      novel.acts?.flatMap((act) =>
                        act.chapters.map((c) => c.id)
                      ) || [];
                    setExpandedChapters(new Set(allChapterIds));
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Expand All
                </button>
                <span className="text-xs text-gray-600">•</span>
                <button
                  onClick={() => setExpandedChapters(new Set())}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <DraggableManuscriptTree
              novel={novel}
              selectedSceneId={selectedScene?.id}
              selectedChapterId={selectedChapterId}
              selectedActId={selectedActId}
              expandedChapters={expandedChapters}
              onChapterToggle={(chapterId) => {
                const newExpanded = new Set(expandedChapters);
                if (newExpanded.has(chapterId)) {
                  newExpanded.delete(chapterId);
                } else {
                  newExpanded.add(chapterId);
                }
                setExpandedChapters(newExpanded);
              }}
              onSceneSelect={onSceneSelect}
              onChapterSelect={onChapterSelect || (() => {})}
              onActSelect={onActSelect || (() => {})}
              onSceneDelete={(sceneId: string, title: string) => {
                if (window.confirm(`Delete "${title}"?`)) {
                  onDeleteScene(sceneId);
                }
              }}
              onChapterDelete={onDeleteChapter}
              onActDelete={onDeleteAct}
              onAddScene={onAddScene}
              onAddChapter={onAddChapter}
              onUpdateActName={onUpdateActName || (() => Promise.resolve())}
              onUpdateChapterName={
                onUpdateChapterName || (() => Promise.resolve())
              }
              onUpdateSceneName={onUpdateSceneName || (() => Promise.resolve())}
              onRefresh={onRefresh}
              viewDensity={viewDensity}
            />
          </div>
        </div>
      </div>
    </CollapsibleSidebar>
  );
};
