// src/hooks/manuscript/useManuscriptState.ts
// ✨ PHASE 2: Extract core state management into dedicated hook

import { useState, useCallback } from "react";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/view-mode-selector";

export interface ManuscriptState {
  novel: NovelWithStructure | null;
  loading: boolean;
  selectedScene: Scene | null;
  selectedChapter: Chapter | null;
  selectedAct: Act | null;
  viewMode: ViewMode;
  contentDisplayMode: "document" | "grid";
}

export interface ManuscriptStateActions {
  setNovel: (novel: NovelWithStructure | null) => void;
  setLoading: (loading: boolean) => void;
  setSelectedScene: (scene: Scene | null) => void;
  setSelectedChapter: (chapter: Chapter | null) => void;
  setSelectedAct: (act: Act | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setContentDisplayMode: (mode: "document" | "grid") => void;

  // Computed setters for convenience
  updateNovel: (
    updater: (prev: NovelWithStructure | null) => NovelWithStructure | null
  ) => void;
}

export interface ManuscriptStateReturn {
  state: ManuscriptState;
  actions: ManuscriptStateActions;
}

export function useManuscriptState(
  initialState?: Partial<ManuscriptState>
): ManuscriptStateReturn {
  // ===== CORE STATE =====
  const [novel, setNovel] = useState<NovelWithStructure | null>(
    initialState?.novel || null
  );
  const [loading, setLoading] = useState(initialState?.loading ?? true);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(
    initialState?.selectedScene || null
  );
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(
    initialState?.selectedChapter || null
  );
  const [selectedAct, setSelectedAct] = useState<Act | null>(
    initialState?.selectedAct || null
  );
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialState?.viewMode || "scene"
  );
  const [contentDisplayMode, setContentDisplayMode] = useState<
    "document" | "grid"
  >(initialState?.contentDisplayMode || "document");

  // ===== COMPUTED SETTERS =====
  const updateNovel = useCallback(
    (
      updater: (prev: NovelWithStructure | null) => NovelWithStructure | null
    ) => {
      setNovel(updater);
    },
    []
  );

  // ===== STATE OBJECT =====
  const state: ManuscriptState = {
    novel,
    loading,
    selectedScene,
    selectedChapter,
    selectedAct,
    viewMode,
    contentDisplayMode,
  };

  // ===== ACTIONS OBJECT =====
  const actions: ManuscriptStateActions = {
    setNovel,
    setLoading,
    setSelectedScene,
    setSelectedChapter,
    setSelectedAct,
    setViewMode,
    setContentDisplayMode,
    updateNovel,
  };

  return {
    state,
    actions,
  };
}
